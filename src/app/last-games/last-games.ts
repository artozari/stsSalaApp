import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-last-games',
  imports: [],
  templateUrl: './last-games.html',
  styleUrl: './last-games.css',
})
export class LastGames {
  blackNumbers: number[] = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
  redNumbers: number[] = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  greenNumbers: number[] = [0];
  lastNumbers = input<number[]>([]);
  // always expose only the last ten values
  lastNumbersSignal = computed(() => (this.lastNumbers() ?? []).slice(-10));

  getNumberColor(number: number): string {
    if (this.blackNumbers.includes(number)) return 'black';
    if (this.redNumbers.includes(number)) return 'red';
    if (this.greenNumbers.includes(number)) return 'green';
    return 'transparent';
  }
}
