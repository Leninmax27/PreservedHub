import { ref, computed } from 'vue';
import type { Usuario } from '../services/auth.service';

const token = ref<string | null>(localStorage.getItem('token'));

const usuario = ref<Usuario | null>(null);

const rawUsuario = localStorage.getItem('usuario');
if (rawUsuario) {
  try {
    usuario.value = JSON.parse(rawUsuario) as Usuario;
  } catch (e) {
    console.error('Error al parsear usuario de localStorage', e);
  }
}

const isAuthenticated = computed(() => !!token.value);

function setAuth(newToken: string, newUsuario: Usuario) {
  token.value = newToken;
  usuario.value = newUsuario;

  localStorage.setItem('token', newToken);
  localStorage.setItem('usuario', JSON.stringify(newUsuario));
}

function clearAuth() {
  token.value = null;
  usuario.value = null;

  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function useAuth() {
  return {
    token,
    usuario,
    isAuthenticated,
    setAuth,
    clearAuth,
  };
}