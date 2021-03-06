import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { from, Observable, BehaviorSubject, pipe, of, Subject } from 'rxjs';
import { concatMap, filter, first, map, switchMap, take, tap, distinct, last, delay } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { IUser } from '../models/userInfo';
import { IStatus } from './../models/userInfo';
import { StoreService } from './store.service';
import { SubSink } from 'subsink';
import { EVENT_MANAGER_PLUGINS } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {

  currentUser = new BehaviorSubject<IUser>({ displayName: '', email: '', photoURL: '' });
  currentUser$ = this.currentUser.asObservable();

  friendsStatus = new BehaviorSubject<IUser[]>([]);
  friendsStatus$ = this.friendsStatus.asObservable();

  statusUpdate = new BehaviorSubject<string>('noep');
  statusUpdate$ = this.statusUpdate.asObservable();

  userDetail = new Subject();
  userDetail$ = this.userDetail.asObservable();

  user: IUser;
  private subs = new SubSink();

  uid: string;
  constructor(
    private db: AngularFirestore,
    private firebaseAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private store: StoreService
  ) {
    this.myProfile()
      .subscribe((data) => {

        if (data) {
          this.uid = data.uid;
          this.getUserProfile(this.uid)
            .subscribe(user => {
              // console.log('[USER][34][내프로파일]', user);
              this.user = user;
              this.currentUser.next(user);
            });
        } else {
          this.uid = null;
          this.currentUser.next(null);
        }

      });

    this.updateStatuses();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // 내정보
  myProfile(): Observable<any> {
    return this.firebaseAuth.authState;
  }

  // 내 uid로 내 정보찿기
  getProfile(uid: string, caller: string = ''): Observable<any> {
    return this.db.doc<IUser>(`users/${uid}`).valueChanges()
      .pipe(
        // tap((data) => console.log('[user][63][호출자]', data, caller)),
        tap((friend) => this.store.setFriends(friend)),
        distinct(user => user.email),
      );
  }

  getUserProfile(uid: string, caller: string = ''): Observable<any> {
    // console.log('[user][51]', uid);
    return this.db.doc<IUser>(`users/${uid}`).get()
      .pipe(
        map(snaps => snaps.data()),
        // tap(data => console.log('[user][87][getUserProfile][호출자]', data, caller))

      );
  }


  // 내 uid 찿기 상태변경시 마다 발생
  getMyUid(): Observable<any> {
    // console.log('[user][60]');
    return this.firebaseAuth.authState;
  }

  // 내 uid 찿기
  getCurrentuser(): Observable<any> {
    // console.log('[user][66]');
    return from(this.firebaseAuth.currentUser);
  }

  // 닉네임 변경
  updateName(newname, uid): Observable<any> {
    // console.log('[user][72]');
    return from(this.db.doc(`users/${uid}`).update({ displayName: newname }));
  }

  // 사진 변경
  updatePhotoURL(photoURL: string, uid: string): Observable<any> {
    // console.log('[user][78]');
    return from(this.db.doc(`users/${uid}`).update({ photoURL }));
  }

  // 그림 올리기
  updateProfilePic(file, uid): Observable<any> {
    // console.log('[user][84]');
    return from(this.storage.upload(`profilepics/${uid}`, file));
  }


  // 사용자 프로파일 찿기
  getUserDetailsOrg(users): Promise<any> {
    return new Promise((resolve) => {
      const userProfiles = [];
      const collRef = this.db.collection('users').ref;
      const len = users.length - 1;
      users.forEach((element, i) => {
        const query = collRef.where('email', '==', element.requestemail);
        query.get().then((snapshot) => {
          if (!snapshot.empty) {
            userProfiles.push(snapshot.docs[0].data());
            if (len === i) {
              resolve(userProfiles);
              // this.userDetail.next(userProfiles);
            }
          }
        });
      });
    });

  }

  // 전체사용자 찿기
  getAllUsersOrg(): Observable<any> {
    return this.db.collection('users', ref => ref.orderBy('email')).valueChanges()
      .pipe(
        map((users) => {
          users.forEach((element: any, i) => {
            if (element.email === this.user.email) {
              users.splice(i, 1);
            }
          });
          return users;
        })
      );
  }



  // 그림 URL 가저오기
  downloadProfilePic(uid): Observable<any> {
    // console.log('[user][90]');
    return this.storage.ref(`profilepics/${uid}`).getDownloadURL();
  }

  // 모든 친구가져오기
  getAllUsers(email: string): Observable<any> {

    return this.db.collection('users', ref => ref.where('email', '!=', email).limit(4)).get()
      .pipe(
        map(info => info.docs.map(doc => doc.data()))
      );
    // return this.db.collection('users', ref => ref.where('email', '!=', email).limit(4)).valueChanges();
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
    return from(this.db.collection('users', ref => ref.where('email', '!=', email)).get())
      .pipe(
        map(info => info.docs.map(doc => doc.data()))
      );
  }

  // 친구 정보 가져오기
  getUsers(email: string, title: string = ''): Observable<IUser[]> {
    return this.db.collection('users', ref => ref.where('email', '==', email)).get()
      .pipe(
        map((result) => result.docs.map(snap => snap.data() as IUser)),
        first(),
      );
  }

  // 특정 사용자 프로파일
  getUserDetails(users): any {
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

  findUserDetail(users): Promise<any> {
    return new Promise((resolve) => {
      const userProfiles = [];
      const len = users.length - 1;
      const collRef = this.db.collection('users').ref;
      users.forEach((element) => {
        const query = collRef.where('email', '==', element.sender);
        query.get().then((snapShot) => {
          if (snapShot.empty) {
            userProfiles.push(snapShot.docs[0].data());
            if (len === 1) {
              resolve(userProfiles);
            }
          }
        });
      });
    });
  }


  instantSearch(startValue, endValue): Observable<any> {
    console.log('[user][51]', startValue, endValue);
    return this.db.collection('users',
      ref => ref.orderBy('displayName')
        .startAt(startValue)
        .endAt(endValue)
    ).valueChanges()
      .pipe(
        tap((user) => console.log(' [instant]', user)),
        filter(user => user.length > 0)
      );
  }

  // 사용자 상태 가져오기
  getFriendStatus(friends: IUser[], caller: string): void {
    // console.log('[USER][188][getFriendStatus] ', caller);
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
          // console.log('[user][176][getFriendStatus] [uid]', friendStatus);
          this.friendsStatus.next(friendStatus);
        }
      });
    });

  }




  getStatusFriend(friends: IUser[], caller: string): void {
    // console.log('[FRIEND][209][getStatusFriend] ', caller);
    const friendStatus = [];
    friends.map((element, i) => {
      this.db.doc(`status/${element.uid}`).get()
        .pipe(
          map(result => result.data())
        ).subscribe((state: IStatus) => {
          const value = state.status;
          const newStatus = { state: value, ...element };
          friendStatus[i] = newStatus;
          if (i === friends.length - 1) {
            // console.log('[FRIEND][220][getFriendStatus][2]', friendStatus);
            this.friendsStatus.next(friendStatus);
          }
        });
    });

  }



  //// status 상태 변경
  updateStatuses(): void {
    this.subs.sink = this.db.collection('status').snapshotChanges(['modified'])
      .subscribe((data) => {
        // console.log('[USER 상태변경][updateStatuses][210]', data);
        if (data.length !== 0) {
          this.statusUpdate.next('StatusUpdated');
        }
      });
  }


  findUserStatus(friends): Promise<any> {
    return new Promise((resolve) => {
      const friendState = [];
      const stateColl = this.db.collection('status').ref;
      delay(500);
      const len = friends.length - 1;
      friends.forEach((element, i) => {
        // console.log('[][SNAPSHOT]', element.requestemail);
        const queryRef = stateColl.where('email', '==', element.requestemail);
        queryRef.get().then(snapShot => {
          if (!snapShot.empty) {
            friendState.push(snapShot.docs[0].data());
            //  console.log('[][SNAPSHOT]', snapShot, element, snapShot.docs[0].data(), friendState);
            if (len === i) {
              resolve(friendState);
            }
          }
        });
      });

    });

  }




}
