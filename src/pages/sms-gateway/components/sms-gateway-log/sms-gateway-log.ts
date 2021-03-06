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
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SmsGateWayLogs } from '../../../../models/sms-gateway-logs';
import { smsLogsStatusIcons } from '../../constants/sms-logs-status';

/**
 * Generated class for the SmsGatewayLogComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'sms-gateway-log',
  templateUrl: 'sms-gateway-log.html'
})
export class SmsGatewayLogComponent implements OnInit, OnDestroy {
  @Input()
  smsGatewayLog: SmsGateWayLogs;
  isSelected: boolean;
  icons: any = {};

  constructor() {
    this.icons = smsLogsStatusIcons;
    this.isSelected = false;
  }

  ngOnInit() {}

  toggleLogsDetails() {
    this.isSelected = !this.isSelected;
  }

  ngOnDestroy() {}
}
