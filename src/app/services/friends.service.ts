import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { first, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class FriendsService {


  friendsCollection: AngularFirestoreCollection = this.db.collection('friends');
  friendsCollTrigger = new BehaviorSubject<string>('Exists');
  friendsCollTrigger$ = this.friendsCollTrigger.asObservable();
  docId: string;

  constructor(
    private db: AngularFirestore,
    private firebaseAuth: AngularFireAuth,
  ) { }


  getMyFriends(uid, email): Observable<any> {
    console.log('[friend][26]');
    return this.db.collection(`friends/${uid}/myfriends`).valueChanges()
      .pipe(
        first()
      );
  }

  getmyFriends(email: string): Promise<any> {
    console.log('[friend][34]');
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
    console.log('[friend][51]');
    return this.db.doc('friends/' + this.docId).collection('myfriends').valueChanges();
  }

  getRequestFriendList(email: string): Observable<any> {
    console.log('[friend][56]');
    return this.db.collectionGroup('myfriends', ref => ref.where('email', '==', email)).get()
      .pipe(
        map((result) => result.docs.map(snap => snap.data())),
        first(),
      );
  }







}
