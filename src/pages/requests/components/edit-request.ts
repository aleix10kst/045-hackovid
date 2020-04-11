import {Component, OnInit} from "@angular/core";
import {NavParams, ViewController} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AngularFirestore, DocumentChangeAction} from "@angular/fire/firestore";
import {Request} from "../../../models/request";
import {first} from "rxjs/operators";

@Component({
  templateUrl: './edit-request.html'
})
export class EditRequestPage implements OnInit{

  form: FormGroup;

  selectedRequest: DocumentChangeAction<Request>;

  constructor(private navParams: NavParams, private viewCtrl: ViewController, private fb: FormBuilder, private afs: AngularFirestore) {}

  ngOnInit(): void {
    const id = this.navParams.get('id');
    this.form = this.fb.group({
      'title': ['', [Validators.required]],
      'description': ['', [Validators.required]],
      'deliveryDate': ['']
    });
    this.afs.collection<Request>('requests', ref => ref.where('uuid', '==', id)).snapshotChanges().pipe(first()).subscribe(([document]: [DocumentChangeAction<Request>]) => {
      this.selectedRequest = document;
      this.form.patchValue(document.payload.doc.data());
    });
  }

  onClickDelete(): void {
    this.afs.collection('requests').doc(this.selectedRequest.payload.doc.id).delete().then(() => {
      this.viewCtrl.dismiss('deleted');
    });
  }

  onClickSave(): void {
    this.afs.collection('requests').doc(this.selectedRequest.payload.doc.id).update({...this.form.getRawValue(), editedAt: new Date().getTime()}).then(() => {
      this.viewCtrl.dismiss('edited');
    });
  }

  onClickDismiss(): void {
    this.viewCtrl.dismiss('canceled');
  }
}
