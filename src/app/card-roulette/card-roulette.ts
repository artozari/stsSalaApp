import { Component, effect, input, signal } from '@angular/core';
import { MayorCantidadPipe } from '../pipes/mayor-cantidad-pipe';
import { NumeroMesaPipe } from '../pipes/numero-mesa-pipe';
import { RoseComponent } from '../rose/rose.component';

interface IRoseData {
  rose: {
    cantidades: number[];
    porcentajes: number[];
    ruleta: number[];
  };
}

@Component({
  selector: 'app-card-roulette',
  imports: [MayorCantidadPipe, NumeroMesaPipe, RoseComponent],
  templateUrl: './card-roulette.html',
  styleUrl: './card-roulette.css',
})
export class CardRoulette {
  InputidTable = input<number>();
  InputAppRoseData = input<IRoseData>();

  idTableSignal = signal(0);
  appRoseData = signal<IRoseData>({
    rose: {
      cantidades: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
      ],
      porcentajes: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0,
      ],
      ruleta: [
        0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11, 36,
        13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32,
      ],
    },
  });
  mayorCantidad = signal<number>(-1);
  CantidadJugadas = signal<number>(0);

  constructor() {
    effect(() => {
      const Id = this.InputidTable();
      this.idTableSignal.set(Id || 0);
      const data = this.InputAppRoseData();
      this.appRoseData.set(data || { ...this.appRoseData() });
      this.mayorCantidad.set(this.calcularMayorCantidad(this.appRoseData().rose.cantidades));
      this.CantidadJugadas.set(this.cantidadJugadas());
      console.log(typeof Id, Id, 'id de card roulette');
    });
  }

  calcularMayorCantidad(cantidades: number[]): number {
    let pos = Math.max(...cantidades);
    return this.appRoseData().rose.ruleta[cantidades.indexOf(pos)];
  }

  cantidadJugadas() {
    return this.appRoseData().rose.cantidades.reduce((acc, val) => acc + val, 0);
  }
}
