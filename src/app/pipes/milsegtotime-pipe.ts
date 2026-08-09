import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'milsegtotime',
})
export class MilsegtotimePipe implements PipeTransform {
  transform(value: number): string {
    if (value === -1) {
      return 'No establecido';
    }
    // Obtener offset de zona horaria local en milisegundos
    const timezoneOffsetMs = new Date().getTimezoneOffset() * 60000;

    const milliseconds = value;
    const seconds = Math.floor((milliseconds - timezoneOffsetMs) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const remainingSeconds = seconds % 60;
    return `${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
}
