import {NgModule} from "@angular/core";
import {MyRequestsPage} from "./my-requests";
import {CreatedRequestsTab} from "./components/created-requests";
import {AcceptedRequestsTab} from "./components/accepted-requests";
import {CommonModule} from "@angular/common";
import {IonicPageModule} from "ionic-angular";
import {CompletedRequestsTab} from "./components/completed-requests";
import {StatusPipe} from "./pipes/status.pipe";
import {EditRequestPage} from "./components/edit-request";

@NgModule({
  declarations: [
    MyRequestsPage,
    CreatedRequestsTab,
    AcceptedRequestsTab,
    CompletedRequestsTab,
    EditRequestPage,
    StatusPipe
  ],
  imports: [
    CommonModule,
    IonicPageModule.forChild(MyRequestsPage)
  ],
  entryComponents: [
    MyRequestsPage,
    CreatedRequestsTab,
    AcceptedRequestsTab,
    CompletedRequestsTab,
    EditRequestPage
  ],
  exports: [
    MyRequestsPage
  ]
})
export class RequestsModule {

}
