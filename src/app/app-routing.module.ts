import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthComponentGuard } from './guards/auth-component.guard';
import { AuthGuard } from './guards/auth.guard';
import { LogoutGuard } from './guards/logout.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthComponentGuard],
    // canLoad: [AuthGuard],
    canDeactivate: [LogoutGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
