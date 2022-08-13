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
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';


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
    private common: CommonService,
    private router: Router,
    private storage: StorageService
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
          const categoryGroupedExpeses = [];
          for (const key in groupedExpenses) {
            if (groupedExpenses.hasOwnProperty(key)) {
              const catItem = this.allCategories.find(el => el.id === key);
              if (catItem) {
                categoryGroupedExpeses.push({
                  name: catItem.name,
                  value: groupedExpenses[key],
                  color: catItem.color
                });
              } else if (categoryGroupedExpeses.find(el => el.name === 'Uncategorized')) {
                categoryGroupedExpeses.find(el => el.name === 'Uncategorized').value += groupedExpenses[key];
              } else {
                categoryGroupedExpeses.push({
                  name: 'Uncategorized',
                  value: groupedExpenses[key],
                  color: this.getRandomColor()
                });
              }
            }
          }
          const colorGenerator = new ColorGenerator(categoryGroupedExpeses.length);
          if (this.chartRenders.length > 0) {
            this.chartRenders.forEach(el => {
              el.destroy();
            });
          }
          if (categoryGroupedExpeses.length > 0) {
            this.showPieChart = true;
            this.chartRenders.push(
              new Chart(this.pieCanvas.nativeElement, {
                plugins: [ChartDataLabels],
                type: 'pie',
                data: {
                  labels: categoryGroupedExpeses.map(el => `${el.name}`),
                  datasets: [
                    {
                      label: 'Overview',
                      data: categoryGroupedExpeses.map(el => el.value),
                      backgroundColor: categoryGroupedExpeses.map(el => `${el.color}`),
                      hoverBackgroundColor: colorGenerator.generateRGB(),
                    },
                  ]
                },
                options: {
                  responsive: true,
                  plugins: {
                    datalabels: {
                      formatter: (value, context) => (`${context.chart.data.labels[context.dataIndex]}\n₹ ${value}`),
                      align: 'start',
                      anchor: 'end',
                      padding: 5,
                      labels: {
                        title: {
                          font: {
                            weight: 'bold',
                            size: 12,
                          },
                          color: 'white',
                          textStrokeColor: 'black',
                          textStrokeWidth: 1,
                          textAlign: 'center',
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
    this.storage.setLastPage(this.router.url.slice(this.router.url.lastIndexOf('/') + 1));
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
  }


  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


}
