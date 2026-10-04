// SafeFile v1: magic/version (8), salt (16), IV (12), AES-GCM ciphertext/tag.
// The entire header is authenticated; filename and MIME type are encrypted.
// Keep this factory self-contained: portable HTML embeds this same implementation.
export function createSafeFileCrypto() {
const MAGIC = new Uint8Array([83, 65, 70, 69, 70, 73, 76, 1])
const HEADER_BYTES = 36
const ITERATIONS = 600_000
const MAX_FILE_BYTES = 30 * 1024 * 1024
const MAX_CONTAINER_BYTES = MAX_FILE_BYTES + 4096 + HEADER_BYTES + 20
const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: true })

class SafeFileError extends Error {
  constructor(public code: 'unsupported' | 'size' | 'password' | 'format' | 'unlock') {
    super(code)
  }
}

function cryptoApi() {
  if (!globalThis.crypto?.subtle) throw new SafeFileError('unsupported')
  return globalThis.crypto
}

function isSafeFile(bytes: Uint8Array) {
  return MAGIC.every((value, i) => bytes[i] === value)
}

function passwordIssue(password: string, confirmation?: string): 'empty' | 'short' | 'long' | 'blank' | 'confirmation' | 'mismatch' | null {
  if (!password) return 'empty'
  if (password.length > 1024) return 'long'
  // Decryption accepts the exact password used in older containers as well.
  if (confirmation === undefined) return null
  if (!password.trim()) return 'blank'
  if (Array.from(password).length < 12) return 'short'
  if (!confirmation) return 'confirmation'
  if (password !== confirmation) return 'mismatch'
  return null
}

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>, usage: 'encrypt' | 'decrypt') {
  if (!password || password.length > 1024) throw new SafeFileError('password')
  const api = cryptoApi()
  const material = await api.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey'])
  return api.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS },
    material, { name: 'AES-GCM', length: 256 }, false, [usage],
  )
}

async function encryptFile(file: File, password: string): Promise<Blob> {
  if (file.size > MAX_FILE_BYTES) throw new SafeFileError('size')
  if (passwordIssue(password, password)) throw new SafeFileError('password')
  const api = cryptoApi()
  const header = new Uint8Array(HEADER_BYTES)
  header.set(MAGIC)
  header.set(api.getRandomValues(new Uint8Array(16)), 8)
  header.set(api.getRandomValues(new Uint8Array(12)), 24)
  const metadata = encoder.encode(JSON.stringify({ name: file.name, type: file.type }))
  if (metadata.length > 4096) throw new SafeFileError('format')
  const payload = new Uint8Array(4 + metadata.length + file.size)
  new DataView(payload.buffer).setUint32(0, metadata.length)
  payload.set(metadata, 4)
  payload.set(new Uint8Array(await file.arrayBuffer()), 4 + metadata.length)
  try {
    const key = await deriveKey(password, header.slice(8, 24), 'encrypt')
    const ciphertext = await api.subtle.encrypt(
      { name: 'AES-GCM', iv: header.slice(24), additionalData: header, tagLength: 128 }, key, payload,
    )
    return new Blob([header, ciphertext], { type: 'application/octet-stream' })
  } finally {
    payload.fill(0)
  }
}

async function decryptFile(buffer: ArrayBuffer, password: string): Promise<{ blob: Blob; name: string }> {
  const bytes = new Uint8Array(buffer)
  if (bytes.length > MAX_CONTAINER_BYTES) throw new SafeFileError('size')
  if (bytes.length < HEADER_BYTES + 20 || !isSafeFile(bytes)) throw new SafeFileError('format')
  const header = bytes.slice(0, HEADER_BYTES)
  const key = await deriveKey(password, header.slice(8, 24), 'decrypt')
  let plaintext: ArrayBuffer
  try {
    plaintext = await cryptoApi().subtle.decrypt(
      { name: 'AES-GCM', iv: header.slice(24), additionalData: header, tagLength: 128 }, key, bytes.slice(HEADER_BYTES),
    )
  } catch {
    // A failed authentication cannot distinguish a bad password from tampering.
    throw new SafeFileError('unlock')
  }
  const payload = new Uint8Array(plaintext)
  try {
    if (payload.length < 4) throw new SafeFileError('format')
    const length = new DataView(plaintext).getUint32(0)
    if (length > 4096 || length + 4 > payload.length) throw new SafeFileError('format')
    const metadata: unknown = JSON.parse(decoder.decode(payload.slice(4, length + 4)))
    if (!metadata || typeof metadata !== 'object' || !('name' in metadata) || typeof metadata.name !== 'string' || !('type' in metadata) || typeof metadata.type !== 'string') throw new SafeFileError('format')
    if (payload.length - length - 4 > MAX_FILE_BYTES) throw new SafeFileError('size')
    const name = metadata.name.split(/[\\/]/).pop()?.replace(/[\x00-\x1f\x7f]/g, '') || 'document'
    return { name, blob: new Blob([payload.slice(length + 4)], { type: metadata.type }) }
  } finally {
    payload.fill(0)
  }
}

return { MAX_FILE_BYTES, MAX_CONTAINER_BYTES, SafeFileError, isSafeFile, encryptFile, decryptFile, passwordIssue }
}

export const { MAX_FILE_BYTES, MAX_CONTAINER_BYTES, SafeFileError, isSafeFile, encryptFile, decryptFile, passwordIssue } = createSafeFileCrypto()
