const ByReservas = require('./spaceRanking.byReservas.strategy');
const ByHoras = require('./spaceRanking.byHoras.strategy');

const strategies = {
  reservas: ByReservas,
  horas: ByHoras,
};

function getSpaceRankingStrategy(metrica) {
  if (!metrica) return strategies.reservas;
  const key = String(metrica).toLowerCase().trim();
  return strategies[key] || strategies.reservas;
}

module.exports = { getSpaceRankingStrategy };
