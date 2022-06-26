import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfigService } from '../services/config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthComponentGuard implements CanActivate {
  constructor(private config: ConfigService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      console.log(this.config.isLoggedIn);
      return this.config.isLoggedIn ? this.config.isLoggedIn : this.router.parseUrl('/login');
  }

}
