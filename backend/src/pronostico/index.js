const Reserva = require('../models/reserva.model');
const Recurso = require('../models/recurso.model');

const { getPronosticoStrategy } = require('../estrategias/strategyFactory');
const { getSpaceRankingStrategy } = require('../estrategias/spaceRankingFactory');

// Obtiene el rango de fechas basado en los meses
function getWindowFromMeses(mesesParam) {
  const ahora = new Date();

  const mesesNumero = parseInt(mesesParam, 10);
  const meses = !isNaN(mesesNumero) && mesesNumero > 0 ? mesesNumero : 6;

  const inicio = new Date(ahora);
  inicio.setMonth(inicio.getMonth() - meses);

  return { inicio, fin: ahora };
}

// Calculo del maximo simultaneo por tipo de recurso
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

// Calculo de la capacidad por tipo de recurso
function buildCapacidadPorTipo(recursosFacultad) {
  return recursosFacultad.reduce((acc, r) => {
    const tipo = r.tipo;
    const cantidad = r.cantidad || 1;
    if (!acc[tipo]) acc[tipo] = 0;
    acc[tipo] += cantidad;
    return acc;
  }, {});
}

//Calculo del pronostico por facultad

async function calcularPronosticoPorFacultad({
  facultadId,
  crecimiento,
  meses,
  estrategia,
}) {
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

const strategy = getPronosticoStrategy(estrategia);

  const tipos = new Set([
    ...Object.keys(maxHistoricoPorTipo),
    ...Object.keys(capacidadPorTipo),
  ]);

  const resultadoRecursos = [];

  for (const tipo of tipos) {
    const usoHistorico = maxHistoricoPorTipo[tipo] || 0;

    const demandaProyectada = strategy.computeDemanda({
      usoHistoricoMaximo: usoHistorico,
      factorCrecimiento: factor,
      tipo,
    });

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
    estrategia: strategy.nombre,
    recursos: resultadoRecursos,
  };
}


// Calculo del ranking de espacios por facultad
async function rankingEspaciosPorFacultad({
  facultadId,
  meses,
  metrica,
  limit,
}) {
  const { inicio, fin } = getWindowFromMeses(meses);

  const lim = Math.max(parseInt(limit || '10', 10), 1);

  const reservas = await Reserva.find({
    fechaInicio: { $lt: fin },
    fechaFin: { $gt: inicio },
    estado: { $in: ['CONFIRMADA', 'PENDIENTE'] },
  }).populate({
    path: 'espacio',
    select: 'nombre tipo facultad codigo',
  });

  const stats = new Map();

  for (const r of reservas) {
    if (!r.espacio) continue;
    if (String(r.espacio.facultad) !== String(facultadId)) continue;

    const espacioId = String(r.espacio._id);

    const inicioR = new Date(r.fechaInicio).getTime();
    const finR = new Date(r.fechaFin).getTime();
    const horas = Math.max((finR - inicioR) / (1000 * 60 * 60), 0);

    if (!stats.has(espacioId)) {
      stats.set(espacioId, {
        espacioId,
        nombre: r.espacio.nombre,
        tipo: r.espacio.tipo || 'SIN_TIPO',
        codigo: r.espacio.codigo || null,
        totalReservas: 0,
        horasTotales: 0,
      });
    }

    const s = stats.get(espacioId);
    s.totalReservas += 1;
    s.horasTotales += horas;
  }

  const strategy = getSpaceRankingStrategy(metrica);

  const ranking = Array.from(stats.values())
    .map((e) => ({
      ...e,
      horasTotales: Number(e.horasTotales.toFixed(2)),
      score: Number(strategy.computeScore(e).toFixed(2)),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, lim);

  return {
    facultad: facultadId,
    ventana: { inicio, fin },
    metrica: strategy.nombre,
    limit: lim,
    ranking,
  };
}


module.exports = {
  calcularPronosticoPorFacultad,
  rankingEspaciosPorFacultad,
};
