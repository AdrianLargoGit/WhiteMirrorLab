import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

// Run the real component with a deterministic clock and hook lifecycle.
// No advertisement network requests or browser file uploads are involved.
function harness() {
  let now = 0, cursor = 0, tick, tree, complete = 0
  const hooks = [], effects = [], listeners = new Map()
  const props = { lang: 'es', ready: false, onComplete: () => complete++ }
  const dialog = { open: false, showModal() { this.open = true }, close() { this.open = false } }
  const document = { hidden: false, body: { style: { overflow: 'auto' } }, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) }
  const hooksApi = {
    useRef(value) { const index = cursor++; return hooks[index] ??= { current: value } },
    useState(value) {
      const index = cursor++
      hooks[index] ??= { value }
      return [hooks[index].value, next => { hooks[index].value = typeof next === 'function' ? next(hooks[index].value) : next }]
    },
    useEffect(fn, deps) {
      const index = cursor++, previous = hooks[index]
      if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
        hooks[index] = { deps, cleanup: previous?.cleanup }
        effects.push(() => { hooks[index].cleanup?.(); hooks[index].cleanup = fn() })
      }
    },
  }
  const jsx = (type, props) => ({ type, props })
  const compiledModule = { exports: {} }
  const code = ts.transpileModule(readFileSync(new URL('../src/app/safefile/DownloadGate.tsx', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  vm.runInNewContext(code, {
    module: compiledModule, exports: compiledModule.exports,
    require: name => name === 'react' ? hooksApi : name === 'react/jsx-runtime' ? { jsx, jsxs: jsx } : {},
    performance: { now: () => now }, document,
    window: { setInterval: fn => { tick = fn; return 1 }, clearInterval: () => { tick = null } },
  })
  const render = () => {
    cursor = 0
    tree = compiledModule.exports.default(props)
    tree.props.ref.current = dialog
    effects.splice(0).forEach(effect => effect())
  }
  render()
  return {
    document, dialog,
    get complete() { return complete },
    get tree() { return tree },
    advance(ms) { now += ms; tick?.(); render() },
    visibility(hidden) { document.hidden = hidden; listeners.get('visibilitychange')(); render() },
    ready() { props.ready = true; render() },
    unmount() { hooks.forEach(hook => hook.cleanup?.()) },
    get timerActive() { return Boolean(tick) },
  }
}

test('download waits for five visible seconds, pauses in background and completes once', () => {
  const app = harness()
  assert.equal(app.dialog.open, true)
  let cancelled = false
  app.tree.props.onCancel({ preventDefault() { cancelled = true } })
  assert.equal(cancelled, true)
  app.ready()
  app.advance(2000)
  app.visibility(true)
  app.advance(60000)
  assert.equal(app.complete, 0)
  app.visibility(false)
  app.advance(2999)
  assert.equal(app.complete, 0)
  app.advance(1)
  assert.equal(app.complete, 1)
  app.advance(1000)
  assert.equal(app.complete, 1)
  app.unmount()
  assert.equal(app.dialog.open, false)
  assert.equal(app.document.body.style.overflow, 'auto')
  assert.equal(app.timerActive, false)
})

test('completed wait cannot download an unfinished file or finish while hidden; reload restarts wait', () => {
  const app = harness()
  app.advance(5000)
  assert.equal(app.complete, 0)
  app.visibility(true)
  app.ready()
  assert.equal(app.complete, 0)
  app.visibility(false)
  assert.equal(app.complete, 1)
  app.unmount()
  const fresh = harness()
  fresh.ready()
  fresh.advance(4999)
  assert.equal(fresh.complete, 0)
  fresh.unmount()
})
