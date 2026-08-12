import { Component, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Header } from './header/header';
import { TableRealtime } from './table-realtime/table-realtime';
import { FormsearchMain } from './formsearch-main/formsearch-main';
import { Footer } from './footer/footer';
import {
  obtenerPorsentajesDeNumerosIndividualesDesdeArray,
  obtenerPorsentajesDeNumerosIndividualesDesdeObjetos,
  RojosNegrosVerder,
} from './utils/statCalculator';
import { GameDataService } from './services/game-data.service';
import { TablesData } from './services/tables-data.service';
import { DashboardService } from './services/dashboard.service';
import { Switchdarktheme } from './switchdarktheme/switchdarktheme';
import { Minidash } from './minidash/minidash';
import { CardRoulette } from './card-roulette/card-roulette';
import { TapeteTotales } from './tapete-totales/tapete-totales';
import { Numerosganadores } from './numerosganadores/numerosganadores';

export interface IRow {
  id: number;
  game_number: number;
  win_number: number;
  created_at: string;
  updated_at: string;
  fk_table: number;
}

interface IRowTotals {
  tipo: string;
  valor: number;
  porcentaje: number;
}

interface IRowNumerosGanadores {
  numero: number;
  cantidad: number;
  porcentaje: number;
}

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

export interface ISearchData {
  fecha?: string;
  fechaFin?: string;
  mesa?: number;
  casino?: number;
  tableIds?: number[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Header,
    TableRealtime,
    FormsearchMain,
    Footer,
    Switchdarktheme,
    Minidash,
    CardRoulette,
    TapeteTotales,
    Numerosganadores,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GameDataService, TablesData],
})
export class App implements OnInit {
  protected readonly title = signal('stsSalaApp');
  todasLasMesas = signal<{ value: number; table_number: number; fk_casino: number | null }[]>([]);
  mesasDisponibles = signal<{ value: number; label: string }[]>([]);
  casinosDisponibles = signal<{ value: number; label: string }[]>([]);
  casinoSeleccionado = signal<number | ''>('');
  tableData = signal<IRow[]>([]);
  rowTotalsTapete = signal<IRowTotals[]>([]);
  rowNumerosGanadores = signal<IRowNumerosGanadores[]>([]);
  tablesToShow = signal<number[]>([3, 7]);

  appsRosesDatas = signal<IRoseData[]>([]);

  tableId = signal(0);
  mesaSeleccionada = signal<number>(0);
  mayorCantidad = signal<number>(-1);
  lastTenWinners = signal<number[]>([]);
  status = signal<string | boolean>('');

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

  constructor(
    readonly gameDataService: GameDataService,
    readonly dashboardService: DashboardService,
    readonly tablesDataService: TablesData,
  ) {
    if (this.dashboardService) {
      this.dashboardService.disconnect();
    }
    this.dashboardService.getAllDataDashboeard().subscribe((data: any) => {
      let datos = this.crearAppsRosesData(data);
      const currentData = this.appsRosesDatas();
      const updatedData = currentData.filter((rose) => rose.mesa !== datos[0].mesa);
      const newData = [...updatedData, ...datos].sort((a, b) => a.mesa - b.mesa);
      this.appsRosesDatas.set(newData);
    });
  }

  ngOnInit() {
    this.fetchCasinos();
    this.fetchTableNumbers();
  }

  private async fetchCasinos() {
    const casinos = await this.tablesDataService.fetchCasinos();
    if (casinos && Array.isArray(casinos)) {
      this.casinosDisponibles.set(
        casinos.map((casino: any) => ({
          value: casino.id,
          label: casino.name || casino.casino_code || `Casino ${casino.id}`,
        })),
      );
    } else {
      console.error('Error fetching casinos or invalid data format');
    }
  }

  private async fetchTableNumbers() {
    const tables = await this.tablesDataService.fetchTablesNumbers();
    if (tables && Array.isArray(tables)) {
      const formattedTables = tables.map((table: any) => ({
        value: table.id,
        table_number: table.table_number,
        fk_casino: table.fk_casino,
      }));
      this.todasLasMesas.set(formattedTables);
      this.aplicarFiltroCasino(this.casinoSeleccionado());
    } else {
      console.error('Error fetching tables numbers or invalid data format');
    }
  }

  private aplicarFiltroCasino(casinoId: number | '') {
    const id = casinoId === '' ? '' : Number(casinoId);
    const mesas = this.todasLasMesas().filter(
      (mesa) => !id || Number(mesa.fk_casino) === id,
    );
    this.mesasDisponibles.set(
      mesas.map((mesa) => ({ value: mesa.value, label: `Mesa ${mesa.table_number}` })),
    );
  }

  onCasinoChange(casinoId: number | '') {
    const id = casinoId === '' ? '' : Number(casinoId);
    this.casinoSeleccionado.set(id);
    this.aplicarFiltroCasino(id);
  }

  crearAppsRosesData(data: { mesa: string; payload: any }): Array<IRoseData> {
    const roseData: IRoseData[] = [];

    let mesa = data.payload.tableData[7];
    let ltengames = obtenerUltimos10Juegos(data.payload.winningNumbersData);
    let time: IRow = {
      id: 0,
      game_number: 0,
      win_number: 0,
      created_at: data.payload.winningNumbersData[0][1],
      updated_at: '',
      fk_table: 0,
    };
    let timeLastGame = this.timeAfterLastGameDashboard([time]); // Aquí deberías calcular el tiempo desde el último juego para cada mesa
    let status = data.payload.status[1];
    let rose = obtenerPorsentajesDeNumerosIndividualesDesdeArray(data.payload.winningNumbersData);

    roseData.push({ mesa, ltengames, timeLastGame, status, rose });

    return [...roseData];
  }

  onSearchSubmitted(searchData: ISearchData) {
    this.performSearch(searchData);
    this.tableId.set(searchData.mesa!);
  }

  onDetallesMesa(mesa: number) {
    const mesaId = this.todasLasMesas().find((t) => t.table_number === mesa)?.value ?? mesa;
    this.mesaSeleccionada.set(mesaId);
    this.tableId.set(mesaId);
    this.onSearchSubmitted({ mesa: mesaId });
  }

  private async performSearch(searchData: ISearchData) {
    try {
      const allData: IRow[] = [];
      const batchSize = 1000;

      let searchFilter: ISearchData = searchData;
      if (searchData.casino && !searchData.mesa) {
        const casinoId = Number(searchData.casino);
        const tableIds = this.todasLasMesas()
          .filter((mesa) => Number(mesa.fk_casino) === casinoId)
          .map((mesa) => mesa.value);
        if (tableIds.length) {
          searchFilter = { ...searchData, tableIds };
        }
      }

      let from = 0;
      let to = batchSize - 1;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await this.gameDataService.fetchBatch(from, to, searchFilter);

        if (error) {
          console.error('Error en búsqueda:', error);
          break;
        }

        hasMore = this.gameDataService.processBatch(data, allData, batchSize);
        from += batchSize;
        to += batchSize;
      }
      this.tableData.set(allData);

      this.updateLastTenWinners(allData);
      this.obtenerRose(allData);
      this.obtenerTotalesTapete(allData);
      this.obtenerNumerosGanadores(allData);
    } catch (error) {
      console.error('Error al buscar datos:', error);
    }
  }
  obtenerNumerosGanadores(allData: IRow[]) {
    const numerosGanadores = obtenerPorsentajesDeNumerosIndividualesDesdeObjetos(allData);
    const numerosGanadoresData: IRowNumerosGanadores[] = numerosGanadores.cantidades.map(
      (cantidad, index) => ({
        numero: numerosGanadores.ruleta[index],
        cantidad,
        porcentaje: Number.parseFloat(numerosGanadores.porcentajes[index].toFixed(2)),
      }),
    );
    this.rowNumerosGanadores.set(numerosGanadoresData);
  }
  obtenerTotalesTapete(allData: IRow[]) {
    const totalGames = obtenerPorsentajesDeNumerosIndividualesDesdeObjetos(allData);
    const totales: IRowTotals[] = [
      {
        tipo: 'Total',
        valor: totalGames.cantidades.reduce((a, b) => a + b, 0),
        porcentaje: Number.parseFloat(totalGames.porcentajes.reduce((a, b) => a + b, 0).toFixed(0)),
      },
      {
        tipo: 'Rojos',
        valor: RojosNegrosVerder(allData).rojos,
        porcentaje: Number.parseFloat(RojosNegrosVerder(allData).porcentajeRojos.toFixed(0)),
      },
      {
        tipo: 'Negros',
        valor: RojosNegrosVerder(allData).negros,
        porcentaje: Number.parseFloat(RojosNegrosVerder(allData).porcentajeNegros.toFixed(0)),
      },
      {
        tipo: 'Ceros',
        valor: totalGames.cantidades[0],
        porcentaje: Number.parseFloat(RojosNegrosVerder(allData).porcentajeVerdes.toFixed(0)),
      },
      {
        tipo: 'pares',
        valor: totalGames.cantidades
          .filter((_, i) => totalGames.ruleta[i] !== 0 && totalGames.ruleta[i] % 2 === 0)
          .reduce((a, b) => a + b, 0),
        porcentaje: Number.parseFloat(
          totalGames.porcentajes
            .filter((_, i) => totalGames.ruleta[i] !== 0 && totalGames.ruleta[i] % 2 === 0)
            .reduce((a, b) => a + b, 0)
            .toFixed(0),
        ),
      },
      {
        tipo: 'impares',
        valor: totalGames.cantidades
          .filter((_, i) => totalGames.ruleta[i] !== 0 && totalGames.ruleta[i] % 2 === 1)
          .reduce((a, b) => a + b, 0),
        porcentaje: Number.parseFloat(
          totalGames.porcentajes
            .filter((_, i) => totalGames.ruleta[i] !== 0 && totalGames.ruleta[i] % 2 === 1)
            .reduce((a, b) => a + b, 0)
            .toFixed(0),
        ),
      },
      {
        tipo: 'Altos',
        valor: totalGames.cantidades
          .filter((_, i) => totalGames.ruleta[i] > 18)
          .reduce((a, b) => a + b, 0),
        porcentaje: Number.parseFloat(
          totalGames.porcentajes
            .filter((_, i) => totalGames.ruleta[i] > 18)
            .reduce((a, b) => a + b, 0)
            .toFixed(0),
        ),
      },
      {
        tipo: 'Bajos',
        valor: totalGames.cantidades
          .filter((_, i) => totalGames.ruleta[i] >= 1 && totalGames.ruleta[i] <= 18)
          .reduce((a, b) => a + b, 0),
        porcentaje: Number.parseFloat(
          totalGames.porcentajes
            .filter((_, i) => totalGames.ruleta[i] >= 1 && totalGames.ruleta[i] <= 18)
            .reduce((a, b) => a + b, 0)
            .toFixed(0),
        ),
      },
      {
        tipo: 'primera columna',
        valor: totalGames.cantidades
          .filter((_, i) => totalGames.ruleta[i] >= 1 && totalGames.ruleta[i] <= 12)
          .reduce((a, b) => a + b, 0),
        porcentaje: Number.parseFloat(
          totalGames.porcentajes
            .filter((_, i) => totalGames.ruleta[i] >= 1 && totalGames.ruleta[i] <= 12)
            .reduce((a, b) => a + b, 0)
            .toFixed(0),
        ),
      },
      {
        tipo: 'segunda columna',
        valor: totalGames.cantidades
          .filter((_, i) => totalGames.ruleta[i] >= 13 && totalGames.ruleta[i] <= 24)
          .reduce((a, b) => a + b, 0),
        porcentaje: Number.parseFloat(
          totalGames.porcentajes
            .filter((_, i) => totalGames.ruleta[i] >= 13 && totalGames.ruleta[i] <= 24)
            .reduce((a, b) => a + b, 0)
            .toFixed(0),
        ),
      },
      {
        tipo: 'tercera columna',
        valor: totalGames.cantidades
          .filter((_, i) => totalGames.ruleta[i] >= 25 && totalGames.ruleta[i] <= 36)
          .reduce((a, b) => a + b, 0),
        porcentaje: Number.parseFloat(
          totalGames.porcentajes
            .filter((_, i) => totalGames.ruleta[i] >= 25 && totalGames.ruleta[i] <= 36)
            .reduce((a, b) => a + b, 0)
            .toFixed(0),
        ),
      },
      {
        tipo: 'Docena 1-12',
        valor: totalGames.cantidades
          .filter((_, i) => totalGames.ruleta[i] >= 1 && totalGames.ruleta[i] <= 12)
          .reduce((a, b) => a + b, 0),
        porcentaje: Number.parseFloat(
          totalGames.porcentajes
            .filter((_, i) => totalGames.ruleta[i] >= 1 && totalGames.ruleta[i] <= 12)
            .reduce((a, b) => a + b, 0)
            .toFixed(0),
        ),
      },
      {
        tipo: 'Docena 13-24',
        valor: totalGames.cantidades
          .filter((_, i) => totalGames.ruleta[i] >= 13 && totalGames.ruleta[i] <= 24)
          .reduce((a, b) => a + b, 0),
        porcentaje: Number.parseFloat(
          totalGames.porcentajes
            .filter((_, i) => totalGames.ruleta[i] >= 13 && totalGames.ruleta[i] <= 24)
            .reduce((a, b) => a + b, 0)
            .toFixed(0),
        ),
      },
      {
        tipo: 'Docena 25-36',
        valor: totalGames.cantidades
          .filter((_, i) => totalGames.ruleta[i] >= 25 && totalGames.ruleta[i] <= 36)
          .reduce((a, b) => a + b, 0),
        porcentaje: Number.parseFloat(
          totalGames.porcentajes
            .filter((_, i) => totalGames.ruleta[i] >= 25 && totalGames.ruleta[i] <= 36)
            .reduce((a, b) => a + b, 0)
            .toFixed(0),
        ),
      },
    ];
    this.rowTotalsTapete.set(totales);
  }

  private updateLastTenWinners(data: IRow[]): void {
    const wins = data
      .slice() // no mutar el original
      .sort((a, b) => {
        const ta = new Date(a.created_at).getTime();
        const tb = new Date(b.created_at).getTime();
        return Number.isNaN(tb) || Number.isNaN(ta) ? 0 : tb - ta;
      })
      .map((row) => row.win_number);

    const last10 = wins.length > 10 ? wins.slice(0, 10) : wins;
    this.lastTenWinners.set(last10);
  }

  private obtenerRose(data: IRow[]): void {
    this.appRoseData.set({
      timeLastGame: this.timeAfterLastGame(data),
      ltengames: this.lastTenWinners(),
      rose: obtenerPorsentajesDeNumerosIndividualesDesdeObjetos(data),
      mesa: this.tableId(),
      status: this.status(),
    });

    if (this.appRoseData().rose.cantidades.some((value) => value !== 0)) {
      const indexOfMax = this.appRoseData().rose.cantidades.indexOf(
        Math.max(...this.appRoseData().rose.cantidades),
      );
      this.mayorCantidad.set(this.appRoseData().rose.ruleta[indexOfMax]);
    } else {
      this.mayorCantidad.set(-1);
    }
  }

  private parseLastGameInstant(lastGame: unknown): number {
    if (lastGame == null || lastGame === '') {
      return 0;
    }
    const str = String(lastGame).trim();
    if (/^\d+(\.\d+)?$/.test(str)) {
      let ms = Number(str);
      if (ms < 1e12) {
        ms *= 1000;
      }
      return ms;
    }
    const iso = str.includes('Z') || str.includes('+') ? str : `${str}Z`;
    const time = new Date(iso).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  timeAfterLastGame(data: IRow[]): number {
    const lastGame = data.at(-1)?.created_at;
    const lastGameDate = this.parseLastGameInstant(lastGame);
    const now = Date.now();
    return lastGameDate ? Math.floor(now - lastGameDate) : -1;
  }

  timeAfterLastGameDashboard(data: IRow[]): number {
    const lastGame = data.at(-1)?.created_at;
    const lastGameDate = this.parseLastGameInstant(lastGame);
    const now = Date.now();
    return lastGameDate ? Math.floor(now - lastGameDate) : -1;
  }
}
function obtenerUltimos10Juegos(winningNumbersData: (string | number | boolean)[]): number[] {
  if (!Array.isArray(winningNumbersData)) {
    return [];
  }
  const last10Games: number[] = [];
  winningNumbersData.forEach((element) => {
    if (Array.isArray(element)) {
      const num = Number(element[3]);
      last10Games.push(num);
    }
  });
  return last10Games.slice(0, 10);
}
