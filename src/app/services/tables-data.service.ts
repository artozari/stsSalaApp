import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';

@Injectable({
  providedIn: 'root',
})
export class TablesData {
  async fetchTablesNumbers() {
    const { data, error } = await supabase.from('table_table').select('table_number').order('table_number', { ascending: true });
    if (error) {
      console.error('Error fetching tables numbers:', error);
      return [];
    }
    return data;
  }
}
