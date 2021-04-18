import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { first, map, distinct, tap, filter, take } from 'rxjs/operators';
import * as firebase from 'firebase';
import { IUser } from 'src/app/models/userInfo';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  email;
  user: IUser = { displayName: '', email: '', photoURL: '', uid: '' };
  groupPicDefault = 'assets/images/mountains.jpg';
  groupDocRef;
  currentGroup;
  enteredGroup = new BehaviorSubject<boolean>(false);
  enteredGroup$ = this.enteredGroup.asObservable();

  constructor(
    private afauth: AngularFireAuth,
    private afs: AngularFirestore,
  ) {
    this.afauth.currentUser.then(user => {
      this.email = user.email;
      this.getMyProfile(this.email);
    });
  }

  // 내정보 찿기
  getMyProfile(email): void {

    this.afs.collection('users', ref => ref.where('email', '==', this.email)).get()
      .subscribe(snaps => {
        snaps.forEach(snap => {
          this.user = snap.data() as IUser;
        });
      });
  }

  // 구룹생성
  createGroup(groupName): Promise<any> {
    return new Promise((resolve) => {
      this.afs.collection('groups').add({
        groupName,
        creator: this.email,
        conversationId: '',
        groupPic: this.groupPicDefault
      }).then((docRef) => {
        this.groupDocRef = docRef.id;
        docRef.collection('members').add({
          email: this.email,
          displayName: this.user.displayName,
          photoURL: this.user.photoURL
        }).then(() => {
          this.afs.collection('groupconvos').add({
            groupName,
            creator: this.email
          }).then((docref) => {
            this.afs.collection('groups').doc(this.groupDocRef).update({
              conversationId: docref.id
            }).then(() => {
              resolve('');
            });
          });
        });
      });
    });

  }


  // get groups
  getGroups(): Observable<any> {
    return this.afs.collection('groups', ref => ref.where('creator', '==', this.email)).valueChanges();
  }

  // group 선택시 동작
  enterGroup(group): void {
    if (group !== 'closed') {
      this.currentGroup = group;
      this.enteredGroup.next(true);
    } else {
      this.currentGroup = '';
      this.enteredGroup.next(false);
    }
  }




}
