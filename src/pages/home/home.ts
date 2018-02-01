import {Component, OnInit} from '@angular/core';
import {IonicPage, MenuController} from 'ionic-angular';
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
  loadingMessage : string;

  dataSets : Array<DataSet>;
  gatewayContents : Array<{id :string, name :string, icon :string}>;
  isGatewayContentOpened : any;
  isSyncActive : boolean;

  constructor(private encryption : EncryptionProvider,
              private menu : MenuController,
              private dataSetProvider : DataSetsProvider,
              private userProvider : UserProvider) {
    this.dataSets = [];
  }

  ngOnInit(){
    this.menu.enable(true);
    this.isGatewayContentOpened = {};
    this.isSyncActive = false;
    this.gatewayContents = this.getGatewayContents();
    this.isLoading = true;
    this.loadingMessage = "loading_user_information";
    this.userProvider.getCurrentUser().subscribe((currentUser: CurrentUser)=>{
      currentUser.password = this.encryption.decode(currentUser.password);
      this.currentUser = currentUser;
      this.loadingMessage = "loading_entry_forms";
      this.dataSetProvider.getAllDataSets(currentUser).subscribe((dataSets : Array<DataSet>)=>{
        this.dataSets = dataSets;
        this.toggleGatewayContents(this.gatewayContents[0]);
        this.isLoading = false;
      })
    })
  }

  toggleGatewayContents(content){
    if(content && content.id){
      if(this.isGatewayContentOpened[content.id]){
        this.isGatewayContentOpened[content.id] = false;
      }else{
        Object.keys(this.isGatewayContentOpened).forEach(id=>{
          this.isGatewayContentOpened[id] = false;
        });
        this.isGatewayContentOpened[content.id] = true;
      }
    }
  }

  getGatewayContents(){
    let gatewayContents = [
      {id : 'entry_forms',name : 'entry_forms',icon: 'assets/icon/form.png'},
      {id : 'program_without_registration',name : 'program_without_registration',icon: 'assets/icon/form.png'},
    ];
    return gatewayContents;
  }

  startOrStopSync(){
    this.isSyncActive = !this.isSyncActive;
  }

}
