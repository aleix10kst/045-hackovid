import {Component, OnInit} from "@angular/core";
import {RequestsList} from "./requests-list";
import {AngularFirestore} from "@angular/fire/firestore";
import {UserSevice} from "../../../services/user.sevice";
import {Modal, ModalController, Toast, ToastController} from "ionic-angular";
import {EditRequestPage} from "./edit-request";

@Component({
  templateUrl: './requests-list.html'
})
export class CreatedRequestsTab extends RequestsList implements OnInit{


  constructor(private afs: AngularFirestore, private userSevice: UserSevice, private modalController: ModalController, private toastController: ToastController) {
    super();
  }

  ngOnInit(): void {
    this.title = 'Peticions creades';
    this.noResults = 'Actualment no has creat cap petició';
    this.requestCollection = this.afs.collection('requests', ref => ref.where('createdBy', '==',this.userSevice.getCurrentUser().uid));
    this.requests = this.requestCollection.valueChanges();
  }

  onClickItem(id: string): void {
    const editModal: Modal = this.modalController.create(EditRequestPage, {id});
    let toast: Toast = this.toastController.create({duration: 3000});
    editModal.present();
    editModal.onDidDismiss((status: 'edited' | 'deleted' | 'canceled') => {
      switch (status) {
        case "edited":
          toast.setMessage(`S'ha guardat el canvi a la petició`);
          toast.present();
          break;
        case "deleted":
          toast.setMessage(`S'ha eliminat la petició`);
          toast.present();
          break;
      }
    })
  }

}
