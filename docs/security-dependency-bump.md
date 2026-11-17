# Mise à jour de sécurité des dépendances

## Changements

- Next.js : `16.3.5` → `16.4.6`, avec une version minimale déclarée à `^16.4.6`.
- `eslint-config-next` : `15.1.2` → `16.4.6` ; utilisation de ses configurations plates natives, nécessaires avec cette version.
- Exécution de `npm audit fix`, sans `--force`, et mise à jour du verrou npm.
- Sharp transitif : `0.35.5`. DOMPurify : `3.4.17`. Les autres corrections compatibles incluent js-yaml, brace-expansion, nanoid, source-map-js, postcss-selector-parser et baseline-browser-mapping.

## Résultat de l'audit

Le relevé GitHub avant intervention contenait **36 alertes Dependabot ouvertes** (et non 27). Les alertes GitHub de la branche principale ne seront pas nécessairement clôturées avant fusion ; cette PR ne les désactive pas.

L'audit npm initial recensait **24 entrées** : 2 critiques, 9 hautes, 11 modérées et 2 faibles. Après correction : **aucune critique et aucune haute**.

Les décomptes des dépendances affectées diffèrent selon npm : npm 12 affiche **9 entrées** (7 modérées, 2 faibles), npm 10 **10 entrées** (8 modérées, 2 faibles), car ce dernier inclut également `eslint-config-next` dans la propagation de minimatch. Il s'agit des deux causes résiduelles ci-dessous, et non de 9 ou 10 failles distinctes. `npm audit --omit=dev` ne conserve que les deux entrées faibles KaTeX/Mermaid.

### KaTeX via Mermaid — faible

- Advisory : https://github.com/advisories/GHSA-238p-pmpm-9mq7
- Chaîne verrouillée : `mermaid@11.17.2` → `katex@0.16.47` ; correction KaTeX à partir de `0.18.2`.
- `npm audit fix --force` propose `mermaid@12.3.0`, une migration majeure qui exige aussi **Node >=22.12.0**, alors que la CI actuelle utilise Node 20.
- Alternative recommandée : PR dédiée de migration vers Node 22.12+ et Mermaid 12.3+, puis vérification que le verrou résout KaTeX >=0.18.2, tests navigateur des diagrammes et formules, thèmes clair/sombre et agrandissement.
- Alternative temporaire : override ciblé de KaTeX >=0.18.2, mais hors de la plage déclarée par Mermaid 11 ; à ne faire qu'avec une validation de compatibilité des diagrammes/formules. Aucun override majeur non vérifié n'est imposé ici.
- Le risque suppose notamment une pollution de prototype préexistante ; ne pas ouvrir le rendu à du contenu non fiable ni activer le mode `trust` pour contourner le problème.

### minimatch via TypeScript-ESLint — modérée, développement uniquement

- Advisory : https://github.com/advisories/GHSA-g3hv-75wg-m249
- Chaîne : `typescript-eslint@8.72.2` → `@typescript-eslint/typescript-estree@8.72.2` → `minimatch@10.2.6`.
- Le correctif `minimatch@11.0.1` est hors de la plage amont `^10.2.2`. Une nouvelle exécution de `npm audit fix` ne permet pas une résolution compatible avec cette plage.
- Alternative recommandée : mise à jour amont de TypeScript-ESLint lorsque sa plage permet minimatch >=11.0.1.
- Alternative contrôlée : override limité à `@typescript-eslint/typescript-estree` vers minimatch >=11.0.1, avec tests des globs/inclusions/exclusions et du lint ; changement majeur à valider séparément. Aucun override global n'est ajouté.

## Vérifications effectuées

- Installation propre `npm ci` avec **Node 20.20.2 / npm 10.9.10**, puis build de production : succès, 14 pages générées. Build également réussi sous Node 26.12.1.
- `node scripts/test-cube-raster.mjs` : succès, 180 frames, aucune frame affectée ni trou.
- `python3 scripts/test-resume-preview.py` : 5 tests réussis.
- Serveur de production : HTTP 200 pour `/en`, `/fr`, leurs listes de blog et l'article `ascii-cube-journey` dans les deux langues.
- Optimiseur d'images Next/Sharp : HTTP 200 pour `/img/cv-profile.jpg` via `/_next/image`, JPEG redimensionné à 640 × 638.
- `git diff --check` : succès.
- `npm run lint` : reste en échec sur **3 erreurs préexistantes** (deux `no-explicit-any` dans la page d'article et un `no-require-imports` dans `tailwind.config.ts`). Avant modification : 8 erreurs et 8 avertissements. La nouvelle configuration classe certains anciens problèmes de variables inutilisées en avertissements ; ces fichiers applicatifs n'ont pas été modifiés. Le lint reste non bloquant dans la CI existante.

L'installation sous Node 20 signale aussi que les dépendances Puppeteer déjà présentes nécessitent Node >=22.12.0. Le build et les tests ci-dessus réussissent, mais le rendu PDF Puppeteer et les tests visuels navigateur n'ont pas été exécutés. Une mise à niveau séparée de Node est recommandée.
