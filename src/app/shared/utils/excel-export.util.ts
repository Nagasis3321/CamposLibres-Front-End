import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Animal } from '../models/animal.model';
import { DatosPorTipo } from '../models/report.model';
import { Campana } from '../models/campana.model';

export class ExcelExportUtil {
  /**
   * Exporta datos por tipo a Excel
   */
  static exportDatosPorTipo(
    datosPorTipo: DatosPorTipo[],
    titulo: string,
    subtitulo?: string
  ): void {
    const worksheet = XLSX.utils.aoa_to_sheet([
      [titulo],
      subtitulo ? [subtitulo] : [],
      [], // Línea vacía
      ['Tipo de Animal', 'Cantidad'],
      ...datosPorTipo.map(item => [item.tipo, item.cantidad])
    ]);

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 20 }, // Columna Tipo
      { wch: 10 }  // Columna Cantidad
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos por Tipo');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileName = `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
  }

  /**
   * Exporta listado de animales a Excel
   */
  static exportListadoAnimales(
    animales: Animal[],
    titulo: string,
    subtitulo?: string
  ): void {
    const headers = ['Caravana', 'Tipo', 'Pelaje', 'Sexo', 'Dueño', 'Fecha Nacimiento', 'Descripción'];
    
    const data = animales.map(animal => [
      animal.caravana || 'S/C',
      animal.tipoAnimal,
      animal.pelaje || 'N/A',
      animal.sexo,
      animal.dueno?.nombre || 'N/A',
      animal.fechaNacimiento 
        ? new Date(animal.fechaNacimiento).toLocaleDateString('es-ES')
        : 'N/A',
      animal.descripcion || 'N/A'
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([
      [titulo],
      subtitulo ? [subtitulo] : [],
      [], // Línea vacía
      headers,
      ...data
    ]);

    // Ajustar ancho de columnas
    worksheet['!cols'] = [
      { wch: 15 }, // Caravana
      { wch: 12 }, // Tipo
      { wch: 15 }, // Pelaje
      { wch: 8 },  // Sexo
      { wch: 20 }, // Dueño
      { wch: 15 }, // Fecha Nacimiento
      { wch: 30 }  // Descripción
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Listado Animales');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileName = `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
  }

  /**
   * Exporta reporte completo (datos por tipo + listado) a Excel con múltiples hojas
   */
  static exportReporteCompleto(
    datosPorTipo: DatosPorTipo[],
    animales: Animal[],
    titulo: string,
    subtitulo?: string,
    campana?: Campana
  ): void {
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Información General
    const infoData = [
      [titulo],
      subtitulo ? [subtitulo] : [],
      [],
      campana ? ['Campaña:', campana.nombre] : [],
      campana ? ['Fecha:', new Date(campana.fecha).toLocaleDateString('es-ES')] : [],
      campana && campana.productosUtilizados ? ['Productos Utilizados:', campana.productosUtilizados] : [],
      campana && campana.observaciones ? ['Observaciones:', campana.observaciones] : []
    ].filter(row => row.length > 0);

    const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
    infoSheet['!cols'] = [{ wch: 20 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(workbook, infoSheet, 'Información');

    // Hoja 2: Datos por Tipo
    const tiposData = [
      ['Tipo de Animal', 'Cantidad'],
      ...datosPorTipo.map(item => [item.tipo, item.cantidad])
    ];
    const tiposSheet = XLSX.utils.aoa_to_sheet(tiposData);
    tiposSheet['!cols'] = [{ wch: 20 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(workbook, tiposSheet, 'Datos por Tipo');

    // Hoja 3: Listado de Animales
    if (animales.length > 0) {
      const headers = ['Caravana', 'Tipo', 'Pelaje', 'Sexo', 'Dueño', 'Fecha Nacimiento', 'Descripción'];
      const animalesData = [
        headers,
        ...animales.map(animal => [
          animal.caravana || 'S/C',
          animal.tipoAnimal,
          animal.pelaje || 'N/A',
          animal.sexo,
          animal.dueno?.nombre || 'N/A',
          animal.fechaNacimiento 
            ? new Date(animal.fechaNacimiento).toLocaleDateString('es-ES')
            : 'N/A',
          animal.descripcion || 'N/A'
        ])
      ];
      const animalesSheet = XLSX.utils.aoa_to_sheet(animalesData);
      animalesSheet['!cols'] = [
        { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 8 },
        { wch: 20 }, { wch: 15 }, { wch: 30 }
      ];
      XLSX.utils.book_append_sheet(workbook, animalesSheet, 'Listado Animales');
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileName = `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
  }
}

