import { Component, OnInit } from "@angular/core";
import { IonicPage, MenuController } from "ionic-angular";
import { UserProvider } from "../../providers/user/user";
import { CurrentUser } from "../../models/currentUser";
import { EncryptionProvider } from "../../providers/encryption/encryption";
import { DataSetsProvider } from "../../providers/data-sets/data-sets";
import { DataSet } from "../../models/dataSet";
import { SmsGatewayProvider } from "../../providers/sms-gateway/sms-gateway";
import { SmsConfiguration } from "../../models/smsCommand";
import { AppProvider } from "../../providers/app/app";
import { SmsCommandProvider } from "../../providers/sms-command/sms-command";

/**
 * Generated class for the SmsGatewayPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-sms-gateway",
  templateUrl: "sms-gateway.html"
})
export class SmsGatewayPage implements OnInit {
  currentUser: CurrentUser;
  isLoading: boolean;
  loadingMessage: string;

  dataSets: Array<any>;
  gatewayContents: Array<{ id: string; name: string; icon: string }>;
  isGatewayContentOpened: any;
  isSyncActive: boolean;
  smsCommandMapper: any;

  constructor(
    private encryption: EncryptionProvider,
    private appProvider: AppProvider,
    private smsGateway: SmsGatewayProvider,
    private smsCommand: SmsCommandProvider,
    private menu: MenuController,
    private dataSetProvider: DataSetsProvider,
    private userProvider: UserProvider
  ) {
    this.dataSets = [];
  }

  ngOnInit() {
    this.menu.enable(true);
    this.isGatewayContentOpened = {};
    this.smsCommandMapper = {};
    this.isSyncActive = false;
    this.gatewayContents = this.getGatewayContents();
    this.isLoading = true;
    this.loadingMessage = "loading_user_information";
    this.userProvider.getCurrentUser().subscribe((currentUser: CurrentUser) => {
      currentUser.password = this.encryption.decode(currentUser.password);
      this.currentUser = currentUser;
      this.loadingMessage = "loading_entry_forms";
      this.dataSetProvider
        .getAllDataSets(currentUser)
        .subscribe((dataSets: Array<DataSet>) => {
          this.toggleGatewayContents(this.gatewayContents[0]);
          this.smsGateway.getSmsConfigurations(currentUser).subscribe(
            (smsConfigurations: SmsConfiguration) => {
              dataSets.map((dataSet: DataSet) => {
                this.dataSets.push({
                  id: dataSet.id,
                  name: dataSet.name,
                  status:
                    smsConfigurations.dataSetIds.indexOf(dataSet.id) > -1
                      ? true
                      : false
                });
              });
              this.isSyncActive = smsConfigurations.isStarted;
              this.loadingMessage = "loading_sms_commands";
              this.smsCommand.getSmsCommandMapper(this.currentUser).subscribe(
                smsCommandMapper => {
                  if (smsConfigurations.isStarted) {
                    this.smsGateway.startWatchingSms(smsCommandMapper);
                  }
                  this.isLoading = false;
                  this.smsCommandMapper = smsCommandMapper;
                },
                error => {
                  this.isLoading = false;
                  this.appProvider.setNormalNotification(
                    "Fail to load sms commands"
                  );
                }
              );
            },
            error => {
              this.isLoading = false;
              console.log(
                "Error on loading sms configurations " + JSON.stringify(error)
              );
              this.appProvider.setNormalNotification(
                "Fail to load sms configurations"
              );
            }
          );
        });
    });
  }

  toggleGatewayContents(content) {
    if (content && content.id) {
      if (this.isGatewayContentOpened[content.id]) {
        this.isGatewayContentOpened[content.id] = false;
      } else {
        Object.keys(this.isGatewayContentOpened).forEach(id => {
          this.isGatewayContentOpened[id] = false;
        });
        this.isGatewayContentOpened[content.id] = true;
      }
    }
  }

  getGatewayContents() {
    let gatewayContents = [
      { id: "entry_forms", name: "entry_forms", icon: "assets/icon/form.png" }
      // {
      //   id: "program_without_registration",
      //   name: "program_without_registration",
      //   icon: "assets/icon/form.png"
      // }
    ];
    return gatewayContents;
  }

  startOrStopSync() {
    this.isSyncActive = !this.isSyncActive;
    if (this.isSyncActive) {
      this.smsGateway.startWatchingSms(this.smsCommandMapper);
    } else {
      this.smsGateway.stopWatchingSms();
    }
    let dataSetIds = [];
    this.dataSets.map((dataSet: any) => {
      if (dataSet.status) {
        dataSetIds.push(dataSet.id);
      }
    });
    let smsConfigurations: SmsConfiguration = {
      isStarted: this.isSyncActive,
      dataSetIds: dataSetIds
    };
    this.smsGateway
      .setSmsConfigurations(this.currentUser, smsConfigurations)
      .subscribe(
        () => {
          console.log("configurations has been updated");
        },
        error => {
          console.log("Error : " + JSON.stringify(error));
        }
      );
  }
}