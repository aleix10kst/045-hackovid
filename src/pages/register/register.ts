import {Component, OnInit} from "@angular/core";
import {Loading, LoadingController, NavController} from "ionic-angular";
import {HomePage} from "../home/home";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LoginService} from "../../services/login.service";

@Component({
  selector: 'register-page',
  templateUrl: './register.html'
})
export class RegisterPage implements OnInit {

  form: FormGroup;

  private loading: Loading;

  constructor(private navController: NavController, private fb: FormBuilder, private loginService: LoginService, private loadingController: LoadingController) {
    this.loading = this.loadingController.create({
      content: 'Registrant el compte...',
      dismissOnPageChange: true
    })
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      password2: ['', [Validators.required]],
      codiEntitat: ['']
    })
  }

  onClickBackToLogin(): void {
    this.navController.pop();
  }

  onClickRegister(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading.present();
    const {email, password, codiEntitat} = this.form.getRawValue();
    this.loginService.createWithUserEmail(email, password, codiEntitat)
      .then(() => {
        this.loading.dismiss();
        this.navController.setRoot(HomePage);
      })
      .catch((error) => {
        this.loading.dismiss();
        console.error(error);
      });

  }
}
