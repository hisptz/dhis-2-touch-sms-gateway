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
  dataSetIds: Array<any>;
  syncedSMSIds: Array<any>;
}

export interface SmsGateWayLogs {
  _id?: string;
  isSuccess: boolean;
  dataSetId?: string;
  organisationUnitid?: string;
  organisationUnitName?: string;
  date: string;
  message?: ReceivedSms;
  logMessage: string;
}

export interface ReceivedSms {
  _id: string;
  body: string;
  address: string;
}
