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
import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  Output,
  EventEmitter
} from '@angular/core';
import { SmsGateWayLogs } from '../../../../models/sms-gateway-logs';

/**
 * Generated class for the SmsGatewayLogContainerComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'sms-gateway-log-container',
  templateUrl: 'sms-gateway-log-container.html'
})
export class SmsGatewayLogContainerComponent implements OnInit, OnDestroy {
  @Input()
  currentUser;
  @Input()
  dataElements;
  @Input()
  dataSetInformation;
  @Input()
  smsCommandMapper;
  @Input()
  smsGatewayLogs: SmsGateWayLogs[];

  @Output()
  startSmsGateway = new EventEmitter();

  constructor() {}

  ngOnInit() {
    if (
      this.dataElements &&
      this.smsCommandMapper &&
      this.dataSetInformation &&
      this.currentUser
    ) {
      this.startSmsGateway.emit({
        dataElements: this.dataElements,
        smsCommandMapper: this.smsCommandMapper,
        dataSetInformation: this.dataSetInformation,
        currentUser: this.currentUser
      });
    }
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index;
  }

  ngOnDestroy() {
    this.currentUser = null;
    this.dataElements = null;
    this.dataSetInformation = null;
    this.smsCommandMapper = null;
    this.smsGatewayLogs = null;
  }
}
