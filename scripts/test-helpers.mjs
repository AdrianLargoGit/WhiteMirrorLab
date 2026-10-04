import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import Module from 'node:module'
import ts from 'typescript'

// Load the real TypeScript modules in memory; services can be replaced at their boundary.
export function loadTypescript(relative, mocks = {}, suffix = '') {
  const cache = new Map()
  const root = path.resolve(import.meta.dirname, '..')
  function load(filename, extra = '') {
    if (cache.has(filename)) return cache.get(filename).exports
    const source = readFileSync(filename, 'utf8') + extra
    const code = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText
    const mod = new Module(filename)
    mod.filename = filename
    mod.paths = Module._nodeModulePaths(path.dirname(filename))
    cache.set(filename, mod)
    const nativeRequire = mod.require.bind(mod)
    mod.require = request => {
      if (request in mocks) return mocks[request]
      if (request.endsWith('.css')) return {}
      const base = request.startsWith('@/') ? path.join(root, 'src', request.slice(2))
        : request.startsWith('.') ? path.resolve(path.dirname(filename), request) : null
      if (base) {
        const target = [base, base + '.ts', base + '.tsx'].find(file => existsSync(file))
        if (target) return load(target)
      }
      return nativeRequire(request)
    }
    mod._compile(code, filename)
    return mod.exports
  }
  return load(path.resolve(root, relative), suffix)
}
