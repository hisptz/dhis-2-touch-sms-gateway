import { createSelector } from '@ngrx/store';
import { getSmsGatewayLogsState } from '../reducers/index';
import {
  getSmsGatewayLogsData,
  getSmsGatewayLogsError
} from '../reducers/smsGatewayLogs.reducers';

export const getCurrentSmsGatewayLogs = createSelector(
  getSmsGatewayLogsState,
  getSmsGatewayLogsData
);

export const getCurrentSmsGatewayLogfError = createSelector(
  getSmsGatewayLogsState,
  getSmsGatewayLogsError
);
