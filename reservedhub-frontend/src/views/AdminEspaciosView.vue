<template>
  <section class="admin-espacios">
    <header class="header">
      <h1>Gestión de Espacios</h1>
      <p>Administra las aulas, laboratorios y otros espacios disponibles para reservas.</p>
    </header>

    <!-- Filtros -->
    <div class="card filters-card">
      <h2>Filtros</h2>
      <form @submit.prevent="cargarEspacios">
        <div class="filters-grid">
          <label>
            Facultad
            <select v-model="filtros.facultad">
              <option value="">Todas</option>
              <option
                v-for="fac in facultades"
                :key="fac._id"
                :value="fac._id"
              >
                {{ fac.nombre }}
              </option>
            </select>
          </label>

          <label>
            Tipo
            <select v-model="filtros.tipo">
              <option value="">Todos</option>
              <option value="AULA">AULA</option>
              <option value="LABORATORIO">LABORATORIO</option>
              <option value="AUDITORIO">AUDITORIO</option>
              <option value="SALA">SALA</option>
            </select>
          </label>

          <label>
            Estado
            <select v-model="filtros.estado">
              <option value="">Todos</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
              <option value="MANTENIMIENTO">MANTENIMIENTO</option>
            </select>
          </label>

          <label>
            Capacidad min
            <input type="number" v-model.number="filtros.capacidadMin" min="0" />
          </label>

          <label>
            Capacidad max
            <input type="number" v-model.number="filtros.capacidadMax" min="0" />
          </label>
        </div>

        <div class="filters-actions">
          <button type="submit" class="btn primary">Aplicar filtros</button>
          <button type="button" class="btn" @click="resetFiltros">Limpiar</button>
        </div>
      </form>
    </div>

    <!-- Botón crear -->
    <div class="actions">
      <button class="btn primary" @click="abrirCrear">
        + Nuevo espacio
      </button>
    </div>

    <!-- Tabla -->
    <div class="card">
      <h2>Lista de espacios</h2>

      <table class="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Codigo</th>
            <th>Tipo</th>
            <th>Capacidad</th>
            <th>Facultad</th>
            <th>Estado</th>
            <th class="acciones-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="esp in espacios" :key="esp._id">
            <td>{{ esp.nombre }}</td>
            <td>{{ esp.codigo || '-' }}</td>
            <td>
              <span class="badge">
                {{ esp.tipo }}
              </span>
            </td>
            <td>{{ esp.capacidad }}</td>
            <td>
              {{ nombreFacultad(esp.facultad) }}
            </td>
            <td>
              <span class="badge" :class="`estado-${esp.estado?.toLowerCase()}`">
                {{ esp.estado }}
              </span>
            </td>
            <td class="acciones-col">
              <button class="btn small" @click="abrirEditar(esp)">Editar</button>
              <button class="btn small danger" @click="confirmarEliminar(esp)">Eliminar</button>
            </td>
          </tr>

          <tr v-if="espacios.length === 0">
            <td colspan="7" class="no-data">
              No hay espacios registrados con los filtros actuales.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal formulario -->
    <div v-if="mostrarModal" class="modal-backdrop">
      <div class="modal">
        <header class="modal-header">
          <h2>{{ editando ? 'Editar espacio' : 'Crear nuevo espacio' }}</h2>
          <button class="close-btn" @click="cerrarModal">×</button>
        </header>

        <form @submit.prevent="guardarEspacio" class="modal-body">
          <div class="form-grid">
            <label>
              Nombre
              <input v-model="form.nombre" type="text" required />
            </label>

            <label>
              Código
              <input v-model="form.codigo" type="text" />
            </label>

            <label>
              Tipo
              <select v-model="form.tipo" required>
                <option value="AULA">AULA</option>
                <option value="LABORATORIO">LABORATORIO</option>
                <option value="AUDITORIO">AUDITORIO</option>
                <option value="SALA">SALA</option>
              </select>
            </label>

            <label>
              Capacidad
              <input v-model.number="form.capacidad" type="number" min="1" required />
            </label>

            <label>
              Facultad
              <select v-model="form.facultad" required>
                <option value="">Seleccione...</option>
                <option
                  v-for="fac in facultades"
                  :key="fac._id"
                  :value="fac._id"
                >
                  {{ fac.nombre }}
                </option>
              </select>
            </label>

            <label>
              Estado
              <select v-model="form.estado" required>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
                <option value="MANTENIMIENTO">MANTENIMIENTO</option>
              </select>
            </label>
          </div>

          <label class="full">
            Ubicación
            <input v-model="form.ubicacion" type="text" placeholder="Ej: Bloque A, piso 2" />
          </label>

          <footer class="modal-footer">
            <button type="submit" class="btn primary">
              {{ editando ? 'Guardar cambios' : 'Crear espacio' }}
            </button>
            <button type="button" class="btn" @click="cerrarModal">Cancelar</button>
          </footer>
        </form>
      </div>
    </div>

    <!-- Modal confirmación eliminar -->
    <div v-if="espacioAEliminar" class="modal-backdrop">
      <div class="modal small">
        <header class="modal-header">
          <h2>Confirmar eliminación</h2>
          <button class="close-btn" @click="espacioAEliminar = null">×</button>
        </header>

        <div class="modal-body">
          <p>
            ¿Seguro que deseas eliminar el espacio
            <strong>{{ espacioAEliminar.nombre }}</strong>?
          </p>
        </div>

        <footer class="modal-footer">
          <button class="btn danger" @click="eliminarEspacio">Eliminar</button>
          <button class="btn" @click="espacioAEliminar = null">Cancelar</button>
        </footer>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Espacio, FiltrosEspacios } from '../services/espacios.service';
import { getEspacios, createEspacio, updateEspacio, deleteEspacio } from '../services/espacios.service';
import { listarFacultades, type Facultad } from '../services/facultades.service';

const espacios = ref<Espacio[]>([]);
const facultades = ref<Facultad[]>([]);

const filtros = ref<FiltrosEspacios>({
  facultad: '',
  tipo: '',
  estado: '',
  capacidadMin: null,
  capacidadMax: null,
});

const mostrarModal = ref(false);
const editando = ref(false);
const espacioActual = ref<Espacio | null>(null);
const espacioAEliminar = ref<Espacio | null>(null);

const form = ref<Espacio>({
  nombre: '',
  codigo: '',
  tipo: 'AULA',
  capacidad: 1,
  ubicacion: '',
  facultad: '',
  estado: 'ACTIVO',
});

async function cargarFacultades() {
  try {
    facultades.value = await listarFacultades();
  } catch (error) {
    console.error('Error al cargar facultades', error);
  }
}

async function cargarEspacios() {
  try {
    espacios.value = await getEspacios(filtros.value);
  } catch (error) {
    console.error('Error al cargar espacios', error);
  }
}

function resetFiltros() {
  filtros.value = {
    facultad: '',
    tipo: '',
    estado: '',
    capacidadMin: null,
    capacidadMax: null,
  };
  cargarEspacios();
}

function abrirCrear() {
  editando.value = false;
  espacioActual.value = null;
  form.value = {
    nombre: '',
    codigo: '',
    tipo: 'AULA',
    capacidad: 1,
    ubicacion: '',
    facultad: '',
    estado: 'ACTIVO',
  };
  mostrarModal.value = true;
}

function abrirEditar(espacio: Espacio) {
  editando.value = true;
  espacioActual.value = espacio;
  form.value = { ...espacio };
  mostrarModal.value = true;
}

function cerrarModal() {
  mostrarModal.value = false;
}

async function guardarEspacio() {
  try {
    if (editando.value && espacioActual.value?._id) {
      await updateEspacio(espacioActual.value._id, form.value);
    } else {
      await createEspacio(form.value);
    }
    mostrarModal.value = false;
    await cargarEspacios();
  } catch (error) {
    console.error('Error al guardar espacio', error);
  }
}

function confirmarEliminar(espacio: Espacio) {
  espacioAEliminar.value = espacio;
}

async function eliminarEspacio() {
  if (!espacioAEliminar.value?._id) return;
  try {
    await deleteEspacio(espacioAEliminar.value._id);
    espacioAEliminar.value = null;
    await cargarEspacios();
  } catch (error) {
    console.error('Error al eliminar espacio', error);
  }
}

function nombreFacultad(idFacultad: string) {
  const fac = facultades.value.find((f) => f._id === idFacultad);
  return fac ? fac.nombre : 'N/A';
}

onMounted(async () => {
  await cargarFacultades();
  await cargarEspacios();
});
</script>

<style scoped>
.admin-espacios {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header h1 {
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
}

.header p {
  color: #6b7280;
}

/* Cards */
.card {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.filters-card h2 {
  margin-bottom: 0.75rem;
}

/* Grid filtros */
.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.filters-grid label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  gap: 0.25rem;
}

/* Inputs */
input,
select {
  border-radius: 0.5rem;
  border: 1px solid #d1d5db;
  padding: 0.4rem 0.6rem;
  font-size: 0.9rem;
}

.filters-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

/* Botones */
.actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.btn.primary {
  background: #2563eb;
  color: #ffffff;
}

.btn:hover {
  opacity: 0.95;
}

/* Tabla */
.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.tabla thead {
  background: #f3f4f6;
}

.tabla th,
.tabla td {
  padding: 0.6rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.no-data {
  text-align: center;
  padding: 1rem 0;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: #e5e7eb;
}

/* Estados */
.estado-activo {
  background: #dcfce7;
  color: #166534;
}

.estado-inactivo {
  background: #fee2e2;
  color: #991b1b;
}

.estado-mantenimiento {
  background: #fef3c7;
  color: #92400e;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}

.modal {
  background: #ffffff;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.3);
  display: flex;
  flex-direction: column;
}

.modal.small {
  max-width: 400px;
}

.modal-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
}

/* Formulario modal */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 0.75rem;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.full {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Columna acciones */
.acciones-col {
  white-space: nowrap;
}

/* Botones extra */
.btn.danger {
  background: #ef4444;
  color: #ffffff;
}

.btn.small {
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
}
</style>
