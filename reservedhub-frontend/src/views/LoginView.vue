<template>
  <main class="auth-page">
    <section class="auth-card">
      <h1>ReserveHUB</h1>

      <div class="tabs">
        <button
          :class="['tab', mode === 'login' ? 'active' : '']"
          @click="mode = 'login'"
        >
          Iniciar sesión
        </button>
        <button
          :class="['tab', mode === 'register' ? 'active' : '']"
          @click="mode = 'register'"
        >
          Registrarse
        </button>
      </div>

      <form @submit.prevent="onSubmit" class="auth-form">
        <div v-if="mode === 'register'" class="form-row">
          <label for="nombre">Nombre</label>
          <input
            id="nombre"
            v-model="form.nombre"
            type="text"
            required
            placeholder="Tu nombre"
          />
        </div>

        <div v-if="mode === 'register'" class="form-row">
          <label for="apellido">Apellido</label>
          <input
            id="apellido"
            v-model="form.apellido"
            type="text"
            required
            placeholder="Tu apellido"
          />
        </div>

        <div class="form-row">
          <label for="correo">Correo institucional</label>
          <input
            id="correo"
            v-model="form.correo"
            type="email"
            required
            placeholder="ejemplo@udla.edu.ec"
          />
        </div>

        <div class="form-row">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            minlength="6"
            placeholder="••••••••"
          />
        </div>

        <p v-if="mode === 'login'" class="hint">
          Usa tu correo y contraseña registrada.
          <br />
          <strong>El administrador</strong> iniciará sesión con su correo y clave especiales.
        </p>

        <p v-if="mode === 'register'" class="hint">
          Al registrarte se creará una cuenta de <strong>ESTUDIANTE</strong> por defecto.
        </p>

        <p v-if="error" class="error">
          {{ error }}
        </p>

        <button class="submit-btn" type="submit" :disabled="loading">
          <span v-if="!loading">
            {{ mode === 'login' ? 'Entrar' : 'Crear cuenta' }}
          </span>
          <span v-else>Procesando...</span>
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { login, register } from '../services/auth.service';
import { useAuth } from '../composables/useAuth';

type Mode = 'login' | 'register';

const router = useRouter();
const { setAuth } = useAuth();

const mode = ref<Mode>('login');
const loading = ref(false);
const error = ref<string | null>(null);

const form = reactive({
  nombre: '',
  apellido: '',
  correo: '',
  password: '',
});

const resetError = () => {
  error.value = null;
};

const onSubmit = async () => {
  resetError();
  loading.value = true;

  try {
    if (mode.value === 'login') {
      const resp = await login(form.correo, form.password);

      setAuth(resp.token, resp.usuario);

      // Redirigir a la página principal (luego podemos mandar a /reservas)
      await router.push('/');
    } else {
      // Registro
      const resp = await register({
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        password: form.password,
      });

      setAuth(resp.token, resp.usuario);

      await router.push('/');
    }
  } catch (err: any) {
    console.error(err);
    // Intentamos leer el mensaje que envía el backend
    error.value =
      err?.response?.data?.message ||
      'Ocurrió un error al procesar la solicitud.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f5f5f7;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 1.75rem 1.5rem 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.6rem;
}

.tabs {
  display: flex;
  margin-bottom: 1.25rem;
  border-radius: 999px;
  background: #f0f0f3;
  padding: 4px;
}

.tab {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.9rem;
}

.tab.active {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

label {
  font-size: 0.85rem;
  font-weight: 500;
}

input {
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #d0d0d5;
  font-size: 0.9rem;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.3);
}

.hint {
  font-size: 0.8rem;
  color: #555;
  margin-top: 0.25rem;
}

.error {
  font-size: 0.85rem;
  color: #b91c1c;
  background: #fee2e2;
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
  margin-top: 0.25rem;
}

.submit-btn {
  margin-top: 0.5rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  border-radius: 999px;
  border: none;
  background: #3b82f6;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: default;
}
</style>