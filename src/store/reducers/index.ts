import { ActionReducerMap, createFeatureSelector } from '@ngrx/store';
import { currentUserReducer, CurrentUserState } from './currentUser.reducers';
import {
  SmsGatewayLogsState,
  smsGatewayLogsReducer
} from './smsGatewayLogs.reducers';

export interface ApplicationState {
  currentUser: CurrentUserState;
  smsLogs: SmsGatewayLogsState;
}

export const reducers: ActionReducerMap<ApplicationState> = {
  currentUser: currentUserReducer,
  smsLogs: smsGatewayLogsReducer
};

export const getCurrentUserState = createFeatureSelector<CurrentUserState>(
  'currentUser'
);

export const getSmsGatewayLogsState = createFeatureSelector<
  SmsGatewayLogsState
>('smsLogs');
