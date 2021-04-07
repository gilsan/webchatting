import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { FirestoreService } from './services/firestore.service';

@Injectable()
export class AuthguardService implements CanActivate {

  constructor(
    private firestoreService: FirestoreService,
    private router: Router
  ) { }


  // tslint:disable-next-line:max-line-length
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {


    if (this.firestoreService.authUser()) {
      return true;
    } else {
      this.router.navigate(['login']);
      return false;
    }

  }

}
