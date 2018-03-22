import { Component, Input, OnInit } from '@angular/core';
import { SmsGateWayLogs, SmsCommand } from '../../../../models/smsCommand';
import { AppTranslationProvider } from '../../../../providers/app-translation/app-translation';
import * as _ from 'lodash';
import { SmsGatewayProvider } from '../../../../providers/sms-gateway/sms-gateway';

/**
 * Generated class for the SmsLogsListCardComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'sms-logs-list-card',
  templateUrl: 'sms-logs-list-card.html'
})
export class SmsLogsListCardComponent implements OnInit {
  @Input() smsLog: SmsGateWayLogs;
  @Input() dataElements;
  @Input() smsCommandMapper;
  icons: any;
  isSelected: boolean;
  translationMapper: any;
  hasSMSDecrypted: boolean;
  constructor(
    private appTranslation: AppTranslationProvider,
    private smsGatewayProvider: SmsGatewayProvider
  ) {
    this.hasSMSDecrypted = false;
    this.icons = {
      danger: 'assets/icon/danger.png',
      info: 'assets/icon/info.png',
      irrelevant: 'assets/icon/irrelevant.png',
      warning: 'assets/icon/warning.png'
    };
    this.isSelected = false;
  }

  ngOnInit() {
    this.translationMapper = {};
    this.appTranslation.getTransalations(this.getValuesToTranslate()).subscribe(
      (data: any) => {
        this.translationMapper = data;
      },
      error => {}
    );
    if (this.smsLog && this.smsLog.message && this.smsCommandMapper) {
      const smsResponseArray = this.smsGatewayProvider.getSmsResponseArray(
        this.smsLog.message
      );
      const availableSmsCodes = Object.keys(this.smsCommandMapper);
      console.log(smsResponseArray.length);
      if (
        smsResponseArray.length == 3 &&
        availableSmsCodes.indexOf(smsResponseArray[0]) > -1
      ) {
        const smsCommandObject: SmsCommand = this.smsCommandMapper[
          smsResponseArray[0]
        ];
        const smsCodeToValueMapper = this.smsGatewayProvider.getSmsCodeToValueMapper(
          smsResponseArray[2],
          smsCommandObject.separator
        );
        if (Object.keys(smsCodeToValueMapper).length > -1) {
          this.hasSMSDecrypted = true;
          const dataValues = this.smsGatewayProvider.getDataValusFromSmsContents(
            smsCommandObject,
            smsCodeToValueMapper
          );
          console.log(JSON.stringify(dataValues));
        }
      }
    }
  }

  toggleLogsDetails() {
    this.isSelected = !this.isSelected;
  }

  getSmsResponseArray(smsResponse) {
    return _.map(smsResponse.body.split(' '), (content: string) => {
      return content.trim();
    });
  }

  getValuesToTranslate() {
    return ['Sender', 'SMS Content'];
  }
}
