import { exit } from 'node:process'
import { $, argv, cd } from 'zx'

cd(argv._[0])

async function testRun(command) {
  console.log(`Running: ${command}`)
  const p = $(command)
  for await (const chunk of p.stdout) {
    if (chunk.includes('err')) {
      console.error(`Error: ${chunk}`)
      exit(1)
    }
  }
}

async function main() {
  console.log('Running tests')
  await Promise.all([
    'pnpm export',
    'pnpm build',
  ].map(testRun))
  console.log('All tests passed')
}

await main()
