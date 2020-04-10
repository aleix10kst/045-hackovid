import {Component, OnInit} from '@angular/core';
import {ModalController, ToastController} from 'ionic-angular';
import {CreateRequestPage} from "../create-request/create-request";
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import {defaults as defaultControls, OverviewMap} from 'ol/control';
import {interaction as defaultInteractions} from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Circle as CircleStyle, Fill, Stroke, Style, Text, Icon} from 'ol/style';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';

import {AngularFirestore} from "@angular/fire/firestore";
import {AngularFirestoreCollection} from "@angular/fire/firestore";
import {Request} from "../../models/request";
import {Observable} from "rxjs";



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  private map: Map;
  private markersLayer: VectorLayer;
  private selectedRequest: any;
  protected requestCollection: AngularFirestoreCollection<Request>;
  protected requests: Observable<Request[]>;

  constructor(private modalCtrl: ModalController, private toastController: ToastController, private afs: AngularFirestore) {
  }

  ngOnInit(): void {

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
        center: [313986.42, 5158087.34],
        zoom: 14
      })
    });


    this.markersLayer = new VectorLayer({
        source: new VectorSource({
            features: []
        })
    });
    this.map.addLayer(this.markersLayer);


    this.afs.collection('requests').valueChanges().subscribe((requests:Request[])=>{
        let features = [];
        for (var i in requests){
            let req = requests[i];
            console.log(req)
            /*var longitude = req.location;
            var latitude = req.location;*/

            var iconFeature = new Feature({
                geometry: new Point(this.randomGeo(313986.42, 5158087.34))
            });

            var iconStyle = new Style({
                image: new Icon(({
                    anchor: [0.5, 1],
                    src: "http://cdn.mapmarker.io/api/v1/pin?text=P&size=50&hoffset=1"
                }))
            });

            iconFeature.setStyle(iconStyle);
            iconFeature["request"] = req;
            features.push(iconFeature);
        }
        this.markersLayer.getSource().clear(true);
        this.markersLayer.getSource().addFeatures(features);
    });

    
    this.map.on('click', (evt)=> {
        var feature = this.map.forEachFeatureAtPixel(evt.pixel, function(feature) {
          return feature;
        });
        console.log(feature);
        if (feature && feature["request"]) this.selectedRequest = feature["request"];
        else this.selectedRequest = null;
    });
  }


  onClickAddRequest(): void {
    const modal = this.modalCtrl.create(CreateRequestPage);
    modal.present();
    modal.onDidDismiss((action) => {
      switch (action) {
        case 'created':
          const toast = this.toastController.create({
            message: `La teva petició s'ha creat correctament.`,
            duration: 3000
          });
          toast.present();
          break;
        case 'canceled':
          break;
      }

    });
  }

  randomGeo(lon, lat) {
      var u = Math.random();

      if (u < 0.5)
        return [ lon - Math.random()*1000 ,  lat - Math.random()*1000] 
      else 
        return [ lon + Math.random()*1000 ,  lat + Math.random()*1000] 
  }

}
