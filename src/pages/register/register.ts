import {Component, OnInit} from "@angular/core";
import {NavController} from "ionic-angular";
import {HomePage} from "../home/home";
import {AngularFireAuth} from "@angular/fire/auth";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import UserCredential = firebase.auth.UserCredential;
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import {User} from "../user/user";

@Component({
  selector: 'register-page',
  templateUrl: './register.html'
})
export class RegisterPage implements OnInit {

  form: FormGroup;

  private userCollection$: AngularFirestoreCollection<User>;

  constructor(private navController: NavController, private afAuth: AngularFireAuth, private fb: FormBuilder, private afs: AngularFirestore) {
    this.userCollection$ = this.afs.collection('users');
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      password2: ['', [Validators.required]],
    })
  }

  onClickBackToLogin(): void {
    this.navController.pop();
  }

  onClickRegister(): void {
    const { email, password } = this.form.getRawValue();
    this.afAuth.auth.createUserWithEmailAndPassword(email, password).then((response: UserCredential) => {
      const user = {email: response.user.email, name: response.user.displayName, uid: response.user.uid};
      this.userCollection$.doc(response.user.uid).set(user);
      this.navController.setRoot(HomePage);
    }).catch((err) => {
      console.error(err);
    })

  }
}
