import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

@Injectable({
  providedIn: 'root',
})
export class TablesData {
  async fetchTablesNumbers() {
    const { data, error } = await supabase
      .from('table_table')
      .select('id, table_number, fk_casino')
      .order('table_number', { ascending: true });
    if (error) {
      console.error('Error fetching tables numbers:', error);
      return [];
    }
    return data;
  }

  async fetchCasinos() {
    const { data, error } = await supabase
      .from('casino_table')
      .select('id, name, casino_code')
      .order('name', { ascending: true });
    if (error) {
      console.error('Error fetching casinos:', error);
      return [];
    }
    return data;
  }
}
