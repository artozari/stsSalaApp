import { Component, input, ViewChild, effect } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridOptions } from 'ag-grid-community';
import {
  AllCommunityModule,
  ModuleRegistry,
  CsvExportModule,
  themeQuartz,
  iconSetQuartzLight,
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

interface IRow {
  id: number;
  game_number: number;
  win_number: number;
  created_at: string;
  updated_at: string;
  fk_table: number;
}

@Component({
  selector: 'app-table-realtime',
  imports: [AgGridAngular],
  templateUrl: './table-realtime.html',
  styleUrl: './table-realtime.css',
  standalone: true,
})
export class TableRealtime {
  rowDataInput = input<IRow[]>([]);
  mesas = input<{ value: number; table_number: number; fk_casino: number | null }[]>([]);
  casinos = input<{ value: number; label: string }[]>([]);
  isLoading = input<boolean>(false);
  private mesaNumeroMap: Record<number, number> = {};
  private mesaCasinoMap: Record<number, number | null> = {};
  private casinoIdToLabel: Record<number, string> = {};

  private mesaValueGetter = (params: any): number | undefined => {
    const id = params?.data?.fk_table;
    return id != null ? (this.mesaNumeroMap[id] ?? id) : undefined;
  };

  private casinoValueGetter = (params: any): string => {
    const id = params?.data?.fk_table;
    if (id == null) {
      return '—';
    }
    const fkCasino = this.mesaCasinoMap[id];
    if (fkCasino == null) {
      return '—';
    }
    return this.casinoIdToLabel[fkCasino] ?? String(fkCasino);
  };

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  colDefs: ColDef<IRow>[] = [
    { field: 'id', headerName: 'ID', sortable: true, filter: true, flex: 0.3, sort: 'desc' },

    { field: 'game_number', headerName: 'N° de Juego', sortable: true, filter: true, flex: 0.3 },
    {
      field: 'win_number',
      headerName: 'Número Ganador',
      sortable: true,
      filter: true,
      flex: 0.3,
      cellStyle: { 'background-color': '#9a9a9a' },
    },
    {
      field: 'fk_table',
      headerName: 'Mesa',
      sortable: true,
      filter: true,
      flex: 0.3,
      valueGetter: this.mesaValueGetter,
    },
    {
      headerName: 'Casino',
      sortable: true,
      filter: true,
      flex: 1,
      valueGetter: this.casinoValueGetter,
    },
    {
      field: 'created_at',
      headerName: 'Fecha de Juego',
      sortable: true,
      filter: true,
      flex: 1,
      valueFormatter: this.formatLocalTime,
    },
    // { field: 'updated_at', sortable: true, filter: true, flex: 1, valueFormatter: this.formatLocalTime },
  ];

  gridOptions: GridOptions = {};

  theme = themeQuartz.withPart(iconSetQuartzLight).withParams({
    backgroundColor: '#BBBBBB',
    borderColor: '#000000A1',
    borderRadius: '13.4px',
    browserColorScheme: 'dark',
    columnBorder: true,
    fontFamily: ['Arial', 'sans-serif'],
    headerFontSize: 14,
    headerRowBorder: true,
    rowBorder: true,
    spacing: 4,
    wrapperBorder: true,
    wrapperBorderRadius: '17.8px',
  });

  constructor() {
    effect(() => {
      const numeroMap: Record<number, number> = {};
      const casinoMap: Record<number, number | null> = {};
      for (const mesa of this.mesas()) {
        numeroMap[mesa.value] = mesa.table_number;
        casinoMap[mesa.value] = mesa.fk_casino ?? null;
      }
      this.mesaNumeroMap = numeroMap;
      this.mesaCasinoMap = casinoMap;

      const labelMap: Record<number, string> = {};
      for (const casino of this.casinos()) {
        labelMap[casino.value] = casino.label;
      }
      this.casinoIdToLabel = labelMap;
    });
  }

  private formatLocalTime(params: any): string {
    if (!params?.value) {
      return params?.value ?? '';
    }
    const utcDate = new Date(`${params.value}Z`);
    if (Number.isNaN(utcDate.getTime())) {
      return params.value;
    }
    return utcDate.toLocaleString(undefined, { hour12: false });
  }

  // Método para exportar los datos a CSV
  exportToCsv() {
    if (this.agGrid?.api) {
      // Generar nombre de archivo con fecha actual y nombre de la tabla
      const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const fileName = `Tabla_general-${today}.csv`;

      this.agGrid.api.exportDataAsCsv({
        fileName: fileName,
        columnSeparator: ';', // Usar punto y coma como separador de columnas
      });
    } else {
      console.error('Grid API no disponible para exportación');
    }
  }
}
