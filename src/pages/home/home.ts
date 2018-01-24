import {Component, OnInit} from '@angular/core';
import { IonicPage } from 'ionic-angular';
import {UserProvider} from "../../providers/user/user";
import {CurrentUser} from "../../models/currentUser";
import {EncryptionProvider} from "../../providers/encryption/encryption";
import {DataSetsProvider} from "../../providers/data-sets/data-sets";
import {DataSet} from "../../models/dataSet";

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

  dataSets : Array<DataSet>;

  constructor(private encryption : EncryptionProvider,
              private dataSetProvider : DataSetsProvider,
              private userProvider : UserProvider) {
    this.dataSets = [];
  }

  ngOnInit(){
    this.userProvider.getCurrentUser().then((currentUser: CurrentUser)=>{
      currentUser.password = this.encryption.decode(currentUser.password);
      this.currentUser = currentUser;
      this.dataSetProvider.getAllDataSets(currentUser).then((dataSets : Array<DataSet>)=>{
        this.dataSets = dataSets;
      })
    })
  }

}
