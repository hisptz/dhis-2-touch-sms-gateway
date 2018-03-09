import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { SmsLogsListCardComponent } from './sms-logs-list-card/sms-logs-list-card';
import { SharedModule } from '../../../components/shared.module';
@NgModule({
  declarations: [SmsLogsListCardComponent],
  imports: [IonicModule, SharedModule],
  exports: [SmsLogsListCardComponent]
})
export class SmsGateWayComponentsModule {}
