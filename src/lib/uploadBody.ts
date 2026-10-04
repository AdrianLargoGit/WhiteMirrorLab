export class UploadSizeError extends Error {}

export async function readUploadBody(body: ReadableStream<Uint8Array>, expectedSize: number): Promise<Uint8Array<ArrayBuffer>> {
  if (!Number.isSafeInteger(expectedSize) || expectedSize <= 0) throw new UploadSizeError('Invalid upload size')
  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > expectedSize) throw new UploadSizeError('Upload exceeds its declared size')
      chunks.push(value)
    }
    if (size !== expectedSize) throw new UploadSizeError('Upload size does not match its metadata')
  } catch (error) {
    await reader.cancel().catch(() => undefined)
    throw error
  } finally {
    reader.releaseLock()
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  return bytes
}
