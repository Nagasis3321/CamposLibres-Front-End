import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReportService } from '../../../../shared/services/report.service';
import { CampanaService } from '../../../../shared/services/campana.service';
import { UserService } from '../../../../shared/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DatosPorTipoComponent } from '../datos-por-tipo/datos-por-tipo.component';
import { ListadoAnimalesComponent } from '../listado-animales/listado-animales.component';
import { PdfExportUtil } from '../../../../shared/utils/pdf-export.util';
import { ExcelExportUtil } from '../../../../shared/utils/excel-export.util';
import { Campana } from '../../../../shared/models/campana.model';
import { User } from '../../../../shared/models/user.model';
// Removed forkJoin import as it's no longer needed

@Component({
  selector: 'app-reporte-vacunacion-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatosPorTipoComponent, ListadoAnimalesComponent],
  templateUrl: './reporte-vacunacion-usuario.component.html',
  styleUrl: './reporte-vacunacion-usuario.component.css'
})
export class ReporteVacunacionUsuarioComponent implements OnInit {
  private reportService = inject(ReportService);
  private campanaService = inject(CampanaService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  campanas: Campana[] = [];
  usuarios: User[] = [];
  loading = false;

  datosPorTipo: any[] = [];
  listadoAnimales: any[] = [];
  campanaSeleccionada: Campana | null = null;
  usuarioSeleccionado: User | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      campanaId: [''],
      usuarioId: ['']
    });

    // Cargar solo campañas inicialmente
    this.campanaService.getCampaigns({ groupId: null }).subscribe({
      next: (campanas) => {
        this.campanas = campanas;
      },
      error: () => {
        this.notificationService.showError('Error al cargar las campañas');
      }
    });

    // Cuando cambie la campaña, cargar usuarios de esa campaña
    this.form.get('campanaId')?.valueChanges.subscribe(campanaId => {
      if (campanaId) {
        this.cargarUsuariosDeCampana(campanaId);
      } else {
        this.usuarios = [];
        this.form.get('usuarioId')?.setValue('');
      }
    });
  }

  cargarUsuariosDeCampana(campanaId: string): void {
    this.campanaService.getCampaignById(campanaId).subscribe({
      next: (campana) => {
        console.log('Campaña cargada:', campana);
        console.log('Animales en campaña:', campana.animales);
        
        // Extraer usuarios únicos de los animales de la campaña
        const usuariosMap = new Map<string, any>();
        (campana.animales || []).forEach(animal => {
          if (animal.dueno) {
            const duenoId = animal.dueno.id || animal.duenoId;
            if (duenoId && !usuariosMap.has(duenoId)) {
              usuariosMap.set(duenoId, animal.dueno);
            }
          }
        });
        
        this.usuarios = Array.from(usuariosMap.values());
        console.log('Usuarios extraídos:', this.usuarios);
        
        if (this.usuarios.length === 0) {
          this.notificationService.showInfo('Esta campaña no tiene animales asignados a ningún usuario.');
        }
      },
      error: (err) => {
        console.error('Error al cargar usuarios de campaña:', err);
        this.notificationService.showError('Error al cargar los usuarios de la campaña');
      }
    });
  }

  generarReporte(): void {
    const { campanaId, usuarioId } = this.form.value;
    
    if (!campanaId || !usuarioId) {
      this.notificationService.showError('Por favor, seleccione una campaña y un usuario');
      return;
    }

    this.loading = true;
    this.reportService.getReporteVacunacionUsuario(campanaId, usuarioId).subscribe({
      next: (reporte) => {
        console.log('Reporte recibido:', reporte);
        this.datosPorTipo = reporte.datosPorTipo || [];
        this.listadoAnimales = reporte.listados || [];
        this.campanaSeleccionada = reporte.campana;
        this.usuarioSeleccionado = reporte.usuario as User;
        this.loading = false;
        
        if (this.listadoAnimales.length === 0) {
          this.notificationService.showError(`El usuario seleccionado no tiene animales en esta campaña`);
        } else {
          this.notificationService.showSuccess(`Reporte generado: ${this.listadoAnimales.length} animales encontrados`);
        }
      },
      error: (err) => {
        console.error('Error al generar reporte:', err);
        this.notificationService.showError('Error al generar el reporte: ' + (err.message || 'Error desconocido'));
        this.loading = false;
      }
    });
  }

  exportarCompletoPDF(): void {
    if (!this.campanaSeleccionada || !this.usuarioSeleccionado) return;
    
    PdfExportUtil.exportReporteCompleto(
      this.datosPorTipo,
      this.listadoAnimales,
      `Reporte Vacunación - ${this.usuarioSeleccionado.nombre}`,
      `Campaña: ${this.campanaSeleccionada.nombre}`,
      this.campanaSeleccionada
    );
  }

  exportarCompletoExcel(): void {
    if (!this.campanaSeleccionada || !this.usuarioSeleccionado) return;
    
    ExcelExportUtil.exportReporteCompleto(
      this.datosPorTipo,
      this.listadoAnimales,
      `Reporte Vacunación - ${this.usuarioSeleccionado.nombre}`,
      `Campaña: ${this.campanaSeleccionada.nombre}`,
      this.campanaSeleccionada
    );
  }
}

