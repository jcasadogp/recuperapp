import { Component, OnInit } from '@angular/core';

import type { EChartsOption } from 'echarts';
import { EvaService } from 'src/app/services/eva/eva.service';
import { Eva } from 'src/app/redcap_interfaces/eva';

@Component({
  selector: 'app-results',
  templateUrl: './results.page.html',
  styleUrls: ['./results.page.scss'],
})
export class ResultsPage implements OnInit {

  id: number;
  eva_data: [];

  eva_chart: EChartsOption;

  constructor(
    private evaSrvc: EvaService
  ) { }

  ngOnInit(): void {
    this.getEvaData(null)
  }

  getEvaData(event){

    this.evaSrvc.getEvaData().subscribe({
      next: (data: Eva[]) => {
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

    const sortedData = data.map(obj => obj.fecha_eva)
      .map(dateString => new Date(dateString))
      .sort((a, b) => a.getTime() - b.getTime())
      .map(date => {
        const dateString = date.toISOString().split('T')[0];
        return data.find(obj => obj.fecha_eva === dateString);
      })
      
    const formattedData = sortedData.map(obj => {
      const formattedDate = new Date(obj.fecha_eva).toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric" });
      return { ...obj, fecha_eva: formattedDate };
    });

    console.log(sortedData)
    console.log(formattedData)

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

    this.eva_chart = {
      title:{
        text: "Cuestionario EVA",
        subtext: "Niveles de dolor introducidos"
      },
      tooltip: {},
      xAxis: {
        data: xAxisData,
        silent: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: {},
      series: [
        {
          name: 'line',
          type: 'line',
          data: evaData,
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
  }
}
