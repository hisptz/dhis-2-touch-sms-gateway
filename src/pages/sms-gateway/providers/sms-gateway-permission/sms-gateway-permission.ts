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
import { Observable } from 'rxjs/Rx';
import { AndroidPermissions } from '@ionic-native/android-permissions';

/*
  Generated class for the SmsGatewayPermissionProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SmsGatewayPermissionProvider {
  constructor(private androidPermissions: AndroidPermissions) {}

  getSMSPermisionStatus(): Observable<any> {
    return new Observable(observer => {
      this.androidPermissions
        .checkPermission(this.androidPermissions.PERMISSION.READ_SMS)
        .then(
          result => {
            observer.next(result.hasPermission);
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
    });
  }

  requestSMSPermission(): Observable<any> {
    return new Observable(observer => {
      this.androidPermissions
        .requestPermission(this.androidPermissions.PERMISSION.READ_SMS)
        .then((response: any) => {
          observer.next(response.hasPermission);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}
