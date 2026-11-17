# Revue de la page principale

## Diagnostic

La signature visuelle est pertinente : un vrai objet ASCII, une palette sombre
et une progression qui relie les sujets. La faiblesse principale était la
concurrence entre cette scène et la lecture, particulièrement sur téléphone. La
page devait mieux présenter la personne, faciliter le parcours des preuves et
rendre les actions finales cohérentes avec le reste du site.

| Observation dans le navigateur                          | Effet sur la lecture                                       | Correction                                                                                                |
| ------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Présentation abstraite avant l’identité professionnelle | Le visiteur doit chercher qui parle et ce qu’il fait       | Nom et métier dans l’introduction, CTA explicite, titre de page traduit                                   |
| Cube mobile et navigation sur deux rangées              | Une grande partie du viewport reste indisponible pour lire | Cube mobile compact, navigation sur une rangée, espace réservé au-dessus du texte                         |
| Titres mobiles très grands et textes utiles à 10–12px   | Hiérarchie déséquilibrée, retours à la ligne difficiles    | Titres moins envahissants ; paragraphes, contexte et liens agrandis                                       |
| Trois grandes étiquettes couvrent l’objet               | La navigation concurrence la matière ASCII                 | Étiquette active visible ; les autres apparaissent au survol, avec navigation textuelle permanente        |
| Quatre preuves empilées, chiffres animés                | Parcours long et valeurs provisoires pendant le comptage   | Grille de preuves à deux colonnes lorsque l’espace le permet ; valeurs exactes stables dès le rendu HTML  |
| Missions détaillées répétant les thèmes déjà présentés  | Longue séquence peu facile à parcourir                     | Études de cas dépliables natives, accessibles au clavier ; problème, choix, résultat et sources conservés |
| Bouton CV blanc/bleu sur la palette olive               | Rupture de style et contraste faible du libellé            | Bouton et menu cohérents, liens PDF explicites, sans indication de format papier non vérifiée             |
| Sélecteur de thème sans effet sur la page sombre        | Action sans résultat visible                               | Masqué sur la page principale ; maintenu dans le blog                                                     |
| Langue indiquée comme état plutôt que destination       | Action ambiguë                                             | Bouton annonçant la langue cible, mise à jour de la langue du document                                    |

## Principes retenus

Le cube reste persistant et calculé par Rust/WASM. Le gros plan conserve sa
place dans la première transition ; les poses de lecture sont plus discrètes.
Aucun moteur alternatif ni résultat chiffré n’est ajouté.

La page conserve des titres expressifs mais donne une priorité réelle aux textes
et aux sources : introduction à 16px, contexte des preuves à 14px, notes à 12px
et liens à 13px. Les unités et valeurs publiées sont conservées, sans comptage
transitoire. Le terminal illustre les véritables commandes de compilation ; la
fausse commande décorative du panneau de preuves est retirée.

La navigation mobile garde les six destinations visibles et des cibles hautes
d’au moins 44px. Les missions utilisent `details` / `summary` : elles restent
utilisables sans JavaScript. Les fenêtres et menus ont une largeur bornée par le
viewport, un focus visible et des couleurs lisibles. Le menu CV conserve les
deux PDF et le retour de focus après Échap.

## Vérification et livraison

Les commandes générales sont décrites dans
[le guide de développement](local-development.md). Le contrôle spécifique de
cette revue est :

```sh
CHROME_PATH=/usr/bin/chromium \
PORTFOLIO_URL=http://localhost:3100 \
REVIEW_DIR="$PWD/work/design-review" \
node scripts/test-homepage-design.mjs
```

Il vérifie FR/EN, les largeurs 320/390/768/1024/1440/1920, les débordements, les
valeurs et leur encombrement, l’espace de lecture mobile, la navigation
complète, les missions au clavier, le menu CV et ses deux PDF, le changement de
langue et les erreurs JavaScript. La suite de scène existante couvre en
complément le scroll, les six faces, le toucher, la pause et la réduction des
animations.

La CI dispose d’un contrôle Nix du paquet portfolio seul. Le hash npm de cette
branche a été recalculé avec `prefetch-npm-deps` et correspond à celui de la
flake. L’échec antérieur du build global Server concernait le lockfile de
l’input de production, indépendant du preview. Son pin n’est pas modifié ici. La
validation du paquet de test ne doit pas être confondue avec une activation sur
l’hôte distant, qui nécessite toujours son accès SSH/mTLS.
