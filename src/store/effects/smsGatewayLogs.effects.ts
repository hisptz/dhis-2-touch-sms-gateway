import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import * as smsGatewayLogsActions from '../actions/smsGatewayLogs.action';
import { SmsGatewayProvider } from '../../providers/sms-gateway/sms-gateway';

@Injectable()
export class SmsGatewayLogsEffects {
  constructor(
    private actions$: Actions,
    private smsGatewayLogs: SmsGatewayProvider
  ) {}

  @Effect()
  loadSMSLogs$ = this.actions$.ofType(smsGatewayLogsActions.LOADING_LOGS).pipe(
    switchMap(() => {
      return this.smsGatewayLogs
        .getAllSavedSmsLogs()
        .pipe(
          map(
            logs => new smsGatewayLogsActions.LogsHaveBeenLoaded(logs),
            catchError(error =>
              of(new smsGatewayLogsActions.FailToLoadLogs(error))
            )
          )
        );
    })
  );
}
