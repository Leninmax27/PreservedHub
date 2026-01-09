const SimpleGrowthStrategy = require('./simpleGrowth.strategy');

const strategies = {
  'simple-growth': SimpleGrowthStrategy,
};

function getPronosticoStrategy(nombre) {
  if (!nombre) return strategies['simple-growth'];

  const key = String(nombre).toLowerCase().trim();
  return strategies[key] || strategies['simple-growth'];
}

module.exports = { getPronosticoStrategy };
