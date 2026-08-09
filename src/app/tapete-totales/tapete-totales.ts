import { Component, input, ViewChild } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridOptions } from 'ag-grid-community';
import {
  AllCommunityModule,
  ModuleRegistry,
  CsvExportModule,
  themeQuartz,
  iconSetQuartzLight,
  GridSizeChangedEvent,
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule, CsvExportModule]);

interface IRowTotals {
  tipo: string;
  valor: number;
  porcentaje: number;
}

@Component({
  selector: 'app-tapete-totales',
  imports: [AgGridAngular],
  templateUrl: './tapete-totales.html',
  styleUrl: './tapete-totales.css',
})
export class TapeteTotales {
  rowTotalsTapeteInput = input<IRowTotals[]>([]);

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  colDefs: ColDef<IRowTotals>[] = [
    { field: 'tipo', headerName: 'Tipo', sortable: true, filter: true },
    { field: 'valor', headerName: 'Valor', sortable: true, filter: true },
    { field: 'porcentaje', headerName: 'Porcentaje', sortable: true, filter: true },
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

  onGridSizeChanged(params: GridSizeChangedEvent) {
    // get the current grids width
    const gridWidth = document.querySelector('.ag-body-viewport')!.clientWidth;
    // keep track of which columns to hide/show
    const columnsToShow = [];
    const columnsToHide = [];
    // iterate over all columns (visible or not) and work out
    // now many columns can fit (based on their minWidth)
    let totalColsWidth = 0;
    const allColumns = params.api.getColumns();
    if (allColumns && allColumns.length > 0) {
      for (const column of allColumns) {
        totalColsWidth += column.getMinWidth();
        if (totalColsWidth > gridWidth) {
          columnsToHide.push(column.getColId());
        } else {
          columnsToShow.push(column.getColId());
        }
      }
    }
    // show/hide columns based on current grid width
    params.api.setColumnsVisible(columnsToShow, true);
    params.api.setColumnsVisible(columnsToHide, false);
    // wait until columns stopped moving and fill out
    // any available space to ensure there are no gaps
    globalThis.setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 10);
  }
}
