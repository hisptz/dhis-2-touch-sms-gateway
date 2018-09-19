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
  getSmsGatewayLogsByCurrentStatus
} from '../../store';
import { Observable } from 'rxjs';
import { CurrentUser } from '../../models';
import { SmsGateWayLogs } from '../../models/sms-gateway-logs';

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
  }

  ngOnInit() {}
}
