import {
  Component,
  input,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  TitleComponentOption,
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
  GraphicComponent,
} from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

type EChartsOption = echarts.ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | BarSeriesOption
>;

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
  GraphicComponent,
]);

@Component({
  selector: 'app-vertical-bars-roulette',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vertical-bars-roulette.html',
  styleUrl: './vertical-bars-roulette.css',
})
export class VerticalBarsRoulette implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: true })
  chartContainer!: ElementRef<HTMLDivElement>;

  statName = input<string>();
  statData = input<number[]>([0, 0, 0]);

  private getColorByIndex(index: number): string {
    const colorMap: Record<number, string> = {
      0: '#00FF00',
      1: '#555555',
      2: '#fe0000',
    };
    return colorMap[index] ?? '';
  }

  private buildOption(name: string, data: number[]): EChartsOption {
    return {
      backgroundColor: 'rgba(110,110,110,0)',

      title: { show: false, text: 'Datos De Ruleta' },
      itemStyle: { borderRadius: [5, 5, 0, 0] },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: { show: false },
      xAxis: {
        show: true,
        type: 'category',
        data: [name],
        axisLine: {
          show: true,
          lineStyle: { color: '#ffffff88', width: 3 },
        },
        axisTick: {},
        axisLabel: {
          show: false,
        },
      },
      yAxis: {
        show: true,
        type: 'value',
      },
      series: data.map((value, index) => ({
        name: `${index}`,
        data: [value],
        type: 'bar',
        itemStyle: { color: this.getColorByIndex(index) },
      })),
    };
  }

  private myChart: echarts.ECharts | undefined;

  constructor() {
    effect(() => {
      const name = this.statName() ?? '';
      const data = this.statData();
      const option = this.buildOption(name, data);
      this.myChart?.setOption(option);
    });
  }

  ngAfterViewInit() {
    this.myChart = echarts.init(this.chartContainer.nativeElement, 'dark', {
      useDirtyRect: true,
    });
    this.myChart.setOption(this.buildOption(this.statName() ?? '', this.statData()));
  }

  ngOnDestroy() {
    this.myChart?.dispose();
  }
}
