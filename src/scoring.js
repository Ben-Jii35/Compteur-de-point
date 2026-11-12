export function totals(session, rounds = session.rounds) {
  return session.players.map((_, index) => rounds.reduce((sum, round) => sum + round.scores[index], 0));
}

export function phases(session, rounds = session.rounds) {
  return session.players.map((_, index) => Math.min(10, 1 + rounds.reduce((sum, round) => sum + Number(Boolean(round.passed?.[index])), 0)));
}

export function roundScores(gameId, raw, finisher = null) {
  const scores = [...raw];
  if (['skyjo', 'hilo'].includes(gameId) && finisher !== null && scores[finisher] > 0 && scores.some((score, index) => index !== finisher && score <= scores[finisher])) {
    scores[finisher] *= 2;
  }
  return scores;
}

export function flipScore(numbers, bonus, double, flip, out) {
  return out ? 0 : numbers * (double ? 2 : 1) + bonus + (flip ? 15 : 0);
}

export function outcome(session) {
  if (!session.rounds.length) return { ended: false, winners: [], tiedPhase: [] };
  const scores = totals(session);
  let candidates = scores.map((_, index) => index);
  let ended = false;
  if (session.direction === 'phase') {
    candidates = candidates.filter(index => session.rounds.reduce((sum, round) => sum + Number(Boolean(round.passed?.[index])), 0) >= 10);
    if (!candidates.length) return { ended: false, winners: [], tiedPhase: [] };
    const best = Math.min(...candidates.map(index => scores[index]));
    const leaders = candidates.filter(index => scores[index] === best);
    const tieWinner = session.rounds.at(-1).tieWinner;
    if (leaders.length > 1 && !Number.isInteger(tieWinner)) return { ended: false, winners: [], tiedPhase: leaders };
    return { ended: true, winners: leaders.length > 1 ? [tieWinner] : leaders, tiedPhase: [] };
  }
  ended = Boolean(session.manualEnd) || (session.target !== null && scores.some(score => score >= session.target));
  const best = session.direction === 'low' ? Math.min(...scores) : Math.max(...scores);
  const winners = candidates.filter(index => scores[index] === best);
  if (session.gameId === 'flip7' && winners.length > 1 && !session.manualEnd) ended = false;
  return { ended, winners: ended ? winners : [], tiedPhase: [] };
}
