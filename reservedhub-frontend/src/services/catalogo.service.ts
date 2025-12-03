import api from './api';

export interface Facultad {
  _id: string;
  nombre: string;
  codigo: string;
}

export interface Carrera {
  _id: string;
  nombre: string;
  codigo: string;
  facultad: string | Facultad;
}

export interface Materia {
  _id: string;
  nombre: string;
  codigo: string;
  carrera: string | Carrera;
}

export interface Espacio {
  _id: string;
  nombre: string;
  codigo?: string;
  tipo: 'AULA' | 'LABORATORIO' | 'AUDITORIO' | 'SALA';
  capacidad: number;
}

export const obtenerFacultades = async (): Promise<Facultad[]> => {
  const { data } = await api.get<Facultad[]>('/facultades', {
    params: {
      estado: 'ACTIVA',
    },
  });
  return data;
};

export const obtenerCarrerasPorFacultad = async (
  facultadId: string
): Promise<Carrera[]> => {
  const { data } = await api.get<Carrera[]>(
    `/carreras/facultad/${facultadId}`
  );
  return data;
};

export const obtenerMateriasPorCarrera = async (
  carreraId: string
): Promise<Materia[]> => {
  const { data } = await api.get<Materia[]>(
    `/materias/carrera/${carreraId}`
  );
  return data;
};

export const obtenerEspaciosPorFacultad = async (
  facultadId: string
): Promise<Espacio[]> => {
  const { data } = await api.get<Espacio[]>('/espacios', {
    params: {
      facultad: facultadId,
      estado: 'ACTIVO',
    },
  });
  return data;
};