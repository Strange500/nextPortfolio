'use client'

import { useEffect, useRef, useState } from 'react'
import ScrollCubeScene from './ScrollCubeScene'
import StepNavigation from './StepNavigation'
import MobilePortfolioMenu from './MobilePortfolioMenu'
import { contextTechnologies, technologyTitle } from '@/data/cube-context'
import { cubeTechnologyNames } from '@/data/cube-context'
import '../app/scroll-scene.css'
import { ResumeDropdown } from './ResumeDropdown'

type Language = 'en' | 'fr'

const machines = [
  {
    name: 'Server',
    role: ['Production server', 'Serveur de production'],
    detail: [
      'ZFS, blank-slate root at boot, encrypted secrets and declarative service routing. Rebuild the system, not a history of shell commands.',
      'ZFS, racine vierge au démarrage, secrets chiffrés et routage déclaratif. Reconstruire le système, pas un historique de commandes.'
    ],
    profile: 'server',
    x: 50,
    y: 13
  },
  {
    name: 'Cube',
    role: ['Gaming machine', 'Machine de jeu'],
    detail: [
      'A dedicated gaming profile built on the same shared modules as the server. Different workload; the same reproducible foundation.',
      'Un profil de jeu dédié, composé des mêmes modules partagés que le serveur. Une autre charge, le même socle reproductible.'
    ],
    profile: 'gaming',
    x: 83,
    y: 29
  },
  {
    name: 'pi',
    role: ['ARM machine', 'Machine ARM'],
    detail: [
      'An aarch64-linux target in the same flake. Hardware-specific configuration stays at the edge; common modules remain shared.',
      'Une cible aarch64-linux dans le même flake. Le matériel reste à la périphérie ; les modules communs restent partagés.'
    ],
    profile: 'aarch64-linux',
    x: 85,
    y: 67
  },
  {
    name: 'Clovis',
    role: ['Workstation', 'Station de travail'],
    detail: [
      'A declarative desktop with a shared development environment. Editor, language tooling and system settings are versioned together.',
      'Un bureau déclaratif et un environnement de développement partagé. Éditeur, outils de langage et système sont versionnés ensemble.'
    ],
    profile: 'desktop',
    x: 64,
    y: 88
  },
  {
    name: 'Septimius',
    role: ['Workstation', 'Station de travail'],
    detail: [
      'Another desktop target composed from the shared desktop profile, with its own host-specific hardware configuration.',
      'Une autre cible composée du profil desktop partagé, avec sa propre configuration matérielle.'
    ],
    profile: 'desktop',
    x: 29,
    y: 88
  },
  {
    name: 'Clotaire',
    role: ['Workstation', 'Station de travail'],
    detail: [
      'A separate workstation, not a separate setup to maintain. Host configuration selects reusable modules from one source of truth.',
      'Une station distincte, pas un environnement distinct à maintenir. La configuration sélectionne les modules d’une source de vérité commune.'
    ],
    profile: 'desktop',
    x: 14,
    y: 60
  },
  {
    name: 'installer',
    role: ['Installer ISO target', 'Cible ISO d’installation'],
    detail: [
      'The seventh configuration is an installer image, not an always-on machine. The bootstrap environment is versioned alongside the systems it installs.',
      'La septième configuration est une image d’installation, pas une machine allumée en permanence. L’amorçage est versionné avec les systèmes installés.'
    ],
    profile: 'ISO / bootstrap',
    x: 18,
    y: 24
  }
]

export default function PortfolioNarrative({ lang }: { lang: Language }) {
  const fr = lang === 'fr'
  const t = (en: string, french: string) => (fr ? french : en)

  const [selected, setSelected] = useState(0)
  const [reduced, setReduced] = useState(false)

  const root = useRef<HTMLElement>(null)
  const machine = machines[selected]
  const blog = (slug: string) => `/${lang}/blog/${slug}`
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => {
      preference.removeEventListener('change', update)
    }
  }, [])

  return (
    <main
      ref={root}
      className='narrative'
      lang={lang}
      data-motion={reduced ? 'reduced' : 'full'}
    >
      <a className='skip-link' href='#testing'>
        {t('Skip to the work', 'Aller aux réalisations')}
      </a>
      <header className='portfolio-nav'>
        <a
          className='wordmark'
          href={`/${lang}`}
          aria-label={t('Benjamin, home', 'Benjamin, accueil')}
        >
          b<span>_</span>r
          <span className='wordmark-name'> / Benjamin Roget</span>
        </a>
        <nav aria-label={t('Main navigation', 'Navigation principale')}>
          <a href='#testing'>{t('Experience', 'Expérience')}</a>
          <a href='#missions'>{t('Projects', 'Projets')}</a>
          <a href={`/${lang}/blog`}>{t('Field notes', 'Carnet')}</a>
          <a href='#contact'>Contact ↗</a>
        </nav>
        <MobilePortfolioMenu lang={lang} />
      </header>

      <StepNavigation lang={lang} />
      <ScrollCubeScene lang={lang} />
      <section
        id='intro'
        className='portfolio-hero'
        aria-labelledby='hero-title'
      >
        <div className='hero-topline mono'>
          <span>
            <i className='status-dot' />{' '}
            {t(
              'SOFTWARE, SYSTEMS & EXPERIMENTS',
              'LOGICIEL, SYSTÈMES & EXPÉRIMENTATIONS'
            )}
          </span>
          <span>JAVA / SPRING BOOT · ANGULAR · {t('SYSTEMS', 'SYSTÈMES')}</span>
        </div>
        <div className='hero-composition'>
          <div className='hero-copy'>
            <p className='eyebrow'>
              {t(
                'BENJAMIN ROGET · APPRENTICE ENGINEER',
                'BENJAMIN ROGET · APPRENTI INGÉNIEUR'
              )}
            </p>
            <h1 id='hero-title'>
              {t('Small details.', 'Le détail.')}
              <br />
              {t('Whole', 'La vue')}
              <br /> <em>{t('systems.', 'd’ensemble.')}</em>
            </h1>
            <p className='hero-description'>
              {t(
                'Java/Spring Boot backend, automated testing and reproducible systems. Engineering student at IMT Nord Europe and software engineering apprentice at Numih.',
                'Backend Java/Spring Boot, tests automatisés et systèmes reproductibles. Élève ingénieur à l’IMT Nord Europe, en alternance chez Numih.'
              )}
            </p>
            <p
              id='portfolio-technologies'
              className='intro-tech-accessible sr-only'
            >
              {t('Technologies: ', 'Technologies : ')}
              {cubeTechnologyNames.join(' · ')}
            </p>
            <p className='hero-availability'>
              <span className='status-dot' aria-hidden='true' />
              {t(
                'Seeking a 3-month internship · from June 2027',
                'Stage de 3 mois recherché · à partir de juin 2027'
              )}
            </p>
            <div className='hero-actions'>
              <a className='solid-link' href='#testing'>
                {t('My work at Numih', 'Mon expérience Numih')} <span>↓</span>
              </a>
              <ResumeDropdown
                lang={lang}
                label={t('Download CV', 'Télécharger le CV')}
                download
              />
            </div>
            <a
              className='hero-case-study'
              href={blog('automated-testing-framework')}
            >
              <span className='eyebrow'>
                {t(
                  'NUMIH / JAVA · SPRING BOOT · ANGULAR',
                  'NUMIH / JAVA · SPRING BOOT · ANGULAR'
                )}
              </span>
              <strong>
                {t(
                  'From a Selenium suite to a shared test platform.',
                  'D’une suite Selenium à une plateforme de tests partagée.'
                )}
              </strong>
              <span>
                {t(
                  'Backend refactoring and API · Angular interface built end to end',
                  'Refonte backend et API · interface Angular réalisée intégralement'
                )}{' '}
                <b aria-hidden='true'>↗</b>
              </span>
            </a>
          </div>
        </div>
        <aside
          className='mobile-cube-demo'
          aria-label={t(
            'An interactive Rust experiment',
            'Une expérience interactive en Rust'
          )}
        >
          <div data-mobile-cube-slot />
          <div className='mobile-cube-copy'>
            <p>{t('A cube, built in Rust.', 'Un cube, du Rust.')}</p>
            <span>
              {t(
                'Swipe sideways to turn it.',
                'Glissez latéralement pour le tourner.'
              )}
            </span>
            <div id='mobile-cube-controls' />
          </div>
        </aside>
        <div className='hero-bottom mono'>
          <span>RUST → WASM → {t('REAL-WORLD SYSTEMS', 'SYSTÈMES RÉELS')}</span>
          <span>{t('SCROLL TO UNFOLD', 'DÉFILER POUR DÉPLIER')} ↓</span>
        </div>
      </section>

      <div className='narrative-body'>
        <div className='facet-content'>
          <section
            id='rust'
            data-facet
            className='facet-section'
            aria-labelledby='rust-title'
          >
            <p className='eyebrow'>
              01 /{' '}
              {t(
                'PERSONAL PROJECT / RUST AND WASM',
                'PROJET PERSONNEL / RUST ET WASM'
              )}
            </p>
            <h2 id='rust-title'>
              {t('An ASCII cube,', 'Un cube ASCII,')}
              <br />
              <em>{t('built in Rust.', 'un moteur Rust.')}</em>
            </h2>
            <ul
              className='mobile-section-stack'
              aria-label={t('Project technologies', 'Technologies du projet')}
            >
              {contextTechnologies['rust'].map(name => (
                <li key={name}>{technologyTitle(name)}</li>
              ))}
            </ul>
            <p className='section-intro'>
              {t(
                'I built the Rust renderer behind this page. WebAssembly brings it to the browser; the frontend handles gestures, transitions and technology labels.',
                'J’ai développé le moteur Rust qui dessine le cube de cette page. WebAssembly permet de l’exécuter dans le navigateur ; le frontend gère les gestes, les transitions et les légendes.'
              )}
            </p>
            <details className='chapter-details'>
              <summary>
                {t(
                  'From Rust to the browser · build and implementation',
                  'De Rust au navigateur · compilation et implémentation'
                )}
              </summary>
              <div className='terminal-window'>
                <div className='window-bar'>
                  <span>● ● ●</span>
                  <span>ascii-cube-rs / src → browser</span>
                  <span>RUST</span>
                </div>
                <pre>
                  <code>{`$ wasm-pack build --target web --mode no-install --release
  Rust → wasm-bindgen → WebAssembly

$ npm run build
  Next.js → browser

frame buffers → canvas → visible faces`}</code>
                </pre>
                <span className='terminal-note'>
                  {t(
                    'The build path, illustrated. This is the real Rust engine running in your browser.',
                    'Le parcours de compilation, illustré. Ce moteur Rust s’exécute réellement dans votre navigateur.'
                  )}
                </span>
              </div>
              <div className='arc-arrow mono'>
                ↓{' '}
                {t('SAME ENGINE. NEW CANVAS.', 'MÊME MOTEUR. NOUVEAU TERRAIN.')}{' '}
                ↓
              </div>

              <div className='mission-result'>
                <span>↳</span>
                <p>
                  {t(
                    'The renderer produces the buffers; the frontend turns them into an interactive scene. The article explains that boundary and the tradeoffs.',
                    'Le moteur calcule le rendu ; le frontend transforme ses buffers en scène interactive. L’article explique cette répartition et les choix qu’elle implique.'
                  )}
                </p>
              </div>
            </details>
            <a
              className='text-link'
              href='https://github.com/Strange500/ascii-cube-rs'
            >
              {t(
                'Inspect the Rust + WASM source',
                'Explorer le code Rust + WASM'
              )}{' '}
              ↗
            </a>
            <a className='text-link' href={blog('ascii-cube-journey')}>
              {t('How the cube works', 'Comment fonctionne le cube')} ↗
            </a>
          </section>

          <section
            id='testing'
            data-facet
            className='facet-section'
            aria-labelledby='testing-title'
          >
            <p className='eyebrow'>
              02 /{' '}
              {t(
                'WORK EXPERIENCE / NUMIH',
                'EXPÉRIENCE PROFESSIONNELLE / NUMIH'
              )}
            </p>
            <h2 id='testing-title'>
              {t('More reliable', 'Des tests')}
              <br />
              <em>{t('automated tests.', 'plus fiables.')}</em>
            </h2>
            <ul
              className='mobile-section-stack'
              aria-label={t('Project technologies', 'Technologies du projet')}
            >
              {contextTechnologies['testing'].map(name => (
                <li key={name}>{technologyTitle(name)}</li>
              ))}
            </ul>
            <p className='section-intro'>
              {t(
                'At Numih, I help maintain a Selenium suite used by the team. I worked on the test framework, execution API and Angular app to make scenarios easier to run and investigate.',
                'Chez Numih, je contribue à une suite Selenium utilisée par l’équipe. J’ai travaillé sur le framework, l’API d’exécution et l’application Angular pour faciliter le lancement et l’analyse des tests.'
              )}
            </p>
            <div className='experience-overview'>
              <p className='experience-role'>
                {t(
                  'Numih France · apprenticeship since September 2025',
                  'Numih France · alternance depuis septembre 2025'
                )}
              </p>
              <p>
                {t(
                  'I refactored the existing Selenium framework, migrated it to Spring Boot and developed its asynchronous API. I built the Angular interface end to end, starting in August 2026.',
                  'J’ai refondu le framework Selenium existant, migré son moteur vers Spring Boot et développé son API asynchrone. J’ai réalisé l’intégralité de l’interface Angular, commencée en août 2026.'
                )}
              </p>
              <dl className='experience-results'>
                <div>
                  <dt>50–70</dt>
                  <dd>{t('tests in the project scope', 'tests concernés')}</dd>
                </div>
                <div>
                  <dt>~4 h → &lt;10 min</dt>
                  <dd>
                    {t(
                      'environment / version migration¹',
                      'migration d’environnement / version¹'
                    )}
                  </dd>
                </div>
              </dl>
              <a
                className='text-link'
                href={blog('automated-testing-framework')}
              >
                {t(
                  'My role, decisions and results',
                  'Mon rôle, les choix et les résultats'
                )}{' '}
                ↗
              </a>
              <p className='source-note'>
                {t(
                  '¹ Approximate before/after times from my work experience; the measurement method is not documented.',
                  '¹ Ordres de grandeur issus de mon expérience ; la méthode de mesure n’est pas documentée.'
                )}
              </p>
            </div>
            <details className='chapter-details'>
              <summary>
                {t(
                  'Technical scope, further results and limitations',
                  'Périmètre technique, autres résultats et limites'
                )}
              </summary>
              <div id='proof' className='proof-console'>
                <div className='window-bar'>
                  <span>Numih France</span>
                  <span>{t('PROJECT DETAILS', 'DÉTAILS DU PROJET')}</span>
                </div>
                <div className='proof-grid'>
                  {[
                    {
                      value: 'CI + API',

                      label: t(
                        'a shared execution engine',
                        'un moteur d’exécution partagé'
                      ),
                      context: t(
                        'The same scenarios can run in Jenkins or from the web app without duplicating their business steps.',
                        'Les mêmes scénarios peuvent être exécutés dans Jenkins ou depuis l’application web, sans dupliquer leurs étapes métier.'
                      )
                    },
                    {
                      value: 'Angular',
                      label: t(
                        'launch and investigation',
                        'lancement et analyse'
                      ),
                      context: t(
                        'I built the app end to end: parameters, execution history, status notifications, logs and screenshots.',
                        'J’ai réalisé l’application de bout en bout : paramètres, historique, notifications de statut, logs et captures.'
                      )
                    },
                    {
                      value: '≈40',

                      label: t(
                        'developers in the support rota',
                        'développeurs dans la répartition du support'
                      ),
                      context: t(
                        'A separate production Spring Boot tool distributes daily product-support duties across the team.',
                        'Un outil Spring Boot distinct, en production, répartit le support produit quotidien dans l’équipe.'
                      )
                    }
                  ].map(p => (
                    <a
                      key={p.value}
                      className='proof-item'
                      href={blog('automated-testing-framework')}
                    >
                      <strong>
                        <span data-counter data-complete='true'>
                          {p.value}
                        </span>
                      </strong>
                      <h3>{p.label}</h3>
                      <p>{p.context}</p>
                      <span className='proof-link'>
                        {t('Read the context', 'Lire le contexte')} ↗
                      </span>
                    </a>
                  ))}
                </div>
                <p className='source-note'>
                  {t(
                    'Scope and timings come from my work experience. The backend is a team project; I built the Angular app end to end. The support tool is a separate delivery.',
                    'Le périmètre et les durées proviennent de mon retour d’expérience. Le backend est un projet d’équipe ; j’ai réalisé l’application Angular. L’outil de support est une réalisation distincte.'
                  )}
                </p>
                <a
                  className='text-link'
                  href={blog('automated-testing-framework')}
                >
                  {t(
                    'Case study / rebuilding trust in E2E tests',
                    'Étude / restaurer la confiance dans les tests E2E'
                  )}{' '}
                  ↗
                </a>
              </div>
            </details>
          </section>

          <section
            id='nix'
            data-facet
            className='facet-section'
            aria-labelledby='nix-title'
          >
            <p className='eyebrow'>
              03 /{' '}
              {t(
                'MAKE THE ENVIRONMENT REPEATABLE',
                'RENDRE L’ENVIRONNEMENT REPRODUCTIBLE'
              )}
            </p>
            <h2 id='nix-title'>
              {t('Different machines.', 'Des machines.')}
              <br />
              <em>{t('Shared configuration.', 'Un socle commun.')}</em>
            </h2>
            <ul
              className='mobile-section-stack'
              aria-label={t('Project technologies', 'Technologies du projet')}
            >
              {contextTechnologies['nix'].map(name => (
                <li key={name}>{technologyTitle(name)}</li>
              ))}
            </ul>
            <p className='section-intro'>
              {t(
                'My personal infrastructure uses shared NixOS modules for desktops, a server and an installer image. Configuration is versioned alongside the checks used to validate it.',
                'Mon infrastructure personnelle repose sur des modules NixOS partagés entre les postes, le serveur et une image d’installation. La configuration et ses vérifications sont versionnées ensemble.'
              )}
            </p>
            <details className='chapter-details'>
              <summary>
                {t(
                  '7 targets · explore the infrastructure',
                  '7 cibles · explorer l’infrastructure'
                )}
              </summary>
              <p className='source-note'>
                {t(
                  'Select a target to explore its role and configuration.',
                  'Sélectionnez une cible pour explorer son rôle et sa configuration.'
                )}
              </p>
              <div className='infrastructure'>
                <div className='window-bar'>
                  <span>flake.nix / topology</span>
                  <span>7 {t('TARGETS', 'CIBLES')} · 1 FLAKE</span>
                </div>
                <div className='topology'>
                  <svg
                    viewBox='0 0 100 100'
                    preserveAspectRatio='none'
                    aria-hidden='true'
                  >
                    {machines.map((m, i) => (
                      <line
                        key={m.name}
                        x1='50'
                        y1='50'
                        x2={m.x}
                        y2={m.y}
                        className={selected === i ? 'selected-edge' : ''}
                      />
                    ))}
                  </svg>
                  <a
                    className='flake-hub mono'
                    href='https://github.com/Strange500/nixos-config/blob/main/flake.nix'
                  >
                    {`{ flake }`}
                    <small>nixosConfigurations</small>
                  </a>
                  {machines.map((m, i) => (
                    <button
                      key={m.name}
                      data-machine={m.name}
                      aria-pressed={selected === i}
                      aria-controls='machine-detail'
                      onClick={() => setSelected(i)}
                      style={{ left: `${m.x}%`, top: `${m.y}%` }}
                    >
                      <span>▣</span>
                      {m.name}
                    </button>
                  ))}
                </div>
                <div
                  id='machine-detail'
                  className='machine-detail'
                  aria-live='polite'
                >
                  <div>
                    <p className='eyebrow'>{machine.role[fr ? 1 : 0]}</p>
                    <h4>{machine.name}</h4>
                    <span className='mono machine-profile'>
                      {machine.profile}
                    </span>
                  </div>
                  <div>
                    <p>{machine.detail[fr ? 1 : 0]}</p>
                    <a
                      className='text-link'
                      href={`https://github.com/Strange500/nixos-config/tree/main/hosts/${machine.name}`}
                    >
                      {t('Inspect host configuration', 'Lire la configuration')}{' '}
                      ↗
                    </a>
                  </div>
                </div>
              </div>
              <p className='source-note'>
                {t(
                  'Architecture map, not live telemetry. Seven declared targets include six host configurations and the installer ISO.',
                  'Carte d’architecture, pas une télémétrie en direct. Les sept cibles déclarées incluent six hôtes et l’ISO d’installation.'
                )}
              </p>
            </details>
            <a className='text-link' href={blog('nixos-2026-reproducible')}>
              {t(
                'Field notes: flakes, impermanence & reproducibility',
                'Carnet : flakes, impermanence et reproductibilité'
              )}{' '}
              ↗
            </a>
          </section>

          <section
            id='bitcoin'
            data-facet
            className='facet-section'
            aria-labelledby='bitcoin-title'
          >
            <p className='eyebrow'>
              04 / {t('PERSONAL PROJECTS / RUST', 'PROJETS PERSONNELS / RUST')}
            </p>
            <h2 id='bitcoin-title'>
              {t('Understanding', 'Comprendre')}
              <br />
              <em>{t('Bitcoin.', 'le protocole.')}</em>
            </h2>
            <ul
              className='mobile-section-stack'
              aria-label={t('Project technologies', 'Technologies du projet')}
            >
              {contextTechnologies['bitcoin'].map(name => (
                <li key={name}>{technologyTitle(name)}</li>
              ))}
            </ul>
            <p className='section-intro'>
              {t(
                'My Bitcoin projects explore two systems topics: peer-to-peer networking in min-btc-node and embedded wallet logic in pico-ledger.',
                'Mes projets Bitcoin me permettent d’étudier deux sujets système : le réseau pair à pair avec min-btc-node et la logique d’un portefeuille embarqué avec pico-ledger.'
              )}
            </p>
            <div className='protocol-path mono'>
              <span>{t('bytes', 'octets')}</span>
              <b>→</b>
              <span>{t('protocol', 'protocole')}</span>
              <b>→</b>
              <span>{t('verification', 'vérification')}</span>
              <b>→</b>
              <span>{t('results', 'résultats')}</span>
            </div>
            <div className='bitcoin-note'>
              <span className='bitcoin-glyph' aria-hidden='true'>
                [BTC]
              </span>
              <p>
                {t(
                  'These are learning prototypes. Their source shows the implemented features and the work that remains; min-btc-node is a light client, not a full validating node.',
                  'Ce sont des prototypes d’apprentissage. Le code permet de distinguer les fonctions réalisées du travail restant ; min-btc-node est un client léger, pas un nœud complet de validation.'
                )}
              </p>
            </div>
            <div className='inline-links'>
              <a
                className='text-link'
                href='https://github.com/Strange500/min-btc-node'
              >
                min-btc-node ↗
              </a>
              <a
                className='text-link'
                href='https://github.com/Strange500/pico-ledger'
              >
                pico-ledger ↗
              </a>
            </div>
          </section>
        </div>
      </div>

      <section
        id='missions'
        className='missions-section'
        aria-labelledby='missions-title'
      >
        <div className='section-heading'>
          <div>
            <p className='eyebrow'>
              {t('MORE PROJECTS / JAVA', 'AUTRES PROJETS / JAVA')}
            </p>
            <h2 id='missions-title'>
              {t('More projects,', 'D’autres projets,')}
              <br />
              <em>{t('more to explore.', 'du code à lire.')}</em>
            </h2>
          </div>
          <p>
            {t(
              'Two academic projects complement my work experience: rendering, testing and a database-backed web application.',
              'Deux projets académiques complètent mon expérience : du rendu et des tests d’un côté, une application web avec base de données de l’autre.'
            )}
          </p>
        </div>
        {[
          {
            title: t(
              'Rendering and testing a 3D scene',
              'Dessiner une scène 3D et vérifier son rendu'
            ),
            tag: 'JAVA / JUNIT 5',
            role: t(
              'Academic Java project at IMT Nord Europe.',
              'Projet académique en Java à l’IMT Nord Europe.'
            ),
            href: 'https://github.com/Strange500/RayTracer',
            problem: t(
              'Render a scene while keeping numerical changes testable.',
              'Produire une image de synthèse et pouvoir vérifier les changements de calcul.'
            ),
            choice: t(
              'Parallel ray tracing, BVH acceleration and JUnit tests against reference images.',
              'Rendu parallèle, accélération BVH et tests JUnit par comparaison d’images de référence.'
            ),
            result: t(
              'A rendering engine with unit tests and image regression tests in the repository.',
              'Un moteur de rendu accompagné de tests unitaires et de tests de non-régression visuelle.'
            )
          },
          {
            title: t(
              'Building a Java web chat app',
              'Construire une messagerie web en Java'
            ),
            tag: 'JAVA EE / POSTGRESQL',
            role: t(
              'Academic web application, from controllers to SQL persistence.',
              'Application web académique, des contrôleurs à la persistance SQL.'
            ),
            href: 'https://github.com/Strange500/QGChat',
            problem: t(
              'Manage users, conversations and messages in a database-backed application.',
              'Gérer des utilisateurs, des conversations et des messages dans une application avec base de données.'
            ),
            choice: t(
              'MVC structure, DAO persistence layer, REST endpoints and Docker Compose deployment.',
              'Architecture MVC, couche DAO, endpoints REST et déploiement avec Docker Compose.'
            ),
            result: t(
              'A web application with PostgreSQL persistence and temporary JWT invitation links.',
              'Une application avec persistance PostgreSQL et liens d’invitation JWT temporaires.'
            )
          }
        ].map((m, i) => (
          <details className='mission' name='portfolio-missions' key={m.tag}>
            <summary>
              <div className='mission-number mono'>0{i + 1}</div>
              <div className='mission-heading'>
                <p className='eyebrow'>{m.tag}</p>
                <h3>{m.title}</h3>
              </div>
              <span className='mission-toggle' aria-hidden='true'>
                <span>+</span>
              </span>
            </summary>
            <div className='mission-main'>
              <dl>
                <div>
                  <dt>{t('Context', 'Contexte')}</dt>
                  <dd>{m.role}</dd>
                </div>
                <div>
                  <dt>{t('Problem', 'Problème')}</dt>
                  <dd>{m.problem}</dd>
                </div>
                <div>
                  <dt>{t('Choice', 'Choix')}</dt>
                  <dd>{m.choice}</dd>
                </div>
                <div>
                  <dt>{t('Result', 'Résultat')}</dt>
                  <dd>{m.result}</dd>
                </div>
              </dl>
              <a className='text-link' href={m.href}>
                {t('View the code', 'Consulter le code')} ↗
              </a>
            </div>
          </details>
        ))}
      </section>
      <footer id='contact' className='portfolio-footer'>
        <div>
          <p className='eyebrow'>
            {t(
              'NEXT / BUILD SOMETHING THAT HOLDS UP',
              'LA SUITE / CONSTRUIRE DU SOLIDE'
            )}
          </p>
          <h2>
            {t('Get in touch', 'Échangeons')}
            <em>_</em>
          </h2>
          <p className='contact-intro'>
            {t(
              'Looking for a backend or software tooling intern? I’m seeking a three-month placement from June 2027.',
              'Vous recherchez un stagiaire en backend ou en outillage logiciel ? Je recherche un stage de trois mois à partir de juin 2027.'
            )}
          </p>
          <div className='inline-links'>
            <a className='solid-link' href='mailto:benjamin.rogetpro@gmail.com'>
              {t('Say hello', 'Écrivez-moi')} ↗
            </a>
            <a className='text-link' href='https://github.com/Strange500'>
              GitHub ↗
            </a>
            <a
              className='text-link'
              href='https://www.linkedin.com/in/roget-benjamin'
            >
              LinkedIn ↗
            </a>
            <ResumeDropdown lang={lang} label={t('Résumé', 'CV')} />
            <a className='mobile-back-top' href='#intro'>
              {t('Back to top', 'Retour en haut')} ↑
            </a>
          </div>
        </div>
        <div className='footer-colophon mono'>
          BENJAMIN ROGET
          <br />
          {t(
            'PROJECTS AND ENGINEERING NOTES.',
            'PROJETS ET RETOURS D’EXPÉRIENCE.'
          )}
          <br />
          <a href='https://github.com/Strange500/nextPortfolio'>
            {t('Source code', 'Code source')} ↗
          </a>
        </div>
      </footer>
    </main>
  )
}
