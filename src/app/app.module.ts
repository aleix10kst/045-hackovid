import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import {AngularFirestoreModule} from "@angular/fire/firestore";
import {AngularFireModule} from "@angular/fire";
import {UserPage} from "../pages/user/user";
import {ReactiveFormsModule} from "@angular/forms";
import {LoginPage} from "../pages/login/login";
import {RegisterPage} from "../pages/register/register";
import {AngularFireAuthModule} from "@angular/fire/auth";
import {LoginService} from "../services/login.service";
import {RequestsModule} from "../pages/requests/requests.module";
import {CreateRequestPage} from "../pages/create-request/create-request";
import {UserSevice} from "../services/user.sevice";
import { Geolocation } from '@ionic-native/geolocation';
import {NotaLegalModule} from "../pages/nota-legal/nota-legal.module";

const firebaseConfig = {
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    UserPage,
    RegisterPage,
    LoginPage,
    CreateRequestPage
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    RequestsModule,
    NotaLegalModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    UserPage,
    RegisterPage,
    LoginPage,
    CreateRequestPage
  ],
  providers: [
    Geolocation,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LoginService,
    UserSevice
  ]
})
export class AppModule {}
