import { read, WriteStream } from 'fs'
import { createInterface } from 'readline'
import { Readable } from 'stream'
import { createGunzip } from 'zlib'

import type * as streamWeb from 'node:stream/web';

const userAgent = "42Lyon-ARA-MTGDle/0.1"
const accept = "application/json;q=0.9,*/*;q=0.8"

interface ScryfallBulkFile {
    type : string
    jsonl_download_uri: string
}

interface ScryfallResponse {
    data : ScryfallBulkFile[]
}

async function getOracleCardsUri() {
    console.log("Getting oracle_cards file uri")
    const response = await fetch ("https://api.scryfall.com/bulk-data", {
        headers: {
            "User-Agent": `${userAgent}`,
            "Accept": `${accept}`
        }
    })
    if (!response.ok) throw new Error(`Scryfall returned an error : ${response.status}`)
    const items : ScryfallResponse = await response.json()

    const oracleCardsObject = items.data.find(item => item.type === "oracle_cards")
    if (oracleCardsObject === undefined) throw new Error("no Oracle Cards file available")

    return (oracleCardsObject.jsonl_download_uri);
}

async function getOracleCards(downloadUri: string) {
    console.log("fetching oracle_cards file")
    const response = await fetch(downloadUri, {
        headers: {
            "User-Agent": `${userAgent}`,
            "Accept": `${accept}`
        }
    })
    if (!response.ok) throw new Error(`Scryfall returned an error : ${response.status}`)
    if (!response.body) throw new Error(`Scryfall returned empty response. Status : ${response.status}`)

    const readableResponse = Readable.fromWeb(response.body as import('node:stream/web').ReadableStream)

    const gz = createGunzip()
    const decompressedData = readableResponse.pipe(gz)

    const rl = createInterface(decompressedData)

    let counter = 0
    for await (const line of rl) {
        if (!line.trim()) {continue}
        counter++
        console.log(JSON.parse(line).name)
    }
    console.log(counter);
}

const uri = await getOracleCardsUri()
await getOracleCards(uri)