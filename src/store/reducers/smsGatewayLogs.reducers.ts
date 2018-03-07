import { SmsGateWayLogs, SmsGateWayLogsError } from '../../models/smsCommand';
import * as fromSmsGatewayLogsAction from '../actions/smsGatewayLogs.action';

export interface SmsGatewayLogsState {
  logs: Array<SmsGateWayLogs>;
  error: Array<SmsGateWayLogsError>;
  isLoading: boolean;
}

export const initialState: SmsGatewayLogsState = {
  logs: [],
  error: [],
  isLoading: false
};

export function smsGatewayLogsReducer(
  state: SmsGatewayLogsState = initialState,
  action: fromSmsGatewayLogsAction.SmsGateWayLogsActions
) {
  switch (action.type) {
    case fromSmsGatewayLogsAction.LOADING_LOGS: {
      return { ...state, isLoading: true };
    }
    case fromSmsGatewayLogsAction.LOGS_HAVE_BEEN_LOADED: {
      let logs = state.logs;
      logs.unshift(action.payload);
      return { ...state, logs, isLoading: false };
    }
    case fromSmsGatewayLogsAction.FAIL_TO_LOAD_LOGS: {
      let error = state.error;
      error.unshift(action.payload);
      return { ...state, error, isLoading: false };
    }
  }
  return state;
}

export const getLoadingStatus = (state: SmsGatewayLogsState) => state.isLoading;
export const getSmsGatewayLogsData = (state: SmsGatewayLogsState) => state.logs;
export const getSmsGatewayLogsError = (state: SmsGatewayLogsState) =>
  state.error;
