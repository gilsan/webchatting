import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
import { LocalizedString } from '@angular/compiler';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {


  @Output() SideNavigationToggle = new EventEmitter();
  constructor(
    private firebaseService: FirestoreService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onToggleOpenSidenav(): void {
    this.SideNavigationToggle.emit(null);
  }

  logout(): void {
    this.firebaseService.logout()
      .subscribe(() => {
        this.firebaseService.setUserStatus('offline');
        this.router.navigate(['/login']);
      });
  }

}
