import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Inject, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateAgo',
  pure: true,
})
export class DateAgoPipe implements PipeTransform {
  constructor() {}

  translateObjs: any = {
    'zh-CN': {
      JUST_NOW: '刚刚',
      YEAR: '年',
      MONTH: '月',
      WEEK: '周',
      DAY: '天',
      HOUR: '小时',
      MINUTE: '分钟',
      SECOND: '秒',
      AGO: '前',
      SAGO: '前',
    },

    en: {
      JUST_NOW: 'Just now',
      YEAR: 'year',
      MONTH: 'month',
      WEEK: 'week',
      DAY: 'day',
      HOUR: 'hour',
      MINUTE: 'minute',
      SECOND: 'second',
      AGO: ' ago',
      SAGO: 's ago',
    },
  };

  transform(value: any, lang: string = 'en'): any {
    if (value) {
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
      if (seconds < 29) {
        return this.translateObjs[lang].JUST_NOW;
      }

      const intervals: any = {
        YEAR: 31536000,
        MONTH: 2592000,
        WEEK: 604800,
        DAY: 86400,
        HOUR: 3600,
        MINUTE: 60,
        SECOND: 1,
      };

      let counter;

      for (const i in intervals) {
        counter = Math.floor(seconds / intervals[i]);
        if (counter > 0) {
          if (counter === 1) {
            console.log(this.translateObjs[lang]);
            return (
              counter +
              ' ' +
              this.translateObjs[lang][i] +
              this.translateObjs[lang].AGO
            );
          } else {
            return (
              counter +
              ' ' +
              this.translateObjs[lang][i] +
              this.translateObjs[lang].SAGO
            );
          }
        }
      }
    }

    return value;
  }
}
