<template>
  <section class="admin-page">
    <h1 class="title">Gestión de Reservas</h1>
    <p class="subtitle">
      Supervisa, aprueba o cancela reservas realizadas por los usuarios.
    </p>

    <!-- FILTROS -->
    <div class="card">
      <h2 class="card-title">Filtros</h2>

      <form class="filters" @submit.prevent="cargarReservas">
        <label>
          Facultad
          <select v-model="filtroFacultad">
            <option value="">Todas</option>
            <option
              v-for="fac in facultades"
              :key="fac._id"
              :value="fac._id"
            >
              {{ fac.nombre }}
            </option>
          </select>
          <small class="hint">
            (Por ahora es visual. Para filtrar realmente por facultad, el backend
            debe devolver esa información en cada reserva.)
          </small>
        </label>

        <label>
          Estado
          <select v-model="filtroEstado">
            <option value="">Todos</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="CONFIRMADA">CONFIRMADA</option>
            <option value="RECHAZADA">RECHAZADA</option>
            <option value="CANCELADA">CANCELADA</option>
            <option value="FINALIZADA">FINALIZADA</option>
          </select>
        </label>

        <label>
          Usuario
          <input
            v-model="filtroUsuario"
            placeholder="Nombre o correo"
            type="text"
          />
        </label>

        <div class="filters-actions">
          <button class="btn" type="submit" :disabled="loading">
            {{ loading ? 'Cargando...' : 'Aplicar filtros' }}
          </button>
          <button
            type="button"
            class="btn secondary"
            @click="resetFiltros"
            :disabled="loading"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>

    <!-- LISTA DE RESERVAS -->
    <div class="card">
      <div class="card-header-row">
        <h2 class="card-title">Reservas realizadas</h2>
        <span class="pill">
          Total: {{ reservasFiltradas.length }}
        </span>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Materia</th>
            <th>Espacio</th>
            <th>Fecha inicio</th>
            <th>Fecha fin</th>
            <th>Estado</th>
            <th class="col-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="res in reservasFiltradas" :key="res._id">
            <td>
              <div class="cell-main">
                <span class="cell-strong">
                  {{ res.usuario?.nombre }} {{ res.usuario?.apellido }}
                </span>
                <span class="cell-muted">{{ res.usuario?.correo }}</span>
              </div>
            </td>
            <td>
              <div class="cell-main">
                <span>{{ res.materia?.nombre || 'Sin materia' }}</span>
                <span class="cell-muted">{{ res.materia?.codigo }}</span>
              </div>
            </td>
            <td>
              <div class="cell-main">
                <span>{{ res.espacio?.nombre }}</span>
                <span class="cell-muted">{{ res.espacio?.tipo }}</span>
              </div>
            </td>
            <td>{{ formatFecha(res.fechaInicio) }}</td>
            <td>{{ formatFecha(res.fechaFin) }}</td>
            <td>
              <span class="badge" :class="`estado-${res.estado.toLowerCase()}`">
                {{ res.estado }}
              </span>
            </td>
            <td class="col-actions">
              <button
                v-if="res.estado === 'PENDIENTE'"
                class="btn small"
                @click="cambiarEstado(res, 'CONFIRMADA')"
              >
                Aprobar
              </button>
              <button
                v-if="res.estado === 'PENDIENTE'"
                class="btn small danger"
                @click="cambiarEstado(res, 'RECHAZADA')"
              >
                Rechazar
              </button>
              <button
                v-if="res.estado === 'CONFIRMADA'"
                class="btn small secondary"
                @click="cambiarEstado(res, 'CANCELADA')"
              >
                Cancelar
              </button>
              <button
                class="btn small secondary"
                @click="verDetalles(res)"
              >
                Detalles
              </button>
               <button
    class="btn small danger"
    @click="solicitarEliminar(res)"
  >
    Eliminar
  </button>
            </td>
          </tr>

          <tr v-if="!loading && reservasFiltradas.length === 0">
            <td colspan="7" class="no-data">
              No hay reservas con los filtros actuales.
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="7" class="no-data">
              Cargando reservas...
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="error" class="error-text">{{ error }}</p>
    </div>

    <!-- DETALLE DE RESERVA -->
    <div v-if="reservaSeleccionada" class="card card-detail">
      <div class="card-header-row">
        <h2 class="card-title">Detalle de reserva</h2>
        <button class="btn small secondary" @click="reservaSeleccionada = null">
          Cerrar
        </button>
      </div>

      <div class="detail-grid">
        <div class="detail-block">
          <h3>Usuario</h3>
          <p class="detail-main">
            {{ reservaSeleccionada.usuario?.nombre }}
            {{ reservaSeleccionada.usuario?.apellido }}
          </p>
          <p class="detail-sub">{{ reservaSeleccionada.usuario?.correo }}</p>
        </div>

        <div class="detail-block">
          <h3>Materia</h3>
          <p class="detail-main">
            {{ reservaSeleccionada.materia?.nombre || 'Sin materia' }}
          </p>
          <p class="detail-sub">
            {{ reservaSeleccionada.materia?.codigo }}
          </p>
        </div>

<div class="detail-block">
  <h3>Facultad</h3>
  <p class="detail-main">
    {{ reservaSeleccionada.materia?.carrera?.facultad?.nombre || 'No disponible' }}
  </p>
</div>

<div class="detail-block">
  <h3>Carrera</h3>
  <p class="detail-main">
    {{ reservaSeleccionada.materia?.carrera?.nombre || 'No disponible' }}
  </p>
  <p class="detail-sub">
    {{ reservaSeleccionada.materia?.carrera?.codigo }}
  </p>
</div>


        <div class="detail-block">
          <h3>Espacio</h3>
          <p class="detail-main">
            {{ reservaSeleccionada.espacio?.nombre }}
          </p>
          <p class="detail-sub">
            {{ reservaSeleccionada.espacio?.tipo }}
          </p>
        </div>

        <div class="detail-block">
          <h3>Fechas</h3>
          <p class="detail-main">
            {{ formatFecha(reservaSeleccionada.fechaInicio) }}
          </p>
          <p class="detail-sub">
            {{ formatFecha(reservaSeleccionada.fechaFin) }}
          </p>
        </div>

        <div class="detail-block full">
          <h3>Recursos reservados</h3>
          <ul v-if="reservaSeleccionada.recursos?.length">
            <li v-for="r in reservaSeleccionada.recursos" :key="r._id">
              {{ r.nombre }}
            </li>
          </ul>
          <p v-else class="detail-sub">No se reservaron recursos específicos.</p>
        </div>

        <div class="detail-block full">
          <h3>Motivo</h3>
          <p class="detail-main">
            {{ reservaSeleccionada.motivo || 'Sin motivo registrado.' }}
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- MODAL ELIMINAR RESERVA -->
<div v-if="reservaAEliminar" class="modal-backdrop">
  <div class="modal small">
    <header class="modal-header">
      <h2>Eliminar reserva</h2>
      <button class="close-btn" @click="cancelarEliminar">×</button>
    </header>

    <div class="modal-body">
      <p>
        ¿Seguro que deseas eliminar la reserva de
        <strong>
          {{ reservaAEliminar.usuario?.nombre }}
          {{ reservaAEliminar.usuario?.apellido }}
        </strong>
        en el espacio
        <strong>{{ reservaAEliminar.espacio?.nombre }}</strong>?
      </p>
      <p class="detail-sub">
        Esta acción no se puede deshacer.
      </p>
    </div>

    <footer class="modal-footer">
      <button class="btn danger small" @click="confirmarEliminar">
        Eliminar
      </button>
      <button class="btn small secondary" @click="cancelarEliminar">
        Cancelar
      </button>
    </footer>
  </div>
</div>

</template>



<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  getReservas,
  updateEstadoReserva,
  deleteReserva,
  type Reserva,
} from '../services/reservas.service';
import {
  listarFacultades,
  type Facultad,
} from '../services/facultades.service';

const reservas = ref<Reserva[]>([]);
const facultades = ref<Facultad[]>([]);

const filtroFacultad = ref<string>('');
const filtroEstado = ref<string>('');
const filtroUsuario = ref<string>('');

const loading = ref(false);
const error = ref<string | null>(null);
const reservaSeleccionada = ref<Reserva | null>(null);
const reservaAEliminar = ref<Reserva | null>(null);


const formatFecha = (fecha: string) =>
  new Date(fecha).toLocaleString('es-EC', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

const reservasFiltradas = computed(() => {
  let lista = [...reservas.value];

  if (filtroEstado.value) {
    lista = lista.filter((r) => r.estado === filtroEstado.value);
  }

  if (filtroUsuario.value.trim()) {
    const q = filtroUsuario.value.trim().toLowerCase();
    lista = lista.filter((r) => {
      const nombreCompleto = `${r.usuario?.nombre ?? ''} ${
        r.usuario?.apellido ?? ''
      }`.toLowerCase();
      const correo = (r.usuario?.correo ?? '').toLowerCase();
      return nombreCompleto.includes(q) || correo.includes(q);
    });
  }

  // Nota: el filtro por facultad se puede implementar cuando la API
  // devuelva la facultad asociada a la reserva (espacio o materia).

  return lista;
});

async function cargarFacultades() {
  try {
    facultades.value = await listarFacultades();
  } catch (err) {
    console.error(err);
  }
}

async function cargarReservas() {
  loading.value = true;
  error.value = null;
  try {
    const data = await getReservas({
      estado: filtroEstado.value || undefined,
      // usuario: aquí podrías filtrar por ID si tuvieras un selector de usuario
    });
    reservas.value = data;
  } catch (err: any) {
    console.error(err);
    error.value =
      err?.response?.data?.message ||
      'Error al cargar las reservas desde el servidor.';
  } finally {
    loading.value = false;
  }
}

function resetFiltros() {
  filtroFacultad.value = '';
  filtroEstado.value = '';
  filtroUsuario.value = '';
  cargarReservas();
}

function verDetalles(reserva: Reserva) {
  reservaSeleccionada.value = reserva;
}

async function cambiarEstado(reserva: Reserva, nuevoEstado: Reserva['estado']) {
  try {
    await updateEstadoReserva(reserva._id, nuevoEstado);
    await cargarReservas();

    if (reservaSeleccionada.value?._id === reserva._id) {
      const actualizada = reservas.value.find((r) => r._id === reserva._id);
      if (actualizada) reservaSeleccionada.value = actualizada;
    }
  } catch (err) {
    console.error(err);
  }
}

function solicitarEliminar(reserva: Reserva) {
  reservaAEliminar.value = reserva;
}

async function confirmarEliminar() {
  if (!reservaAEliminar.value?._id) return;

  try {
    const id = reservaAEliminar.value._id;
    await deleteReserva(id);

    if (reservaSeleccionada.value && reservaSeleccionada.value._id === id) {
      reservaSeleccionada.value = null;
    }

    reservaAEliminar.value = null;
    await cargarReservas();
  } catch (err) {
    console.error(err);
    error.value = 'No se pudo eliminar la reserva.';
  }
}


function cancelarEliminar() {
  reservaAEliminar.value = null;
}



onMounted(async () => {
  await cargarFacultades();
  await cargarReservas();
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

/* CARD GENÉRICA */
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

/* FILTROS */
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.75rem;
  align-items: flex-end;
}

.filters label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.1rem;
}

.filters-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* INPUTS / SELECTS */
input,
select {
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
  outline: none;
}

input:focus,
select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.15);
}

/* TABLA */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.table thead {
  background: #f3f4f6;
}

.table th,
.table td {
  padding: 0.55rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.table th {
  font-weight: 600;
  font-size: 0.85rem;
  color: #4b5563;
}

.no-data {
  text-align: center;
  padding: 0.9rem 0;
  color: #6b7280;
}

/* CELDAS COMPUESTAS */
.cell-main {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.cell-strong {
  font-weight: 500;
}

.cell-muted {
  font-size: 0.78rem;
  color: #6b7280;
}

/* PILLS / BADGES */
.pill {
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 0.8rem;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 500;
}

/* ESTADOS */
.estado-pendiente {
  background: #fef3c7;
  color: #92400e;
}

.estado-confirmada {
  background: #dcfce7;
  color: #166534;
}

.estado-rechazada {
  background: #fee2e2;
  color: #991b1b;
}

.estado-cancelada {
  background: #e5e7eb;
  color: #374151;
}

.estado-finalizada {
  background: #e0f2fe;
  color: #075985;
}

/* BOTONES */
.btn {
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  background: #2563eb;
  color: #ffffff;
  transition: transform 0.05s ease, box-shadow 0.05s ease,
    background-color 0.15s ease;
}

.btn:hover {
  transform: translateY(-0.5px);
  box-shadow: 0 8px 18px rgba(37, 99, 235, 0.25);
}

.btn:disabled {
  opacity: 0.6;
  cursor: default;
  box-shadow: none;
  transform: none;
}

.btn.secondary {
  background: #e5e7eb;
  color: #111827;
  box-shadow: none;
}

.btn.secondary:hover {
  box-shadow: 0 4px 10px rgba(148, 163, 184, 0.5);
}

.btn.danger {
  background: #ef4444;
  color: #ffffff;
}

.btn.small {
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
}

.col-actions {
  white-space: nowrap;
}

/* DETALLE */
.card-detail {
  margin-top: 1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.detail-block h3 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
  margin-bottom: 0.15rem;
}

.detail-main {
  font-size: 0.95rem;
  font-weight: 500;
}

.detail-sub {
  font-size: 0.8rem;
  color: #6b7280;
}

.detail-block.full {
  grid-column: 1 / -1;
}

.error-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #b91c1c;
}
</style>
