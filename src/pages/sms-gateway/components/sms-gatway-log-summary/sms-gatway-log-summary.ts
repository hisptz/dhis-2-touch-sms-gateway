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
  OnDestroy,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { smsLogsStatusIcons } from '../../constants/sms-logs-status';
import * as _ from 'lodash';

/**
 * Generated class for the SmsGatwayLogSummaryComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'sms-gatway-log-summary',
  templateUrl: 'sms-gatway-log-summary.html'
})
export class SmsGatwayLogSummaryComponent implements OnInit, OnDestroy {
  @Input()
  smsGatewayLogSummary;
  @Input()
  currentSmsLogStatus: string;

  @Output()
  currentSmsLogStatusUpdate = new EventEmitter();

  icons: any[];

  constructor() {
    this.icons = [];
  }

  ngOnInit() {
    this.icons = _.map(Object.keys(smsLogsStatusIcons), key => {
      return {
        id: key,
        src: smsLogsStatusIcons[key]
      };
    });
  }

  onCurrentSmsLogStatusUpdate(status) {
    this.currentSmsLogStatusUpdate.emit(status);
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index;
  }

  ngOnDestroy() {
    this.icons = null;
  }
}
