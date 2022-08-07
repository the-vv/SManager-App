import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ECashType, ICategory } from 'src/app/models/common';
import { CashService } from 'src/app/services/cash.service';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.page.html',
  styleUrls: ['./expense.page.scss'],
})
export class ExpensePage implements OnInit {

  public cashType = ECashType;
  public allCategories: ICategory[] = [];
  private subs: Subscription;


  constructor(
    public cashService: CashService,
    private firebase: FirebaseService
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
    this.subs = this.firebase.getAllUserCategories().subscribe({
      next: (categories) => {
        this.allCategories = categories;
      }
    });
  }

  getCategoryName(categoryId: string) {
    if(!categoryId) {
      return 'Uncategorized';
    }
    const category = this.allCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  }

}
