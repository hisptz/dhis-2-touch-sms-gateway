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
 */
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the SearchReportListPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'searchReportListPipe'
})
export class SearchReportListPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(reportList: any[], search: string): any[] {
    if (!reportList) return [];
    if (!search) return reportList;
    search = search.toLowerCase();
    return reportList.filter(it => {
      return it.name.toLowerCase().includes(search); // only filter country name
    });
  }
}
