import { Animal } from "./animal.model";
import { HydratedGroup } from "./group.model";
import { User } from "./user.model";

export interface Campana {
  id: string;
  nombre: string;
  fecha: string;
  productosUtilizados: string | null;
  observaciones: string | null;
  estado: string;
  propietario?: User;
  group?: HydratedGroup;
  animales: Animal[];
  createdAt: string;
  updatedAt: string;
}

// Modelo para el cuerpo (body) de la petición al crear o actualizar.
export interface CampaignDto {
  nombre: string;
  fecha: string;
  productosUtilizados?: string | null;
  observaciones?: string | null;
  estado?: string;
  groupId?: string | null;
  animalesIds: string[];
}
