import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingPage } from './setting';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../components/shared.module';
import { SmsGateWayComponentsModule } from '../sms-gateway/components/smsGatewayComponents.module';

@NgModule({
  declarations: [SettingPage],
  imports: [
    IonicPageModule.forChild(SettingPage),
    SharedModule,
    TranslateModule.forChild(),
    SmsGateWayComponentsModule
  ]
})
export class SettingPageModule {}
