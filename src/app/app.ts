import { Component, signal } from '@angular/core';
import { Header } from './header/header';
import { TableRealtime } from './table-realtime/table-realtime';
// import { supabase } from './supabase.client';

@Component({
  selector: 'app-root',
  imports: [Header, TableRealtime],
  templateUrl: 'app.html',
  styleUrl: 'app.css',
})
export class App {
  protected readonly title = signal('stsSalaApp');

  // log = console.log('loguedo');

  // channels = supabase
  //   .channel('custom-all-channel')
  //   .on(
  //     'postgres_changes',
  //     { event: '*', schema: 'public', table: 'game_table_2025_12' },
  //     (payload) => {
  //       console.log('Change received!', payload);
  //     }
  //   )
  //   .subscribe();
}
