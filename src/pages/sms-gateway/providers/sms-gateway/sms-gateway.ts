/*
 *
 * Copyright 2015 HISP Tanzania
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 *
 * @since 2015
 * @author Joseph Chingalo <profschingalo@gmail.com>
 *
 */
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Store } from '@ngrx/store';
import {
  State,
  AddSmsGateWayLogs,
  UpdateSmsGatewayLog
} from '../../../../store';
import {
  ReceivedSms,
  SmsGateWayLogs,
  SmsConfiguration
} from '../../../../models/sms-gateway-logs';
import { SmsCommandProvider } from '../../../../providers/sms-command/sms-command';
import { HttpClientProvider } from '../../../../providers/http-client/http-client';
import { SqlLiteProvider } from '../../../../providers/sql-lite/sql-lite';

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
    private backgroundMode: BackgroundMode,
    private smsCommandProvider: SmsCommandProvider,
    private httpClientProvider: HttpClientProvider,
    private sqlLiteProvider: SqlLiteProvider,
    private store: Store<State>
  ) {}

  updatingSmsGatewayLog(log: SmsGateWayLogs, currentUser) {
    this.store.dispatch(new UpdateSmsGatewayLog({ id: log.id, log }));
    this.saveSmsLogs([log], currentUser).subscribe(() => {});
  }

  getAllSavedSmsLogs(currentUser): Observable<any> {
    const resource = 'smsLogs';
    return new Observable(observer => {
      this.sqlLiteProvider
        .getAllDataFromTable(resource, currentUser.currentDatabase)
        .subscribe(
          (smsLogs: SmsGateWayLogs[]) => {
            observer.next(smsLogs.reverse());
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  saveSmsLogs(smsLogs: SmsGateWayLogs[], currentUser): Observable<any> {
    const resource = 'smsLogs';
    return new Observable(observer => {
      this.sqlLiteProvider
        .insertBulkDataOnTable(resource, smsLogs, currentUser.currentDatabase)
        .subscribe(
          () => {
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  startWatchSms(smsCommandObjects, dataSetInformation, currentUser) {
    const dataSetsMapper = _.keyBy(dataSetInformation, 'id');
    if (SMS) {
      this.backgroundMode.enable();
      this.setTimeOutFuction(smsCommandObjects, dataSetsMapper, currentUser);
    } else {
      console.log('No sms variable');
    }
  }

  setTimeOutFuction(smsCommandObjects, dataSetsMapper, currentUser) {
    if (this.synchronizationWatcher) {
      clearInterval(this.synchronizationWatcher);
    }
    this.synchronizationWatcher = setInterval(() => {
      SMS.listSMS(
        { maxCount: 1000 },
        (data: any) => {
          if (data && data.length > 0) {
            this.smsCommandProvider.getSmsConfigurations(currentUser).subscribe(
              (smsConfigurations: SmsConfiguration) => {
                const {
                  syncedSMSIds,
                  notSyncedSMSIds,
                  skippedSMSIds,
                  dataSetIds
                } = smsConfigurations;
                _.map(data, smsData => {
                  const id = 'id_' + smsData._id;
                  const shouldProcessSMS = this.shouldProcessSMS(
                    {
                      syncedSMSIds,
                      notSyncedSMSIds,
                      skippedSMSIds
                    },
                    id
                  );
                  if (shouldProcessSMS) {
                    const smsResponse: ReceivedSms = {
                      id,
                      address: smsData.address,
                      body: smsData.body
                    };
                    const log: SmsGateWayLogs = {
                      id,
                      type: 'info',
                      time: this.getSMSGatewayLogTime(),
                      message: smsResponse,
                      logMessage:
                        'Starting processing message from ' +
                        smsResponse.address
                    };
                    this.store.dispatch(new AddSmsGateWayLogs({ logs: [log] }));
                    this.processIncomingMessageLog(
                      log,
                      smsCommandObjects,
                      dataSetIds,
                      dataSetsMapper,
                      currentUser
                    );
                  }
                });
              },
              error => {}
            );
          }
        },
        error => {
          console.log('Error  : ' + JSON.stringify(error));
        }
      );
    }, 10 * 1000);
  }

  shouldProcessSMS(smsConfigurations, smsId: string) {
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

  processIncomingMessageLog(
    log: SmsGateWayLogs,
    smsCommandObjects,
    dataSetIds: string[],
    dataSetsMapper,
    currentUser
  ) {
    const availableSmsCodes = Object.keys(smsCommandObjects);
    const smsResponseArray = this.getSmsResponseArray(log.message);
    if (smsResponseArray.length == 3) {
      const smsCommand = smsResponseArray[0];
      if (availableSmsCodes.indexOf(smsCommand) > -1) {
        const smsCommandObject = smsCommandObjects[smsCommand];
        const smsCodeToValueMapper = this.getSmsCodeToValueMapper(
          smsResponseArray[2],
          smsCommandObject.separator
        );
        if (Object.keys(smsCodeToValueMapper).length > 0) {
          const period = smsResponseArray[1];
          const dataSet = smsCommandObject.id;
          const dataValues = this.getDataValusFromSmsContents(
            smsCommandObject,
            smsCodeToValueMapper
          );
          const dataSetObject = dataSetsMapper[dataSet];
          if (_.indexOf(dataSetIds, dataSet) > -1) {
            this.getUserOrganisationUnits(log.message, currentUser).subscribe(
              (organisationUnits: any) => {
                if (organisationUnits && organisationUnits.length > 0) {
                  const payload = {
                    dataSet: dataSet,
                    completeDate: this.getCompletenessDate(),
                    period: period,
                    orgUnit: organisationUnits[0].id,
                    orgUnitName: organisationUnits[0].name,
                    dataValues: dataValues
                  };
                  this.uploadPayLoadToServer(
                    log,
                    payload,
                    payload.orgUnitName,
                    smsCommandObject.name,
                    currentUser
                  );
                } else {
                  const type = 'warning';
                  const logMessage =
                    'Missing organisation unit assignemnts for user with phone number ' +
                    log.message.address;
                  this.markAsNotSyncedSMS(log, type, logMessage, currentUser);
                }
              },
              error => {
                const { type } = error;
                const { logMessage } = error;
                this.markAsNotSyncedSMS(log, type, logMessage, currentUser);
              }
            );
          } else {
            const type = 'warning';
            const logMessage =
              'Currently we are not listening sms for ' +
              (dataSetObject && dataSetObject.name)
                ? dataSetObject.name
                : '';
            this.markAsNotSyncedSMS(log, type, logMessage, currentUser);
          }
        } else {
          const logMessage =
            'Missing data values on received SMS from ' + log.message.address;
          this.markAsSkippedSMS(log, logMessage, currentUser);
        }
      } else {
        const logMessage =
          'Message from ' +
          log.message.address +
          ' has been marked as skipped due to incorrect formatting';
        this.markAsSkippedSMS(log, logMessage, currentUser);
      }
    } else {
      const logMessage =
        'Message from ' +
        log.message.address +
        ' has been marked as skipped due to incorrect formatting';
      this.markAsSkippedSMS(log, logMessage, currentUser);
    }
  }

  uploadPayLoadToServer(
    log: SmsGateWayLogs,
    payload,
    orgUnitName: string,
    dataSetName: string,
    currentUser
  ) {
    const url = '/api/dataValueSets';
    const logMessage =
      'Uploading ' +
      payload.dataValues.length +
      ' data values to the server for ' +
      orgUnitName +
      ', on  ' +
      dataSetName +
      ' for period ' +
      payload.period;
    log = {
      ...log,
      logMessage,
      organisationUnitId: payload.orgUnit,
      organisationUnitName: orgUnitName,
      periodIso: payload.period,
      dataSetId: payload.dataSet
    };
    this.updatingSmsGatewayLog(log, currentUser);
    this.httpClientProvider.post(url, payload, currentUser).subscribe(
      () => {
        const logMessage =
          payload.dataValues.length +
          ' data values for ' +
          orgUnitName +
          ', on ' +
          dataSetName +
          ' for period ' +
          payload.period +
          ' haved uploaded successfully';
        log = { ...log, logMessage };
      },
      error => {
        const type = 'danger';
        const logMessage =
          'Fail to upload ' +
          payload.dataValues.length +
          ' data values to the server for organisation unit ' +
          orgUnitName +
          ', form ' +
          dataSetName +
          ' for period ' +
          payload.period +
          ' :: ' +
          JSON.stringify(error);
        log = { ...log, type, logMessage };
        this.markAsNotSyncedSMS(log, type, logMessage, currentUser);
      }
    );
  }

  getUserOrganisationUnits(
    smsResponse: ReceivedSms,
    currentUser
  ): Observable<any> {
    return new Observable(observer => {
      if (smsResponse && smsResponse.address) {
        const number = smsResponse.address.replace('+', '');
        const url =
          'users.json?fields=organisationUnits[id,name]&filter=phoneNumber:ilike:' +
          number;
        this.httpClientProvider.get(url, true, currentUser).subscribe(
          (response: any) => {
            const { users } = response;
            if (users && users.length > 0) {
              observer.next(users[0].organisationUnits);
              observer.complete();
            } else {
              const type = 'warning';
              const logMessage =
                'There is no user with phone number ' + smsResponse.address;
              observer.error({ type, logMessage });
            }
          },
          error => {
            const type = 'danger';
            const logMessage =
              'Fail to fetching user with phone number ' +
              smsResponse.address +
              ' : ' +
              JSON.stringify(error);
            observer.error({ type, logMessage });
          }
        );
      } else {
        const type = 'irrelevant';
        const logMessage = 'Missing phone number of the sender';
        observer.error({ type, logMessage });
      }
    });
  }

  getSmsCodeToValueMapper(smsCodeValueContents, separator) {
    const smsCodeToValueMapper = {};
    smsCodeValueContents.split('|').map((content: any) => {
      const smsCodeValueArray = content.split(separator);
      if (smsCodeValueArray.length == 2) {
        smsCodeToValueMapper[smsCodeValueArray[0]] = smsCodeValueArray[1];
      }
    });
    return smsCodeToValueMapper;
  }

  getDataValusFromSmsContents(smsCommandObject, smsCodeToValueMapper) {
    let dataValues = [];
    const keys = Object.keys(smsCodeToValueMapper);
    if (smsCommandObject && smsCommandObject.smsCode) {
      smsCommandObject.smsCode.map((smsCodeObject: any) => {
        if (keys.indexOf(smsCodeObject.smsCode) > -1) {
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

  getSmsResponseArray(message: ReceivedSms): string[] {
    return _.remove(
      _.map(message.body.split(' '), (content: string) => {
        return content.trim();
      }),
      (content: string) => {
        return content && content.trim() !== '';
      }
    );
  }

  markAsSyncedSMS(log: SmsGateWayLogs, currentUser) {
    this.updatingSmsGatewayLog(log, currentUser);
    this.smsCommandProvider
      .getSmsConfigurations(currentUser)
      .subscribe((smsConfigurations: SmsConfiguration) => {
        smsConfigurations.syncedSMSIds.push(log.id);
        this.smsCommandProvider
          .setSmsConfigurations(currentUser, smsConfigurations)
          .subscribe(() => {}, error => {});
      });
  }

  markAsNotSyncedSMS(
    log: SmsGateWayLogs,
    type: string,
    logMessage: string,
    currentUser
  ) {
    log = {
      ...log,
      type,
      time: this.getSMSGatewayLogTime(),
      logMessage
    };
    this.updatingSmsGatewayLog(log, currentUser);
    this.smsCommandProvider
      .getSmsConfigurations(currentUser)
      .subscribe((smsConfigurations: SmsConfiguration) => {
        smsConfigurations.notSyncedSMSIds.push(log.id);
        this.smsCommandProvider
          .setSmsConfigurations(currentUser, smsConfigurations)
          .subscribe(() => {}, error => {});
      });
  }

  markAsSkippedSMS(log: SmsGateWayLogs, logMessage: string, currentUser) {
    log = {
      ...log,
      type: 'irrelevant',
      time: this.getSMSGatewayLogTime(),
      logMessage
    };
    this.updatingSmsGatewayLog(log, currentUser);
    this.smsCommandProvider
      .getSmsConfigurations(currentUser)
      .subscribe((smsConfigurations: SmsConfiguration) => {
        smsConfigurations.skippedSMSIds.push(log.id);
        this.smsCommandProvider
          .setSmsConfigurations(currentUser, smsConfigurations)
          .subscribe(() => {}, error => {});
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
}
