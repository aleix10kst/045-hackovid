import {Component, OnInit, AfterViewInit} from '@angular/core';
import {Alert, AlertController, ModalController, ToastController} from 'ionic-angular';
import {CreateRequestPage} from "../create-request/create-request";
import {AngularFirestore, AngularFirestoreCollection} from "@angular/fire/firestore";
import {Request} from "../../models/request";
import {UserSevice} from "../../services/user.sevice";
import * as firebaseApp from 'firebase/app';
import { Platform } from 'ionic-angular';
import * as geofirex from 'geofirex';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  Marker,
  Environment,
  ILatLng,
  MarkerIcon
} from '@ionic-native/google-maps';
import { Plugins } from '@capacitor/core';
const { Geolocation } = Plugins;



@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, AfterViewInit {

  private requestCollection: AngularFirestoreCollection<Request>;
  private selectedRequest: Request;
  private geo: any;
  private map: GoogleMap;
  protected radius: number;
  private currentPoint: any;
  private markers:Marker[];

  private markerPosition: Marker;

  canAddRequests: boolean;

  constructor(
    private modalCtrl: ModalController,
    private toastController: ToastController,
    private alertCtrl: AlertController,
    private userSevice: UserSevice,
    private platform: Platform,
    private afs: AngularFirestore) {
      this.geo = geofirex.init(firebaseApp);
  }

  ngAfterViewInit():void{
    this.radius = 10;
    this.markers = [];
  }

  ngOnInit(): void {
    this.platform.ready().then(()=>{
      Environment.setEnv({
        'API_KEY_FOR_BROWSER_RELEASE': 'XXXXXXXXXXXXXXXXXXXXXXXX',
        'API_KEY_FOR_BROWSER_DEBUG': 'XXXXXXXXXXXXXXXXXXXXXXXXX'
      });
  
  
      let firstTime = true;
      this.requestCollection = this.afs.collection('requests');
      this.canAddRequests = this.userSevice.isSuperUser() || this.userSevice.isEntitatUser();
  
      let mapOptions: GoogleMapOptions = {
        camera: {
           target: {
             lat: 43.0741904,
             lng: 2
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
            lat: 43.0741904,
            lng: 2
          }
      });
  
      Geolocation.watchPosition({}, (position, err) => {
          if (firstTime){
            firstTime = false;
            this.center(position.coords.longitude,position.coords.latitude);
          }
          this.updateMarkerPosition(position.coords.longitude,position.coords.latitude);
          this.currentPoint = this.geo.point(position.coords.longitude,position.coords.latitude);
          this.paintMap();
      });
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
      return [lon - Math.random() * 1000, lat - Math.random() * 1000];
    else
      return [lon + Math.random() * 1000, lat + Math.random() * 1000]
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

    valueChanged($event){
      this.paintMap();
    }


    paintMap(){
      let point = this.currentPoint;
      if (!point){
        let coordsConverted = [2, 41];
        this.currentPoint = this.geo.point(coordsConverted[0],coordsConverted[1]);
        point = this.currentPoint;
      }
      this.geo.query('requests').within(point, this.radius, 'location').subscribe((requests: Request[]) => {
          for (var i in requests) {
                let req = requests[i];
                let iconsrc = "http://cdn.mapmarker.io/api/v1/pin?text=P&size=50&hoffset=1&background=FACF1B";//groc
                if (req.status === "accepted"){
                  iconsrc = "http://cdn.mapmarker.io/api/v1/pin?text=A&size=50&hoffset=1&background=598BF7";//blau
                }else if (req.status ===  "completed"){
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
                    lat: req.location.geopoint.latitude,
                    lng: req.location.geopoint.longitude
                  }
                });
                marker["request"]=req;
                marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe((marker)=>{
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
                            text: 'Tanca'
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
                          }
                        ]
                      });
                      alert.present();
                      break;
                  }
                })
                this.markers.push(marker);
            }
        });
    }



    // Sets the map on all markers in the array.
    setMapOnAll(map) {
      for (var i = 0; i < this.markers.length; i++) {
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


}
