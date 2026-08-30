export type MarketplaceZipSummary = {
  petCount: number
  clothesCount: number
  entries: string[]
}

const END_OF_CENTRAL_DIRECTORY = 0x06054b50
const CENTRAL_DIRECTORY_FILE_HEADER = 0x02014b50
const MAX_COMMENT_LENGTH = 0xffff

function findEndOfCentralDirectory(view: DataView) {
  const minOffset = Math.max(0, view.byteLength - MAX_COMMENT_LENGTH - 22)

  for (let offset = view.byteLength - 22; offset >= minOffset; offset -= 1) {
    if (view.getUint32(offset, true) === END_OF_CENTRAL_DIRECTORY) {
      return offset
    }
  }

  return -1
}

export function summarizeMarketplaceZip(bytes: ArrayBuffer | Uint8Array): MarketplaceZipSummary {
  const arrayBuffer = bytes instanceof Uint8Array
    ? bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
    : bytes
  const view = new DataView(arrayBuffer)
  const endOffset = findEndOfCentralDirectory(view)

  if (endOffset < 0) {
    throw new Error('Invalid ZIP file')
  }

  const entryCount = view.getUint16(endOffset + 10, true)
  const centralDirectoryOffset = view.getUint32(endOffset + 16, true)
  const decoder = new TextDecoder()
  const entries: string[] = []
  let offset = centralDirectoryOffset

  for (let index = 0; index < entryCount; index += 1) {
    if (offset + 46 > view.byteLength || view.getUint32(offset, true) !== CENTRAL_DIRECTORY_FILE_HEADER) {
      throw new Error('Invalid ZIP central directory')
    }

    const nameLength = view.getUint16(offset + 28, true)
    const extraLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const nameStart = offset + 46
    const nameEnd = nameStart + nameLength

    if (nameEnd > view.byteLength) {
      throw new Error('Invalid ZIP entry name')
    }

    const name = decoder.decode(new Uint8Array(arrayBuffer, nameStart, nameLength))
    if (name && !name.endsWith('/')) {
      entries.push(name)
    }

    offset = nameEnd + extraLength + commentLength
  }

  return {
    petCount: entries.filter((entry) => entry.toLowerCase().endsWith('.pet')).length,
    clothesCount: entries.filter((entry) => entry.toLowerCase().endsWith('.clothes')).length,
    entries,
  }
}
