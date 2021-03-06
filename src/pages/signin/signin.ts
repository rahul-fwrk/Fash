import { Component } from '@angular/core';
import { NavController, LoadingController, AlertController,Platform ,ToastController} from 'ionic-angular';
import { SignupPage } from '../signup/signup';
import { ForgetpaswordPage } from '../forgetpasword/forgetpasword';
import { HomePage } from '../home/home';
import { ChangepasswordPage } from '../changepassword/changepassword';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import firebase from 'firebase';
import { Appsetting } from '../../providers/appsetting';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuth } from 'angularfire2/auth';
import { Geolocation } from '@ionic-native/geolocation';
import { TabsPage } from '../tabs/tabs';
import { SportyfyPage } from '../sportyfy/sportyfy';
import { BirthdayPage } from '../birthday/birthday';
import { Firebase } from '@ionic-native/firebase';
import { Diagnostic } from '@ionic-native/diagnostic';


@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html'
})

export class SigninPage {
  User: any; token;
  userProfile: any = null;
  submitted = false;
  public userfbdata: any;
  onSubmit() { this.submitted = true; }
  public value = '';
  public user = '';
  public data = '';
  facebookConnectPlugin: any;

  constructor(public navCtrl: NavController,
    public http: Http,
    public loadingCtrl: LoadingController,
    private facebook: Facebook,
    public platform: Platform,
    public toastCtrl: ToastController,
    public afAuth: AngularFireAuth,
    private geolocation: Geolocation,
    private firebase: Firebase,
    public appsetting: Appsetting,
    public diagnostic: Diagnostic
  ) {
    console.log('updated')
        platform.ready().then(() => {
        var lastTimeBackPress = 0;
        var timePeriodToExit  = 2000;

        platform.registerBackButtonAction(() => {
            // get current active page
            let view = this.navCtrl.getActive();
                if (new Date().getTime() - lastTimeBackPress < timePeriodToExit) {
                    this.platform.exitApp(); //Exit from app
                } else {
                 // alert('Press back again to exit App?');
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
    this.ionViewDidEnter(); 
  }


  public login(form) {
    this.firebase.getToken().then(token => {
        console.log(`The token is ${token}`)
        //  alert(token)
        this.token = token
        console.log('onToken->', this.token);
      }) // save the token server-side and use it to push notifications to this device
      .catch(error => {
        console.error('Error getting token', error)
      });
    this.firebase.onTokenRefresh().subscribe(
      token => {
        console.log(`The new token is ${token}`);
        this.token = token;
        console.log('onTokenRefresh->', this.token);
       // starts here

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let options = new RequestOptions({ headers: headers });
        localStorage.removeItem('fabuser');
         localStorage.removeItem('logIn_role');
        console.log(form.value.password.indexOf(' '));
        if (form.value.password.indexOf(' ') >= 0) {
          let toast = this.toastCtrl.create({
            message: 'Space not allowed',
            duration: 3000,
            position: 'middle'
          });
          toast.present();
        } else {
          var data1 = JSON.stringify({
            email: form.value.email,
            password: form.value.password,
            tokenid: this.token

          });
          console.log(data1);
          var Serialized = this.serializeObj(data1);
          var Loading = this.loadingCtrl.create({
            spinner: 'bubbles',
            showBackdrop: false,
            cssClass: 'loader'
          });
          Loading.present().then(() => {
            this.http.post(this.appsetting.myGlobalVar + 'users/login', data1, options).map(res => res.json()).subscribe(data => {
              Loading.dismiss();

              if (data.error == 0) {
                this.data = data;
                console.log(this.data);
                localStorage.setItem("USER_DATA", JSON.stringify(data));
                localStorage.setItem("swipe_status", JSON.stringify(data.data.User.swipe_status));
                localStorage.setItem('fitting_status', JSON.stringify(data.data.User.fitting_status));
                localStorage.setItem('favourite_status', JSON.stringify(data.data.User.favourite_status));
                var user_id = data.data.User.id;
                console.log(user_id);
                localStorage.setItem("USERID", data.data.User.id);
                localStorage.setItem("swipe_status", data.data.User.swipe_status);
                console.log(localStorage.getItem("USERID"));
                this.geolocation.getCurrentPosition().then((resp) => {
                  console.log(resp)
                  console.log(resp.coords.longitude)
                  headers.append('Content-Type', 'application/json');
                  let options = new RequestOptions({ headers: headers });
                  this.http.post('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + resp.coords.latitude + ',' + resp.coords.longitude + '&key=AIzaSyAy-7ToF2VeQ5l733vRis8gIK0MhCmj53k', options).map(res => res.json()).subscribe(data => {
                    Loading.dismiss();
                    console.log(JSON.stringify(data))
                    console.log(data.results);
                    var address = data.results[0].address_components[0].long_name + ', ' + data.results[0].address_components[1].long_name;
                    //alert(address)
                    for (var i = 0; i < data.results[0].address_components.length; i++) {
                      for (var b = 0; b < data.results[0].address_components[i].types.length; b++) {

                        if (data.results[0].address_components[i].types[b] == "country") {
                          //this is the object you are looking for
                          var country = data.results[0].address_components[i];
                          if(country.short_name){
                            localStorage.setItem('country', country.short_name)
                          }else{
                            localStorage.setItem('country','US')
                          }
                          
                          var autocompleteOptions = {
                            componentRestrictions: { country: country.short_name },
                            types: ['geocode']
                          };
                        }
                        if (data.results[0].address_components[i].types[b] == "administrative_area_level_1") {
                          //this is the object you are looking for
                          var country = data.results[0].address_components[i];
                          localStorage.setItem('city', country.long_name)
                          var autocompleteOptions = {
                            componentRestrictions: { country: country.short_name },
                            types: ['geocode']
                          };
                        }
                      }
                    }

                  })
                }).catch((error) => {
                  console.log('Error getting location', error);
                });
                this.navCtrl.push(TabsPage);

              } else {
                Loading.dismiss();
                let toast = this.toastCtrl.create({
                  message: data.msg,
                  duration: 3000,
                  position: 'middle'
                });
                toast.present();
              }
            })
          })
        }
        //end here
      },
      error => {
        console.error('Error refreshing token', error);
      });
  }

  facebookLogin(): firebase.Promise<any> {
    this.firebase.getToken()
      .then(token => {
        console.log(`The token is ${token}`)
        this.token = token
      }) // save the token server-side and use it to push notifications to this device
      .catch(error => console.error('Error getting token', error));
    this.firebase.onTokenRefresh().subscribe(
      token => {
        console.log(`The new token is ${token}`);
        this.token = token;
      },
      error => {
        console.error('Error refreshing token', error);
      });

    var fabuser = 1;
    localStorage.setItem('fabuser', '1');

    if (this.platform.is('cordova')) {

      return this.facebook.login(['public_profile', 'email']).then(res => {
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
        let options = new RequestOptions({ headers: headers });
        this.http.post(' https://graph.facebook.com/v2.9/' + res.authResponse.userID + '?fields=id,email,name,birthday,locale,age_range,gender,first_name,last_name&access_token=' + res.authResponse.accessToken, options).map(res => res.json()).subscribe(data => {
        this.userfbdata = data;
        localStorage.setItem('userfbdata', JSON.stringify(data))
        })
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        return this.afAuth.auth.signInWithCredential(facebookCredential).then((success) => {
          console.log("Firebase success: " + JSON.stringify(success));
          this.userProfile = success;
          console.log(this.userProfile)
          localStorage.setItem('logIn_role', 'FB');
          localStorage.setItem('User', JSON.stringify(this.userProfile));
          this.User = JSON.parse(localStorage.getItem('User'));
          let headers = new Headers();
          headers.append('Content-Type','application/x-www-form-urlencoded;charset=utf-8');
          let options = new RequestOptions({ headers: headers });
          var data_fb = {
            first_name: this.User.displayName,
            last_name: "",
            email: this.User.email,
            facebook_id: this.User.uid,
            image: this.userProfile.photoURL,
            phone: "",
            dob: "",
            gender: "",
            cards: "",
            address: "",
            tokenid: this.token
          };

          var Serialized = this.serializeObj(data_fb);
          var Loading = this.loadingCtrl.create({
            spinner: 'bubbles',
            showBackdrop: false,
            cssClass: 'loader'
          });
          Loading.present().then(() => {

            this.http.post(this.appsetting.myGlobalVar + 'users/fblogin', Serialized, options)
              .map(res => res.json())
              .subscribe(datares => {
                Loading.dismiss();
                localStorage.setItem("USER_DATA", JSON.stringify(datares))
                localStorage.setItem("swipe_status", JSON.stringify(datares.data.User.swipe_status));
                localStorage.setItem('fitting_status', JSON.stringify(datares.data.User.fitting_status));
                localStorage.setItem('favourite_status', JSON.stringify(datares.data.User.favourite_status));
                localStorage.setItem("USERID", datares.data.User.id)
                this.geolocation.getCurrentPosition().then((resp) => {
                  console.log(resp)
                  console.log(resp.coords.longitude)
                  headers.append('Content-Type', 'application/json');
                  let options = new RequestOptions({ headers: headers });

                  this.http.post('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + resp.coords.latitude + ',' + resp.coords.longitude + '&key=AIzaSyAy-7ToF2VeQ5l733vRis8gIK0MhCmj53k', options).map(res => res.json()).subscribe(data => {
                    console.log(JSON.stringify(data));
                    console.log(data.results);
                    var address = data.results[0].address_components[0].long_name + ', ' + data.results[0].address_components[1].long_name;
                    for (var i = 0; i < data.results[0].address_components.length; i++) {
                      for (var b = 0; b < data.results[0].address_components[i].types.length; b++) {
                        if (data.results[0].address_components[i].types[b] == "country") {
                          //this is the object you are looking for
                          var country = data.results[0].address_components[i];
                         if(country.short_name){
                          localStorage.setItem('country', country.short_name);
                         }else{
                           localStorage.setItem('country','US');
                         }
                          var autocompleteOptions = {
                            componentRestrictions: { country: country.short_name },
                            types: ['geocode']
                          };
                        }
                        if (data.results[0].address_components[i].types[b] == "administrative_area_level_1") {
                          var country = data.results[0].address_components[i];
                          console.log(country.short_name)
                          localStorage.setItem('city', country.long_name);
                          var autocompleteOptions = {
                            componentRestrictions: { country: country.short_name },
                            types: ['geocode']
                          };
                        }
                      }
                    }
                  })
                }).catch((error) => {
                  console.log('Error getting location', error);
                });
                if(datares.data.User.allreadyloggedin == 1){
                  
                }else{
                  this.navCtrl.push(BirthdayPage);
                }
                
              })
          });
        }).catch((error) => {
            console.log("Firebase failure: " + JSON.stringify(error));
            // alert("Firebase failure: " + JSON.stringify(error));

          });
      }).catch((error) => {
        console.log('facebook error');
        console.log(error)
      });
    } else {
      return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()).then((success) => {
        console.log("Firebase success: LOOK HERE " + JSON.stringify(success));
        this.userProfile = success;
        var User = localStorage.getItem('User');
      })
        .catch((error) => {
          console.log("Firebase failure: " + JSON.stringify(error));
        });;
    }
  }

  location() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.diagnostic.switchToLocationSettings();
      this.http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + resp.coords.latitude + ',' + resp.coords.longitude + '&sensor=true').map(res => res.json()).subscribe(data => {
        var address = data.results[0].formatted_address;
        localStorage.setItem('location', address);
        //alert(address)
        for (var i = 0; i < data.results[0].address_components.length; i++) {
          for (var b = 0; b < data.results[0].address_components[i].types.length; b++) {
            if (data.results[0].address_components[i].types[b] == "country") {
              var country = data.results[0].address_components[i];
              console.log(country.short_name)
              if(country.short_name){
                 localStorage.setItem('country', country.short_name);
              }else{
                 localStorage.setItem('country','US');
              }
             
              var autocompleteOptions = {
                componentRestrictions: { country: country.short_name },
                types: ['geocode']
              };
            }
            if (data.results[0].address_components[i].types[b] == "administrative_area_level_1") {
              //this is the object you are looking for
              var country = data.results[0].address_components[i];
              console.log(country.short_name)
              localStorage.setItem('city', country.long_name)
              // alert(localStorage.getItem('city'))
              var autocompleteOptions = {
                componentRestrictions: { country: country.short_name },
                types: ['geocode']
              };
            }
          }
        }
      })
    }).catch((error) => {
      let toast = this.toastCtrl.create({
        message: 'Please enable your location',
        duration: 5000,
        cssClass: 'toastCss',
        position: 'middle',
      });
      toast.present();
      console.log('Error getting location', error);
    });
  }
  skip() {
    this.location();
    this.navCtrl.push(TabsPage);
  }
  serializeObj(obj) {
    var result = [];
    for (var property in obj)
      result.push(encodeURIComponent(property) + "=" + encodeURIComponent(obj[property]));

    return result.join("&");
  }

  signupPage() {
    this.navCtrl.push(SignupPage);
  }
  forgetpaswordPage() {
    this.navCtrl.push(ForgetpaswordPage);
  }
  changepasswordPage() {
    this.navCtrl.push(ChangepasswordPage);
  }
    ionViewDidEnter() {
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

  }
}
