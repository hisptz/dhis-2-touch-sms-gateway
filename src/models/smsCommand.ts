export interface SmsCommand {
  dataSetId: string;
  commandName: string;
  separator: string;
  parserType: string;
  smsCode: Array<SmsCode>;
}

export interface SmsCode {
  smsCode?: string;
  dataElements?: any;
  categoryOptionCombos?: string;
}

export interface SmsConfiguration {
  dataSetIds: Array<string>;
  syncedSMSIds: Array<string>;
  notSyncedSMSIds: Array<string>;
  skippedSMSIds: Array<string>;
}

export interface SmsGateWayLogs {
  _id: string;
  time: string;
  type: string;
  dataSetId?: string;
  periodIso?: string;
  logMessage: string;
  organisationUnitId?: string;
  organisationUnitName?: string;
  message?: ReceivedSms;
}

export interface ReceivedSms {
  _id: string;
  body: string;
  address: string;
}

export interface SmsGateWayLogsError {
  time: string;
  logMessage: string;
}
