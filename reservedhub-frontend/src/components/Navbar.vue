<template>
  <header class="navbar">
    <div class="navbar-left">
      <span class="logo">ReserveHUB</span>
    </div>

    <nav class="navbar-right">
      <template v-if="isAuthenticated">
        <span class="user-info">
          Hola,
          <strong>{{ usuario?.nombre }}</strong>
          <span class="role">({{ usuario?.rol }})</span>
        </span>
        <button class="logout-btn" @click="logout">Cerrar sesión</button>
      </template>

      <template v-else>
        <router-link class="login-link" to="/login">Iniciar sesión</router-link>
      </template>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { usuario, isAuthenticated, clearAuth } = useAuth();

const logout = () => {
  clearAuth();
  router.push('/login');
};
</script>

<style scoped>
.navbar {
  height: 56px;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.logo {
  font-weight: 700;
  font-size: 1.1rem;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.user-info {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.role {
  font-size: 0.8rem;
  color: #6b7280;
}

.logout-btn {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #ef4444;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.85rem;
  cursor: pointer;
}

.logout-btn:hover {
  background: #fecaca;
}

.login-link {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #3b82f6;
  color: #1d4ed8;
  text-decoration: none;
  font-size: 0.85rem;
}

.login-link:hover {
  background: #dbeafe;
}
</style>
