import { randomBytes } from "node:crypto"
import { chown, open, rm, writeFile } from "node:fs/promises"
import type { FileHandle } from "node:fs/promises"

const vaultAddr = process.env.VAULT_ADDR ?? "http://127.0.0.1:8200"
const vaultApiPrefix = `${vaultAddr}/v1`
const keysFilePath = process.env.VAULT_KEYS_FILE ?? "/data/vault-keys.json"

const secretShares = 5
const secretThreshold = 3
const kvMountPath = "secret"
// Each consumer's Vault Agent logs in with its own AppRole, whose policy grants only what that consumer needs.
const kvReadPolicy = (path: string) => `path "${kvMountPath}/data/${path}" {
  capabilities = ["read"]
}
`
const consumerPolicies: Record<string, string> = {
    "backend": kvReadPolicy("backend/*"),
    "postgres": kvReadPolicy("postgres/*"),
    "grafana": kvReadPolicy("grafana/*"),
    // Logs in to Postgres with its own read-only role: see postgres/exporter-role.sh.
    "postgres-exporter": kvReadPolicy("postgres-exporter/*"),
    // Gets its TLS certificate from the PKI engine.
    "frontend": `path "pki/issue/frontend" {
  capabilities = ["update"]
}
`,
}
const backendSecretPath = `/${kvMountPath}/data/backend/config`
const postgresSecretPath = `/${kvMountPath}/data/postgres/config`
const postgresExporterSecretPath = `/${kvMountPath}/data/postgres-exporter/config`
const grafanaSecretPath = `/${kvMountPath}/data/grafana/config`
// Checked before anything is written, as they end up in the seeded DATABASE_URL.
const dbUser = process.env.DB_USER
const dbName = process.env.DB_NAME
if (!dbUser || !dbName) { throw new Error("DB_USER and DB_NAME must be set") }
// The user the Vault Agent containers run as in the hashicorp/vault image.
const agentUid = 100
const agentGid = 1000

const readinessAttempts = 30
const readinessDelayMs = 1000

type sealStatusResponseType = {
    "type": string,
    "initialized": boolean,
    "sealed": boolean
    "t":number,
    "n":number,
    "progress":number,
    "nonce":string,
    "version":string,
    "build_date":string,
    "migration":boolean,
    "cluster_name":string,
    "cluster_id":string,
    "recovery_seal":false,
    "storage_type":string
}

type initResponseType = {
    "keys": string[],
    "keys_base64": string[],
    "root_token": string
}

type mountsResponseType = {
    "data": Record<string, { "type": string, "options": { "version"?: string } | null }>
}

type authMountsResponseType = {
    "data": Record<string, unknown>
}

type roleIdResponseType = {
    "data": { "role_id": string }
}

type secretIdResponseType = {
    "data": { "secret_id": string }
}

async function vaultRequest<T>(path: string, method = "GET", body?: unknown, token?: string): Promise<T> {
    const response = await fetch(`${vaultApiPrefix}${path}`, {
        method,
        headers: {
            ...(body === undefined ? {} : { "Content-Type": "application/json" }),
            ...(token === undefined ? {} : { "X-Vault-Token": token }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    })
    if (!response.ok) {
        throw new Error(`Vault ${method} ${path} failed (${response.status}): ${await response.text()}`)
    }
    return (response.status === 204 ? undefined : await response.json()) as T
}

async function waitFor(description: string, isReady: () => Promise<boolean>) {
    for (let attempt = 0; attempt < readinessAttempts; attempt++) {
        if (await isReady().catch(() => false)) { return }
        await new Promise((resolve) => setTimeout(resolve, readinessDelayMs))
    }
    throw new Error(`Timed out waiting for ${description} at ${vaultAddr}`)
}

// The root token and unseal keys are only ever returned once, by this call.
// The file is created first so that an unwritable path aborts before they can be lost.
async function initVault(): Promise<initResponseType> {
    let keysFile: FileHandle
    try {
        keysFile = await open(keysFilePath, "wx", 0o600)
    } catch (error) {
        throw new Error(`Refusing to initialize Vault: cannot create ${keysFilePath}`, { cause: error })
    }

    try {
        let init: initResponseType
        try {
            init = await vaultRequest<initResponseType>("/sys/init", "POST", {
                secret_shares: secretShares,
                secret_threshold: secretThreshold,
            })
        } catch (error) {
            await rm(keysFilePath)
            throw error
        }
        await keysFile.writeFile(JSON.stringify({
            unseal_threshold: secretThreshold,
            unseal_keys: init.keys,
            root_token: init.root_token,
        }, null, 2) + "\n")
        await keysFile.sync()
        console.log(`Vault initialized. Keys written to ${keysFilePath}: read them, store them safely, then delete the file.`)
        return init
    } finally {
        await keysFile.close()
    }
}

async function unsealVault(keys: string[]) {
    for (const key of keys.slice(0, secretThreshold)) {
        await vaultRequest<sealStatusResponseType>("/sys/unseal", "POST", { key })
    }
    const status = await vaultRequest<sealStatusResponseType>("/sys/seal-status")
    if (status.sealed) { throw new Error("Vault is still sealed after submitting the unseal keys") }
    console.log("Vault unsealed.")
}

async function configureVault(token: string) {
    const mounts = await vaultRequest<mountsResponseType>("/sys/mounts", "GET", undefined, token)
    const kvMount = mounts.data[`${kvMountPath}/`]
    if (kvMount === undefined) {
        await vaultRequest(`/sys/mounts/${kvMountPath}`, "POST", { type: "kv", options: { version: "2" } }, token)
        console.log(`Enabled KV v2 at ${kvMountPath}/.`)
    } else if (kvMount.type !== "kv" || kvMount.options?.version !== "2") {
        throw new Error(`${kvMountPath}/ is already mounted, but is not a KV v2 engine`)
    }

    const authMounts = await vaultRequest<authMountsResponseType>("/sys/auth", "GET", undefined, token)
    if (authMounts.data["approle/"] === undefined) {
        await vaultRequest("/sys/auth/approle", "POST", { type: "approle" }, token)
        console.log("Enabled AppRole auth.")
    }

    for (const [consumer, policy] of Object.entries(consumerPolicies)) {
        await configureConsumer(consumer, policy, token)
    }

    // Internal CA: issues the TLS certificate nginx serves.
    if (mounts.data["pki/"] === undefined) {
        await vaultRequest("/sys/mounts/pki", "POST", { type: "pki", config: { max_lease_ttl: "87600h" } }, token)
        await vaultRequest("/pki/root/generate/internal", "POST", { common_name: "transcendence CA", ttl: "87600h" }, token)
        console.log("Enabled PKI at pki/ and generated the root CA.")
    }

    await vaultRequest("/pki/roles/frontend", "POST", {
        allowed_domains: ["localhost"],
        allow_bare_domains: true,
        allow_ip_sans: true,
        max_ttl: "720h",
    }, token)
}

async function configureConsumer(consumer: string, policy: string, token: string) {
    await vaultRequest(`/sys/policies/acl/${consumer}`, "PUT", { policy }, token)

    const rolePath = `/auth/approle/role/${consumer}`
    await vaultRequest(rolePath, "POST", {
        token_policies: [consumer],
        token_ttl: "1h",
        token_max_ttl: "4h",
        secret_id_ttl: "0",
    }, token)
    const { data: { role_id } } = await vaultRequest<roleIdResponseType>(`${rolePath}/role-id`, "GET", undefined, token)
    const { data: { secret_id } } = await vaultRequest<secretIdResponseType>(`${rolePath}/secret-id`, "POST", undefined, token)

    await writeAgentCredential(`/${consumer}-creds/role_id`, role_id)
    await writeAgentCredential(`/${consumer}-creds/secret_id`, secret_id)
    console.log(`Configured policy, AppRole and Agent credentials for ${consumer}.`)
}

async function writeAgentCredential(path: string, value: string) {
    await writeFile(path, value, { mode: 0o400 })
    await chown(path, agentUid, agentGid)
}

async function secretExists(path: string, token: string): Promise<boolean> {
    const existing = await fetch(`${vaultApiPrefix}${path}`, { headers: { "X-Vault-Token": token } })
    if (existing.status === 200) { return true }
    if (existing.status !== 404) { throw new Error(`Vault secret lookup failed (${existing.status})`) }
    return false
}

// Each group of secrets is seeded on its own, so that a secret added later still gets seeded on an existing Vault.
async function seedSecrets(token: string) {
    await seedDatabaseSecrets(token)
    await seedGrafanaSecrets(token)
    await seedPostgresExporterSecrets(token)
}

// The backend's secret is written last and marks seeding as done: after a crash between the two
// writes, the next run regenerates both. Postgres can't have used the password yet, as it waits for this script to succeed.
async function seedDatabaseSecrets(token: string) {
    if (await secretExists(backendSecretPath, token)) { return }

    const dbPassword = randomBytes(32).toString("hex")
    await vaultRequest(postgresSecretPath, "POST", { data: { DB_PASSWORD: dbPassword } }, token)
    await vaultRequest(backendSecretPath, "POST", {
        data: {
            DATABASE_URL: `postgresql://${dbUser}:${dbPassword}@postgres:5432/${dbName}`,
            JWT_SECRET: randomBytes(32).toString("hex"),
        },
    }, token)

    
    console.log("Seeded backend secrets.")
}

async function seedGrafanaSecrets(token: string) {
    if (await secretExists(grafanaSecretPath, token)) { return }

    await vaultRequest(grafanaSecretPath, "POST", { data: { GRAFANA_PASSWORD: randomBytes(24).toString("hex") } }, token)
    console.log("Seeded Grafana secrets.")
}

// Postgres sets this password on the exporter's role when the database is first created.
async function seedPostgresExporterSecrets(token: string) {
    if (await secretExists(postgresExporterSecretPath, token)) { return }

    await vaultRequest(postgresExporterSecretPath, "POST", { data: { EXPORTER_PASSWORD: randomBytes(32).toString("hex") } }, token)
    console.log("Seeded Postgres exporter secrets.")
}

await waitFor("Vault to respond", async () => (await fetch(`${vaultApiPrefix}/sys/seal-status`)).ok)
const status = await vaultRequest<sealStatusResponseType>("/sys/seal-status")

let token = process.env.VAULT_TOKEN
if (!status.initialized) {
    const init = await initVault()
    await unsealVault(init.keys)
    token = init.root_token
} else if (status.sealed) {
    throw new Error("Vault is already initialized but sealed: unseal it with `vault operator unseal`, then run this script again")
} else if (token === undefined) {
    console.log("Vault is already initialized and unsealed: skipping configuration, set VAULT_TOKEN to reapply it.")
    process.exit(0)
}

// /sys/health answers 200 only once this node is initialized, unsealed and active.
await waitFor("Vault to become active", async () => (await fetch(`${vaultApiPrefix}/sys/health`)).status === 200)
await configureVault(token)
await seedSecrets(token)
console.log("Vault configured.")
