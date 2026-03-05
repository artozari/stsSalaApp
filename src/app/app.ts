import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { Header } from './header/header';
import { TableRealtime } from './table-realtime/table-realtime';
import { FormsearchMain } from './formsearch-main/formsearch-main';
import { Footer } from './footer/footer';
import { obtenerPorsentajesDeNumerosIndividualesDesdeObjetos } from './utils/statCalculator';
import { GameDataService } from './services/game-data.service';
import { Switchdarktheme } from './switchdarktheme/switchdarktheme';
import { Minidash } from './minidash/minidash';
import { CardRoulette } from './card-roulette/card-roulette';

export interface IRow {
  id: number;
  game_number: number;
  win_number: number;
  created_at: string;
  updated_at: string;
  fk_table: number;
}

interface IRoseData {
  rose: {
    cantidades: number[];
    porcentajes: number[];
    ruleta: number[];
  };
}

export interface ISearchData {
  fecha?: string;
  fechaFin?: string;
  mesa?: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Header, TableRealtime, FormsearchMain, Footer, Switchdarktheme, Minidash, CardRoulette],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GameDataService],
})
export class App {
  protected readonly title = signal('stsSalaApp');
  tableData = signal<IRow[]>([]);
  polarData = signal<{ namedata: number[]; dataSet: number[] }>({
    namedata: [3, 5, 2, 3, 4, 2, 6, 8],
    dataSet: [3, 6, 4, 6, 7, 6, 4, 3],
  });
  tablesToShow = signal<number[]>([3, 7]);
  appsRosesDatas = signal<IRoseData[]>([
    {
      rose: {
        cantidades: [
          40, 30, 25, 10, 50, 70, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0, 0,
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
    {
      rose: {
        cantidades: [
          0, 0, 5, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 30, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0, 0,
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

  tableId = signal(0);
  mayorCantidad = signal<number>(-1);

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

  constructor(public gameDataService: GameDataService) {}

  onSearchSubmitted(searchData: ISearchData) {
    this.performSearch(searchData);
    this.tableId.set(searchData.mesa!);
  }

  private async performSearch(searchData: ISearchData) {
    try {
      const allData: IRow[] = [];
      const batchSize = 1000;
      let from = 0;
      let to = batchSize - 1;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await this.gameDataService.fetchBatch(from, to, searchData);

        if (error) {
          console.error('Error en búsqueda:', error);
          break;
        }

        hasMore = this.gameDataService.processBatch(data, allData, batchSize);
        from += batchSize;
        to += batchSize;
      }
      this.tableData.set(allData);
      console.log(this.tableData());
      this.obtenerRose(allData);
    } catch (error) {
      console.error('Error al buscar datos:', error);
    }
  }

  private obtenerRose(data: IRow[]): void {
    console.log(JSON.stringify(data).toString(), 'los datos');
    this.appRoseData.set({
      rose: obtenerPorsentajesDeNumerosIndividualesDesdeObjetos(data),
    });
    console.log(this.appRoseData().rose.cantidades);
    if (this.appRoseData().rose.cantidades.some((value) => value !== 0)) {
      const indexOfMax = this.appRoseData().rose.cantidades.indexOf(
        Math.max(...this.appRoseData().rose.cantidades),
      );
      this.mayorCantidad.set(this.appRoseData().rose.ruleta[indexOfMax]);
    } else {
      this.mayorCantidad.set(-1);
    }
  }
}
