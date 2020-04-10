import {Component, OnInit} from "@angular/core";
import {ViewController} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LoginService} from "../../services/login.service";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import {Request} from "../../models/request";

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

@Component({
  templateUrl: './create-request.html'
})
export class CreateRequestPage implements OnInit{

  form: FormGroup;
  private requestsCollection: AngularFirestoreCollection<Request>;
  private map: Map;
  private markersLayer:VectorLayer;
  private chosenCoordinates:any;

  constructor(public viewCtrl: ViewController, private loginService: LoginService, private afs: AngularFirestore, private fb: FormBuilder) {
    
    this.form = this.fb.group({
      'title': ['', [Validators.required]],
      'description': ['', [Validators.required]],
      'deliveryDate': ['']
    })
  }

  ngOnInit(): void {
    this.map = new Map({
      target: 'mapSelector',
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
    this.map.on('click', (evt)=> {
        if (this.markersLayer) this.markersLayer.getSource().clear(true);
        this.chosenCoordinates = evt.coordinate;
        alert("You clicked near LON " + this.chosenCoordinates[0] + ", LAT: "+ this.chosenCoordinates[1] + " E");
        var iconFeature = new Feature({
            geometry: new Point(this.chosenCoordinates)
        });
        var iconStyle = new Style({
            image: new Icon(({
                anchor: [0.5, 1],
                src: "http://cdn.mapmarker.io/api/v1/pin?text=P&size=50&hoffset=1"
            }))
        });

        iconFeature.setStyle(iconStyle);
        this.markersLayer = new VectorLayer({
          source: new VectorSource({
              features: [iconFeature]
          })
        });
    });

    this.requestsCollection = this.afs.collection<Request>('/requests');
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const newRequest: Request = {
      //TODO:: CAMBIAR EL LOCATION PER LA GEOLOCATION AQUELLA?
      ...this.form.getRawValue(),
      location: this.chosenCoordinates,
      createdAt: new Date(),
      createdBy: this.loginService.getCurrentUser().uid,
      status: "pending"
    };
    this.requestsCollection.add(newRequest).then(() => this.viewCtrl.dismiss('created'));
  }

  cancel(): void {
    this.viewCtrl.dismiss('canceled');
  }

}
