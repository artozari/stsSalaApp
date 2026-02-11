import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RoseChartService {
  private maxDefault = 0.1;
  private minDefault = -0.1;

  optionSignal = signal<any>({
    backgroundColor: 'rgba(110,110,110,0)',
    tooltip: {
      trigger: 'item',
      show: false,
    },
    title: {
      show: true,
      text: '',
    },
    legend: {
      data: ['ganado'],
      left: 'center',
      show: false,
    },
    toolbox: {
      show: false,
      feature: {
        dataView: { readOnly: false },
        saveAsImage: {},
      },
    },
    radar: {
      indicator: [],
      center: ['50%', '50%'],
      shape: 'circle',
      splitNumber: 5,
      axisName: {
        color: 'rgb(238, 097, 102)',
      },
      splitLine: {
        lineStyle: {
          color: ['#ff0000ff', '#00000055', '#00000055', '#00ff00ff', '#00000055'],
          width: 1,
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#ffffff22', '#ff000022'],
        },
      },
      axisLine: {
        lineStyle: {
          color: '#ffffff22',
          width: 1,
        },
      },
    },
    series: [
      {
        name: 'ganado',
        type: 'radar',
        areaStyle: {
          color: 'rgba(105, 255, 200, 1)',
          opacity: 0.4,
        },
        data: [
          {
            value: [],
            name: 'ganado',
          },
        ],
      },
    ],
  });

  updateChartOptions(data: any, tableID: number): void {
    const newMax = Math.max(...data.rose.cantidades) > 0 ? Math.max(...data.rose.cantidades) : 1;

    this.optionSignal.update((option) => {
      option.radar.indicator = data.rose.cantidades.map((cantidad: number, index: number) => ({
        name: `${index}`,
        color: index % 2 === 0 ? '#DE372D' : 'white',
        min: this.minDefault,
        max: newMax,
      }));
      option.series[0].data[0].value = data.rose.cantidades;
      option.title.text = `Estadisticas de Sala ${tableID}`;
      return { ...option };
    });
  }
}
