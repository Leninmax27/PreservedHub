<template>
  <div class="chart-card">
    <h3 class="chart-title">{{ titulo }}</h3>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type ComparativoItem = {
  tipo: string;
  capacidadActual: number;
  demandaProyectada: number;
};

const props = defineProps<{
  titulo?: string;
  items: ComparativoItem[];
}>();

const titulo = computed(() => props.titulo ?? 'Capacidad vs Demanda');

const chartData = computed(() => ({
  labels: props.items.map((i) => i.tipo),
  datasets: [
    {
      label: 'Capacidad actual',
      data: props.items.map((i) => i.capacidadActual),
      backgroundColor: 'rgba(59, 130, 246, 0.6)', // azul
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    },
    {
      label: 'Demanda proyectada',
      data: props.items.map((i) => i.demandaProyectada),
      backgroundColor: 'rgba(245, 158, 11, 0.6)', // naranja
      borderColor: 'rgba(245, 158, 11, 1)',
      borderWidth: 1,
    },
  ],
}));


const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
}));
</script>

<style scoped>
.chart-card {
  background: #20728b6a;
  border-radius: 12px;
  padding: 1rem 1rem 1.2rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  margin-bottom: 1rem;
}

.chart-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.chart-card :deep(canvas) {
  height: 320px !important;
}
</style>
