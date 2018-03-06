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
  isSyncActive: boolean;
  smsCommandMapper: any;
  translationMapper: any;

  constructor(
    private encryption: EncryptionProvider,
    private appProvider: AppProvider,
    private smsGateway: SmsGatewayProvider,
    private smsCommand: SmsCommandProvider,
    private menu: MenuController,
    private dataSetProvider: DataSetsProvider,
    private userProvider: UserProvider,
    private appTranslation: AppTranslationProvider
  ) {}

  ngOnInit() {
    this.menu.enable(true);
    this.isSyncActive = false;
    this.isLoading = true;
    this.translationMapper = {};
    this.smsCommandMapper = {};
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
      if (currentUser.isLogin) {
        this.loadingConfigurationAndStartGateway(currentUser);
      } else {
        this.downloadingSmsCommands();
      }
    });
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
              this.loadingMessage = this.translationMapper[key]
                ? this.translationMapper[key]
                : key;
              this.downloadingDataSets();
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
        this.loadingMessage = this.translationMapper[key]
          ? this.translationMapper[key]
          : key;
        this.dataSetProvider
          .saveDataSetsFromServer(dataSets, this.currentUser)
          .subscribe(
            () => {
              key = 'Entry forms have been saved';
              this.loadingMessage = this.translationMapper[key]
                ? this.translationMapper[key]
                : key;
              key = 'Checking and updating missed SMS commands';
              this.loadingMessage = this.translationMapper[key]
                ? this.translationMapper[key]
                : key;
              this.smsCommand
                .checkAndGenerateSmsCommands(this.currentUser)
                .subscribe(
                  data => {
                    key = 'Updating current user information';
                    this.loadingMessage = this.translationMapper[key]
                      ? this.translationMapper[key]
                      : key;
                    this.currentUser.isLogin = true;
                    this.userProvider
                      .setCurrentUser(this.currentUser)
                      .subscribe(
                        () => {
                          this.smsGateway
                            .getSmsConfigurations(this.currentUser)
                            .subscribe(
                              (smsConfigurations: SmsConfiguration) => {
                                if (smsConfigurations.dataSetIds.length == 0) {
                                  dataSets.map((dataSet: any) => {
                                    if (
                                      smsConfigurations.dataSetIds.indexOf(
                                        dataSet.id
                                      ) == -1
                                    ) {
                                      smsConfigurations.dataSetIds.push(
                                        dataSet.id
                                      );
                                    }
                                  });
                                  this.smsGateway
                                    .setSmsConfigurations(
                                      this.currentUser,
                                      smsConfigurations
                                    )
                                    .subscribe(
                                      () => {
                                        this.loadingConfigurationAndStartGateway(
                                          this.currentUser
                                        );
                                      },
                                      error => {}
                                    );
                                }
                              },
                              error => {
                                this.loadingConfigurationAndStartGateway(
                                  this.currentUser
                                );
                              }
                            );
                        },
                        error => {
                          console.log(JSON.stringify(error));
                          this.appProvider.setNormalNotification(
                            'Fail to update current user information'
                          );
                        }
                      );
                  },
                  error => {
                    console.log(JSON.stringify(error));
                    this.appProvider.setNormalNotification(
                      'Fail to check and update missed SMS commands'
                    );
                  }
                );
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

  loadingConfigurationAndStartGateway(currentUser) {
    let key = 'Discovering SMS configurations';
    this.loadingMessage = this.translationMapper[key]
      ? this.translationMapper[key]
      : key;
    this.smsGateway.getSmsConfigurations(currentUser).subscribe(
      (smsConfigurations: SmsConfiguration) => {
        key = 'Discovering SMS commands';
        this.loadingMessage = this.translationMapper[key]
          ? this.translationMapper[key]
          : key;
        this.smsCommand.getSmsCommandMapper(this.currentUser).subscribe(
          smsCommandMapper => {
            this.smsGateway.startWatchingSms(
              smsCommandMapper,
              smsConfigurations,
              this.currentUser
            );
            this.smsCommandMapper = smsCommandMapper;
            this.isLoading = false;
            this.appProvider.setTopNotification(
              'SMS gatway is now listening for incoming SMS'
            );
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
  }

  getValuesToTranslate() {
    return [
      'Discovering current user information',
      'Discovering entry forms',
      'Discovering SMS commands',
      'Checking and updating missed SMS commands',
      'Updating current user information'
    ];
  }
}
