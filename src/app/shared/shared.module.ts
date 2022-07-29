import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudSyncComponent } from './cloud-sync/cloud-sync.component';
import { FabComponent } from './fab/fab.component';
import { CreateSharedComponent } from './create-shared/create-shared.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IncomeExpenseItemComponent } from './income-expense-item/income-expense-item.component';
import { MonthChooseComponent } from './month-choose/month-choose.component';

@NgModule({
  declarations: [
    CloudSyncComponent,
    FabComponent,
    CreateSharedComponent,
    IncomeExpenseItemComponent,
    MonthChooseComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ],
  exports: [
    CloudSyncComponent,
    FabComponent,
    IncomeExpenseItemComponent,
    MonthChooseComponent
  ]
})
export class SharedModule { }
