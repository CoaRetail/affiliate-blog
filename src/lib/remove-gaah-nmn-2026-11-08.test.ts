import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))
const self = fileURLToPath(import.meta.url)

/** A8 code for 医療従事者が推奨するNMNサプリ No.1【GAAH】, identified in the 2026-09-20 link audit as gaah.co.jp/pages/gaah-nmn-r-a8. */
const GAAH_A8MAT = '4B1FHJ+7YDKAQ+4P4W+C2O5E'
const GAAH_NEEDLES = [GAAH_A8MAT, '4P4W', 'gaah.co.jp', 'gaah-nmn', 's00000021920']

const TEXT_EXT = new Set([
  '.md',
  '.mdx',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.py',
  '.html',
  '.json',
  '.css',
  '.txt',
  '.yml',
  '.yaml',
  '.csv',
])

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'coverage'])

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const path = join(dir, name)
    const info = statSync(path)
    if (info.isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

function readText(path: string): string {
  return readFileSync(path, 'utf8')
}

const sourceFiles = walk(root).filter((path) => {
  if (path === self) return false
  const dot = path.lastIndexOf('.')
  return dot !== -1 && TEXT_EXT.has(path.slice(dot))
})

test('ended GAAH NMN affiliate code and tracking id are absent from site source', () => {
  for (const path of sourceFiles) {
    const body = readText(path)
    for (const needle of GAAH_NEEDLES) {
      assert.equal(
        body.includes(needle),
        false,
        `${relative(root, path)} still contains ${needle}`,
      )
    }
    assert.equal(
      body.includes(`0.gif?a8mat=${GAAH_A8MAT}`),
      false,
      `${relative(root, path)} still has a GAAH tracking pixel`,
    )
  }
})

test('other A8 codes stay, including a different NMN program', () => {
  const sleepGuide = readText(join(root, 'public/sleep-guide.html'))
  assert.equal(sleepGuide.includes('a8mat=4AZS0Q+FLFTS2+4KU6+ZRXQP'), true)
  assert.equal(sleepGuide.includes('ブレインスリープNMN9000'), true)

  const kagaku = readText(join(root, 'content/posts/sleep/kagaku-teki-suimin-kaizen.md'))
  const alaplas = kagaku.match(/a8mat=4AZS0R\+691WZM\+43JO\+NTJWY/g) ?? []
  assert.equal(alaplas.length, 2)

  const josei = readText(join(root, 'content/posts/sleep/josei-suimin-supplement.md'))
  assert.equal(josei.includes('https://amzn.to/4cfAMrL'), true)

  const ibiki = readText(join(root, 'content/posts/sleep/ibiki-genin-taisaku.md'))
  assert.equal(ibiki.includes('https://amzn.to/4c9wbXX'), true)
  assert.equal(ibiki.includes('サプリで喉の筋肉をサポートする]('), false)

  const generator = readText(join(root, 'generate_sleep_articles.py'))
  assert.equal(generator.includes('a8mat=4B1FHJ+9QODMQ+4614+5YJRM'), true)
  assert.equal(generator.includes('a8mat=4AZS0R+691WZM+43JO+NTJWY'), true)
  assert.equal(generator.includes('a8_nmn'), false)

  const otherNmn = readText(join(root, 'content/posts/health/nmn-supplement-effects.mdx'))
  assert.equal(otherNmn.includes('NMN'), true)
})

test('inline GAAH anchors were unwrapped and standalone CTAs removed', () => {
  const sanji = readText(join(root, 'content/posts/sleep/sanji-me-sameru-nmn.md'))
  assert.match(sanji, /NAD\+を補うNMNサプリを併用することで/)
  assert.equal(sanji.includes('高純度NMNサプリの詳細はこちら'), false)

  const hirune = readText(join(root, 'content/posts/sleep/hirune-nanpun-app.md'))
  assert.match(hirune, /睡眠サポートサプリとの併用も検討してみてください/)

  const asa = readText(join(root, 'content/posts/sleep/asa-darui-nmn.md'))
  assert.equal(asa.includes('高純度NMNサプリの詳細を見る'), false)
  assert.equal(asa.includes('**[高純度NMN'), false)
})
