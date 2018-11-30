import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'zeroPadding'})
export class ZeroPaddingPipe implements PipeTransform {
  transform(value: any): any {
    let newNum = value > 0 && value < 10 ? "0" + value : value;
    return newNum;
  }
}
