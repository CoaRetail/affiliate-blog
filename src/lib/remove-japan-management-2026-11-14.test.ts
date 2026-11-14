import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))

const ENDED_NAME = 'ジャパンマネジメント'
const ENDED_A8MAT = 'a8mat=4B1G9M+5L8KSI+3V6A+5YJRM'
const NEEDLES = [ENDED_NAME, ENDED_A8MAT, '5L8KSI']

const TEXT_EXT = new Set([
  '.md',
  '.mdx',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.html',
  '.json',
  '.css',
  '.txt',
  '.yml',
  '.yaml',
  '.csv',
])

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    const info = statSync(path)
    if (info.isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

function scopedFiles(folder: string): string[] {
  return walk(join(root, folder)).filter((path) => {
    const dot = path.lastIndexOf('.')
    return dot !== -1 && TEXT_EXT.has(path.slice(dot))
  })
}

test('ended ジャパンマネジメント A8 program is absent from public/ and content/', () => {
  for (const folder of ['public', 'content'] as const) {
    for (const path of scopedFiles(folder)) {
      const body = readFileSync(path, 'utf8')
      for (const needle of NEEDLES) {
        assert.equal(
          body.includes(needle),
          false,
          `${relative(root, path)} still contains ${needle}`,
        )
      }
    }
  }
})

test('other factoring A8 codes on the LP stay after ジャパンマネジメント removal', () => {
  const lp = readFileSync(join(root, 'public/factoring-lp.html'), 'utf8')
  const data = readFileSync(join(root, 'public/factoring-data.js'), 'utf8')
  const kept = [
    'a8mat=3N82JP+4YM3SY+4HV8+5YJRM',
    'a8mat=3N83C4+6J6A9U+4OPW+5YRHE',
    'a8mat=3N81RK+6JRPVM+4S8A+5YJRM',
  ]
  for (const mat of kept) {
    assert.equal(lp.includes(mat) || data.includes(mat), true, `missing ${mat}`)
  }
  assert.equal(lp.includes('株式会社アクシアプラス'), true)
  assert.equal(data.includes('株式会社アクシアプラス'), true)
})
