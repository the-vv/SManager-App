import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudSyncComponent } from './cloud-sync/cloud-sync.component';
import { FabComponent } from './fab/fab.component';
import { CreateSharedComponent } from './create-shared/create-shared.component';

@NgModule({
  declarations: [
    CloudSyncComponent,
    FabComponent,
    CreateSharedComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CloudSyncComponent,
    FabComponent
  ]
})
export class SharedModule { }
