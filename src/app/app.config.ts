import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

// Configuración principal de la aplicación.
export const appConfig: ApplicationConfig = {
  providers: [
    // Registra nuestras rutas en la aplicación.
    provideRouter(routes), 
    
    // Habilita el uso de HttpClient y registra nuestro interceptor.
    // Aunque aún no hagamos llamadas a una API, es bueno dejarlo configurado.
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
