export enum StateType {
  SALUDABLE = 'SALUDABLE',
  ENFERMO = 'ENFERMO',
  EN_TRATAMIENTO = 'EN_TRATAMIENTO',
  GESTANTE = 'GESTANTE',
  LACTANDO = 'LACTANDO',
  SECA = 'SECA',
  VENDIDO = 'VENDIDO',
  MUERTO = 'MUERTO',
  OTRO = 'OTRO',
}

export interface AnimalState {
  id: string;
  animalId: string;
  tipo: StateType;
  nombre?: string;
  fechaInicio: string;
  fechaFin?: string;
  descripcion?: string;
  activo: boolean;
  usuarioId: string;
  usuario?: { nombre: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnimalStateDto {
  animalId: string;
  tipo: StateType;
  nombre?: string;
  fechaInicio: string;
  fechaFin?: string;
  descripcion?: string;
  activo?: boolean;
}

