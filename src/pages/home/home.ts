import {Component} from '@angular/core';
import {ModalController, ToastController} from 'ionic-angular';
import {CreateRequestPage} from "../create-request/create-request";
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import {defaults as defaultControls, OverviewMap} from 'ol/control';
import {interaction as defaultInteractions} from 'ol/interaction';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  private map:Map;
  constructor(public navCtrl: NavController, private afAuth: AngularFireAuth) {

  constructor(private modalCtrl: ModalController, private toastController: ToastController) {
  }

  ngOnInit(): void {
    this.afAuth.auth.onAuthStateChanged((response: User) => {
      console.log(response);
    })

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        })
      ],
      view: new View({
        center: [ 313986.42 , 5158087.34 ],
        zoom: 14
      })
    });



  onClickAddRequest(): void {
    const modal = this.modalCtrl.create(CreateRequestPage);
    modal.present();
    modal.onDidDismiss(() => {
      const toast = this.toastController.create({
        message: `La teva petició s'ha creat correctament.`,
        duration: 3000
      });
      toast.present();
    });
  }
}
