import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TooltipComponentOption,
  VisualMapComponent,
  VisualMapComponentOption,
  GeoComponent,
  GeoComponentOption,
} from 'echarts/components';
import { MapChart, MapSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TooltipComponent, VisualMapComponent, GeoComponent, MapChart, CanvasRenderer]);

type EChartsOption = echarts.ComposeOption<
  TooltipComponentOption | VisualMapComponentOption | GeoComponentOption | MapSeriesOption
>;

@Component({
  selector: 'app-tapetefr',
  imports: [],
  templateUrl: './tapetefr.html',
  styleUrl: './tapetefr.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tapetefr implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef<HTMLDivElement>;

  private myChart: echarts.ECharts | null = null;
  private readonly rootPath = 'https://echarts.apache.org/examples';
  private readonly mapName = 'Beef_cuts_France';

  constructor(private httpClient: HttpClient) {}

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnDestroy(): void {
    this.myChart?.dispose();
  }

  private initChart(): void {
    if (!this.chartContainer?.nativeElement) return;

    this.myChart = echarts.init(this.chartContainer.nativeElement, 'dark');

    this.httpClient.get(`./${this.mapName}.svg`, { responseType: 'text' }).subscribe({
      next: (svg) => {
        echarts.registerMap(this.mapName, { svg });
        this.setChartOption();
      },
      error: (error) => {
        console.error('Error loading SVG map:', error);
      },
    });
  }

  private setChartOption(): void {
    if (!this.myChart) return;

    const option: EChartsOption = {
      tooltip: {},
      visualMap: {
        left: 'center',
        bottom: '10%',
        min: 5,
        max: 100,
        orient: 'horizontal',
        text: ['', 'Precio'],
        realtime: true,
        calculable: true,
        inRange: {
          color: ['#dbac00', '#db6e00', '#cf0000'],
        },
      },
      series: [
        {
          name: 'Cortes de Carne Francesa',
          type: 'map',
          map: this.mapName,
          roam: true,
          emphasis: {
            label: {
              show: true,
            },
          },
          selectedMode: false,
          data: [
            { name: 'number', value: 182 },
            { name: 'Negro', value: 168 },
            { name: 'Par', value: 175 },
            { name: 'Impar', value: 175 },
            { name: 'Pase (19-36)', value: 156 },
            { name: 'Manque (1-18)', value: 194 },
            { name: '1ª Docena', value: 102 },
            { name: '2ª Docena', value: 115 },
            { name: '3ª Docena', value: 133 },
            { name: '1ª Columna', value: 98 },
            { name: '2ª Columna', value: 127 },
            { name: '3ª Columna', value: 125 },
          ],
        },
      ],
    };

    this.myChart.setOption(option);
  }
}
