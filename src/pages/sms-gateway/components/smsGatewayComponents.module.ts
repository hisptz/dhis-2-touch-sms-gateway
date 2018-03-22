import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SmsLogsListCardComponent } from './sms-logs-list-card/sms-logs-list-card';
import { SharedModule } from '../../../components/shared.module';
import { SmsGatewayDatasetSetupComponent } from './sms-gateway-dataset-setup/sms-gateway-dataset-setup';
import { SmsToReadableTableComponent } from './sms-to-readable-table/sms-to-readable-table';
@NgModule({
  declarations: [
    SmsLogsListCardComponent,
    SmsGatewayDatasetSetupComponent,
    SmsToReadableTableComponent
  ],
  imports: [IonicModule, SharedModule],
  exports: [
    SmsLogsListCardComponent,
    SmsGatewayDatasetSetupComponent,
    SmsToReadableTableComponent
  ]
})
export class SmsGateWayComponentsModule {}
