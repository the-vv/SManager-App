import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Subscription, take } from 'rxjs';
import { IAccount, ICategory } from 'src/app/models/common';
import { CashService } from 'src/app/services/cash.service';
import { CommonService } from 'src/app/services/common.service';
import { ConfigService } from 'src/app/services/config.service';
import { FirebaseService } from 'src/app/services/firebase.service';
Chart.register(...registerables);
import ColorGenerator from 'random-color-array-generator/ColorGenerator.min.js';


@Component({
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
})
export class OverviewPage implements OnInit {

  @ViewChild('pieCanvas') pieCanvas: ElementRef;
  @ViewChild('lineCanvas') lineCanvas: ElementRef;
  chartRenders: Chart[] = [];
  subs: Subscription;
  allAccounts: IAccount[] = [];
  currentAccount: IAccount;
  allCategories: ICategory[] = [];
  showPieChart = false;

  constructor(
    public cashService: CashService,
    private firebase: FirebaseService,
    private config: ConfigService,
    private common: CommonService
  ) { }

  ngOnInit() { }

  ionViewDidEnter() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
    this.subs = this.firebase.getUserAccounts().subscribe((accounts) => {
      this.allAccounts = accounts;
      this.currentAccount = this.allAccounts.find(el => el.id === this.config.currentAccountId);
    });
    this.currentAccount = this.allAccounts.find(el => el.id === this.config.currentAccountId);
    this.cashService.onIncomeExpenseChange$.subscribe(() => {
      this.currentAccount = this.allAccounts.find(el => el.id === this.config.currentAccountId);
      if (!this.cashService?.currentMonthData) {
        return;
      }
      const groupedExpenses = this.groupBy(this.cashService.allExpenses, 'categoryId');
      for (const key in groupedExpenses) {
        if (groupedExpenses.hasOwnProperty(key)) {
          groupedExpenses[key] = groupedExpenses[key].reduce((acc, cur) => acc + cur.amount, 0);
        }
      }
      this.firebase.getAllUserCategories().pipe(take(1)).subscribe({
        next: (categories) => {
          this.allCategories = categories;
          const expenses = [];
          for (const key in groupedExpenses) {
            if (groupedExpenses.hasOwnProperty(key)) {
              expenses.push({
                name: this.allCategories.find(el => el.id === key)?.name ?? 'Uncategorized',
                value: groupedExpenses[key]
              });
            }
          }
          const colorGenerator = new ColorGenerator(expenses.length);
          if (this.chartRenders.length > 0) {
            this.chartRenders.forEach(el => {
              el.destroy();
            });
          }
          if (expenses.length > 0) {
            this.showPieChart = true;
            this.chartRenders.push(
              new Chart(this.pieCanvas.nativeElement, {
                plugins: [ChartDataLabels],
                type: 'pie',
                data: {
                  labels: expenses.map(el => `${el.name}`),
                  datasets: [
                    {
                      label: 'Overview',
                      data: expenses.map(el => el.value),
                      backgroundColor: colorGenerator.generateRGB(),
                      hoverBackgroundColor: colorGenerator.generateRGB(),
                    },
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
                            weight: 'bolder',
                            size: 16,
                            family: 'monospace'
                          },
                          color: 'black',
                          borderColor: 'black',
                          textShadowBlur: 2
                        }
                      }
                    }
                  }
                }
              })
            );
          } else {
            this.showPieChart = false;
          }
          const now = new Date();
          const currentDays = Array(new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).getDate()).fill(0).map((_, i) => i + 1);
          const currentIncomes = currentDays.map(day => {
            const income = this.cashService.allIncomes
              .filter(i => (i.datetime as Date).getDate() === day)
              .reduce((acc, curr) => acc + curr.amount, 0);
            return income ? income : 0;
          });
          const currentExpenses = currentDays.map(day => {
            const expense = this.cashService.allExpenses.filter(i => (i.datetime as Date).getDate() === day)
              .reduce((acc, curr) => acc + curr.amount, 0);
            return expense ? expense : 0;
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
                responsive: true
              }
            })
          );
        },
        error: () => {
          this.common.showToast('Something went wrong');
        }
      });
    });
  }
  ionViewDidLeave() {
    this.chartRenders.forEach(el => {
      el.destroy();
    });
  }

  public groupBy(xs: any, key: string) {
    return xs.reduce((rv: any, x: any) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };

}
