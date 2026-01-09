const Reserva = require('../models/reserva.model');
const Recurso = require('../models/recurso.model');

function getWindowFromMeses(mesesParam) {
  const ahora = new Date();

  const mesesNumero = parseInt(mesesParam, 10);
  const meses = !isNaN(mesesNumero) && mesesNumero > 0 ? mesesNumero : 6;

  const inicio = new Date(ahora);
  inicio.setMonth(inicio.getMonth() - meses);

  return { inicio, fin: ahora };
}

function buildMaxSimultaneousByTipo(reservas) {
  const eventosPorTipo = {};

  for (const reserva of reservas) {
    if (!reserva.recursos || reserva.recursos.length === 0) continue;
    for (const recurso of reserva.recursos) {
      if (!recurso || !recurso.tipo) continue;
      const tipo = recurso.tipo;

      if (!eventosPorTipo[tipo]) {
        eventosPorTipo[tipo] = [];
      }

      const inicio = new Date(reserva.fechaInicio).getTime();
      const fin = new Date(reserva.fechaFin).getTime();

      eventosPorTipo[tipo].push({ t: inicio, delta: 1 });
      eventosPorTipo[tipo].push({ t: fin, delta: -1 });
    }
  }

  const maxPorTipo = {};

  for (const tipo of Object.keys(eventosPorTipo)) {
    const eventos = eventosPorTipo[tipo].sort((a, b) => {
      if (a.t === b.t) return a.delta - b.delta;
      return a.t - b.t;
    });

    let actual = 0;
    let max = 0;

    for (const e of eventos) {
      actual += e.delta;
      if (actual > max) max = actual;
    }

    maxPorTipo[tipo] = max;
  }

  return maxPorTipo;
}

function buildCapacidadPorTipo(recursosFacultad) {
  return recursosFacultad.reduce((acc, r) => {
    const tipo = r.tipo;
    const cantidad = r.cantidad || 1;
    if (!acc[tipo]) acc[tipo] = 0;
    acc[tipo] += cantidad;
    return acc;
  }, {});
}

function simpleGrowthDemanda(usoHistorico, factor) {
  return usoHistorico * factor;
}

async function calcularPronosticoPorFacultad({ facultadId, crecimiento, meses }) {
  const { inicio, fin } = getWindowFromMeses(meses);

  const reservas = await Reserva.find({
    fechaInicio: { $lt: fin },
    fechaFin: { $gt: inicio },
    estado: { $in: ['CONFIRMADA', 'PENDIENTE'] },
  })
    .populate({
      path: 'espacio',
      select: 'nombre facultad',
    })
    .populate({
      path: 'recursos',
      select: 'tipo facultad',
    });

  const reservasFacultad = reservas.filter((r) => {
    return r.espacio && String(r.espacio.facultad) === String(facultadId);
  });

  const maxHistoricoPorTipo = buildMaxSimultaneousByTipo(reservasFacultad);

  const recursosFacultad = await Recurso.find({ facultad: facultadId });
  const capacidadPorTipo = buildCapacidadPorTipo(recursosFacultad);

  const factor = 1 + crecimiento;

  const tipos = new Set([
    ...Object.keys(maxHistoricoPorTipo),
    ...Object.keys(capacidadPorTipo),
  ]);

  const resultadoRecursos = [];

  for (const tipo of tipos) {
    const usoHistorico = maxHistoricoPorTipo[tipo] || 0;
    const demandaProyectada = simpleGrowthDemanda(usoHistorico, factor);
    const capacidadActual = capacidadPorTipo[tipo] || 0;

    let cobertura = null;
    let faltantes = 0;

    if (demandaProyectada > 0) {
      cobertura = capacidadActual / demandaProyectada;
      const deficit = demandaProyectada - capacidadActual;
      faltantes = deficit > 0 ? Math.ceil(deficit) : 0;
    }

    resultadoRecursos.push({
      tipo,
      usoHistoricoMaximo: usoHistorico,
      demandaProyectada: Number(demandaProyectada.toFixed(2)),
      capacidadActual,
      cobertura: cobertura !== null ? Number(cobertura.toFixed(2)) : null,
      faltantes,
    });
  }

  return {
    facultad: facultadId,
    ventana: { inicio, fin },
    factorCrecimiento: factor,
    recursos: resultadoRecursos,
  };
}

module.exports = {
  calcularPronosticoPorFacultad,
};
