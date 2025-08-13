// Importamos el modelo Animal porque una campaña contiene una lista de animales.
import { Animal } from "./animal.model";

// Define la estructura para un objeto de Campaña de vacunación o sanitaria.
export interface Campana {
  idCampana: string;
  nombreCampana: string;
  fechaCampana: string;
  productoUtilizado?: string;
  loteProducto?: string;
  responsableCarga: string;
  obsCampana?: string;
  estado: 'Pendiente Carga' | 'Completada';
  // Una campaña tiene una lista de animales. Usamos 'Partial<Animal>'
  // porque quizás solo necesitemos algunos datos del animal en este contexto (ej. id y caravana).
  animalesAgregados: Partial<Animal>[];
}

