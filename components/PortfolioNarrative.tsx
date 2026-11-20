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
          <a href='#missions'>{t('The work', 'Missions')}</a>
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
              {t('Whole', 'Tout le')}
              <br /> <em>{t('systems.', 'système.')}</em>
            </h1>
            <p className='hero-description'>
              {t(
                'Java/Spring Boot backend, automated testing and reproducible systems. Engineering student at IMT Nord Europe, on an apprenticeship at Numih.',
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
              {t('FROM CHARACTERS TO COMPUTATION', 'DES CARACTÈRES AU CALCUL')}
            </p>
            <h2 id='rust-title'>
              {t('It started in', 'Tout commence dans')}
              <br />
              <em>{t('a terminal.', 'un terminal.')}</em>
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
                'A rotating cube, drawn one character at a time. A small experiment in Rust became a way to explore a bigger question: how far can a simple idea travel?',
                'Un cube en rotation, dessiné caractère par caractère. Une expérience en Rust pour explorer une question : jusqu’où peut aller une idée simple ?'
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
                    'The point isn’t the cube. It’s owning the path from memory and rasterization to an interactive browser experience.',
                    'Le sujet, ce n’est pas le cube. C’est maîtriser le chemin de la mémoire et de la rastérisation jusqu’à une expérience interactive dans le navigateur.'
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
          </section>

          <section
            id='nix'
            data-facet
            className='facet-section'
            aria-labelledby='nix-title'
          >
            <p className='eyebrow'>
              02 /{' '}
              {t(
                'MAKE THE ENVIRONMENT REPEATABLE',
                'RENDRE L’ENVIRONNEMENT REPRODUCTIBLE'
              )}
            </p>
            <h2 id='nix-title'>
              {t('Different machines.', 'Des machines différentes.')}
              <br />
              <em>{t('One source of truth.', 'Une source de vérité.')}</em>
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
                'A reliable program needs a reliable home. My NixOS flake turns a collection of machines into a versioned, composable system—not seven snowflake setups.',
                'Un programme fiable a besoin d’un environnement fiable. Mon flake NixOS transforme des machines disparates en système versionné et composable, pas en sept configurations artisanales.'
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
            id='testing'
            data-facet
            className='facet-section'
            aria-labelledby='testing-title'
          >
            <p className='eyebrow'>
              03 / {t('CONFIDENCE IS ENGINEERED', 'LA CONFIANCE SE CONSTRUIT')}
            </p>
            <h2 id='testing-title'>
              {t('Less noise.', 'Moins de bruit.')}
              <br />
              <em>{t('More signal.', 'Plus de signal.')}</em>
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
                'At Numih, a test that fails for the wrong reason costs real time. I worked on the engine and the architecture behind the signal—not just on adding more tests.',
                'Chez Numih, un test qui échoue pour la mauvaise raison coûte du temps. J’ai travaillé sur le moteur et l’architecture derrière le signal, pas seulement sur le nombre de tests.'
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
                  <dd>
                    {t(
                      'tests in the reported scope',
                      'tests dans le périmètre déclaré'
                    )}
                  </dd>
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
                  '¹ Before/after estimate reported from the work experience; no published measurement protocol.',
                  '¹ Ordre de grandeur avant/après déclaré dans l’expérience ; protocole de mesure non publié.'
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
                  <span>~/experience/numih</span>
                  <span>{t('EVIDENCE LOG', 'JOURNAL DE PREUVES')}</span>
                </div>
                <div className='proof-grid'>
                  {[
                    {
                      value: '50–70',

                      label: t('integration tests', 'tests d’intégration'),
                      context: t(
                        'One Spring Boot / Selenium engine. The same execution path through Maven CI or an asynchronous REST API.',
                        'Un moteur Spring Boot / Selenium. La même exécution via Maven en CI ou une API REST asynchrone.'
                      )
                    },
                    {
                      value: '≈70%',

                      label: t(
                        'estimated reduction in false positives',
                        'de faux positifs en moins, estimation'
                      ),
                      context: t(
                        'Reported estimate after refactoring; the measurement period and calculation method are not documented.',
                        'Estimation déclarée après refonte ; période de mesure et méthode de calcul non documentées.'
                      )
                    },
                    {
                      value: '4h → <10m',

                      label: t(
                        'environment / version migration',
                        'migration d’environnement / version'
                      ),
                      context: t(
                        'A previously manual, hours-long migration brought down to minutes by the same refactoring.',
                        'Une migration manuelle de plusieurs heures ramenée à quelques minutes par cette même refonte.'
                      )
                    },
                    {
                      value: '≈40',

                      label: t(
                        'developers supported',
                        'développeurs accompagnés'
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
                    'Scope and before/after figures reported from the work experience. These are estimates, not independently verified benchmarks. The backend is collaborative; I built the Angular interface end to end. Employer code is private. The support tool is a separate delivery.',
                    'Périmètre et ordres de grandeur déclarés dans l’expérience. Ce sont des estimations, pas des benchmarks vérifiés indépendamment. Le backend est collectif ; j’ai réalisé l’interface Angular intégralement. Code employeur privé. L’outil de support est une réalisation distincte.'
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
            id='bitcoin'
            data-facet
            className='facet-section'
            aria-labelledby='bitcoin-title'
          >
            <p className='eyebrow'>
              04 / {t('VERIFY. DON’T ASSUME.', 'VÉRIFIER. NE PAS SUPPOSER.')}
            </p>
            <h2 id='bitcoin-title'>
              {t('Trust has', 'La confiance a')}
              <br />
              <em>{t('a protocol.', 'un protocole.')}</em>
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
                'The same instinct leads me to Bitcoin: understand what a system actually guarantees. Build the pieces, inspect the boundaries, and keep signing decisions explicit.',
                'Cette même exigence me mène à Bitcoin : comprendre ce qu’un système garantit vraiment. Construire les briques, inspecter les limites et garder la signature explicite.'
              )}
            </p>
            <div className='protocol-path mono'>
              <span>bytes</span>
              <b>→</b>
              <span>protocol</span>
              <b>→</b>
              <span>verification</span>
              <b>→</b>
              <span>{t('trust', 'confiance')}</span>
            </div>
            <div className='bitcoin-note'>
              <span className='bitcoin-glyph' aria-hidden='true'>
                [BTC]
              </span>
              <p>
                {t(
                  'min-btc-node explores a minimal Bitcoin node. pico-ledger explores constrained hardware and transaction signing. Learning projects, with source you can inspect—not a claim of production custody security.',
                  'min-btc-node explore un nœud Bitcoin minimal. pico-ledger explore le matériel contraint et la signature de transactions. Des projets d’apprentissage au code inspectable, pas une promesse de sécurité de garde en production.'
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
              {t(
                'SELECTED MISSIONS / NOT JUST A TECH STACK',
                'MISSIONS CHOISIES / AU-DELÀ DES TECHNOLOGIES'
              )}
            </p>
            <h2 id='missions-title'>
              {t('The work,', 'Le travail,')}
              <br />
              <em>{t('unfolded.', 'déplié.')}</em>
            </h2>
          </div>
          <p>
            {t(
              'Four case studies. Open a mission to inspect the problem, the decisions and the outcome.',
              'Quatre études de cas. Ouvrez une mission pour découvrir le problème, les choix et le résultat.'
            )}
          </p>
        </div>
        {[
          {
            title: t(
              'Make test failures worth investigating',
              'Rendre les échecs de test utiles'
            ),
            tag: 'JAVA / SPRING BOOT / ANGULAR',
            role: t(
              'Refactoring and asynchronous API on an existing team backend; full Angular interface.',
              'Refonte et API asynchrone sur un backend d’équipe existant ; interface Angular intégrale.'
            ),
            href: blog('automated-testing-framework'),
            problem: t(
              'False positives and slow environment migrations erode confidence.',
              'Faux positifs et migrations lentes érodent la confiance.'
            ),
            choice: t(
              'Unify execution behind Spring Boot and refactor the test architecture.',
              'Unifier l’exécution avec Spring Boot et refondre l’architecture de test.'
            ),
            result: t(
              '50–70 tests in the reported scope; environment/version migration from ~4h to <10m (reported estimate).',
              '50–70 tests dans le périmètre déclaré ; migration d’environnement/version de ~4 h à <10 min (estimation déclarée).'
            )
          },
          {
            title: t(
              'Bring a terminal experiment to the web',
              'Du terminal au navigateur'
            ),
            tag: 'RUST / WASM',
            role: t(
              'Personal project: Rust renderer and browser integration.',
              'Projet personnel : moteur Rust et intégration navigateur.'
            ),
            href: 'https://github.com/Strange500/ascii-cube-rs',
            problem: t(
              'Keep character-based 3D rendering interactive outside a terminal.',
              'Rendre un moteur 3D en caractères interactif hors du terminal.'
            ),
            choice: t(
              'Keep the rendering core in Rust; expose frame buffers through WebAssembly.',
              'Garder le moteur Rust et exposer ses buffers via WebAssembly.'
            ),
            result: t(
              'The interactive ASCII cube accompanying this page. One engine across two environments.',
              'Le cube ASCII interactif qui accompagne cette page. Un moteur, deux environnements.'
            )
          },
          {
            title: t(
              'Replace accidental infrastructure',
              'Remplacer l’infrastructure accidentelle'
            ),
            tag: 'NIXOS / FLAKES',
            role: t(
              'Personal infrastructure: host configuration, reusable modules and build automation.',
              'Infrastructure personnelle : configuration des hôtes, modules réutilisables et automatisation des builds.'
            ),
            href: blog('nixos-2026-reproducible'),
            problem: t(
              'Manual setup drifts between machines and is hard to recreate.',
              'Les réglages manuels divergent et se reproduisent difficilement.'
            ),
            choice: t(
              'Compose shared Nix modules, pin dependencies and keep secrets encrypted.',
              'Composer des modules Nix, figer les dépendances et chiffrer les secrets.'
            ),
            result: t(
              'Seven declared targets, one versioned flake, and CI-checked configurations.',
              'Sept cibles déclarées, un flake versionné et des configurations testées en CI.'
            )
          },
          {
            title: t(
              'Understand Bitcoin from the inside',
              'Comprendre Bitcoin de l’intérieur'
            ),
            tag: 'BITCOIN / SYSTEMS',
            role: t(
              'Personal learning projects around networking and transaction signing.',
              'Projets personnels d’apprentissage autour du réseau et de la signature de transactions.'
            ),
            href: 'https://github.com/Strange500/min-btc-node',
            problem: t(
              'Using a protocol is not the same as understanding its guarantees.',
              'Utiliser un protocole n’est pas comprendre ses garanties.'
            ),
            choice: t(
              'Build a minimal node; explore signing separately with pico-ledger.',
              'Construire un nœud minimal ; explorer la signature avec pico-ledger.'
            ),
            result: t(
              'Inspectable learning implementations, with explicit scope rather than security claims.',
              'Des implémentations pédagogiques inspectables, au périmètre explicite.'
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
                  <dt>{t('My role', 'Mon rôle')}</dt>
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
                {t('Inspect the mission', 'Explorer la mission')} ↗
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
            {t('Let’s connect', 'Faisons le lien')}
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
            'BUILT WITH INTENT. SOURCE OPEN.',
            'CONÇU AVEC INTENTION. CODE OUVERT.'
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
