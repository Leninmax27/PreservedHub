<template>
  <section class="admin-facultades">
    <h1>Gestión de facultades</h1>
    <p class="subtitle">
      Crea y administra las facultades disponibles en el sistema.
    </p>

    <!-- Formulario de creación -->
    <div class="card">
      <h2>Nueva facultad</h2>

      <form @submit.prevent="onCrearFacultad" class="form-grid">
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input
            id="nombre"
            v-model="nuevaFacultad.nombre"
            type="text"
            required
            placeholder="Ej: Facultad de Ingeniería"
          />
        </div>

        <div class="form-group">
          <label for="codigo">Código</label>
          <input
            id="codigo"
            v-model="nuevaFacultad.codigo"
            type="text"
            required
            placeholder="Ej: FING"
          />
        </div>

        <div class="form-group form-group-full">
          <label for="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            v-model="nuevaFacultad.descripcion"
            rows="2"
            placeholder="Opcional: breve descripción de la facultad"
          />
        </div>

        <p v-if="errorCrear" class="error">{{ errorCrear }}</p>
        <p v-if="successCrear" class="success">{{ successCrear }}</p>

        <div class="actions form-group-full">
          <button class="btn" type="submit" :disabled="cargandoCrear">
            <span v-if="!cargandoCrear">Crear facultad</span>
            <span v-else>Creando...</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Listado de facultades -->
    <div class="card">
      <div class="header-row">
        <h2>Listado de facultades</h2>
        <button class="btn-secondary" @click="cargarFacultades" :disabled="cargandoLista">
          {{ cargandoLista ? 'Actualizando...' : 'Actualizar lista' }}
        </button>
      </div>

      <p v-if="errorLista" class="error">{{ errorLista }}</p>

      <table v-if="facultadesFiltradas.length" class="tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th style="width: 180px;">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="fac in facultadesFiltradas"
            :key="fac._id"
          >
            <!-- Nombre -->
            <td>
              <template v-if="facultadEnEdicionId === fac._id">
                <input
                  v-model="facultadEditando.nombre"
                  type="text"
                />
              </template>
              <template v-else>
                {{ fac.nombre }}
              </template>
            </td>

            <!-- Código -->
            <td>
              <template v-if="facultadEnEdicionId === fac._id">
                <input
                  v-model="facultadEditando.codigo"
                  type="text"
                />
              </template>
              <template v-else>
                {{ fac.codigo }}
              </template>
            </td>

            <!-- Descripción -->
            <td>
              <template v-if="facultadEnEdicionId === fac._id">
                <textarea
                  v-model="facultadEditando.descripcion"
                  rows="1"
                ></textarea>
              </template>
              <template v-else>
                <span v-if="fac.descripcion && fac.descripcion.length">
                  {{ fac.descripcion }}
                </span>
                <span v-else class="texto-muted">—</span>
              </template>
            </td>

            <!-- Estado -->
            <td>
              <span
                :class="[
                  'estado-tag',
                  fac.estado === 'ACTIVA' ? 'activo' : 'inactivo'
                ]"
              >
                {{ fac.estado }}
              </span>
            </td>

            <!-- Acciones -->
            <td class="acciones">
              <template v-if="facultadEnEdicionId === fac._id">
                <button
                  class="btn-mini guardar"
                  @click="onGuardarEdicion(fac._id)"
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
                  @click="activarEdicion(fac)"
                >
                  Editar
                </button>
                <button
                  class="btn-mini estado"
                  @click="toggleEstado(fac)"
                >
                  {{ fac.estado === 'ACTIVA' ? 'Inactivar' : 'Activar' }}
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="texto-muted">
        No hay facultades registradas todavía.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  listarFacultades,
  crearFacultad,
  actualizarFacultad,
  cambiarEstadoFacultad,
  type Facultad,
} from '../services/facultades.service';

const facultades = ref<Facultad[]>([]);

// Estados y mensajes
const cargandoLista = ref(false);
const errorLista = ref<string | null>(null);

const cargandoCrear = ref(false);
const errorCrear = ref<string | null>(null);
const successCrear = ref<string | null>(null);

const cargandoEdicion = ref(false);

// Formulario de nueva facultad
const nuevaFacultad = reactive({
  nombre: '',
  codigo: '',
  descripcion: '',
});

// Edición
const facultadEnEdicionId = ref<string | null>(null);
const facultadEditando = reactive({
  nombre: '',
  codigo: '',
  descripcion: '',
});

// Computed por si mañana quieres filtrar (ej. por estado)
const facultadesFiltradas = computed(() => facultades.value);

// Cargar listado
const cargarFacultades = async () => {
  cargandoLista.value = true;
  errorLista.value = null;

  try {
    const data = await listarFacultades();
    facultades.value = data;
  } catch (err: any) {
    console.error(err);
    errorLista.value =
      err?.response?.data?.message || 'Error al cargar las facultades.';
  } finally {
    cargandoLista.value = false;
  }
};

// Crear nueva facultad
const onCrearFacultad = async () => {
  errorCrear.value = null;
  successCrear.value = null;

  if (!nuevaFacultad.nombre || !nuevaFacultad.codigo) {
    errorCrear.value = 'Nombre y código son obligatorios.';
    return;
  }

  cargandoCrear.value = true;

  try {
    const creada = await crearFacultad({
      nombre: nuevaFacultad.nombre.trim(),
      codigo: nuevaFacultad.codigo.trim(),
      descripcion: nuevaFacultad.descripcion.trim() || undefined,
    });

    facultades.value.push(creada);
    successCrear.value = 'Facultad creada correctamente.';

    // Limpiar form
    nuevaFacultad.nombre = '';
    nuevaFacultad.codigo = '';
    nuevaFacultad.descripcion = '';
  } catch (err: any) {
    console.error(err);
    errorCrear.value =
      err?.response?.data?.message || 'Error al crear la facultad.';
  } finally {
    cargandoCrear.value = false;
  }
};

// Activar modo edición
const activarEdicion = (fac: Facultad) => {
  facultadEnEdicionId.value = fac._id;
  facultadEditando.nombre = fac.nombre;
  facultadEditando.codigo = fac.codigo;
  facultadEditando.descripcion = fac.descripcion || '';
};

// Cancelar edición
const cancelarEdicion = () => {
  facultadEnEdicionId.value = null;
  facultadEditando.nombre = '';
  facultadEditando.codigo = '';
  facultadEditando.descripcion = '';
};

// Guardar cambios de edición
const onGuardarEdicion = async (id: string) => {
  if (!facultadEditando.nombre || !facultadEditando.codigo) {
    alert('Nombre y código son obligatorios.');
    return;
  }

  cargandoEdicion.value = true;

  try {
    const actualizada = await actualizarFacultad(id, {
      nombre: facultadEditando.nombre.trim(),
      codigo: facultadEditando.codigo.trim(),
      descripcion: facultadEditando.descripcion.trim() || undefined,
    });

    // Actualizar en la lista local
    const index = facultades.value.findIndex((f) => f._id === id);
    if (index !== -1) {
      facultades.value[index] = actualizada;
    }

    cancelarEdicion();
  } catch (err: any) {
    console.error(err);
    alert(
      err?.response?.data?.message || 'Error al actualizar la facultad.'
    );
  } finally {
    cargandoEdicion.value = false;
  }
};

// Cambiar estado ACTIVA/INACTIVA
const toggleEstado = async (fac: Facultad) => {
  const nuevoEstado = fac.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';

  try {
    const actualizada = await cambiarEstadoFacultad(fac._id, nuevoEstado);
    const index = facultades.value.findIndex((f) => f._id === fac._id);
    if (index !== -1) {
      facultades.value[index] = actualizada;
    }
  } catch (err: any) {
    console.error(err);
    alert(
      err?.response?.data?.message || 'Error al cambiar el estado de la facultad.'
    );
  }
};

onMounted(() => {
  cargarFacultades();
});
</script>

<style scoped>
.admin-facultades {
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
