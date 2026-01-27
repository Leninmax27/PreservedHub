<template>
  <section class="admin-page">
    <h1 class="title">Pronóstico de recursos</h1>
    <p class="subtitle">
      Analiza si los recursos actuales pueden cubrir la demanda proyectada del próximo semestre.
    </p>

    <div class="card">
      <h2 class="card-title">Parámetros de análisis</h2>

      <div class="filters">
        <div class="form-group">
          <label>Facultad</label>
          <select v-model="facultadId">
            <option disabled value="">Seleccione una facultad</option>
            <option v-for="f in facultades" :key="f._id" :value="f._id">
              {{ f.nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Crecimiento esperado (%)</label>
          <select v-model="crecimiento">
            <option :value="0.1">10%</option>
            <option :value="0.2">20%</option>
            <option :value="0.3">30%</option>
          </select>
        </div>

        <div class="form-group">
          <label>Periodo de análisis (meses)</label>
          <select v-model.number="meses">
            <option v-for="m in 12" :key="m" :value="m">
              {{ m }} mes<span v-if="m > 1">es</span>
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Métrica ranking</label>
          <select v-model="rankingMetrica">
            <option value="reservas">Nº Reservas</option>
            <option value="horas">Horas Totales</option>
          </select>
        </div>

        <div class="form-group">
          <label>Top</label>
          <select v-model.number="rankingLimit">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="15">15</option>
          </select>
        </div>

        <div class="form-actions">
          <button
            class="btn"
            @click="calcularPronostico"
            :disabled="!facultadId || loading"
          >
            {{ loading ? 'Calculando...' : 'Calcular pronóstico' }}
          </button>

          <button
            class="btn secondary"
            @click="calcularRankingEspacios"
            :disabled="!facultadId || loadingRanking"
          >
            {{ loadingRanking ? 'Calculando...' : 'Ranking espacios' }}
          </button>

          <button
            class="btn secondary"
            @click="cargarDashboard"
            :disabled="!facultadId || loadingDashboard"
          >
            {{ loadingDashboard ? 'Generando...' : 'Dashboard core' }}
          </button>
        </div>
      </div>

      <p v-if="error" class="error-text">{{ error }}</p>
    </div>

    <!-- PRONÓSTICO -->
    <div class="card" v-if="resultado">
      <div class="card-header-row">
        <h2 class="card-title">Resultados por tipo de recurso</h2>
        <span class="pill">
          Crecimiento aplicado: {{ Math.round((resultado.factorCrecimiento - 1) * 100) }}%
        </span>
      </div>
      <!-- DASHBOARD CORE -->
<div class="card" v-if="dashboard">
  <div class="card-header-row">
    <h2 class="card-title">Dashboard core (resumen del periodo)</h2>
    <span class="pill">
      Últimos {{ meses }} meses · Crecimiento: {{ Math.round(crecimiento * 100) }}%
    </span>
  </div>

  <div class="kpi-grid">
    <div class="kpi">
      <p class="kpi-label">Total reservas</p>
      <p class="kpi-value">{{ dashboard.kpis.totalReservas }}</p>
    </div>

    <div class="kpi">
      <p class="kpi-label">Espacio más usado</p>
      <p class="kpi-value" v-if="dashboard.kpis.espacioMasUsado">
        {{ dashboard.kpis.espacioMasUsado.nombre }}
      </p>
      <p class="kpi-sub" v-if="dashboard.kpis.espacioMasUsado">
        {{ dashboard.kpis.espacioMasUsado.reservas }} reservas
      </p>
      <p class="kpi-value" v-else>-</p>
    </div>

    <div class="kpi">
      <p class="kpi-label">Estados</p>
      <div class="estado-list">
        <span
          v-for="(val, key) in dashboard.kpis.estados"
          :key="key"
          class="estado-pill"
        >
          {{ key }}: {{ val }}
        </span>
      </div>
    </div>
  </div>

  <!-- Gráfico capacidad vs demanda -->
  <RecursosComparativoChart
    v-if="chartItemsDashboard.length"
    :items="chartItemsDashboard"
    titulo="Capacidad actual vs Demanda proyectada"
  />

  <h3 class="subsection-title">Cuadro comparativo</h3>

  <table class="table">
    <thead>
      <tr>
        <th>Tipo</th>
        <th>Capacidad</th>
        <th>Uso máx. histórico</th>
        <th>Demanda proyectada</th>
        <th>Cobertura</th>
        <th>Faltantes</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="r in dashboard.comparativoRecursos" :key="r.tipo">
        <td>{{ r.tipo }}</td>
        <td>{{ r.capacidadActual }}</td>
        <td>{{ r.usoHistoricoMaximo }}</td>
        <td>{{ r.demandaProyectada }}</td>
        <td>
          <span v-if="r.cobertura !== null" class="badge" :class="coberturaClass(r.cobertura)">
            {{ r.cobertura }}
          </span>
          <span v-else>-</span>
        </td>
        <td>
          <span v-if="r.faltantes > 0" class="faltantes">{{ r.faltantes }}</span>
          <span v-else>0</span>
        </td>
      </tr>
    </tbody>
  </table>

  <p v-if="!dashboard.comparativoRecursos.length" class="muted">
    No hay datos suficientes para comparativo en este periodo.
  </p>
</div>

<div class="card" v-else-if="errorDashboard">
  <p class="error-text">{{ errorDashboard }}</p>
</div>



      <table class="table">
        <thead>
          <tr>
            <th>Tipo de recurso</th>
            <th>Uso histórico máximo</th>
            <th>Demanda proyectada</th>
            <th>Capacidad actual</th>
            <th>Cobertura</th>
            <th>Faltantes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in resultado.recursos" :key="r.tipo">
            <td>{{ r.tipo }}</td>
            <td>{{ r.usoHistoricoMaximo }}</td>
            <td>{{ r.demandaProyectada }}</td>
            <td>{{ r.capacidadActual }}</td>
            <td>
              <span
                v-if="r.cobertura !== null"
                class="badge"
                :class="coberturaClass(r.cobertura)"
              >
                {{ r.cobertura }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="r.faltantes > 0" class="faltantes">
                {{ r.faltantes }}
              </span>
              <span v-else>0</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- RANKING -->
    <div class="card" v-if="ranking && ranking.length">
      <h2 class="card-title">Top espacios más usados</h2>
      <p class="subtitle" v-if="rankingMeta">
        Métrica: <strong>{{ rankingMeta.metrica }}</strong> · Últimos {{ meses }} meses
      </p>

      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Espacio</th>
            <th>Tipo</th>
            <th>Nº reservas</th>
            <th>Horas totales</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(e, i) in ranking" :key="e.espacioId">
            <td>{{ i + 1 }}</td>
            <td>{{ e.nombre }}</td>
            <td>{{ e.tipo }}</td>
            <td>{{ e.totalReservas }}</td>
            <td>{{ e.horasTotales }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card" v-else-if="ranking && !ranking.length">
      <p>No hay datos suficientes para ranking en este periodo.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { listarFacultades, type Facultad } from '../services/facultades.service';

//GRAFICA
import { computed } from 'vue';
import RecursosComparativoChart from '../components/RecursosComparativoChart.vue';
import { getCoreResumenPorFacultad, type CoreResumenResponse } from '../services/core.service';
const dashboard = ref<CoreResumenResponse | null>(null);
const loadingDashboard = ref(false);
const errorDashboard = ref<string | null>(null);

const chartItemsDashboard = computed(() => {
  if (!dashboard.value) return [];
  return dashboard.value.comparativoRecursos.map((r) => ({
    tipo: r.tipo,
    capacidadActual: r.capacidadActual,
    demandaProyectada: r.demandaProyectada,
  }));
});
async function cargarDashboard() {
  if (!facultadId.value) return;

  loadingDashboard.value = true;
  errorDashboard.value = null;
  dashboard.value = null;

  try {
    const data = await getCoreResumenPorFacultad(facultadId.value, {
      meses: meses.value,
      crecimiento: crecimiento.value,
    });
    dashboard.value = data;
  } catch (err: any) {
    console.error(err);
    errorDashboard.value =
      err?.response?.data?.message || 'Error al generar el dashboard core.';
  } finally {
    loadingDashboard.value = false;
  }
}




interface PronosticoRecurso {
  tipo: string;
  usoHistoricoMaximo: number;
  demandaProyectada: number;
  capacidadActual: number;
  cobertura: number | null;
  faltantes: number;
}

interface PronosticoResponse {
  facultad: string;
  ventana: {
    inicio: string;
    fin: string;
  };
  factorCrecimiento: number;
  recursos: PronosticoRecurso[];
}
// Ranking de espacios
const ranking = ref<any[] | null>(null);
const rankingMeta = ref<any | null>(null);
const loadingRanking = ref(false);
const rankingMetrica = ref<'reservas' | 'horas'>('reservas');
const rankingLimit = ref(10);

async function calcularRankingEspacios() {
  if (!facultadId.value) return;

  loadingRanking.value = true;
  try {
    const { data } = await api.get(
      `/reservas/ranking-espacios/facultad/${facultadId.value}`,
      {
        params: {
          meses: meses.value,
          metrica: rankingMetrica.value,
          limit: rankingLimit.value,
        },
      }
    );

    ranking.value = data.ranking;
    rankingMeta.value = data;
  } catch (err) {
    console.error(err);
    ranking.value = [];
    rankingMeta.value = null;
  } finally {
    loadingRanking.value = false;
  }
}
// Pronóstico de recursos

const facultades = ref<Facultad[]>([]);
const facultadId = ref<string>('');
const crecimiento = ref<number>(0.2);
const meses = ref(6);
const resultado = ref<PronosticoResponse | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function cargarFacultades() {
  try {
    facultades.value = await listarFacultades();
  } catch (err) {
    console.error(err);
  }
}

async function calcularPronostico() {
  if (!facultadId.value) return;

  loading.value = true;
  error.value = null;
  resultado.value = null;

  try {
    const { data } = await api.get(
    `/reservas/pronostico/facultad/${facultadId.value}`,
    {
      params: {
        crecimiento: crecimiento.value,
        meses: meses.value,
      },
    }
  );
  resultado.value = data;
  } catch (err: any) {
    console.error(err);
    error.value =
      err?.response?.data?.message || 'Error al calcular el pronóstico.';
  } finally {
    loading.value = false;
  }
}

function coberturaClass(valor: number | null) {
  if (valor === null) return '';
  if (valor < 0.8) return 'badge-danger';
  if (valor < 1) return 'badge-warning';
  return 'badge-success';
}

onMounted(() => {
  cargarFacultades();
});
</script>

<style scoped>
.admin-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 1rem 0.5rem 2rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
}

.title {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.card {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.pill {
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 0.8rem;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.75rem;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

select {
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
}

select:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.15);
}

.btn {
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  background: #2563eb;
  color: #ffffff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.table th,
.table td {
  padding: 0.55rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.table thead {
  background: #f3f4f6;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 500;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-success {
  background: #dcfce7;
  color: #166534;
}

.faltantes {
  font-weight: 600;
  color: #b91c1c;
}

.error-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #b91c1c;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin: 0.75rem 0 1rem;
}

.kpi {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.8rem;
  background: #fafafa;
}

.kpi-label {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.kpi-value {
  margin: 0.35rem 0 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.kpi-sub {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: #4b5563;
}

.estado-list {
  margin-top: 0.35rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.estado-pill {
  background: #eef2ff;
  color: #3730a3;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.78rem;
}

.subsection-title {
  margin: 1rem 0 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}


</style>
