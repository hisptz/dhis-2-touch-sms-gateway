import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SmsGatewayPage } from './sms-gateway';
import { SharedModule } from '../../components/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [SmsGatewayPage],
  imports: [
    IonicPageModule.forChild(SmsGatewayPage),
    SharedModule,
    TranslateModule.forChild({})
  ]
})
export class SmsGatewayPageModule {}
