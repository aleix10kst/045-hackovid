import {Component, OnInit} from "@angular/core";
import {NavController} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HomePage} from "../home/home";
import {RegisterPage} from "../register/register";
import {AngularFireAuth} from "@angular/fire/auth";
import firebase from "firebase";
import {LoginService} from "../../services/login.service";

@Component({
  selector: 'login-page',
  templateUrl: './login.html'
})
export class LoginPage implements OnInit{

  form: FormGroup;

  showError: boolean = false;
  errorMessage: string;

  constructor(private navController: NavController, private fb: FormBuilder, private afAuth: AngularFireAuth, private loginService: LoginService) {
    this.form = this.fb.group({
      'email': ['', [Validators.required]],
      'password': ['', [Validators.required]]
    })
  }

  ngOnInit(): void {

  }

  onClickLoginWithSocialProvider(provider: 'google' | 'facebook'): void {
    let authProvider = null;
    switch (provider) {
      case "google":
        authProvider = new firebase.auth.GoogleAuthProvider();
        break;
      case "facebook":
        authProvider = new firebase.auth.FacebookAuthProvider();
        break;
    }
    this.afAuth.auth.signInWithRedirect(authProvider).then(() => {
      this.navController.setRoot(HomePage);
    }).catch(() => {
      console.error('Error al fer social login');
    });
  }

  onClickLogin(): void {
    if (this.form.invalid) {
      return;
    }
    const {email, password} = this.form.getRawValue();
    this.loginService.loginWithEmail(email, password).then(() => {
      this.navController.setRoot(HomePage);
    })
      .catch(({code, message}) => {
        if (code === 'auth/user-not-found') {
          this.showError = !this.showError;
          this.errorMessage = `Aquest compte no està donat d'alta al sistema`;
          setTimeout(() => {
            this.showError = !this.showError;
            this.errorMessage = '';
          }, 3000)
        }
      });
  }

  onClickRegistra(): void {
    this.navController.push(RegisterPage);
  }
}
