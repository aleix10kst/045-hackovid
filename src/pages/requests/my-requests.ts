import {Component} from "@angular/core";
import {CreatedRequestsTab} from "./components/created-requests";
import {AcceptedRequestsTab} from "./components/accepted-requests";

@Component({
  selector: 'my-requests',
  templateUrl: './my-requests.html'
})
export class MyRequestsPage {

  createdRequestsTab: any;
  acceptedRequestsTab: any;

  constructor() {
    this.createdRequestsTab = CreatedRequestsTab;
    this.acceptedRequestsTab = AcceptedRequestsTab;
  }

}
