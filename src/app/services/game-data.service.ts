import { Injectable } from '@angular/core';
import { supabase } from '../supabase.client';
import { IRow, ISearchData } from '../app';

@Injectable({
  providedIn: 'root',
})
export class GameDataService {
  /**
   * Obtiene un lote de registros de juegos de la base de datos dentro del rango especificado.
   *
   * @param from - El índice inicial para la consulta de rango (inclusive)
   * @param to - El índice final de la consulta de rango (inclusive)
   * @param searchData - El objeto de criterios de búsqueda que contiene filtros opcionales.
   * @returns Una promesa que se resuelve en el resultado de la consulta que contiene los registros del juego filtrados.
   */
  async fetchBatch(from: number, to: number, searchData: ISearchData) {
    let query = supabase.from('game_table').select('*').range(from, to);

    if (searchData.fecha) {
      const startDate = `${searchData.fecha} 00:00:00`;
      query = query.gte('created_at', startDate);
    }
    if (searchData.fechaFin) {
      const endDate = `${searchData.fechaFin} 23:59:59`;
      query = query.lte('created_at', endDate);
    }
    if (searchData.mesa) {
      query = query.eq('fk_table', searchData.mesa);
    }

    return await query;
  }

  /**
   * Procesa un lote de datos agregándolo a la colección allData y determinando si se esperan más lotes.
   * @param data - El lote de filas a procesar, o nulo si no hay datos disponibles
   * @param allData - La colección que acumula todas las filas procesadas.
   * @param batchSize - El tamaño esperado de cada lote para determinar si se esperan más datos.
   * @returns Es verdadero si el lote procesado ha alcanzado el tamaño de lote esperado (lo que indica que pueden seguir más datos); en caso contrario, es falso.
   */
  processBatch(data: IRow[] | null, allData: IRow[], batchSize: number): boolean {
    if (data && data.length > 0) {
      allData.push(...data);
      return data.length >= batchSize;
    }
    return false;
  }
}
