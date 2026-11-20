# Portfolio : revue du contenu et des deux langues

Revue du 20 novembre 2026, après intégration des PR #50 et #51.

## Positionnement et ordre de lecture

La page présente un élève ingénieur qui recherche un stage backend/outillage de
juin 2027. L’accueil garde le rôle, la disponibilité, le CV et un accès direct à
Numih. L’en-tête commence par « Expérience » ; le parcours animé conserve sa courte
démonstration Rust puis présente Numih avant NixOS.

Ordre du document : accueil, cube Rust/WASM, expérience Numih, infrastructure
NixOS, projets Bitcoin, autres projets Java, contact. Sur mobile le défilement
reste natif. Les liens permettent d’aller directement à la partie recherchée.

Les chapitres de lecture et les six faces du cube ont des responsabilités
différentes. La navigation comporte maintenant sept liens, dont `#missions`,
avec un état actif propre à cette section. Les libellés « Projets / Projects »
sont partagés entre la barre, l’en-tête et le menu mobile. L’identifiant historique
`#missions` reste valide.

## Ce qui est conservé, allégé ou remplacé

| Contenu | Décision | Motif |
| --- | --- | --- |
| Disponibilité, CV, rôle et expérience Numih | Conserver en premier niveau | Informations utiles à une décision de recrutement rapide. |
| 50–70 tests et adaptation ~4 h à <10 min | Conserver et contextualiser | Périmètre et durée d’adaptation, pas durée d’exécution de toute la suite ; estimations issues de l’expérience. |
| ≈70 % de faux positifs en moins | Retirer de l’accueil et de la table de résultats de l’article | Période, dénominateur et calcul non disponibles ; le pourcentage n’apporte pas une preuve exploitable. |
| Outil de support pour ≈40 développeurs | Conserver comme réalisation distincte | Ne pas confondre répartition du support et accompagnement de quarante personnes. |
| Rust/WASM, NixOS et Bitcoin | Conserver avec un périmètre concret | Illustrent le rendu, l’infrastructure, le réseau et l’embarqué. Les projets Bitcoin restent des prototypes d’apprentissage. |
| Quatre fiches Missions répétant les chapitres précédents | Remplacer par deux projets complémentaires | RayTracer Java et QGChat ajoutent des preuves de Java, de tests, de SQL et d’architecture applicative. |
| Inventaires matériels, logiciels personnels et effets d’annonce | Alléger dans l’article Nix | Les décisions de composition, persistance, routage et validation expliquent mieux le travail. |

## Français et anglais

Les versions expriment la même intention sans imposer les mêmes tournures.
« Le travail, déplié » et « infrastructure accidentelle » ont disparu au profit de
libellés explicites. Les titres des sections disent désormais ce qu’elles montrent.
Le français de l’accueil utilise « la vue d’ensemble » plutôt que « tout le
système ». Les résultats et les liens vers le code restent présents dans les deux
langues. Les textes de protocole Bitcoin sont également localisés.

Les termes de domaine restent utilisés quand ils sont utiles : flake, build,
WebAssembly, API et noms de commandes. Le code n’est pas traduit artificiellement.

## Approche des articles

- **Numih : étude de cas professionnelle.** Structure conservée : existant, rôle,
  progression, architecture, interface et limites. Le backend est collectif et
  l’interface Angular a été réalisée intégralement par Benjamin. Le pourcentage
  non documenté n’est plus présenté dans les résultats.
- **Cube : étude d’implémentation.** L’ancien texte attribuait les quaternions à
  une API Rust fictive et associait WebAssembly à une vitesse native non mesurée.
  Le nouveau texte distingue moteur Rust, buffers, canvas et état d’orientation
  frontend. Le code d’inertie cité est celui de `lib/cube-orientation.ts`, vérifié
  par un test. Les dates fines de refonte non établies sont retirées.
- **NixOS : retour d’expérience d’exploitation.** Le texte présente les modules,
  les cibles, le routage, la persistance et les checks. Il distingue construction,
  activation et restauration ; six hôtes d’une ISO ; chiffrement et sécurité
  globale ; matrice x86_64 et cible ARM. L’extrait Traefik et les jobs cités ont
  été vérifiés dans le dépôt public, sans exécuter son infrastructure.

Les dates de publication initiales sont conservées et les mises à jour sont
identifiées. Les versions FR/EN conservent la même structure de sections et les
mêmes sources externes. Les anciens articles restent accessibles aux mêmes URL.

## Validation

```sh
node scripts/test-editorial-content.mjs
PORTFOLIO_URL=http://localhost:3116 CHROME_PATH=/usr/bin/chromium \
  node scripts/test-editorial-navigation.mjs
```

La suite navigateur teste la navigation réelle vers les projets au clavier et
sur mobile, l’état actif, l’ordre des chapitres, les liens des projets, les trois
articles et leurs diagrammes dans les deux langues. Les régressions desktop,
ultrawide, mobile, premier scroll et parcours recruteur complètent ce contrôle.
Les captures sont des vues de viewport ; elles ne constituent pas une mesure de
performance ni un test sur appareil physique.

Vues contrôlées : [projets desktop](validation/editorial-review/projects-desktop-fr.png),
[projets mobile](validation/editorial-review/projects-mobile-fr.png),
[article du cube](validation/editorial-review/cube-article-fr.png),
[NixOS en anglais et thème sombre](validation/editorial-review/nix-article-en-dark.png),
[accueil mobile](validation/editorial-review/intro-mobile-fr.png).

Les contrôles locaux passent : build et TypeScript, ESLint ciblé, cohérence
éditoriale, navigation effective FR/EN, 203 points ultrawide, états de lecture et
commandes desktop, cinq formats mobiles avec gestes tactiles, parcours recruteur,
premier scroll sans dérive et téléchargement des deux CV. Les suites d’entrée ont
été validées isolément après un échec du scénario de roue lors d’une exécution
parallèle de plusieurs navigateurs.
