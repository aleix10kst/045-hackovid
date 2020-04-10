import {Component} from '@angular/core';
import {ModalController, ToastController} from 'ionic-angular';
import {CreateRequestPage} from "../create-request/create-request";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(private modalCtrl: ModalController, private toastController: ToastController) {
  }

  onClickAddRequest(): void {
    const modal = this.modalCtrl.create(CreateRequestPage);
    modal.present();
    modal.onDidDismiss(() => {
      const toast = this.toastController.create({
        message: `La teva petició s'ha creat correctament.`,
        duration: 3000
      });
      toast.present();
    });
  }
}
