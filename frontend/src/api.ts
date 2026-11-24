// One place to call the backend. Every call resolves (never throws) to either:
//   { ok: true, data }                 the parsed JSON body (null if the body wasn't JSON)
//   { ok: false, status, code, error } a message ready to display, and the backend's stable `code` if any
// A response that isn't JSON (the proxy's HTML error page when the backend is down) or a network
// failure still becomes an ApiError, so callers don't need their own try/catch.

export type ApiSuccess<T> = { ok: true; data: T }
export type ApiError = { ok: false; status: number; code: string | null; error: string }

type ApiOptions = {
    method?: string
    body?: unknown // sent as JSON; the method defaults to POST when a body is given
}

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<ApiSuccess<T> | ApiError> {
    const hasBody = options.body !== undefined
    let response: Response
    try {
        response = await fetch(path, {
            method: options.method ?? (hasBody ? "POST" : "GET"),
            headers: hasBody ? { "Content-Type": "application/json" } : undefined,
            body: hasBody ? JSON.stringify(options.body) : undefined,
        })
    }
    catch (err) {
        console.error(err)
        return { ok: false, status: 0, code: null, error: "Could not reach the server" }
    }

    let body: unknown = null
    try {
        body = await response.json()
    }
    catch {
        // Not JSON: an empty body, or an error page from the proxy.
    }

    if (response.ok)
        return { ok: true, data: body as T }

    const errorBody = (body ?? {}) as { code?: string; error?: string }
    return {
        ok: false,
        status: response.status,
        code: errorBody.code ?? null,
        error: errorBody.error ?? `Server error (${response.status})`,
    }
}
