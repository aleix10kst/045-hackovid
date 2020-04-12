import {Component, OnInit} from "@angular/core";
import {Loading, LoadingController, NavController} from "ionic-angular";
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
export class LoginPage implements OnInit {

  form: FormGroup;

  showError: boolean = false;
  errorMessage: string;

  private loading: Loading;

  constructor(private navController: NavController, private fb: FormBuilder, private afAuth: AngularFireAuth, private loginService: LoginService, private loadingController: LoadingController) {
    this.loading = this.loadingController.create({
      content: 'Accedint...'
    });
    this.form = this.fb.group({
      'email': ['', [Validators.required]],
      'password': ['', [Validators.required]]
    });
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
    this.loading.present();
    this.loginService.loginWithEmail(email, password).then(() => {
      this.loading.dismiss();
      this.navController.setRoot(HomePage);
    })
      .catch(({code, message}) => {
        this.loading.dismiss();
        let errorMessage: string;
        switch(code) {
          case 'auth/user-not-found':
            errorMessage = `Aquest compte no està donat d'alta al sistema`;
            break;
          case 'auth/wrong-password':
            errorMessage = `La contrasenya no és correcta.`;
            break;
        }
        this.displayError(errorMessage);
      });
  }

  onClickRegistra(): void {
    this.navController.push(RegisterPage);
  }

  private displayError(message: string): void {
    this.showError = !this.showError;
    this.errorMessage = message;
    setTimeout(() => {
      this.showError = !this.showError;
      this.errorMessage = '';
    }, 3000)
  }
}
