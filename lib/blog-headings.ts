import type { Root, Element, RootContent } from 'hast'
export type BlogHeading = { id: string; text: string; depth: number }
export function blogDate(value: string, lang: string) {
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
      }).format(date)
}
const textContent = (node: RootContent): string =>
  'value' in node && typeof node.value === 'string'
    ? node.value
    : 'children' in node
      ? node.children.map(child => textContent(child)).join('')
      : ''
/** Build IDs and the outline from the compiled tree, not a second Markdown regex. */
export function rehypeBlogHeadings({ headings }: { headings: BlogHeading[] }) {
  return (tree: Root) => {
    const counts = new Map<string, number>()
    const visit = (node: Root | Element) => {
      for (const child of node.children) {
        if (child.type !== 'element') continue
        if (/^h[1-6]$/.test(child.tagName)) {
          if (child.tagName === 'h1') child.tagName = 'h2'
          const text = textContent(child).trim(),
            base =
              text
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/[^\p{L}\p{N}]+/gu, '-')
                .replace(/^-|-$/g, '') || 'section'
          const count = (counts.get(base) || 0) + 1
          counts.set(base, count)
          const id = count === 1 ? base : `${base}-${count}`
          child.properties.id = id
          if (child.tagName === 'h2' || child.tagName === 'h3')
            headings.push({ id, text, depth: Number(child.tagName[1]) })
        }
        visit(child)
      }
    }
    visit(tree)
  }
}
