import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'milsegtotime',
})
export class MilsegtotimePipe implements PipeTransform {
  transform(value: number): string {
    if (value === -1) {
      return 'No establecido';
    }
    const milliseconds = value;
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
}
