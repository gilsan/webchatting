import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { first, map, distinct, tap, filter, take } from 'rxjs/operators';
import { IRUserInfo } from '../models/userInfo';


@Injectable({
  providedIn: 'root'
})
export class FriendsService {


  friendsCollection: AngularFirestoreCollection = this.db.collection('friends');
  friendsCollTrigger = new BehaviorSubject<string>('Exist');
  friendsCollTrigger$ = this.friendsCollTrigger.asObservable();
  docId: string;

  constructor(
    private db: AngularFirestore,
    private firebaseAuth: AngularFireAuth,
  ) { }


  getMyFriends(uid): Observable<any> {
    // console.log('[friend][26]');
    return this.db.collection(`friends/${uid}/myfriends`).valueChanges()
      .pipe(
        first()
      );
  }

  getmyFriends(email: string): Promise<any> {
    // console.log('[FRIEND SERVICE][35]');
    return new Promise((resolve) => {
      const query = this.friendsCollection.ref.where('email', '==', email);
      query.get().then((snapShot) => {
        if (!snapShot.empty) {
          this.docId = snapShot.docs[0].id;
          this.friendsCollTrigger.next('Exists');
          resolve(this.friendsCollTrigger);
        } else {
          this.friendsCollTrigger.next('Nothing');
          resolve(this.friendsCollTrigger);
        }
      });
    });
  }

  getFriendList(): Observable<any> {
    // console.log('[friend][51]');
    return this.db.doc('friends/' + this.docId).collection('myfriends').valueChanges();
  }

  // 요청자로 친구 찿기
  getRequestFriendList(email: string, caller: string = 'none'): Observable<any> {
    if (caller === 'none') {
      return from([]);
    }
    return this.db.collectionGroup<IRUserInfo>('myfriends', ref => ref.where('requestemail', '==', email)).valueChanges()
      .pipe(
        // tap(data => console.log('[friend][61][getRequestFriendList][TAP][호출자][2]', data, email, caller)),
        take(1),
      );
  }









}
