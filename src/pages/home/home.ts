import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Alert, AlertController, ModalController, Platform, ToastController} from 'ionic-angular';
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
import {GeolocationPosition, Plugins} from '@capacitor/core';
import {GeoFireClient, GeoQueryDocument} from "geofirex";
import {FirePoint} from "geofirex/dist/client";

const {Geolocation} = Plugins;


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

  constructor(
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private alertCtrl: AlertController,
    private userSevice: UserSevice,
    private platform: Platform,
    private afs: AngularFirestore) {
    this.geo = geofirex.init(firebaseApp);
  }

  ngAfterViewInit(): void {
    this.radius = 10;
    this.markers = [];
  }

  ngOnInit(): void {
    this.requestCollection = this.afs.collection('requests');
    this.canAddRequests = this.userSevice.isSuperUser() || this.userSevice.isEntitatUser();

    this.platform.ready().then(() => {
      Environment.setEnv({
        'API_KEY_FOR_BROWSER_RELEASE': 'XXXXXXXXXXXXXXXXXXXXXXXX',
        'API_KEY_FOR_BROWSER_DEBUG': 'XXXXXXXXXXXXXXXXXXXXXXXXX'
      });
      this.initializeMap();
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
      console.log(requests);
      requests.forEach((request: any) => {
        let iconsrc = "http://cdn.mapmarker.io/api/v1/pin?text=P&size=50&hoffset=1&background=FACF1B";//groc
        if (request.status === "accepted") {
          iconsrc = "http://cdn.mapmarker.io/api/v1/pin?text=A&size=50&hoffset=1&background=598BF7";//blau
        } else if (request.status === "completed") {
          iconsrc = "http://cdn.mapmarker.io/api/v1/pin?text=C&size=50&hoffset=1&background=0EE548";//verd
        }
        let icon = {} as MarkerIcon;
        icon["url"] = iconsrc;
        icon["size"] = {};
        icon["size"]["width"] = 40;
        icon["size"]["height"] = 40;

        let marker = this.map.addMarkerSync({
          icon: icon,
          animation: 'DROP',
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
                    text: 'Accepta la petició',
                    handler: () => {
                      this.requestCollection.doc(this.selectedRequest.uuid).update({
                        status: 'accepted',
                        acceptedBy: this.userSevice.getCurrentUser().uid,
                        acceptedAt: new Date().getTime()
                      }).then(() => {
                        const acceptedRequestToast = this.toastController.create({
                          message: 'Has acceptat la petició.',
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
              alert = this.alertCtrl.create({
                title: this.selectedRequest.title,
                message: this.selectedRequest.description,
                buttons: [
                  {
                    text: 'Completa',
                    handler: () => {
                      this.requestCollection.doc(this.selectedRequest.uuid).update({
                        status: 'completed',
                      }).then(() => {
                        const completedRequestToast = this.toastController.create({
                          message: 'Has completat la petició',
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
                          message: 'Has cancel·lat la petició',
                          duration: 3000
                        });
                        canceledRequestToast.present();
                      })
                    }
                  },
                  {
                    text: 'Tanca'
                  }
                ]
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
    Geolocation.getCurrentPosition().then((position: GeolocationPosition) => {
      this.currentPoint = this.geo.point(position.coords.latitude, position.coords.longitude);
      const mapOptions: GoogleMapOptions = {
        camera: {
          target: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          zoom: 18,
          tilt: 30
        }
      };

      this.map = GoogleMaps.create('map', mapOptions);

      let icon = {} as MarkerIcon;
      icon["size"] = {};
      icon["url"] = 'assets/imgs/myPos.svg';
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

  ngOnDestroy(): void {
    this.map.off(GoogleMapsEvent.MARKER_CLICK);
  }
}
