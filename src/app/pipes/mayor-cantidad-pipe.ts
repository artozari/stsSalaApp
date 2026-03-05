import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mayorCantidadPipe',
  standalone: true,
})
class MayorCantidadPipe implements PipeTransform {
  transform(value: number): string {
    return value === -1 ? 'Sin juegos' : (value?.toString() ?? null);
  }
}

export { MayorCantidadPipe };
