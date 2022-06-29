import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CashService } from 'src/app/services/cash.service';
Chart.register(...registerables);

@Component({
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
})
export class OverviewPage implements OnInit {

  @ViewChild('pieCanvas') pieCanvas: ElementRef;
  @ViewChild('lineCanvas') lineCanvas: ElementRef;
  chartRenders: Chart[] = [];

  constructor(
    public cashService: CashService
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.chartRenders.push(
      new Chart(this.pieCanvas.nativeElement, {
        plugins: [ChartDataLabels],
        type: 'pie',
        data: {
          labels: ['Income', 'Expense'],
          datasets: [
            {
              label: 'Overview',
              data: [0, 1],
              backgroundColor: [
                'rgba(0, 255, 0, 0.5)',
                'rgba(255, 0, 0, 0.5)'
              ],
              hoverBackgroundColor: [
                'rgba(0, 255, 0, 0.7)',
                'rgba(255, 0, 0, 0.7)'
              ],
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            datalabels: {
              formatter: (val) => val + '₹',
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
    this.chartRenders.push(
      new Chart(this.lineCanvas.nativeElement, {
        // plugins: [ChartDataLabels],
        type: 'line',
        data: {
          labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
          datasets: [
            {
              label: 'Income',
              // eslint-disable-next-line max-len
              data: [500, 250, 300, 400, 500, 600, 700, 1800, 2900, 3000, 5100, 1200, 1300, 400, 1500, 1600, 700, 1800, 1900, 2000, 100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000, 4100, 4200, 4300, 4400, 4500, 4600, 4700, 4800, 4900, 5000],
              // backgroundColor: [
              //   'rgba(0, 255, 0, 0.5)',
              // ],
              // borderColor: [
              //   'rgba(0, 255, 0, 0.5)',
              // ],
              // borderWidth: 2,
              // hoverBackgroundColor: [
              //   'rgba(0, 255, 0, 0.7)',
              // ],
              // hoverBorderColor: [
              //   'rgba(0, 255, 0, 0.7)',
              // ],
              borderColor: 'rgba(0, 255, 0, 0.5)',
            },
          ]
        },
        options: {
          responsive: true,
          plugins: {
            // datalabels: {
            //   formatter: (val) => val + '₹',
            //   labels: {
            //     title: {
            //       font: {
            //         weight: 'bold',
            //       },
            //       color: 'white'
            //     }
            //   }
            // }
          }
        }
      })
    );
  }
  ionViewDidLeave() {
    this.chartRenders.forEach(el => {
      el.destroy();
    });
  }
}
