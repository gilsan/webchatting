import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { from, Observable, BehaviorSubject, pipe, of } from 'rxjs';
import { concatMap, filter, first, map, switchMap, take, tap, distinct } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { IUser } from '../models/userInfo';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  currentUser = new BehaviorSubject<IUser>({ displayName: '', email: '', photoURL: '' });
  currentUser$ = this.currentUser.asObservable();

  userStatus = new BehaviorSubject<string[]>([]);
  userStatus$ = this.userStatus.asObservable();

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
    return this.db.collection('users', ref => ref.where('email', '!=', email).limit(2)).valueChanges();
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
    console.log('[user][133]');
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
    console.log('[user][49]');
    return this.db.collection('users',
      ref => ref.orderBy('displayName')
        .startAt(startValue)
        .endAt(endValue)
    ).valueChanges();
  }

  // 사용자 상태 가져오기
  getUserStatus(friends: IUser[]): void {
    console.log('[user][59]');
    const friendStatus = [];
    const user = localStorage.getItem('user');
    const uid = JSON.parse(user).uid;
    // const statusColl = this.db.collection('status').ref;

    friends.map((element, i) => {
      const queryRef = this.db.doc(`status/${uid}`).get();
      queryRef.subscribe((status) => {
        const val: any = status.data();
        const value = val.status;
        friendStatus.push({ status: value, ...element });
        if (i === friends.length - 1) {
          this.userStatus.next(friendStatus);
        }
      });
    });
  }



}
