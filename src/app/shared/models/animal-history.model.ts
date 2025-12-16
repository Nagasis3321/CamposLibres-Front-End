export enum HistoryType {
  PARTO = 'PARTO',
  VACUNACION = 'VACUNACION',
  ESTADO = 'ESTADO',
  TRATAMIENTO = 'TRATAMIENTO',
  OBSERVACION = 'OBSERVACION',
  OTRO = 'OTRO',
}

export interface AnimalHistory {
  id: string;
  animalId: string;
  tipo: HistoryType;
  titulo: string;
  descripcion?: string;
  fecha: string;
  usuarioId: string;
  usuario?: { nombre: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnimalHistoryDto {
  animalId: string;
  tipo: HistoryType;
  titulo: string;
  descripcion?: string;
  fecha: string;
}

