import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SmsLogsListCardComponent } from './sms-logs-list-card/sms-logs-list-card';
import { SharedModule } from '../../../components/shared.module';
import { SmsGatewayDatasetSetupComponent } from './sms-gateway-dataset-setup/sms-gateway-dataset-setup';
@NgModule({
  declarations: [SmsLogsListCardComponent, SmsGatewayDatasetSetupComponent],
  imports: [IonicModule, SharedModule],
  exports: [SmsLogsListCardComponent, SmsGatewayDatasetSetupComponent]
})
export class SmsGateWayComponentsModule {}
