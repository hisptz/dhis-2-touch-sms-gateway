import { SmsGateWayLogs } from '../../models/smsCommand';
import * as fromSmsGatewayLogsAction from '../actions/smsGatewayLogs.action';

export interface SmsGatewayLogsState {
  data: Array<SmsGateWayLogs>;
  isLoading: boolean;
  isLoaded: boolean;
}

export const initialState: SmsGatewayLogsState = {
  data: [],
  isLoaded: false,
  isLoading: false
};

export function smsGatewayLogsReducer(
  state: SmsGatewayLogsState = initialState,
  action: fromSmsGatewayLogsAction.SmsGateWayLogsActions
) {
  switch (action.type) {
    case fromSmsGatewayLogsAction.LOADING_LOGS: {
      return { ...state, isLoaded: false, isLoading: true };
    }
    case fromSmsGatewayLogsAction.LOGS_HAVE_BEEN_LOADED: {
      let data = state.data;
      data.unshift(action.payload);
      return { data, isLoaded: true, isLoading: false };
    }
    case fromSmsGatewayLogsAction.FAIL_TO_LOAD_LOGS: {
      return { ...state, isLoaded: false, isLoading: true };
    }
  }
  return state;
}

export const getLoadingStatus = (state: SmsGatewayLogsState) => state.isLoading;
export const getLoadedStatus = (state: SmsGatewayLogsState) => state.isLoaded;
export const getSmsGatewayLogsData = (state: SmsGatewayLogsState) => state.data;
