import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numeroMesaPipe',
  standalone: true,
})
class NumeroMesaPipe implements PipeTransform {
  
  transform(value: number): string {
    return value === 0 ? 'Todas las Mesas' : 'Mesa: ' + (value?.toString() ?? null);
  }
}

export { NumeroMesaPipe };
