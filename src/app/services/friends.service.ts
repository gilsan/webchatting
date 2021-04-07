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
    return this.db.collection(`friends/${uid}/myfriends`).valueChanges()
      .pipe(
        first()
      );
  }

  getmyFriends(email: string): Promise<any> {
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
    return this.db.doc('friends/' + this.docId).collection('myfriends').valueChanges();
  }







}
