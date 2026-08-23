import { existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const evidenceRoot = join(root, 'public', 'blog-evidence')

const rejectPatterns = [
  /avatar/i,
  /banner/i,
  /cmp4ech/i,
  /facebook|instagram|linkedin|twitter|youtube/i,
  /favicon|icon|logo|shield/i,
  /gravatar/i,
  /great-train|identity-parade|kings-bench|recruiting|telephone-crackers|theft-worl/i,
  /lights-caravan|police-cars-sirens/i,
  /ott-rightrail/i,
  /scrivi/i,
]

const keepByCase = [
  {
    test: /^the-doodler\/assets\//i,
    keep: /doodler|sfpd|sketch|reward|cold.?case|screen.?shot.*2019|age.?progression/i,
  },
]

function walk(dir) {
  for (const item of readdirSync(dir)) {
    const filePath = join(dir, item)
    const stats = statSync(filePath)
    if (stats.isDirectory()) {
      walk(filePath)
      continue
    }

    const rel = relative(evidenceRoot, filePath).replaceAll('\\', '/')
    if (!rel.includes('/assets/')) continue
    const caseRule = keepByCase.find((rule) => rule.test.test(rel))
    const rejectedByCaseRule = caseRule ? !caseRule.keep.test(basename(rel)) : false
    const rejectedByGenericRule = rejectPatterns.some((pattern) => pattern.test(rel))
    if (!rejectedByCaseRule && !rejectedByGenericRule) continue
    rmSync(filePath)
    console.log(`removed ${rel}`)
  }
}

if (existsSync(evidenceRoot)) {
  walk(evidenceRoot)
}
