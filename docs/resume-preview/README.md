# CV — previews et contrôle visuel

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
