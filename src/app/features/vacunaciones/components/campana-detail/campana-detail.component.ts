import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Campana } from '../../../../shared/models/campana.model';
import { CampanaService } from '../../../../shared/services/campana.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-campana-detail',
  standalone: true,
  imports: [CommonModule],
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

  editCampana(): void {
    if (this.campana) {
      this.router.navigate(['/vacunaciones'], { queryParams: { edit: this.campana.id } });
    }
  }
}

