import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NotaLegalPage } from './nota-legal';

@NgModule({
  declarations: [
    NotaLegalPage,
  ],
  imports: [
    IonicPageModule.forChild(NotaLegalPage),
  ],
})
export class NotaLegalModule {}
