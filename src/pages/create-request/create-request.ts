import {Component, OnInit} from "@angular/core";
import {ViewController} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LoginService} from "../../services/login.service";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import {Request} from "../../models/request";

@Component({
  templateUrl: './create-request.html'
})
export class CreateRequestPage implements OnInit{

  form: FormGroup;
  private requestsCollection: AngularFirestoreCollection<Request>;

  constructor(public viewCtrl: ViewController, private loginService: LoginService, private afs: AngularFirestore, private fb: FormBuilder) {
    this.form = this.fb.group({
      'title': ['', [Validators.required]],
      'description': ['', [Validators.required]],
      'deliveryDate': [''],
      'lat': ['', [Validators.required]],
      'lon': ['', [Validators.required]]
    })
  }

  ngOnInit(): void {
    this.requestsCollection = this.afs.collection<Request>('/requests');
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const newRequest: Request = {
      ...this.form.getRawValue(),
      createdAt: new Date(),
      createdBy: this.loginService.getCurrentUser().uid,
      status: "pending"
    };
    this.requestsCollection.add(newRequest).then(() => this.viewCtrl.dismiss());
  }

  cancel(): void {
    this.viewCtrl.dismiss();
  }

}
