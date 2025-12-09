import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import NuevaReservaView from '../views/NuevaReservaView.vue';
import MisReservasView from '../views/MisReservasView.vue';
import AdminFacultadesView from '../views/AdminFacultadesView.vue';
import { useAuth } from '../composables/useAuth';
import AdminCarrerasView from '../views/AdminCarrerasView.vue';
import AdminMateriasView from '../views/AdminMateriasView.vue';
import AdminEspaciosView from '../views/AdminEspaciosView.vue';
import AdminRecursosView from '../views/AdminRecursosView.vue';
import AdminReservasView from '../views/AdminReservasView.vue';
import AdminPronosticoView from '../views/AdminPronosticoView.vue';





const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/reservas/nueva',
    name: 'nueva-reserva',
    component: NuevaReservaView,
    meta: { requiresAuth: true },
  },
  {
    path: '/reservas/mias',
    name: 'mis-reservas',
    component: MisReservasView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/facultades',
    name: 'admin-facultades',
    component: AdminFacultadesView,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
  path: '/admin/carreras',
  name: 'admin-carreras',
  component: AdminCarrerasView,
  meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
  path: '/admin/materias',
  name: 'admin-materias',
  component: AdminMateriasView,
  meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
  path: '/admin/espacios',
  name: 'admin-espacios',
  component: AdminEspaciosView,
  meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
  path: '/admin/recursos',
  name: 'admin-recursos',
  component: AdminRecursosView,
  meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
  path: '/admin/reservas',
  name: 'admin-reservas',
  component: AdminReservasView,
  meta: { requiresAuth: true, requiresAdmin: true },
  },
{
  path: '/admin/pronostico',
  name: 'admin-pronostico',
  component: AdminPronosticoView,
  meta: { requiresAuth: true, requiresAdmin: true },
},






];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const { isAuthenticated, usuario } = useAuth();

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return next({ name: 'login' });
  }

  if (to.name === 'login' && isAuthenticated.value) {
    return next({ name: 'home' });
  }

  if (to.meta.requiresAdmin) {
    if (!usuario.value || usuario.value.rol !== 'ADMIN') {
      // si no es admin, lo mandamos al home
      return next({ name: 'home' });
    }
  }

  return next();
});

export default router;
