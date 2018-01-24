import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {SqlLiteProvider} from "../sql-lite/sql-lite";
import {HttpClientProvider} from "../http-client/http-client";
import {DataSetsProvider} from "../data-sets/data-sets";
import {DataSet} from "../../models/dataSet";
import {SmsCode, SmsCommand} from "../../models/smsCommand";
import {SMS} from "@ionic-native/sms";


/*
  Generated class for the SmsCommandProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class SmsCommandProvider {

  resourceName : string;

  constructor(private SqlLite : SqlLiteProvider,
              private dataSetProvider : DataSetsProvider,
              private sms: SMS,
              private HttpClient : HttpClientProvider ) {
    this.resourceName = "smsCommand";
  }



  /**
   * getting sms commands from login instance
   * @param user
   * @returns {Promise<T>}
   */
  getSmsCommandFromServer(user){
    return new Promise((resolve, reject)=> {
      let smsCommandUrl = "/api/25/dataStore/sms/commands";
      this.HttpClient.get(smsCommandUrl,user).then((response : any)=>{
        response = JSON.parse(response.data);
        resolve(response);
      },error=>{
        resolve([]);
      });
    });
  }


  /**
   * saving sms commands
   * @param smsCommands
   * @param databaseName
   * @returns {Promise<T>}
   */
  savingSmsCommand(smsCommands,databaseName){
    return new Promise((resolve, reject)=> {
      if(smsCommands.length == 0){
        resolve();
      }else{
        smsCommands.forEach((smsCommand:any)=>{
          smsCommand["id"] = smsCommand.dataSetId;
        });
        this.SqlLite.insertBulkDataOnTable(this.resourceName,smsCommands,databaseName).then(()=>{
          resolve();
        },error=>{
          console.log(JSON.stringify(error));
          reject(error);
        });
      }
    });
  }

  /**
   *
   * @param currentUser
   * @returns {Promise<any>}
   */
  checkAndGenerateSmsCommands(currentUser){
    return new Promise((resolve,reject)=>{
      this.getAllSmsCommands(currentUser).then((smsCommands : Array<SmsCommand>)=>{
        if(smsCommands.length == 0){
          this.dataSetProvider.getAllDataSets(currentUser).then((dataSets : Array<DataSet>)=>{
            let smsCommands : Array<SmsCommand> = this.getGenerateSmsCommands(dataSets);
            this.savingSmsCommand(smsCommands,currentUser.currentDatabase).then(()=>{});
            let smsCommandUrl = "/api/25/dataStore/sms/commands";
            this.HttpClient.defaultPost(smsCommandUrl,smsCommands,currentUser).then((success)=>{
              resolve();
            }).catch(error=>{
              reject(error);
            });

          }).catch((error)=>{reject(error)});
        }else{
          resolve();
        }
      }).catch(error=>{
        reject(error);
      });
    });
  }

  /**
   *
   * @param currentUser
   * @returns {Promise<any>}
   */
  getAllSmsCommands(currentUser){
    return new Promise((resolve,reject)=>{
      this.SqlLite.getAllDataFromTable(this.resourceName,currentUser.currentDatabase).then((smsCommands : any)=>{
        resolve(smsCommands);
      }).catch((error)=>{
        reject(error);
      })
    });
  }

  /**
   *
   * @param {Array<DataSet>} dataSets
   * @returns {Array<SmsCommand>}
   */
  getGenerateSmsCommands(dataSets : Array<DataSet>){
    let smsCommands : Array<SmsCommand> = [];
    let optionCombos= [];
    let new_format = "abcdefghijklmnopqrstuvwxyzABCDEFGJHIJLMNOPQRSTUVWXYZ0123456789";
    let dataSetCounter = 0;
    dataSets.map((dataSet : DataSet)=>{
      let smsCodeIndex = 0;
      let smsCommand : SmsCommand = {
        "dataSetId": dataSet.id,
        "commandName" : this.getCodeCharacter(dataSetCounter, new_format),
        "separator" : ":",
        "parserType": "KEY_VALUE_PARSER",
        "smsCode" : []
      };
      let dataElements = [];
      if((dataSet.dataElements)){
        dataElements = dataSet.dataElements;
      }else{
        dataSet.dataSetElements.map((dataSetElement : any)=>{
          if(dataSetElement && dataSetElement.dataElement){
            dataElements.push(dataSetElement.dataElement)
          }
        })
      }
      let dataElementCount = 0;
      dataElements.map((dataElementData : any)=>{
        let dataElement = {};
        let smsCodeObject : SmsCode = {};
        dataElement["id"] = dataElementData.id;
        let categoryCombo = dataElementData.categoryCombo;
        optionCombos = categoryCombo['categoryOptionCombos'];
        optionCombos.map((optionCombo : any)=>{
          let smsCode = this.getCodeCharacter(smsCodeIndex, new_format);
          smsCodeObject["smsCode"] = smsCode;
          smsCodeObject["dataElement"] = dataElement;
          smsCodeObject["categoryOptionCombos"] = optionCombo.id;
          smsCommand.smsCode.push(smsCodeObject);
          smsCodeIndex++;
        });
        dataElementCount ++;
      });
      dataSetCounter ++;
      smsCommands.push(smsCommand);
    });
    return smsCommands;
  }

  /**
   *
   * @param value
   * @param originalBase
   * @param valueToConvert
   * @returns {string}
   */
  getCodeCharacter(value, valueToConvert) {
    let new_base = valueToConvert.length;
    let new_value = '';
    while (value > 0) {
      let remainder = value % new_base;
      new_value =  (valueToConvert.charAt(remainder)) + new_value;
      value = (value - (value % new_base)) / new_base;
    }
    return new_value || (valueToConvert.charAt(0));
  }



  /**
   * get dataSet command configuration
   * @param dataSetId
   * @param currentUser
   * @returns {Promise<T>}
   */
  getSmsCommandForDataSet(dataSetId,currentUser){
    let ids = [];
    ids.push(dataSetId);
    return new Promise((resolve, reject)=> {
      this.SqlLite.getDataFromTableByAttributes(this.resourceName,"id",ids,currentUser.currentDatabase).then((smsCommands : any)=>{
        if(smsCommands.length > 0){
          resolve(smsCommands[0]);
        }else{
          reject();
        }
      },error=>{
        reject();
      });
    });
  }


  /**
   * @param dataSetId
   * @param period
   * @param orgUnitId
   * @param dataElements
   * @param currentUser
   * @returns {Promise<T>}
   */
  getEntryFormDataValuesObjectFromStorage(dataSetId,period,orgUnitId,dataElements,currentUser){
    let ids = [];

    let entryFormDataValuesObjectFromStorage = {};
    dataElements.forEach((dataElement : any)=>{
      dataElement.categoryCombo.categoryOptionCombos.forEach((categoryOptionCombo : any)=>{
        ids.push(dataSetId + '-' + dataElement.id + '-' + categoryOptionCombo.id + '-' + period + '-' + orgUnitId);
      });
    });
    return new Promise((resolve, reject)=> {
      this.SqlLite.getDataFromTableByAttributes("dataValues","id",ids,currentUser.currentDatabase).then((dataValues : any)=>{
        dataValues.forEach((dataValue : any)=>{
          let id = dataValue.de + "-" +dataValue.co;
          entryFormDataValuesObjectFromStorage[id] = dataValue.value;
        });
        resolve(entryFormDataValuesObjectFromStorage)
      },error=>{
        reject();
      });
    });
  }

  /**
   *
   * @param smsCommand
   * @param entryFormDataValuesObject
   * @param selectedPeriod
   * @returns {Promise<T>}
   */
  getSmsForReportingData(smsCommand,entryFormDataValuesObject,selectedPeriod){
    return new Promise((resolve, reject)=> {
      let sms = [];
      let smsLimit = 135;
      let smsForReportingData = smsCommand.commandName + " " + selectedPeriod.iso + " ";
      let firstValuesFound = false;
      smsCommand.smsCode.forEach((smsCodeObject:any)=>{
        let id = smsCodeObject.dataElement.id + "-" +smsCodeObject.categoryOptionCombos;
        if(entryFormDataValuesObject[id]){
          let value = entryFormDataValuesObject[id];
          if(!firstValuesFound){
            firstValuesFound = true;
          }else if((smsForReportingData + smsCodeObject.smsCode + smsCommand.separator + value).length > smsLimit){
            sms.push(smsForReportingData);
            firstValuesFound = false;
            smsForReportingData = smsCommand.commandName + " " + selectedPeriod.iso + " ";
          }else {
            smsForReportingData = smsForReportingData + "|";
          }
          smsForReportingData = smsForReportingData + smsCodeObject.smsCode + smsCommand.separator + value;
        }
      });
      sms.push(smsForReportingData);
      resolve(sms);
    });
  };


  /**
   *
   * @param phoneNumber
   * @param messages
   * @returns {Promise<T>}
   */
  sendSmsForReportingData(phoneNumber,messages){
    return new Promise((resolve, reject)=> {
      this.sendSms(phoneNumber,messages,0).then((success)=>{
        resolve()
      },error=>{
        reject()})
    });
  }

  /**
   * sending messages recursively
   * @param phoneNumber
   * @param messages
   * @param messageIndex
   * @returns {Promise<T>}
   */
  sendSms(phoneNumber,messages,messageIndex){
    let options={
      replaceLineBreaks: false,
      android: {
        intent: ''
      }
    };

    return new Promise((resolve, reject)=> {
      this.sms.send(phoneNumber,messages[messageIndex], options).then((success)=>{
        messageIndex = messageIndex + 1;
        if(messageIndex < messages.length){
          this.sendSms(phoneNumber,messages,messageIndex).then(()=>{
            resolve();
          },error=>{
            reject(error);
          });
        }else{
          resolve(success);
        }
      },(error)=>{
        reject(error);
      });
    });
  }

  /**
   * get dataElements of a given data set
   * @param dataSet
   * @returns {Array}
   */
  getEntryFormDataElements(dataSet){
    let dataElements = [];
    if(dataSet.dataElements && dataSet.dataElements.length > 0){
      dataElements = dataSet.dataElements;
    }else if(dataSet.dataSetElements && dataSet.dataSetElements.length > 0){
      dataSet.dataSetElements.forEach((dataSetElement :any)=>{
        dataElements.push(dataSetElement.dataElement);
      });
    }
    return dataElements;
  }



}
