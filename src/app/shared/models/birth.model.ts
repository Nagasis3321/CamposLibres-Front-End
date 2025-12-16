export interface Birth {
  id: string;
  madreId: string;
  criaId?: string;
  fecha: string;
  estado: 'VIVO' | 'MUERTO' | 'NATIMUERTO';
  sexoCria?: string;
  peso?: string;
  observaciones?: string;
  usuarioId: string;
  usuario?: { nombre: string; email: string };
  madre?: { id: string; caravana?: string; tipoAnimal: string };
  cria?: { id: string; caravana?: string; tipoAnimal: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBirthDto {
  madreId: string;
  criaId?: string;
  fecha: string;
  estado?: 'VIVO' | 'MUERTO' | 'NATIMUERTO';
  sexoCria?: string;
  peso?: string;
  observaciones?: string;
}

