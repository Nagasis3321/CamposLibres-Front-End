import { Routes } from '@angular/router';

// Importamos los componentes y el guardián que usaremos en las rutas.
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AnimalesComponent } from './features/animales/animales.component';
import { CriasComponent } from './features/crias/crias.component';
import { VacunacionesComponent } from './features/vacunaciones/vacunaciones.component';
import {GroupComponent} from './features/gruop/group.component'
import { RegisterComponent } from './features/auth/register/register.component'; // <-- NUEVA IMPORTACIÓN


export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent }, // <-- NUEVA RUTA
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'animales', component: AnimalesComponent },
            { path: 'crias', component: CriasComponent },
            { path: 'vacunaciones', component: VacunacionesComponent },
            { path: 'grupos', component: GroupComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
