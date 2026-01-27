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
  --bg: rgba(206, 206, 206, 0.86);
  --stroke: rgba(15, 23, 42, 0.10);

  --text: #0f172a;
  --muted: #64748b;

  --primary: #1d4ed8;
  --primary-2: #3b82f6;

  --danger: #ef4444;

  height: 62px;
  padding: 0 1.25rem;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: var(--bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--stroke);

  box-shadow:
    0 10px 24px rgba(0, 0, 0, 0.08);

  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--text);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;

  font-weight: 900;
  font-size: 1.05rem;
  letter-spacing: 0.25px;

  color: rgba(15, 23, 42, 0.95);
  user-select: none;
}

.logo::before {
  content: "RH";
  display: inline-grid;
  place-items: center;

  width: 34px;
  height: 34px;
  border-radius: 12px;

  color: white;
  font-size: 0.85rem;
  font-weight: 900;

  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  box-shadow:
    0 12px 22px rgba(29, 78, 216, 0.22);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  font-size: 0.92rem;
}

.user-info {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: rgba(15, 23, 42, 0.88);
}

.role {
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.15px;

  padding: 0.14rem 0.55rem;
  border-radius: 999px;

  color: rgba(29, 78, 216, 0.95);
  background: rgba(59, 130, 246, 0.14);
  border: 1px solid rgba(59, 130, 246, 0.20);

  box-shadow: 0 10px 18px rgba(29, 78, 216, 0.12);
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(239, 68, 68, 0.40);

  background: rgba(239, 68, 68, 0.10);
  color: #991b1b;

  font-size: 0.86rem;
  font-weight: 900;
  letter-spacing: 0.1px;

  cursor: pointer;
  transition: transform 120ms ease, background 180ms ease, box-shadow 180ms ease, filter 180ms ease;
}

.logout-btn:hover {
  transform: translateY(-1px);
  background: rgba(239, 68, 68, 0.14);
  box-shadow: 0 16px 26px rgba(239, 68, 68, 0.14);
}

.logout-btn:active {
  transform: translateY(0px);
}


.login-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  text-decoration: none;

  border: 1px solid rgba(29, 78, 216, 0.35);
  color: rgba(29, 78, 216, 0.95);
  background: rgba(59, 130, 246, 0.08);

  font-size: 0.86rem;
  font-weight: 900;

  box-shadow: 0 12px 22px rgba(29, 78, 216, 0.12);
  transition: transform 120ms ease, background 180ms ease, box-shadow 180ms ease;
}

.login-link:hover {
  transform: translateY(-1px);
  background: rgba(59, 130, 246, 0.12);
  box-shadow: 0 16px 28px rgba(29, 78, 216, 0.16);
}

.login-link:active {
  transform: translateY(0px);
}

/* Responsive */
@media (max-width: 520px) {
  .navbar {
    padding: 0 0.9rem;
    height: 60px;
  }

  .user-info {
    display: none; 
  }
}
</style>
