# À vous de jouer !

Un compteur de points en français, conçu d’abord pour le téléphone et utilisable sur ordinateur. Un seul appareil suffit pour toute la table.

Jeux disponibles : **Skyjo, Hilo, 6 qui prend !, Flip 7, UNO classique, Phase 10**, et un **mode Jeu libre**.

## Utilisation

1. Choisissez un jeu et le nombre de joueurs, puis entrez les prénoms.
2. À la fin de chaque manche, ajoutez les points. Le compteur applique les règles de score et actualise le classement.
3. Retrouvez les manches dans le carnet pour les corriger ou annuler la dernière.

Les règles de score et leurs sources sont accessibles depuis chaque jeu. Les objectifs personnalisés sont des variantes maison. Pour UNO, seul le gagnant de la manche reçoit les points des cartes restantes chez ses adversaires. Phase 10 suit aussi la progression de chaque participant et gère le départage final.

## Démarrer en local

Prérequis : Python 3. Aucune installation de dépendances ni compilation.

```bash
python3 -m http.server 8080 --bind 127.0.0.1
```

Ouvrez <http://127.0.0.1:8080>. L’ouverture directe de `index.html` par double-clic ne convient pas aux modules JavaScript.

## Publier sur GitHub Pages

1. Ajoutez les fichiers du projet à un dépôt GitHub et poussez-les sur la branche `main`.
2. Dans **Settings → Pages**, sélectionnez **Deploy from a branch**.
3. Choisissez la branche `main`, le dossier **/ (root)**, puis **Save**.
4. Ouvrez l’adresse indiquée par GitHub après le déploiement, généralement `https://votre-compte.github.io/votre-depot/`.

Les chemins sont relatifs : le site fonctionne aussi dans le sous-dossier d’un dépôt. Le fichier `.nojekyll` désactive le traitement Jekyll. Aucun serveur applicatif, compte ou service externe n’est nécessaire.

Référence : [configurer une source de publication GitHub Pages](https://docs.github.com/fr/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Sauvegarde et fonctionnement hors connexion

Les parties et les saisies en cours sont enregistrées dans le stockage local du navigateur. Elles restent sur cet appareil et ne sont pas synchronisées. La navigation privée ou l’effacement des données peut supprimer ces sauvegardes. Si le stockage est bloqué, un message le signale ; gardez alors la page ouverte.

Le bouton **Exporter les scores** télécharge les résultats au format CSV. Après un premier chargement complet en HTTPS ou sur `localhost`, le service worker met les fichiers en cache pour les utilisations hors connexion suivantes. Les liens vers les règles externes nécessitent Internet.

## Organisation et vérifications

- `index.html`, `styles.css` : structure et présentation adaptative.
- `src/games.js` : catalogue, règles et sources.
- `src/scoring.js` : calculs, classement et conditions de victoire.
- `src/app.js` : navigation, formulaires et sauvegarde.
- `assets/` : icône vectorielle ; les illustrations sont générées en SVG par le site.
- `sw.js` : cache hors connexion limité aux fichiers de l’application.
- `tests/` : vérifications des règles de calcul.

Avec Node.js 20 ou plus récent :

```bash
npm test
npm run check
```

Les tests utilisent uniquement le module natif `node:test`. Ils couvrent les pénalités, scores négatifs, seuils, égalités, bonus de Flip 7 et phases. Vérifiez aussi les parcours sur téléphone, au clavier et avec un zoom de 200 % après toute modification d’interface.

Les noms des jeux appartiennent à leurs titulaires respectifs. Ce compteur indépendant ne remplace pas leurs règles et n’utilise pas les illustrations des boîtes.
