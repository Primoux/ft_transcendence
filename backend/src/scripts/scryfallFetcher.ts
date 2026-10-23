import { createInterface } from 'node:readline'
import { Readable } from 'node:stream'
import { createGunzip } from 'node:zlib'
import { pipeline } from 'node:stream/promises'

import type Stream from 'node:stream';

const userAgent = "42Lyon-ARA-MTGDle/0.1"
const accept = "application/json;q=0.9,*/*;q=0.8"
const httpHeaders = { "User-Agent": userAgent, "Accept": accept }

interface ScryfallBulkFile {
    type : string
    jsonl_download_uri: string
}

interface ScryfallResponse {
    data : ScryfallBulkFile[]
}

async function getOracleCardsUri() {
    console.log("Getting oracle_cards file uri")
    const response = await fetch ("https://api.scryfall.com/bulk-data", { headers: httpHeaders })
    if (!response.ok) throw new Error(`Scryfall returned an error : ${response.status}`)
    const items : ScryfallResponse = await response.json()

    const oracleCardsObject = items.data.find(item => item.type === "oracle_cards")
    if (oracleCardsObject === undefined) throw new Error("no Oracle Cards file available")

    return (oracleCardsObject.jsonl_download_uri);
}

async function getOracleCards(downloadUri: string) {
    console.log("fetching oracle_cards file")
    const response = await fetch(downloadUri, {headers: httpHeaders})
    if (!response.ok) throw new Error(`Scryfall returned an error : ${response.status}`)
    if (!response.body) throw new Error(`Scryfall returned empty response. Status : ${response.status}`)

    const readableResponse = Readable.fromWeb(response.body as import('node:stream/web').ReadableStream)

    const gz = createGunzip()

    await pipeline(readableResponse, gz, collectCards)

}

async function collectCards(decompressed: Readable) {
    const rl = createInterface(decompressed)
    let counter = 0
    for await (const line of rl) {
        if (!line.trim()) {continue}
        counter++
        
        /* TODO: 
            1. Filter if the card is token / double faced / joke card ...
            1. upsert the card into db (only relevant fields according to Card model)
        */
    }

    console.log(`${counter} cards upserted`)
}
const uri = await getOracleCardsUri()
await getOracleCards(uri)