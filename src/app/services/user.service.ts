import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { from, Observable, BehaviorSubject, pipe } from 'rxjs';
import { concatMap, filter, first, map, switchMap, take, tap, distinct } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { IUser } from '../models/userInfo';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  currentUser = new BehaviorSubject<IUser>({ displayName: '', email: '', photoURL: '' });
  currentUser$ = this.currentUser.asObservable();

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
    return from(this.db.doc<IUser>(`/users/${uid}`).valueChanges())
      .pipe(
        distinct(user => user.email)
      );
  }

  // 내 uid 찿기 상태변경시 마다 발생
  getMyUid(): Observable<any> {
    return this.firebaseAuth.authState;
  }

  // 내 uid 찿기
  getCurrentuser(): Observable<any> {
    return from(this.firebaseAuth.currentUser);
  }

  // 닉네임 변경
  updateName(newname, uid): Observable<any> {
    return from(this.db.doc(`users/${uid}`).update({ displayName: newname }));
  }

  // 사진 변경
  updatePhotoURL(photoURL: string, uid: string): Observable<any> {
    return from(this.db.doc(`users/${uid}`).update({ photoURL }));
  }

  // 그림 올리기
  updateProfilePic(file, uid): Observable<any> {
    return from(this.storage.upload(`profilepics/${uid}`, file));
  }

  // 그림 URL 가저여기
  downloadProfilePic(uid): Observable<any> {
    return this.storage.ref(`profilepics/${uid}`).getDownloadURL();
  }

  // 모든 친구가져오기
  getAllUsers(email: string): Observable<any> {
    return this.db.collection('users', ref => ref.where('email', '!=', email)).valueChanges();
  }

  getAllUsers2(email: string): Observable<any> {
    return from(this.db.collection('users', ref => ref.where('email', '!=', email)).get())
      .pipe(
        map(info => info.docs.map(doc => doc.data()))
      );
  }

  // 친구 정보 가져오기
  getUsers(email: string): Observable<any> {
    return from(this.db.collection('users', ref => ref.where('email', '==', email))
      .get() // 값만 가졍온후 complete 함. stateChange(), valueChange() 는 값이 바뀌면계속 보냄.
      .pipe(
        map((result) => result.docs.map(snap => snap.data())),
        first(),
        tap((data) => console.log('getUsers: ', data))
      )
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



}
