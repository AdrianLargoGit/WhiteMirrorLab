import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createPrivateKey, createPublicKey, generateKeyPairSync } from 'node:crypto'
import { parseEnv } from 'node:util'
import path from 'node:path'

const web = path.resolve(import.meta.dirname, '..')
const widget = path.resolve(web, '..', 'wml-xx0')
const webFile = path.join(web, '.env.local')
const widgetFile = path.join(widget, '.env.pro')
const read = file => existsSync(file) ? readFileSync(file, 'utf8') : ''
const webEnv = parseEnv(read(webFile))
const widgetEnv = parseEnv(read(widgetFile))
const decode = value => value?.replace(/\\n/g, '\n')
const publicDer = key => createPublicKey(key).export({ type: 'spki', format: 'der' })
let privateKey = decode(webEnv.WML_PRO_LICENSE_PRIVATE_KEY)
const existingWidgetKey = decode(widgetEnv.WML_PRO_LICENSE_PUBLIC_KEY)
if (!privateKey) {
  // Reuse the signing pair embedded in the current widget when available.
  for (const candidate of [path.join(web, '.pro-keys', 'private.pem'), path.join(widget, 'pro-private', 'license-test', 'dev-private-key.pem')]) {
    if (!existsSync(candidate)) continue
    const pem = read(candidate)
    if (!existingWidgetKey || publicDer(pem).equals(publicDer(existingWidgetKey))) { privateKey = pem; break }
  }
}
if (!privateKey && existingWidgetKey) throw new Error('Missing private key matching the widget. Existing signing keys must not be replaced.')
if (!privateKey) {
  privateKey = generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
  const directory = path.join(web, '.pro-keys')
  mkdirSync(directory, { recursive: true })
  writeFileSync(path.join(directory, 'private.pem'), privateKey, { flag: 'wx', mode: 0o600 })
  writeFileSync(path.join(directory, 'public.pem'), createPublicKey(privateKey).export({ type: 'spki', format: 'pem' }), { flag: 'wx' })
}
if (createPrivateKey(privateKey).asymmetricKeyType !== 'ed25519') throw new Error('Expected an Ed25519 signing key')
const publicKey = createPublicKey(privateKey).export({ type: 'spki', format: 'pem' }).toString()
if (existingWidgetKey && !publicDer(privateKey).equals(publicDer(existingWidgetKey))) throw new Error('Web/widget signing key mismatch')
if (webEnv.WML_PRO_LICENSE_PUBLIC_KEY && !publicDer(privateKey).equals(publicDer(decode(webEnv.WML_PRO_LICENSE_PUBLIC_KEY)))) throw new Error('Website signing key mismatch')
const origin = webEnv.WML_PRO_SITE_URL?.trim() || 'https://www.whitemirrorlab.com'
if (new URL(origin).protocol !== 'https:') throw new Error('Configure the HTTPS production site origin')
function update(file, values) {
  let source = read(file)
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${value.replace(/\r?\n/g, '\\n')}`
    const pattern = new RegExp(`^${key}=.*$`, 'm')
    source = pattern.test(source) ? source.replace(pattern, () => line) : `${source.trimEnd()}\n${line}\n`
  }
  writeFileSync(file, source, { mode: 0o600 })
}
update(webFile, {
  WML_PRO_SITE_URL: new URL(origin).origin,
  WML_PRO_LICENSE_PRIVATE_KEY: privateKey,
  WML_PRO_LICENSE_PUBLIC_KEY: publicKey,
})
update(widgetFile, {
  WML_PRO_LICENSE_PUBLIC_KEY: publicKey,
  WML_PRO_LICENSE_ACTIVATION_URL: `${new URL(origin).origin}/api/pro/activate`,
  WML_SUPABASE_ANON_KEY: '',
})
console.log('Pro signing keys and activation configured in the ignored environment files. No secrets printed.')
