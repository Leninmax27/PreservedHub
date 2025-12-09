<template>
  <section class="admin-recursos">
    <header class="header">
      <h1>Gestión de Recursos</h1>
      <p>Administra equipos, dispositivos y herramientas por facultad y espacio.</p>
    </header>

    <!-- FILTROS -->
    <div class="card filters-card">
      <h2>Filtros</h2>
      <form @submit.prevent="cargarRecursos">
        <div class="filters-grid">
          <label>
            Facultad
            <select v-model="filtros.facultad" @change="cargarEspaciosPorFiltro">
              <option value="">Todas</option>
              <option v-for="fac in facultades" :key="fac._id" :value="fac._id">
                {{ fac.nombre }}
              </option>
            </select>
          </label>

          <label>
            Espacio
            <select v-model="filtros.espacio">
              <option value="">Todos</option>
              <option v-for="esp in espaciosFiltro" :key="esp._id" :value="esp._id">
                {{ esp.nombre }}
              </option>
            </select>
          </label>

          <label>
  Tipo
  <select v-model="filtros.tipo">
    <option value="">Todos</option>
    <option v-for="t in TIPOS_RECURSO" :key="t" :value="t">
      {{ t }}
    </option>
  </select>
</label>

          <label>
            Estado
            <select v-model="filtros.estado">
              <option value="">Todos</option>
              <option value="DISPONIBLE">DISPONIBLE</option>
              <option value="RESERVADO">RESERVADO</option>
              <option value="MANTENIMIENTO">MANTENIMIENTO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </label>
        </div>

        <div class="filters-actions">
          <button class="btn primary" type="submit">Aplicar filtros</button>
          <button class="btn" type="button" @click="resetFiltros">Limpiar</button>
        </div>
      </form>
    </div>

    <!-- Crear -->
    <div class="actions">
      <button class="btn primary" @click="abrirCrear">+ Nuevo recurso</button>
    </div>

    <!-- TABLA -->
    <div class="card">
      <h2>Lista de recursos</h2>

      <table class="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Código Inventario</th>
            <th>Facultad</th>
            <th>Espacio</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th class="acciones-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rec in recursos" :key="rec._id">
            <td>{{ rec.nombre }}</td>
            <td>{{ rec.tipo }}</td>
            <td>{{ rec.codigoInventario || '-' }}</td>
            <td>{{ rec.facultadNombre }}</td>
            <td>{{ rec.espacioNombre }}</td>
            <td>{{ rec.cantidad }}</td>
            <td>
              <span class="badge">{{ rec.estado }}</span>
            </td>
            <td class="acciones-col">
              <button class="btn small" @click="abrirEditar(rec)">Editar</button>
              <button class="btn small danger" @click="confirmarEliminar(rec)">Eliminar</button>
            </td>
          </tr>

          <tr v-if="recursos.length === 0">
            <td colspan="8" class="no-data">No hay recursos registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL CREAR / EDITAR -->
    <div v-if="mostrarModal" class="modal-backdrop">
      <div class="modal">
        <header class="modal-header">
          <h2>{{ editando ? 'Editar recurso' : 'Crear recurso' }}</h2>
          <button class="close-btn" @click="cerrarModal">×</button>
        </header>

        <form class="modal-body" @submit.prevent="guardarRecurso">
          <div class="form-grid">
            <label>
              Nombre
              <input v-model="form.nombre" required />
            </label>

            <label>
  Tipo
  <select v-model="form.tipo" required>
    <option
      v-for="t in TIPOS_RECURSO"
      :key="t"
      :value="t"
    >
      {{ t }}
    </option>
  </select>
</label>

            <label>
              Código Inventario
              <input v-model="form.codigoInventario" />
            </label>

            <label>
              Cantidad
              <input type="number" v-model.number="form.cantidad" min="1" required />
            </label>

            <label>
              Facultad
              <select v-model="form.facultad" @change="cargarEspaciosParaForm" required>
                <option value="">Seleccione...</option>
                <option v-for="fac in facultades" :key="fac._id" :value="fac._id">
                  {{ fac.nombre }}
                </option>
              </select>
            </label>

            <label>
              Asignar a espacio (opcional)
              <select v-model="form.espacio">
                <option value="">Sin asignar</option>
                <option v-for="esp in espaciosForm" :key="esp._id" :value="esp._id">
                  {{ esp.nombre }}
                </option>
              </select>
            </label>

            <label>
              Estado
              <select v-model="form.estado" required>
                <option value="DISPONIBLE">DISPONIBLE</option>
                <option value="RESERVADO">RESERVADO</option>
                <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                <option value="INACTIVO">INACTIVO</option>
              </select>
            </label>
          </div>

          <label class="full">
            Descripción
            <textarea v-model="form.descripcion" rows="3"></textarea>
          </label>

          <footer class="modal-footer">
            <button class="btn primary" type="submit">
              {{ editando ? 'Guardar cambios' : 'Crear recurso' }}
            </button>
            <button class="btn" type="button" @click="cerrarModal">Cancelar</button>
          </footer>
        </form>
      </div>
    </div>

    <!-- MODAL ELIMINAR -->
    <div v-if="recursoAEliminar" class="modal-backdrop">
      <div class="modal small">
        <header class="modal-header">
          <h2>Confirmar eliminación</h2>
          <button class="close-btn" @click="recursoAEliminar = null">×</button>
        </header>

        <div class="modal-body">
          <p>
            ¿Eliminar recurso <strong>{{ recursoAEliminar.nombre }}</strong>?
          </p>
        </div>

        <footer class="modal-footer">
          <button class="btn danger" @click="borrarRecurso">Eliminar</button>
          <button class="btn" @click="recursoAEliminar = null">Cancelar</button>
        </footer>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getRecursos,
  crearRecurso,
  actualizarRecurso,
  eliminarRecurso as apiEliminarRecurso,
  type Recurso,
  type TipoRecurso,
  type FiltroRecursos,
} from '../services/recursos.service';
import { getFacultades, type Facultad } from '../services/facultades.service';
import { getEspacios, type Espacio } from '../services/espacios.service';

type RecursoListado = Recurso & {
  facultadNombre?: string;
  espacioNombre?: string;
};

const recursos = ref<RecursoListado[]>([]);
const facultades = ref<Facultad[]>([]);
const espaciosFiltro = ref<Espacio[]>([]);
const espaciosForm = ref<Espacio[]>([]);

const filtros = ref<{
  facultad: string;
  espacio: string;
  tipo: TipoRecurso | '';
  estado: string;
}>({
  facultad: '',
  espacio: '',
  tipo: '',
  estado: '',
});

const mostrarModal = ref(false);
const editando = ref(false);
const recursoAEliminar = ref<RecursoListado | null>(null);

const form = ref<Recurso>({
  _id: undefined,
  nombre: '',
  tipo: 'PROYECTOR',
  codigoInventario: '',
  descripcion: '',
  facultad: '',
  espacio: '',
  cantidad: 1,
  estado: 'DISPONIBLE',
});

const TIPOS_RECURSO: TipoRecurso[] = [
  'COMPUTADORA',
  'PROYECTOR',
  'AUDIO',
  'VR',
  'CONSOLA',
  'KITS_LAB',
  'INSTRUMENTAL',
  'MOBILIARIO',
  'OTRO',
];


// CARGAS BÁSICAS
async function cargarFacultades() {
  try {
    facultades.value = await getFacultades();
  } catch (err) {
    console.error('Error al cargar facultades', err);
  }
}

async function cargarRecursos() {
  const filtrosApi: FiltroRecursos = {
    facultad: filtros.value.facultad || undefined,
    espacio: filtros.value.espacio || undefined,
    estado: filtros.value.estado || undefined,
    tipo: filtros.value.tipo || undefined, 
  };

  recursos.value = await getRecursos(filtrosApi);
}


async function cargarEspaciosPorFiltro() {
  try {
    if (!filtros.value.facultad) {
      espaciosFiltro.value = [];
      filtros.value.espacio = '';
      return;
    }
    espaciosFiltro.value = await getEspacios({ facultad: filtros.value.facultad });
  } catch (err) {
    console.error('Error al cargar espacios para filtro', err);
  }
}

async function cargarEspaciosParaForm() {
  try {
    if (!form.value.facultad) {
      espaciosForm.value = [];
      form.value.espacio = '';
      return;
    }
    espaciosForm.value = await getEspacios({ facultad: form.value.facultad });
  } catch (err) {
    console.error('Error al cargar espacios para formulario', err);
  }
}

function resetFiltros() {
  filtros.value = {
    facultad: '',
    espacio: '',
    tipo: '',
    estado: '',
  };
  espaciosFiltro.value = [];
  cargarRecursos();
}

// FORMULARIO
function abrirCrear() {
  editando.value = false;
  form.value = {
    _id: undefined,
    nombre: '',
    tipo: 'PROYECTOR',
    codigoInventario: '',
    descripcion: '',
    facultad: '',
    espacio: '',
    cantidad: 1,
    estado: 'DISPONIBLE',
  };
  espaciosForm.value = [];
  mostrarModal.value = true;
}

function abrirEditar(rec: RecursoListado) {
  editando.value = true;
  form.value = {
    _id: rec._id,
    nombre: rec.nombre,
    tipo: rec.tipo,
    codigoInventario: rec.codigoInventario,
    descripcion: rec.descripcion,
    facultad: typeof rec.facultad === 'string' ? rec.facultad : (rec as any).facultad?._id ?? '',
    espacio: typeof rec.espacio === 'string' ? rec.espacio : (rec as any).espacio?._id ?? '',
    cantidad: rec.cantidad,
    estado: rec.estado,
  };
  cargarEspaciosParaForm();
  mostrarModal.value = true;
}

function cerrarModal() {
  mostrarModal.value = false;
}

async function guardarRecurso() {
  try {
    const payload: Recurso = {
      ...form.value,
      espacio: form.value.espacio || undefined,
    };

    if (editando.value && payload._id) {
      await actualizarRecurso(payload._id, payload);
    } else {
      await crearRecurso(payload);
    }

    mostrarModal.value = false;
    await cargarRecursos();
  } catch (err) {
    console.error('Error al guardar recurso', err);
  }
}

// ELIMINAR
function confirmarEliminar(rec: RecursoListado) {
  recursoAEliminar.value = rec;
}

async function borrarRecurso() {
  if (!recursoAEliminar.value?._id) return;

  try {
    await apiEliminarRecurso(recursoAEliminar.value._id);
    recursoAEliminar.value = null;
    await cargarRecursos();
  } catch (err) {
    console.error('Error al eliminar recurso', err);
  }
}

onMounted(async () => {
  await cargarFacultades();
  await cargarRecursos();
});
</script>

<style scoped>
.admin-recursos {
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

.card {
  background: #ffffff;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.filters-card h2 {
  margin-bottom: 0.75rem;
}

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

input,
select,
textarea {
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

.btn.danger {
  background: #ef4444;
  color: #ffffff;
}

.btn.small {
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
}

.btn:hover {
  opacity: 0.95;
}

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

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: #e5e7eb;
}

.acciones-col {
  white-space: nowrap;
}

/* MODAL */
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
</style>