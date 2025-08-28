import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { Campana, CampaignDto } from '../../shared/models/campana.model';
import { HydratedGroup } from '../../shared/models/group.model';
import { User } from '../../shared/models/user.model';
import { Animal } from '../../shared/models/animal.model';
import { CampanaService } from '../../shared/services/campana.service';
import { GroupService } from '../../shared/services/group.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { CampanaCardComponent } from './components/campana-card/campana-card.component';
import { CampanaFormComponent } from './components/campana-form/campana-form.component';
import { CargaAnimalesComponent } from './components/carga-animales/carga-animales.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-vacunaciones',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    CampanaCardComponent,
    CampanaFormComponent,
    CargaAnimalesComponent
  ],
  templateUrl: './vacunaciones.component.html',
})
export class VacunacionesComponent implements OnInit {
  private campanaService = inject(CampanaService);
  private groupService = inject(GroupService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  @ViewChild(CargaAnimalesComponent) cargaAnimalesComponent?: CargaAnimalesComponent;

  private contextSubject = new BehaviorSubject<{ groupId: string | null }>({ groupId: null });
  campanas$!: Observable<Campana[]>;
  userGroups$!: Observable<HydratedGroup[]>;
  currentUser!: User;
  selectedContext: { type: 'user' | 'group', id: string | null, name: string } = { type: 'user', id: null, name: 'Mis Campañas' };

  isFormCampanaOpen = false;
  isCargaAnimalesOpen = false;
  
  modalMode: 'create' | 'edit' = 'create';
  campanaEnProceso: Partial<Campana> | null = null;
  
  animalesTemporales: Animal[] = [];

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue!;
    this.userGroups$ = this.groupService.getMyGroups();
    
    this.campanas$ = this.contextSubject.pipe(
      switchMap(context => this.campanaService.getCampaigns(context))
    );
  }

  // ... (otros métodos como selectContext, openModalNuevaCampana, etc. sin cambios)
  
  /**
   * NUEVO: Maneja la lógica para eliminar una campaña.
   */
  onEliminarCampana(campana: Campana): void {
    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar la campaña "${campana.nombre}"? Esta acción no se puede deshacer.`);

    if (confirmacion) {
      this.campanaService.deleteCampaign(campana.id).subscribe({
        next: () => {
          this.notificationService.showSuccess(`Campaña "${campana.nombre}" eliminada con éxito.`);
          // Refresca la lista de campañas para que se reflejen los cambios
          this.contextSubject.next(this.contextSubject.getValue());
        },
        error: (err) => {
          this.notificationService.showError(err.error?.message || 'Error al eliminar la campaña.');
        }
      });
    }
  }

  // --- El resto de métodos permanecen sin cambios ---

  selectContext(group: HydratedGroup | null): void {
    if (group) {
      this.selectedContext = { type: 'group', id: group.id, name: group.nombre };
    } else {
      this.selectedContext = { type: 'user', id: null, name: 'Mis Campañas' };
    }
    this.contextSubject.next({ groupId: group?.id || null });
  }

  openModalNuevaCampana(): void {
    this.modalMode = 'create';
    this.campanaEnProceso = null;
    this.animalesTemporales = [];
    this.isFormCampanaOpen = true;
  }

  onSaveCampana(data: Partial<Campana>): void {
    this.campanaEnProceso = data;
    this.isFormCampanaOpen = false;
    this.isCargaAnimalesOpen = true;
  }

  onVerCarga(campana: Campana): void {
    this.modalMode = 'edit';
    this.campanaEnProceso = campana;
    this.animalesTemporales = campana.animales || [];
    this.isCargaAnimalesOpen = true;
  }

  closeCargaAnimalesModal(): void {
    if (this.cargaAnimalesComponent) {
      this.animalesTemporales = this.cargaAnimalesComponent.animalesEnCampana;
    }
    this.isCargaAnimalesOpen = false;
  }

  onFinalizarCarga(animales: Animal[]): void {
    if (!this.campanaEnProceso) {
        this.notificationService.showError("No se encontraron datos de la campaña para guardar.");
        return;
    }
    const campaignPayload: CampaignDto = {
      nombre: this.campanaEnProceso.nombre!,
      fecha: this.campanaEnProceso.fecha!,
      animalesIds: animales.map(a => a.id)
    };
    if (this.campanaEnProceso.observaciones) {
      campaignPayload.observaciones = this.campanaEnProceso.observaciones;
    }
    if (this.selectedContext.id) {
      campaignPayload.groupId = this.selectedContext.id;
    }
    let action$: Observable<Campana>;
    if (this.modalMode === 'create') {
      action$ = this.campanaService.createCampaign(campaignPayload);
    } else {
      const { groupId, ...updatePayload } = campaignPayload;
      action$ = this.campanaService.updateCampaign(this.campanaEnProceso.id!, updatePayload);
    }
    action$.subscribe({
      next: () => {
        const message = this.modalMode === 'create' ? 'creada' : 'actualizada';
        this.notificationService.showSuccess(`Campaña "${campaignPayload.nombre}" ${message} con éxito.`);
        this.closeAllModals();
        this.contextSubject.next(this.contextSubject.getValue());
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || 'Error al guardar la campaña.');
      }
    });
  }

  closeAllModals(): void {
    this.isFormCampanaOpen = false;
    this.isCargaAnimalesOpen = false;
    this.campanaEnProceso = null;
    this.animalesTemporales = [];
  }
}