/*
 *
 * Copyright 2015 HISP Tanzania
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 *
 * @since 2015
 * @author Joseph Chingalo <profschingalo@gmail.com>
 *
 */
import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';
import { sharedComponentsModule } from '../../../components/sharedComponents.module';
import { SmsGatwayLogSummaryComponent } from './sms-gatway-log-summary/sms-gatway-log-summary';
import { SmsGatewayLogContainerComponent } from './sms-gateway-log-container/sms-gateway-log-container';
import { SmsGatewayLogComponent } from './sms-gateway-log/sms-gateway-log';

@NgModule({
  declarations: [
    SmsGatwayLogSummaryComponent,
    SmsGatewayLogContainerComponent,
    SmsGatewayLogComponent
  ],
  imports: [IonicModule, TranslateModule.forChild({}), sharedComponentsModule],
  exports: [
    SmsGatwayLogSummaryComponent,
    SmsGatewayLogContainerComponent,
    SmsGatewayLogComponent
  ]
})
export class smsGatewayComponentsModule {}
