import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import {
  SmsConfiguration,
  SmsGateWayLogs,
  SmsGateWayLogsError,
  ReceivedSms
} from '../../models/smsCommand';
import { BackgroundMode } from '@ionic-native/background-mode';
import { HttpClientProvider } from '../http-client/http-client';
import * as logsActions from '../../store/actions/smsGatewayLogs.action';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../store/reducers';
import { SqlLiteProvider } from '../sql-lite/sql-lite';
import { UserProvider } from '../user/user';
import { CurrentUser } from '../../models/currentUser';
import { DataSetsProvider } from '../data-sets/data-sets';
import { DataSet } from '../../models/dataSet';

declare var SMS: any;

/*
  Generated class for the SmsGatewayProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SmsGatewayProvider {
  synchronizationWatcher: any;

  constructor(
    private storage: Storage,
    private http: HttpClientProvider,
    private backgroundMode: BackgroundMode,
    private store: Store<ApplicationState>,
    private sqlLiteProvider: SqlLiteProvider,
    private userProvider: UserProvider,
    private dataSetProvider: DataSetsProvider
  ) {}

  saveSmsLogs(smsLogs: Array<SmsGateWayLogs>): Observable<any> {
    const resource = 'smsLogs';
    console.log('Saving logs');
    let data = [];
    smsLogs.map((smsLog: SmsGateWayLogs) => {
      let log = smsLog;
      log['id'] = smsLog._id;
      data.push(log);
    });
    return new Observable(observer => {
      this.userProvider.getCurrentUser().subscribe(
        (currentUser: CurrentUser) => {
          this.sqlLiteProvider
            .insertBulkDataOnTable(resource, data, currentUser.currentDatabase)
            .subscribe(
              () => {
                observer.next(smsLogs);
                observer.complete();
              },
              error => {
                observer.error(error);
              }
            );
        },
        error => {
          observer.error(error);
        }
      );
    });
  }

  getAllSavedSmsLogs(): Observable<any> {
    const resource = 'smsLogs';
    return new Observable(observer => {
      this.userProvider.getCurrentUser().subscribe(
        (currentUser: CurrentUser) => {
          this.sqlLiteProvider
            .getAllDataFromTable(resource, currentUser.currentDatabase)
            .subscribe(
              (smsLogs: Array<SmsGateWayLogs>) => {
                observer.next(smsLogs);
                observer.complete();
              },
              error => {
                observer.error(error);
              }
            );
        },
        error => {
          observer.error(error);
        }
      );
    });
  }

  /**
   *
   * @param currentUser
   * @returns {Observable<SmsConfiguration>}
   */
  getSmsConfigurations(currentUser): Observable<SmsConfiguration> {
    return new Observable(observer => {
      let key = 'sms-configuration-' + currentUser.currentDatabase;
      this.storage
        .get(key)
        .then((configuration: any) => {
          configuration = JSON.parse(configuration);
          if (!configuration) {
            configuration = this.getDefaultConfigurations();
          }
          observer.next(configuration);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   *
   * @param currentUser
   * @param configuration
   * @returns {Observable<any>}
   */
  setSmsConfigurations(currentUser, configuration: any): Observable<any> {
    return new Observable(observer => {
      let key = 'sms-configuration-' + currentUser.currentDatabase;
      configuration = JSON.stringify(configuration);
      this.storage
        .set(key, configuration)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   *
   * @returns {SmsConfiguration}
   */
  getDefaultConfigurations(): SmsConfiguration {
    let defaultConfigurations: SmsConfiguration = {
      dataSetIds: [],
      syncedSMSIds: [],
      notSyncedSMSIds: [],
      skippedSMSIds: []
    };
    return defaultConfigurations;
  }

  startWatchingSms(smsCommandObjects, currentUser) {
    if (SMS) {
      this.backgroundMode.enable();
      let dataSetsMapper = {};
      this.dataSetProvider.getAllDataSets(currentUser).subscribe(
        (dataSets: Array<DataSet>) => {
          dataSets.map(dataSet => {
            dataSetsMapper[dataSet.id] = dataSet.name;
          });
          this.setTimeOutFuction(
            smsCommandObjects,
            currentUser,
            dataSetsMapper
          );
        },
        error => {
          this.setTimeOutFuction(
            smsCommandObjects,
            currentUser,
            dataSetsMapper
          );
        }
      );
    } else {
      console.log('No sms variable');
    }
  }

  setTimeOutFuction(smsCommandObjects, currentUser, dataSetsMapper) {
    setInterval(() => {
      SMS.listSMS(
        {},
        (data: any) => {
          if (data && data.length > 0) {
            this.getSmsConfigurations(currentUser).subscribe(
              (smsConfigurations: SmsConfiguration) => {
                data.map((smsData: any) => {
                  if (this.shouldProcessSMS(smsConfigurations, smsData._id)) {
                    const smsResponse: ReceivedSms = {
                      _id: smsData._id,
                      address: smsData.address,
                      body: smsData.body
                    };
                    const log: SmsGateWayLogs = {
                      type: 'info',
                      time: this.getSMSGatewayLogTime(),
                      _id: smsResponse._id,
                      message: smsResponse,
                      logMessage:
                        'Starting processing message from ' +
                        smsResponse.address
                    };
                    this.store.dispatch(
                      new logsActions.LogsHaveBeenLoaded([log])
                    );
                    this.saveSmsLogs([log]).subscribe(() => {}, error => {});
                    this.processMessage(
                      smsResponse,
                      smsCommandObjects,
                      smsConfigurations,
                      currentUser,
                      dataSetsMapper
                    );
                  }
                });
              },
              error => {
                console.log(JSON.stringify(error));
              }
            );
          }
        },
        error => {
          const logs: SmsGateWayLogsError = {
            time: this.getSMSGatewayLogTime(),
            logMessage: 'Error on list sms : ' + JSON.stringify(error)
          };
          this.store.dispatch(new logsActions.FailToLoadLogs(logs));
          console.log('Error on list sms : ' + JSON.stringify(error));
        }
      );
    }, 10 * 1000);
  }

  shouldProcessSMS(smsConfigurations, smsId) {
    let result = true;
    if (
      smsConfigurations.syncedSMSIds.indexOf(smsId) > -1 ||
      smsConfigurations.notSyncedSMSIds.indexOf(smsId) > -1 ||
      smsConfigurations.skippedSMSIds.indexOf(smsId) > -1
    ) {
      result = false;
    }
    return result;
  }

  markAsSyncedSMS(smsId, currentUser) {
    this.getSmsConfigurations(currentUser).subscribe(
      (smsConfigurations: SmsConfiguration) => {
        smsConfigurations.syncedSMSIds.push(smsId);
        this.setSmsConfigurations(currentUser, smsConfigurations).subscribe(
          () => {},
          error => {}
        );
      }
    );
  }

  markAsNotSyncedSMS(smsId, currentUser) {
    this.getSmsConfigurations(currentUser).subscribe(
      (smsConfigurations: SmsConfiguration) => {
        smsConfigurations.notSyncedSMSIds.push(smsId);
        this.setSmsConfigurations(currentUser, smsConfigurations).subscribe(
          () => {},
          error => {}
        );
      }
    );
  }

  markAsSkippedSMS(smsId, currentUser) {
    this.getSmsConfigurations(currentUser).subscribe(
      (smsConfigurations: SmsConfiguration) => {
        smsConfigurations.skippedSMSIds.push(smsId);
        this.setSmsConfigurations(currentUser, smsConfigurations).subscribe(
          () => {},
          error => {}
        );
      }
    );
  }

  processMessage(
    smsResponse,
    smsCommandObjects,
    smsConfigurations,
    currentUser,
    dataSetsMapper
  ) {
    this.getSmsToDataValuePayload(
      smsResponse,
      smsCommandObjects,
      smsConfigurations,
      currentUser
    ).subscribe(
      (payload: any) => {
        let dataSetName = dataSetsMapper[payload.dataSet];
        const orgUnitName = payload.orgUnitName;
        delete payload.orgUnitName;
        const log: SmsGateWayLogs = {
          type: 'info',
          time: this.getSMSGatewayLogTime(),
          _id: smsResponse._id,
          message: smsResponse,
          organisationUnitId: payload.orgUnit,
          organisationUnitName: orgUnitName,
          periodIso: payload.period,
          dataSetId: payload.dataSet,
          logMessage:
            'Uploading ' +
            payload.dataValues.length +
            ' data values to the server for ' +
            orgUnitName +
            ', on  ' +
            dataSetName +
            ' for period ' +
            payload.period
        };
        this.store.dispatch(new logsActions.LogsHaveBeenLoaded([log]));
        this.saveSmsLogs([log]).subscribe(() => {}, error => {});
        let url = '/api/25/dataValueSets';
        this.http.defaultPost(url, payload).subscribe(
          response => {
            this.markAsSyncedSMS(smsResponse._id, currentUser);
            const log: SmsGateWayLogs = {
              type: 'info',
              time: this.getSMSGatewayLogTime(),
              _id: smsResponse._id,
              message: smsResponse,
              organisationUnitId: payload.orgUnit,
              organisationUnitName: orgUnitName,
              periodIso: payload.period,
              dataSetId: payload.dataSet,
              logMessage:
                payload.dataValues.length +
                ' data values for ' +
                orgUnitName +
                ', on ' +
                dataSetName +
                ' for period ' +
                payload.period +
                ' haved uploaded successfully'
            };
            this.store.dispatch(new logsActions.LogsHaveBeenLoaded([log]));
            this.saveSmsLogs([log]).subscribe(() => {}, error => {});
          },
          error => {
            const log: SmsGateWayLogs = {
              type: 'danger',
              time: this.getSMSGatewayLogTime(),
              _id: smsResponse._id,
              message: smsResponse,
              organisationUnitId: payload.orgUnit,
              organisationUnitName: orgUnitName,
              periodIso: payload.period,
              dataSetId: payload.dataSet,
              logMessage:
                'Fail to upload ' +
                payload.dataValues.length +
                ' data values to the server for organisation unit ' +
                orgUnitName +
                ', form ' +
                dataSetName +
                ' for period ' +
                payload.period +
                ' :: ' +
                JSON.stringify(error)
            };
            this.store.dispatch(new logsActions.LogsHaveBeenLoaded([log]));
            this.saveSmsLogs([log]).subscribe(() => {}, error => {});
            console.log('Error on post data : ' + JSON.stringify(error));
          }
        );
      },
      error => {
        console.log('Error : on get payload : ' + JSON.stringify(error));
      }
    );
  }

  getSmsResponseArray(smsResponse) {
    let smsResponseArray = [];
    smsResponse.body.split(' ').map((content: string) => {
      if (content && content.trim() != '') {
        smsResponseArray.push(content.trim());
      }
    });
    return smsResponseArray;
  }

  getSmsToDataValuePayload(
    smsResponse: ReceivedSms,
    smsCommandObjects,
    smsConfigurations,
    currentUser
  ): Observable<any> {
    return new Observable(observer => {
      if (smsResponse.body) {
        let availableSmsCodes = Object.keys(smsCommandObjects);
        let orgUnit, period, dataSet, dataValues;
        let smsResponseArray = this.getSmsResponseArray(smsResponse);
        if (smsResponseArray.length == 3) {
          let smsCommand = smsResponseArray[0];
          if (availableSmsCodes.indexOf(smsCommand) > -1) {
            let smsCommandObject = smsCommandObjects[smsCommand];
            let smsCodeToValueMapper = this.getSmsCodeToValueMapper(
              smsResponseArray[2],
              smsCommandObject.separator
            );
            if (Object.keys(smsCodeToValueMapper).length > 0) {
              period = smsResponseArray[1];
              dataSet = smsCommandObject.id;
              dataValues = this.getDataValusFromSmsContents(
                smsCommandObject,
                smsCodeToValueMapper
              );
              if (smsConfigurations.dataSetIds.indexOf(dataSet) > -1) {
                this.getUserOrganisationUnits(
                  smsResponse,
                  currentUser
                ).subscribe(
                  (organisationUnits: any) => {
                    if (organisationUnits && organisationUnits.length > 0) {
                      orgUnit = organisationUnits[0].id;
                      let payload = {
                        dataSet: dataSet,
                        completeDate: this.getCompletenessDate(),
                        period: period,
                        orgUnit: orgUnit,
                        orgUnitName: organisationUnits[0].name,
                        dataValues: dataValues
                      };
                      observer.next(payload);
                    } else {
                      this.markAsNotSyncedSMS(smsResponse._id, currentUser);
                      const log: SmsGateWayLogs = {
                        type: 'warning',
                        time: this.getSMSGatewayLogTime(),
                        _id: smsResponse._id,
                        message: smsResponse,
                        logMessage:
                          'Missing organisation unit assignemnts for user with phone number ' +
                          smsResponse.address
                      };
                      this.store.dispatch(
                        new logsActions.LogsHaveBeenLoaded([log])
                      );
                      this.saveSmsLogs([log]).subscribe(() => {}, error => {});
                      observer.error('User has not assinged organisation unit');
                    }
                  },
                  error => {
                    console.log('On fetching : ' + JSON.stringify(error));
                    observer.error(error);
                  }
                );
              } else {
                this.markAsNotSyncedSMS(smsResponse._id, currentUser);
                const log: SmsGateWayLogs = {
                  type: 'warning',
                  time: this.getSMSGatewayLogTime(),
                  _id: smsResponse._id,
                  message: smsResponse,
                  logMessage:
                    'Missing SMS configurations on received SMS from ' +
                    smsResponse.address
                };
                this.store.dispatch(new logsActions.LogsHaveBeenLoaded([log]));
                this.saveSmsLogs([log]).subscribe(() => {}, error => {});
                observer.error('Data set is has not being set for sync');
              }
            } else {
              this.markAsNotSyncedSMS(smsResponse._id, currentUser);
              const log: SmsGateWayLogs = {
                type: 'warning',
                time: this.getSMSGatewayLogTime(),
                _id: smsResponse._id,
                message: smsResponse,
                logMessage:
                  'Missing data values on received SMS from + ' +
                  smsResponse.address
              };
              this.store.dispatch(new logsActions.LogsHaveBeenLoaded([log]));
              this.saveSmsLogs([log]).subscribe(() => {}, error => {});
              observer.error('Missing data values from received sms');
            }
          } else {
            this.markAsNotSyncedSMS(smsResponse._id, currentUser);
            const log: SmsGateWayLogs = {
              type: 'warning',
              time: this.getSMSGatewayLogTime(),
              _id: smsResponse._id,
              message: smsResponse,
              logMessage:
                'Message from ' +
                smsResponse.address +
                ' has been marked as unsynced due to incorrect formatting'
            };
            this.store.dispatch(new logsActions.LogsHaveBeenLoaded([log]));
            this.saveSmsLogs([log]).subscribe(() => {}, error => {});
          }
        } else {
          this.markAsSkippedSMS(smsResponse._id, currentUser);
          const log: SmsGateWayLogs = {
            type: 'warning',
            time: this.getSMSGatewayLogTime(),
            _id: smsResponse._id,
            message: smsResponse,
            logMessage:
              'Message from ' +
              smsResponse.address +
              ' has been marked as skipped due to incorrect formatting'
          };
          this.store.dispatch(new logsActions.LogsHaveBeenLoaded([log]));
          this.saveSmsLogs([log]).subscribe(() => {}, error => {});
          observer.error('SMS received is not from dhis 2 touch');
        }
      } else {
        this.markAsSkippedSMS(smsResponse._id, currentUser);
        const log: SmsGateWayLogs = {
          type: 'warning',
          time: this.getSMSGatewayLogTime(),
          _id: smsResponse._id,
          message: smsResponse,
          logMessage:
            'Message from ' +
            smsResponse.address +
            ' has been skipped due to missing SMS contents'
        };
        this.store.dispatch(new logsActions.LogsHaveBeenLoaded([log]));
        this.saveSmsLogs([log]).subscribe(() => {}, error => {});
        observer.error('Sms content has not found from received sms');
      }
    });
  }

  getSmsCodeToValueMapper(smsCodeValueContents, separator) {
    let mapper = {};
    smsCodeValueContents.split('|').map((content: any) => {
      let smsCodeValueArray = content.split(separator);
      if (smsCodeValueArray.length == 2) {
        mapper[smsCodeValueArray[0]] = smsCodeValueArray[1];
      }
    });
    return mapper;
  }

  getDataValusFromSmsContents(smsCommandObject, smsCodeToValueMapper) {
    let dataValues = [];
    if (smsCommandObject && smsCommandObject.smsCode) {
      smsCommandObject.smsCode.map((smsCodeObject: any) => {
        if (smsCodeToValueMapper[smsCodeObject.smsCode]) {
          dataValues.push({
            dataElement: smsCodeObject.dataElement.id,
            categoryOptionCombo: smsCodeObject.categoryOptionCombos,
            value: smsCodeToValueMapper[smsCodeObject.smsCode]
          });
        }
      });
    }
    return dataValues;
  }

  getUserOrganisationUnits(
    smsResponse: ReceivedSms,
    currentUser
  ): Observable<any> {
    return new Observable(observer => {
      if (smsResponse && smsResponse.address) {
        let number = smsResponse.address.replace('+', '');
        let url =
          'users.json?fields=organisationUnits[id,name]&filter=phoneNumber:ilike:' +
          number;
        this.http.get(url, true).subscribe(
          (response: any) => {
            if (response && response.users && response.users.length > 0) {
              observer.next(response.users[0].organisationUnits);
              observer.complete();
            } else {
              this.markAsNotSyncedSMS(smsResponse._id, currentUser);
              const log: SmsGateWayLogs = {
                type: 'warning',
                time: this.getSMSGatewayLogTime(),
                _id: smsResponse._id,
                logMessage:
                  'There is no user with phone number ' + smsResponse.address,
                message: smsResponse
              };
              this.store.dispatch(new logsActions.LogsHaveBeenLoaded([log]));
              this.saveSmsLogs([log]).subscribe(() => {}, error => {});
              observer.error(
                'There is no user with mobile number ' + smsResponse.address
              );
            }
          },
          error => {
            this.markAsNotSyncedSMS(smsResponse._id, currentUser);
            const log: SmsGateWayLogs = {
              type: 'danger',
              time: this.getSMSGatewayLogTime(),
              message: smsResponse,
              _id: smsResponse._id,
              logMessage:
                'Fail to fetching user with phone number ' +
                smsResponse.address +
                ' : ' +
                JSON.stringify(error)
            };
            this.store.dispatch(new logsActions.LogsHaveBeenLoaded([log]));
            this.saveSmsLogs([log]).subscribe(() => {}, error => {});
            observer.error('Error on fetching user : ' + JSON.stringify(error));
          }
        );
      } else {
        this.markAsSkippedSMS(smsResponse._id, currentUser);
        const log: SmsGateWayLogs = {
          type: 'warning',
          _id: smsResponse._id,
          time: this.getSMSGatewayLogTime(),
          logMessage: 'Missing phone number of the sender',
          message: smsResponse
        };
        this.store.dispatch(new logsActions.LogsHaveBeenLoaded([log]));
        this.saveSmsLogs([log]).subscribe(() => {}, error => {});
        observer.error('Sender phone number is not found');
      }
    });
  }

  getCompletenessDate() {
    let date = new Date();
    return date.toISOString().split('T')[0];
  }

  getSMSGatewayLogTime() {
    let date = new Date();
    return date.toISOString().split('T')[0] + ' ' + date.toLocaleTimeString();
  }

  stopWatchingSms() {
    clearInterval(this.synchronizationWatcher);
  }
}
