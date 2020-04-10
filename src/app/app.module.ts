import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

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
import {MyRequestsPage} from "../pages/requests/my-requests";
import {RequestsModule} from "../pages/requests/requests.module";

const firebaseConfig = {

};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    UserPage,
    RegisterPage,
    LoginPage
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    IonicModule.forRoot(MyApp),
    RequestsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    UserPage,
    RegisterPage,
    LoginPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LoginService
  ]
})
export class AppModule {}
