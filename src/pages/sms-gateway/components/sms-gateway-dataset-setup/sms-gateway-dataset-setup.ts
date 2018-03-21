import { Component, OnInit, Input } from '@angular/core';
import { SmsGatewayProvider } from '../../../../providers/sms-gateway/sms-gateway';
import { DataSetsProvider } from '../../../../providers/data-sets/data-sets';
import { CurrentUser } from '../../../../models/currentUser';
import { SmsConfiguration } from '../../../../models/smsCommand';
import { DataSet } from '../../../../models/dataSet';
import * as _ from 'lodash';

/**
 * Generated class for the SmsGatewayDatasetSetupComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'sms-gateway-dataset-setup',
  templateUrl: 'sms-gateway-dataset-setup.html'
})
export class SmsGatewayDatasetSetupComponent implements OnInit {
  @Input() currentUser: CurrentUser;
  dataSets: Array<any>;
  isLoading: boolean;

  constructor(
    private smsGatewayProvider: SmsGatewayProvider,
    private dataSetProvider: DataSetsProvider
  ) {
    this.isLoading = true;
    this.dataSets = [];
  }

  ngOnInit() {
    this.smsGatewayProvider.getSmsConfigurations(this.currentUser).subscribe(
      (smConfiguration: SmsConfiguration) => {
        this.dataSetProvider.getAllDataSets(this.currentUser).subscribe(
          (dataSets: Array<DataSet>) => {
            dataSets.map((dataSet: DataSet) => {
              this.dataSets.push({
                id: dataSet.id,
                name: dataSet.name,
                status:
                  smConfiguration.dataSetIds.indexOf(dataSet.id) > -1
                    ? true
                    : false
              });
            });
            this.isLoading = false;
          },
          error => {
            this.isLoading = false;
          }
        );
      },
      error => {
        this.isLoading = false;
      }
    );
  }

  updateSelectedItems() {
    const seletectDataSets = _.filter(this.dataSets, { status: true });
    const dataSetIds = _.map(seletectDataSets, 'id');
    console.log(dataSetIds);
  }
}
