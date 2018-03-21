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
      (smsConfiguration: SmsConfiguration) => {
        this.dataSetProvider.getAllDataSets(this.currentUser).subscribe(
          (dataSets: Array<DataSet>) => {
            this.dataSets = _.map(dataSets, (dataSet: DataSet) => {
              return {
                id: dataSet.id,
                name: dataSet.name,
                status:
                  smsConfiguration.dataSetIds.indexOf(dataSet.id) > -1
                    ? true
                    : false
              };
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
    const dataSetIds = _.map(_.filter(this.dataSets, { status: true }), 'id');
    this.smsGatewayProvider.getSmsConfigurations(this.currentUser).subscribe(
      (smsConfiguration: SmsConfiguration) => {
        smsConfiguration.dataSetIds = dataSetIds;
        this.smsGatewayProvider
          .setSmsConfigurations(this.currentUser, smsConfiguration)
          .subscribe(
            () => {
              console.log('success set up sms configurations');
            },
            error => {
              console.log(
                'Error on set up sms configurations ' + JSON.stringify(error)
              );
            }
          );
      },
      error => {
        console.log('Error on get sms configurations ' + JSON.stringify(error));
      }
    );
  }

  trackByFn(index, item) {
    return item._id;
  }
}
