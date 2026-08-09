import { Component, effect, input, output, signal } from '@angular/core';
import { MayorCantidadPipe } from '../pipes/mayor-cantidad-pipe';
import { NumeroMesaPipe } from '../pipes/numero-mesa-pipe';
import { MilsegtotimePipe } from '../pipes/milsegtotime-pipe';
import { RoseComponent } from '../rose/rose.component';
import { HorizontalBarsRouletteComponent } from '../horizontal-bars-roulette-component/horizontal-bars-roulette-component';
import { VerticalBarsRoulette } from '../vertical-bars-roulette/vertical-bars-roulette';
import { LastGames } from '../last-games/last-games';

interface IRoseData {
  mesa: number;
  ltengames: number[];
  timeLastGame: number;
  status: string | boolean;
  rose: {
    cantidades: number[];
    porcentajes: number[];
    ruleta: number[];
  };
}

@Component({
  selector: 'app-card-roulette',
  imports: [
    MayorCantidadPipe,
    NumeroMesaPipe,
    MilsegtotimePipe,
    RoseComponent,
    HorizontalBarsRouletteComponent,
    VerticalBarsRoulette,
    LastGames,
  ],
  templateUrl: './card-roulette.html',
  styleUrl: './card-roulette.css',
})
export class CardRoulette {
  varColors = signal<number[]>([0, 0, 0]);
  varParImpar = signal<number[]>([0, 0]);
  varHighLow = signal<number[]>([0, 0]);
  varColumns = signal<number[]>([0, 0, 0]);
  varDocenas = signal<number[]>([0, 0, 0]);
  lastNumbers = signal<number[]>([]);
  idTableSignal = signal(0);
  mayorCantidad = signal<number>(-1);
  CantidadJugadas = signal<number>(0);
  timeAfterLastGame = signal<number>(-1);
  estado = signal<string | boolean>('');
  appRoseData = signal<IRoseData>({
    mesa: 0,
    ltengames: [],
    timeLastGame: 0,
    status: '',
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

  //--> esto es solo para testear los cambios, aqui deberia obtener datos desde mqtt o un servicio de cada mesa
  // inter = setInterval(() => {                                                                             //-->
  //   const nu = Math.floor(Math.random() * (50 - 20 + 1)) + 20;                                            //-->
  //   const nu2 = Math.floor(Math.random() * 10) - 5;                                                       //-->
  //   this.varColors.set([Math.abs(nu2 * 5), nu + nu2, nu - nu2]);                                          //-->
  //   this.varParImpar.set([nu, nu + nu2]);                                                                 //-->
  //   this.varHighLow.set([nu, nu + nu2]);                                                                  //-->
  //   this.varColumns.set([nu, nu + nu2, nu - nu2]);                                                        //-->
  //   this.varDocenas.set([nu, nu + nu2, nu - nu2]);                                                        //-->
  // }, 200000);                                                                                             //-->
  //--> esto es solo para testear los cambios, aqui deberia obtener datos desde mqtt o un servicio de cada mesa

  InputAppRoseData = input<IRoseData>();
  showDetalles = input<boolean>(true);
  detallesClick = output<number>();

  onDetalles() {
    this.detallesClick.emit(this.appRoseData().mesa);
  }

  constructor() {
    effect(() => {
      const Id = this.InputAppRoseData()?.mesa;
      this.idTableSignal.set(Id || 0);

      const last = this.InputAppRoseData()?.ltengames;
      this.lastNumbers.set(last || []);

      const timeLastGame = this.InputAppRoseData()?.timeLastGame;
      this.timeAfterLastGame.set(timeLastGame || -1);

      const data = this.InputAppRoseData();
      this.appRoseData.set(data || { ...this.appRoseData() });

      this.estado.set(this.InputAppRoseData()!.status);

      this.mayorCantidad.set(this.calcularMayorCantidad(this.appRoseData().rose.cantidades));

      this.CantidadJugadas.set(this.cantidadJugadas());

      const porcentajesColores = this.calcularPorcentajeRojosNegros(this.appRoseData().rose);
      this.varColors.set([
        porcentajesColores.porcentajeVerdes,
        porcentajesColores.porcentajeNegros,
        porcentajesColores.porcentajeRojos,
      ]);

      const paresImpares = this.calcularPorcentajeParesImpares(this.appRoseData().rose);
      this.varParImpar.set([paresImpares.porcentajePares, paresImpares.porcentajeImpares]);

      const altosBajos = this.calcularPorcentajeAltosBajos(this.appRoseData().rose);
      this.varHighLow.set([altosBajos.porcentajeAltos, altosBajos.porcentajeBajos]);

      const columnas = this.calcularPorcentajeColumnas(this.appRoseData().rose);
      this.varColumns.set([
        columnas.porcentajePrimeraColumna,
        columnas.porcentajeSegundaColumna,
        columnas.porcentajeTerceraColumna,
      ]);

      const docenas = this.calcularPorcentajeDocenas(this.appRoseData().rose);
      this.varDocenas.set([
        docenas.porcentajePrimeraDocena,
        docenas.porcentajeSegundaDocena,
        docenas.porcentajeTerceraDocena,
      ]);
    });

    setInterval(() => {
      this.timeAfterLastGame.update((time) => (time >= 0 ? time + 1000 : time));
    }, 1000);
  }

  calcularMayorCantidad(cantidades: number[]): number {
    let pos = Math.max(...cantidades);
    return this.appRoseData().rose.ruleta[cantidades.indexOf(pos)];
  }

  cantidadJugadas(): number {
    return this.appRoseData().rose.cantidades.reduce((acc, val) => acc + val, 0);
  }

  calcularPorcentajeRojosNegros(rose: { cantidades: number[]; ruleta: number[] }): {
    porcentajeRojos: number;
    porcentajeNegros: number;
    porcentajeVerdes: number;
    rojos: number;
    negros: number;
    verdes: number;
  } {
    const { cantidades, ruleta } = rose;
    let rojos = 0;
    let negros = 0;
    let verdes = 0;
    let total = 0;

    const numerosRojos = new Set([
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ]);
    const numerosNegros = new Set([
      2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
    ]);
    const numerosVerdes = new Set([0, 37]);

    for (let i = 0; i < ruleta.length; i++) {
      const num = ruleta[i];
      const cant = cantidades[i];
      total += cant;
      if (numerosRojos.has(num)) {
        rojos += cant;
      } else if (numerosNegros.has(num)) {
        negros += cant;
      } else if (numerosVerdes.has(num)) {
        verdes += cant;
      }
    }

    const porcentajeRojos = total > 0 ? Math.round((rojos / total) * 100) : 0;
    const porcentajeNegros = total > 0 ? Math.round((negros / total) * 100) : 0;
    const porcentajeVerdes = total > 0 ? Math.round((verdes / total) * 100) : 0;

    return {
      porcentajeRojos,
      porcentajeNegros,
      porcentajeVerdes,
      rojos,
      negros,
      verdes,
    };
  }

  calcularPorcentajeParesImpares(rose: { cantidades: number[]; ruleta: number[] }): {
    porcentajePares: number;
    porcentajeImpares: number;
    porcentajeCeros: number;
    pares: number;
    impares: number;
    ceros: number;
  } {
    const { cantidades, ruleta } = rose;
    let pares = 0;
    let impares = 0;
    let ceros = 0;
    let total = 0;

    for (let i = 0; i < ruleta.length; i++) {
      const num = ruleta[i];
      const cant = cantidades[i];
      total += cant;

      if (num === 0 || num === 37) {
        ceros += cant;
      } else if (num % 2 === 0) {
        pares += cant;
      } else {
        impares += cant;
      }
    }

    const porcentajePares = total > 0 ? Math.round((pares / total) * 100) : 0;
    const porcentajeImpares = total > 0 ? Math.round((impares / total) * 100) : 0;
    const porcentajeCeros = total > 0 ? Math.round((ceros / total) * 100) : 0;

    return {
      porcentajePares,
      porcentajeImpares,
      porcentajeCeros,
      pares,
      impares,
      ceros,
    };
  }

  calcularPorcentajeAltosBajos(rose: { cantidades: number[]; ruleta: number[] }): {
    porcentajeAltos: number;
    porcentajeBajos: number;
    altos: number;
    bajos: number;
  } {
    const { cantidades, ruleta } = rose;
    let altos = 0;
    let bajos = 0;
    let total = 0;

    const numerosBajos = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    const numerosAltos = new Set([
      19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
    ]);

    for (let i = 0; i < ruleta.length; i++) {
      const num = ruleta[i];
      const cant = cantidades[i];
      total += cant;

      if (numerosBajos.has(num)) {
        bajos += cant;
      } else if (numerosAltos.has(num)) {
        altos += cant;
      }
    }

    const porcentajeAltos = total > 0 ? Math.round((altos / total) * 100) : 0;
    const porcentajeBajos = total > 0 ? Math.round((bajos / total) * 100) : 0;

    return {
      porcentajeAltos,
      porcentajeBajos,
      altos,
      bajos,
    };
  }

  calcularPorcentajeColumnas(rose: { cantidades: number[]; ruleta: number[] }): {
    porcentajePrimeraColumna: number;
    porcentajeSegundaColumna: number;
    porcentajeTerceraColumna: number;
    primeraColumna: number;
    segundaColumna: number;
    terceraColumna: number;
  } {
    const { cantidades, ruleta } = rose;
    let primeraColumna = 0;
    let segundaColumna = 0;
    let terceraColumna = 0;
    let total = 0;

    const numerosPrimeraColumna = new Set([1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]);
    const numerosSegundaColumna = new Set([2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35]);
    const numerosTerceraColumna = new Set([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]);

    for (let i = 0; i < ruleta.length; i++) {
      const num = ruleta[i];
      const cant = cantidades[i];
      total += cant;

      if (numerosPrimeraColumna.has(num)) {
        primeraColumna += cant;
      } else if (numerosSegundaColumna.has(num)) {
        segundaColumna += cant;
      } else if (numerosTerceraColumna.has(num)) {
        terceraColumna += cant;
      }
    }

    const porcentajePrimeraColumna = total > 0 ? Math.round((primeraColumna / total) * 100) : 0;
    const porcentajeSegundaColumna = total > 0 ? Math.round((segundaColumna / total) * 100) : 0;
    const porcentajeTerceraColumna = total > 0 ? Math.round((terceraColumna / total) * 100) : 0;

    return {
      porcentajePrimeraColumna,
      porcentajeSegundaColumna,
      porcentajeTerceraColumna,
      primeraColumna,
      segundaColumna,
      terceraColumna,
    };
  }

  calcularPorcentajeDocenas(rose: { cantidades: number[]; ruleta: number[] }): {
    porcentajePrimeraDocena: number;
    porcentajeSegundaDocena: number;
    porcentajeTerceraDocena: number;
    primeraDocena: number;
    segundaDocena: number;
    terceraDocena: number;
  } {
    const { cantidades, ruleta } = rose;
    let primeraDocena = 0;
    let segundaDocena = 0;
    let terceraDocena = 0;
    let total = 0;

    const numerosPrimeraDocena = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const numerosSegundaDocena = new Set([13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);
    const numerosTerceraDocena = new Set([25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]);

    for (let i = 0; i < ruleta.length; i++) {
      const num = ruleta[i];
      const cant = cantidades[i];
      total += cant;

      if (numerosPrimeraDocena.has(num)) {
        primeraDocena += cant;
      } else if (numerosSegundaDocena.has(num)) {
        segundaDocena += cant;
      } else if (numerosTerceraDocena.has(num)) {
        terceraDocena += cant;
      }
    }

    const porcentajePrimeraDocena = total > 0 ? Math.round((primeraDocena / total) * 100) : 0;
    const porcentajeSegundaDocena = total > 0 ? Math.round((segundaDocena / total) * 100) : 0;
    const porcentajeTerceraDocena = total > 0 ? Math.round((terceraDocena / total) * 100) : 0;

    return {
      porcentajePrimeraDocena,
      porcentajeSegundaDocena,
      porcentajeTerceraDocena,
      primeraDocena,
      segundaDocena,
      terceraDocena,
    };
  }
}
