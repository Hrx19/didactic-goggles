import { rmSync, cpSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const source = resolve(__dirname, 'dist')
const target = resolve(__dirname, '../../frontend/dist')

rmSync(target, { recursive: true, force: true })
cpSync(source, target, { recursive: true })
