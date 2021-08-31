import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(...registerables);

@Component({
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
})
export class OverviewPage implements OnInit {

  @ViewChildren('barCanvas') doughnutCanvas: QueryList<ElementRef>;
  chartRenders: Chart[] = [];

  constructor() { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.doughnutCanvas.forEach(el => {
      this.chartRenders.push(
        new Chart(el.nativeElement, {
          plugins: [ChartDataLabels],
          type: 'pie',
          data: {
            labels: ['Income', 'Expense'],
            datasets: [
              {
                label: 'Overview',
                data: [25, 75],
                backgroundColor: [
                  'rgba(0, 0, 255, 0.5)',
                  'rgba(255, 255, 0, 0.5)'
                ],
                hoverBackgroundColor: ['rgba(0, 0, 255, 0.5)', 'rgba(255, 255, 0, 0.5)'],
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              datalabels: {
                formatter: (val) => val + '%',
                labels: {
                  title: {
                    font: {
                      weight: 'bold',
                    },
                    color: 'white'
                  }
                }
              }
            }
          }
        })
      );
    });
  }
  ionViewDidLeave() {
    this.chartRenders.forEach(el => {
      el.destroy();
    });
  }
}