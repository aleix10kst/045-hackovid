import {Component, OnInit} from "@angular/core";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/firestore";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Loading, LoadingController} from "ionic-angular";
import {User} from "../../models/user";
import {UserSevice} from "../../services/user.sevice";

@Component({
  selector: 'user-page',
  templateUrl: './user.html'
})
export class UserPage implements OnInit{
  private currentUserDoc: AngularFirestoreDocument<User>;

  form: FormGroup;

  currentUser: string;

  loader: Loading;

  constructor(private afs: AngularFirestore, private fb: FormBuilder, private loadingCtrl: LoadingController, private userService: UserSevice) {
    this.loader = this.loadingCtrl.create({
      content: 'Carregant...'
    });
    this.form = this.fb.group({
      username: ['', Validators.required],
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required]],
      phone: ['', [Validators.required]]
    });
    this.currentUser = this.userService.getCurrentUser().uid;
  }

  ngOnInit(): void {
    this.loader.present();
    this.currentUserDoc = this.afs.doc<User>(`users/${this.currentUser}`);
    this.currentUserDoc.valueChanges().subscribe((user: User) => {
      this.form.patchValue({...user});
      this.loader.dismiss();
    })
  }

  onClickSave(): void {
    this.currentUserDoc.update(this.form.getRawValue());
  }

}
