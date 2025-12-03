<template>
  <section class="admin-materias">
    <h1>Gestión de materias</h1>
    <p class="subtitle">
      Crea y administra las materias asociadas a carreras y facultades.
    </p>

    <!-- Formulario de creación -->
    <div class="card">
      <h2>Nueva materia</h2>

      <form @submit.prevent="onCrearMateria" class="form-grid">
        <div class="form-group">
          <label for="facultad">Facultad</label>
          <select
            id="facultad"
            v-model="nuevaMateria.facultadId"
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
          <label for="carrera">Carrera</label>
          <select
            id="carrera"
            v-model="nuevaMateria.carreraId"
            :disabled="!nuevaMateria.facultadId || carrerasFiltradas.length === 0"
            required
          >
            <option value="" disabled>
              {{
                !nuevaMateria.facultadId
                  ? 'Primero selecciona una facultad'
                  : 'Selecciona una carrera'
              }}
            </option>
            <option
              v-for="c in carrerasFiltradas"
              :key="c._id"
              :value="c._id"
            >
              {{ c.nombre }} ({{ c.codigo }})
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="nombre">Nombre de la materia</label>
          <input
            id="nombre"
            v-model="nuevaMateria.nombre"
            type="text"
            required
            placeholder="Ej: Ingeniería Web"
          />
        </div>

        <div class="form-group">
          <label for="codigo">Código</label>
          <input
            id="codigo"
            v-model="nuevaMateria.codigo"
            type="text"
            required
            placeholder="Ej: ISWZ3101"
          />
        </div>

        <div class="form-group">
          <label for="creditos">Créditos</label>
          <input
            id="creditos"
            v-model.number="nuevaMateria.creditos"
            type="number"
            min="0"
            placeholder="Ej: 4"
          />
        </div>

        <div class="form-group">
          <label for="semestre">Semestre</label>
          <input
            id="semestre"
            v-model.number="nuevaMateria.semestre"
            type="number"
            min="1"
            placeholder="Ej: 6"
          />
        </div>

        <div class="form-group form-group-full">
          <label for="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            v-model="nuevaMateria.descripcion"
            rows="2"
            placeholder="Opcional: breve descripción de la materia"
          />
        </div>

        <p v-if="errorCrear" class="error">{{ errorCrear }}</p>
        <p v-if="successCrear" class="success">{{ successCrear }}</p>

        <div class="actions form-group-full">
          <button class="btn" type="submit" :disabled="cargandoCrear">
            <span v-if="!cargandoCrear">Crear materia</span>
            <span v-else>Creando...</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Listado de materias -->
    <div class="card">
      <div class="header-row">
        <h2>Listado de materias</h2>
        <button
          class="btn-secondary"
          @click="cargarMaterias"
          :disabled="cargandoLista"
        >
          {{ cargandoLista ? 'Actualizando...' : 'Actualizar lista' }}
        </button>
      </div>

      <p v-if="errorLista" class="error">{{ errorLista }}</p>

      <table v-if="materias.length" class="tabla">
        <thead>
          <tr>
            <th>Materia</th>
            <th>Código</th>
            <th>Facultad</th>
            <th>Carrera</th>
            <th>Créd.</th>
            <th>Sem.</th>
            <th>Estado</th>
            <th style="width: 230px;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in materias" :key="m._id">
            <!-- Nombre -->
            <td>
              <template v-if="materiaEnEdicionId === m._id">
                <input v-model="materiaEditando.nombre" type="text" />
              </template>
              <template v-else>
                {{ m.nombre }}
              </template>
            </td>

            <!-- Código -->
            <td>
              <template v-if="materiaEnEdicionId === m._id">
                <input v-model="materiaEditando.codigo" type="text" />
              </template>
              <template v-else>
                {{ m.codigo }}
              </template>
            </td>

            <!-- Facultad -->
            <td>
              <template v-if="materiaEnEdicionId === m._id">
                <select v-model="materiaEditando.facultadId">
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
                {{
                  obtenerNombreFacultad(
                    typeof m.facultad === 'string'
                      ? m.facultad
                      : m.facultad._id
                  )
                }}
              </template>
            </td>

            <!-- Carrera -->
            <td>
              <template v-if="materiaEnEdicionId === m._id">
                <select v-model="materiaEditando.carreraId">
                  <option
                    v-for="c in carreras"
                    :key="c._id"
                    :value="c._id"
                  >
                    {{ c.nombre }} ({{ c.codigo }})
                  </option>
                </select>
              </template>
              <template v-else>
                {{
                  obtenerNombreCarrera(
                    typeof m.carrera === 'string'
                      ? m.carrera
                      : m.carrera._id
                  )
                }}
              </template>
            </td>

            <!-- Créditos -->
            <td>
              <template v-if="materiaEnEdicionId === m._id">
                <input
                  v-model.number="materiaEditando.creditos"
                  type="number"
                  min="0"
                  style="width: 60px;"
                />
              </template>
              <template v-else>
                <span v-if="m.creditos != null">{{ m.creditos }}</span>
                <span v-else class="texto-muted">—</span>
              </template>
            </td>

            <!-- Semestre -->
            <td>
              <template v-if="materiaEnEdicionId === m._id">
                <input
                  v-model.number="materiaEditando.semestre"
                  type="number"
                  min="1"
                  style="width: 60px;"
                />
              </template>
              <template v-else>
                <span v-if="m.semestre != null">{{ m.semestre }}</span>
                <span v-else class="texto-muted">—</span>
              </template>
            </td>

            <!-- Estado -->
            <td>
              <span
                :class="[
                  'estado-tag',
                  m.estado === 'ACTIVA' ? 'activo' : 'inactivo'
                ]"
              >
                {{ m.estado }}
              </span>
            </td>

            <!-- Acciones -->
            <td class="acciones">
              <template v-if="materiaEnEdicionId === m._id">
                <button
                  class="btn-mini guardar"
                  @click="onGuardarEdicion(m._id)"
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
                  @click="activarEdicion(m)"
                >
                  Editar
                </button>
                <button
                  class="btn-mini estado"
                  @click="toggleEstado(m)"
                >
                  {{ m.estado === 'ACTIVA' ? 'Inactivar' : 'Activar' }}
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="texto-muted">
        No hay materias registradas todavía.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  listarFacultades,
  type Facultad,
} from '../services/facultades.service';
import {
  listarCarreras,
  type Carrera,
} from '../services/carreras.service';
import {
  listarMaterias,
  crearMateria,
  actualizarMateria,
  cambiarEstadoMateria,
  type Materia,
} from '../services/materias.service';

const facultades = ref<Facultad[]>([]);
const carreras = ref<Carrera[]>([]);
const materias = ref<Materia[]>([]);

// Estados listing / creación / edición
const cargandoLista = ref(false);
const errorLista = ref<string | null>(null);

const cargandoCrear = ref(false);
const errorCrear = ref<string | null>(null);
const successCrear = ref<string | null>(null);

const cargandoEdicion = ref(false);

// Form nueva materia
const nuevaMateria = reactive({
  facultadId: '',
  carreraId: '',
  nombre: '',
  codigo: '',
  descripcion: '',
  creditos: null as number | null,
  semestre: null as number | null,
});

// Edición
const materiaEnEdicionId = ref<string | null>(null);
const materiaEditando = reactive({
  facultadId: '',
  carreraId: '',
  nombre: '',
  codigo: '',
  descripcion: '',
  creditos: null as number | null,
  semestre: null as number | null,
});

// carreras filtradas por facultad seleccionada en el form de creación
const carrerasFiltradas = computed(() =>
  carreras.value.filter(
    (c) => c.facultad === nuevaMateria.facultadId ||
      (typeof c.facultad !== 'string' && c.facultad._id === nuevaMateria.facultadId)
  )
);

// Helpers para mostrar nombres
const obtenerNombreFacultad = (id: string): string => {
  const f = facultades.value.find((x) => x._id === id);
  return f ? `${f.nombre} (${f.codigo})` : '—';
};

const obtenerNombreCarrera = (id: string): string => {
  const c = carreras.value.find((x) => x._id === id);
  return c ? `${c.nombre} (${c.codigo})` : '—';
};

const cargarFacultades = async () => {
  try {
    const data = await listarFacultades();
    facultades.value = data;
  } catch (err: any) {
    console.error(err);
  }
};

const cargarCarreras = async () => {
  try {
    const data = await listarCarreras();
    carreras.value = data;
  } catch (err: any) {
    console.error(err);
  }
};

const cargarMaterias = async () => {
  cargandoLista.value = true;
  errorLista.value = null;

  try {
    const data = await listarMaterias();
    materias.value = data;
  } catch (err: any) {
    console.error(err);
    errorLista.value =
      err?.response?.data?.message || 'Error al cargar las materias.';
  } finally {
    cargandoLista.value = false;
  }
};

// Crear materia
const onCrearMateria = async () => {
  errorCrear.value = null;
  successCrear.value = null;

  if (!nuevaMateria.facultadId || !nuevaMateria.carreraId || !nuevaMateria.nombre || !nuevaMateria.codigo) {
    errorCrear.value = 'Facultad, carrera, nombre y código son obligatorios.';
    return;
  }

  cargandoCrear.value = true;

  try {
    const creada = await crearMateria({
      nombre: nuevaMateria.nombre.trim(),
      codigo: nuevaMateria.codigo.trim(),
      facultad: nuevaMateria.facultadId,
      carrera: nuevaMateria.carreraId,
      descripcion: nuevaMateria.descripcion.trim() || undefined,
      creditos: nuevaMateria.creditos ?? undefined,
      semestre: nuevaMateria.semestre ?? undefined,
    });

    materias.value.push(creada);
    successCrear.value = 'Materia creada correctamente.';

    nuevaMateria.facultadId = '';
    nuevaMateria.carreraId = '';
    nuevaMateria.nombre = '';
    nuevaMateria.codigo = '';
    nuevaMateria.descripcion = '';
    nuevaMateria.creditos = null;
    nuevaMateria.semestre = null;
  } catch (err: any) {
    console.error(err);
    errorCrear.value =
      err?.response?.data?.message || 'Error al crear la materia.';
  } finally {
    cargandoCrear.value = false;
  }
};

// Edición
const activarEdicion = (m: Materia) => {
  materiaEnEdicionId.value = m._id;
  materiaEditando.nombre = m.nombre;
  materiaEditando.codigo = m.codigo;
  materiaEditando.descripcion = m.descripcion || '';
  materiaEditando.creditos = m.creditos ?? null;
  materiaEditando.semestre = m.semestre ?? null;
  materiaEditando.facultadId =
    typeof m.facultad === 'string' ? m.facultad : m.facultad._id;
  materiaEditando.carreraId =
    typeof m.carrera === 'string' ? m.carrera : m.carrera._id;
};

const cancelarEdicion = () => {
  materiaEnEdicionId.value = null;
  materiaEditando.nombre = '';
  materiaEditando.codigo = '';
  materiaEditando.descripcion = '';
  materiaEditando.creditos = null;
  materiaEditando.semestre = null;
  materiaEditando.facultadId = '';
  materiaEditando.carreraId = '';
};

const onGuardarEdicion = async (id: string) => {
  if (
    !materiaEditando.facultadId ||
    !materiaEditando.carreraId ||
    !materiaEditando.nombre ||
    !materiaEditando.codigo
  ) {
    alert('Facultad, carrera, nombre y código son obligatorios.');
    return;
  }

  cargandoEdicion.value = true;

  try {
    const actualizada = await actualizarMateria(id, {
      nombre: materiaEditando.nombre.trim(),
      codigo: materiaEditando.codigo.trim(),
      facultad: materiaEditando.facultadId,
      carrera: materiaEditando.carreraId,
      descripcion: materiaEditando.descripcion.trim() || undefined,
      creditos: materiaEditando.creditos ?? undefined,
      semestre: materiaEditando.semestre ?? undefined,
    });

    const index = materias.value.findIndex((x) => x._id === id);
    if (index !== -1) {
      materias.value[index] = actualizada;
    }

    cancelarEdicion();
  } catch (err: any) {
    console.error(err);
    alert(
      err?.response?.data?.message || 'Error al actualizar la materia.'
    );
  } finally {
    cargandoEdicion.value = false;
  }
};

// Cambiar estado ACTIVA / INACTIVA
const toggleEstado = async (m: Materia) => {
  const nuevoEstado = m.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';

  try {
    const actualizada = await cambiarEstadoMateria(m._id, nuevoEstado);
    const index = materias.value.findIndex((x) => x._id === m._id);
    if (index !== -1) {
      materias.value[index] = actualizada;
    }
  } catch (err: any) {
    console.error(err);
    alert(
      err?.response?.data?.message ||
        'Error al cambiar el estado de la materia.'
    );
  }
};

onMounted(() => {
  cargarFacultades();
  cargarCarreras();
  cargarMaterias();
});
</script>

<style scoped>
.admin-materias {
  max-width: 1100px;
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
