import { corsHeaders, jsonResponse } from '../_shared/pro-license.ts'

declare const Deno: {
  serve(handler: (request: Request) => Response | Promise<Response>): void
}

Deno.serve((request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405)
  }

  return jsonResponse({ ok: false, error: 'use_stripe_checkout' }, 410)
})
