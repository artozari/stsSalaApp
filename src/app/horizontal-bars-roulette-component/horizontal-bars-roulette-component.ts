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
import { color } from 'echarts';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer,
  GraphicComponent,
  CanvasRenderer,
]);

type EChartsOption = echarts.ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | LegendComponentOption
  | BarSeriesOption
>;

@Component({
  selector: 'app-horizontal-bars-roulette',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horizontal-bars-roulette-component.html',
  styleUrls: ['./horizontal-bars-roulette-component.css'],
  // changeDetection is OnPush by default in Angular 20+
})
export class HorizontalBarsRouletteComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: true })
  chartContainer!: ElementRef<HTMLDivElement>;

  statName = input<string>();
  statData = input<number[]>([0, 0, 0]);

  private getColorByIndex(index: number): string {
    const colorMap: Record<number, string> = {
      0: '#259386',
      1: '#555555',
      2: '#fe0000',
    };
    return colorMap[index] ?? '';
  }

  private buildOption(name: string, data: number[]): EChartsOption {
    return {
      backgroundColor: 'rgba(110,110,110,0)',
      title: {
        show: false,
        text: 'Datos De Ruleta',
      },
      itemStyle: {
        borderRadius: [0, 15, 15, 0],
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        show: false,
      },
      xAxis: {
        show: false,
        type: 'value',
      },
      yAxis: {
        show: true,
        type: 'category',
        data: [name],
        axisLine: {
          show: true,
          lineStyle: {
            color: '#ffffff88',
            width: 3,
          },
        },
        axisTick: {},
        axisLabel: {
          show: true,
        },
      },
      series: data.map((value, index) => ({
        name: `${index}`,
        type: 'bar',
        barWidth: 8,
        data: [value],
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
      this.chartContainer.nativeElement.style.height = `${data.length * 10}px`;
      this.myChart?.setOption(option);
    });
    // Only apply options when the chart instance exists
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
