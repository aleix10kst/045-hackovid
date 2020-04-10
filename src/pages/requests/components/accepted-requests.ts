import {Component, OnInit} from "@angular/core";
import {RequestsList} from "./requests-list";
import {AngularFirestore} from "@angular/fire/firestore";
import {UserSevice} from "../../../services/user.sevice";

@Component({
  templateUrl: './requests-list.html'
})
export class AcceptedRequestsTab extends RequestsList implements OnInit {

  constructor(private afs: AngularFirestore, private userSevice: UserSevice) {
    super();
  }

  ngOnInit(): void {
    this.title = 'Peticions acceptades';
    this.requestCollection = this.afs.collection('requests', ref => ref.where('acceptedBy', '==',this.userSevice.getCurrentUser().uid));
    this.requests = this.requestCollection.valueChanges();
  }
}
