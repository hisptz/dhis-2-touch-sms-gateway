import {Injectable} from '@angular/core';
import {HttpClientProvider} from "../http-client/http-client";
import {SqlLiteProvider} from "../sql-lite/sql-lite";
import {DataSet} from "../../models/dataSet";


/*
  Generated class for the DataSetsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DataSetsProvider {

  readonly resourceName = 'dataSets';

  constructor(private httpClient: HttpClientProvider, private sqlLite : SqlLiteProvider) {
  }

  /**
   *
   * @param currentUser
   * @returns {Promise<any>}
   */
  downloadDataSetsFromServer(currentUser) {
    let url = '/api/dataSets.json?fields=id,name,dataSetElements[dataElement[id,categoryCombo[categoryOptionCombos[id,name]]]],dataElements[id,categoryCombo[categoryOptionCombos[id,name]]]';
    return new Promise((resolve, reject) => {
      this.httpClient.get(url, currentUser, this.resourceName, 50).then((response: any) => {
        resolve(response[this.resourceName]);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   *
   * @param dataSets
   * @param currentUser
   * @returns {Promise<any>}
   */
  saveDataSetsFromServer(dataSets, currentUser) {
    return new Promise((resolve, reject) => {
      this.sqlLite.insertBulkDataOnTable(this.resourceName,dataSets,currentUser.currentDatabase).then(()=>{
        resolve();
      }).catch((error)=>{
        reject(error);
      });
    })
  }

  /**
   *
    * @param currentUser
   * @returns {Promise<any>}
   */
  getAllDataSets(currentUser){
    return new Promise((resolve, reject) => {
      this.sqlLite.getAllDataFromTable(this.resourceName,currentUser.currentDatabase).then((dataSets : Array<DataSet>)=>{
        resolve(dataSets);
      }).catch((error=>{
        reject(error);
      }))
    });
  }

}
