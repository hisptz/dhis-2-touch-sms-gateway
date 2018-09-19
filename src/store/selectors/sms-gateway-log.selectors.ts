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
import { createSelector } from '@ngrx/store';
import * as _ from 'lodash';
import { getRootState, State } from '../reducers';
import {
  smsGatewayLogsAdapter,
  SmsGatewayLogsState
} from '../reducers/sms-gateway-logs.reducer';
import { SmsGateWayLogs } from '../../models/sms-gateway-logs';

export const getSmsGatewayLogsEntityState = createSelector(
  getRootState,
  (state: State) => state.smsGatewayLog
);

export const getCurrentSmsLogStatus = createSelector(
  getSmsGatewayLogsEntityState,
  (state: SmsGatewayLogsState) => state.status
);

export const {
  selectIds: getSmsGatewayLogsIds,
  selectEntities: getSmsGatewayLogEntities,
  selectAll: getAllSmsGatewayLogs
} = smsGatewayLogsAdapter.getSelectors(getSmsGatewayLogsEntityState);

export const getSmsGatewayLogsByCurrentStatus = createSelector(
  getAllSmsGatewayLogs,
  getCurrentSmsLogStatus,
  (smsGateWayLogs: SmsGateWayLogs[], status: string) => {
    return _.filter(smsGateWayLogs, (smsGateWayLog: SmsGateWayLogs) => {
      return smsGateWayLog.type === status;
    });
  }
);
