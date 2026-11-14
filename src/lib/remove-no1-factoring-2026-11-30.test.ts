import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))

const ENDED_NAME = '株式会社No.1'
const ENDED_MATS = [
  'a8mat=4B1G9M+5GH3YA+4EKW+TRVYQ',
  'a8mat=4B1G9M+5GH3YA+4EKW+TS3OI',
] as const
const AXIA_HREF = 'https://px.a8.net/svt/ejp?a8mat=3N82JP+4YM3SY+4HV8+5YJRM'
const NEEDLES = [ENDED_NAME, '5GH3YA', ...ENDED_MATS, 's00000020552001008000', '260408218337']

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

test('ended 株式会社No.1 A8 program is absent from public/ and content/', () => {
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

test('footer CTA and cost-focused diagnosis reuse the existing アクシアプラス A8 href', () => {
  const lp = readFileSync(join(root, 'public/factoring-lp.html'), 'utf8')
  const data = readFileSync(join(root, 'public/factoring-data.js'), 'utf8')

  assert.equal(lp.includes(AXIA_HREF), true)
  assert.equal(data.includes('a8mat=3N82JP+4YM3SY+4HV8+5YJRM'), true)
  assert.match(
    lp,
    /event_label:'株式会社アクシアプラス',cta_location:'footer_cta'/,
  )
  assert.match(lp, /株式会社アクシアプラスに無料相談する/)
  assert.match(
    lp,
    /name: '株式会社アクシアプラス',[\s\S]*url: 'https:\/\/px\.a8\.net\/svt\/ejp\?a8mat=3N82JP\+4YM3SY\+4HV8\+5YJRM'/,
  )

  const fallbackNames = [...lp.matchAll(/<td class="company-name">([^<]+)/g)].map(
    (match) => match[1],
  )
  assert.equal(fallbackNames[0], '株式会社アクシアプラス')
  assert.equal(data.trimStart().startsWith("document.addEventListener"), true)
  assert.match(data, /name: '株式会社アクシアプラス'/)
})
