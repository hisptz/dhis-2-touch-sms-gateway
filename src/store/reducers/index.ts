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
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { currentUserState, currentUserReducer } from './current-user.reducer';
import { SmsCommandState, smsCommandReducer } from './sms-command.reducer';
import { DataSetState, dataSetReducer } from './data-set.reducer';
import {
  SmsGatewayLogsState,
  smsGatewayLogReducer
} from './sms-gateway-logs.reducer';

export interface State {
  currentUser: currentUserState;
  smsCommand: SmsCommandState;
  smsGatewayLog: SmsGatewayLogsState;
  dataSet: DataSetState;
}

export const reducers: ActionReducerMap<State> = {
  currentUser: currentUserReducer,
  smsCommand: smsCommandReducer,
  smsGatewayLog: smsGatewayLogReducer,
  dataSet: dataSetReducer
};
export const getRootState = (state: State) => state;
export const metaReducers: MetaReducer<State>[] = [];
