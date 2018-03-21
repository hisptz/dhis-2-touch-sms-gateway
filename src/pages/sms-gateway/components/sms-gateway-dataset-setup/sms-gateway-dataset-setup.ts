import { Component, OnInit, Input } from '@angular/core';
import { SmsGatewayProvider } from '../../../../providers/sms-gateway/sms-gateway';
import { DataSetsProvider } from '../../../../providers/data-sets/data-sets';
import { CurrentUser } from '../../../../models/currentUser';

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
  dataSets: Array<any>;
  @Input() currentUser: CurrentUser;

  constructor(
    private smsGatewayProvider: SmsGatewayProvider,
    private dataSetProvider: DataSetsProvider
  ) {
    this.dataSets = [];
  }

  ngOnInit() {}
}
