import {Component, OnInit} from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import {BackgroundMode} from "@ionic-native/background-mode";
import {LocalInstanceProvider} from "../../providers/local-instance/local-instance";
import {UserProvider} from "../../providers/user/user";
import {CurrentUser} from "../../models/currentUser";
import {AppTranslationProvider} from "../../providers/app-translation/app-translation";
import {AppProvider} from "../../providers/app/app";
import {SqlLiteProvider} from "../../providers/sql-lite/sql-lite";
import {HttpClientProvider} from "../../providers/http-client/http-client";
import {SettingsProvider} from "../../providers/settings/settings";
import {EncryptionProvider} from "../../providers/encryption/encryption";
import {DataSetsProvider} from "../../providers/data-sets/data-sets";
import {SmsCommandProvider} from "../../providers/sms-command/sms-command";

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage implements OnInit{

  isLocalInstancesListOpen : boolean;
  animationEffect : any;
  logoUrl : string;
  offlineIcon : string;
  cancelLoginProcessData : any = {isProcessActive : false};
  progressTracker : any;
  completedTrackedProcess : any;
  localInstances : any;
  currentUser : CurrentUser;
  currentLanguage : string;
  progressBar : string;
  isLoginProcessActive : boolean;
  hasUserAuthenticated : boolean;
  loggedInInInstance : string;

  constructor(private navCtrl: NavController,
              private localInstanceProvider : LocalInstanceProvider,
              private UserProvider : UserProvider,
              private sqlLite : SqlLiteProvider,
              private HttpClientProvider : HttpClientProvider,
              private appTranslationProvider : AppTranslationProvider,
              private AppProvider : AppProvider,
              private encryption : EncryptionProvider,
              private settingsProvider : SettingsProvider,
              private dataSetsProvider : DataSetsProvider,
              private smsCommandProvider : SmsCommandProvider,
              private backgroundMode : BackgroundMode) {
  }

  ngOnInit(){
    this.isLocalInstancesListOpen = false;
    this.backgroundMode.disable();
    this.animationEffect = {
      loginForm: "animated slideInUp",
      progressBar: "animated fadeIn"
    };
    this.logoUrl = 'assets/img/logo.png';
    this.offlineIcon = "assets/icon/offline.png";
    this.currentUser = {
      serverUrl: "",
      username: "",
      password: "",
      currentLanguage : "en"
    };
    this.cancelLoginProcess(this.cancelLoginProcessData);
    this.progressTracker = {};
    this.completedTrackedProcess = [];
    this.UserProvider.getCurrentUser().then((currentUser: any)=>{
      this.localInstanceProvider.getLocalInstances().then((localInstances : any)=>{
        this.localInstances = localInstances;
        this.setUpCurrentUser(currentUser);
      });
    });
  }

  setUpCurrentUser(currentUser){
    if(currentUser && currentUser.serverUrl){
      if(currentUser.password){
        delete currentUser.password;
      }
      if(!currentUser.currentLanguage){
        currentUser.currentLanguage = "en";
      }
      this.currentUser = currentUser;
    }else{
      this.currentUser.serverUrl = "play.hisptz.org/27";
      this.currentUser.username = "admin";
      this.currentUser.password = "district";
    }
    this.currentLanguage = this.currentUser.currentLanguage;
    this.appTranslationProvider.setAppTranslation(this.currentUser.currentLanguage);
  }

  changeCurrentUser(data){
    if(data && data.currentUser){
      this.setUpCurrentUser(data.currentUser)
    }
    this.toggleLoginFormAndLocalInstances();
  }

  toggleLoginFormAndLocalInstances(){
    this.isLocalInstancesListOpen = !this.isLocalInstancesListOpen;
  }

  updateTranslationLanguage(language : string){
    try{
      this.appTranslationProvider.setAppTranslation(language);
      this.currentLanguage = language;
      this.currentUser.currentLanguage = language;
      this.UserProvider.setCurrentUser(this.currentUser).then(()=>{});
      this.localInstanceProvider.setLocalInstanceInstances(this.localInstances,this.currentUser,this.loggedInInInstance).then(()=>{});
    }catch (e){
      this.AppProvider.setNormalNotification("Fail to set translation ");
      console.log(JSON.stringify(e));
    }
  }

  startLoginProcess() {
    this.hasUserAuthenticated = false;
    this.backgroundMode.enable();
    this.progressBar = "0";
    this.loggedInInInstance = this.currentUser.serverUrl;
    this.isLoginProcessActive = true;
    this.animationEffect.loginForm = "animated fadeOut";
    this.animationEffect.progressBar = "animated fadeIn";
    if(this.currentUser.serverUrl && this.currentUser.username && this.currentUser.password){
      let currentResourceType = "communication";
      this.progressTracker = {};
      let resource = "Authenticating user";
      this.currentUser.serverUrl = this.AppProvider.getFormattedBaseUrl(this.currentUser.serverUrl);
      this.loggedInInInstance = this.currentUser.serverUrl;
      this.reInitiateProgressTrackerObject(this.currentUser);
      this.progressTracker[currentResourceType].message = "establishing_connection_to_server";
      this.UserProvider.authenticateUser(this.currentUser).then((response : any)=>{
        response = this.getResponseData(response);
        this.currentUser = response.user;
        this.loggedInInInstance = this.currentUser.serverUrl;
        if(this.currentUser.serverUrl.split("://").length > 1){
          this.loggedInInInstance = this.currentUser.serverUrl.split("://")[1];
        }
        this.currentUser.authorizationKey = btoa(this.currentUser.username + ':' + this.currentUser.password);
        this.currentUser.currentDatabase = this.AppProvider.getDataBaseName(this.currentUser.serverUrl) + "_"+this.currentUser.username;
        this.reInitiateProgressTrackerObject(this.currentUser);
        this.updateProgressTracker(resource);
        this.UserProvider.setUserData(JSON.parse(response.data)).then(userData=>{
          resource = 'Loading system information';
          if(this.isLoginProcessActive){
            this.progressTracker[currentResourceType].message = "loading_system_information";
            this.HttpClientProvider.get('/api/system/info',this.currentUser).then((response : any)=>{
              this.UserProvider.setCurrentUserSystemInformation(JSON.parse(response.data)).then((dhisVersion : string)=>{
                this.currentUser.dhisVersion = dhisVersion;
                this.updateProgressTracker(resource);
                if(this.isLoginProcessActive){
                  this.progressTracker[currentResourceType].message = "loading_current_user_authorities";
                  this.UserProvider.getUserAuthorities(this.currentUser).then((response:any)=>{
                    this.currentUser.authorities = response.authorities;
                    resource = "Preparing local storage";
                    this.progressTracker[currentResourceType].message = "preparing_local_storage";
                    this.sqlLite.generateTables(this.currentUser.currentDatabase).then(()=>{
                      this.updateProgressTracker(resource);
                      //other process if any
                      this.downloadingDataSets();
                      this.downloadingSmsCommands();

                    }).catch(error=>{
                      this.cancelLoginProcess(this.cancelLoginProcessData);
                      this.AppProvider.setNormalNotification('Fail to prepare local storage');
                      console.error("error : " + JSON.stringify(error));
                    });
                  }).catch(error=>{
                    this.cancelLoginProcess(this.cancelLoginProcessData);
                    this.AppProvider.setNormalNotification('Fail to load user authorities');
                    console.error("error : " + JSON.stringify(error));
                  });
                }
              }).catch(error=>{
                this.cancelLoginProcess(this.cancelLoginProcessData);
                this.AppProvider.setNormalNotification('Fail to load user authorities');
                console.error("error : " + JSON.stringify(error));
              });
            }).catch(error=>{
              this.cancelLoginProcess(this.cancelLoginProcessData);
              this.AppProvider.setNormalNotification('Fail to load system information');
              console.error("error : " + JSON.stringify(error));
            });
          }
        }).catch((error)=>{
          this.cancelLoginProcess(this.cancelLoginProcessData);
          this.AppProvider.setNormalNotification('Fail to save current user information');
          console.error("error : " + JSON.stringify(error));
        });
      }).catch((error: any)=>{
        if (error.status == 0) {
          this.AppProvider.setNormalNotification('Please check your network connectivity');
        } else if (error.status == 401) {
          this.AppProvider.setNormalNotification('You have enter wrong username or password or server address');
        } else if(404){
          console.log(JSON.stringify(error));
          this.AppProvider.setNormalNotification('Please check server address');
        }else if(error.error){
          this.AppProvider.setNormalNotification(error.error);
        }else{
          this.AppProvider.setNormalNotification(JSON.stringify(error));
        }
        this.cancelLoginProcess(this.cancelLoginProcessData);
      })
    }else{
      this.cancelLoginProcess(this.cancelLoginProcessData);
      this.AppProvider.setNormalNotification("Please enter server address, username and password");
    }
  }

  getResponseData(response){
    if(response.data.data){
      return this.getResponseData(response.data);
    }else{
      return response;
    }
  }

  downloadingSmsCommands(){
    if(this.isLoginProcessActive){
      let resource = "smsCommand";
      let currentResourceType = "entryForm";
      this.progressTracker[currentResourceType].message = "loading_sms_commands";
      if(this.completedTrackedProcess.indexOf(resource) > -1){
        this.progressTracker[currentResourceType].message = "sms_commands_have_been_loaded";
        this.updateProgressTracker(resource);
      }else{
        this.smsCommandProvider.getSmsCommandFromServer(this.currentUser).then((smsCommands : any)=>{
          if(this.isLoginProcessActive){
            this.progressTracker[currentResourceType].message = "saving_sms_commands";
            this.smsCommandProvider.savingSmsCommand(smsCommands,this.currentUser.currentDatabase).then(()=>{
              this.progressTracker[currentResourceType].message = "sms_commands_have_been_saved";
              this.updateProgressTracker(resource);
            },error=>{
              this.cancelLoginProcess(this.cancelLoginProcessData);
              console.log(JSON.stringify(error));
              this.AppProvider.setNormalNotification("Fail to save SMS commands");
            });
          }
        },error=>{
          this.cancelLoginProcess(this.cancelLoginProcessData);
          console.log(JSON.stringify(error));
          this.AppProvider.setNormalNotification("Fail to load SMS commands");
        });
      }
    }
  }

  downloadingDataSets(){
    if(this.isLoginProcessActive){
      let resource = 'dataSets';
      let currentResourceType = "entryForm";
      this.progressTracker[currentResourceType].message = "loading_entry_forms";
      if(this.completedTrackedProcess.indexOf(resource) > -1){
        this.progressTracker[currentResourceType].message = "entry_forms_have_been_loaded";
        this.updateProgressTracker(resource);
      }else{
        this.dataSetsProvider.downloadDataSetsFromServer(this.currentUser).then((dataSets: any)=>{
          if(this.isLoginProcessActive){
            this.progressTracker[currentResourceType].message = "saving_entry_forms";
            this.dataSetsProvider.saveDataSetsFromServer(dataSets,this.currentUser).then(()=>{
              this.progressTracker[currentResourceType].message = "entry_form_have_been_saved";
              this.updateProgressTracker(resource);
            },error=>{
              this.cancelLoginProcess(this.cancelLoginProcessData);
              console.log(JSON.stringify(error));
              this.AppProvider.setNormalNotification('Fail to s ave entry form.');
            });
          }
        },error=>{
          this.cancelLoginProcess(this.cancelLoginProcessData);
          console.log(JSON.stringify(error));
          this.AppProvider.setNormalNotification('Fail to load entry form.');
        });
      }
    }
  }

  cancelLoginProcess(data) {
    this.animationEffect.progressBar = "animated fadeOut";
    this.animationEffect.loginForm = "animated fadeIn";
    if(this.currentUser && this.currentUser.serverUrl){
      let url = this.currentUser.serverUrl.split("/dhis-web-commons")[0];
      url = url.split("/dhis-web-dashboard-integration")[0];
      this.currentUser.serverUrl = url;
    }
    setTimeout(() => {
      this.isLoginProcessActive = data.isProcessActive;
    }, 300);
    this.backgroundMode.disable();
  }

  reCheckingAppSetting(currentUser){
    let defaultSetting  = this.settingsProvider.getDefaultSettings();
    this.settingsProvider.getSettingsForTheApp(currentUser).then((appSettings : any)=>{
      if(!appSettings){
        let time = defaultSetting.synchronization.time;
        let timeType = defaultSetting.synchronization.timeType;
        defaultSetting.synchronization.time = this.settingsProvider.getDisplaySynchronizationTime(time,timeType);
        this.settingsProvider.setSettingsForTheApp(currentUser,defaultSetting).then(()=>{},error=>{})
      }
    });
  }

  setLandingPage(currentUser){
    currentUser.isLogin = true;
    this.reCheckingAppSetting(currentUser);
    this.smsCommandProvider.checkAndGenerateSmsCommands(currentUser).then(()=>{
      console.log("Success update");
    }).catch(error=>{
      console.error(JSON.stringify(error));
    });

    currentUser.password = this.encryption.encode(currentUser.password);
    this.localInstanceProvider.setLocalInstanceInstances(this.localInstances,currentUser,this.loggedInInInstance).then(()=>{});
    this.UserProvider.setCurrentUser(currentUser).then(()=>{
      this.navCtrl.setRoot('HomePage');
    });
  }

  resetPassSteps(){
    let noEmptyStep;
    this.progressTracker.communication.passStep.forEach((step : any)=>{
      if(step.name == "organisationUnits"){
        step.hasBeenPassed = false;
        noEmptyStep = step;
      }
    });
    this.progressTracker.communication.passStep = [];
    if(noEmptyStep){
      this.progressTracker.communication.passStep.push(noEmptyStep);
    }
    this.progressTracker.communication.passStepCount = 0;
    let dataBaseStructure =  this.sqlLite.getDataBaseStructure();
    Object.keys(dataBaseStructure).forEach(key=>{
      let table = dataBaseStructure[key];
      if(table.isMetadata && table.resourceType && table.resourceType != ""){
        if(this.progressTracker[table.resourceType]){
          this.progressTracker[table.resourceType].passStepCount = 0;
          this.progressTracker[table.resourceType].message = "";
          this.progressTracker[table.resourceType].passStep.forEach((passStep : any)=>{
            passStep.hasBeenPassed = false;
          })
        }
      }
    });
  }

  reInitiateProgressTrackerObject(user){
    if(user.progressTracker && user.currentDatabase && user.progressTracker[user.currentDatabase]){
      this.progressTracker = user.progressTracker[user.currentDatabase];
      this.resetPassSteps();
    }else if(user.currentDatabase && user.progressTracker){
      this.currentUser.progressTracker[user.currentDatabase] = this.getEmptyProgressTracker();
      this.progressTracker = this.currentUser.progressTracker[user.currentDatabase]
    }else{
      this.currentUser["progressTracker"] = {};
      this.progressTracker = {};
      this.progressTracker = this.getEmptyProgressTracker();
    }
  }

  getEmptyProgressTracker(){
    let dataBaseStructure =  this.sqlLite.getDataBaseStructure();
    let progressTracker = {};
    progressTracker["communication"] = {count : 3,passStep :[],passStepCount : 0, message : ""};
    Object.keys(dataBaseStructure).forEach(key=>{
      let table = dataBaseStructure[key];
      if(table.isMetadata && table.resourceType && table.resourceType !=""){
        if(!progressTracker[table.resourceType]){
          progressTracker[table.resourceType] = {count : 1,passStep :[],passStepCount : 0,message :""};
        }else{
          progressTracker[table.resourceType].count += 1;
        }
      }
    });
    return progressTracker;
  }

  updateProgressTracker(resourceName){
    let dataBaseStructure =  this.sqlLite.getDataBaseStructure();
    let resourceType = "communication";
    if(dataBaseStructure[resourceName]){
      let table = dataBaseStructure[resourceName];
      if(table.isMetadata && table.resourceType){
        resourceType = table.resourceType
      }
    }
    if(this.progressTracker[resourceType].passStep.length == this.progressTracker[resourceType].count){
      this.progressTracker[resourceType].passStep.forEach((passStep:any)=>{
        if(passStep.name == resourceName && passStep.hasBeenDownloaded){
          passStep.hasBeenPassed = true;
        }
      });
    }else{
      this.progressTracker[resourceType].passStep.push({name : resourceName,hasBeenSaved : true,hasBeenDownloaded : true,hasBeenPassed : true});
    }
    this.progressTracker[resourceType].passStepCount = this.progressTracker[resourceType].passStepCount + 1;
    this.currentUser["progressTracker"][this.currentUser.currentDatabase] = this.progressTracker;
    this.UserProvider.setCurrentUser(this.currentUser).then(()=>{});
    this.completedTrackedProcess = this.getCompletedTrackedProcess();
    this.updateProgressBarPercentage();
  }

  updateProgressBarPercentage(){
    let total = 0; let completed = 0;
    Object.keys(this.progressTracker).forEach(key=>{
      let process = this.progressTracker[key];
      completed += process.passStepCount;
      total += process.count;
    });
    let value = (completed/total) * 100;
    this.progressBar = String(value);
    if(completed == total){
      this.setLandingPage(this.currentUser);
    }
  }

  getCompletedTrackedProcess(){
    let completedTrackedProcess = [];
    Object.keys(this.progressTracker).forEach(key=>{
      let process = this.progressTracker[key];
      process.passStep.forEach((passStep : any)=>{
        if(passStep.name && passStep.hasBeenDownloaded){
          if(completedTrackedProcess.indexOf(passStep.name) == -1){
            completedTrackedProcess.push(passStep.name);
          }
        }
      });
    });
    return completedTrackedProcess;
  }

}