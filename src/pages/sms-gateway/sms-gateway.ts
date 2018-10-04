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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicPage, MenuController } from 'ionic-angular';
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
import { Subscription } from 'rxjs/Subscription';
import { CurrentUser } from '../../models';
import { SmsGateWayLogs } from '../../models/sms-gateway-logs';
import { smsLogsStatus } from './constants/sms-logs-status';
import { SmsGatewayPermissionProvider } from './providers/sms-gateway-permission/sms-gateway-permission';
import { AppProvider } from '../../providers/app/app';
import { SmsGatewayProvider } from './providers/sms-gateway/sms-gateway';

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
export class SmsGatewayPage implements OnInit, OnDestroy {
  currentUser$: Observable<CurrentUser>;
  smsCommandMapper$: Observable<any>;
  dataSetInformation$: Observable<any>;
  dataElements$: Observable<any>;
  isDataSetLoaded$: Observable<boolean>;
  isSmsCommandLoaded$: Observable<boolean>;
  smsGatewayLogs$: Observable<SmsGateWayLogs[]>;
  smsGatewayLogSummary$: Observable<any>;
  currentSmsLogStatus$: Observable<string>;

  subscriptions: Subscription;
  constructor(
    private store: Store<State>,
    private smsGatewayPermissionProvider: SmsGatewayPermissionProvider,
    private smsGatewayProvider: SmsGatewayProvider,
    private appProvider: AppProvider,
    private menuCtrl: MenuController
  ) {
    this.subscriptions = new Subscription();
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
    this.menuCtrl.enable(true);
  }

  onCurrentSmsLogStatusUpdate(status: string) {
    this.store.dispatch(new UpdateSmsGatewayLogStatus({ status }));
  }

  onStartSmsGateway(data: any) {
    const { smsCommandMapper } = data;
    const { dataSetInformation } = data;
    const { currentUser } = data;
    this.discoveringSavedLogs(currentUser);
    this.subscriptions.add(
      this.smsGatewayPermissionProvider.requestSMSPermission().subscribe(
        () => {
          this.smsGatewayProvider.startWatchSms(
            smsCommandMapper,
            dataSetInformation,
            currentUser
          );
          this.appProvider.setNormalNotification(
            'SMS gatway is now listening for incoming SMS'
          );
        },
        error => {
          this.appProvider.setNormalNotification(error);
        }
      )
    );
  }

  discoveringSavedLogs(currentUser) {
    this.smsGatewayProvider
      .getAllSavedSmsLogs(currentUser)
      .subscribe((logs: SmsGateWayLogs[]) => {
        this.store.dispatch(new AddSmsGateWayLogs({ logs }));
      });
  }

  clearAllSubscriptions() {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  }

  ngOnDestroy() {
    this.clearAllSubscriptions();
  }
}
