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
import { Component, OnInit } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Store, select } from '@ngrx/store';
import {
  State,
  getSmsCommandMapper,
  getDataSetInformation,
  getDataSetLoadedState,
  getSmsCommandLoadedState,
  getDataElements,
  getCurrentUser,
  getSmsGatewayLogsByCurrentStatus,
  AddSmsGateWayLogs,
  getSmsGatewayLogsSummary,
  getCurrentSmsLogStatus,
  UpdateSmsGatewayLogStatus
} from '../../store';
import { Observable } from 'rxjs';
import { CurrentUser } from '../../models';
import { SmsGateWayLogs } from '../../models/sms-gateway-logs';
import { smsLogsStatus } from './constants/sms-logs-status';

/**
 * Generated class for the SmsGatewayPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sms-gateway',
  templateUrl: 'sms-gateway.html'
})
export class SmsGatewayPage implements OnInit {
  currentUser$: Observable<CurrentUser>;
  smsCommandMapper$: Observable<any>;
  dataSetInformation$: Observable<any>;
  dataElements$: Observable<any>;
  isDataSetLoaded$: Observable<boolean>;
  isSmsCommandLoaded$: Observable<boolean>;
  smsGatewayLogs$: Observable<SmsGateWayLogs[]>;
  smsGatewayLogSummary$: Observable<any>;
  currentSmsLogStatus$: Observable<string>;

  constructor(private store: Store<State>) {
    this.isDataSetLoaded$ = this.store.pipe(select(getDataSetLoadedState));
    this.isSmsCommandLoaded$ = this.store.pipe(
      select(getSmsCommandLoadedState)
    );
    this.currentUser$ = this.store.pipe(select(getCurrentUser));
    this.dataElements$ = this.store.pipe(select(getDataElements));
    this.dataSetInformation$ = this.store.pipe(select(getDataSetInformation));
    this.smsCommandMapper$ = this.store.pipe(select(getSmsCommandMapper));
    this.smsGatewayLogs$ = this.store.pipe(
      select(getSmsGatewayLogsByCurrentStatus)
    );
    this.smsGatewayLogSummary$ = this.store.pipe(
      select(getSmsGatewayLogsSummary(smsLogsStatus))
    );
    this.currentSmsLogStatus$ = this.store.pipe(select(getCurrentSmsLogStatus));
  }

  ngOnInit() {
    const logs: SmsGateWayLogs[] = this.getSampleLogs();
    setTimeout(() => {
      this.store.dispatch(new AddSmsGateWayLogs({ logs }));
    }, 4000);
  }

  onCurrentSmsLogStatusUpdate(status: string) {
    this.store.dispatch(new UpdateSmsGatewayLogStatus({ status }));
  }

  getSampleLogs(): SmsGateWayLogs[] {
    return [
      { type: 'info', time: '1', id: '1', logMessage: 'log 1' },
      { type: 'info', time: '3', id: '2', logMessage: 'log 2' },
      { type: 'info', time: '2', id: '3', logMessage: 'log 3' },
      { type: 'danger', time: '5', id: '4', logMessage: 'log 4' },
      { type: 'warning', time: '6', id: '7', logMessage: 'log 5' },
      { type: 'warning', time: '7', id: '5', logMessage: 'log 6' },
      { type: 'danger', time: '23', id: '6', logMessage: 'log 7' },
      { type: 'irrelevant', time: '10', id: '8', logMessage: 'log 8' },
      { type: 'danger', time: '9', id: '9', logMessage: 'log 89' }
    ];
  }
}
