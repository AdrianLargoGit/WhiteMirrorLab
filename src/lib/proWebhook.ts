import { createHmac, timingSafeEqual } from 'node:crypto'

export function verifyProWebhook(body: string, header: string | null, secret: string, now = Date.now()) {
  if (!header || !secret) return false
  const entries = header.split(',').map(entry => entry.trim().split('='))
  const timestamp = entries.find(([key]) => key === 't')?.[1]
  if (!timestamp || !/^\d+$/.test(timestamp) || Math.abs(now / 1000 - Number(timestamp)) > 300) return false
  const expected = createHmac('sha256', secret).update(`${timestamp}.${body}`).digest()
  return entries.some(([key, value]) => key === 'v1' && /^[a-f0-9]{64}$/.test(value ?? '') && timingSafeEqual(expected, Buffer.from(value, 'hex')))
}
