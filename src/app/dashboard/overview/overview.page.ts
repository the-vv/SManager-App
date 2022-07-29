import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Subscription } from 'rxjs';
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
  subs: Subscription = new Subscription();

  constructor(
    public cashService: CashService
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    this.cashService.onIncomeExpenseChange$.subscribe(() => {
      if (!this.cashService?.currentMonthData) {
        return;
      }
      if (this.chartRenders.length > 0) {
        this.chartRenders.forEach(el => {
          el.destroy();
        });
      }
      this.chartRenders.push(
        new Chart(this.pieCanvas.nativeElement, {
          plugins: [ChartDataLabels],
          type: 'pie',
          data: {
            labels: ['Income', 'Expense'],
            datasets: [
              {
                label: 'Overview',
                data: [this.cashService.currentMonthData.totalIncome, this.cashService.currentMonthData.totalExpense],
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
                formatter: (val) => `₹${val}`,
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
      const now = new Date();
      const currentDays = Array(new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).getDate()).fill(0).map((_, i) => i + 1);
      const currentIncomes = currentDays.map(day => {
        const income = this.cashService.allIncomes.find(i => (i.datetime as Date).getDate() === day);
        return income ? income.amount : 0;
      });
      const currentExpenses = currentDays.map(day => {
        const expense = this.cashService.allExpenses.find(i => (i.datetime as Date).getDate() === day);
        return expense ? expense.amount : 0;
      });
      this.chartRenders.push(
        new Chart(this.lineCanvas.nativeElement, {
          // plugins: [ChartDataLabels],
          type: 'line',
          data: {
            // eslint-disable-next-line max-len
            labels: currentDays, // total days in current month
            datasets: [
              {
                label: 'Income',
                data: currentIncomes,
                borderColor: 'rgba(0, 255, 0, 0.5)',
                backgroundColor: 'rgba(0, 255, 0, 0.5)',
              },
              {
                label: 'Expense',
                data: currentExpenses,
                borderColor: 'rgba(255, 0, 0, 0.5)',
                backgroundColor: 'rgba(255, 0, 0, 0.5)',
              }
            ]
          },
          options: {
            responsive: true,
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
