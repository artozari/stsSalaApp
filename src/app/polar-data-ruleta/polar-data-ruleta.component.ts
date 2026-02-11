import {
  Component,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  input,
} from '@angular/core';
import * as echarts from 'echarts';
import { EChartsOption, ECharts } from 'echarts';

@Component({
  selector: 'app-polar-data-ruleta',
  templateUrl: './polar-data-ruleta.component.html',
  styleUrls: ['./polar-data-ruleta.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],
})
export class PolarDataRuletaComponent implements OnDestroy, AfterViewInit {
  appPolarData = input<{ namedata: string | number[]; dataSet: number[] }>();

  @ViewChild('chartContainersBar') chartContainer!: ElementRef<HTMLDivElement>;

  private myChart: ECharts | undefined;
  private resizeObserver: ResizeObserver | undefined;

  // Colores de la ruleta
  private readonly redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  private readonly blackNumbers = [
    2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
  ];
  private readonly greenNumber = 0;

  constructor() {}

  ngAfterViewInit(): void {
    this.initChart();
    this.setupResizeObserver();
    this.updateChartOptions();
  }

  private initChart(): void {
    if (!this.chartContainer?.nativeElement) {
      console.error('Chart container not found!');
      return;
    }

    this.myChart = echarts.init(this.chartContainer.nativeElement, 'dark', {
      renderer: 'canvas',
      useDirtyRect: false,
    });

    window.addEventListener('resize', this.resizeChartHandler);
  }

  private updateChartOptions(): void {
    if (!this.myChart || !this.appPolarData) {
      return;
    }

    const appPolarData = this.appPolarData?.();
    if (!appPolarData) {
      console.warn('appPolarData is undefined.');
      return;
    }
    const { namedata, dataSet } = appPolarData;
    if (!namedata || !dataSet || namedata.length === 0 || dataSet.length === 0) {
      console.warn('Invalid or empty data provided to the chart.');
      return;
    }

    const reversedNamedata = [...namedata].reverse();
    const reversedDataSet = [...dataSet].reverse();

    const seriesData = reversedDataSet.map((value, index) => {
      const numberLabel = reversedNamedata[index];
      const numberValue = Number.parseInt(String(numberLabel), 10);

      return {
        value: value,
        itemStyle: {
          color: this.getRouletteColor(numberValue),
        },
      };
    });

    const option: EChartsOption = {
      backgroundColor: 'rgba(110,110,110,0)',
      legend: {
        show: false,
        textStyle: {
          color: '#eee',
        },
      },
      title: {
        show: false,
        text: 'Estadisticas de Mesa',
        textStyle: {
          color: '#eee',
        },
      },
      tooltip: {
        show: true,
        trigger: 'item',
        formatter: (params: unknown) => {
          const param = params as {
            data: { value: number; itemStyle: { color: string } };
            name: string;
          };
          const data = param.data;
          const name = param.name;
          return `${name}: ${data.value} <br/> Color: <span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${data.itemStyle.color};"></span>`;
        },
      },
      toolbox: {
        show: false,
        feature: {
          dataView: { readOnly: false },
          saveAsImage: {},
        },
      },
      angleAxis: {
        polarIndex: 0,
        type: 'category',
        startAngle: 85,
        data: reversedNamedata,
        axisLabel: {
          color: '#eee',
        },
        axisLine: {
          lineStyle: {
            color: '#aaa',
          },
        },
      },
      radiusAxis: {
        polarIndex: 0,
        axisLabel: {
          color: '#eee',
        },
        axisLine: {
          lineStyle: {
            color: '#aaa',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#555',
          },
        },
      },
      polar: {
        radius: '50%',
      },

      series: [
        {
          polarIndex: 0,
          type: 'bar',
          data: seriesData,
          coordinateSystem: 'polar',
          emphasis: {
            itemStyle: {
              shadowBlur: 5,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };

    this.myChart.setOption(option, true);
  }

  private getRouletteColor(numero: number): string {
    if (Number.isNaN(numero)) return '#cccccc';
    if (numero === this.greenNumber) {
      return '#008000';
    } else if (this.redNumbers.includes(numero)) {
      return '#FF0000';
    } else if (this.blackNumbers.includes(numero)) {
      return '#000000';
    } else {
      return '#cccccc';
    }
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.resizeChartHandler();
    });
    if (this.chartContainer?.nativeElement) {
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  private readonly resizeChartHandler = (): void => {
    if (this.myChart) {
      this.myChart.resize();
    }
  };

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeChartHandler);

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.myChart) {
      this.myChart.dispose();
    }
  }
}
