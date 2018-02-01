import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import {LauncherPage} from "../pages/launcher/launcher";
import {UserProvider} from "../providers/user/user";
import {Subject} from "rxjs";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  activePage = new Subject();

  pages: Array<{ title: string, component: any, active: boolean, icon: string }>;
  logoUrl : string;
  logOutIcon :  string;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,
              private userProvider: UserProvider) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      this.rootPage = LauncherPage;
      splashScreen.hide();
    });

    this.logoUrl = "assets/img/logo.png";
    this.logOutIcon = "assets/img/logo.png";

    this.pages = [
      { title: 'sms_gateway', component: 'HomePage', active: true, icon: 'home' },
    ];

  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
    this.activePage.next(page);
  }

  async logOut(){
    try{
      let user :any = await this.userProvider.getCurrentUser();
      user.isLogin = false;
      this.userProvider.setCurrentUser(user).subscribe(()=>{
        this.nav.setRoot('LoginPage');
      })
    }catch (e){
      console.log(JSON.stringify(e));
    }
  }

}
