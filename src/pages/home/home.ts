import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Alert, AlertButton, AlertController, ModalController, Platform, ToastController} from 'ionic-angular';
import {CreateRequestPage} from "../create-request/create-request";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import {Request} from "../../models/request";
import {UserSevice} from "../../services/user.sevice";
import * as firebaseApp from 'firebase/app';
import * as geofirex from 'geofirex';
import {
  Environment,
  GoogleMap,
  GoogleMapOptions,
  GoogleMaps,
  GoogleMapsEvent,
  ILatLng,
  Marker,
  MarkerIcon
} from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation';
import {GeoFireClient, GeoQueryDocument} from "geofirex";
import {FirePoint} from "geofirex/dist/client";
import { Subscription } from 'rxjs';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {

  canAddRequests: boolean;
  protected radius: number;
  private requestCollection: AngularFirestoreCollection<Request>;
  private selectedRequest: Request;
  private geo: GeoFireClient;
  private map: GoogleMap;
  private currentPoint: FirePoint;
  private markers: Marker[];
  private markerPosition: Marker;
  private geolocationSubscription:Subscription;
  private interval:any;

  constructor(
    private geolocation: Geolocation,
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private alertCtrl: AlertController,
    private userSevice: UserSevice,
    private platform: Platform,
    private afs: AngularFirestore) {
    this.geo = geofirex.init(firebaseApp);
  }

  ngAfterViewInit(): void {
    this.radius = 5;
    this.markers = [];
  }

  ngOnInit(): void {
    this.requestCollection = this.afs.collection('requests');
    this.canAddRequests = this.userSevice.isSuperUser() || this.userSevice.isEntitatUser();

    this.platform.ready().then(() => {
      Environment.setEnv({
        'API_KEY_FOR_BROWSER_RELEASE': 'XXXXXXXXXXXXXXXXXXXXXXXX',
        'API_KEY_FOR_BROWSER_DEBUG': 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      });
      this.initializeMap();
      this.subscriptions();
    });
  }


  onClickAddRequest(): void {
    const modal = this.modalCtrl.create(CreateRequestPage);
    modal.present();
    modal.onDidDismiss((action) => {
      switch (action) {
        case 'created':
          const toast = this.toastController.create({
            message: `El teu encàrrec s'ha creat correctament.`,
            duration: 3000
          });
          toast.present();
          break;
        case 'canceled':
          break;
      }

    });
  }

  updateMarkerPosition(lng, lat) {
    let ltlng = {} as ILatLng;
    ltlng["lat"] = lat;
    ltlng["lng"] = lng;
    this.markerPosition.setPosition(ltlng);
  }

  center(lng, lat) {
    let ltlng = {} as ILatLng;
    ltlng["lat"] = lat;
    ltlng["lng"] = lng;
    this.map.setCameraTarget(ltlng);
  }

  valueChanged() {
    this.paintMap();
  }

  paintMap() {
    this.geo.query('requests').within(this.currentPoint, this.radius, 'location').subscribe((requests: GeoQueryDocument[]) => {
      this.clearMarkers();
      requests.forEach((request: any) => {
        let iconsrc = "../../assets/imgs/pinYellow.png";//groc
        if (request.status === "accepted") {
          iconsrc = "../../assets/imgs/pinBlue.png";//blau
        } else if (request.status === "completed") {
          iconsrc = "../../assets/imgs/pinGreen.png";//verd
        }
        let icon = {} as MarkerIcon;
        icon["url"] = iconsrc;
        icon["size"] = {};
        icon["size"]["width"] = 40;
        icon["size"]["height"] = 40;

        let marker = this.map.addMarkerSync({
          icon: icon,
          position: {
            lat: request.location.geopoint.latitude,
            lng: request.location.geopoint.longitude
          }
        });
        marker["request"] = request;
        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(([,marker]) => {
          this.selectedRequest = marker["request"];
          let alert: Alert;
          switch (this.selectedRequest.status) {
            case 'pending':
              alert = this.alertCtrl.create({
                title: this.selectedRequest.title,
                message: this.selectedRequest.description,
                buttons: [
                  {
                    text: 'Cancel·la'
                  },
                  {
                    text: 'Accepta l\'encàrrec',
                    handler: () => {
                      this.requestCollection.doc(this.selectedRequest.uuid).update({
                        status: 'accepted',
                        acceptedBy: this.userSevice.getCurrentUser().uid,
                        acceptedAt: new Date().getTime()
                      }).then(() => {
                        const acceptedRequestToast = this.toastController.create({
                          message: 'Has acceptat l\'encàrrec.',
                          duration: 3000
                        });
                        acceptedRequestToast.present();
                      });
                    }
                  }
                ]
              });
              alert.present();
              break;
            case 'accepted':
              let acceptButtons: AlertButton[] = [{
                text: 'Tanca'
              }];
              if (this.selectedRequest.acceptedBy === this.userSevice.getCurrentUser().uid) {
                acceptButtons.unshift(
                  {
                    text: 'Completa',
                    handler: () => {
                      this.requestCollection.doc(this.selectedRequest.uuid).update({
                        status: 'completed',
                      }).then(() => {
                        const completedRequestToast = this.toastController.create({
                          message: 'Has completat l\'encàrrec',
                          duration: 3000
                        });
                        completedRequestToast.present();
                      })
                    }
                  },
                  {
                    text: 'Rebutja',
                    handler: () => {
                      this.requestCollection.doc(this.selectedRequest.uuid).update({
                        status: 'pending',
                        acceptedBy: null,
                        acceptedAt: null
                      }).then(() => {
                        const canceledRequestToast = this.toastController.create({
                          message: 'Has cancel·lat l\'encàrrec',
                          duration: 3000
                        });
                        canceledRequestToast.present();
                      })
                    }
                  }
                )
              }
              alert = this.alertCtrl.create({
                title: this.selectedRequest.title,
                message: this.selectedRequest.description,
                buttons: acceptButtons
              });
              alert.present();
              break;
          }
        });
        this.markers.push(marker);
      })
    });
  }


  // Sets the map on all markers in the array.
  setMapOnAll(map) {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].remove();
    }
  }

  // Removes the markers from the map, but keeps them in the array.
  clearMarkers() {
    this.setMapOnAll(null);
  }

  // Deletes all markers in the array by removing references to them.
  deleteMarkers() {
    this.clearMarkers();
    this.markers = [];
  }

  private initializeMap(): void {
    this.geolocation.getCurrentPosition().then((position: Position) => {
      this.currentPoint = this.geo.point(position.coords.latitude, position.coords.longitude);
      this.userSevice.setCurrentLocation({lat: position.coords.latitude, lon: position.coords.longitude});
      const mapOptions: GoogleMapOptions = {
        camera: {
          target: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          zoom: 15,
          tilt: 30
        }
      };

      this.map = GoogleMaps.create('map', mapOptions);

      let icon = {} as MarkerIcon;
      icon["size"] = {};
      icon["url"] = '../../assets/imgs/myPos.png';
      icon["size"]["width"] = 40;
      icon["size"]["height"] = 40;

      this.markerPosition = this.map.addMarkerSync({
        icon: icon,
        position: {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
      });
      this.paintMap();
    });
  }

  private subscriptions(){

    this.geolocationSubscription =
      this.geolocation.watchPosition().subscribe(position => {
        this.userSevice.setCurrentLocation({lat: position.coords.latitude, lon: position.coords.longitude});
        this.currentPoint = this.geo.point(position.coords.latitude, position.coords.longitude);
        this.updateMarkerPosition( position.coords.longitude, position.coords.latitude);
      });
    this.interval = setInterval(()=>{
      this.paintMap();
    },60000)
  }

  ngOnDestroy(): void {
    this.map.off(GoogleMapsEvent.MARKER_CLICK);
    this.geolocationSubscription.unsubscribe();
    clearInterval(this.interval);
  }
}
