import { Action } from '@ngrx/store';
import { SmsGateWayLogs, SmsGateWayLogsError } from '../../models/smsCommand';

//loading logs actions
export const LOADING_LOGS = '[SMS GateWay Logs] Loading logs';
export const LOGS_HAVE_BEEN_LOADED = '[SMS GateWay Logs] Logs have been loaded';
export const LOGS_HAVE_SAVED =
  '[SMS GateWay Logs] Logs have been save on local storage';
export const FAIL_TO_LOAD_LOGS = '[SMS GateWay Logs] Fail to load logs';

export class LoadingLogs implements Action {
  readonly type = LOADING_LOGS;
}

export class LogsHaveBeenSaved implements Action {
  readonly type = LOGS_HAVE_SAVED;
}

export class LogsHaveBeenLoaded implements Action {
  readonly type = LOGS_HAVE_BEEN_LOADED;
  constructor(public payload: Array<SmsGateWayLogs>) {}
}

export class FailToLoadLogs implements Action {
  readonly type = FAIL_TO_LOAD_LOGS;
  constructor(public payload: SmsGateWayLogsError) {}
}

export type SmsGateWayLogsActions =
  | LoadingLogs
  | LogsHaveBeenLoaded
  | LogsHaveBeenSaved
  | FailToLoadLogs;
