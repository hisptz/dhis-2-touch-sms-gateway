import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import {
  SmsConfiguration,
  SmsGateWayLogs,
  ReceivedSms
} from '../../models/smsCommand';
import { BackgroundMode } from '@ionic-native/background-mode';
import { HttpClientProvider } from '../http-client/http-client';
import * as logsActions from '../../store/actions/smsGatewayLogs.action';
import { Store } from '@ngrx/store';
import { ApplicationState } from '../../store/reducers';

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
    private store: Store<ApplicationState>
  ) {}

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

  startWatchingSms(
    smsCommandObjects,
    smsConfigurations: SmsConfiguration,
    currentUser
  ) {
    if (SMS) {
      this.backgroundMode.enable();
      setInterval(() => {
        this.store.dispatch(new logsActions.LoadingLogs());
        SMS.listSMS(
          {},
          (data: any) => {
            if (data && data.length > 0) {
              //@chingalo loading sms configurations

              data.map((smsData: any) => {
                if (smsConfigurations.syncedSMSIds.indexOf(smsData._id) == -1) {
                  const smsResponse: ReceivedSms = {
                    _id: smsData._id,
                    address: smsData.address,
                    body: smsData.body
                  };
                  const log: SmsGateWayLogs = {
                    isSuccess: false,
                    time: this.getCompletenessDate(),
                    logMessage: ''
                    //dataSetId periodIso organisationUnitId organisationUnitName _id message
                  };

                  this.processMessage(
                    smsResponse,
                    smsCommandObjects,
                    smsConfigurations,
                    currentUser
                  );
                }
              });
            }
          },
          error => {
            const logs: SmsGateWayLogs = {
              isSuccess: false,
              time: new Date().toISOString().split('T')[0],
              logMessage: 'Error on list sms : ' + JSON.stringify(error)
            };
            this.store.dispatch(new logsActions.FailToLoadLogs(logs));
            console.log('Error on list sms : ' + JSON.stringify(error));
          }
        );
      }, 5 * 1000);
    } else {
      console.log('No sms variable');
    }
  }

  marksSyncedSMS(smsId, smsConfigurations, currentUser) {
    smsConfigurations.syncedSMSIds.push(smsId);
    this.setSmsConfigurations(currentUser, smsConfigurations).subscribe(
      () => {},
      error => {}
    );
  }

  processMessage(
    smsResponse,
    smsCommandObjects,
    smsConfigurations,
    currentUser
  ) {
    this.getSmsToDataValuePayload(
      smsResponse,
      smsCommandObjects,
      smsConfigurations
    ).subscribe(
      (payload: any) => {
        console.log(JSON.stringify(payload));
        let url = '/api/25/dataValueSets';
        this.http.defaultPost(url, payload).subscribe(
          response => {
            this.marksSyncedSMS(
              smsResponse._id,
              smsConfigurations,
              currentUser
            );
            //@chingalo
            console.log('Success import data value');
            console.log(JSON.stringify(response));
            const log: SmsGateWayLogs = {
              isSuccess: false,
              time: this.getCompletenessDate(),
              logMessage: ''

              //dataSetId periodIso organisationUnitId organisationUnitName _id message
            };
          },
          error => {
            //@chingalo
            const log: SmsGateWayLogs = {
              isSuccess: false,
              time: this.getCompletenessDate(),
              logMessage: '',
              dataSetId: ''
              //dataSetId periodIso organisationUnitId organisationUnitName _id message
            };
            console.log('Error on post data : ' + JSON.stringify(error));
          }
        );
      },
      error => {
        //@chingalo
        const log: SmsGateWayLogs = {
          isSuccess: false,
          time: this.getCompletenessDate(),
          logMessage: ''
          //dataSetId periodIso organisationUnitId organisationUnitName _id message
        };
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
    smsResponse,
    smsCommandObjects,
    smsConfigurations
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
                //@todo handling if payload saving if user is not found
                this.getUserOrganisationUnits(smsResponse).subscribe(
                  (organisationUnits: any) => {
                    if (organisationUnits && organisationUnits.length > 0) {
                      orgUnit = organisationUnits[0].id;
                      let payload = {
                        dataSet: dataSet,
                        completeDate: this.getCompletenessDate(),
                        period: period,
                        orgUnit: orgUnit,
                        dataValues: dataValues
                      };
                      observer.next(payload);
                    } else {
                      //@chingalo
                      observer.error('User has not assinged organisation unit');
                    }
                  },
                  error => {
                    //@chingalo
                    const log: SmsGateWayLogs = {
                      isSuccess: false,
                      time: this.getCompletenessDate(),
                      logMessage: ''
                      //dataSetId periodIso organisationUnitId organisationUnitName _id message
                    };
                    console.log(
                      'Here w are on error : ' + JSON.stringify(error)
                    );
                    observer.error(error);
                  }
                );
              } else {
                //@chingalo
                const log: SmsGateWayLogs = {
                  isSuccess: false,
                  time: this.getCompletenessDate(),
                  logMessage: ''
                  //dataSetId periodIso organisationUnitId organisationUnitName _id message
                };
                observer.error('Data set is has not being set for sync');
              }
            } else {
              const log: SmsGateWayLogs = {
                isSuccess: false,
                time: this.getCompletenessDate(),
                logMessage: ''
                //dataSetId periodIso organisationUnitId organisationUnitName _id message
              };
              //@chingalo
              observer.error('Missing data values from received sms');
            }
          } else {
            const log: SmsGateWayLogs = {
              isSuccess: false,
              time: this.getCompletenessDate(),
              logMessage: ''
              //dataSetId periodIso organisationUnitId organisationUnitName _id message
            };
            observer.error('Sms command is not set up');
          }
        } else {
          observer.error('SMS received is not from dhis 2 touch');
        }
      } else {
        observer.error('Sms content has not found from received sms');
      }
    });
  }

  getCompletenessDate() {
    let date = new Date();
    return date.toISOString().split('T')[0];
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

  getUserOrganisationUnits(smsResponse): Observable<any> {
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
              observer.error(
                'There is no user with mobile number ' + smsResponse.address
              );
            }
          },
          error => {
            console.log(
              'Error of fetching user : ' + url + ' :: ' + JSON.stringify(error)
            );
            observer.error(error);
          }
        );
      } else {
        observer.error('Sender phone number is not found');
      }
    });
  }

  stopWatchingSms() {
    clearInterval(this.synchronizationWatcher);
  }
}
