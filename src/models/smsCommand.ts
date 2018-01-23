export interface SmsCommand{
  dataSetId : string;
  commandName : string;
  separator : string;
  parseType: string;
  smsCode : Array<SmsCode>;
}

export interface SmsCode{
  smsCode :string;
  dataElements : any;
  categoryOptionCombos : string;
}
