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
import { Component, OnInit } from '@angular/core';
import { IonicPage } from 'ionic-angular';

import { Store } from '@ngrx/store';
import { State, getCurrentUser } from '../../store';
import { Observable } from 'rxjs';
import { CurrentUser } from '../../models';

/**
 * Generated class for the SmsGatewayPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-sms-gateway',
  templateUrl: 'sms-gateway.html'
})
export class SmsGatewayPage implements OnInit {
  currentUser$: Observable<CurrentUser>;

  constructor(private store: Store<State>) {
    this.currentUser$ = this.store.select(getCurrentUser);
  }

  ngOnInit() {}
}
