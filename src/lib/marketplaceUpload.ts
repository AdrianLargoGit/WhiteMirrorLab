const ZIP_CONTENT_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'multipart/x-zip',
]
const IMAGE_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

const DEFAULT_MAX_ZIP_BYTES = 80 * 1024 * 1024
const DEFAULT_MAX_IMAGE_BYTES = 8 * 1024 * 1024

export type UploadRequestBody = {
  pathname?: string
  contentType?: string
  size?: number
}

export function validateMarketplaceUpload(input: UploadRequestBody) {
  const pathname = input.pathname?.trim()
  const contentType = input.contentType?.trim().toLowerCase()
  const size = Number(input.size)
  const maxZipBytes = Number(process.env.MARKETPLACE_MAX_ZIP_BYTES ?? DEFAULT_MAX_ZIP_BYTES)
  const maxImageBytes = Number(process.env.MARKETPLACE_MAX_IMAGE_BYTES ?? DEFAULT_MAX_IMAGE_BYTES)

  if (!pathname || pathname.includes('..') || pathname.startsWith('/') || pathname.includes('\\')) {
    return { ok: false as const, error: 'Invalid upload pathname' }
  }

  if (!contentType || !Number.isFinite(size) || size <= 0) {
    return { ok: false as const, error: 'Invalid upload metadata' }
  }

  const normalizedPathname = pathname.toLowerCase()
  const isZip = normalizedPathname.startsWith('marketplace-submissions/') &&
    normalizedPathname.endsWith('.zip') &&
    ZIP_CONTENT_TYPES.includes(contentType)
  const isImage = (
    normalizedPathname.startsWith('marketplace-covers/') ||
    normalizedPathname.startsWith('marketplace-previews/')
  ) &&
    /\.(png|jpe?g|webp|gif)$/.test(normalizedPathname) &&
    IMAGE_CONTENT_TYPES.includes(contentType)

  if (isZip && size > maxZipBytes) {
    return { ok: false as const, error: 'ZIP file is too large' }
  }

  if (isImage && size > maxImageBytes) {
    return { ok: false as const, error: 'Image file is too large' }
  }

  if (!isZip && !isImage) {
    return { ok: false as const, error: 'Only marketplace ZIP and image files are allowed' }
  }

  return {
    ok: true as const,
    pathname,
    contentType,
    size,
  }
}

export function formatServerError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (typeof error === 'object' && error) {
    const record = error as Record<string, unknown>
    const name = typeof record.name === 'string' ? record.name : null
    const code = typeof record.Code === 'string' ? record.Code : null
    const message = typeof record.message === 'string' && record.message.trim()
      ? record.message
      : null

    return [name, code, message].filter(Boolean).join(': ') || fallback
  }

  return fallback
}
