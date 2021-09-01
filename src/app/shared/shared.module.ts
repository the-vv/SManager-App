import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudSyncComponent } from './cloud-sync/cloud-sync.component';



@NgModule({
  declarations: [
    CloudSyncComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    CloudSyncComponent
  ]
})
export class SharedModule { }
