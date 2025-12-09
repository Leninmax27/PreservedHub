<template>
  <section class="nueva-reserva">
    <h1>Nueva reserva</h1>
    <p class="subtitle">
      Selecciona facultad, carrera, materia y espacio para crear una reserva.
    </p>

    <div class="card">
      <form @submit.prevent="onSubmit" class="form-grid">
        <!-- FACULTAD -->
        <div class="form-group">
          <label for="facultad">Facultad</label>
          <select
            id="facultad"
            v-model="seleccion.facultadId"
            @change="onFacultadChange"
            required
          >
            <option value="" disabled>Selecciona una facultad</option>
            <option v-for="f in facultades" :key="f._id" :value="f._id">
              {{ f.nombre }} ({{ f.codigo }})
            </option>
          </select>
        </div>

        <!-- CARRERA -->
        <div class="form-group">
          <label for="carrera">Carrera</label>
          <select
            id="carrera"
            v-model="seleccion.carreraId"
            @change="onCarreraChange"
            :disabled="!seleccion.facultadId || carreras.length === 0"
            required
          >
            <option value="" disabled>
              {{ !seleccion.facultadId ? 'Primero selecciona una facultad' : 'Selecciona una carrera' }}
            </option>
            <option v-for="c in carreras" :key="c._id" :value="c._id">
              {{ c.nombre }} ({{ c.codigo }})
            </option>
          </select>
        </div>

        <!-- MATERIA -->
        <div class="form-group">
          <label for="materia">Materia</label>
          <select
            id="materia"
            v-model="seleccion.materiaId"
            :disabled="!seleccion.carreraId || materias.length === 0"
          >
            <option value="">
              {{ !seleccion.carreraId ? 'Primero selecciona una carrera' : 'Opcional: selecciona una materia' }}
            </option>
            <option v-for="m in materias" :key="m._id" :value="m._id">
              {{ m.nombre }} ({{ m.codigo }})
            </option>
          </select>
          <small class="hint">Puedes dejarla vacía si la reserva no es para una materia específica.</small>
        </div>

<!-- ESPACIO -->
<div class="form-group">
  <label for="espacio">Espacio</label>
  <select
  id="espacio"
  v-model="seleccion.espacioId"
  :disabled="!seleccion.facultadId || espacios.length === 0"
  required
>
    <option value="" disabled>
      {{ !seleccion.facultadId ? 'Primero selecciona una facultad' : 'Selecciona un espacio disponible' }}
    </option>
    <option v-for="e in espacios" :key="e._id" :value="e._id">
      {{ e.nombre }}
      <span v-if="e.codigo">({{ e.codigo }})</span>
      - {{ e.tipo }} - cap: {{ e.capacidad }}
    </option>
  </select>
</div>

<!-- RECURSOS -->
<div class="form-group form-group-full">
  <label>Recursos disponibles en esta facultad</label>

  <p class="hint" v-if="!seleccion.facultadId">
  Primero selecciona una facultad para ver sus recursos.
</p>

<p class="hint" v-else-if="recursos.length === 0">
  No hay recursos registrados o disponibles en esta facultad.
</p>

<div v-else class="recursos-list">
  <label
    v-for="r in recursos"
    :key="r._id"
    class="recurso-item"
  >
    <input
      type="checkbox"
      :value="r._id"
      v-model="recursosSeleccionados"
    />
    <span>
      {{ r.nombre }}
      <span class="recurso-detalle">
        ({{ r.tipo }}
        <span v-if="r.codigoInventario"> · {{ r.codigoInventario }}</span>)
      </span>
    </span>
  </label>
</div>
</div>


        <!-- FECHA INICIO -->
        <div class="form-group">
          <label for="fechaInicio">Fecha y hora de inicio</label>
          <input
            id="fechaInicio"
            v-model="form.fechaInicio"
            type="datetime-local"
            required
          />
        </div>

        <!-- FECHA FIN -->
        <div class="form-group">
          <label for="fechaFin">Fecha y hora de fin</label>
          <input
            id="fechaFin"
            v-model="form.fechaFin"
            type="datetime-local"
            required
          />
        </div>

        <!-- MOTIVO -->
        <div class="form-group form-group-full">
          <label for="motivo">Motivo de la reserva</label>
          <textarea
            id="motivo"
            v-model="form.motivo"
            rows="2"
            placeholder="Ej: Clase de refuerzo, práctica de laboratorio, presentación, etc."
          />
        </div>

        <!-- MENSAJES -->
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>

        <!-- BOTÓN -->
        <div class="actions form-group-full">
          <button type="submit" class="btn" :disabled="loading">
            <span v-if="!loading">Crear reserva</span>
            <span v-else>Creando reserva...</span>
          </button>
        </div>
      </form>
    </div>

    
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import {
  obtenerFacultades,
  obtenerCarrerasPorFacultad,
  obtenerMateriasPorCarrera,
  obtenerEspaciosPorFacultad,
  type Facultad,
  type Carrera,
  type Materia,
  type Espacio,
} from '../services/catalogo.service';

import { crearReserva } from '../services/reservas.service';
import { getRecursos, type Recurso } from '../services/recursos.service';
const facultades = ref<Facultad[]>([]);
const carreras = ref<Carrera[]>([]);
const materias = ref<Materia[]>([]);
const espacios = ref<Espacio[]>([]);
const recursos = ref<Recurso[]>([] as Recurso[]);
const recursosSeleccionados = ref<string[]>([]);

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref<string | null>(null);



const seleccion = reactive({
  facultadId: '',
  carreraId: '',
  materiaId: '',
  espacioId: '',
});

const form = reactive({
  fechaInicio: '',
  fechaFin: '',
  motivo: '',
});

const limpiarMensajes = () => {
  error.value = null;
  success.value = null;
};

const cargarFacultades = async () => {
  try {
    const data = await obtenerFacultades();
    facultades.value = data;
  } catch (err: any) {
    console.error(err);
    error.value =
      err?.response?.data?.message || 'Error al cargar las facultades.';
  }
};

const cargarRecursosFacultad = async () => {
  recursos.value = [];
  recursosSeleccionados.value = [];

  if (!seleccion.facultadId) return;

  try {
    const data = await getRecursos({
      estado: 'DISPONIBLE',
    });

    recursos.value = data.filter((r: Recurso) => {
      const fac: any = r.facultad;  
  if (!fac) return false;

  if (typeof fac === 'string') {
    return fac === seleccion.facultadId;
  }

  return fac._id === seleccion.facultadId;
  });
  } catch (err: any) {
    console.error(err);
    error.value =
      err?.response?.data?.message ||
      'Error al cargar los recursos de la facultad.';
  }
};




const onFacultadChange = async () => {
  limpiarMensajes();
  seleccion.carreraId = '';
  seleccion.materiaId = '';
  seleccion.espacioId = '';
  carreras.value = [];
  materias.value = [];
  espacios.value = [];

  recursos.value = [];
  recursosSeleccionados.value = [];

  if (!seleccion.facultadId) return;

  try {
    const [carrerasData, espaciosData] = await Promise.all([
      obtenerCarrerasPorFacultad(seleccion.facultadId),
      obtenerEspaciosPorFacultad(seleccion.facultadId),
    ]);

    carreras.value = carrerasData;
    espacios.value = espaciosData;

    
    await cargarRecursosFacultad();
  } catch (err: any) {
    console.error(err);
    error.value =
      err?.response?.data?.message ||
      'Error al cargar carreras, espacios o recursos de la facultad.';
  }
};

const onCarreraChange = async () => {
  limpiarMensajes();
  seleccion.materiaId = '';
  materias.value = [];

  if (!seleccion.carreraId) return;

  try {
    const materiasData = await obtenerMateriasPorCarrera(seleccion.carreraId);
    materias.value = materiasData;
  } catch (err: any) {
    console.error(err);
    error.value =
      err?.response?.data?.message ||
      'Error al cargar las materias de la carrera.';
  }
};



const onSubmit = async () => {
  limpiarMensajes();

  if (!seleccion.facultadId || !seleccion.carreraId || !seleccion.espacioId) {
    error.value =
      'Debes seleccionar facultad, carrera y espacio para crear una reserva.';
    return;
  }

  if (!form.fechaInicio || !form.fechaFin) {
    error.value = 'Debes seleccionar fecha y hora de inicio y fin.';
    return;
  }

  const inicio = new Date(form.fechaInicio);
  const fin = new Date(form.fechaFin);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    error.value = 'Las fechas seleccionadas no son válidas.';
    return;
  }

  if (inicio >= fin) {
    error.value = 'La fecha de inicio debe ser menor que la fecha de fin.';
    return;
  }

  loading.value = true;

  try {
    const payload = {
  espacio: seleccion.espacioId,
  recursos: recursosSeleccionados.value,  
  materia: seleccion.materiaId || null,
  fechaInicio: inicio.toISOString(),
  fechaFin: fin.toISOString(),
  motivo: form.motivo || '',
};

    const reservaCreada = await crearReserva(payload);

    success.value = 'Reserva creada correctamente.';
    console.log('Reserva creada:', reservaCreada);

    
    form.motivo = '';
  } catch (err: any) {
    console.error(err);
    
    error.value =
      err?.response?.data?.message || 'Error al crear la reserva.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  cargarFacultades();
});
</script>

<style scoped>
.recursos-list {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  max-height: 160px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.recurso-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.recurso-detalle {
  font-size: 0.8rem;
  color: #6b7280;
}


.nueva-reserva {
  max-width: 960px;
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
}

.form-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

select,
input,
textarea {
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
}

select:focus,
input:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.4);
}

textarea {
  resize: vertical;
}

.hint {
  font-size: 0.75rem;
  color: #6b7280;
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


.recursos-list {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  max-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.recurso-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.recurso-detalle {
  font-size: 0.8rem;
  color: #6b7280;
}
</style>
