import { Routes } from '@angular/router';
import { Homepage } from './component/homepage/homepage';
import { ElencoAuto } from './component/elenco-auto/elenco-auto';
import { NuovaAuto } from './component/nuova-auto/nuova-auto';
import { DettaglioAuto } from './component/dettaglio-auto/dettaglio-auto';
import { Login } from './component/login/login';
import { authGuard } from './guard/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', component: Homepage, canActivate: [authGuard] },
  { path: 'elenco-auto', component: ElencoAuto, canActivate: [authGuard] },
  { path: 'nuova-auto', component: NuovaAuto, canActivate: [authGuard] },
  { 
    path: 'dettaglio-auto/:targa', 
    component: DettaglioAuto, 
    canActivate: [authGuard],
    data: { prerender: false }
  },
  { path: '**', redirectTo: 'login' }
];
