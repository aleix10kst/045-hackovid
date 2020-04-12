import {Injectable} from "@angular/core";
import {AngularFireAuth} from "@angular/fire/auth";
import {AngularFirestore} from "@angular/fire/firestore";
import firebase from "firebase";
import {first} from "rxjs/operators";
import UserCredential = firebase.auth.UserCredential;
import {User} from "../models/user";
import {UserSevice} from "./user.sevice";

@Injectable()
export class LoginService {

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private userService: UserSevice) {
  }

  loginWithEmail(email: string, password: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(email, password).then((response: firebase.auth.UserCredential) => {
        this.userService.getUser(response.user.uid).then(() => {
          resolve();
        })
      }).catch((err) => {
        reject(err);
      });
    })
  }

  isLoggedIn(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.afAuth.authState.pipe(first()).toPromise().then((response: firebase.User) => {
        if (!!response) {
          this.userService.getUser(response.uid).then(() => {
            resolve();
          })
        } else {
          reject();
        }
      }).catch((err) => reject(err));
    })
  }

  logout(): Promise<void> {
    return this.afAuth.auth.signOut();
  }

  createWithUserEmail(email: string, password: string, codiEntitat: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).then((response: UserCredential) => {
        const user: User = {email: response.user.email, name: response.user.displayName, uid: response.user.uid, roles: ['normal']};
        if (codiEntitat) {
          this.afs.collection('entitats', ref => ref.where('codiEntitat', '==', codiEntitat)).valueChanges().pipe(first()).subscribe((doc) => {
            if (!!doc && doc.length > 0) {
              user.roles.push('entitat');
            }
            this.userService.createNewUser(response.user.uid, user).then(() => {
              resolve();
            }).catch((err) => {
              reject(err);
            });
          });
        } else {
          this.userService.createNewUser(response.user.uid, user).then(() => {
            resolve();
          }).catch((err) => {
            reject(err);
          });
        }
      }).catch((err) => {
        reject(err);
      })
    })
  }

}
