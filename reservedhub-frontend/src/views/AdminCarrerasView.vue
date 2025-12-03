<template>
  <section class="admin-carreras">
    <h1>Gestión de carreras</h1>
    <p class="subtitle">
      Crea y administra las carreras asociadas a cada facultad.
    </p>

    <!-- Formulario de creación -->
    <div class="card">
      <h2>Nueva carrera</h2>

      <form @submit.prevent="onCrearCarrera" class="form-grid">
        <div class="form-group">
          <label for="facultad">Facultad</label>
          <select
            id="facultad"
            v-model="nuevaCarrera.facultadId"
            required
          >
            <option value="" disabled>Selecciona una facultad</option>
            <option
              v-for="f in facultades"
              :key="f._id"
              :value="f._id"
            >
              {{ f.nombre }} ({{ f.codigo }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="nombre">Nombre de la carrera</label>
          <input
            id="nombre"
            v-model="nuevaCarrera.nombre"
            type="text"
            required
            placeholder="Ej: Ingeniería de Software"
          />
        </div>

        <div class="form-group">
          <label for="codigo">Código</label>
          <input
            id="codigo"
            v-model="nuevaCarrera.codigo"
            type="text"
            required
            placeholder="Ej: ISWZ"
          />
        </div>

        <div class="form-group form-group-full">
          <label for="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            v-model="nuevaCarrera.descripcion"
            rows="2"
            placeholder="Opcional: breve descripción de la carrera"
          />
        </div>

        <p v-if="errorCrear" class="error">{{ errorCrear }}</p>
        <p v-if="successCrear" class="success">{{ successCrear }}</p>

        <div class="actions form-group-full">
          <button class="btn" type="submit" :disabled="cargandoCrear">
            <span v-if="!cargandoCrear">Crear carrera</span>
            <span v-else>Creando...</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Listado de carreras -->
    <div class="card">
      <div class="header-row">
        <h2>Listado de carreras</h2>
        <button
          class="btn-secondary"
          @click="cargarCarreras"
          :disabled="cargandoLista"
        >
          {{ cargandoLista ? 'Actualizando...' : 'Actualizar lista' }}
        </button>
      </div>

      <p v-if="errorLista" class="error">{{ errorLista }}</p>

      <table v-if="carreras.length" class="tabla">
        <thead>
          <tr>
            <th>Carrera</th>
            <th>Código</th>
            <th>Facultad</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th style="width: 210px;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in carreras" :key="c._id">
            <!-- Nombre -->
            <td>
              <template v-if="carreraEnEdicionId === c._id">
                <input v-model="carreraEditando.nombre" type="text" />
              </template>
              <template v-else>
                {{ c.nombre }}
              </template>
            </td>

            <!-- Código -->
            <td>
              <template v-if="carreraEnEdicionId === c._id">
                <input v-model="carreraEditando.codigo" type="text" />
              </template>
              <template v-else>
                {{ c.codigo }}
              </template>
            </td>

            <!-- Facultad -->
            <td>
              <template v-if="carreraEnEdicionId === c._id">
                <select v-model="carreraEditando.facultadId">
                  <option
                    v-for="f in facultades"
                    :key="f._id"
                    :value="f._id"
                  >
                    {{ f.nombre }} ({{ f.codigo }})
                  </option>
                </select>
              </template>
              <template v-else>
                <!-- c.facultad puede venir como id o como objeto -->
                <span>
                  {{
                    obtenerNombreFacultad(
                      typeof c.facultad === 'string'
                        ? c.facultad
                        : c.facultad._id
                    )
                  }}
                </span>
              </template>
            </td>

            <!-- Descripción -->
            <td>
              <template v-if="carreraEnEdicionId === c._id">
                <textarea
                  v-model="carreraEditando.descripcion"
                  rows="1"
                ></textarea>
              </template>
              <template v-else>
                <span v-if="c.descripcion && c.descripcion.length">
                  {{ c.descripcion }}
                </span>
                <span v-else class="texto-muted">—</span>
              </template>
            </td>

            <!-- Estado -->
            <td>
              <span
                :class="[
                  'estado-tag',
                  c.estado === 'ACTIVA' ? 'activo' : 'inactivo'
                ]"
              >
                {{ c.estado }}
              </span>
            </td>

            <!-- Acciones -->
            <td class="acciones">
              <template v-if="carreraEnEdicionId === c._id">
                <button
                  class="btn-mini guardar"
                  @click="onGuardarEdicion(c._id)"
                  :disabled="cargandoEdicion"
                >
                  Guardar
                </button>
                <button
                  class="btn-mini cancelar"
                  @click="cancelarEdicion"
                  :disabled="cargandoEdicion"
                >
                  Cancelar
                </button>
              </template>
              <template v-else>
                <button
                  class="btn-mini editar"
                  @click="activarEdicion(c)"
                >
                  Editar
                </button>
                <button
                  class="btn-mini estado"
                  @click="toggleEstado(c)"
                >
                  {{ c.estado === 'ACTIVA' ? 'Inactivar' : 'Activar' }}
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="texto-muted">
        No hay carreras registradas todavía.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import {
  listarFacultades,
  type Facultad,
} from '../services/facultades.service';
import {
  listarCarreras,
  crearCarrera,
  actualizarCarrera,
  cambiarEstadoCarrera,
  type Carrera,
} from '../services/carreras.service';

const facultades = ref<Facultad[]>([]);
const carreras = ref<Carrera[]>([]);

// Estados y mensajes
const cargandoLista = ref(false);
const errorLista = ref<string | null>(null);

const cargandoCrear = ref(false);
const errorCrear = ref<string | null>(null);
const successCrear = ref<string | null>(null);

const cargandoEdicion = ref(false);

// Form nueva carrera
const nuevaCarrera = reactive({
  facultadId: '',
  nombre: '',
  codigo: '',
  descripcion: '',
});

// Edición
const carreraEnEdicionId = ref<string | null>(null);
const carreraEditando = reactive({
  facultadId: '',
  nombre: '',
  codigo: '',
  descripcion: '',
});

// Helpers
const obtenerNombreFacultad = (facultadId: string): string => {
  const fac = facultades.value.find((f) => f._id === facultadId);
  return fac ? `${fac.nombre} (${fac.codigo})` : '—';
};

const cargarFacultades = async () => {
  try {
    const data = await listarFacultades();
    facultades.value = data;
  } catch (err: any) {
    console.error(err);
    // no rompemos la UI, solo log
  }
};

const cargarCarreras = async () => {
  cargandoLista.value = true;
  errorLista.value = null;

  try {
    const data = await listarCarreras();
    carreras.value = data;
  } catch (err: any) {
    console.error(err);
    errorLista.value =
      err?.response?.data?.message || 'Error al cargar las carreras.';
  } finally {
    cargandoLista.value = false;
  }
};

// Crear carrera
const onCrearCarrera = async () => {
  errorCrear.value = null;
  successCrear.value = null;

  if (!nuevaCarrera.facultadId || !nuevaCarrera.nombre || !nuevaCarrera.codigo) {
    errorCrear.value = 'Facultad, nombre y código son obligatorios.';
    return;
  }

  cargandoCrear.value = true;

  try {
    const creada = await crearCarrera({
      nombre: nuevaCarrera.nombre.trim(),
      codigo: nuevaCarrera.codigo.trim(),
      facultad: nuevaCarrera.facultadId,
      descripcion: nuevaCarrera.descripcion.trim() || undefined,
    });

    carreras.value.push(creada);
    successCrear.value = 'Carrera creada correctamente.';

    nuevaCarrera.facultadId = '';
    nuevaCarrera.nombre = '';
    nuevaCarrera.codigo = '';
    nuevaCarrera.descripcion = '';
  } catch (err: any) {
    console.error(err);
    errorCrear.value =
      err?.response?.data?.message || 'Error al crear la carrera.';
  } finally {
    cargandoCrear.value = false;
  }
};

// Edición
const activarEdicion = (c: Carrera) => {
  carreraEnEdicionId.value = c._id;
  carreraEditando.nombre = c.nombre;
  carreraEditando.codigo = c.codigo;
  carreraEditando.descripcion = c.descripcion || '';
  carreraEditando.facultadId =
    typeof c.facultad === 'string' ? c.facultad : c.facultad._id;
};

const cancelarEdicion = () => {
  carreraEnEdicionId.value = null;
  carreraEditando.nombre = '';
  carreraEditando.codigo = '';
  carreraEditando.descripcion = '';
  carreraEditando.facultadId = '';
};

const onGuardarEdicion = async (id: string) => {
  if (!carreraEditando.nombre || !carreraEditando.codigo || !carreraEditando.facultadId) {
    alert('Facultad, nombre y código son obligatorios.');
    return;
  }

  cargandoEdicion.value = true;

  try {
    const actualizada = await actualizarCarrera(id, {
      nombre: carreraEditando.nombre.trim(),
      codigo: carreraEditando.codigo.trim(),
      facultad: carreraEditando.facultadId,
      descripcion: carreraEditando.descripcion.trim() || undefined,
    });

    const index = carreras.value.findIndex((c) => c._id === id);
    if (index !== -1) {
      carreras.value[index] = actualizada;
    }

    cancelarEdicion();
  } catch (err: any) {
    console.error(err);
    alert(
      err?.response?.data?.message || 'Error al actualizar la carrera.'
    );
  } finally {
    cargandoEdicion.value = false;
  }
};

// Cambiar estado
const toggleEstado = async (c: Carrera) => {
  const nuevoEstado = c.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';

  try {
    const actualizada = await cambiarEstadoCarrera(c._id, nuevoEstado);
    const index = carreras.value.findIndex((x) => x._id === c._id);
    if (index !== -1) {
      carreras.value[index] = actualizada;
    }
  } catch (err: any) {
    console.error(err);
    alert(
      err?.response?.data?.message || 'Error al cambiar el estado de la carrera.'
    );
  }
};

onMounted(() => {
  cargarFacultades();
  cargarCarreras();
});
</script>

<style scoped>
.admin-carreras {
  max-width: 1000px;
  margin: 0 auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
}

h1 {
  font-size: 1.6rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1rem 1.2rem 1.4rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group-full {
  grid-column: 1 / -1;
}

label {
  font-size: 0.85rem;
  font-weight: 500;
}

input,
textarea,
select {
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.4);
}

textarea {
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  border: none;
  background: #3b82f6;
  color: #ffffff;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.7;
  cursor: default;
}

.btn-secondary {
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  border: 1px solid #9ca3af;
  background: #f9fafb;
  color: #374151;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-secondary:disabled {
  opacity: 0.7;
  cursor: default;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.tabla th,
.tabla td {
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: top;
}

.tabla th {
  text-align: left;
  font-weight: 600;
  color: #4b5563;
}

.texto-muted {
  color: #9ca3af;
  font-size: 0.8rem;
}

.estado-tag {
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
}

.estado-tag.activo {
  background: #dcfce7;
  color: #15803d;
}

.estado-tag.inactivo {
  background: #fee2e2;
  color: #b91c1c;
}

.acciones {
  display: flex;
  gap: 0.3rem;
}

.btn-mini {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  border: none;
  font-size: 0.75rem;
  cursor: pointer;
}

.btn-mini.editar {
  background: #e0f2fe;
  color: #1d4ed8;
}

.btn-mini.estado {
  background: #fef3c7;
  color: #92400e;
}

.btn-mini.guardar {
  background: #bbf7d0;
  color: #166534;
}

.btn-mini.cancelar {
  background: #e5e7eb;
  color: #374151;
}

.error {
  grid-column: 1 / -1;
  font-size: 0.85rem;
  color: #b91c1c;
  background: #fee2e2;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
}

.success {
  grid-column: 1 / -1;
  font-size: 0.85rem;
  color: #16a34a;
  background: #dcfce7;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
}
</style>
