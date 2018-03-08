import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import * as smsGatewayLogsActions from '../actions/smsGatewayLogs.action';
import { SmsGatewayProvider } from '../../providers/sms-gateway/sms-gateway';
import { SmsGateWayLogs } from '../../models/smsCommand';

@Injectable()
export class SmsGatewayLogsEffects {
  constructor(
    private actions$: Actions,
    private smsGatewayLogs: SmsGatewayProvider
  ) {}
}
