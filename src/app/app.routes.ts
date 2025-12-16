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
import { RegisterComponent } from './features/auth/register/register.component';
import { UsersComponent } from './features/users/users.component';
import { UserDetailComponent } from './features/users/components/user-detail/user-detail.component';
import { AnimalDetailComponent } from './features/animales/components/animal-detail/animal-detail.component';
import { CampanaDetailComponent } from './features/vacunaciones/components/campana-detail/campana-detail.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { PerfilComponent } from './features/perfil/perfil.component';


export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'animales', component: AnimalesComponent },
            { path: 'animales/:id', component: AnimalDetailComponent },
            { path: 'crias', component: CriasComponent },
            { path: 'vacunaciones', component: VacunacionesComponent },
            { path: 'vacunaciones/:id', component: CampanaDetailComponent },
            { path: 'grupos', component: GroupComponent },
            { path: 'users', component: UsersComponent },
            { path: 'users/:id', component: UserDetailComponent },
            { path: 'reportes', component: ReportesComponent },
            { path: 'perfil', component: PerfilComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];













