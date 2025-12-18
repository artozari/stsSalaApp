import { Component, signal } from '@angular/core';
import { supabase } from '../supabase.client';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  iconSetQuartzLight,
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

interface IRow {
  game_number: number;
  win_number: number;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-table-realtime',
  imports: [AgGridAngular],
  templateUrl: './table-realtime.html',
  styleUrl: './table-realtime.css',
  standalone: true,
})
export class TableRealtime {
  // Column Definitions: Defines the columns to be displayed.
  public theme = themeQuartz.withPart(iconSetQuartzLight).withParams({
    accentColor: '#00A2FF',
    backgroundColor: '#21222C',
    borderColor: '#429356',
    borderRadius: 5,
    browserColorScheme: 'dark',
    cellHorizontalPaddingScale: 0.8,
    cellTextColor: '#50F178',
    columnBorder: false,
    fontFamily: {
      googleFont: 'IBM Plex Mono',
    },
    fontSize: 13,
    foregroundColor: '#68FF8E',
    headerBackgroundColor: '#18181F',
    headerFontSize: 14,
    headerFontWeight: 700,
    headerRowBorder: true,
    headerTextColor: '#68FF8E',
    headerVerticalPaddingScale: 1.5,
    iconSize: 16,
    oddRowBackgroundColor: '#21222C',
    rangeSelectionBackgroundColor: '#FFFF0020',
    rangeSelectionBorderColor: '#FFFF00',
    rangeSelectionBorderStyle: 'dotted',
    rowBorder: true,
    rowVerticalPaddingScale: 1.2,
    sidePanelBorder: true,
    spacing: 4,
    wrapperBorder: true,
    wrapperBorderRadius: 20,
  });

  rowData: IRow[] = [];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef<IRow>[] = [];

  games = signal<any[]>([]);

  constructor() {
    console.log('TableRealtime constructor called');
    this.initializeGames();
    this.getGames();
  }

  private initializeGames(): void {
    console.log('initializeGames called');
    this.fetchGamesFromDatabase();
  }

  private async fetchGamesFromDatabase(): Promise<void> {
    try {
      const { data: game_table, error } = await supabase.from('game_table').select('*');
      if (error) {
        console.error('Error fetching initial games:', error);
        return;
      }
      this.games.set(game_table);
      this.rowData = game_table as IRow[];
      this.colDefs = [
        { field: 'game_number', sortable: true, filter: true },
        { field: 'win_number', sortable: true, filter: true },
        { field: 'created_at', sortable: true, filter: true },
        { field: 'updated_at', sortable: true, filter: true },
      ];
    } catch (error) {
      console.error('Error fetching initial games:', error);
    }
  }

  private getGames() {
    // console.log('getGames called');
    supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_table' },
        async (payload) => {
          console.log('Realtime update received', payload);
          let { data, error } = await supabase.from('game_table').select('*');
          if (error) {
            console.error('Error fetching games:', error);
            return;
          }
          if (data) {
            this.games.set(data);
          }
        }
      )
      .subscribe();

    // supabase
    //   .channel('custom-all-channel')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'user_table' }, (payload) => {
    //     console.log('Change received!', payload.new);
    //   })
    //   .subscribe();
  }
}
