/**
 * Script para generar archivo Excel de ejemplo
 * Ejecutar: node scripts/generar-ejemplo-excel.js
 */
const XLSX = require('xlsx');

const datos = [
  ['nombre', 'curso', 'horas', 'fecha'],
  ['Juan Pérez García', 'Primeros Auxilios Básicos', 8, '2024-01-15'],
  ['María López Sánchez', 'Evacuación y Rescate', 4, '2024-01-20'],
  ['Carlos Rodríguez Martínez', 'Prevención de Incendios', 6, '2024-02-01'],
  ['Ana Martínez Torres', 'Búsqueda y Rescate', 10, '2024-02-10'],
  ['Pedro González Ramírez', 'Manejo de Extintores', 4, '2024-02-15'],
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(datos);

// Ajustar ancho de columnas
ws['!cols'] = [
  { wch: 25 }, // nombre
  { wch: 30 }, // curso
  { wch: 10 }, // horas
  { wch: 15 }, // fecha
];

XLSX.utils.book_append_sheet(wb, ws, 'Constancias');
XLSX.writeFile(wb, 'ejemplo-constancias.xlsx');

console.log('✅ Archivo Excel de ejemplo creado: ejemplo-constancias.xlsx');
