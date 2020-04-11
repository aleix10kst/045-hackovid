import {AngularFirestoreCollection} from "@angular/fire/firestore";
import {Request} from "../../../models/request";
import {Observable} from "rxjs";

export abstract class RequestsList {

  protected title: string;
  protected noResults: string;
  protected requestCollection: AngularFirestoreCollection<Request>;
  protected requests: Observable<Request[]>;

  abstract onClickItem(id: string): void;

}
