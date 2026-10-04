import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { loadTypescript } from './test-helpers.mjs'

const { isValidEmailAddress } = loadTypescript('src/lib/emailValidation.ts')
test('admin session accepts only the configured token and a fresh untampered cookie', () => {
  const previous = process.env.MARKETPLACE_ADMIN_TOKEN
  process.env.MARKETPLACE_ADMIN_TOKEN = 'test-admin-secret-123'
  try {
    const admin = loadTypescript('src/lib/marketplaceAdmin.ts', { 'server-only': {}, 'next/headers': { cookies: async () => ({ get: () => undefined }) } })
    assert.equal(admin.verifyMarketplaceAdminToken('test-admin-secret-123'), true)
    assert.equal(admin.verifyMarketplaceAdminToken('test-admin-secret-124'), false)
    const session = admin.createMarketplaceAdminSession()
    assert.equal(admin.verifyMarketplaceAdminSession(session), true)
    assert.equal(admin.verifyMarketplaceAdminSession(`${session.slice(0, -1)}${session.endsWith('0') ? '1' : '0'}`), false)
    assert.equal(admin.verifyMarketplaceAdminSession('0.' + session.split('.').slice(1).join('.')), false)
    assert.equal(admin.marketplaceAdminCookie.options.httpOnly, true)
    assert.equal(admin.marketplaceAdminCookie.options.sameSite, 'strict')
  } finally {
    if (previous === undefined) delete process.env.MARKETPLACE_ADMIN_TOKEN
    else process.env.MARKETPLACE_ADMIN_TOKEN = previous
  }
})
test('admin login keeps credentials out of URLs and rejects oversized or cross-origin forms', async () => {
  const previous = process.env.MARKETPLACE_ADMIN_TOKEN
  process.env.MARKETPLACE_ADMIN_TOKEN = 'test-admin-secret-123'
  try {
    const { POST } = loadTypescript('src/app/api/admin/session/route.ts', { 'server-only': {}, 'next/headers': { cookies: async () => ({ get: () => undefined }) } })
    const makeRequest = (body, extra = {}) => new Request('http://localhost:3100/api/admin/session', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-forwarded-for': `login-test-${Math.random()}`, ...extra },
      body,
    })
    const valid = await POST(makeRequest('token=test-admin-secret-123'))
    assert.equal(valid.status, 303)
    assert.equal(valid.headers.get('location'), 'http://localhost:3100/admin')
    assert.match(valid.headers.get('set-cookie') ?? '', /HttpOnly/i)
    assert.doesNotMatch(valid.headers.get('location') ?? '', /test-admin-secret/)
    assert.equal((await POST(makeRequest('token=wrong'))).headers.get('set-cookie'), null)
    assert.equal((await POST(makeRequest('token=test-admin-secret-123', { origin: 'https://evil.test' }))).status, 403)
    assert.equal((await POST(makeRequest(`token=${'x'.repeat(5000)}`))).status, 413)
  } finally {
    if (previous === undefined) delete process.env.MARKETPLACE_ADMIN_TOKEN
    else process.env.MARKETPLACE_ADMIN_TOKEN = previous
  }
})
test('legacy Supabase license request refuses email-only issuance', async () => {
  const previous = globalThis.Deno
  let handler
  try {
    globalThis.Deno = { serve(value) { handler = value } }
    loadTypescript('supabase/functions/request-pro-license/index.ts')
    assert.equal((await handler(new Request('https://example.test', { method: 'POST', body: JSON.stringify({ email: 'user@example.test' }) }))).status, 410)
    assert.equal((await handler(new Request('https://example.test'))).status, 405)
    assert.equal((await handler(new Request('https://example.test', { method: 'OPTIONS' }))).status, 200)
  } finally {
    if (previous === undefined) delete globalThis.Deno
    else globalThis.Deno = previous
  }
})
test('accepts every supported common mail provider, including me.com and mac.com', () => {
  for (const domain of ['gmail.com','googlemail.com','hotmail.com','hotmail.es','outlook.com','outlook.es','live.com','live.es','yahoo.com','yahoo.es','icloud.com','me.com','mac.com','proton.me','protonmail.com','aol.com','msn.com']) {
    assert.equal(isValidEmailAddress(`test@${domain}`), true, domain)
  }
  assert.equal(isValidEmailAddress(' Test+tag@Example.org '), true)
})
test('rejects malformed mail local parts and existing typo cases', () => {
  for (const email of ['.test@example.org','test.@example.org','te..st@example.org',`${'a'.repeat(65)}@example.org`,'test@gmial.com','test@','bad']) assert.equal(isValidEmailAddress(email), false, email)
})
const { validateMarketplaceUpload } = loadTypescript('src/lib/marketplaceUpload.ts')
test('upload metadata handles nulls, incorrect types, traversal and fractional sizes', () => {
  for (const input of [null,undefined,{}, {pathname:12}, {pathname:'marketplace-submissions/../bad.zip',contentType:'application/zip',size:20}, {pathname:'marketplace-submissions/file.zip',contentType:'application/zip',size:0.5}]) assert.equal(validateMarketplaceUpload(input).ok, false)
  assert.equal(validateMarketplaceUpload({pathname:'marketplace-submissions/file.zip',contentType:'application/zip',size:20}).ok, true)
})
const { readUploadBody, UploadSizeError } = loadTypescript('src/lib/uploadBody.ts')
const stream = (...chunks) => new ReadableStream({start(controller) {chunks.forEach(chunk=>controller.enqueue(Uint8Array.from(chunk)));controller.close()}})
test('relay enforces actual bytes and rejects both oversized and incomplete uploads', async () => {
  assert.deepEqual(await readUploadBody(stream([1,2],[3]),3), Uint8Array.from([1,2,3]))
  await assert.rejects(readUploadBody(stream([1,2],[3,4]),3),UploadSizeError)
  await assert.rejects(readUploadBody(stream([1,2]),3),UploadSizeError)
})
const { browserStorage } = loadTypescript('src/lib/browserStorage.ts')
test('blocked browser storage never interrupts user actions', () => {
  const previous = globalThis.window
  try {
    globalThis.window = Object.defineProperty({}, 'localStorage', {get() {throw new Error('SecurityError')}})
    assert.equal(browserStorage.getItem('game'),null)
    assert.doesNotThrow(()=>browserStorage.setItem('game','value'))
    assert.doesNotThrow(()=>browserStorage.removeItem('game'))
  } finally {if(previous===undefined)delete globalThis.window;else globalThis.window=previous}
})
const { ROUTES, LEGAL_SLUGS, alternateLocalePath, toInternalPath } = loadTypescript('src/lib/i18n.ts')
test('every public locale route round-trips, including nested archive paths', () => {
  for(const key of Object.keys(ROUTES.es)) {
    if(key==='publicProfile')continue
    assert.equal(toInternalPath(ROUTES.en[key]), ROUTES.es[key], key)
    assert.equal(alternateLocalePath(ROUTES.es[key],'en'), ROUTES.en[key], key)
  }
  for(const page of Object.keys(LEGAL_SLUGS.es)) assert.equal(toInternalPath('/en/legal/'+LEGAL_SLUGS.en[page]),'/legal/'+LEGAL_SLUGS.es[page])
  assert.equal(toInternalPath('/en/wml-1-0/results'),'/wml-1-0/results')
})
const { faroPublishTimestamp } = loadTypescript('src/lib/faro.ts')
test('FARO publishes at 20:00 Madrid in winter, summer and DST transition days', () => {
  assert.equal(faroPublishTimestamp('2026-01-20'),'2026-01-20T19:00:00.000Z')
  assert.equal(faroPublishTimestamp('2026-07-20'),'2026-07-20T18:00:00.000Z')
  assert.equal(faroPublishTimestamp('2026-03-29'),'2026-03-29T18:00:00.000Z')
  assert.equal(faroPublishTimestamp('2026-10-25'),'2026-10-25T19:00:00.000Z')
})
const { addMonths, addDays } = loadTypescript('supabase/functions/_shared/licenseValidation.ts')
test('license months clamp to the target month rather than overflowing into March', () => {
  assert.equal(addMonths(new Date('2026-01-31T14:30:00Z'),1).toISOString(),'2026-02-28T14:30:00.000Z')
  assert.equal(addMonths(new Date('2028-01-31T14:30:00Z'),1).toISOString(),'2028-02-29T14:30:00.000Z')
  assert.equal(addMonths(new Date('2026-12-31T14:30:00Z'),1).toISOString(),'2027-01-31T14:30:00.000Z')
  assert.equal(addDays(new Date('2026-02-28T14:30:00Z'),21).toISOString(),'2026-03-21T14:30:00.000Z')
})
const { isStripeCheckoutSessionId, isPaidMarketplaceSession } = loadTypescript('src/lib/stripeMarketplace.ts')
test('checkout ids must match fully and paid receipts belong to the product and creator', () => {
  assert.equal(isStripeCheckoutSessionId('cs_test_abc123'),true)
  for(const id of ['cs_test_abc/other','cs_live_abc?x=1','cs_test_abc\n','cs_live_'])assert.equal(isStripeCheckoutSessionId(id),false,id)
  const product={id:'p1',stripe_account_id:'acct_1'}
  const receipt={status:'complete',payment_status:'paid',metadata:{marketplace_product_id:'p1',stripe_account_id:'acct_1'}}
  assert.equal(isPaidMarketplaceSession(receipt,product),true)
  assert.equal(isPaidMarketplaceSession(receipt,{...product,id:'p2'}),false)
  assert.equal(isPaidMarketplaceSession({...receipt,payment_status:'unpaid'},product),false)
})
let requestId=0
const request = body => new Request('http://localhost/api/test',{method:'POST',headers:{'content-type':'application/json','x-forwarded-for':`test-${++requestId}`},body:JSON.stringify(body)})
const mocks = {
 '@/lib/marketplaceAvailability': {MARKETPLACE_SUBMISSIONS_ARE_OPEN:true},
 '@/lib/marketplaceStorage': {},
 '@/lib/marketplaceSupabase': {},
 '@/lib/marketplaceEmail': {},
}
for(const route of ['contact','subscribe','faro','pro-license/request','upload','marketplace/products']) {
 test(`${route} rejects invalid JSON shapes before contacting external services`,async()=>{
   const {POST}=loadTypescript(`src/app/api/${route}/route.ts`,mocks)
   for(const body of [null,[],42,{email:42,name:42,message:42,pathname:42}]) {
     const response=await POST(request(body))
     assert.equal(response.status,400,JSON.stringify(body))
     assert.equal(typeof (await response.json()).error,'string')
   }
 })
}
test('leaderboard refuses non-finite scores and keeps the best valid score',async()=>{
 delete globalThis.wmlRoguelikeScoreState
 const {POST}=loadTypescript('src/app/api/blog/roguelike-score/route.ts')
 for(const points of [null,'900',-1,0.5])assert.equal((await POST(request({type:'score',score:{id:'test',name:'Runner',points,floor:1}}))).status,422)
 await POST(request({type:'score',score:{id:'test',name:'Runner',points:900,floor:3}}))
 const response=await POST(request({type:'score',score:{id:'test',name:'Runner',points:100,floor:1}}))
 assert.equal((await response.json()).leaderboard[0].points,900)
 delete globalThis.wmlRoguelikeScoreState
})
for(const file of ['cloudflare/r2-upload-worker.ts','cloudflare/r2-upload-worker.js'])test(`${file} rejects malformed URL escapes`,async()=>{
 const worker=loadTypescript(file).default
 const response=await worker.fetch(new Request('https://worker.example/object/marketplace-covers/%ZZ.png'),{WML_UPLOAD_SECRET:'test-secret'})
 assert.equal(response.status,400)
})

for(const file of ['cloudflare/r2-upload-worker.ts','cloudflare/r2-upload-worker.js'])test(`${file} binds signed uploads to size and type and limits actual bytes`,async()=>{
 const worker=loadTypescript(file).default
 const secret='test-worker-secret'
 const key='marketplace-covers/example.png'
 const expires=Math.floor(Date.now()/1000)+300
 const contentType='image/png'
 const signedUrl=size=>{
   const signature=createHmac('sha256',secret).update(`PUT\n${key}\n${expires}\n${size}\n${contentType}`).digest('hex')
   return `https://worker.example/object/${key}?expires=${expires}&size=${size}&contentType=${encodeURIComponent(contentType)}&signature=${signature}`
 }
 let saved=null
 let deleted=false
 const env={WML_UPLOAD_SECRET:secret,MARKETPLACE_BUCKET:{
   async put(_key,body){saved=new Uint8Array(await new Response(body).arrayBuffer())},
   async delete(){deleted=true},
 }}
 const put=(url,bytes,type=contentType)=>worker.fetch(new Request(url,{method:'PUT',headers:{'Content-Type':type},body:Uint8Array.from(bytes)}),env)
 assert.equal((await put(signedUrl(3),[1,2,3])).status,200)
 assert.deepEqual(saved,Uint8Array.from([1,2,3]))
 assert.equal((await put(signedUrl(2),[1,2,3])).status,413)
 assert.equal((await put(signedUrl(3),[1,2,3],'image/jpeg')).status,400)
 assert.equal((await put(signedUrl(3).replace('size=3','size=4'),[1,2,3])).status,401)
 assert.equal((await put(signedUrl(3),[1,2])).status,400)
 assert.equal(deleted,true)
})

test('game saves restore valid previous data and reject corrupt nested fields',()=>{
 const {makeLevel,sanitizeSavedGame}=loadTypescript('src/app/blog/roguelike/RoguelikeGame.tsx',{},'\nexport {makeLevel,sanitizeSavedGame}\n')
 const saved=JSON.parse(JSON.stringify(makeLevel(1)))
 assert.deepEqual(sanitizeSavedGame(saved),saved)
 for(const broken of [{...saved,seen:null},{...saved,enemies:[{}]},{...saved,tiles:[1]},{...saved,player:{...saved.player,sight:1e20}},{...saved,log:[{}]},{...saved,floorMemory:{1:{}}}])assert.throws(()=>sanitizeSavedGame(broken))
 const legacy={...saved};delete legacy.player.magnet;delete legacy.floorMemory;delete legacy.clearedFloors
 assert.equal(sanitizeSavedGame(legacy).player.magnet,0)
})
