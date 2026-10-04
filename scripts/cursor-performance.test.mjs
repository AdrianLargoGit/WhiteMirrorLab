import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function load(path, require, globals = {}) {
  const compiledModule = { exports: {} }
  const code = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  vm.runInNewContext(code, { module: compiledModule, exports: compiledModule.exports, require, ...globals })
  return compiledModule.exports
}

function harness(iframe = false) {
  let cleanup, hitTests = 0, lookups = 0, writes = 0, nextId = 1
  const frames = new Map(), listeners = new Map(), classes = new Set()
  const styles = { hover: 'hover', brush: 'brush', visible: 'visible', cursor: 'cursor' }
  const cursor = {
    classList: { add: value => classes.add(value), remove: value => classes.delete(value), toggle: (value, active) => active ? classes.add(value) : classes.delete(value) },
    style: { set transform(value) { this.value = value; writes++ } },
  }
  class Element {
    constructor(mode) { this.mode = mode; this.capture = false }
    closest(selector) { lookups++; return (selector.includes('data-cursor') ? this.mode === 'brush' : this.mode === 'hover') ? this : null }
    hasPointerCapture() { return this.capture }
  }
  let surface = new Element('normal')
  const events = name => ({
    addEventListener: (event, fn) => listeners.set(`${name}:${event}`, fn),
    removeEventListener: event => listeners.delete(`${name}:${event}`),
  })
  const window = {
    ...events('window'), matchMedia: () => ({ matches: true }),
    requestAnimationFrame: fn => { const id = nextId++; frames.set(id, fn); return id },
    cancelAnimationFrame: id => frames.delete(id), setTimeout() {},
  }
  const document = {
    ...events('document'), documentElement: { classList: { add() {}, remove() {} } },
    getElementById: id => id === 'wml-cursor' ? cursor : null,
    elementFromPoint: () => { hitTests++; return surface },
    body: { classList: { toggle() {} } },
  }
  const globals = { window, document, Element }
  const hotspots = load('src/lib/cursor.ts', () => ({})).CURSOR_HOTSPOTS
  const jsx = (type, props) => typeof type === 'function' ? type(props) : { type, props }
  const require = name => {
    if (name === 'react') return { useRef: () => ({ current: cursor }), useEffect: fn => { cleanup = fn() } }
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx }
    if (name === '@/lib/cursor') return { CURSOR_HOTSPOTS: hotspots }
    return { default: styles }
  }
  if (iframe) {
    const tree = load('src/app/blog/AdPosterBackground.tsx', require).default({ locale: 'es' })
    const html = tree.props.children[0].props.children.props.srcDoc
    vm.runInNewContext(html.match(/<script>\s*([\s\S]*?)<\/script>/)[1], globals)
  } else load('src/components/CustomCursor.tsx', require, globals).default({ priority: true })
  return {
    Element, hotspots, classes, frames, listeners,
    move(target, x = 100, y = 100) { listeners.get('window:pointermove')({ target, clientX: x, clientY: y, pointerId: 1 }) },
    flush() { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()) },
    scroll(target) { surface = target; listeners.get('document:scroll')() },
    hit(target) { surface = target }, cleanup: () => cleanup(),
    get hitTests() { return hitTests }, get lookups() { return lookups }, get writes() { return writes },
    get transform() { return cursor.style.value },
  }
}

for (const iframe of [false, true]) {
  test(`${iframe ? 'iframe' : 'page'}: batches movement without repeated hit tests; preserves hover geometry`, () => {
    const h = harness(iframe), normal = new h.Element('normal'), button = new h.Element('hover')
    for (let i = 0; i < 1000; i++) h.move(normal, i, i)
    assert.equal(h.frames.size, 1)
    h.flush()
    assert.equal(h.hitTests, 0)
    assert.ok(h.lookups <= 2)
    assert.equal(h.writes, 1)
    assert.equal(h.transform.replace(/,\s*/g, ','), `translate3d(${999 - h.hotspots.normal.x}px,${999 - h.hotspots.normal.y}px,0) scaleX(-1)`)
    h.move(button); h.flush()
    assert.ok(h.classes.has('hover'))
    assert.equal(h.transform.replace(/,\s*/g, ','), `translate3d(${100 - h.hotspots.hover.x}px,${100 - h.hotspots.hover.y}px,0) scaleX(1)`)
    const writes = h.writes
    h.move(button); h.flush()
    assert.equal(h.writes, writes)
    h.scroll(normal); h.flush()
    assert.equal(h.hitTests, 1)
    assert.ok(!h.classes.has('hover'))
  })
}

test('brush stays on the canvas; capture, scroll, and cleanup work', () => {
  const h = harness(), canvas = new h.Element('brush'), normal = new h.Element('normal')
  h.move(canvas); h.flush()
  assert.ok(h.classes.has('brush'))
  assert.equal(h.transform, 'translate3d(99px, 81px, 0) scaleX(1)')
  canvas.capture = true
  h.hit(normal); h.move(canvas); h.flush()
  assert.ok(!h.classes.has('brush'))
  assert.equal(h.hitTests, 1)
  h.scroll(canvas); h.flush()
  assert.ok(h.classes.has('brush'))
  h.move(canvas)
  h.cleanup()
  assert.equal(h.frames.size, 0)
  assert.equal(h.listeners.size, 0)
})
