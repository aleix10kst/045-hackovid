import {Component, OnDestroy, OnInit} from "@angular/core";
import {ViewController} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import {Request} from "../../models/request";
import * as firebaseApp from 'firebase/app';
import * as geofirex from 'geofirex';
import {GeoFireClient} from 'geofirex';
import {UserSevice} from "../../services/user.sevice";
import {GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent, LatLng, MarkerIcon} from "@ionic-native/google-maps";

@Component({
  templateUrl: './create-request.html'
})
export class CreateRequestPage implements OnInit, OnDestroy {

  form: FormGroup;
  private requestsCollection: AngularFirestoreCollection<Request>;
  private map: GoogleMap;
  private chosenCoordinates: {lat: number, lon: number};

  private geofireClient: GeoFireClient;

  constructor(public viewCtrl: ViewController, private userService: UserSevice, private afs: AngularFirestore, private fb: FormBuilder) {

    this.geofireClient = geofirex.init(firebaseApp);

    this.form = this.fb.group({
      'title': ['', [Validators.required]],
      'description': ['', [Validators.required]],
      'deliveryDate': ['']
    })
  }

  ngOnInit(): void {
    this.requestsCollection = this.afs.collection<Request>('/requests');
    this.initalizeMap();
  }

  cancel(): void {
    this.viewCtrl.dismiss('canceled');
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    const newRequest: Request = {
      ...this.form.getRawValue(),
      uuid: `${this.userService.getCurrentUser().uid}-${new Date().getTime()}`,
      location: this.geofireClient.point(this.chosenCoordinates.lat, this.chosenCoordinates.lon),
      createdAt: new Date().getTime(),
      createdBy: this.userService.getCurrentUser().uid,
      status: "pending"
    };
    this.requestsCollection.doc(newRequest.uuid).set(newRequest).then(() => this.viewCtrl.dismiss('created'));
  }

  private initalizeMap(): void {
    const currentLocation = this.userService.getCurrentLocation();
    let mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: currentLocation.lat,
          lng: currentLocation.lon
        },
        zoom: 18,
        tilt: 30
      }
    };
    this.map = GoogleMaps.create('mapRequest', mapOptions);
    let icon = {} as MarkerIcon;
    icon["size"] = {};
    icon["url"] = 'assets/imgs/myPos.svg';
    icon["size"]["width"] = 40;
    icon["size"]["height"] = 40;

    this.map.addMarkerSync({
      icon: icon,
      position: {
        lat: currentLocation.lat,
        lng: currentLocation.lon
      }
    });
    this.map.on(GoogleMapsEvent.MAP_CLICK).subscribe(([latLng]: [LatLng]) => {
      this.chosenCoordinates = {lat: latLng.lat, lon: latLng.lng};
      this.map.clear();
      this.map.addMarker({
        title: '',
        position: {
          lat: latLng.lat,
          lng: latLng.lng
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.map.off(GoogleMapsEvent.MAP_CLICK);
  }
}
