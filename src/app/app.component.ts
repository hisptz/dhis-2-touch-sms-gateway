import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { LauncherPage } from '../pages/launcher/launcher';
import { UserProvider } from '../providers/user/user';
import { Subject } from 'rxjs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  activePage = new Subject();

  pages: Array<{
    title: string;
    component: any;
    icon: string;
  }>;
  logoUrl: string;
  logOutIcon: string;

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private userProvider: UserProvider
  ) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      this.rootPage = LauncherPage;
      splashScreen.hide();
    });

    this.logoUrl = 'assets/img/logo.png';
    this.logOutIcon = 'assets/img/logo.png';

    this.pages = [
      { title: 'sms gateway', component: 'SmsGatewayPage', icon: 'home' },
      { title: 'About', component: 'AboutPage', icon: 'information-circle' },
      { title: 'Settings', component: 'SettingPage', icon: 'construct' }
    ];
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  async logOut() {
    try {
      this.userProvider.getCurrentUser().subscribe(user => {
        user.isLogin = false;
        this.userProvider.setCurrentUser(user).subscribe(() => {
          this.nav.setRoot('LoginPage');
        });
      });
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }
}
