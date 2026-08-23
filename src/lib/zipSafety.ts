export type ZipSafetyResult =
  | { ok: true }
  | { ok: false; reason: string }

export type ZipMarketplaceSummary = {
  petCount: number
  clothesCount: number
}

const LOCAL_FILE_HEADER = 0x04034b50
const EMPTY_ZIP_HEADER = 0x06054b50
const CENTRAL_DIRECTORY_HEADER = 0x02014b50
const MAX_ZIP_ENTRIES = 1500
const MAX_UNCOMPRESSED_BYTES = 700 * 1024 * 1024
const MAX_COMPRESSION_RATIO = 120

function readUInt32LE(view: DataView, offset: number) {
  if (offset + 4 > view.byteLength) {
    return null
  }

  return view.getUint32(offset, true)
}

function readUInt16LE(view: DataView, offset: number) {
  if (offset + 2 > view.byteLength) {
    return null
  }

  return view.getUint16(offset, true)
}

function decodeFileName(bytes: Uint8Array) {
  try {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  } catch {
    return String.fromCharCode(...bytes)
  }
}

function getMarketplacePackageKey(fileName: string, extension: '.pet' | '.clothes') {
  const normalized = fileName.replace(/\\/g, '/').toLowerCase()
  const segments = normalized.split('/').filter(Boolean)
  const packageSegmentIndex = segments.findIndex((segment) => segment.endsWith(extension))

  if (packageSegmentIndex >= 0) {
    return segments.slice(0, packageSegmentIndex + 1).join('/')
  }

  return null
}

function isUnsafeZipPath(name: string) {
  const normalized = name.replace(/\\/g, '/')

  return (
    normalized.startsWith('/') ||
    normalized.startsWith('~') ||
    normalized.includes('../') ||
    normalized.includes('/..') ||
    /^[a-z]:\//i.test(normalized) ||
    normalized.includes('\0')
  )
}

export function analyzeZipBuffer(buffer: ArrayBuffer): ZipSafetyResult {
  if (buffer.byteLength < 4) {
    return { ok: false, reason: 'The file is too small to be a valid ZIP.' }
  }

  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  const firstSignature = readUInt32LE(view, 0)

  if (firstSignature !== LOCAL_FILE_HEADER && firstSignature !== EMPTY_ZIP_HEADER) {
    return { ok: false, reason: 'The uploaded file is not a ZIP archive.' }
  }

  let offset = 0
  let entries = 0
  let totalCompressedBytes = 0
  let totalUncompressedBytes = 0
  let foundCentralDirectory = false

  while (offset + 46 <= buffer.byteLength) {
    const signature = readUInt32LE(view, offset)

    if (signature !== CENTRAL_DIRECTORY_HEADER) {
      offset += 1
      continue
    }

    foundCentralDirectory = true
    entries += 1

    if (entries > MAX_ZIP_ENTRIES) {
      return { ok: false, reason: 'The ZIP contains too many files.' }
    }

    const compressedSize = readUInt32LE(view, offset + 20)
    const uncompressedSize = readUInt32LE(view, offset + 24)
    const fileNameLength = readUInt16LE(view, offset + 28)
    const extraLength = readUInt16LE(view, offset + 30)
    const commentLength = readUInt16LE(view, offset + 32)

    if (
      compressedSize === null ||
      uncompressedSize === null ||
      fileNameLength === null ||
      extraLength === null ||
      commentLength === null
    ) {
      return { ok: false, reason: 'The ZIP central directory is malformed.' }
    }

    const fileNameStart = offset + 46
    const fileNameEnd = fileNameStart + fileNameLength

    if (fileNameEnd > buffer.byteLength) {
      return { ok: false, reason: 'The ZIP contains a malformed file name.' }
    }

    const fileName = decodeFileName(bytes.slice(fileNameStart, fileNameEnd))

    if (isUnsafeZipPath(fileName)) {
      return { ok: false, reason: 'The ZIP contains unsafe file paths.' }
    }

    totalCompressedBytes += compressedSize
    totalUncompressedBytes += uncompressedSize

    if (totalUncompressedBytes > MAX_UNCOMPRESSED_BYTES) {
      return { ok: false, reason: 'The ZIP expands to too much data.' }
    }

    if (
      totalCompressedBytes > 0 &&
      totalUncompressedBytes / totalCompressedBytes > MAX_COMPRESSION_RATIO
    ) {
      return { ok: false, reason: 'The ZIP has a suspicious compression ratio.' }
    }

    offset = fileNameEnd + extraLength + commentLength
  }

  if (!foundCentralDirectory) {
    return { ok: false, reason: 'The ZIP central directory could not be found.' }
  }

  return { ok: true }
}

export function summarizeMarketplaceZip(buffer: ArrayBuffer): ZipMarketplaceSummary {
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)
  const petPackages = new Set<string>()
  const clothesPackages = new Set<string>()
  let offset = 0

  while (offset + 46 <= buffer.byteLength) {
    const signature = readUInt32LE(view, offset)

    if (signature !== CENTRAL_DIRECTORY_HEADER) {
      offset += 1
      continue
    }

    const fileNameLength = readUInt16LE(view, offset + 28)
    const extraLength = readUInt16LE(view, offset + 30)
    const commentLength = readUInt16LE(view, offset + 32)

    if (fileNameLength === null || extraLength === null || commentLength === null) {
      offset += 1
      continue
    }

    const fileNameStart = offset + 46
    const fileNameEnd = fileNameStart + fileNameLength

    if (fileNameEnd > buffer.byteLength) {
      break
    }

    const fileName = decodeFileName(bytes.slice(fileNameStart, fileNameEnd))
    const petPackageKey = getMarketplacePackageKey(fileName, '.pet')
    const clothesPackageKey = getMarketplacePackageKey(fileName, '.clothes')

    if (petPackageKey) petPackages.add(petPackageKey)
    if (clothesPackageKey) clothesPackages.add(clothesPackageKey)

    offset = fileNameEnd + extraLength + commentLength
  }

  return { petCount: petPackages.size, clothesCount: clothesPackages.size }
}
