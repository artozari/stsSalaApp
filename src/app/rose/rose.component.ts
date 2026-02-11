import { Component, OnInit, OnDestroy, input, effect, signal } from '@angular/core';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  LegendComponent,
  LegendComponentOption,
} from 'echarts/components';
import { RadarChart, RadarSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, RadarChart, CanvasRenderer]);

type EChartsOption = echarts.ComposeOption<
  TitleComponentOption | TooltipComponentOption | LegendComponentOption | RadarSeriesOption
>;

interface RoseComponentOption extends EChartsOption {
  rose: {
    backgroundColor: string;
    tooltip: {
      trigger: 'item';
      show: boolean;
    };
    title: {
      text: string;
    };
    legend: {
      data: string[];
      left: string;
    };
    toolbox: {
      show: boolean;
      feature: {
        dataView: {
          readOnly: boolean;
        };
        restore: {};
        saveAsImage: {};
      };
    };
    radar: {
      indicator: {
        name: string;
        color: string;
        min: number;
        max: number;
      }[];
      center: string[];
      shape: string;
      splitNumber: number;
      axisName: {
        color: string;
      };
      splitLine: {
        lineStyle: {
          color: string[];
          width: number;
        };
      };
      splitArea: {
        show: boolean;
      };
      axisLine: {
        lineStyle: {
          color: string;
          width: number;
        };
      };
    };
    series: {
      name: string;
      type: string;
      areaStyle: {
        color: string;
        opacity: number;
      };
      data: {
        value: number[];
        name: string;
      }[];
    }[];
  };
}

@Component({
  selector: 'app-rose',
  standalone: true,
  templateUrl: './rose.component.html',
  styleUrl: './rose.component.css',
})
export class RoseComponent implements OnInit, OnDestroy {
  tableID = input<number>();
  appRoseData = input<any>();

  private chart: echarts.ECharts | undefined;

  maxDefault: number = 0.1;
  minDefault: number = -0.1;

  optionSignal = signal<any>({
    backgroundColor: 'rgba(110,110,110,0)',
    tooltip: {
      trigger: 'item',
      show: false,
    },
    title: {
      show: true,
      text: `Estadisticas de Sala ${this.tableID()}`,
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
      indicator: [
        {
          name: '0',
          color: '#00B0AA',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '26',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '3',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '35',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '12',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '28',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '7',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '29',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '18',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '22',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '9',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '31',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '14',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '20',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '1',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '33',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '16',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '24',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '5',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '10',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '23',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '8',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '30',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '11',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '36',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '13',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '27',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '6',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '34',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '17',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '25',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '2',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '21',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '4',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '19',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '15',
          color: 'white',
          min: this.minDefault,
          max: this.maxDefault,
        },
        {
          name: '32',
          color: '#DE372D',
          min: this.minDefault,
          max: this.maxDefault,
        },
      ],
      center: ['50%', '50%'],
      shape: 'circle', //para que sea circular
      splitNumber: 5,
      axisName: {
        color: 'rgb(238, 097, 102)', //cambia el color del texto de los indicadores
      },
      splitLine: {
        lineStyle: {
          color: ['#ff0000ff', '#00000055', '#00000055', '#00ff00ff', '#00000055'],
          width: 1,
        },
      },
      splitArea: {
        show: true, //para darle color al area del fondo
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
        showSymbol: true, // Desactiva los marcadores en las líneas
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

  constructor() {
    effect(() => {
      const data = this.appRoseData();
      console.log('Effect ejecutado con datos:', data);
      if (data) {
        let newMax = 1;
        if (Math.max(...data.rose.cantidades) > 0) {
          newMax = Math.max(...data.rose.cantidades);
          console.log('new max: ', newMax);
        }
        this.optionSignal.update((option) => {
          option.radar.indicator.forEach((indicator: any) => {
            indicator.max = newMax;
          });
          option.series[0].data[0].value = data.rose.cantidades;
          option.title.text =
            this.tableID()! > 0 ? `Estadisticas de Mesa ${this.tableID()}` : `Estadisticas de Sala`;
          return { ...option };
        });
        console.log('Nueva opción:', this.optionSignal().series[0].data[0].value);
        if (this.chart) {
          this.chart.setOption(this.optionSignal());
          console.log('Gráfica actualizada');
        } else {
          console.log('Chart no inicializado aún');
        }
      }
    });
  }

  ngOnInit(): void {
    this.chart = echarts.init(
      document.getElementById('chart-container') as HTMLDivElement,
      'dark',
      { renderer: 'canvas', useDirtyRect: true },
    );
    this.chart.setOption(this.optionSignal());
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  datos() {
    if (this.optionSignal().series[0].data[0].value) {
      if (this.chart) {
        this.chart.setOption(this.optionSignal());
      }
    }
  }
}
