// Builds the dsh package and the Codex plugin: compiles the mod's almanac, horoscope and slip code
// (hooks/*.ts, the same files the Claude Code mod runs) to plain JavaScript in
// packages/dsh/vendor and plugins/codex/vendor, with the vendored lunar-javascript and its license. A
// package installed into a dsh profile cannot reach files outside itself.
// With --pack it also packs the release tarball into dist/.
//
// Run: node scripts/build-dsh.mjs [--pack]
// TypeScript is found as the `typescript` package, or at $TYPESCRIPT_PATH.
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = join(root, 'packages', 'dsh')
const vendor = join(pkg, 'vendor')
const require = createRequire(import.meta.url)
const ts = require(process.env.TYPESCRIPT_PATH || 'typescript')

// The shared core: everything but the Claude Code hooks module.
const CORE = ['almanac', 'art', 'day', 'flavor', 'fortune', 'horoscope', 'i18n', 'mercury', 'seed']

/** Compiles the shared core into `<dest>/core`, with lunar-javascript and its license. */
function buildCore(dest) {
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(join(dest, 'core', 'vendor'), { recursive: true })
  for (const name of CORE) {
    const source = readFileSync(join(root, 'hooks', `${name}.ts`), 'utf8')
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false },
      fileName: `${name}.ts`,
    })
    // Node resolves ES modules by their full file name.
    const js = outputText.replace(/from '(\.\/[^']+?)(?<!\.js)'/g, "from '$1.js'")
    writeFileSync(join(dest, 'core', `${name}.js`), `// Built from hooks/${name}.ts by scripts/build-dsh.mjs. Do not edit.\n${js}`)
  }
  copyFileSync(join(root, 'hooks', 'vendor', 'lunar.js'), join(dest, 'core', 'vendor', 'lunar.js'))
  copyFileSync(join(root, 'hooks', 'vendor', 'LICENSE-lunar-javascript'), join(dest, 'core', 'vendor', 'LICENSE-lunar-javascript'))
}

buildCore(vendor)

// The Codex plugin: the same core, and the dsh plugin's operations (one
// store, one set of texts), committed so Codex can install from the repository.
const codex = join(root, 'plugins', 'codex', 'vendor')
buildCore(codex)
const ops = readFileSync(join(pkg, 'src', 'almanac.js'), 'utf8').replaceAll("'../vendor/core/", "'./core/")
writeFileSync(join(codex, 'almanac.js'), `// Copied from packages/dsh/src/almanac.js by scripts/build-dsh.mjs. Do not edit.\n${ops}`)
copyFileSync(join(root, 'LICENSE'), join(pkg, 'LICENSE'))

if (process.argv.includes('--pack')) {
  const dist = join(root, 'dist')
  mkdirSync(dist, { recursive: true })
  const out = execFileSync('npm', ['pack', '--pack-destination', dist], { cwd: pkg, encoding: 'utf8' })
  const packed = join(dist, out.trim().split('\n').at(-1))
  // The same tarball under a name without the version: the dsh plugin list
  // installs releases/latest/download/dsh-dev-almanac.tgz, so every release
  // of this repository must carry it, or installs from the store fail.
  const latest = join(dist, 'dsh-dev-almanac.tgz')
  copyFileSync(packed, latest)
  process.stdout.write(`packed ${packed}\nand ${latest}\n`)
} else {
  process.stdout.write(`built ${vendor}\n`)
}
