import {Component, OnInit} from "@angular/core";
import {NavController} from "ionic-angular";
import {HomePage} from "../home/home";
import {AngularFireAuth} from "@angular/fire/auth";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AngularFirestore} from "@angular/fire/firestore";
import {LoginService} from "../../services/login.service";

@Component({
  selector: 'register-page',
  templateUrl: './register.html'
})
export class RegisterPage implements OnInit {

  form: FormGroup;


  constructor(private navController: NavController, private afAuth: AngularFireAuth, private fb: FormBuilder, private afs: AngularFirestore, private loginService: LoginService) {
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
    const {email, password, codiEntitat} = this.form.getRawValue();
    this.loginService.createWithUserEmail(email, password, codiEntitat)
      .then(() => {
        this.navController.setRoot(HomePage);
      })
      .catch((error) => {
        console.error(error);
      });

  }
}
