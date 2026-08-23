import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NodeHttpHandler } from '@smithy/node-http-handler'
import { createHmac } from 'node:crypto'

type R2ObjectBody = {
  transformToByteArray?: () => Promise<Uint8Array>
  transformToWebStream?: () => ReadableStream
} | ReadableStream

const R2_URL_PREFIX = 'r2://'

function requireEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing ${name}`)
  }

  return value
}

function getR2Client() {
  const accountId = requireEnv('CLOUDFLARE_R2_ACCOUNT_ID')
  const accessKeyId = requireEnv('CLOUDFLARE_R2_ACCESS_KEY_ID')
  const secretAccessKey = requireEnv('CLOUDFLARE_R2_SECRET_ACCESS_KEY')

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    requestHandler: new NodeHttpHandler({
      connectionTimeout: 8000,
      requestTimeout: 30000,
    }),
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

function r2WorkerConfig() {
  const workerUrl = process.env.CLOUDFLARE_R2_UPLOAD_WORKER_URL ||
    process.env.CLOUDFLARE_R2_WORKER_URL ||
    process.env.R2_UPLOAD_WORKER_URL
  const workerSecret = process.env.CLOUDFLARE_R2_UPLOAD_WORKER_SECRET ||
    process.env.CLOUDFLARE_R2_WORKER_SECRET ||
    process.env.R2_UPLOAD_WORKER_SECRET

  if (!workerUrl || !workerSecret) return null

  return {
    url: workerUrl.replace(/\/+$/, ''),
    secret: workerSecret,
  }
}

function createWorkerUploadSignature(method: string, key: string, expiresAt: number) {
  const config = r2WorkerConfig()

  if (!config) {
    throw new Error('Missing CLOUDFLARE_R2_UPLOAD_WORKER_URL or CLOUDFLARE_R2_UPLOAD_WORKER_SECRET')
  }

  return createHmac('sha256', config.secret)
    .update(`${method.toUpperCase()}\n${key}\n${expiresAt}`)
    .digest('hex')
}

function createSignedWorkerUploadUrl(key: string) {
  const config = r2WorkerConfig()

  if (!config) {
    throw new Error('Missing CLOUDFLARE_R2_UPLOAD_WORKER_URL or CLOUDFLARE_R2_UPLOAD_WORKER_SECRET')
  }

  const expiresAt = Math.floor(Date.now() / 1000) + 900
  const uploadUrl = new URL(`${config.url}/object/${encodeR2ObjectKey(key)}`)
  uploadUrl.searchParams.set('expires', String(expiresAt))
  uploadUrl.searchParams.set('signature', createWorkerUploadSignature('PUT', key, expiresAt))

  return uploadUrl.toString()
}

function encodeR2ObjectKey(key: string) {
  return key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

async function fetchR2Worker(key: string, init: RequestInit, timeoutMs = 60000) {
  const config = r2WorkerConfig()

  if (!config) {
    throw new Error('Missing CLOUDFLARE_R2_UPLOAD_WORKER_URL or CLOUDFLARE_R2_UPLOAD_WORKER_SECRET')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(`${config.url}/object/${encodeR2ObjectKey(key)}`, {
      ...init,
      headers: {
        'x-wml-upload-secret': config.secret,
        ...init.headers,
      },
      signal: controller.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Cloudflare R2 Worker request timed out after ${Math.round(timeoutMs / 1000)} seconds`)
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export function toR2Url(key: string) {
  return `${R2_URL_PREFIX}${key}`
}

export function r2KeyFromUrl(value: string | null | undefined) {
  if (!value) return null
  if (value.startsWith(R2_URL_PREFIX)) return value.slice(R2_URL_PREFIX.length)
  return null
}

export function isR2Url(value: string | null | undefined) {
  return Boolean(r2KeyFromUrl(value))
}

export async function createR2UploadUrl(key: string, contentType: string) {
  if (r2WorkerConfig()) {
    return {
      provider: 'r2-worker' as const,
      uploadUrl: createSignedWorkerUploadUrl(key),
      fileUrl: toR2Url(key),
    }
  }

  const command = new PutObjectCommand({
    Bucket: requireEnv('CLOUDFLARE_R2_BUCKET'),
    Key: key,
    ContentType: contentType,
  })
  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 900 })

  return {
    provider: 'r2' as const,
    uploadUrl,
    fileUrl: toR2Url(key),
  }
}

export async function uploadR2ObjectStream(input: {
  key: string
  contentType: string
  body: ReadableStream<Uint8Array>
}) {
  const bytes = await new Response(input.body).arrayBuffer()

  if (r2WorkerConfig()) {
    await uploadR2ObjectWithWorker(input.key, input.contentType, bytes)

    return {
      fileUrl: toR2Url(input.key),
    }
  }

  try {
    await getR2Client().send(new PutObjectCommand({
      Bucket: requireEnv('CLOUDFLARE_R2_BUCKET'),
      Key: input.key,
      Body: new Uint8Array(bytes),
      ContentType: input.contentType,
    }))
  } catch {
    throw new Error(
      'Cloudflare R2 no responde por el endpoint S3. Configura CLOUDFLARE_R2_UPLOAD_WORKER_URL y CLOUDFLARE_R2_UPLOAD_WORKER_SECRET para subir por Worker.',
    )
  }

  return {
    fileUrl: toR2Url(input.key),
  }
}

export async function uploadR2ObjectWithWorker(
  key: string,
  contentType: string,
  body: BodyInit,
) {
  const response = await fetchR2Worker(
    key,
    {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body,
    },
  )

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    throw new Error(`Cloudflare R2 Worker upload failed (${response.status}): ${message}`)
  }
}

async function getR2ObjectWithWorker(key: string) {
  const response = await fetchR2Worker(key, { method: 'GET' })

  if (response.status === 404) return null

  if (!response.ok || !response.body) {
    const message = await response.text().catch(() => '')
    throw new Error(`Cloudflare R2 Worker download failed (${response.status}): ${message}`)
  }

  return {
    body: response.body as R2ObjectBody,
    contentType: response.headers.get('Content-Type') ?? undefined,
  }
}

export async function getR2Object(fileUrl: string) {
  const key = r2KeyFromUrl(fileUrl)

  if (!key) {
    throw new Error('Invalid R2 file URL')
  }

  if (r2WorkerConfig()) {
    return getR2ObjectWithWorker(key)
  }

  let response

  try {
    response = await getR2Client().send(new GetObjectCommand({
      Bucket: requireEnv('CLOUDFLARE_R2_BUCKET'),
      Key: key,
    }))
  } catch (error) {
    throw error
  }

  if (!response.Body) {
    return null
  }

  return {
    body: response.Body as R2ObjectBody,
    contentType: response.ContentType,
  }
}

export async function getR2ObjectBuffer(fileUrl: string) {
  const object = await getR2Object(fileUrl)

  if (!object) return null

  if ('transformToByteArray' in object.body && object.body.transformToByteArray) {
    return {
      bytes: await object.body.transformToByteArray(),
      contentType: object.contentType,
    }
  }

  const stream = r2ObjectToWebStream(object.body)
  if (!stream) {
    throw new Error('Unable to read R2 object body')
  }

  return {
    bytes: new Uint8Array(await new Response(stream).arrayBuffer()),
    contentType: object.contentType,
  }
}

export function toArrayBuffer(bytes: Uint8Array) {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}

export function r2ObjectToWebStream(body: R2ObjectBody) {
  if (body instanceof ReadableStream) {
    return body
  }

  const stream = body.transformToWebStream?.()

  if (!stream) {
    throw new Error('Unable to stream R2 object body')
  }

  return stream
}

export async function deleteR2Object(fileUrl: string | null | undefined) {
  const key = r2KeyFromUrl(fileUrl)

  if (!key) return

  if (r2WorkerConfig()) {
    const response = await fetchR2Worker(key, { method: 'DELETE' })

    if (!response.ok && response.status !== 404) {
      const message = await response.text().catch(() => '')
      throw new Error(`Cloudflare R2 Worker delete failed (${response.status}): ${message}`)
    }

    return
  }

  try {
    await getR2Client().send(new DeleteObjectCommand({
      Bucket: requireEnv('CLOUDFLARE_R2_BUCKET'),
      Key: key,
    }))
  } catch (error) {
    throw error
  }
}
