import { createSelector } from '@ngrx/store';
import { getSmsGatewayLogsState } from '../reducers/index';
import { getSmsGatewayLogsData } from '../reducers/smsGatewayLogs.reducers';

export const getCurrentSmsGatewayLogs = createSelector(
  getSmsGatewayLogsState,
  getSmsGatewayLogsData
);
