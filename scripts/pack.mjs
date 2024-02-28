import { join } from "node:path"
import process from "node:process"
import { $, cd, fs } from "zx"

const PKG_ROOT = '/temp/slidev-pkgs'

const WORKSPACE_ROOT = process.cwd()

const packages = {
  'types': './packages/types',
  'parser': './packages/parser',
  'cli': './packages/slidev',
  'client': './packages/client',
}

async function replaceDeps() {
  cd(WORKSPACE_ROOT)
  for (const path of Object.values(packages)) {
    console.log('[pack] replaceDeps', path)
    const pkgJson = JSON.parse(await fs.readFile(`${path}/package.json`, 'utf-8'))
    for (const name in packages) {
      const pkg = `@slidev/${name}`
      if (pkgJson.dependencies?.[pkg])
        pkgJson.dependencies[pkg] = `file:${PKG_ROOT}/${name}.tgz`
      if (pkgJson.devDependencies?.[pkg])
        pkgJson.devDependencies[pkg] = `file:${PKG_ROOT}/${name}.tgz`
    }
    await fs.writeFile(`${path}/package.json`, JSON.stringify(pkgJson, null, 2))
  }
}

async function pack() {
  await replaceDeps()
  await fs.mkdir(PKG_ROOT, { recursive: true })
  for (const [name, path] of Object.entries(packages)) {
    console.log('[pack] pack', path)
    cd(join(WORKSPACE_ROOT, path))
    const { stdout } = await $`pnpm pack`
    await fs.move(stdout.trim(), `${PKG_ROOT}/${name}.tgz`)
  }
}

console.log('[pack] start packing...')
await pack()
console.log('[pack] done')
