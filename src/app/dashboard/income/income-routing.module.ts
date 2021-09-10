import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { IncomePage } from './income.page';

const routes: Routes = [
  {
    path: '',
    component: IncomePage
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class IncomePageRoutingModule {}
