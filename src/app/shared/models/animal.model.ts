// Define la estructura completa para un objeto de Animal.
// Usamos tipos específicos (unions) para campos como 'tipoAnimal' y 'sexo'
// para evitar errores y asegurar que solo se usen valores válidos.
export interface Animal {
  id: string;
  caravana?: string; // El '?' indica que la propiedad es opcional.
  tipoAnimal: 'Vaca' | 'Vaquilla' | 'Ternero/a' | 'Novillo' | 'Toro';
  pelaje: string;
  sexo: 'Hembra' | 'Macho';
  dueno: string;
  raza?: string;
  fechaNacimiento?: string;
  idMadre?: string | null; // Puede ser un string, nulo, o no existir.
  descripcion?: string;
}
