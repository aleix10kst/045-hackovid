import {AngularFirestoreCollection} from "@angular/fire/firestore";
import {Request} from "../../../models/request";
import {Observable} from "rxjs";

export class RequestsList {

  title: string;
  protected requestCollection: AngularFirestoreCollection<Request>;
  protected requests: Observable<Request[]>;

}
