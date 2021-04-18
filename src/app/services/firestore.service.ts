import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { AngularFirestore } from '@angular/fire/firestore';

import { from, Observable, BehaviorSubject, Subject } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { IUser } from '../models/userInfo';


@Injectable({
  providedIn: 'root'
})

export class FirestoreService {

  private authState: any;
  currentUserId = '';

  isLoggedIn = false;
  subject$ = new BehaviorSubject<boolean>(false);
  currentUid = new BehaviorSubject<string>('');
  currentUid$ = this.currentUid.asObservable();
  isLoggedIn$ = this.subject$.asObservable();
  user: IUser;
  constructor(
    private db: AngularFirestore,
    private firebaseAuth: AngularFireAuth,
  ) {
    this.inituser();

    this.firebaseAuth.authState.subscribe((user) => {
      this.user = user;
      this.authState = user;
    });
  }

  inituser(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.subject$.next(true);
    }
  }

  authUser(): boolean {
    return this.authState !== null && this.authState !== undefined ? true : false;
  }

  // 로그인 사용자 정보
  currentUserDetails(): void {
    this.db.doc(`status/${this.currentUserId}`).get()
      .subscribe(user => {
        console.log('[][currentUserDetails]', user.data());
      });
  }



  login(email: string, password: string): Observable<any> {
    return from(this.firebaseAuth.signInWithEmailAndPassword(email, password))
      .pipe(
        tap(res => {
          // console.log('login: ', res);
          this.authState = res.user;
          this.currentUserId = res.user.uid;
          this.isLoggedIn = true;
          localStorage.setItem('user', JSON.stringify(res.user));
          this.subject$.next(true);
          this.currentUid.next(res.user.uid);
        })
      );

  }

  setStatus(uid): void {

  }

  setUserStatus(state, currentUserId = this.currentUserId, email: string = ''): void {
    // console.log('[상태변경][setUserStatus]: ', currentUserId, state);
    const statuscollection = this.db.doc(`status/${currentUserId}`);
    const data = {
      state,
      email
    };
    statuscollection.update(data).catch((error) => {
      console.log('[에러]', error);
    });
  }

  signup(email: string, password: string): Observable<any> {
    return from(this.firebaseAuth.createUserWithEmailAndPassword(email, password))
      .pipe(
        tap(res => {
          this.currentUserId = res.user.uid;
          this.currentUid.next(this.currentUserId);
          this.isLoggedIn = true;
          localStorage.setItem('user', JSON.stringify(res.user));
          this.subject$.next(true);
        })
      );

  }

  logout(): Observable<any> {
    return from(this.firebaseAuth.signOut())
      .pipe(
        tap(res => {
          localStorage.removeItem('user');
          this.subject$.next(false);
          this.setUserStatus('offline');
        })
      );
  }


  // 등록시 만들어짐
  setUserData(email: string, displayName: string, photoURL: string): void {

    this.db.doc(`status/${this.currentUserId}`).set({
      state: 'online',
      uid: this.currentUserId,
      email: this.user.email
    });

    this.db.doc(`users/${this.currentUserId}`).set({
      email,
      displayName,
      photoURL,
      uid: this.currentUserId
    });

  }








}
