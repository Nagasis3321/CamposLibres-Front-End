export interface Animal {
  id: string;
  caravana?: string;
  tipoAnimal: 'Vaca' | 'Vaquilla' | 'Ternero' | 'Ternera' | 'Novillo' | 'Toro';
  pelaje: string;
  sexo: 'Hembra' | 'Macho';
  duenoId: string; // El ID del usuario propietario.
  dueno?: { nombre: string }; // Opcional, para datos hidratados por la API.
  raza?: string;
  fechaNacimiento?: string;
  idMadre?: string | null;
  descripcion?: string;
}



export interface AnimalFilters {
  page?: number;
  limit?: number;
  groupId?: string | null;
  caravana?: string | null;
  pelaje?: string | null;
  tipoAnimal?: string | null;
}