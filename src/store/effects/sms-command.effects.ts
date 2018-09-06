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
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { CurrentUserActionTypes, SetCurrentUser } from '../actions';
import { CurrentUser } from '../../models/currentUser';

@Injectable()
export class SmsCommandEffects {
  constructor(private actions$: Actions) {}

  //   @Effect()
  //   loadAllArticles$: Observable<Action> = this.actions$
  //     .ofType(CurrentUserActionTypes.AddCurrentUser)
  //     .map((actions: any) => {
  //       const currentUser: CurrentUser = actions.payload.currentUser;
  //       return new SetCurrentUser({ id: currentUser.id });
  //     });
}
