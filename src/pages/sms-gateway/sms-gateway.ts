import { Component, OnInit } from '@angular/core';
import { IonicPage, MenuController } from 'ionic-angular';
import { UserProvider } from '../../providers/user/user';
import { CurrentUser } from '../../models/currentUser';
import { EncryptionProvider } from '../../providers/encryption/encryption';
import { DataSetsProvider } from '../../providers/data-sets/data-sets';
import { DataSet } from '../../models/dataSet';
import { SmsGatewayProvider } from '../../providers/sms-gateway/sms-gateway';
import { SmsConfiguration, SmsGateWayLogs } from '../../models/smsCommand';
import { AppProvider } from '../../providers/app/app';
import { SmsCommandProvider } from '../../providers/sms-command/sms-command';
import { AppTranslationProvider } from '../../providers/app-translation/app-translation';
import { AppPermissionProvider } from '../../providers/app-permission/app-permission';
import { ApplicationState } from '../../store/reducers';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import * as logsSelectors from '../../store/selectors/smsGatewayLogs.selectors';
import * as logsActions from '../../store/actions/smsGatewayLogs.action';
import * as _ from 'lodash';

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
  icons: any;
  currentFilter: string;
  //observer
  allSmsLogs$: Observable<Array<SmsGateWayLogs>>;

  constructor(
    private encryption: EncryptionProvider,
    private appProvider: AppProvider,
    private smsGateway: SmsGatewayProvider,
    private smsCommand: SmsCommandProvider,
    private menu: MenuController,
    private dataSetProvider: DataSetsProvider,
    private userProvider: UserProvider,
    private appTranslation: AppTranslationProvider,
    private appPermisssion: AppPermissionProvider,
    private store: Store<ApplicationState>
  ) {
    this.currentFilter = 'all';
    this.allSmsLogs$ = store.select(logsSelectors.getCurrentSmsGatewayLogs);
    this.icons = {
      danger: 'assets/icon/danger.png',
      logs: 'assets/icon/logs.png',
      info: 'assets/icon/info.png',
      irrelevant: 'assets/icon/irrelevant.png',
      warning: 'assets/icon/warning.png'
    };
  }

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

  viewLogsByStatus(status) {
    this.currentFilter = status;
  }

  getLogsByStatus(logs, status) {
    return _.filter(logs, { type: status });
  }

  getCountByStatus(logs, status) {
    let counts = 0;
    if (logs) {
      let filteredLogs = logs.filter((log: any) => {
        return log.type == status;
      });
      counts = filteredLogs.length;
    }
    return counts;
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
        this.loadingConfiguration(currentUser);
      } else {
        this.downloadingSmsCommands();
      }
    });
  }

  downloadingSmsCommands() {
    let key = 'Discovering SMS commands';
    this.loadingMessage = this.translationMapper[key]
      ? this.translationMapper[key]
      : key;
    this.smsCommand.getSmsCommandFromServer(this.currentUser).subscribe(
      (smsCommands: any) => {
        key = 'Saving SMS commands';
        this.loadingMessage = this.translationMapper[key]
          ? this.translationMapper[key]
          : key;
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
    this.loadingMessage = this.translationMapper[key]
      ? this.translationMapper[key]
      : key;
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
                  () => {
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
                                        this.loadingConfiguration(
                                          this.currentUser
                                        );
                                      },
                                      error => {}
                                    );
                                } else {
                                  this.loadingConfiguration(this.currentUser);
                                }
                              },
                              error => {
                                this.loadingConfiguration(this.currentUser);
                              }
                            );
                        },
                        error => {
                          this.isLoading = false;
                          console.log(JSON.stringify(error));
                          this.appProvider.setNormalNotification(
                            'Fail to update current user information'
                          );
                        }
                      );
                  },
                  error => {
                    this.isLoading = false;
                    console.log(JSON.stringify(error));
                    this.appProvider.setNormalNotification(
                      'Fail to check and update missed SMS commands'
                    );
                  }
                );
            },
            error => {
              this.isLoading = false;
              console.log(JSON.stringify(error));
              this.appProvider.setNormalNotification(
                'Fail to save entry forms'
              );
            }
          );
      },
      error => {
        this.isLoading = false;
        console.log(JSON.stringify(error));
        this.appProvider.setNormalNotification('Fail to discover entry forms');
      }
    );
  }

  loadingConfiguration(currentUser) {
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
            this.checkPermisionsAndStartGateway(smsCommandMapper);
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

  checkPermisionsAndStartGateway(smsCommandMapper) {
    this.appPermisssion.requestSMSPermission().subscribe(
      response => {
        this.smsGateway.startWatchingSms(smsCommandMapper, this.currentUser);
        this.smsCommandMapper = smsCommandMapper;
        this.isLoading = false;
        if (response) {
          this.appProvider.setTopNotification(
            'SMS gatway is now listening for incoming SMS'
          );
        }
        this.store.dispatch(new logsActions.LoadingLogs());
      },
      error => {
        this.isLoading = false;
        console.log(JSON.stringify(error));
      }
    );
  }

  trackByFn(index, item) {
    return item._id;
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
