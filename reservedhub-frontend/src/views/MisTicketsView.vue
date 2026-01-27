<template>
  <section class="page">
    <div class="header">
      <div>
        <h1 class="title">Mis tickets</h1>
        <p class="subtitle">
          Consulta el estado de tus tickets (emitido, usado o cancelado).
        </p>
      </div>

      <button class="btn secondary" @click="cargar" :disabled="loading">
        {{ loading ? 'Cargando...' : 'Actualizar' }}
      </button>
    </div>

    <div class="card" v-if="error">
      <p class="error">{{ error }}</p>
    </div>

    <div class="card" v-if="!loading && tickets.length === 0 && !error">
      <p>No tienes tickets todavía.</p>
    </div>

    <div class="grid" v-if="tickets.length">
      <div class="ticket" v-for="t in tickets" :key="t._id">
        <div class="row">
          <div>
            <div class="code">{{ t.codigo }}</div>
            <div class="meta">Creado: {{ formatDate(t.createdAt) }}</div>
          </div>

          <span class="badge" :class="badgeClass(t.estado)">
            {{ t.estado }}
          </span>
        </div>

        <div class="divider"></div>

        <div class="info">
          <div class="line">
            <span class="label">Reserva:</span>
            <span class="value">{{ t.reserva?._id || '-' }}</span>
          </div>

          <div class="line" v-if="t.reserva?.fechaInicio && t.reserva?.fechaFin">
            <span class="label">Horario:</span>
            <span class="value">
              {{ formatDateTime(t.reserva.fechaInicio) }} →
              {{ formatDateTime(t.reserva.fechaFin) }}
            </span>
          </div>

          <div class="line" v-if="t.reserva?.estado">
            <span class="label">Estado reserva:</span>
            <span class="value">{{ t.reserva.estado }}</span>
          </div>

          <div class="line" v-if="t.reserva?.motivo">
            <span class="label">Motivo:</span>
            <span class="value">{{ t.reserva.motivo }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth';
import { listarMisTickets, type Ticket } from '../services/tickets.service';

const { usuario } = useAuth();

const tickets = ref<Ticket[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

function badgeClass(estado: string) {
  if (estado === 'EMITIDO') return 'ok';
  if (estado === 'USADO') return 'used';
  return 'cancel';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString();
}

async function cargar() {
  error.value = null;
  tickets.value = [];

  if (!usuario.value?.id) {
    error.value = 'No hay usuario autenticado.';
    return;
  }

  loading.value = true;
  try {
    tickets.value = await listarMisTickets(usuario.value.id);
  } catch (e: any) {
    console.error(e);
    error.value = e?.response?.data?.message || 'Error al cargar tickets.';
  } finally {
    loading.value = false;
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
  gap: 1rem;
  margin-bottom: 1rem;
}

.title {
  font-size: 1.6rem;
  margin: 0;
}

.subtitle {
  color: #6b7280;
  margin-top: 0.3rem;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.ticket {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.code {
  font-weight: 700;
}

.meta {
  font-size: 0.85rem;
  color: #6b7280;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.75rem 0;
}

.info {
  display: grid;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.line {
  display: flex;
  gap: 0.5rem;
}

.label {
  min-width: 110px;
  color: #6b7280;
}

.badge {
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.badge.ok {
  background: #dcfce7;
  color: #166534;
}

.badge.used {
  background: #e0e7ff;
  color: #3730a3;
}

.badge.cancel {
  background: #fee2e2;
  color: #991b1b;
}

.btn {
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  background: #3b82f6;
  color: #fff;
}

.btn.secondary {
  background: #e5e7eb;
  color: #111827;
}

.error {
  color: #b91c1c;
}
</style>
