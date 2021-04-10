import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { from, Observable, BehaviorSubject, pipe, of } from 'rxjs';
import { concatMap, filter, first, map, switchMap, take, tap, distinct, last } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { IUser } from '../models/userInfo';
import { IStatus } from './../models/userInfo';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  currentUser = new BehaviorSubject<IUser>({ displayName: '', email: '', photoURL: '' });
  currentUser$ = this.currentUser.asObservable();

  friendsStatus = new BehaviorSubject<IUser[]>([]);
  friendsStatus$ = this.friendsStatus.asObservable();

  statusUpdate = new BehaviorSubject<string>('noep');
  statusUpdate$ = this.statusUpdate.asObservable();

  uid: string;
  constructor(
    private db: AngularFirestore,
    private firebaseAuth: AngularFireAuth,
    private storage: AngularFireStorage
  ) {
    this.myProfile()
      .subscribe((data) => {
        if (data) {
          this.uid = data.uid;
          this.getProfile(this.uid)
            .subscribe(user => {
              this.currentUser.next(user);
            });
        } else {
          this.uid = null;
          this.currentUser.next(null);
        }

      });

    this.updateStatuses();
  }

  // 내정보
  myProfile(): Observable<any> {
    return this.firebaseAuth.authState;
  }

  // 내 uid로 내 정보찿기
  getProfile(uid: string): Observable<any> {
    console.log('[user][51]', uid);
    return this.db.doc<IUser>(`users/${uid}`).valueChanges()
      .pipe(
        tap(() => console.log('[user][52]')),
        distinct(user => user.email)
      );
  }

  // 내 uid 찿기 상태변경시 마다 발생
  getMyUid(): Observable<any> {
    console.log('[user][60]');
    return this.firebaseAuth.authState;
  }

  // 내 uid 찿기
  getCurrentuser(): Observable<any> {
    console.log('[user][66]');
    return from(this.firebaseAuth.currentUser);
  }

  // 닉네임 변경
  updateName(newname, uid): Observable<any> {
    console.log('[user][72]');
    return from(this.db.doc(`users/${uid}`).update({ displayName: newname }));
  }

  // 사진 변경
  updatePhotoURL(photoURL: string, uid: string): Observable<any> {
    console.log('[user][78]');
    return from(this.db.doc(`users/${uid}`).update({ photoURL }));
  }

  // 그림 올리기
  updateProfilePic(file, uid): Observable<any> {
    console.log('[user][84]');
    return from(this.storage.upload(`profilepics/${uid}`, file));
  }

  // 그림 URL 가저여기
  downloadProfilePic(uid): Observable<any> {
    console.log('[user][90]');
    return this.storage.ref(`profilepics/${uid}`).getDownloadURL();
  }

  // 모든 친구가져오기
  getAllUsers(email: string): Observable<any> {
    console.log('[user][96]');
    // this.firebaseAuth.currentUser.then((data) => {
    //   console.log('[currentUser', data);
    // });
    return this.db.collection('users', ref => ref.where('email', '!=', email).limit(4)).valueChanges();
    /*
    참고
   return this.db.collection('users', ref => ref.limit(2)).valueChanges()
         .pipe(
          map( (users) => {
             users.forEach((element: IUser, i) => {
                if (element.email === this.firebaseAuth.currentUser.emal) {
                   users.splice(i, 1);
                }
             });
             return users;
          } )
         );
     */
  }

  getAllUsers2(email: string): Observable<any> {
    console.log('[user][114]');
    return from(this.db.collection('users', ref => ref.where('email', '!=', email)).get())
      .pipe(
        map(info => info.docs.map(doc => doc.data()))
      );
  }

  // 친구 정보 가져오기
  getUsers(email: string, title: string): Observable<IUser[]> {
    console.log('[user][123]');
    return this.db.collection('users', ref => ref.where('email', '==', email)).get()
      .pipe(
        map((result) => result.docs.map(snap => snap.data() as IUser)),
        first(),
      );
  }

  // 특정 사용자 프로파일
  getUserDetails(users): any {
    console.log('[user][135]');
    const userProfiles = [];
    const collRef = this.db.collection('users').ref;
    users.forEach((element) => {
      const query = collRef.where('email', '==', element.sender);
      query.get().then((snapShot) => {
        if (snapShot.empty) {
          userProfiles.push(snapShot.docs[0].data());
        }
      });
    });

    return userProfiles;
  }

  instantSearch(startValue, endValue): Observable<any> {
    console.log('[user][51]');
    return this.db.collection('users',
      ref => ref.orderBy('displayName')
        .startAt(startValue)
        .endAt(endValue)
    ).valueChanges();
  }

  // 사용자 상태 가져오기
  getFriendStatus(friends: IUser[]): void {

    const friendStatus = [];
    friends.map((element, i) => {
      const queryRef = this.db.doc(`status/${element.uid}`).snapshotChanges().pipe(
        map(snaps => snaps.payload.data()),
      );
      queryRef.subscribe((status: IStatus) => {
        const value = status.status;
        const newStatus = { status: value, ...element };
        friendStatus[i] = newStatus;
        if (i === friends.length - 1) {
          console.log('[user][176][getFriendStatus] [uid]', friendStatus);
          this.friendsStatus.next(friendStatus);
        }
      });
    });

  }


  getStatusFriend(friends: IUser[]): void {
    const friendStatus = [];
    friends.map((element, i) => {
      this.db.doc(`status/${element.uid}`).get()
        .pipe(
          map(result => result.data())
        ).subscribe((status: IStatus) => {
          const value = status.status;
          const newStatus = { status: value, ...element };
          friendStatus[i] = newStatus;
          if (i === friends.length - 1) {
            console.log('[user][196][getFriendStatus]', friendStatus);
            this.friendsStatus.next(friendStatus);
          }
        });
    });

  }

  //
  updateStatuses(): void {
    this.db.collection('status').snapshotChanges(['modified'])
      .subscribe((data) => {
        console.log('[user][updateStatuses][210]', data);
        if (data.length !== 0) {
          this.statusUpdate.next('StatusUpdated');
        }
      });
  }



}
