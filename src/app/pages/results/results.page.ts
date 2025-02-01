import { Component, OnInit } from '@angular/core';

import type { EChartsOption } from 'echarts';
import { EvaService } from 'src/app/services/eva/eva.service';
import { Eva } from 'src/app/redcap_interfaces/eva';
import { StorageService } from 'src/app/services/storage/storage.service';

import * as echarts from 'echarts';
import { QuestsService } from 'src/app/services/quests/quests.service';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit {

  id: string;
  eva_data: [];

  evaChart: any;
  eva_chart_options: EChartsOption;

  questChart: any;
  quest_chart_options: EChartsOption;

  constructor(
    private evaSrvc: EvaService,
    private questsSrvc: QuestsService,
    private storageSrvc: StorageService
  ) { }

  ngOnInit() {
    this.getRecordID().then(data => {
      this.id = data
      this.getEvaData(null)
      this.getQuestData(null)
    })
  }

  async getRecordID(): Promise<any> {
    return await this.storageSrvc.get('RECORD_ID');
  }

  getEvaData(event){
    this.evaSrvc.getEvaData(this.id).subscribe({
      next: (data: Eva[]) => {
        console.log("EVA", data)

        this.getEvaChart(data)

        if (event) event.target.complete();
      },
      error: (err) => {
        console.log(err)
        if (event) event.target.complete();
      },
      complete: () => {}
    })
  }

  getEvaChart(data){

    // CHART CONTAINER
    const evaChartContainer = document.getElementById('evaChart');
    if (!evaChartContainer) {
      console.error('Chart container not found');
      return;
    }

    if (this.evaChart) {
      this.evaChart.dispose();
    }

    this.evaChart = echarts.init(evaChartContainer);

    // CHART DATA
    const sortedData = data
    .slice()
    .sort((a, b) => new Date(a.fecha_eva).getTime() - new Date(b.fecha_eva).getTime());

    // // In case sortedData does not work
    // const sortedData2 = data
    // .map(obj => ({...obj,fecha_eva_date: new Date(obj.fecha_eva)}))
    // .sort((a, b) => a.fecha_eva_date.getTime() - b.fecha_eva_date.getTime())
    // .map(({ fecha_eva_date, ...rest }) => rest);
      
    const formattedData = sortedData.map(obj => {
      const formattedDate = new Date(obj.fecha_eva).toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric" });
      return { ...obj, fecha_eva: formattedDate };
    });

    const formattedData2 = sortedData.map(obj => {
      const rawDate = new Date(obj.fecha_eva);
      const formattedDate = rawDate.toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    
      return { ...obj, fecha_eva: formattedDate, rawFechaEva: rawDate }; 
    });

    const processedData = formattedData2.map(obj => ({
      fecha_eva: obj.rawFechaEva,
      eva: typeof obj.eva === 'string' ? parseInt(obj.eva, 10) : obj.eva
    })).sort((a, b) => a.fecha_eva.getTime() - b.fecha_eva.getTime());

    const seriesData = processedData.map(obj => [obj.fecha_eva, obj.eva]);

    console.log('--- SORTED', sortedData)
    console.log('--- FORMATTED', formattedData)
    console.log('--- FORMATTED2', formattedData2)
    console.log('--- PROCESSED', processedData)
    console.log('--- SERIES', seriesData)

    var xAxisData: string[] = [];
    var evaData: number[] = [];

    xAxisData = formattedData.map(obj => obj.fecha_eva).filter(Boolean) 
    evaData = formattedData.map(obj => obj.eva).map(val => {
      if (typeof val === 'string') {
        return parseInt(val, 10);
      } else if (typeof val === 'number') {
        return val;
      }
      return 0;
    });

    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    this.eva_chart_options = {
      title: {
        text: "Cuestionario EVA",
        subtext: "Niveles de dolor introducidos"
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      xAxis: {
        type: 'time',
        splitNumber: 1,
        axisLabel: {
          formatter: (value) => {
            const date = new Date(value);
            const day = String(date.getDate()).padStart(2, '0');
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          },
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        splitLine: {
          show: true,
        },
      },
      series: [
        {
          name: 'EVA Level',
          type: 'line',
          data: seriesData,
          lineStyle: {
            color: '#E67E22',
            width: 2.5,
          },
          itemStyle: {
            color: '#E67E22',
          },
          animationDelay: idx => idx * 10,
        }
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: idx => idx * 5,
    };

    this.evaChart.setOption(this.eva_chart_options);
  }

  getQuestData(event){
    this.questsSrvc.getQuestControlInfo(this.id).subscribe({
      next: (data) => {
        console.log("QUEST DATA", data)

        this.getQuestChart(data)
        if (event) event.target.complete();
      },
      error: (err) => {
        console.log(err)
        if (event) event.target.complete();
      },
      complete: () => {}
    })
  }

  getQuestChart(data){
    
    // CHART CONTAINER
    const questChartContainer = document.getElementById('questChart');
    if (!questChartContainer) {
      console.error('Chart container not found');
      return;
    }

    if (this.questChart) {
      this.questChart.dispose();
    }

    this.questChart = echarts.init(questChartContainer);

    // CHART DATA
    var num_facseg = data[0].num_facseg === "" ? 0 : +data[0].num_facseg;
    var num_barthelseg = data[0].num_barthelseg === "" ? 0 : +data[0].num_barthelseg;
    var num_seguimiento = data[0].num_seguimiento === "" ? 0 : +data[0].num_seguimiento;
    var num_neuroqol = data[0].num_neuroqol === "" ? 0 : +data[0].num_neuroqol;

    this.quest_chart_options = {
      title: {
        text: "Número de cuestionarios completados"
      },
      dataset: {
        source: [
          ['value', 'category'],
          [num_facseg, 'Valoración funcional de la marcha'],
          [num_barthelseg, 'Barthel'],
          [num_seguimiento, 'Seguimiento'],
          [num_neuroqol, 'Movilidad de las extremidades inferiores']
        ]
      },
      grid: { 
        left: '2%',
        right: '10%',
        containLabel: true 
      },
      xAxis: {
        max: 6
      },
      yAxis: { type: 'category' },
      axisLabel: {
        formatter: function(value) {
          return value.length > 20 ? value.match(/.{1,20}/g).join('\n') : value;
        }
      },
      series: [
        {
          type: 'bar',
          encode: {
            x: 'value',
            y: 'category'
          },
          
        }
      ]
    };

    this.questChart.setOption(this.quest_chart_options);
  }
}
