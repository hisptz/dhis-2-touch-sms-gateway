import { Component, Input, OnInit } from '@angular/core';

/**
 * Generated class for the SmsToReadableTableComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'sms-to-readable-table',
  templateUrl: 'sms-to-readable-table.html'
})
export class SmsToReadableTableComponent implements OnInit {
  @Input() dataElements;
  @Input() dataValueMapper;
  @Input() seletectDataElements;

  constructor() {}
  ngOnInit() {}

  getLabel(dataElement) {
    let label = dataElement.name;
    if (
      dataElement &&
      dataElement.formName &&
      (dataElement.formName != '0' || dataElement.formName != '0.0')
    ) {
      label = dataElement.formName;
    }
    return label;
  }

  trackByFn(index, item) {
    return item._id;
  }
}
