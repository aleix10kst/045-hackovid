import {Injectable} from "@angular/core";
import {AngularFireAuth} from "@angular/fire/auth";
import {AngularFirestore} from "@angular/fire/firestore";
import firebase from "firebase";
import {first, take} from "rxjs/operators";
import {User} from "../pages/user/user";

@Injectable()
export class LoginService {

  private user: User;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  loginWithEmail(email: string, password: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(email, password).then((response: firebase.auth.UserCredential) => {
        this.afs.doc('users/' + response.user.uid).valueChanges().pipe(take(1)).subscribe((response) => {
          this.user = response as User;
          resolve();
        });
      }).catch((err) => {
        reject(err);
      });
    })
  }

  getCurrentUser(): User {
    return this.user;
  }

  isLoggedIn(): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      this.afAuth.authState.pipe(first()).toPromise().then((response: firebase.User) => {
        if (!!response) {
          this.afs.doc('users/' + response.uid).valueChanges().pipe(take(1)).subscribe((response) => {
            this.user = response as User;
            resolve(this.user);
          });
        } else {
          resolve();
        }
      }).catch((err) => reject(err));
    })
  }

  logout(): Promise<void> {
    return this.afAuth.auth.signOut();
  }
}
