import { Component, signal, input, output, effect } from '@angular/core';
import { CardRoulette } from '../card-roulette/card-roulette';

interface IRoseData {
  mesa: number; // optional table number
  ltengames: number[];
  timeLastGame: number;
  status: string | boolean;
  broker?: string;
  casinoCode?: string;
  casinoName?: string;
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
  appRoseDataInput = input<IRoseData[]>();
  computeDataInput = input<(number | string | boolean)[]>();
  casinoTitle = input<string>('');
  detallesClick = output<{ mesa: number; casinoCode?: string }>();

  appRoseData = signal<IRoseData[]>([
    {
      mesa: 0,
      ltengames: [],
      timeLastGame: 0,
      status: '',
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
      const data = this.appRoseDataInput();
      this.appRoseData.set(data || this.appRoseData());
    });
  }
}
