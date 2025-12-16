import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Animal } from '../models/animal.model';
import { DatosPorTipo } from '../models/report.model';
import { Campana } from '../models/campana.model';

export class PdfExportUtil {
  /**
   * Exporta datos por tipo a PDF
   */
  static exportDatosPorTipo(
    datosPorTipo: DatosPorTipo[],
    titulo: string,
    subtitulo?: string
  ): void {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text(titulo, 14, 20);
    
    if (subtitulo) {
      doc.setFontSize(12);
      doc.text(subtitulo, 14, 30);
    }

    // Tabla de datos por tipo
    const tableData = datosPorTipo.map(item => [
      item.tipo.toString(),
      item.cantidad.toString()
    ]);

    autoTable(doc, {
      head: [['Tipo de Animal', 'Cantidad']],
      body: tableData,
      startY: subtitulo ? 35 : 25,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }, // Color azul
    });

    // Generar nombre de archivo
    const fileName = `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Exporta listado de animales a PDF
   */
  static exportListadoAnimales(
    animales: Animal[],
    titulo: string,
    subtitulo?: string
  ): void {
    const doc = new jsPDF('landscape'); // Horizontal para más columnas
    
    // Título
    doc.setFontSize(18);
    doc.text(titulo, 14, 20);
    
    if (subtitulo) {
      doc.setFontSize(12);
      doc.text(subtitulo, 14, 30);
    }

    // Tabla de animales
    const tableData = animales.map(animal => [
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

    autoTable(doc, {
      head: [['Caravana', 'Tipo', 'Pelaje', 'Sexo', 'Dueño', 'Fecha Nac.', 'Descripción']],
      body: tableData,
      startY: subtitulo ? 35 : 25,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });

    // Generar nombre de archivo
    const fileName = `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  /**
   * Exporta reporte completo (datos por tipo + listado)
   */
  static exportReporteCompleto(
    datosPorTipo: DatosPorTipo[],
    animales: Animal[],
    titulo: string,
    subtitulo?: string,
    campana?: Campana
  ): void {
    const doc = new jsPDF();
    let currentY = 20;

    // Título
    doc.setFontSize(18);
    doc.text(titulo, 14, currentY);
    currentY += 10;

    if (subtitulo) {
      doc.setFontSize(12);
      doc.text(subtitulo, 14, currentY);
      currentY += 10;
    }

    // Información de campaña si existe
    if (campana) {
      doc.setFontSize(10);
      doc.text(`Campaña: ${campana.nombre}`, 14, currentY);
      currentY += 5;
      doc.text(`Fecha: ${new Date(campana.fecha).toLocaleDateString('es-ES')}`, 14, currentY);
      currentY += 10;
    }

    // Sección: Datos por Tipo
    doc.setFontSize(14);
    doc.text('Datos por Tipo de Animal', 14, currentY);
    currentY += 10;

    const tableDataTipos = datosPorTipo.map(item => [
      item.tipo.toString(),
      item.cantidad.toString()
    ]);

    autoTable(doc, {
      head: [['Tipo de Animal', 'Cantidad']],
      body: tableDataTipos,
      startY: currentY,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Nueva página para el listado si es necesario
    if (currentY > 250 && animales.length > 0) {
      doc.addPage();
      currentY = 20;
    }

    // Sección: Listado de Animales
    if (animales.length > 0) {
      doc.setFontSize(14);
      doc.text('Listado de Animales', 14, currentY);
      currentY += 10;

      const tableDataAnimales = animales.map(animal => [
        animal.caravana || 'S/C',
        animal.tipoAnimal,
        animal.pelaje || 'N/A',
        animal.sexo,
        animal.dueno?.nombre || 'N/A',
        animal.fechaNacimiento 
          ? new Date(animal.fechaNacimiento).toLocaleDateString('es-ES')
          : 'N/A'
      ]);

      // Usar formato horizontal si hay muchos animales
      const isLandscape = animales.length > 15;
      if (isLandscape && currentY === 20) {
        // No podemos cambiar orientación a mitad de documento fácilmente
        // Usaremos columnas más estrechas
      }

      autoTable(doc, {
        head: [['Caravana', 'Tipo', 'Pelaje', 'Sexo', 'Dueño', 'Fecha Nac.']],
        body: tableDataAnimales,
        startY: currentY,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 },
        pageBreak: 'auto',
      });
    }

    // Generar nombre de archivo
    const fileName = `${titulo.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}

