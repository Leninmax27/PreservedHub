function computeDemanda({ usoHistoricoMaximo, factorCrecimiento }) {
  return usoHistoricoMaximo * factorCrecimiento;
}

module.exports = {
  nombre: 'simple-growth',
  computeDemanda,
};
