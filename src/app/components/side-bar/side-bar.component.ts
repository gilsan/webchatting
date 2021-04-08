import { Component, OnInit } from '@angular/core';

import { UserService } from './../../services/user.service';
import { FriendsService } from './../../services/friends.service';
import { RequestService } from 'src/app/services/request';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {

  constructor(
    private userService: UserService,
    private friendsService: FriendsService,
    private requestService: RequestService,
    private db: AngularFirestore,
  ) { }

  requestRef: AngularFirestoreCollection = this.db.collection('hong');

  ngOnInit(): void {
  }

  storeTest(): void {
    this.deleteItem('nAmNPTJptnCCQv6zbaeZ').subscribe(data => {
      console.log('side bar test: ', data);
    });
  }

  deleteItem(id): Observable<any> {
    return from(this.db.doc(`hong/${id}`).delete());
  }

}
