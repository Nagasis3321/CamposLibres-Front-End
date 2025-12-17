import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Campana } from '../../../../shared/models/campana.model';
import { CampanaService } from '../../../../shared/services/campana.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CampanaFormComponent } from '../campana-form/campana-form.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-campana-detail',
  standalone: true,
  imports: [CommonModule, CampanaFormComponent, ModalComponent],
  templateUrl: './campana-detail.component.html',
  styleUrl: './campana-detail.component.css'
})
export class CampanaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private campanaService = inject(CampanaService);
  private notificationService = inject(NotificationService);

  campana: Campana | null = null;
  loading = true;
  isEditModalOpen = false;

  ngOnInit(): void {
    const campanaId = this.route.snapshot.paramMap.get('id');
    if (campanaId) {
      this.loadCampana(campanaId);
    }
  }

  loadCampana(id: string): void {
    this.loading = true;
    this.campanaService.getCampaignById(id).subscribe({
      next: (campana) => {
        this.campana = campana;
        this.loading = false;
      },
      error: (err) => {
        this.notificationService.showError('Error al cargar la campaña.');
        this.router.navigate(['/vacunaciones']);
      }
    });
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/vacunaciones']);
  }

  editAnimalesCampana(): void {
    // Redirige a la vista de vacunaciones con el parámetro de edición de animales
    if (this.campana) {
      this.router.navigate(['/vacunaciones'], { queryParams: { edit: this.campana.id } });
    }
  }

  openEditModal(): void {
    this.isEditModalOpen = true;
  }

  onSaveEdit(updatedData: Partial<Campana>): void {
    if (!this.campana) return;

    this.campanaService.updateCampaign(this.campana.id, updatedData).subscribe({
      next: (updatedCampana) => {
        this.campana = updatedCampana;
        this.isEditModalOpen = false;
        this.notificationService.showSuccess('Campaña actualizada correctamente');
      },
      error: (err) => {
        this.notificationService.showError('Error al actualizar la campaña');
        console.error('Error actualizando campaña:', err);
      }
    });
  }
}

