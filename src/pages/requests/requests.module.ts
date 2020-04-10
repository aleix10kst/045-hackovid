import {NgModule} from "@angular/core";
import {MyRequestsPage} from "./my-requests";
import {CreatedRequestsTab} from "./components/created-requests";
import {AcceptedRequestsTab} from "./components/accepted-requests";
import {CommonModule} from "@angular/common";
import {IonicPageModule} from "ionic-angular";

@NgModule({
  declarations: [
    MyRequestsPage,
    CreatedRequestsTab,
    AcceptedRequestsTab
  ],
  imports: [
    CommonModule,
    IonicPageModule.forChild(MyRequestsPage)
  ],
  entryComponents: [
    MyRequestsPage,
    CreatedRequestsTab,
    AcceptedRequestsTab
  ],
  exports: [
    MyRequestsPage
  ]
})
export class RequestsModule {

}
