import {Component, OnInit} from "@angular/core";
import {ViewController} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {LoginService} from "../../services/login.service";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import {Request} from "../../models/request";
import Geolocation from 'ol/Geolocation';

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
    this.markersLayer = new VectorLayer({
      source: new VectorSource({
          features: []
      })
    });
    this.map.addLayer(this.markersLayer);
    this.map.on('click', (evt)=> {
        this.markersLayer.getSource().clear(true);
        this.chosenCoordinates = evt.coordinate;
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
        this.markersLayer.getSource().addFeatures([iconFeature]);
        
    });
    let firstTime = true;

    var geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      tracking:true,
      trackingOptions: {
        enableHighAccuracy: true,
        maximumAge:2000
      },
      projection: this.map.getView().getProjection()
    });

    geolocation.on('change', ()=>{
      
        var pos = geolocation.getPosition();
        if (firstTime){
          firstTime = false;
          this.center(pos[0],pos[1]);
        }
        this.addMarkerPosition('myPos', pos[0], pos[1], 'assets/imgs/myPos.svg');
    })

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

  addMarkerPosition(name, lng, lat, img) {
    let style = new Icon({
        src: img,
        scale: 1,
        rotation: 0,
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 1
    })
    var feature = new Feature({
        geometry: new Point([lng, lat]),
    })

    feature.set('name', name)

    feature.setStyle(new Style({
        image: style
    }))
    var layer = new VectorLayer({
        source: new VectorSource({
            features: [feature]
        })
    })
    layer.set('name', name)
    layer.setZIndex(10)
    this.map.addLayer(layer);
}

center(lon, lat) {
    let feature = new Feature({
        geometry: new Point([lon, lat]),
    });
    this.map.getView().fit(feature.getGeometry());
    this.map.getView().setZoom(14);
  }

}
