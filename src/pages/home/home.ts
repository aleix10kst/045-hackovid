import {Component, OnInit} from '@angular/core';
import { NavController } from 'ionic-angular';
import {AngularFireAuth} from "@angular/fire/auth";
import {User} from "firebase";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  constructor(public navCtrl: NavController, private afAuth: AngularFireAuth) {

  }

  ngOnInit(): void {
    this.afAuth.auth.onAuthStateChanged((response: User) => {
      console.log(response);
    })
  }

}
