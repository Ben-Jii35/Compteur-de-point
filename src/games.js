export const PHASES = ['Deux brelans', 'Un brelan + une suite de 4', 'Un carré + une suite de 4', 'Une suite de 7', 'Une suite de 8', 'Une suite de 9', 'Deux carrés', '7 cartes de la même couleur', 'Un groupe de 5 + une paire', 'Un groupe de 5 + un brelan'];

export const GAMES = [
  { id: 'skyjo', name: 'Skyjo', min: 2, max: 8, target: 100, direction: 'low', color: 'mint', tag: 'Le classique', description: 'Gardez les petites cartes, visez le petit score.', detail: 'Le plus petit score gagne', symbol: '12', rules: [
    'Additionnez les cartes restantes de votre grille. Les colonnes de trois cartes identiques retirées ne comptent pas. Les scores négatifs sont acceptés.',
    'Indiquez qui a terminé la manche. Si son score est positif et qu’un adversaire fait autant ou moins, ses points de la manche sont doublés automatiquement.',
    'La partie se termine après la manche où quelqu’un atteint 100 points. Le plus petit total gagne ; les ex æquo partagent la victoire.'
  ], source: 'https://cdn.1j1ju.com/medias/ee/b8/88-skyjo-regle.pdf' },
  { id: 'hilo', name: 'Hilo', min: 2, max: 6, target: 100, direction: 'low', color: 'peach', tag: 'Tout en couleurs', description: 'Alignez les couleurs, faites fondre les points.', detail: 'Le plus petit score gagne', symbol: '3', rules: [
    'Additionnez les cartes restant dans votre grille de 3 × 3. Trois cartes de même couleur en ligne, colonne ou diagonale peuvent être retirées, y compris au dévoilement final.',
    'Le joueur qui termine la manche double son score s’il n’est pas strictement le plus bas. Sélectionnez-le : le compteur applique ce calcul.',
    'La partie s’arrête après la manche où quelqu’un atteint 100 points. Le plus petit total gagne ; plusieurs gagnants sont possibles.'
  ], source: 'https://www.ludism.fr/regles_files/fr/upload/hilo_-_SCHMIDT_49362_s.d._-_site.pdf' },
  { id: 'six', name: '6 qui prend !', min: 2, max: 10, target: 66, direction: 'low', color: 'lavender', tag: 'Gare au troupeau', description: 'Les têtes de bœuf, c’est pour les autres !', detail: 'Le plus petit score gagne', symbol: '6', rules: [
    'À la fin des dix tours, comptez les têtes de bœuf sur les cartes ramassées, et non les numéros des cartes.',
    'Saisissez ce nombre pour chaque joueur. Les pénalités s’ajoutent d’une manche à l’autre.',
    'Dès qu’un joueur atteint 66 têtes de bœuf, terminez la manche. Le plus petit total gagne.'
  ], source: 'https://www.gigamic.com/plus-de-cinq-joueurs/58-6-qui-prend--3421272101337.html' },
  { id: 'flip7', name: 'Flip 7', min: 3, max: 20, target: 200, direction: 'high', color: 'yellow', tag: 'Encore une carte ?', description: 'Prenez des risques, faites grimper le score.', detail: 'Le plus grand score gagne', symbol: '7', rules: [
    'Saisissez le score final de chaque joueur. Un numéro en double sans seconde chance donne 0 point pour la manche.',
    'Le ×2 double uniquement la somme des cartes Numéro. Ajoutez ensuite les cartes Bonus et les 15 points d’un Flip 7. L’aide au calcul suit cet ordre.',
    'Après une manche à 200 points ou plus, le plus grand total gagne. En cas d’égalité en tête, continuez jusqu’à obtenir un seul gagnant.',
    'L’éditeur indique 3 joueurs ou plus. Le compteur accepte jusqu’à 20 participants ; adaptez le nombre de paquets aux grands groupes.'
  ], source: 'https://catchupgames.com/flip-7-faq/' },
  { id: 'uno', name: 'UNO', min: 2, max: 10, target: 500, direction: 'high', color: 'pink', tag: 'Une dernière carte', description: 'Videz votre main, récoltez les points.', detail: 'Le plus grand score gagne', symbol: '1', rules: [
    'Le gagnant de la manche marque la valeur des cartes restantes chez tous ses adversaires. Les autres marquent 0.',
    'Cartes numérotées : valeur indiquée. +2, Inversion et Passer : 20 points. Joker et +4 : 50 points. Le compteur concerne le UNO classique.',
    'Le premier à atteindre 500 points gagne. Si vous jouez en comptant les pénalités de chacun, utilisez plutôt le mode Jeu libre.'
  ], source: 'https://service.mattel.com/instruction_sheets/g7942-0720.pdf' },
  { id: 'phase10', name: 'Phase 10', min: 2, max: 6, target: null, direction: 'phase', color: 'blue', tag: 'Chacun sa phase', description: 'Dix défis à réussir, chacun à son rythme.', detail: 'Réussissez les 10 phases', symbol: '10', rules: [
    'À chaque manche, indiquez les pénalités et cochez « Phase réussie » pour les joueurs qui ont posé leur combinaison. Réussir sa phase suffit pour avancer, même sans gagner la manche.',
    'Cartes 1 à 9 : 5 points chacune. Cartes 10 à 12 : 10 points. Passer : 15 points. Joker : 25 points. Les cartes posées ne comptent pas.',
    'Le premier à réussir la phase 10 gagne à la fin de la manche. Si plusieurs y arrivent, le plus petit cumul de pénalités les départage. En cas d’égalité, ils rejouent la phase 10 ; le premier à vider sa main gagne.'
  ], source: 'https://service.mattel.com/instruction-sheets/files/FFY05%20Phase%2010%20%5BEnglish_French_German_Italian_Dutch%5D%20%5B5LD%5D.PDF' },
  { id: 'free', name: 'Jeu libre', min: 1, max: 20, target: 100, direction: 'high', color: 'neutral', tag: 'À votre façon', description: 'Votre jeu, vos règles. On compte pour vous.', detail: 'Un compteur à personnaliser', symbol: '+', rules: [
    'Choisissez un nom, le sens du classement et éventuellement un score de fin. Les scores positifs et négatifs sont acceptés.',
    'Ajoutez les points de chaque manche. Sans objectif, vous pouvez terminer la partie quand vous le souhaitez.'
  ] }
];
export const getGame = id => GAMES.find(game => game.id === id);
