<template>
  <section class="home">
    <h1 class="title">ReserveHUB Frontend</h1>
    <p class="subtitle">Frontend conectado a tu backend de reservas 🎓🏫</p>

    <div v-if="!usuario" class="card">
      <p>
        Para usar el sistema, primero
        <router-link to="/login">inicia sesión</router-link>.
      </p>
    </div>

    <div v-else>
      <p class="welcome">
        Bienvenido,
        <strong>{{ usuario.nombre }} {{ usuario.apellido }}</strong>
        <span class="role-tag">{{ usuario.rol }}</span>
      </p>

<!-- Opciones para ADMIN -->
<div v-if="isAdmin" class="grid">
  <div class="card">
    <h2>Gestión académica</h2>
    <p>Configura facultades, carreras y materias.</p>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <router-link class="btn" to="/admin/facultades">Facultades</router-link>
      <router-link class="btn secondary" to="/admin/carreras">Carreras</router-link>
      <router-link class="btn secondary" to="/admin/materias">Materias</router-link>
    </div>
  </div>

  <div class="card">
  <h2>Espacios y recursos</h2>
  <p>Administra aulas, laboratorios y equipos.</p>

  <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
    <router-link class="btn" to="/admin/espacios">
      Espacios
    </router-link>

    <router-link class="btn secondary" to="/admin/recursos">
      Recursos
    </router-link>
  </div>
</div>

        <div class="card">
  <h2>Reservas</h2>
  <p>Supervisa, aprueba o cancela reservas de usuarios.</p>

  <router-link class="btn" to="/admin/reservas">
    Ir al módulo
  </router-link>
</div>

        <div class="card">
  <h2>Pronóstico de recursos</h2>
  <p>Analiza capacidad vs demanda futura por facultad.</p>
  <router-link class="btn" to="/admin/pronostico">
    Ir al módulo
  </router-link>
</div>
      </div>

      <!-- Opciones para ESTUDIANTE / DOCENTE -->
      <div v-else class="grid">
        <div class="card">
          <h2>Nueva reserva</h2>
          <p>Selecciona facultad, carrera, materia, espacio y recursos.</p>
          <!-- Esta será la vista que haremos en el "segundo" paso -->
          <router-link class="btn" to="/reservas/nueva">
            Empezar reserva
          </router-link>
        </div>

        <div class="card">
          <h2>Mis reservas</h2>
          <p>Consulta, modifica o cancela tus reservas activas.</p>
          <router-link class="btn secondary" to="/reservas/mias">
            Ver mis reservas
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '../composables/useAuth';

const { usuario } = useAuth();

const isAdmin = computed(() => usuario.value?.rol === 'ADMIN');
</script>

<style scoped>
.home {
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem 0.5rem;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.subtitle {
  text-align: center;
  font-size: 0.95rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.welcome {
  margin-bottom: 1rem;
  font-size: 1rem;
}

.role-tag {
  margin-left: 0.5rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: #e5e7eb;
  font-size: 0.8rem;
}

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1rem 1rem 1.2rem;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
}

.card h2 {
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
}

.card p {
  font-size: 0.9rem;
  color: #4b5563;
  margin-bottom: 0.75rem;
}

.btn,
.btn.secondary {
  display: inline-block;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: none;
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
}

.btn {
  background: #3b82f6;
  color: #ffffff;
}

.btn.secondary {
  background: #e5e7eb;
  color: #111827;
}

button.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
