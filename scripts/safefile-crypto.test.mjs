import { test } from 'node:test'
import assert from 'node:assert/strict'
import { File } from 'node:buffer'
import { createDecipheriv, pbkdf2Sync } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import Module from 'node:module'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import vm from 'node:vm'
import ts from 'typescript'

const testDirectory = fileURLToPath(new URL('.', import.meta.url))

// Compile the actual browser module in memory, without a second implementation.
function loadTypescript(relative) {
  const filename = path.resolve(testDirectory, relative)
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const compiledModule = new Module(filename)
  compiledModule.filename = filename
  compiledModule.paths = Module._nodeModulePaths(path.dirname(filename))
  const requireDependency = compiledModule.require.bind(compiledModule)
  compiledModule.require = request => request === './crypto' ? loadTypescript('../src/app/safefile/crypto.ts') : requireDependency(request)
  compiledModule._compile(compiled, filename)
  return compiledModule.exports
}
const { encryptFile, decryptFile, passwordIssue, SafeFileError, MAX_CONTAINER_BYTES } = loadTypescript('../src/app/safefile/crypto.ts')

const password = 'random-long-secret-for-tests-only'
const original = new File([Buffer.from('Private document\nSecret: 72641\n\x00\xff', 'latin1')], 'secret-report.pdf', { type: 'application/pdf' })
const rejectsCode = (code) => (error) => error instanceof SafeFileError && error.code === code

test('restores original bytes, filename and MIME type exactly', async () => {
  const container = await encryptFile(original, password)
  const restored = await decryptFile(await container.arrayBuffer(), password)
  assert.equal(restored.name, original.name)
  assert.equal(restored.blob.type, original.type)
  assert.deepEqual(Buffer.from(await restored.blob.arrayBuffer()), Buffer.from(await original.arrayBuffer()))
  const raw = Buffer.from(await container.arrayBuffer())
  for (const value of ['Private document', 'Secret: 72641', original.name, original.type]) assert.equal(raw.includes(Buffer.from(value)), false)
})

test('independent Node AES-GCM implementation decrypts browser output', async () => {
  const raw = Buffer.from(await (await encryptFile(original, password)).arrayBuffer())
  const header = raw.subarray(0, 36)
  const key = pbkdf2Sync(password, header.subarray(8, 24), 600000, 32, 'sha256')
  const decipher = createDecipheriv('aes-256-gcm', key, header.subarray(24, 36))
  decipher.setAAD(header)
  decipher.setAuthTag(raw.subarray(raw.length - 16))
  const plaintext = Buffer.concat([decipher.update(raw.subarray(36, raw.length - 16)), decipher.final()])
  const metadataLength = plaintext.readUInt32BE(0)
  assert.deepEqual(JSON.parse(plaintext.subarray(4, metadataLength + 4).toString()), { name: original.name, type: original.type })
  assert.deepEqual(plaintext.subarray(metadataLength + 4), Buffer.from(await original.arrayBuffer()))
})

test('same file and password produce fresh salt, IV and ciphertext', async () => {
  const a = Buffer.from(await (await encryptFile(original, password)).arrayBuffer())
  const b = Buffer.from(await (await encryptFile(original, password)).arrayBuffer())
  assert.notDeepEqual(a.subarray(8, 24), b.subarray(8, 24))
  assert.notDeepEqual(a.subarray(24, 36), b.subarray(24, 36))
  assert.notDeepEqual(a.subarray(36), b.subarray(36))
})

test('wrong passwords and modified salt, IV, ciphertext or tag return no plaintext', async () => {
  const buffer = await (await encryptFile(original, password)).arrayBuffer()
  await assert.rejects(decryptFile(buffer, 'wrong-password-1234'), rejectsCode('unlock'))
  for (const offset of [8, 24, 36, buffer.byteLength - 1]) {
    const modified = buffer.slice(0)
    new Uint8Array(modified)[offset] ^= 1
    await assert.rejects(decryptFile(modified, password), rejectsCode('unlock'))
  }
})

test('rejects invalid versions, truncated files, oversized input and short passwords', async () => {
  const buffer = await (await encryptFile(original, password)).arrayBuffer()
  const modified = buffer.slice(0)
  new Uint8Array(modified)[7] = 2
  await assert.rejects(decryptFile(modified, password), rejectsCode('format'))
  await assert.rejects(decryptFile(buffer.slice(0, 40), password), rejectsCode('format'))
  await assert.rejects(decryptFile(new ArrayBuffer(MAX_CONTAINER_BYTES + 1), password), rejectsCode('size'))
  await assert.rejects(encryptFile(original, 'short'), rejectsCode('password'))
})

test('handles empty files, binary data and Unicode password/filename', async () => {
  const file = new File([], 'informe-ñ-日本.pdf', { type: 'application/pdf' })
  const secret = 'frase-ñ-日本-secreta-12345'
  const restored = await decryptFile(await (await encryptFile(file, secret)).arrayBuffer(), secret)
  assert.equal(restored.name, file.name)
  assert.equal(restored.blob.size, 0)
})

test('password validation explains every block without requiring numbers or symbols', async () => {
  assert.equal(passwordIssue('', ''), 'empty')
  assert.equal(passwordIssue('short', 'short'), 'short')
  assert.equal(passwordIssue('            ', '            '), 'blank')
  assert.equal(passwordIssue('abcdefghijkl', ''), 'confirmation')
  assert.equal(passwordIssue('abcdefghijkl', 'abcdefghijkm'), 'mismatch')
  assert.equal(passwordIssue('abcdefghijkl', 'abcdefghijkl'), null)
  assert.equal(passwordIssue('a'.repeat(1025), 'a'.repeat(1025)), 'long')
  assert.equal(passwordIssue('😀'.repeat(6), '😀'.repeat(6)), 'short')
  assert.equal(passwordIssue('legacy'), null) // Only encryption imposes the new minimum.
  await assert.rejects(encryptFile(original, '            '), rejectsCode('password'))
  const result = await decryptFile(await (await encryptFile(original, 'abcdefghijkl')).arrayBuffer(), 'abcdefghijkl')
  assert.equal(result.name, original.name)
})

for (const language of ['es', 'en']) test(`portable HTML (${language}) embeds only encrypted data and runs its exact offline unlock code`, async () => {
  const { createPortableFile } = loadTypescript('../src/app/safefile/portable.ts')
  const container = await encryptFile(original, password)
  const html = await (await createPortableFile(container, language)).text()
  assert.ok(html.includes(`<html lang="${language}">`))
  assert.equal(html.includes(password), false)
  assert.equal(html.includes(original.name), false)
  assert.equal(html.includes('Secret: 72641'), false)
  assert.equal(/<script\s+src=/i.test(html), false)
  assert.ok(html.includes("connect-src 'none'"))
  const encoded = html.match(/<script id="sealed-data" type="application\/octet-stream">([A-Za-z0-9+/=]+)<\/script>/)[1]
  assert.deepEqual(Buffer.from(encoded, 'base64'), Buffer.from(await container.arrayBuffer()))
  const script = html.match(/<script>([\s\S]+)<\/script><\/body>/)[1]
  const hash = createHash('sha256').update(script).digest('base64')
  assert.ok(html.includes(`'sha256-${hash}'`))
  const elements = new Map()
  const objectUrls = new Map()
  const downloads = []
  const timers = []
  class Element {
    listeners = new Map()
    hidden = true
    value = ''
    textContent = ''
    type = 'password'
    addEventListener(event, listener) { this.listeners.set(event, listener) }
    setAttribute(key, value) { this[key] = value }
    removeAttribute(key) { delete this[key] }
    focus() {}
    click() { if (this.href) downloads.push({ name: this.download, blob: objectUrls.get(this.href) }); return this.listeners.get('click')?.() }
  }
  for (const id of ['unlock-form', 'password', 'unlock', 'show', 'status', 'original', 'clear', 'sealed-data']) elements.set(id, new Element())
  elements.get('sealed-data').textContent = encoded
  let sequence = 0
  vm.runInNewContext(script, {
    TextEncoder, TextDecoder, Uint8Array, ArrayBuffer, DataView, Blob, atob, btoa, crypto,
    document: { getElementById: id => elements.get(id), createElement: () => new Element() },
    window: { addEventListener() {}, setTimeout: fn => { timers.push(fn); return 1 } },
    URL: { createObjectURL: blob => { const url = `blob:${++sequence}`; objectUrls.set(url, blob); return url }, revokeObjectURL: url => objectUrls.delete(url) },
  })
  assert.equal(downloads.length, 0)
  const submit = () => elements.get('unlock-form').listeners.get('submit')({ preventDefault() {} })
  await submit()
  assert.ok(elements.get('status').textContent.includes(language === 'es' ? 'Escribe la contraseña' : 'Enter the password'))
  elements.get('password').value = 'incorrect-password'
  await submit()
  assert.ok(elements.get('status').textContent.includes(language === 'es' ? 'Contraseña incorrecta' : 'Incorrect password'))
  assert.equal(downloads.length, 0)
  elements.get('password').value = password
  await submit()
  assert.equal(downloads.length, 1)
  assert.equal(downloads[0].name, original.name)
  assert.deepEqual(Buffer.from(await downloads[0].blob.arrayBuffer()), Buffer.from(await original.arrayBuffer()))
  assert.equal(elements.get('password').value, '')
  elements.get('clear').click()
  assert.equal(elements.get('original').hidden, true)
  assert.equal(objectUrls.size, 0)
  assert.equal(html.includes('save-safe'), false)
  assert.equal(html.includes('.safe'), false)
  timers.forEach(timer => timer())
})

test('visible PDF keeps redacted pixels black and contains no text layer', async () => {
  // Canvas is already bundled as an optional dependency of PDF.js.
  const { createCanvas } = await import('@napi-rs/canvas')
  const { drawRedactions, exportRasterPdf } = loadTypescript('../src/app/safefile/visible.ts')
  const first = createCanvas(200, 100)
  const ctx = first.getContext('2d')
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 200, 100)
  ctx.fillStyle = '#000'; ctx.font = '18px sans-serif'; ctx.fillText('SECRET 123', 22, 60)
  drawRedactions(first, [{ x: 0.1, y: 0.3, width: 0.65, height: 0.4 }])
  const second = createCanvas(200, 300)
  second.getContext('2d').fillRect(0, 0, 200, 300)
  const blob = await exportRasterPdf([first, second])
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const loadingTask = getDocument({ data: new Uint8Array(await blob.arrayBuffer()) })
  const pdf = await loadingTask.promise
  try {
    assert.equal(pdf.numPages, 2)
    for (let i = 1; i <= 2; i++) assert.equal((await (await pdf.getPage(i)).getTextContent()).items.length, 0)
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1 })
    assert.ok(Math.abs(viewport.width / viewport.height - 2) < 0.01)
    const target = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height))
    await page.render({ canvas: target, canvasContext: target.getContext('2d'), viewport }).promise
    const sample = (x, y) => Array.from(target.getContext('2d').getImageData(Math.floor(x * viewport.width), Math.floor(y * viewport.height), 1, 1).data)
    assert.deepEqual(sample(0.2, 0.5), [0, 0, 0, 255])
    assert.deepEqual(sample(0.9, 0.9), [255, 255, 255, 255])
    const portrait = (await pdf.getPage(2)).getViewport({ scale: 1 })
    assert.ok(Math.abs(portrait.width / portrait.height - 2 / 3) < 0.01)
  } finally {
    await loadingTask.destroy()
  }
})
