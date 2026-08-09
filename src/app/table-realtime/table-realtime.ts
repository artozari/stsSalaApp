import { Component, input, ViewChild } from '@angular/core';
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

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  colDefs: ColDef<IRow>[] = [
    { field: 'id', sortable: true, filter: true, flex: 0.3, sort: 'desc' },

    { field: 'game_number', sortable: true, filter: true, flex: 0.3 },
    {
      field: 'win_number',
      sortable: true,
      filter: true,
      flex: 0.3,
      cellStyle: { 'background-color': '#9a9a9a' },
    },
    { field: 'fk_table', sortable: true, filter: true, flex: 0.3, headerName: 'Table' },
    { field: 'created_at', sortable: true, filter: true, flex: 1 },
    { field: 'updated_at', sortable: true, filter: true, flex: 1 },
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

  constructor() {}

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
