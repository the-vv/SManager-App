import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardPage } from './dashboard.page';

const routes: Routes = [
  {
    path: 'pages',
    component: DashboardPage,
    children: [
      {
        path: 'overview',
        loadChildren: () => import('./overview/overview.module').then( m => m.OverviewPageModule)
      },
      {
        path: 'income',
        loadChildren: () => import('./income/income.module').then( m => m.IncomePageModule)
      },
      {
        path: 'expense',
        loadChildren: () => import('./expense/expense.module').then( m => m.ExpensePageModule)
      },
      {
        path: 'account',
        loadChildren: () => import('./account/account.module').then( m => m.AccountPageModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'pages/account',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardPageRoutingModule {}
