import {Component, OnInit} from "@angular/core";
import {RequestsList} from "./requests-list";
import {AngularFirestore} from "@angular/fire/firestore";
import {LoginService} from "../../../services/login.service";

@Component({
  templateUrl: './requests-list.html'
})
export class CreatedRequestsTab extends RequestsList implements OnInit{


  constructor(private afs: AngularFirestore, private loginService: LoginService) {
    super();
  }

  ngOnInit(): void {
    this.title = 'Peticions creades';
    this.requestCollection = this.afs.collection('requests', ref => ref.where('createdBy', '==',this.loginService.getCurrentUser().uid));
    this.requests = this.requestCollection.valueChanges();
  }

}
