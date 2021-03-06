import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController,ToastController,Platform,Events,MenuController } from 'ionic-angular';
import { ProductcardPage } from '../productcard/productcard';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Appsetting } from '../../providers/appsetting';
import { CardswipePage } from '../cardswipe/cardswipe';
import { ProfilePage } from '../profile/profile';
 import { GenderPage } from '../gender/gender';
import { Media , MediaObject } from '@ionic-native/media';
import {BirthdayPage} from '../birthday/birthday';
import {ConfirmationPage} from '../confirmation/confirmation';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  profile;
  srcImage;length;
  response; IDtobe;profileimage;brandlink:any = 0;


  constructor(public navCtrl: NavController,
    public http: Http,
    public loadingCtrl: LoadingController,
    public appsetting: Appsetting,
    public events: Events,
    public navParams: NavParams,
    public media: Media,
    public platform: Platform,
     public toastCtrl: ToastController,
     public menu: MenuController
  
  ) {
       platform.ready().then(() => {
        var lastTimeBackPress = 0;
        var timePeriodToExit  = 2000;
        platform.registerBackButtonAction(() => {
            let view = this.navCtrl.getActive();
                if (new Date().getTime() - lastTimeBackPress < timePeriodToExit) {
                    this.platform.exitApp(); //Exit from app
                } else {
                    let toast = this.toastCtrl.create({
                        message:  'Press back again to exit from app?',
                        duration: 3000,
                        position: 'bottom'
                    });
                    toast.present();
                    lastTimeBackPress = new Date().getTime();
                }
        });
    });
    this.ionViewDidLoad(); 
    if (this.navParams.get('checkout') == 'yes') {
      console.log('CHECKOUT');
    }

    console.log('YES UPDATED');
    if( localStorage.getItem("USERID")){
      this.image() // if a user is logged in
      this.srcImage = null;
    }

    this.lookbooklist();
    events.subscribe('homepage', (home) => {
      console.log(home);
      clearInterval(this.appsetting.interval);
      this.lookbooklist();
    });
  }
  
  public lookbooklist() {
    clearInterval(this.appsetting.interval);
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    let options = new RequestOptions({ headers: headers });
    var user_id = localStorage.getItem("USERID");
    var postdata = {
      id: user_id
    };
    console.log(postdata);
    var serialized = this.serializeObj(postdata);
    this.http.post(this.appsetting.myGlobalVar + 'lookbooks/listoflookbook', serialized, options).map(res => res.json()).subscribe(data => {
      console.log(data)
      if(data.data){
        this.length = 1;
      for(var i=0;i<data.data.length;i++){
        if(data.data[i].Lookbook.brand){
           console.log(data.data[i].Lookbook.brand.search('http://'));
        var search = data.data[i].Lookbook.brand.search('http://');
        var searchhttps = data.data[i].Lookbook.brand.search('https://');
         if(search >= 0 || searchhttps >= 0){
             data.data[i].Lookbook.brandlink = 1;
            }else{
              data.data[i].Lookbook.brandlink = 0;
            }
        }
      }
      }else{
       this.length = 0;
      }
      this.response = data.data;
      console.log(this.response);
    })
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    this.image();
    this.lookbooklist();
    console.log('refreshed')
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  }


  image() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    let options = new RequestOptions({ headers: headers });
    var user_id = localStorage.getItem("USERID");
    var postdata = {
      id: user_id
    };
    console.log(postdata);
    var serialized = this.serializeObj(postdata);
    this.http.post(this.appsetting.myGlobalVar + 'users/user', serialized, options).map(res => res.json()).subscribe(data => {
      console.log(data)
      if (data.data != null) {
        this.profile = data.data[0].User;
        this.profileimage = this.profile.image;
      }
      console.log(this.profile)
    })
  }
  confirmation(){
 this.navCtrl.push(ConfirmationPage);
  }
  productcardPage(id) {
    var idTobe = id
    console.log(idTobe)
    localStorage.setItem('lookbookid', idTobe)
    this.navCtrl.push(ProductcardPage, { id: idTobe });
  }
  cardswipePage(id) {
    var idTobe = id
    console.log(idTobe)
    localStorage.setItem('lookbookid', idTobe)
    this.navCtrl.push(CardswipePage, { id: idTobe });
  }
  profilePage() {
    this.navCtrl.push(ProfilePage);
  }
    genderPage() {
    this.navCtrl.push(GenderPage);
  }
  serializeObj(obj) {
    var result = [];
    for (var property in obj)
      result.push(encodeURIComponent(property) + "=" + encodeURIComponent(obj[property]));

    return result.join("&");
  }

  ionViewDidLoad() {
    console.log('rahul');
    console.log(window.navigator.onLine);
    if (window.navigator.onLine == true) {
    } else {
      let toast = this.toastCtrl.create({
        message: 'Network connection failed',
        duration: 3000,
        position: 'top'
      });
      toast.present();
    }
    this.menu.swipeEnable(false, 'left');
    this.menu.enable(false, 'left');
  }
}
