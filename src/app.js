import { GAMES, PHASES, getGame } from './games.js';
import { totals, phases, roundScores, flipScore, outcome } from './scoring.js';

const KEY = 'a-vous-de-jouer-v1';
const main = document.querySelector('main');
const dialog = document.querySelector('#dialog');
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
let data = { sessions: [], drafts: {} };
let storageAvailable = true;
let setup = null;
let filter = 'all';
let toastTimer;

try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (saved?.sessions && Array.isArray(saved.sessions)) {
    data.sessions = saved.sessions.filter(s => getGame(s.gameId) && typeof s.id === 'string' && Array.isArray(s.players) && s.players.length > 0 && s.players.every(p => typeof p === 'string') && Array.isArray(s.rounds) && s.rounds.every(r => Array.isArray(r.scores) && r.scores.length === s.players.length && r.scores.every(Number.isFinite)));
    data.drafts = saved.drafts && typeof saved.drafts === 'object' ? saved.drafts : {};
  }
} catch { storageAvailable = false; }

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); storageAvailable = true; }
  catch { storageAvailable = false; toast('La sauvegarde est indisponible. Gardez cette page ouverte pour conserver la partie.'); }
}

function toast(message) {
  const element = document.querySelector('#toast');
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { element.hidden = true; }, 5500);
}

function illustration(game, large = false) {
  const c = { mint: ['#176b57', '#eeaf5c', '#9ec5a4'], peach: ['#d65e3f', '#e4ab44', '#368770'], lavender: ['#6c59a0', '#9e88c7', '#d48c78'], yellow: ['#b76617', '#e5aa29', '#e4c86f'], pink: ['#b94c61', '#db8f7a', '#edbd57'], blue: ['#426caa', '#80a0c1', '#d19c4e'], neutral: ['#577169', '#98aba1', '#d8c6a2'] }[game.color];
  return `<svg class="card-art${large ? ' large-art' : ''}" viewBox="0 0 220 150" aria-hidden="true"><circle cx="112" cy="79" r="58" fill="${c[1]}" opacity=".13"/><g transform="rotate(-17 84 78)"><rect x="43" y="29" width="66" height="92" rx="10" fill="${c[2]}"/><rect x="50" y="36" width="52" height="78" rx="6" fill="none" stroke="white" stroke-opacity=".55" stroke-width="2"/><path d="M62 60h28M62 72h28M62 84h28M62 96h28" stroke="white" stroke-opacity=".3" stroke-width="5"/></g><g transform="rotate(12 130 77)"><rect x="94" y="24" width="69" height="98" rx="10" fill="${c[0]}"/><rect x="101" y="31" width="55" height="84" rx="6" fill="none" stroke="white" stroke-opacity=".45" stroke-width="2"/><text x="128" y="91" text-anchor="middle" fill="#fffdf3" font-size="43" font-weight="800" font-family="system-ui, sans-serif">${game.symbol}</text><circle cx="109" cy="41" r="3" fill="#fffdf3"/><circle cx="148" cy="105" r="3" fill="#fffdf3"/></g><path d="M178 44v12m-6-6h12M36 103v9m-4.5-4.5h9" stroke="${c[0]}" stroke-width="2" stroke-linecap="round"/><circle cx="179" cy="108" r="4" fill="${c[1]}"/></svg>`;
}

function heroArt() {
  return `<svg class="hero-art" viewBox="0 0 400 250" aria-hidden="true"><ellipse cx="208" cy="215" rx="133" ry="14" fill="#244e3c" opacity=".08"/><circle cx="219" cy="120" r="103" fill="#e8edda"/><g transform="rotate(-17 132 131)"><rect x="71" y="41" width="102" height="151" rx="14" fill="#efb457"/><rect x="80" y="50" width="84" height="133" rx="9" fill="none" stroke="#fff9ed" stroke-width="2"/><text x="122" y="143" text-anchor="middle" fill="#fff9ed" font-family="system-ui" font-size="69" font-weight="800">7</text></g><g transform="rotate(12 231 128)"><rect x="173" y="39" width="107" height="157" rx="14" fill="#176b57"/><rect x="182" y="48" width="89" height="139" rx="9" fill="none" stroke="#a4cab3" stroke-width="2"/><text x="226" y="145" text-anchor="middle" fill="#fff9ed" font-family="system-ui" font-size="68" font-weight="800">3</text><circle cx="194" cy="61" r="4" fill="#f9e6bd"/><circle cx="259" cy="174" r="4" fill="#f9e6bd"/></g><g transform="rotate(15 301 184)"><rect x="271" y="154" width="61" height="61" rx="13" fill="#f7e2cf" stroke="#cb7756" stroke-width="2"/><g fill="#b55c40"><circle cx="286" cy="169" r="4"/><circle cx="316" cy="169" r="4"/><circle cx="301" cy="184" r="4"/><circle cx="286" cy="199" r="4"/><circle cx="316" cy="199" r="4"/></g></g><path d="M307 53v20m-10-10h20M53 149v14m-7-7h14" stroke="#a48243" stroke-width="3" stroke-linecap="round"/><circle cx="99" cy="22" r="5" fill="#d98061"/><path d="m325 107 7 8-7 8-7-8z" fill="#9cba9e"/></svg>`;
}

const playerLabel = game => game.id === 'flip7' ? '3 joueurs et +' : `${game.min} à ${game.max} joueurs`;
const nameOf = session => session.name || getGame(session.gameId).name;
const sessionById = id => data.sessions.find(s => s.id === id);
const avatar = (name, index) => `<span class="avatar avatar-${index % 6}" aria-hidden="true">${esc([...name][0]?.toUpperCase() || '?')}</span>`;
const back = (href, label = 'Retour') => `<a class="back-link" href="${href}"><span aria-hidden="true">←</span> ${label}</a>`;
const button = (label, action, extra = '', style = 'primary') => `<button type="button" class="button ${style}" data-action="${action}" ${extra}>${label}</button>`;

function showDialog(title, content) {
  dialog.innerHTML = `<div class="dialog-header"><h2 id="dialog-title">${title}</h2><button class="icon-button" type="button" data-action="close-dialog" aria-label="Fermer">×</button></div>${content}`;
  dialog.showModal();
}

function showRules(game) {
  showDialog(`Compter les points · ${esc(game.name)}`, `<ol class="rules-list">${game.rules.map(rule => `<li>${esc(rule)}</li>`).join('')}</ol>${game.source ? `<a class="source-link" href="${game.source}" target="_blank" rel="noopener noreferrer">Consulter les règles de référence ↗ <span class="sr-only">(nouvel onglet)</span></a>` : ''}<p class="small muted">Un objectif modifié dans les réglages est une variante maison.</p>${button('C’est compris', 'close-dialog', '', 'primary full')}`);
}

function home() {
  setup = null;
  const recent = [...data.sessions].sort((a, b) => b.updated - a.updated);
  const ongoing = recent.find(s => !outcome(s).ended);
  main.innerHTML = `<section class="hero"><div class="hero-copy"><span class="eyebrow"><span class="little-line"></span> LE COMPTE EST BON, LA SOIRÉE AUSSI</span><h1>Les jeux sur la table.<br>Les points <span>dans la poche.</span></h1><p>Choisissez votre jeu, rassemblez vos joueurs.<br class="desktop-break"> On s’occupe des points, vous profitez de la partie.</p><div class="hero-notes"><span><span aria-hidden="true">✓</span> Sans inscription</span><span><span aria-hidden="true">✓</span> Simple, pour tout le monde</span></div></div>${heroArt()}</section>
    ${ongoing ? `<section class="resume-banner" aria-label="Partie en cours"><span class="resume-icon" aria-hidden="true">↻</span><div><strong>La partie vous attend</strong><p>${esc(nameOf(ongoing))} · ${ongoing.players.length} joueurs · ${ongoing.rounds.length} manche${ongoing.rounds.length > 1 ? 's' : ''} jouée${ongoing.rounds.length > 1 ? 's' : ''}</p></div><a class="button primary" href="#partie/${ongoing.id}">Reprendre <span aria-hidden="true">→</span></a></section>` : ''}
    ${!storageAvailable ? '<p class="notice warning">La sauvegarde locale est indisponible dans ce navigateur. Gardez cette page ouverte pendant la partie.</p>' : ''}
    <section class="catalogue" aria-labelledby="games-title"><div class="section-top"><div><span class="eyebrow">À QUOI ON JOUE ?</span><h2 id="games-title">Un jeu, et c’est parti.</h2></div><label class="filter-label">Autour de la table<select id="player-filter"><option value="all">Tous les joueurs</option>${[2, 3, 4, 5, 6, 7, 8, 10].map(n => `<option value="${n}" ${filter === String(n) ? 'selected' : ''}>${n} joueurs</option>`).join('')}</select></label></div>
    <div class="games-grid">${GAMES.filter(g => g.id !== 'free' && (filter === 'all' || (g.min <= Number(filter) && g.max >= Number(filter)))).map(g => `<a class="game-card ${g.color}" href="#jeu/${g.id}"><div class="game-card-top"><span class="game-tag">${g.tag}</span><span class="card-arrow" aria-hidden="true">↗</span></div>${illustration(g)}<div class="game-card-copy"><h3>${g.name}</h3><p>${g.description}</p><div class="game-card-footer"><span><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="7" cy="6" r="3"/><path d="M1.5 17v-2a5.5 5.5 0 0 1 11 0v2M13 3a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3.5 5"/></svg>${playerLabel(g)}</span><span class="play-label">Jouer <span aria-hidden="true">→</span></span></div></div></a>`).join('')}</div></section>
    <a href="#jeu/free" class="free-card"><span class="free-icon" aria-hidden="true">＋</span><div><h3>Un autre jeu en tête ?</h3><p>Vos règles, vos joueurs, notre compteur.</p></div><span class="free-link">Créer un jeu libre <span aria-hidden="true">→</span></span></a>
    ${recent.length ? `<section class="recent-section"><div class="section-top"><h2>Vos dernières parties</h2><span class="small muted">Sur cet appareil</span></div><div class="recent-list">${recent.slice(0, 8).map(s => `<a class="recent-item" href="#partie/${s.id}"><span class="recent-dot ${getGame(s.gameId).color}" aria-hidden="true"></span><div><strong>${esc(nameOf(s))}</strong><span>${esc(s.players.join(', '))}</span></div><span class="status-pill">${outcome(s).ended ? 'Terminée' : 'En cours'}</span><span aria-hidden="true">→</span></a>`).join('')}</div></section>` : ''}
    <div class="home-tip"><span aria-hidden="true">♡</span><p><strong>Le plaisir de jouer, tout simplement.</strong> Un téléphone pour toute la table. Les scores restent sauvegardés sur cet appareil.</p></div>`;
}

function setupPage(game) {
  if (!setup || setup.gameId !== game.id) setup = { gameId: game.id, count: Math.max(4, game.min), names: [], target: game.target, direction: game.direction, name: '' };
  const existing = data.sessions.find(s => s.gameId === game.id && !outcome(s).ended);
  main.innerHTML = `<div class="narrow">${back('#accueil', 'Tous les jeux')}<section class="setup-heading"><div><span class="eyebrow">PRÉPARER LA PARTIE</span><h1>${game.name}</h1><p>${game.detail} · ${playerLabel(game)}</p></div><div class="setup-art ${game.color}">${illustration(game)}</div></section>
    ${existing ? `<p class="notice">Une partie est déjà en cours. <a href="#partie/${existing.id}">La reprendre →</a></p>` : ''}
    <form id="setup-form" class="panel"><div class="panel-title"><span class="step-number">1</span><h2>Qui joue ?</h2></div><div class="counter-row"><div><strong>Nombre de joueurs</strong><p class="small muted">${game.id === 'flip7' ? 'De 3 à 20 dans ce compteur' : `De ${game.min} à ${game.max} participants`}</p></div><div class="counter"><button type="button" aria-label="Retirer un joueur" data-action="count" data-delta="-1" ${setup.count <= game.min ? 'disabled' : ''}>−</button><output aria-live="polite">${setup.count}</output><button type="button" aria-label="Ajouter un joueur" data-action="count" data-delta="1" ${setup.count >= game.max ? 'disabled' : ''}>+</button></div></div>
    <div class="names-grid">${Array.from({ length: setup.count }, (_, i) => `<label class="name-field">${avatar(String(i + 1), i)}<span class="sr-only">Prénom du joueur ${i + 1}</span><input name="player-${i}" autocomplete="off" maxlength="24" placeholder="Joueur ${i + 1}" value="${esc(setup.names[i] || '')}"></label>`).join('')}</div><p class="small muted">Entrez les prénoms, ou gardez « Joueur 1 », « Joueur 2 »…</p>
    ${game.id === 'free' ? `<label class="field">Nom de votre jeu<input name="game-name" maxlength="40" value="${esc(setup.name)}" placeholder="Notre partie"></label><label class="field">Qui gagne ?<select name="direction"><option value="high" ${setup.direction === 'high' ? 'selected' : ''}>Le plus grand score</option><option value="low" ${setup.direction === 'low' ? 'selected' : ''}>Le plus petit score</option></select></label>` : ''}
    ${game.target !== null ? `<details class="settings" ${game.id === 'free' ? 'open' : ''}><summary>${game.id === 'free' ? 'Quand terminer ?' : 'Personnaliser la fin de partie'}</summary><label class="field">Score de fin<input name="target" type="number" inputmode="numeric" min="1" max="99999" step="1" value="${setup.target ?? ''}" ${game.id !== 'free' ? 'required' : ''}></label><p class="small muted">${game.id === 'free' ? 'Laissez vide pour terminer quand vous le souhaitez.' : `Règle habituelle : ${game.target} points. Une autre valeur est une variante maison.`}</p></details>` : ''}
    <p id="form-error" class="error" role="alert" hidden></p><button class="button primary full start-button" type="submit">C’est parti ! <span aria-hidden="true">→</span></button></form><button type="button" class="rules-button" data-action="rules" data-game="${game.id}"><span aria-hidden="true">ⓘ</span> Comment compter les points ?</button></div>`;
}

function captureSetup() {
  const form = document.querySelector('#setup-form');
  if (!form || !setup) return;
  const values = new FormData(form);
  setup.names = Array.from({ length: setup.count }, (_, i) => String(values.get(`player-${i}`) || ''));
  setup.name = String(values.get('game-name') || '');
  if (values.has('target')) setup.target = values.get('target') === '' ? null : Number(values.get('target'));
  if (values.has('direction')) setup.direction = values.get('direction');
}

function error(message) {
  const element = document.querySelector('#form-error');
  if (element) { element.textContent = message; element.hidden = false; element.scrollIntoView({ block: 'nearest' }); }
}

function createSession() {
  captureSetup();
  const players = setup.names.map((name, i) => name.trim() || `Joueur ${i + 1}`);
  if (new Set(players.map(p => p.toLocaleLowerCase('fr'))).size !== players.length) return error('Donnez un prénom différent à chaque joueur pour bien les reconnaître.');
  if (setup.target !== null && (!Number.isInteger(setup.target) || setup.target < 1 || setup.target > 99999)) return error('Choisissez un score de fin entier entre 1 et 99 999.');
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  data.sessions.push({ id, gameId: setup.gameId, name: setup.name.trim(), players, target: setup.target, direction: setup.direction, rounds: [], updated: Date.now() });
  persist();
  location.hash = `partie/${id}`;
}

function scoreboard(session) {
  const game = getGame(session.gameId);
  const scores = totals(session);
  const currentPhases = phases(session);
  const result = outcome(session);
  const ranked = session.players.map((name, index) => ({ name, index, score: scores[index], phase: currentPhases[index] })).sort((a, b) => session.direction === 'phase' ? b.phase - a.phase || a.score - b.score : session.direction === 'low' ? a.score - b.score : b.score - a.score);
  const description = session.direction === 'phase' ? 'Objectif : réussir les 10 phases' : `${session.direction === 'low' ? 'Le plus petit score gagne' : 'Le plus grand score gagne'}${session.target ? ` · Fin à ${session.target} points` : ' · Durée libre'}`;
  const draft = data.drafts[session.id];
  main.innerHTML = `<div class="board-layout"><section class="board-main">${back('#accueil', 'Tous les jeux')}<div class="board-heading"><div><span class="eyebrow">${result.ended ? 'BIEN JOUÉ TOUT LE MONDE' : 'À VOUS DE JOUER'}</span><h1>${esc(nameOf(session))}</h1><p>${description}</p></div><button type="button" class="icon-button rules-icon" data-action="rules" data-game="${game.id}" aria-label="Règles de score de ${game.name}">?</button></div>
    ${!storageAvailable ? '<p class="notice warning">Sauvegarde indisponible : gardez la page ouverte.</p>' : ''}
    ${result.ended ? `<section class="winner-banner"><span class="winner-star" aria-hidden="true">✷</span><span class="eyebrow">${result.winners.length > 1 ? 'VICTOIRE PARTAGÉE' : 'LA VICTOIRE REVIENT À'}</span><h2>${result.winners.map(i => esc(session.players[i])).join(' & ')}</h2><p>Une belle partie. On remet ça ?</p>${button('Rejouer avec ces joueurs', 'rematch', `data-id="${session.id}"`)}</section>` : ''}
    ${result.tiedPhase.length ? `<div class="notice"><strong>Dernier duel !</strong><p>${result.tiedPhase.map(i => esc(session.players[i])).join(' et ')} rejouent la phase 10. Le premier à vider sa main gagne.</p>${button('Indiquer le gagnant du duel', 'tiebreak', `data-id="${session.id}"`)}</div>` : ''}
    <section class="score-panel" aria-labelledby="score-title"><div class="panel-header"><h2 id="score-title">Les scores</h2><span class="status-pill">${session.rounds.length} manche${session.rounds.length > 1 ? 's' : ''}</span></div><ol class="ranking">${ranked.map((p, rank) => `<li><span class="rank">${rank > 0 && (session.direction === 'phase' ? ranked[rank - 1].phase === p.phase && ranked[rank - 1].score === p.score : ranked[rank - 1].score === p.score) ? '=' : rank + 1}</span>${avatar(p.name, p.index)}<div class="player-info"><strong>${esc(p.name)}</strong>${session.direction === 'phase' ? `<span>Phase ${p.phase} <span class="muted">· ${esc(PHASES[p.phase - 1])}</span></span>` : ''}</div><span class="player-score">${p.score}<small>points</small></span></li>`).join('')}</ol></section>
    ${!result.ended && !result.tiedPhase.length ? `<a class="button primary full add-round" href="#saisie/${session.id}/${draft ? draft.editing : 'new'}"><span aria-hidden="true">＋</span> ${draft ? 'Continuer la saisie' : 'Ajouter une manche'}</a>` : ''}
    <p class="save-note"><span aria-hidden="true">${storageAvailable ? '✓' : '!'}</span> ${storageAvailable ? 'Partie sauvegardée sur cet appareil' : 'Partie conservée uniquement sur cette page'}</p>
    <div class="board-tools">${button('Modifier les prénoms', 'rename', `data-id="${session.id}"`, 'text-button')}${button('Exporter les scores', 'export', `data-id="${session.id}"`, 'text-button')}${!result.ended && game.id === 'free' && session.rounds.length ? button('Terminer la partie', 'finish', `data-id="${session.id}"`, 'text-button') : ''}${button('Supprimer la partie', 'delete', `data-id="${session.id}"`, 'text-button danger')}</div></section>
    <aside class="history-section"><div class="section-top"><h2>Les manches</h2><span class="small muted">${session.rounds.length ? 'Modifiables à tout moment' : 'À vous d’ouvrir le score'}</span></div>${session.rounds.length ? `<div class="history-list">${session.rounds.map((r, i) => `<details class="round-history"><summary><span>Manche ${i + 1}${Number.isInteger(r.tieWinner) ? ' · Duel' : ''}</span><span class="history-preview">${r.scores.join(' · ')}</span><span class="chevron" aria-hidden="true">⌄</span></summary><ul>${session.players.map((p, j) => `<li><span>${esc(p)}${r.passed?.[j] ? ' · phase réussie' : ''}</span><strong>${r.scores[j]} pts${r.scores[j] !== r.raw?.[j] && r.raw ? ' (×2)' : ''}</strong></li>`).join('')}</ul>${!Number.isInteger(r.tieWinner) ? `<a href="#saisie/${session.id}/${i}" class="history-edit">Modifier cette manche →</a>` : ''}</details>`).reverse().join('')}</div>${button('Annuler la dernière manche', 'undo', `data-id="${session.id}"`, 'text-button danger')}` : `<div class="empty-history"><span aria-hidden="true">✎</span><h3>Le carnet est ouvert.</h3><p>À la fin de votre première manche,<br>ajoutez les points de chacun ici.</p></div>`}</aside></div>`;
}

function getDraft(session, editing) {
  let draft = data.drafts[session.id];
  if (!draft || draft.editing !== editing || !Array.isArray(draft.raw) || draft.raw.length !== session.players.length) {
    const round = editing === 'new' ? null : session.rounds[Number(editing)];
    draft = { editing, step: 0, raw: round ? [...(round.raw || round.scores)] : session.players.map(() => null), passed: round?.passed ? [...round.passed] : session.players.map(() => false), finisher: round?.finisher ?? null, unoWinner: round ? round.scores.findIndex(s => s > 0) : null, calc: {} };
    data.drafts[session.id] = draft;
  }
  return draft;
}

function calculator(game, index, draft) {
  if (!['flip7', 'uno', 'phase10'].includes(game.id)) return '';
  const calc = draft.calc[index] || {};
  const numberField = (key, label, max = 999) => `<label class="field">${label}<input type="number" inputmode="numeric" min="0" max="${max}" step="1" data-calc="${key}" value="${calc[key] ?? ''}" placeholder="0"></label>`;
  return `<details class="calculator"><summary>Besoin d’aide pour calculer ?</summary><div class="calculator-fields">${game.id === 'flip7' ? `${numberField('numbers', 'Somme des cartes Numéro', 94)}${numberField('bonus', 'Total des cartes Bonus', 30)}<label class="check-row"><input type="checkbox" data-calc="double" ${calc.double ? 'checked' : ''}> Carte ×2</label><label class="check-row"><input type="checkbox" data-calc="flip" ${calc.flip ? 'checked' : ''}> Flip 7 : +15 points</label><p class="small muted">Le ×2 s’applique aux numéros, puis les bonus sont ajoutés.</p>` : game.id === 'uno' ? `${numberField('numbers', 'Somme des cartes numérotées')}${numberField('actions', 'Nombre de +2, Inversion et Passer')}${numberField('wild', 'Nombre de Joker et +4')}<p class="small muted">Comptez les cartes de tous les adversaires : numéros + actions ×20 + jokers ×50.</p>` : `${numberField('small', 'Nombre de cartes de 1 à 9', 10)}${numberField('large', 'Nombre de cartes de 10 à 12', 10)}${numberField('skip', 'Nombre de cartes Passer', 4)}${numberField('wild', 'Nombre de cartes Joker', 8)}<p class="small muted">Cartes restantes en main uniquement : ×5, ×10, ×15 et ×25.</p>`}<p id="calc-error" class="error" role="alert" hidden></p>${button('Utiliser ce résultat', 'calculate', '', 'secondary full')}</div></details>`;
}

function roundPage(session, editing) {
  const game = getGame(session.gameId);
  const draft = getDraft(session, editing);
  const number = editing === 'new' ? session.rounds.length + 1 : Number(editing) + 1;
  const totalSteps = game.id === 'uno' ? 1 : session.players.length;
  const step = Math.min(draft.step, totalSteps);
  draft.step = step;
  const currentPhases = phases(session, editing === 'new' ? session.rounds : session.rounds.slice(0, Number(editing)));
  const summary = step === totalSteps;
  const i = game.id === 'uno' ? Number(draft.unoWinner ?? 0) : step;
  const negative = ['skyjo', 'free'].includes(game.id);
  const title = summary ? 'Tout est bon ?' : game.id === 'uno' ? 'Qui a gagné la manche ?' : `Les points de ${esc(session.players[i])}`;
  const ready = roundScores(game.id, draft.raw.map(v => Number(v ?? 0)), draft.finisher);
  main.innerHTML = `<div class="narrow entry-page">${back(`#partie/${session.id}`, 'Retour aux scores')}<div class="entry-heading"><span class="eyebrow">${esc(nameOf(session)).toUpperCase()} · MANCHE ${number}${editing !== 'new' ? ' · MODIFICATION' : ''}</span><div class="progress-heading"><h1>${title}</h1><span class="step-pill">${summary ? 'Vérification' : `${step + 1} / ${totalSteps}`}</span></div><div class="progress-track"><span style="width:${(step + 1) / (totalSteps + 1) * 100}%"></span></div></div>
    <form id="round-form" data-id="${session.id}" data-editing="${editing}" class="panel score-entry">${summary ? `
      ${['skyjo', 'hilo'].includes(game.id) ? `<label class="field finisher-field">Qui a terminé la manche ?<select id="finisher" required><option value="">Choisir le joueur</option>${session.players.map((p, j) => `<option value="${j}" ${draft.finisher === j ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select></label><p class="small muted">Entrez les scores avant doublement. Le compteur applique la pénalité si nécessaire.</p>` : ''}
      <ul class="summary-scores">${session.players.map((p, j) => `<li>${avatar(p, j)}<div><strong>${esc(p)}</strong>${draft.passed[j] ? '<span class="small muted">Phase réussie ✓</span>' : ''}</div><strong class="summary-number">${ready[j]}<small> pts</small>${ready[j] !== draft.raw[j] ? '<span class="double-tag">Score doublé</span>' : ''}</strong>${button('Modifier', 'edit-player', `data-index="${j}"`, 'text-button')}</li>`).join('')}</ul>
      ${editing !== 'new' ? '<p class="notice">La correction mettra à jour tous les totaux et la progression des phases.</p>' : ''}
      <div class="entry-actions">${button('← Précédent', 'previous-player', '', 'secondary')}<button class="button primary" type="submit">Valider la manche ✓</button></div>` : `
      ${game.id === 'uno' ? `<label class="field">Gagnant de la manche<select id="uno-winner" required><option value="">Choisir le joueur</option>${session.players.map((p, j) => `<option value="${j}" ${draft.unoWinner === j ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select></label><p class="muted">Seul le gagnant marque la valeur des cartes restantes chez les autres joueurs.</p>` : `<div class="entry-player">${avatar(session.players[i], i)}<strong>${esc(session.players[i])}</strong></div>`}
      ${game.id === 'phase10' ? `<div class="phase-objective"><span class="eyebrow">PHASE ${currentPhases[i]}</span><strong>${PHASES[currentPhases[i] - 1]}</strong></div>` : ''}
      <label class="score-label" for="score-input">${game.id === 'phase10' ? 'Points des cartes restantes' : game.id === 'six' ? 'Têtes de bœuf ramassées' : 'Points de la manche'}</label><div class="score-input-wrap"><input id="score-input" type="text" inputmode="numeric" autocomplete="off" maxlength="6" placeholder="0" value="${draft.raw[i] ?? ''}" aria-describedby="score-hint" required><span>points</span></div><p id="score-hint" class="small muted">${negative ? 'Un score négatif ? Utilisez le bouton − / +.' : 'Entrez un nombre entier, même si c’est zéro.'}</p>
      <div class="quick-actions">${negative ? button('− / +', 'sign', 'aria-label="Changer le signe du score"', 'secondary') : ''}${button(game.id === 'flip7' ? 'Éliminé : 0 point' : '0 point', 'zero', '', 'secondary')}</div>
      ${game.id === 'phase10' ? `<label class="check-row phase-check"><input id="phase-passed" type="checkbox" ${draft.passed[i] ? 'checked' : ''}><span><strong>Phase réussie</strong><small>La combinaison a été posée pendant la manche.</small></span></label>` : ''}
      ${calculator(game, i, draft)}<div class="entry-actions">${button('← Précédent', 'previous-player', step === 0 ? 'disabled' : '', 'secondary')}<button class="button primary" type="submit">${step === totalSteps - 1 ? 'Vérifier la manche' : 'Joueur suivant'} <span aria-hidden="true">→</span></button></div>`}<p id="form-error" class="error" role="alert" hidden></p></form><p class="save-note">Vous pouvez revenir aux scores : la saisie est conservée.</p>${button('Effacer cette saisie', 'discard-draft', `data-id="${session.id}"`, 'text-button danger')}</div>`;
}

function activeRound() {
  const form = document.querySelector('#round-form');
  if (!form) return {};
  const session = sessionById(form.dataset.id);
  const draft = data.drafts[session.id];
  const game = getGame(session.gameId);
  const index = game.id === 'uno' ? Number(draft.unoWinner ?? 0) : draft.step;
  return { session, draft, game, index };
}

function saveScoreInput() {
  const { session, draft, game, index } = activeRound();
  const input = document.querySelector('#score-input');
  if (!session || !input) return;
  const value = input.value.trim();
  draft.raw[index] = /^-?\d+$/.test(value) ? Number(value) : null;
  if (game.id === 'phase10') draft.passed[index] = document.querySelector('#phase-passed').checked;
  persist();
}

function submitRound() {
  const { session, draft, game } = activeRound();
  const limit = game.id === 'uno' ? 1 : session.players.length;
  if (draft.step < limit) {
    const input = document.querySelector('#score-input');
    const value = input.value.trim();
    if (!/^-?\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Math.abs(Number(value)) > 99999 || (!['skyjo', 'free'].includes(game.id) && Number(value) < 0)) return error('Entrez un nombre entier valide entre ' + (['skyjo', 'free'].includes(game.id) ? '−99 999' : '0') + ' et 99 999.');
    if (game.id === 'uno' && !Number.isInteger(draft.unoWinner)) return error('Choisissez le gagnant de cette manche.');
    saveScoreInput();
    if (game.id === 'uno') draft.raw = draft.raw.map((v, i) => i === draft.unoWinner ? Number(value) : 0);
    draft.step++;
    persist(); render();
    return;
  }
  if (['skyjo', 'hilo'].includes(game.id) && !Number.isInteger(draft.finisher)) return error('Choisissez le joueur qui a terminé la manche.');
  if (draft.raw.some(v => !Number.isSafeInteger(v))) return error('Renseignez le score de chaque joueur avant de valider.');
  const round = { raw: [...draft.raw], scores: roundScores(game.id, draft.raw, draft.finisher), passed: [...draft.passed], finisher: draft.finisher };
  if (draft.editing === 'new') session.rounds.push(round);
  else session.rounds[Number(draft.editing)] = round;
  // Une correction historique invalide un éventuel duel de départage ultérieur.
  if (draft.editing !== 'new') session.rounds = session.rounds.filter(r => !Number.isInteger(r.tieWinner));
  session.manualEnd = false;
  session.updated = Date.now();
  delete data.drafts[session.id];
  persist(); location.hash = `partie/${session.id}`;
  toast('Manche enregistrée. À vous de jouer !');
}

function calculate() {
  const { draft, game, index } = activeRound();
  const values = {};
  for (const input of document.querySelectorAll('[data-calc]')) {
    if (input.type !== 'checkbox' && input.value !== '' && !input.checkValidity()) {
      const message = document.querySelector('#calc-error');
      message.textContent = 'Entrez des nombres entiers positifs dans les limites indiquées.';
      message.hidden = false;
      input.reportValidity(); return;
    }
    values[input.dataset.calc] = input.type === 'checkbox' ? input.checked : Number(input.value || 0);
  }
  const result = game.id === 'flip7' ? flipScore(values.numbers, values.bonus, values.double, values.flip, false) : game.id === 'uno' ? values.numbers + values.actions * 20 + values.wild * 50 : values.small * 5 + values.large * 10 + values.skip * 15 + values.wild * 25;
  draft.calc[index] = values;
  document.querySelector('#score-input').value = result;
  saveScoreInput();
  document.querySelector('.calculator').open = false;
  document.querySelector('#score-input').focus();
  document.querySelector('#announcement').textContent = `Résultat : ${result} points.`;
}

function confirmAction(title, message, action, id, label, danger = false) {
  showDialog(title, `<p>${message}</p><div class="dialog-actions">${button('Annuler', 'close-dialog', '', 'secondary')}${button(label, action, `data-id="${id}"`, danger ? 'danger-solid' : 'primary')}</div>`);
}

function exportScores(session) {
  const safe = value => { const text = String(value); return '"' + (typeof value === 'string' && /^[=+\-@\t\r]/.test(text) ? "'" : '') + text.replaceAll('"', '""') + '"'; };
  const rows = [['Manche', ...session.players], ...session.rounds.map((r, i) => [i + 1, ...r.scores]), ['Total', ...totals(session)]];
  const blob = new Blob(['\ufeff' + rows.map(row => row.map(safe).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url; link.download = `scores-${session.gameId}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function render() {
  const [page, id, editing = 'new'] = location.hash.slice(1).split('/');
  if (page === 'jeu' && getGame(id)) setupPage(getGame(id));
  else if (['partie', 'saisie'].includes(page) && sessionById(id)) {
    const session = sessionById(id);
    if (page === 'saisie' && (editing === 'new' || (/^\d+$/.test(editing) && session.rounds[Number(editing)] && !Number.isInteger(session.rounds[Number(editing)].tieWinner))) && (editing !== 'new' || !outcome(session).ended)) roundPage(session, editing);
    else scoreboard(session);
  } else home();
  document.title = `${document.querySelector('h1')?.textContent || 'Accueil'} — À vous de jouer !`;
  window.scrollTo({ top: 0, behavior: 'instant' });
  main.focus({ preventScroll: true });
}

document.addEventListener('submit', event => {
  if (event.target.id === 'setup-form') { event.preventDefault(); createSession(); }
  if (event.target.id === 'round-form') { event.preventDefault(); submitRound(); }
  if (event.target.id === 'rename-form') {
    event.preventDefault();
    const session = sessionById(event.target.dataset.id);
    const values = new FormData(event.target);
    const names = session.players.map((p, i) => String(values.get(`rename-${i}`) || '').trim() || p);
    if (new Set(names.map(p => p.toLocaleLowerCase('fr'))).size !== names.length) {
      document.querySelector('#rename-error').hidden = false; return;
    }
    session.players = names; session.updated = Date.now(); persist(); dialog.close(); render(); toast('Prénoms mis à jour.');
  }
});

document.addEventListener('input', event => {
  if (event.target.id === 'score-input' || event.target.id === 'phase-passed') saveScoreInput();
  if (event.target.hasAttribute('data-calc')) {
    const { draft, index } = activeRound();
    draft.calc[index] ||= {};
    draft.calc[index][event.target.dataset.calc] = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    persist();
  }
  if (event.target.closest('#setup-form')) captureSetup();
});

document.addEventListener('change', event => {
  if (event.target.id === 'player-filter') { filter = event.target.value; home(); document.querySelector('#player-filter').focus(); }
  if (event.target.id === 'finisher') {
    const { draft } = activeRound();
    draft.finisher = event.target.value === '' ? null : Number(event.target.value);
    persist(); render(); document.querySelector('#finisher').focus();
  }
  if (event.target.id === 'uno-winner') {
    const { draft } = activeRound();
    draft.unoWinner = event.target.value === '' ? null : Number(event.target.value);
    draft.raw.fill(null); draft.calc = {}; persist(); render(); document.querySelector('#uno-winner').focus();
  }
});

document.addEventListener('click', event => {
  const entryLink = event.target.closest('a[href^="#saisie/"]');
  if (entryLink) {
    const [, id, editing] = entryLink.getAttribute('href').slice(1).split('/');
    const existing = data.drafts[id];
    if (existing && existing.editing !== editing) {
      event.preventDefault();
      showDialog('Une saisie est déjà en cours', `<p>Pour ouvrir une autre manche, il faut remplacer la saisie en cours. Les manches déjà validées seront conservées.</p><div class="dialog-actions">${button('Garder ma saisie', 'close-dialog', '', 'secondary')}${button('Remplacer la saisie', 'switch-draft', `data-id="${id}" data-editing="${editing}"`)}</div>`);
      return;
    }
  }
  const element = event.target.closest('[data-action]');
  if (!element) return;
  const action = element.dataset.action;
  const session = sessionById(element.dataset.id);
  if (action === 'close-dialog') dialog.close();
  if (action === 'switch-draft') { delete data.drafts[session.id]; persist(); dialog.close(); location.hash = `saisie/${session.id}/${element.dataset.editing}`; }
  if (action === 'rules') showRules(getGame(element.dataset.game));
  if (action === 'count') {
    captureSetup(); const game = getGame(setup.gameId);
    setup.count = Math.min(game.max, Math.max(game.min, setup.count + Number(element.dataset.delta)));
    const names = [...setup.names]; setupPage(game); setup.names = names;
    document.querySelector(`[data-delta="${element.dataset.delta}"]`).focus({ preventScroll: true });
  }
  if (['zero', 'sign'].includes(action)) {
    const input = document.querySelector('#score-input');
    input.value = action === 'zero' ? '0' : input.value.startsWith('-') ? input.value.slice(1) : `-${input.value || '0'}`;
    saveScoreInput(); input.focus();
  }
  if (['previous-player', 'edit-player'].includes(action)) {
    saveScoreInput(); const { draft } = activeRound();
    draft.step = action === 'edit-player' ? (getGame(sessionById(document.querySelector('#round-form').dataset.id).gameId).id === 'uno' ? 0 : Number(element.dataset.index)) : Math.max(0, draft.step - 1);
    persist(); render();
  }
  if (action === 'calculate') calculate();
  if (action === 'discard-draft') confirmAction('Effacer la saisie ?', 'Les scores déjà validés resteront dans le carnet. Seule cette saisie sera effacée.', 'confirm-discard', session.id, 'Effacer', true);
  if (action === 'confirm-discard') { delete data.drafts[session.id]; persist(); dialog.close(); location.hash = `partie/${session.id}`; }
  if (action === 'rematch') {
    setup = { gameId: session.gameId, count: session.players.length, names: [...session.players], name: session.name, target: session.target, direction: session.direction };
    location.hash = `jeu/${session.gameId}`;
  }
  if (action === 'rename') showDialog('Les prénoms des joueurs', `<form id="rename-form" data-id="${session.id}"><div class="names-grid">${session.players.map((p, i) => `<label class="field">Joueur ${i + 1}<input name="rename-${i}" maxlength="24" value="${esc(p)}" required></label>`).join('')}</div><p class="error" id="rename-error" role="alert" hidden>Utilisez un prénom différent pour chaque joueur.</p><button class="button primary full" type="submit">Enregistrer les prénoms</button></form>`);
  if (action === 'undo') confirmAction('Annuler la dernière manche ?', 'Ses points seront retirés des totaux. Les manches précédentes seront conservées.', 'confirm-undo', session.id, 'Annuler la manche', true);
  if (action === 'confirm-undo') { session.rounds.pop(); session.manualEnd = false; session.updated = Date.now(); delete data.drafts[session.id]; persist(); dialog.close(); render(); toast('Dernière manche annulée.'); }
  if (action === 'delete') confirmAction('Supprimer cette partie ?', 'Cette partie et toutes ses manches seront supprimées de cet appareil.', 'confirm-delete', session.id, 'Supprimer', true);
  if (action === 'confirm-delete') { data.sessions = data.sessions.filter(s => s.id !== session.id); delete data.drafts[session.id]; persist(); dialog.close(); location.hash = 'accueil'; }
  if (action === 'finish') confirmAction('Terminer la partie ?', 'Le classement actuel sera utilisé pour désigner le ou les gagnants.', 'confirm-finish', session.id, 'Terminer');
  if (action === 'confirm-finish') { session.manualEnd = true; session.updated = Date.now(); persist(); dialog.close(); render(); }
  if (action === 'export') exportScores(session);
  if (action === 'tiebreak') showDialog('Qui a gagné le duel ?', `<p>Sélectionnez le joueur qui a vidé sa main en premier pendant le départage.</p><div class="tie-choices">${outcome(session).tiedPhase.map(i => button(esc(session.players[i]), 'confirm-tiebreak', `data-id="${session.id}" data-index="${i}"`, 'secondary full')).join('')}</div>`);
  if (action === 'confirm-tiebreak') { session.rounds.push({ raw: session.players.map(() => 0), scores: session.players.map(() => 0), passed: session.players.map(() => false), tieWinner: Number(element.dataset.index) }); session.updated = Date.now(); persist(); dialog.close(); render(); }
});

document.querySelector('#help-button').addEventListener('click', () => showDialog('Un téléphone, toute la table.', `<ol class="rules-list"><li><strong>Choisissez votre jeu.</strong> Réglez le nombre de joueurs et entrez leurs prénoms.</li><li><strong>Jouez avec vos cartes.</strong> À la fin de la manche, touchez « Ajouter une manche » et entrez les points.</li><li><strong>Profitez de la partie.</strong> Le compteur additionne les scores et vous indique qui gagne. Vous pouvez corriger une manche dans le carnet.</li></ol><p class="notice">Les parties sont enregistrées sur ce navigateur. Elles ne sont pas partagées entre téléphones. Effacer les données du navigateur efface aussi les parties.</p>${button('À nous de jouer !', 'close-dialog', '', 'primary full')}`));
document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); main.focus(); main.scrollIntoView({ block: 'start' }); });
dialog.addEventListener('click', event => { if (event.target === dialog) { const bounds = dialog.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close(); } });
window.addEventListener('hashchange', render);
render();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('./sw.js').catch(() => {});
