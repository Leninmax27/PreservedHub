import api from './api';

export interface Facultad {
  _id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  estado: 'ACTIVA' | 'INACTIVA';
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearFacultadDTO {
  nombre: string;
  codigo: string;
  descripcion?: string;
}

export interface ActualizarFacultadDTO {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  estado?: 'ACTIVA' | 'INACTIVA';
}

// Listar todas las facultades (admin ve activas e inactivas)
export const listarFacultades = async (): Promise<Facultad[]> => {
  const { data } = await api.get<Facultad[]>('/facultades');
  return data;
};

// Crear una nueva facultad
export const crearFacultad = async (
  payload: CrearFacultadDTO
): Promise<Facultad> => {
  const { data } = await api.post<Facultad>('/facultades', payload);
  return data;
};

// Actualizar facultad completa
export const actualizarFacultad = async (
  id: string,
  payload: ActualizarFacultadDTO
): Promise<Facultad> => {
  const { data } = await api.put<Facultad>(`/facultades/${id}`, payload);
  return data;
};

// Cambiar solo el estado (ACTIVA / INACTIVA)
export const cambiarEstadoFacultad = async (
  id: string,
  estado: 'ACTIVA' | 'INACTIVA'
): Promise<Facultad> => {
  const { data } = await api.patch<Facultad>(
    `/facultades/${id}/estado`,
    { estado }
  );
  return data;
};

export const getFacultades = listarFacultades;