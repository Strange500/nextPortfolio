# CV — previews et contrôle visuel

## Version cohérente avec le portfolio — 20 novembre 2026

[CV français](portfolio-cv-fr.png) · [English résumé](portfolio-cv-en.png)

Le renderer reprend directement les couleurs du thème clair dans
`app/narrative.css` : papier #f1eee7, encre #20242b, secondaire #5e656f,
accent #2f53d7. Il garde Inter et Fira Code, aligne l’en-tête à gauche et utilise
des séparateurs fins. Le corps passe à 9,25 pt ; les dates et liens secondaires
restent à 7,5 pt. Les versions FR et EN utilisent le même ordre de lecture :
profil, expérience, formation, compétences, projets, langues.

### Pertinence et sélection des projets

Le CV cible un stage backend Java et systèmes de trois mois dès juin 2027.
L’expérience Numih est condensée en cinq points conservant le framework partagé,
l’interface Angular intégrale, les gains estimés, l’outil de support distinct et
la formation/recrutement. Aucun pourcentage non étayé n’est ajouté au CV.
Le statut français devient « Élève ingénieur » ; le diplôme reste prévu en 2028.
Les intitulés DUT et le classement de promotion sont conservés.

La liste de destinations du résumé anglais est retirée du CV généraliste ;
l’objectif d’équipe anglophone est conservé. Les coordonnées gardent ville,
email, téléphone et profils. Le JSON ne contient plus d’adresse complète ni de
chemin local de photo inutilisé. Le TOEIC est identifié comme Listening & Reading,
sans déduction d’un niveau oral ou CECRL. Les compétences sont priorisées plutôt
que présentées comme une liste exhaustive de technologies.

L’inventaire GitHub a servi à sélectionner des candidats, puis leurs descriptions,
structures et portions de code ont été examinées. Les tests de tous ces projets
n’ont pas été exécutés ; les tests décrits ci-dessous sont présents dans leurs
sources, sans affirmation de leur statut courant.

| Projet public | Décision pour ce CV | Éléments examinés |
| --- | --- | --- |
| [RayTracer (Java)](https://github.com/Strange500/RayTracer) | Sélectionné en premier, remplace QGChat | Projet académique documenté ; rendu parallèle, BVH, tests JUnit et comparaison d’images de référence. |
| [min-btc-node](https://github.com/Strange500/min-btc-node) | Conservé | Réseau asynchrone multi-pairs, messages de filtres compacts, code GCS et suivi d’UTXO dans le gestionnaire. Le README place encore certaines de ces capacités dans la roadmap : la description est corroborée par le code. |
| [nixos-config](https://github.com/Strange500/nixos-config) | Conservé | Modules réutilisables, flake, configurations et checks ; complète le profil backend avec l’infrastructure. |
| [QGChat](https://github.com/Strange500/QGChat) | Alternative pour une candidature Java web | MVC/DAO/SQL et REST ; le CV montre déjà une expérience web plus récente chez Numih. |
| [ascii-cube-rs](https://github.com/Strange500/ascii-cube-rs) | Alternative Rust/WASM et interfaces | Démonstration publique, exports WASM et intégration réelle au portfolio. |
| [pico-ledger](https://github.com/Strange500/pico-ledger) | Alternative embarqué | Firmware, cœur portable et tests sur hôte ; conserver la qualification de prototype. |
| [telegram-spring](https://github.com/Strange500/telegram-spring) | Non retenu sur cette page | Stack pertinente mais périmètre de chat plus réduit que la plateforme Numih. |
| [RayTracer-Rust](https://github.com/Strange500/RayTracer-Rust) | Alternative Rust | BVH et comparaisons d’images ; la version Java sert mieux le positionnement choisi et dispose d’une présentation d’entrée plus complète. |

Les forks, exercices d’apprentissage et simples roadmaps n’ont pas été mis en
avant comme réalisations complètes. Aucun contenu privé n’est reproduit.

### Validation

```sh
node scripts/test-resume-content.mjs
python3 scripts/test-resume-preview.py
VIRTUAL_ENV=/path/to/pdf-venv ./scripts/generate-resume.sh
/path/to/pdf-venv/bin/python scripts/test-resume-pdf.py --output /tmp/cv-review
```

Dépendances du venv de validation : WeasyPrint 70.0 et PyMuPDF. Le contrôle de
contenu et la concordance des JSON générés sont désormais exécutés en CI, avec
les tests HTML déjà présents. Le contrôle PDF lit les fichiers réellement livrés :
une page A4 FR/EN, textes intégraux extractibles, neuf cibles de liens dans chaque
version, alias identiques, aucun mot superposé ou hors page. Les PNG ont été
inspectés visuellement. Une épreuve papier à taille réelle reste utile.

## Historique des validations précédentes

## État actuel : cartes équilibrées et liens courts (suite de #33)

Base : `08348d8` (#33 ouverte, contenant #32 fusionnée). Nouvelle branche dédiée,
avec la branche de #33 comme base pour isoler cette suite. Les trois JSON sources
et le badge TOEIC restent inchangés ; aucun fait, score, date ou réalisation modifié.

- Liens projets : `GitHub` ; billet nixos-config : `Article` (FR) / `Deep dive`
  (EN). Les cibles complètes restent cliquables et identiques.
- Les cellules portent les fonds/bordures : hauteur égale par rangée sans hauteur
  fixe ni troncature. Une carte impaire ne produit pas de carte vide décorative.
- Suppression du `width: 50%` des cellules, qui élargissait la grille avec les
  paddings/gouttières. Le retrait horizontal est désormais symétrique.
- Dates, liens, tags, coordonnées et mots-clés techniques passent à **7,5 pt**
  (contre 7 ou 7,2 pt). Corps, palette, rubriques et descriptions conservés.

### Résultats de cette suite

- Tests : **5 OK**, dont les deux nouvelles régressions en RED puis GREEN
  (libellés/cibles EN-FR, non-mutation des données, cartes paires/impaires).
- Build Next.js réussi, TypeScript et **14 pages** inclus ; `git diff --check` OK.
- EN : **1 page A4**, 542 mots, dernier texte à **751,58 pt**.
- FR : **1 page A4**, 616 mots, dernier texte à **801,58 pt**.
- Minimum **7,5 pt** ; aucun mot ou lien hors page ; aucun chevauchement de mots
  > 0,5 pt dans les deux axes ; aucune image ; quatre alias PDF cohérents.
- **12 cibles URI inchangées par langue**. Multiensemble de mots conservé sauf
  les substitutions exactes des libellés de liens projets, explicitement autorisées
  par `--compact-project-links-baseline` ; sans cette option, comparaison stricte.
- Mesures WeasyPrint : mêmes largeurs/hauteurs dans chaque paire ; hauteurs EN
  **74,68 / 64,54 / 54,40 pt**, FR **74,68 / 64,54 / 64,55 pt** ; marges
  projets gauche/droite **29,48 pt**.
- PNGs finaux à **144 dpi**, **inspection d'image réussie EN et FR** : cartes
  équilibrées par paire, marges symétriques, liens courts lisibles, TOEIC visible,
  aucun débordement apparent. Le blocage vision historique ci-dessous ne s'est
  pas reproduit ; ces observations remplacent les anciennes limites visuelles.
- ESLint brut : dette existante et `.next`, **28436 erreurs / 8 avertissements**.
  Hors `.next` : **8 erreurs / 8 avertissements**, mêmes diagnostics que #33.
  Aucun fichier JS/TS modifié ; aucune correction hors périmètre.

Commandes spécifiques (Python scratch avec WeasyPrint 70.0/PyMuPDF et PangoFT2
Debian via `LD_LIBRARY_PATH`, aucune installation système) :

```sh
python scripts/test-resume-preview.py
"$VIRTUAL_ENV/bin/python" scripts/render-resume.py resume-fr.json public/resume-fr.pdf --lang fr
"$VIRTUAL_ENV/bin/python" scripts/render-resume.py resume-en.json public/resume.pdf --lang en
cp public/resume-fr.pdf public/cv-fr.pdf
cp public/resume.pdf public/resume-en.pdf
"$VIRTUAL_ENV/bin/python" scripts/check-resume-layout.py --baseline 08348d8 --compact-project-links-baseline
npm run build
npm run lint
npm exec -- eslint . --ignore-pattern '.next/**' --format json
git diff --check
```

Les hauteurs sont équilibrées par rangée, pas artificiellement sur toute la grille.
Les petits textes restent compacts à 7,5 pt ; une épreuve imprimée à taille réelle
reste utile. Aucun changement factuel, refonte ATS ou déploiement inclus.

## Historique des PR #32 / #33 (avant cette suite)

Les résultats et limites ci-dessous décrivent les exécutions antérieures, pas les
PNGs courants ni le fonctionnement actuel de l'inspection d'image.

- [Preview anglaise, pleine page](resume-en.png)
- [Preview française, pleine page](resume-fr.png)
- PDFs déployables : [`resume.pdf`](../../public/resume.pdf),
  [`resume-fr.pdf`](../../public/resume-fr.pdf) et leurs alias.

## Diagnostic reproduit

L'analyse d'image échoue **avant toute inspection** : `vision_analyze` renvoie
HTTP 404 avec le message fournisseur exact :

> Qwen3 VL 32B Instruct was deprecated on Oct 9, 2026. We recommend migrating to Qwen3.7 Plus (openrouter.ai/qwen/qwen3.7-plus).

L'échec est reproduit sur un ancien PNG puis sur la nouvelle preview. Il s'agit
d'un routage vers un modèle de vision retiré, pas d'une corruption PDF/PNG.
La configuration du modèle n'est pas modifiée dans ce dépôt. **Aucune inspection
visuelle par modèle n'a donc réussi** ; ces PNGs permettent une revue humaine.

Un deuxième défaut, indépendant, empêchait la preview HTML du thème custom :
`render-resume.mjs` ignorait `--html` pour WeasyPrint. Sans les bibliothèques
natives, il tombait sur `nix-shell`, puis échouait avec
`file 'nixpkgs' was not found in the Nix search path`. Avec Pango disponible, il
écrivait des **octets PDF dans un fichier `.html`**, annoncé comme rendu A4.
La preview passe maintenant par Python standard, sans import WeasyPrint ni Nix,
et écrit un vrai document HTML. Le test initial échouait pour EN et FR avec
`ModuleNotFoundError: No module named 'weasyprint'` ; les tests corrigés passent.

## Ajustement mesuré, sans changement factuel

Analyse fondée sur le CSS et les métriques PDF, pas sur une vision réussie :

- Identité conservée : Inter/Fira Code, anthracite/indigo, fond clair, cartes,
  ordre des rubriques et grille projets à deux colonnes.
- Corps auparavant 7,35/7,45 pt et descriptions projets 6,95 pt malgré beaucoup
  d'espace en bas (EN : dernier texte à 659,23 pt sur 841,89 pt).
- Corps maintenant 8,1/8,25 pt ; descriptions projets 7,8 pt ; petits textes
  au minimum 7 pt. Titres et espacement de sections légèrement renforcés.
- Les catégories de compétences passent au-dessus des mots-clés pour ne plus
  réserver 104 pt d'une demi-colonne à chaque intitulé.
- Marges de 0,28 à 0,34 pouce ; titre de section solidaire du bloc suivant ;
  interligne formation augmenté pour les intitulés français sur deux lignes.
- En-tête centré sans photo pour les deux langues ; les données JSON, dates,
  intitulés, réalisations et liens restent inchangés.

### Suite de #32 : TOEIC visible dès l'en-tête

La PR #32 a été fusionnée avant cette suite. Ses améliorations sont conservées ;
le complément est proposé sur `fix/resume-toeic-highlight`, sans push sur `main`.

- La mention existante **TOEIC 980/990** passe dans un badge indigo de 8,5 pt
  en gras, sous les coordonnées, sur les deux CV. Le libellé source complet
  reste identique : `English (Professional — TOEIC 980/990)` /
  `Anglais (Courant — TOEIC 980/990)`.
- La mention est déplacée, pas dupliquée : la rubrique de bas de page garde
  le français natif et les centres d'intérêt. Le score est lu dans les JSON,
  jamais codé en dur dans le renderer ; toutes les données restent inchangées.
- Aucun niveau CECRL C1/C2, aucune date d'examen ni validité n'est inféré.
  Le dépôt donne le score, mais pas ces précisions.
- Nouveau test RED puis GREEN : présence dans l'en-tête EN/FR, occurrence
  unique, score lu dynamiquement, absence de badge sans TOEIC, données non mutées.
- L'inspection visuelle des PNG finaux a de nouveau été tentée et échoue avec
  le même HTTP 404 fournisseur ci-dessus. **Revue visuelle humaine à faire** ;
  les contrôles géométriques ci-dessous ne sont pas présentés comme une vision.

## Résultats réellement obtenus

Commandes exécutées à la racine (les chemins scratch sont propres à cet hôte) :

```sh
LD_LIBRARY_PATH=/opt/data/profiles/developer/cache/scratch/resume-europe-libs/usr/lib/x86_64-linux-gnu npm run resume
python scripts/test-resume-preview.py
PYTHONPATH=/opt/data/profiles/developer/cache/scratch/resume-visual-python python scripts/check-resume-layout.py --baseline origin/main
node scripts/render-resume.mjs --resume resume.json --html --output /opt/data/profiles/developer/cache/scratch/resume-after.html
node scripts/render-resume.mjs --resume resume-fr.json --lang fr --output /opt/data/profiles/developer/cache/scratch/resume-fr-after.html
npm run build
npm run lint
npm exec -- eslint . --ignore-pattern '.next/**' --format json
git diff --check
```

- Génération EN/FR et quatre PDFs : succès. WeasyPrint 70.0 ; bibliothèque
  Debian PangoFT2 extraite dans le scratch, sans installation système.
- Tests preview : `Ran 3 tests ... OK` (avec régression TOEIC EN/FR),
  également ajoutés à la CI ; import Python `-S` testé sans dépendances.
- EN : une page A4, 541 boîtes de mots dans la page, dernier texte à **764,46 pt**.
- FR : une page A4, 617 boîtes de mots dans la page, dernier texte à **804,32 pt**.
- Polices embarquées Inter/Fira Code ; minimum **7 pt** ; aucun mot ou lien
  hors page ; pas de chevauchement de boîtes de mots supérieur à 0,5 pt dans
  les deux axes ; aucune image ; alias PDF identiques.
- Les trois JSON sont identiques à `origin/main` ; le multiensemble des mots
  extraits de chaque PDF et les **12 cibles URI** par langue sont conservés.
- PNGs pleine page générés à 144 dpi depuis les PDFs finaux.
- Build Next.js : `Compiled successfully`, TypeScript terminé,
  `Generating static pages ... (14/14)`.
- `git diff --check` et contrôle syntaxique Node : succès.
- Lint brut : échec préexistant, **28436 erreurs / 8 avertissements**, incluant
  les fichiers générés `.next`. Hors `.next` : **8 erreurs / 8 avertissements**.
  Comparaison du fichier JS modifié avec `origin/main` : aucun nouveau
  diagnostic ; l'erreur préexistante `opts` inutilisé disparaît ; `basename`
  et `require` inutilisés restent hors périmètre.
- Schéma JSON Resume v1.0.0 : les deux erreurs préexistantes par JSON sur
  `work[0].endDate` / `education[0].endDate` vides restent identiques à la base.

## Limites

Les coordonnées et l'extraction textuelle ne remplacent pas un jugement visuel
humain. La grille existante n'est pas convertie en une nouvelle maquette ATS
monocolonne ; aucune refonte ni modification du site n'est incluse. Les petits
textes à 7 pt restent compacts. La preview HTML ne prouve pas la pagination du
PDF ; les PNGs ci-dessus sont rasterisés depuis les PDFs réellement générés.
