import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { AngularFirestore } from '@angular/fire/firestore';

import { from, Observable, BehaviorSubject } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})

export class FirestoreService {

  private authState: any;
  currentUserId = '';

  isLoggedIn = false;
  subject$ = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.subject$.asObservable();

  constructor(
    private db: AngularFirestore,
    private firebaseAuth: AngularFireAuth,
  ) {
    this.inituser();

    this.firebaseAuth.authState.subscribe((user) => {
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
        })
      );

  }

  setUserStatus(status, currentUserId = this.currentUserId): void {
    // console.log('[상태변경][currentUserId]: ', currentUserId, status);
    const statuscollection = this.db.doc(`status/${currentUserId}`);
    const data = {
      status
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
        })
      );
  }



  setUserData(email: string, displayName: string, photoURL: string): void {
    const path = `/users/${this.currentUserId}`;
    const statuspath = `status/${this.currentUserId}`;
    const userdoc = this.db.doc(path);
    const status = this.db.doc(statuspath);
    userdoc.set({
      email,
      displayName,
      photoURL
    });

    status.set({
      status: 'online'
    });
  }






}