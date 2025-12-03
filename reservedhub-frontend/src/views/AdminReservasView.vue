<template>
  <section class="admin-reservas">
    <header class="header">
      <h1>Gestión de Reservas</h1>
      <p>Supervisa, aprueba o cancela reservas realizadas por los usuarios.</p>
    </header>

    <!-- FILTROS -->
    <div class="card filters-card">
      <h2>Filtros</h2>
      <form @submit.prevent="cargarReservas">
        <div class="filters-grid">

          <label>
            Facultad
            <select v-model="filtros.facultad">
              <option value="">Todas</option>
              <option v-for="fac in facultades" :key="fac._id" :value="fac._id">
                {{ fac.nombre }}
              </option>
            </select>
          </label>

          <label>
            Estado
            <select v-model="filtros.estado">
              <option value="">Todos</option>
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="APROBADA">APROBADA</option>
              <option value="RECHAZADA">RECHAZADA</option>
              <option value="CANCELADA">CANCELADA</option>
            </select>
          </label>

          <label>
            Usuario
            <input v-model="filtros.usuario" placeholder="Nombre o correo" />
          </label>

        </div>

        <div class="filters-actions">
          <button class="btn primary">Aplicar filtros</button>
          <button type="button" class="btn" @click="resetFiltros">Limpiar</button>
        </div>
      </form>
    </div>

    <!-- TABLA -->
    <div class="card">
      <h2>Reservas realizadas</h2>

      <table class="tabla">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Materia</th>
            <th>Espacio</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Estado</th>
            <th class="acciones-col">Acciones</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="res in reservas" :key="res._id">
            <td>{{ res.usuario?.nombre }} {{ res.usuario?.apellido }}</td>
            <td>{{ res.materia?.nombre }}</td>
            <td>{{ res.espacio?.nombre }}</td>
            <td>{{ formatFecha(res.fechaInicio) }}</td>
            <td>{{ formatFecha(res.fechaFin) }}</td>
            <td>
              <span class="badge" :class="`estado-${res.estado.toLowerCase()}`">
                {{ res.estado }}
              </span>
            </td>

            <td class="acciones-col">
              <button
                v-if="res.estado === 'PENDIENTE'"
                class="btn small"
                @click="cambiarEstado(res, 'CONFIRMADA')"
              >Aprobar</button>

              <button
                v-if="res.estado === 'PENDIENTE'"
                class="btn small danger"
                @click="cambiarEstado(res, 'RECHAZADA')"
              >Rechazar</button>

              <button class="btn small" @click="verDetalles(res)">
                Detalles
              </button>
            </td>
          </tr>

          <tr v-if="reservas.length === 0">
            <td colspan="7" class="no-data">No hay reservas con los filtros actuales.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL DETALLES -->
    <div v-if="reservaActual" class="modal-backdrop">
      <div class="modal">
        <header class="modal-header">
          <h2>Detalle de Reserva</h2>
          <button class="close-btn" @click="reservaActual = null">×</button>
        </header>

        <div class="modal-body">
          <p><strong>Usuario:</strong> {{ reservaActual.usuario?.nombre }} {{ reservaActual.usuario?.apellido }}</p>
          <p><strong>Materia:</strong> {{ reservaActual.materia?.nombre }}</p>
          <p><strong>Fecha:</strong> {{ formatFecha(reservaActual.fechaInicio) }} - {{ formatFecha(reservaActual.fechaFin) }}</p>

          <h3>Espacio</h3>
          <p>{{ reservaActual.espacio?.nombre }}</p>

         <h3>Recursos reservados</h3>
<ul>
  <li v-if="!reservaActual.recursos || reservaActual.recursos.length === 0">
    Sin recursos asociados.
  </li>
  <li
    v-else
    v-for="r in reservaActual.recursos"
    :key="r._id"
  >
    {{ r.nombre }}
  </li>
          </ul>

          <h3>Motivo</h3>
          <p>{{ reservaActual.motivo }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

import {
  getReservas,
  updateEstadoReserva,
  type Reserva,
} from "../services/reservas.service";

import { getFacultades, type Facultad } from "../services/facultades.service";

const reservas = ref<Reserva[]>([]);
const facultades = ref<Facultad[]>([]);
const reservaActual = ref<Reserva | null>(null);

const filtros = ref({
  facultad: "",
  estado: "",
  usuario: "",
});

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleString();
}

async function cargarReservas() {
  reservas.value = await getReservas(filtros.value);
}

async function cargarFacultades() {
  facultades.value = await getFacultades();
}

function resetFiltros() {
  filtros.value = { facultad: "", estado: "", usuario: "" };
  cargarReservas();
}

function verDetalles(reserva: Reserva) {
  reservaActual.value = reserva;
}

function cambiarEstado(reserva: Reserva, nuevoEstado: Reserva['estado']) {
  updateEstadoReserva(reserva._id!, nuevoEstado);
}


onMounted(() => {
  cargarFacultades();
  cargarReservas();
});
</script>


