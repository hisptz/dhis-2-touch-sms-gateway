import {Component, OnInit} from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import {UserProvider} from "../../providers/user/user";
import {CurrentUser} from "../../models/currentUser";
import {EncryptionProvider} from "../../providers/encryption/encryption";

/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit{

  currentUser : CurrentUser;
  isLoading : boolean;
  loadingMessages : string;

  constructor(private navCtrl: NavController,
              private encryption : EncryptionProvider,
              private userProvider : UserProvider) {
  }

  ngOnInit(){
    this.userProvider.getCurrentUser().then((currentUser: CurrentUser)=>{
      currentUser.password = this.encryption.decode(currentUser.password);
      this.currentUser = currentUser;
    })
  }

  logOut(){
    this.currentUser.isLogin = false;
    this.userProvider.setCurrentUser(this.currentUser).then(()=>{
      this.navCtrl.setRoot('LoginPage');
    });

  }

}
