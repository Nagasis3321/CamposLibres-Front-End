export interface Vaccination {
  id: string;
  animalId: string;
  nombreVacuna: string;
  fecha: string;
  lote?: string;
  veterinario?: string;
  observaciones?: string;
  usuarioId: string;
  usuario?: { nombre: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateVaccinationDto {
  animalId: string;
  nombreVacuna: string;
  fecha: string;
  lote?: string;
  veterinario?: string;
  observaciones?: string;
}

