import { Component, OnInit } from '@angular/core';
import { IonicPage, MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { CurrentUser } from '../../models/currentUser';
import { EncryptionProvider } from '../../providers/encryption/encryption';
import { DataSetsProvider } from '../../providers/data-sets/data-sets';
import { DataSet } from '../../models/dataSet';
import { SmsGatewayProvider } from '../../providers/sms-gateway/sms-gateway';
import { SmsConfiguration } from '../../models/smsCommand';
import { AppProvider } from '../../providers/app/app';
import { SmsCommandProvider } from '../../providers/sms-command/sms-command';
import { AppTranslationProvider } from '../../providers/app-translation/app-translation';

/**
 * Generated class for the SmsGatewayPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sms-gateway',
  templateUrl: 'sms-gateway.html'
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
  translationMapper: any;
  shouldEnableSYncButton: boolean;

  constructor(
    private encryption: EncryptionProvider,
    private appProvider: AppProvider,
    private smsGateway: SmsGatewayProvider,
    private smsCommand: SmsCommandProvider,
    private menu: MenuController,
    private dataSetProvider: DataSetsProvider,
    private userProvider: UserProvider,
    private appTranslation: AppTranslationProvider
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
    this.translationMapper = {};
    this.shouldEnableSYncButton = false;
    this.appTranslation.getTransalations(this.getValuesToTranslate()).subscribe(
      (data: any) => {
        this.translationMapper = data;
        this.loadingCurrentUserInformation();
      },
      error => {
        this.loadingCurrentUserInformation();
      }
    );
  }

  loadingCurrentUserInformation() {
    let key = 'Discovering current user information';
    this.loadingMessage = this.translationMapper[key]
      ? this.translationMapper[key]
      : key;
    this.userProvider.getCurrentUser().subscribe((currentUser: CurrentUser) => {
      currentUser.password = this.encryption.decode(currentUser.password);
      this.currentUser = currentUser;
      key = 'Discovering entry forms';
      this.loadingMessage = this.translationMapper[key]
        ? this.translationMapper[key]
        : key;
      this.dataSetProvider.getAllDataSets(currentUser).subscribe(
        (dataSets: Array<DataSet>) => {
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
              this.updateSelectedItems();
              this.isSyncActive = smsConfigurations.isStarted;
              key = 'Discovering SMS commands';
              this.loadingMessage = this.translationMapper[key]
                ? this.translationMapper[key]
                : key;
              this.smsCommand.getSmsCommandMapper(this.currentUser).subscribe(
                smsCommandMapper => {
                  if (smsConfigurations.isStarted) {
                    this.smsGateway.startWatchingSms(
                      smsCommandMapper,
                      smsConfigurations,
                      this.currentUser
                    );
                  }
                  this.isLoading = false;
                  this.smsCommandMapper = smsCommandMapper;
                },
                error => {
                  this.isLoading = false;
                  this.appProvider.setNormalNotification(
                    'Fail to discover SMS commands'
                  );
                }
              );
            },
            error => {
              this.isLoading = false;
              console.log(
                'Error on loading sms configurations ' + JSON.stringify(error)
              );
              this.appProvider.setNormalNotification(
                'Fail to discover SMS configurations'
              );
            }
          );
        },
        error => {
          console.log(JSON.stringify(error));
          this.appProvider.setNormalNotification(
            'Fail to discover entry forms'
          );
        }
      );
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

  updateSelectedItems() {
    let result = false;
    this.dataSets.map((dataSet: any) => {
      if (dataSet.status) {
        result = true;
      }
    });
    if (this.shouldEnableSYncButton != result) {
      this.shouldEnableSYncButton = result;
    }
  }

  getGatewayContents() {
    let gatewayContents = [
      { id: 'entry_forms', name: 'Entry forms', icon: 'assets/icon/form.png' }
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
    let dataSetIds = [];
    this.dataSets.map((dataSet: any) => {
      if (dataSet.status) {
        dataSetIds.push(dataSet.id);
      }
    });
    this.smsGateway.getSmsConfigurations(this.currentUser).subscribe(
      (smsConfiguration: SmsConfiguration) => {
        const newSmsConfiguration: SmsConfiguration = {
          dataSetIds: dataSetIds,
          isStarted: this.isSyncActive,
          syncedSMSIds: smsConfiguration.syncedSMSIds
        };
        this.smsGateway
          .setSmsConfigurations(this.currentUser, newSmsConfiguration)
          .subscribe(
            () => {
              if (this.isSyncActive) {
                this.smsGateway.startWatchingSms(
                  this.smsCommandMapper,
                  newSmsConfiguration,
                  this.currentUser
                );
              } else {
                this.smsGateway.stopWatchingSms();
              }
              console.log('configurations has been updated');
            },
            error => {
              console.log('Error : ' + JSON.stringify(error));
            }
          );
      },
      erro => {}
    );
  }

  downloadingSmsCommands() {
    let key = 'Discovering SMS commands';
    this.smsCommand.getSmsCommandFromServer(this.currentUser).subscribe(
      (smsCommands: any) => {
        let key = 'Saving SMS commands';
        this.smsCommand
          .savingSmsCommand(smsCommands, this.currentUser.currentDatabase)
          .subscribe(
            () => {
              key = 'SMS commands have been saved';
            },
            error => {
              console.log(JSON.stringify(error));
              this.appProvider.setNormalNotification(
                'Fail to save SMS commands'
              );
            }
          );
      },
      error => {
        console.log(JSON.stringify(error));
        this.appProvider.setNormalNotification('Fail to discover SMS commands');
      }
    );
  }

  downloadingDataSets() {
    let key = 'Discovering entry forms';
    this.dataSetProvider.downloadDataSetsFromServer(this.currentUser).subscribe(
      (dataSets: any) => {
        key = 'Saving entry forms';
        this.dataSetProvider
          .saveDataSetsFromServer(dataSets, this.currentUser)
          .subscribe(
            () => {
              key = 'Entry forms have been saved';
            },
            error => {
              console.log(JSON.stringify(error));
              this.appProvider.setNormalNotification(
                'Fail to save entry forms'
              );
            }
          );
      },
      error => {
        console.log(JSON.stringify(error));
        this.appProvider.setNormalNotification('Fail to discover entry forms');
      }
    );
  }

  getValuesToTranslate() {
    return [
      'Discovering current user information',
      'Discovering entry forms',
      'Discovering SMS commands'
    ];
  }
}
