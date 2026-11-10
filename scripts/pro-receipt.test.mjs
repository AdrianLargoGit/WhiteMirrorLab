import { test } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { loadTypescript } from './test-helpers.mjs'

const flush = () => new Promise(resolve => setImmediate(resolve))
const pending = () => new Response(JSON.stringify({ ok: false, error: 'payment_pending' }), { status: 409 })

function receipt(t, lang = 'es') {
  const state = []
  const effects = []
  const timers = new Map()
  let now = 0, index = 0, nextTimer = 0
  const previousWindow = globalThis.window
  globalThis.window = {
    setTimeout(fn, delay) { const id = ++nextTimer; timers.set(id, { fn, at: now + delay }); return id },
    clearTimeout(id) { timers.delete(id) },
  }
  t.after(() => { globalThis.window = previousWindow })
  t.mock.method(performance, 'now', () => now)
  const Receipt = loadTypescript('src/app/pro/receipt/ProReceipt.tsx', {
    react: { ...React, useEffect(fn) { effects.push(fn) }, useRef: () => ({ current: false }),
      useState(initial) { const slot = index++; if (!(slot in state)) state[slot] = initial
        return [state[slot], value => { state[slot] = typeof value === 'function' ? value(state[slot]) : value }] },
    },
    'next/link': ({ children, ...props }) => React.createElement('a', props, children),
  }).default
  const render = () => { index = 0; effects.length = 0; return Receipt({ lang }) }
  render()
  return { state, timers, render, effects,
    async advance(ms) {
      const target = now + ms
      for (;;) {
        const next = [...timers.entries()].filter(([, timer]) => timer.at <= target).sort((a, b) => a[1].at - b[1].at)[0]
        if (!next) break
        now = next[1].at; timers.delete(next[0]); next[1].fn(); await flush()
      }
      now = target; await flush()
    },
  }
}

function findButton(node) {
  if (!node || typeof node !== 'object') return null
  if (node.type === 'button') return node
  for (const child of React.Children.toArray(node.props?.children)) {
    const found = findButton(child)
    if (found) return found
  }
  return null
}

test('receipt stops pending checks after one minute, explains the delay, and manual retry restarts them', async t => {
  const view = receipt(t)
  let requests = 0
  t.mock.method(globalThis, 'fetch', async () => { requests++; return pending() })
  let cleanup = view.effects[0]()
  await flush()
  assert.equal(view.state[0], 'pending')
  await view.advance(60_000)
  assert.equal(view.state[0], 'delayed')
  assert.equal(view.timers.size, 0)
  const tree = view.render()
  assert.match(renderToStaticMarkup(tree), /Hemos detenido la comprobación automática/)
  const stoppedAt = requests
  await view.advance(300_000)
  assert.equal(requests, stoppedAt)
  findButton(tree).props.onClick()
  cleanup(); view.render(); cleanup = view.effects[0]()
  await flush()
  assert.equal(view.state[0], 'pending')
  assert.equal(requests, stoppedAt + 1)
  cleanup()
  assert.equal(view.timers.size, 0)
})

test('receipt times out a stalled request without overlapping polls or hanging on checking', async t => {
  const view = receipt(t, 'en')
  let requests = 0
  t.mock.method(globalThis, 'fetch', (_url, { signal }) => {
    requests++
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }))
  })
  const cleanup = view.effects[0]()
  await view.advance(14_999)
  assert.equal(requests, 1)
  assert.equal(view.state[0], 'checking')
  await view.advance(1)
  assert.equal(view.state[0], 'delayed')
  assert.match(renderToStaticMarkup(view.render()), /Automatic checks have stopped/)
  cleanup()
  assert.equal(view.timers.size, 0)
})

test('a confirmed receipt becomes ready immediately and stops polling', async t => {
  const view = receipt(t)
  let requests = 0
  t.mock.method(globalThis, 'fetch', async () => { requests++; return new Response(JSON.stringify({ ok: true, trial: true, invoiceId: 'in_trial' })) })
  const cleanup = view.effects[0]()
  await flush()
  assert.equal(view.state[0], 'ready')
  await view.advance(60_000)
  assert.equal(requests, 1)
  cleanup()
})
