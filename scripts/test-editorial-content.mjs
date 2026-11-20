import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import matter from 'gray-matter'
const posts = [
  'ascii-cube-journey',
  'nixos-2026-reproducible',
  'automated-testing-framework'
]
for (const slug of posts) {
  const versions = ['fr', 'en'].map(lang =>
    matter(readFileSync(`data/posts/${lang}/${slug}.mdx`, 'utf8'))
  )
  for (const post of versions) assert.equal(post.data.updated, '2026-11-20')
  const outline = post =>
    [...post.content.matchAll(/^(#{2,3}) /gm)].map(m => m[1].length)
  assert.deepEqual(
    outline(versions[0]),
    outline(versions[1]),
    `${slug}: both languages cover the same sections`
  )
  const external = post =>
    [
      ...new Set(
        [...post.content.matchAll(/\]\((https?:[^)]+|mailto:[^)]+)\)/g)].map(
          m => m[1]
        )
      )
    ].sort()
  assert.deepEqual(
    external(versions[0]),
    external(versions[1]),
    `${slug}: translated articles retain their sources`
  )
}
// The old article showed a fictional Rust quaternion implementation. Keep the
// documented frontend inertia function tied to the implementation it explains.
const source = readFileSync('lib/cube-orientation.ts', 'utf8')
const actual = source.match(/export function coast\([\s\S]*?^\}/m)[0].trim()
for (const lang of ['fr', 'en']) {
  const post = readFileSync(`data/posts/${lang}/ascii-cube-journey.mdx`, 'utf8')
  const snippet = post.match(/```typescript\n([\s\S]*?)\n```/)[1].trim()
  assert.equal(
    snippet,
    actual,
    `${lang}: the inertia example matches the frontend source`
  )
}
console.log(
  'PASS: bilingual article structure, dates, source links and actual inertia code'
)
