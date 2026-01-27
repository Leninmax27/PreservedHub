import api from './api';

export interface CoreResumenResponse {
  facultadId: string;
  ventana: {
    inicio: string;
    fin: string;
  };
  kpis: {
    totalReservas: number;
    estados: Record<string, number>;
    espacioMasUsado: { nombre: string; reservas: number } | null;
  };
  comparativoRecursos: Array<{
    tipo: string;
    capacidadActual: number;
    usoHistoricoMaximo: number;
    demandaProyectada: number;
    cobertura: number | null;
    faltantes: number;
  }>;
}

export async function getCoreResumenPorFacultad(
  facultadId: string,
  params?: { meses?: number; crecimiento?: number }
): Promise<CoreResumenResponse> {
  const { data } = await api.get<CoreResumenResponse>(
    `/core/resumen/facultad/${facultadId}`,
    { params }
  );
  return data;
}
