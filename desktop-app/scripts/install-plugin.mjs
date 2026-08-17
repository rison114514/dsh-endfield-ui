import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { delimiter, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const appDir = resolve(here, '..')
const projectRoot = resolve(appDir, '..')
const pluginDir = resolve(projectRoot, 'endfield-ui-plugin')
const config = JSON.parse(readFileSync(resolve(appDir, 'app.config.json'), 'utf8'))
const localBin = resolve(homedir(), '.local', 'bin')
const command = [
  process.env.DSH_BIN,
  resolve(localBin, 'dsh'),
  '/opt/homebrew/bin/dsh',
  '/usr/local/bin/dsh',
].filter(Boolean).find(existsSync)

if (!command) throw new Error('找不到本机 dsh，请先安装 @deepseek-ai/dsh。')

const result = spawnSync(command, ['plugin', '--profile', 'web', 'add', pluginDir], {
  cwd: existsSync(config.workspace) ? config.workspace : homedir(),
  env: {
    ...process.env,
    PATH: [localBin, '/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', '/bin', process.env.PATH]
      .filter(Boolean).join(delimiter),
  },
  encoding: 'utf8',
  stdio: 'inherit',
})

if (result.error) throw result.error
process.exit(result.status ?? 1)
