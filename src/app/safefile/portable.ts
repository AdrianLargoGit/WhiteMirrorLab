import { createSafeFileCrypto, isSafeFile, MAX_CONTAINER_BYTES, SafeFileError } from './crypto'

// Self-contained runtime: serialized into the downloaded HTML, without imports.
function portableApp(factory: typeof createSafeFileCrypto, language: 'es' | 'en') {
  const tools = factory()
  const es = language === 'es'
  const form = document.getElementById('unlock-form') as HTMLFormElement
  const password = document.getElementById('password') as HTMLInputElement
  const button = document.getElementById('unlock') as HTMLButtonElement
  const show = document.getElementById('show') as HTMLButtonElement
  const status = document.getElementById('status')!
  const link = document.getElementById('original') as HTMLAnchorElement
  const clear = document.getElementById('clear') as HTMLButtonElement
  let originalUrl: string | null = null
  let working = false
  const readContainer = () => {
    const data = atob(document.getElementById('sealed-data')!.textContent!.trim())
    return Uint8Array.from(data, character => character.charCodeAt(0)).buffer
  }
  const reset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    originalUrl = null
    link.hidden = true; link.removeAttribute('href')
    clear.hidden = true; password.value = ''; password.type = 'password'
    show.textContent = es ? 'Mostrar' : 'Show'; show.setAttribute('aria-pressed', 'false')
    status.textContent = ''
  }
  show.addEventListener('click', () => {
    const hidden = password.type === 'password'
    password.type = hidden ? 'text' : 'password'
    show.textContent = hidden ? es ? 'Ocultar' : 'Hide' : es ? 'Mostrar' : 'Show'
    show.setAttribute('aria-pressed', String(hidden))
  })
  clear.addEventListener('click', reset)
  window.addEventListener('pagehide', () => { if (originalUrl) URL.revokeObjectURL(originalUrl) })
  form.addEventListener('submit', async event => {
    event.preventDefault()
    if (working) return
    if (!password.value) { status.textContent = es ? 'Escribe la contraseña con la que se cifró el archivo.' : 'Enter the password used to encrypt the file.'; password.focus(); return }
    if (!globalThis.crypto?.subtle) { status.textContent = es ? 'Este navegador no permite cifrado en archivos locales. Abre este HTML con Chrome, Edge o Firefox actualizado.' : 'This browser does not support crypto in local files. Open this HTML in an updated Chrome, Edge or Firefox.'; return }
    if (originalUrl) URL.revokeObjectURL(originalUrl)
    originalUrl = null; link.hidden = true; link.removeAttribute('href'); clear.hidden = true
    working = true; button.disabled = true; password.disabled = true; show.disabled = true
    status.textContent = es ? 'Verificando contraseña…' : 'Verifying password…'
    try {
      const result = await tools.decryptFile(readContainer(), password.value)
      originalUrl = URL.createObjectURL(result.blob)
      link.href = originalUrl; link.download = result.name
      link.textContent = `${es ? 'Descargar' : 'Download'} ${result.name}`
      link.hidden = false; clear.hidden = false
      password.value = ''
      status.textContent = es ? 'Archivo desbloqueado. Si la descarga no comienza, utiliza el enlace. El original descargado ya no estará cifrado.' : 'File unlocked. If the download does not start, use the link. The downloaded original will no longer be encrypted.'
      link.click()
    } catch (error) {
      status.textContent = error instanceof tools.SafeFileError && error.code === 'unlock'
        ? es ? 'Contraseña incorrecta o archivo alterado. No se ha recuperado ningún contenido.' : 'Incorrect password or modified file. No content was recovered.'
        : es ? 'No se pudo abrir el archivo. Comprueba la contraseña y que el HTML no esté dañado.' : 'Could not open the file. Check the password and that the HTML is intact.'
    } finally {
      working = false; button.disabled = false; password.disabled = false; show.disabled = false
    }
  })

}

function toBase64(bytes: Uint8Array) {
  const chunks: string[] = []
  for (let i = 0; i < bytes.length; i += 32768) chunks.push(String.fromCharCode(...bytes.subarray(i, i + 32768)))
  return btoa(chunks.join(''))
}

export async function createPortableFile(container: Blob, language: 'es' | 'en'): Promise<Blob> {
  const bytes = new Uint8Array(await container.arrayBuffer())
  if (bytes.length > MAX_CONTAINER_BYTES || !isSafeFile(bytes)) throw new SafeFileError('format')
  const es = language === 'es'
  const script = `(${portableApp.toString()})(${createSafeFileCrypto.toString()},${JSON.stringify(language)});`
  const digest = toBase64(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(script))))
  const html = `<!doctype html>
<html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${digest}'; style-src 'unsafe-inline'; connect-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'">
<title>SafeFile · ${es ? 'Archivo portátil cifrado' : 'Portable encrypted file'}</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#080808;color:#f5f2ee;font-family:system-ui,sans-serif;min-height:100vh;display:grid;place-items:center;padding:26px;background-image:linear-gradient(#ffffff05 1px,transparent 1px),linear-gradient(90deg,#ffffff05 1px,transparent 1px);background-size:58px 58px}main{width:min(100%,510px);border:1px solid #ffffff26;background:#101010;padding:clamp(22px,5vw,42px);box-shadow:10px 10px 0 #ff5a5f19}.label{font:10px monospace;letter-spacing:.18em;color:#ffd84d}h1{font-size:clamp(38px,7vw,60px);letter-spacing:-.06em;margin:18px 0}h1 span{color:#ffd84d}p{font-size:14px;line-height:1.65;color:#b4b1ad}label{display:block;font:12px monospace;margin:25px 0 10px}.row{display:flex}input{flex:1;min-width:0;min-height:48px;background:#181818;border:1px solid #ffffff36;padding:12px;color:#fff;font:15px monospace}input:focus{outline:1px solid #ffd84d}button,a{cursor:pointer}button{font:12px monospace;border:1px solid #ffffff36;background:#191919;color:#ffd84d;padding:12px}button:disabled{opacity:.5;cursor:wait}.primary{display:block;width:100%;min-height:52px;margin-top:20px;border-color:#ffd84d;background:#ffd84d;color:#080808;font-weight:bold;text-align:center}.secondary{display:block;margin-top:16px;background:transparent;font-size:11px}.hint{font-size:11px;color:#888581}#status{min-height:24px;color:#ffd84d;overflow-wrap:anywhere}#original{display:block;color:#b7f15a;overflow-wrap:anywhere;line-height:1.6}#original[hidden],button[hidden]{display:none}footer{margin-top:26px;border-top:1px solid #ffffff19;padding-top:16px;font:10px/1.7 monospace;color:#777572}
input{font-size:16px}button{min-height:44px}
@media(max-width:400px){body{padding:16px}main{padding:22px 18px}}
</style></head><body><main><div class="label">SAFEFILE / ${es ? 'PORTÁTIL' : 'PORTABLE'} / AES-256-GCM</div>
<h1>Safe<span>File.</span></h1><p>${es ? 'Este archivo está cifrado. Introduce la contraseña para desbloquear y descargar el original. No requiere instalar SafeFile ni conectarse a Internet.' : 'This file is encrypted. Enter the password to unlock and download the original. No SafeFile installation or Internet connection is required.'}</p>
<form id="unlock-form" novalidate><label for="password">${es ? 'Contraseña del archivo' : 'File password'}</label><div class="row"><input id="password" type="password" autocomplete="off" spellcheck="false" maxlength="1024" aria-describedby="hint status"><button type="button" id="show" aria-pressed="false">${es ? 'Mostrar' : 'Show'}</button></div><p id="hint" class="hint">${es ? 'Utiliza exactamente la contraseña elegida al cifrarlo. No hay recuperación de contraseña.' : 'Use the exact password chosen during encryption. Password recovery is not available.'}</p><button id="unlock" type="submit" class="primary">${es ? 'Desbloquear y descargar' : 'Unlock and download'}</button></form>
<p id="status" role="status" aria-live="polite"></p><a id="original" hidden></a><button id="clear" type="button" class="secondary" hidden>${es ? 'Bloquear de nuevo' : 'Lock again'}</button>
<noscript><p>${es ? 'Necesitas JavaScript habilitado. Abre este HTML en un navegador actualizado.' : 'JavaScript must be enabled. Open this HTML in an updated browser.'}</p></noscript>
<footer>${es ? 'PROCESAMIENTO LOCAL · SIN SERVIDORES<br>Al desbloquear y guardar el original, esa copia deja de estar cifrada. El cifrado no protege capturas ni fotos del contenido que muestres después de desbloquearlo, en ordenador o móvil.' : 'LOCAL PROCESSING · NO SERVERS<br>After unlocking and saving the original, that copy is no longer encrypted. Encryption does not protect screenshots or photos of content you display after unlocking, on a computer or phone.'}</footer></main>
<script id="sealed-data" type="application/octet-stream">${toBase64(bytes)}</script><script>${script}</script></body></html>`
  return new Blob([html], { type: 'text/html;charset=utf-8' })
}
