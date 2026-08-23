import {
  createR2UploadUrl,
  deleteR2Object,
  getR2Object,
  getR2ObjectBuffer,
  isR2Url,
  r2ObjectToWebStream,
  uploadR2ObjectStream,
} from './r2Storage'

export type MarketplaceObject = {
  body: ReadableStream
  contentType?: string
}

export function isMarketplaceStorageUrl(value: string | null | undefined) {
  return isR2Url(value)
}

export async function createMarketplaceUploadUrl(path: string, contentType: string) {
  return createR2UploadUrl(path, contentType)
}

export async function uploadMarketplaceObjectStream(input: {
  path: string
  contentType: string
  body: ReadableStream<Uint8Array>
}) {
  return uploadR2ObjectStream({
    key: input.path,
    contentType: input.contentType,
    body: input.body,
  })
}

export async function getMarketplaceObject(fileUrl: string) {
  const object = await getR2Object(fileUrl)
  if (!object) return null

  return {
    body: r2ObjectToWebStream(object.body),
    contentType: object.contentType,
  } satisfies MarketplaceObject
}

export async function getMarketplaceObjectBuffer(fileUrl: string) {
  return getR2ObjectBuffer(fileUrl)
}

export function marketplaceObjectToWebStream(object: MarketplaceObject) {
  return object.body
}

export async function deleteMarketplaceObject(fileUrl: string | null | undefined) {
  await deleteR2Object(fileUrl)
}
