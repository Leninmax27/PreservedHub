const express = require('express');
const router = express.Router();

const Reserva = require('../models/reserva.model');
const Recurso = require('../models/recurso.model');

/**
 * Utilidad: ventana de tiempo desde meses atrás
 */
function getWindowFromMeses(mesesParam) {
  const ahora = new Date();
  const mesesNumero = parseInt(mesesParam, 10);
  const meses = !isNaN(mesesNumero) && mesesNumero > 0 ? mesesNumero : 6;

  const inicio = new Date(ahora);
  inicio.setMonth(inicio.getMonth() - meses);

  return { inicio, fin: ahora };
}

/**
 * Construye el máximo simultáneo por tipo (uso histórico)
 */
function buildMaxSimultaneousByTipo(reservas) {
  const eventosPorTipo = {};

  for (const reserva of reservas) {
    if (!reserva.recursos || reserva.recursos.length === 0) continue;

    for (const recurso of reserva.recursos) {
      if (!recurso || !recurso.tipo) continue;

      const tipo = recurso.tipo;

      if (!eventosPorTipo[tipo]) eventosPorTipo[tipo] = [];

      const ini = new Date(reserva.fechaInicio).getTime();
      const fin = new Date(reserva.fechaFin).getTime();

      eventosPorTipo[tipo].push({ t: ini, delta: 1 });
      eventosPorTipo[tipo].push({ t: fin, delta: -1 });
    }
  }

  const maxPorTipo = {};

  for (const tipo of Object.keys(eventosPorTipo)) {
    const eventos = eventosPorTipo[tipo].sort((a, b) => a.t - b.t);

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

/**
 * ✅ CORE NUEVO: Resumen + Comparativo por Facultad
 *
 * GET /api/core/resumen/facultad/:id?meses=12&crecimiento=0.2
 */
router.get('/resumen/facultad/:id', async (req, res) => {
  try {
    const facultadId = req.params.id;
    const crecimiento = parseFloat(req.query.crecimiento || '0.2');
    const { inicio, fin } = getWindowFromMeses(req.query.meses);

    // 1. Reservas en ventana
    const reservas = await Reserva.find({
      fechaInicio: { $lt: fin },
      fechaFin: { $gt: inicio },
      estado: { $in: ['CONFIRMADA', 'PENDIENTE', 'CANCELADA'] },
    })
      .populate('espacio', 'nombre facultad tipo')
      .populate('recursos', 'tipo facultad');

    // Solo reservas de la facultad
    const reservasFacultad = reservas.filter(
      (r) => r.espacio && String(r.espacio.facultad) === String(facultadId)
    );

    // 2. KPI: total reservas
    const totalReservas = reservasFacultad.length;

    // 3. KPI: estados
    const estados = reservasFacultad.reduce((acc, r) => {
      acc[r.estado] = (acc[r.estado] || 0) + 1;
      return acc;
    }, {});

    // 4. KPI: espacio más usado
    const conteoEspacios = {};
    for (const r of reservasFacultad) {
      if (!r.espacio) continue;
      const nombre = r.espacio.nombre;
      conteoEspacios[nombre] = (conteoEspacios[nombre] || 0) + 1;
    }

    let espacioMasUsado = null;
    for (const nombre of Object.keys(conteoEspacios)) {
      if (
        !espacioMasUsado ||
        conteoEspacios[nombre] > espacioMasUsado.reservas
      ) {
        espacioMasUsado = {
          nombre,
          reservas: conteoEspacios[nombre],
        };
      }
    }

    // 5. Comparativo recursos (igual que pronóstico)
    const maxHistoricoPorTipo = buildMaxSimultaneousByTipo(reservasFacultad);

    const recursosFacultad = await Recurso.find({ facultad: facultadId });

    const capacidadPorTipo = recursosFacultad.reduce((acc, r) => {
      const tipo = r.tipo;
      const cantidad = r.cantidad || 1;
      acc[tipo] = (acc[tipo] || 0) + cantidad;
      return acc;
    }, {});

    const factor = 1 + crecimiento;

    const tipos = new Set([
      ...Object.keys(maxHistoricoPorTipo),
      ...Object.keys(capacidadPorTipo),
    ]);

    const comparativoRecursos = [];

    for (const tipo of tipos) {
      const usoHistorico = maxHistoricoPorTipo[tipo] || 0;
      const demandaProyectada = usoHistorico * factor;
      const capacidadActual = capacidadPorTipo[tipo] || 0;

      let cobertura = null;
      let faltantes = 0;

      if (demandaProyectada > 0) {
        cobertura = capacidadActual / demandaProyectada;
        const deficit = demandaProyectada - capacidadActual;
        faltantes = deficit > 0 ? Math.ceil(deficit) : 0;
      }

      comparativoRecursos.push({
        tipo,
        capacidadActual,
        usoHistoricoMaximo: usoHistorico,
        demandaProyectada: Number(demandaProyectada.toFixed(2)),
        cobertura: cobertura !== null ? Number(cobertura.toFixed(2)) : null,
        faltantes,
      });
    }

    //  Respuesta JSON Core
    res.json({
      facultadId,
      ventana: { inicio, fin },
      kpis: {
        totalReservas,
        estados,
        espacioMasUsado,
      },
      comparativoRecursos,
    });
  } catch (error) {
    console.error('Error en resumen core:', error);
    res.status(500).json({ message: 'Error al generar resumen core' });
  }
});

module.exports = router;
