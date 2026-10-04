export type MarketplaceZipSummary = {
  petCount: number
  clothesCount: number
  entries: string[]
}

const END_OF_CENTRAL_DIRECTORY = 0x06054b50
const CENTRAL_DIRECTORY_FILE_HEADER = 0x02014b50
const LOCAL_FILE_HEADER = 0x04034b50
const MAX_ENTRIES = 1500
const MAX_UNCOMPRESSED_BYTES = 700 * 1024 * 1024

function isUnsafePath(name: string) {
  const normalized = name.replace(/\\/g, '/')
  const segments = normalized.replace(/\/$/, '').split('/')
  return !name || normalized.startsWith('/') || normalized.startsWith('~') ||
    /^[a-z]:/i.test(normalized) || segments.some(segment => !segment || segment === '.' || segment === '..' || segment.includes(':')) ||
    /[\x00-\x1f]/.test(name)
}

/** One parser for both the submission form and the server's trust boundary. */
export function summarizeMarketplaceZip(input: ArrayBuffer | Uint8Array): MarketplaceZipSummary {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let end = -1
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65535 - 22); offset--) {
    if (view.getUint32(offset, true) === END_OF_CENTRAL_DIRECTORY &&
        offset + 22 + view.getUint16(offset + 20, true) === bytes.length) {
      end = offset
      break
    }
  }
  if (end < 0) throw new Error('Invalid ZIP file')
  const count = view.getUint16(end + 10, true)
  const directorySize = view.getUint32(end + 12, true)
  let offset = view.getUint32(end + 16, true)
  const directoryStart = offset
  if (view.getUint16(end + 4, true) !== 0 || view.getUint16(end + 6, true) !== 0 ||
      view.getUint16(end + 8, true) !== count || count === 65535 ||
      offset + directorySize !== end) throw new Error('Unsupported or malformed ZIP directory')
  if (count > MAX_ENTRIES) throw new Error('The ZIP contains too many files.')
  const decoder = new TextDecoder()
  const entries: string[] = []
  const seenPaths = new Set<string>()
  const filePaths = new Set<string>()
  const parentPaths = new Set<string>()
  let compressed = 0
  let uncompressed = 0
  for (let index = 0; index < count; index++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== CENTRAL_DIRECTORY_FILE_HEADER) {
      throw new Error('Invalid ZIP central directory')
    }
    const flags = view.getUint16(offset + 8, true)
    const method = view.getUint16(offset + 10, true)
    const compressedSize = view.getUint32(offset + 20, true)
    const uncompressedSize = view.getUint32(offset + 24, true)
    const nameLength = view.getUint16(offset + 28, true)
    const extraLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const local = view.getUint32(offset + 42, true)
    const nameStart = offset + 46
    const next = nameStart + nameLength + extraLength + commentLength
    if (next > end || !nameLength) throw new Error('Invalid ZIP entry name')
    const nameBytes = bytes.subarray(nameStart, nameStart + nameLength)
    const name = decoder.decode(nameBytes)
    if (isUnsafePath(name)) throw new Error('The ZIP contains unsafe file paths.')
    // Windows extraction treats case and backslashes as equivalent. Reject
    // aliases before a later entry can silently overwrite an earlier one.
    const normalizedName = name.replace(/\\/g, '/').replace(/\/$/, '').toLowerCase()
    if (seenPaths.has(normalizedName)) throw new Error('The ZIP contains duplicate file paths.')
    const parts = normalizedName.split('/')
    for (let part = 1; part < parts.length; part++) {
      const parent = parts.slice(0, part).join('/')
      if (filePaths.has(parent)) throw new Error('The ZIP contains conflicting file paths.')
      parentPaths.add(parent)
    }
    const isDirectory = name.endsWith('/') || name.endsWith('\\')
    if (!isDirectory && parentPaths.has(normalizedName)) throw new Error('The ZIP contains conflicting file paths.')
    seenPaths.add(normalizedName)
    if (!isDirectory) filePaths.add(normalizedName)
    if ((flags & 1) || (method !== 0 && method !== 8) || view.getUint16(offset + 34, true) !== 0 ||
        compressedSize === 0xffffffff || uncompressedSize === 0xffffffff) {
      throw new Error('Unsupported ZIP entry')
    }
    if (local + 30 > directoryStart || view.getUint32(local, true) !== LOCAL_FILE_HEADER) {
      throw new Error('Invalid ZIP local header')
    }
    const localNameLength = view.getUint16(local + 26, true)
    const dataStart = local + 30 + localNameLength + view.getUint16(local + 28, true)
    if (localNameLength !== nameLength || dataStart + compressedSize > directoryStart ||
        view.getUint16(local + 6, true) !== flags || view.getUint16(local + 8, true) !== method ||
        nameBytes.some((byte, i) => bytes[local + 30 + i] !== byte)) {
      throw new Error('Inconsistent ZIP entry')
    }
    // Reject Unix symbolic links: their target can escape an extraction folder.
    if (((view.getUint32(offset + 38, true) >>> 16) & 0xf000) === 0xa000) {
      throw new Error('The ZIP contains symbolic links.')
    }
    compressed += compressedSize
    uncompressed += uncompressedSize
    if (uncompressed > MAX_UNCOMPRESSED_BYTES) throw new Error('The ZIP expands to too much data.')
    if (!isDirectory) entries.push(name)
    offset = next
  }
  if (offset !== end) throw new Error('Invalid ZIP directory size')
  if (uncompressed > Math.max(1, compressed) * 120) throw new Error('The ZIP has a suspicious compression ratio.')
  return {
    petCount: entries.filter(entry => entry.toLowerCase().endsWith('.pet')).length,
    clothesCount: entries.filter(entry => entry.toLowerCase().endsWith('.clothes')).length,
    entries,
  }
}
