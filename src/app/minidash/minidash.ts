import { Component, signal, input, effect } from '@angular/core';
import { CardRoulette } from '../card-roulette/card-roulette';

interface IRoseData {
  rose: {
    cantidades: number[];
    porcentajes: number[];
    ruleta: number[];
  };
}

@Component({
  selector: 'app-minidash',
  imports: [CardRoulette],
  templateUrl: './minidash.html',
  styleUrl: './minidash.css',
})
export class Minidash {
  // cambia a un arreglo para almacenar múltiples ids de mesa si es necesario
  tablesIds = input<number[]>();
  appRoseDataInput = input<IRoseData[]>();

  tableId = signal<number[]>([]);
  appRoseData = signal<IRoseData[]>([
    {
      rose: {
        cantidades: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0,
        ],
        porcentajes: [
          0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0,
        ],
        ruleta: [
          0, 26, 3, 35, 12, 28, 7, 29, 18, 22, 9, 31, 14, 20, 1, 33, 16, 24, 5, 10, 23, 8, 30, 11,
          36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15, 32,
        ],
      },
    },
  ]);

  constructor() {
    effect(() => {
      const ids = this.tablesIds();
      this.tableId.set(ids ? [...ids] : []);
      const data = this.appRoseDataInput();
      this.appRoseData.set(data || this.appRoseData());
    });
  }
}
