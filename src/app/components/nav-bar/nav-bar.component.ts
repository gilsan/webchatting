import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
  @Output() SideNavigationToggle = new EventEmitter();
  constructor(
    private firebaseService: FirestoreService,
    private router: Router
  ) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onToggleOpenSidenav(): void {
    this.SideNavigationToggle.emit(null);
  }

  logout(): void {
    this.subs.sink = this.firebaseService.logout()
      .subscribe(() => {
        this.firebaseService.setUserStatus('offline');
        this.router.navigate(['/login']);
      });
  }

}
