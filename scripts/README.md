# Resume & CV Pipeline — Système de Thèmes

Génère les fichiers JSON Resume et les PDFs à partir de la source unique de vérité du portfolio. Le système supporte **n'importe quel thème `jsonresume-theme-*` de npm**, en plus du renderer custom WeasyPrint.

## Commandes rapides

```bash
# Pipeline complet (thèmes par défaut)
npm run resume

# Lister les thèmes disponibles
npm run resume:themes

# Regénérer uniquement le CV anglais avec un thème spécifique
./scripts/generate-resume.sh --theme-en even

# Regénérer les deux CVs avec des thèmes distincts
./scripts/generate-resume.sh --theme-en even --theme-fr flat

# Installer automatiquement un thème manquant
./scripts/generate-resume.sh --theme-en stackoverflow --install

# HTML seulement (pas de PDF, pour prévisualiser)
./scripts/generate-resume.sh --theme-en even --html
```

## Changer le thème par défaut

Éditez [`scripts/themes.config.json`](./themes.config.json) :

```json
{
  "en": "even",
  "fr": "weasyprint"
}
```

Le pipeline `npm run resume` utilisera automatiquement ces thèmes.

## Thèmes disponibles

| Nom           | Type        | Description                                                  |
| ------------- | ----------- | ------------------------------------------------------------ |
| `weasyprint`  | custom      | Mise en page ATS monocolonne (Inter + Fira Code). **Défaut EN & FR.** |
| `even`        | npm         | Thème flat propre par @rbardini. Web fonts. Idéal pour partage en ligne. |
| `flat`        | npm         | Thème flat minimaliste. Bon contraste.                       |
| `stackoverflow` | npm       | Design inspiré de StackOverflow.                             |
| `elegant`     | npm         | Disposition deux colonnes élégante.                          |
| `spartan`     | npm         | Ultra-minimaliste, adapté ATS.                               |
| `kendall`     | npm         | Design simple et propre.                                     |
| _any_         | npm         | Tout `jsonresume-theme-<name>` sur npm fonctionne.           |

Pour ajouter un thème non listé, ajoutez-le dans `scripts/themes.config.json` :

```json
"available": {
  "mon-theme": {
    "package": "jsonresume-theme-mon-theme",
    "description": "Ma description",
    "renderer": "node"
  }
}
```

Puis installez-le : `npm install --save-dev jsonresume-theme-mon-theme`

## Architecture

```
scripts/
├── generate-resume.mjs   # Données → JSON Resume (EN + FR)
├── render-resume.mjs     # Renderer universel (thèmes npm + weasyprint)
├── render-resume.py      # Renderer custom WeasyPrint (thème "weasyprint")
├── themes.config.json    # Registre des thèmes (éditable)
├── generate-resume.sh    # Orchestrateur CLI
└── README.md
```

### Fonctionnement de `render-resume.mjs`

1. Lit `themes.config.json` pour résoudre le thème.
2. **Si `renderer: "weasyprint"`** → délègue à `render-resume.py` (Python/WeasyPrint, déjà fonctionnel sur NixOS via `nix-shell`).
3. **Si `renderer: "node"`** :
   - Importe dynamiquement le package npm `jsonresume-theme-<name>`.
   - Appelle `theme.render(data)` → HTML.
   - Convertit HTML → PDF via Puppeteer + Chromium (auto-détecté : `PUPPETEER_EXECUTABLE_PATH` > PATH > `nix-shell -p chromium`).

## Artefacts générés

| Fichier                  | Format    | Thème   | Description                        |
| ------------------------ | --------- | ------- | ---------------------------------- |
| `public/resume.pdf`      | US Letter | EN      | CV anglais ATS                     |
| `public/resume-en.pdf`   | US Letter | EN      | Alias du CV anglais                |
| `public/resume-fr.pdf`   | A4        | FR      | CV français                        |
| `public/cv-fr.pdf`       | A4        | FR      | Alias du CV français               |

## Dépendances

- **Node ≥ 22** (pipeline JSON) / **≥ 24** pour `resumed` si utilisé directement.
- **WeasyPrint** (Python) — auto-provisionné via `nix-shell -p python3Packages.weasyprint` sur NixOS.
- **Chromium** — auto-provisionné via `nix-shell -p chromium` pour les thèmes npm.
- **puppeteer-core** — installé comme devDependency (`npm install`).