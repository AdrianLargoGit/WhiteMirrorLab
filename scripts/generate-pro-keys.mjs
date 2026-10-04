import { generateKeyPairSync } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const directory = path.resolve(import.meta.dirname, '..', '.pro-keys')
if (existsSync(path.join(directory, 'private.pem')) || existsSync(path.join(directory, 'public.pem'))) {
  throw new Error('Existing Pro keys found. Reuse them; this script will not overwrite them.')
}
const keys = generateKeyPairSync('ed25519', {
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' },
})
mkdirSync(directory, { recursive: true })
writeFileSync(path.join(directory, 'private.pem'), keys.privateKey, { mode: 0o600, flag: 'wx' })
writeFileSync(path.join(directory, 'public.pem'), keys.publicKey, { flag: 'wx' })
console.log('Ed25519 keys saved in .pro-keys/ (ignored by Git).')
console.log('Copy private.pem into the server secret WML_PRO_LICENSE_PRIVATE_KEY.')
console.log('Copy public.pem into WML_PRO_LICENSE_PUBLIC_KEY in the Pro widget build and the website.')
