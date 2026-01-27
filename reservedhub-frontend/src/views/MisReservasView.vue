<template>
  <section class="page">
    <div class="header">
      <div>
        <h1 class="title">Mis reservas</h1>
        <p class="subtitle">
          Revisa tus reservas, su estado y cancela cuando corresponda.
        </p>
      </div>

      <button class="btn secondary" @click="cargar" :disabled="loading">
        {{ loading ? 'Cargando...' : 'Actualizar' }}
      </button>
    </div>

    <div class="card" v-if="error">
      <p class="error">{{ error }}</p>
    </div>

    <div class="card" v-if="!loading && reservas.length === 0 && !error">
      <p>No tienes reservas todavía.</p>
      <router-link class="btn" to="/reservas/nueva">Crear una reserva</router-link>
    </div>

    <div class="grid" v-if="reservas.length">
      <div class="reserva" v-for="r in reservas" :key="r._id">
        <div class="row">
          <div class="main">
            <div class="space">
              {{ r.espacio?.nombre || 'Sin espacio' }}
              <span v-if="r.espacio?.codigo" class="muted">
                ({{ r.espacio.codigo }})
              </span>
            </div>

            <div class="meta">
              <span class="muted">
                {{ formatDateTime(r.fechaInicio) }} → {{ formatDateTime(r.fechaFin) }}
              </span>
            </div>
          </div>

          <span class="badge" :class="estadoClass(r.estado)">
            {{ r.estado }}
          </span>
        </div>

        <div class="divider"></div>

        <div class="info">
          <div class="line" v-if="r.materia?.nombre">
            <span class="label">Materia:</span>
            <span class="value">{{ r.materia.nombre }}</span>
          </div>

          <div class="line" v-if="r.motivo">
            <span class="label">Motivo:</span>
            <span class="value">{{ r.motivo }}</span>
          </div>

          <div class="line" v-if="r.recursos && r.recursos.length">
            <span class="label">Recursos:</span>
            <span class="value chips">
              <span class="chip" v-for="rec in r.recursos" :key="rec._id">
                {{ rec.nombre }}<span v-if="rec.tipo"> ({{ rec.tipo }})</span>
              </span>
            </span>
          </div>
        </div>

        <div class="actions">
          <button
            class="btn danger"
            @click="cancelar(r._id)"
            :disabled="cancelandoId === r._id || !puedeCancelar(r.estado)"
          >
            {{ cancelandoId === r._id ? 'Cancelando...' : 'Cancelar' }}
          </button>
        </div>

        <p v-if="!puedeCancelar(r.estado)" class="hint">
          Solo puedes cancelar reservas en estado PENDIENTE o CONFIRMADA.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getMisReservas, cancelarReserva, type Reserva } from '../services/reservas.service';

const reservas = ref<Reserva[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const cancelandoId = ref<string | null>(null);

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function estadoClass(estado: Reserva['estado']) {
  if (estado === 'PENDIENTE') return 'warn';
  if (estado === 'CONFIRMADA') return 'ok';
  if (estado === 'FINALIZADA') return 'done';
  if (estado === 'RECHAZADA') return 'bad';
  return 'neutral'; // CANCELADA
}

function puedeCancelar(estado: Reserva['estado']) {
  return estado === 'PENDIENTE' || estado === 'CONFIRMADA';
}

async function cargar() {
  error.value = null;
  loading.value = true;
  try {
    reservas.value = await getMisReservas();
  } catch (e: any) {
    console.error(e);
    error.value = e?.response?.data?.message || 'Error al cargar tus reservas.';
  } finally {
    loading.value = false;
  }
}

async function cancelar(id: string) {
  if (cancelandoId.value) return;

  cancelandoId.value = id;
  error.value = null;

  try {
    await cancelarReserva(id);
    await cargar();
  } catch (e: any) {
    console.error(e);
    error.value = e?.response?.data?.message || 'No se pudo cancelar la reserva.';
  } finally {
    cancelandoId.value = null;
  }
}

onMounted(cargar);
</script>

<style scoped>
.page {
  max-width: 980px;
  margin: 0 auto;
  padding: 1rem 0.75rem 2rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.6rem;
  margin: 0;
}

.subtitle {
  color: #6b7280;
  margin: 0.25rem 0 0;
}

.card,
.reserva {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.space {
  font-weight: 700;
}

.muted {
  color: #6b7280;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.75rem 0;
}

.info {
  display: grid;
  gap: 0.45rem;
  font-size: 0.92rem;
}

.line {
  display: flex;
  gap: 0.5rem;
}

.label {
  min-width: 70px;
  color: #6b7280;
}

.value {
  color: #111827;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chip {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  background: #f3f4f6;
  font-size: 0.8rem;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.75rem;
}

.hint {
  margin-top: 0.4rem;
  color: #6b7280;
  font-size: 0.82rem;
}

.badge {
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge.ok {
  background: #dcfce7;
  color: #166534;
}

.badge.warn {
  background: #fef3c7;
  color: #92400e;
}

.badge.done {
  background: #e0e7ff;
  color: #3730a3;
}

.badge.bad {
  background: #fee2e2;
  color: #991b1b;
}

.badge.neutral {
  background: #e5e7eb;
  color: #111827;
}

.btn {
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  background: #3b82f6;
  color: #fff;
  text-decoration: none;
  display: inline-block;
}

.btn.secondary {
  background: #e5e7eb;
  color: #111827;
}

.btn.danger {
  background: #ef4444;
  color: #fff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.error {
  color: #b91c1c;
  margin: 0;
}
</style>
