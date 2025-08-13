export type UserRole = 'Propietario' | 'Administrador' | 'Miembro';

// Referencia a un miembro como se guardaría en la base de datos.
export interface GroupMemberRef {
  userId: string;
  role: UserRole;
}

// Modelo Normalizado del Grupo.
export interface Group {
  id: string;
  nombre: string;
  propietarioId: string;
  miembros: GroupMemberRef[];
}

// Modelo para la UI: combina datos del usuario con su rol en el grupo.
export interface HydratedMember {
  userId: string;
  nombre: string;
  email: string;
  role: UserRole;
}

// Modelo para la UI: un grupo con la información de sus miembros ya "hidratada".
export interface HydratedGroup extends Omit<Group, 'miembros'> {
  miembros: HydratedMember[];
}
