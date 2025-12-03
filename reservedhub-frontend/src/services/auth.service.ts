import api from './api';

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: 'ESTUDIANTE' | 'DOCENTE' | 'ADMIN';
}

export interface AuthResponse {
  message: string;
  usuario: Usuario;
  token: string;
}

export const login = async (correo: string, password: string): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', {
    correo,
    password,
  });
  return data;
};

export const register = async (params: {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
}): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/register', params);
  return data;
};

export const getProfile = async (): Promise<Usuario> => {
  const { data } = await api.get<Usuario>('/auth/me');
  return data;
};