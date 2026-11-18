import { technologies } from './technologies'

export const additionalCubeTechnologies = [
  'WebAssembly',
  'Nix',
  'Home Manager',
  'Maven',
  'Bitcoin'
]
export const cubeTechnologyNames = [
  ...technologies.map(t => t.name),
  ...additionalCubeTechnologies
]
export const contextTechnologies: Record<string, string[]> = {
  intro: cubeTechnologyNames,
  rust: ['Rust', 'WebAssembly', 'NextJS', 'React'],
  nix: ['NixOS', 'Nix', 'Home Manager', 'Linux'],
  testing: ['Java EE', 'Spring Boot', 'Selenium', 'Maven'],
  bitcoin: ['Rust', 'Bitcoin', 'Nix'],
  missions: ['Rust', 'NixOS', 'Spring Boot', 'Bitcoin'],
  contact: []
}
const notes: Record<string, Record<string, [string, string]>> = {
  rust: {
    Rust: ['Moteur du cube', 'Cube rendering engine'],
    WebAssembly: ['Exécution dans le navigateur', 'Browser execution'],
    NextJS: ['Intégration au portfolio', 'Portfolio integration'],
    React: ['Interface et états', 'Interface and state']
  },
  nix: {
    NixOS: ['Configuration des machines', 'Host configurations'],
    Nix: ['Flake reproductible', 'Reproducible flake'],
    'Home Manager': ['Environnement utilisateur', 'User environment'],
    Linux: ['Système des hôtes', 'Host operating system']
  },
  testing: {
    'Java EE': ['Langage du moteur de tests', 'Test-engine language'],
    'Spring Boot': ['Moteur et API REST', 'Engine and REST API'],
    Selenium: ['Parcours E2E navigateur', 'Browser E2E journeys'],
    Maven: ['Exécution et rapports CI', 'CI execution and reports']
  },
  bitcoin: {
    Rust: ['min-btc-node et pico-ledger', 'min-btc-node and pico-ledger'],
    Bitcoin: ['Protocole et signatures', 'Protocol and signing'],
    Nix: ['Configuration Nix des projets', 'Project Nix configuration']
  }
}
const general: Record<string, [string, string]> = {
  Docker: ['Images et conteneurs', 'Images and containers'],
  'Spring Boot': ['Applications et API Java', 'Java applications and APIs'],
  React: ['Interfaces et composants', 'Interfaces and components'],
  NextJS: ['Application web React', 'React web application'],
  'Java EE': ['Écosystème Java', 'Java ecosystem'],
  'Node.js': ['Exécution JavaScript', 'JavaScript runtime'],
  Python: ['Scripts et outillage', 'Scripting and tooling'],
  TailwindCSS: ['Styles de l’interface', 'Interface styling'],
  Git: ['Versionnement du code', 'Source version control'],
  Postgres: ['Base de données relationnelle', 'Relational database'],
  Linux: ['Système et environnement', 'Operating system and environment'],
  TypeScript: ['JavaScript typé', 'Typed JavaScript'],
  JavaScript: ['Logique des interfaces web', 'Web interface logic'],
  NixOS: ['Système déclaratif', 'Declarative operating system'],
  Rust: ['Programmation système', 'Systems programming'],
  Angular: ['Interfaces web', 'Web interfaces'],
  Selenium: ['Automatisation navigateur', 'Browser automation'],
  WebAssembly: [
    'Code compilé dans le navigateur',
    'Compiled code in the browser'
  ],
  Nix: ['Environnements reproductibles', 'Reproducible environments'],
  'Home Manager': ['Configuration utilisateur', 'User configuration'],
  Maven: ['Builds et tests Java', 'Java builds and tests'],
  Bitcoin: ['Protocole Bitcoin', 'Bitcoin protocol']
}
export const technologyTitle = (name: string) =>
  name === 'Java EE' ? 'Java' : name === 'NextJS' ? 'Next.js' : name
export function technologyNote(name: string, context: string, fr: boolean) {
  return (notes[context]?.[name] || general[name] || [name, name])[fr ? 0 : 1]
}
export function technologySource(name: string, context: string, lang: string) {
  if (context === 'bitcoin') return 'https://github.com/Strange500/min-btc-node'
  if (
    context === 'testing' ||
    ['Java EE', 'Spring Boot', 'Selenium', 'Maven'].includes(name)
  )
    return `/${lang}/blog/automated-testing-framework`
  if (
    context === 'nix' ||
    ['NixOS', 'Nix', 'Home Manager', 'Linux', 'Git'].includes(name)
  )
    return 'https://github.com/Strange500/nixos-config'
  if (name === 'Rust' || name === 'WebAssembly')
    return 'https://github.com/Strange500/ascii-cube-rs'
  if (['React', 'NextJS', 'TypeScript', 'TailwindCSS'].includes(name))
    return 'https://github.com/Strange500/nextPortfolio'
  return undefined
}
