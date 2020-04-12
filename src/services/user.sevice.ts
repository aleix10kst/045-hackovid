import {Injectable} from "@angular/core";
import {User} from "../models/user";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import {first} from "rxjs/operators";

export interface CurrentLocation {
  lat: number;
  lon: number;
}

@Injectable()
export class UserSevice {

  private user: User;
  private currentLocation: CurrentLocation;

  private userCollection$: AngularFirestoreCollection<User>;

  constructor(private afs: AngularFirestore) {
    this.userCollection$ = this.afs.collection('users');
  }

  getUser(uid: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.userCollection$.doc(uid).valueChanges().pipe(first()).subscribe((response) => {
        this.user = response as User;
        resolve();
      }, error => reject(error));
    });
  }

  createNewUser(uid: string, user: User): Promise<void> {
    return this.userCollection$.doc(uid).set(user);

  }

  getCurrentUser(): User {
    return this.user;
  }

  isEntitatUser(): boolean {
    return this.user && this.user.roles && this.user.roles.indexOf('entitat') >= 0;
  }

  isSuperUser(): boolean {
    return this.user && this.user.roles && this.user.roles.indexOf('superuser') >= 0;
  }

  setCurrentLocation(currentLocation: CurrentLocation): void {
    this.currentLocation = currentLocation;
  }

  getCurrentLocation(): CurrentLocation {
    return this.currentLocation;
  }

}
