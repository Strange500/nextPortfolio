/** Reading chapters are independent of the six physical cube faces. */
export const portfolioSections = [
  'intro',
  'rust',
  'testing',
  'nix',
  'bitcoin',
  'missions',
  'contact'
] as const
export function portfolioLabel(id: string, lang: 'fr' | 'en') {
  const labels: Record<string, [string, string]> = {
    intro: ['Accueil', 'Intro'],
    rust: ['Rust / WASM', 'Rust / WASM'],
    nix: ['NixOS', 'NixOS'],
    testing: ['Expérience', 'Experience'],
    bitcoin: ['Bitcoin', 'Bitcoin'],
    missions: ['Projets', 'Projects'],
    contact: ['Contact', 'Contact']
  }
  return labels[id]?.[lang === 'fr' ? 0 : 1] || id
}
