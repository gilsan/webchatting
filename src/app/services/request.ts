import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { from, Observable, BehaviorSubject, of, pipe } from 'rxjs';
import { concatMap, first, map, switchMap, tap } from 'rxjs/operators';
import { AngularFireStorage } from '@angular/fire/storage';
import { IUser } from '../models/userInfo';



@Injectable({
  providedIn: 'root'
})
export class RequestService {

  addFriend$ = new BehaviorSubject<boolean>(false);
  addFriendObserver$ = this.addFriend$.asObservable();

  approveFriend$ = new BehaviorSubject<boolean>(false);
  approveFriendObserver$ = this.approveFriend$.asObservable();

  constructor(
    private db: AngularFirestore,
    private firebaseAuth: AngularFireAuth,
    private storage: AngularFireStorage,

  ) { }


  requestRef: AngularFirestoreCollection = this.db.collection('requests');
  // 사용방법 2가지
  // friendsRef: firebase.default.firestore.CollectionReference = this.db.collection('friends').ref;
  friendsRef: AngularFirestoreCollection = this.db.collection('friends');

  addRequest(newrequest, email): Observable<any> {
    console.log('[[request][38]');
    this.addFriend$.next(true);
    return from(this.requestRef.add({
      sender: email,
      receiver: newrequest  // 수신자 이메일
    }));
  }

  getMyRequests(email): Observable<any> {
    console.log('[[request][47]');
    return this.db.collection('requests', ref => ref.where('receiver', '==', email)).valueChanges();
  }

  getSentRequests(email): Observable<any> {
    console.log('[[request][52]');
    return this.db.collection('requests', ref => ref.where('sender', '==', email)).valueChanges();
  }

  // 요청 수락
  /******
   *  @Param: email: 내이메일
   *          req.email: 요청자 이메일

  acceptRequest(email, req): any {

   return from(this.friendsRef.ref.where('email', '==', email).get())
      .subscribe(snapShot => {
        if (snapShot.empty) {  // 없는 경우
          // friends  {email: 'test@test.com' } 생성
          from(this.friendsRef.add({ email }))
            .subscribe(docRef => {
              // friends/docID/myfriends  {email: 'test@test.com' }생성
              from(this.friendsRef.doc(docRef.id).collection('myfriends').add({ email }))
                .subscribe(() => {  // 요청자 이메일명 검색
                  from(this.friendsRef.ref.where('email', '==', req.email).get())
                    .subscribe((snapshot) => {
                      if (snapshot.empty) {
                        from(this.friendsRef.add({ email: req.email }))
                          .subscribe(docref => {
                            from(this.friendsRef.doc(docref.id).collection('myfriends').add({ email }))
                              .subscribe(() => {
                                this.deleteRequest(req).then(() => {
                                  console.log('delete request');
                                });
                              });
                          });
                      } else {
                        from(this.db.doc(`friends/${snapshot.docs[0].id}`).collection('myfriend').add({ email }))
                          .subscribe();
                      }
                    });
                });
            });
        } else {  // 있는 경우
          this.db.doc(`friends/${snapShot.docs[0].id}`).collection('myfriends').add({ email: req.email });
        }
      });
  }
  */

  acceptRequest(email, req, uid): Observable<any> {
    // console.log(email, req.email, uid);
    return from(this.friendsRef.ref.where('email', '==', email).get())
      .pipe(
        map(state => {
          if (state.empty) {
            return 'none';
          } else {
            return `${state.docs[0].id}`;
          }
        })
      );
  }

  getFriend(email): Observable<any> {
    console.log('[[request][113]');
    return from(this.friendsRef.ref.where('email', '==', email).get())
      .pipe(
        map(state => {
          if (state.empty) {
            return 'none';
          } else {
            return `${state.docs[0].id}`;
          }
        })
      );
  }

  //
  addFriend(email: string): Observable<any> {
    return from(this.friendsRef.add({ email }))
      .pipe(
        map(result => result.id)
      );
  }

  // 친구추가
  addFriend2(email: string, uid: string): Observable<any> {
    console.log('[[request][136]');
    this.approveFriend$.next(true);
    return from(this.friendsRef.doc(uid).set({ email }));
  }


  // 기존에 디렉토리가 없는 경우 콜렉션 및 서브 콜렉션 추가
  addFriendSub(email: string, id: string): Observable<any> {
    console.log('[[request][144]');
    return from(this.friendsRef.doc(id).collection('myfriends').add({ email }));
  }


  addFriendSub2(email: string, uid: string, requestemail: string): Observable<any> {
    return from(this.friendsRef.doc(uid).collection('myfriends').add({ email, uid, requestemail }));
  }


  // 기존에 콜렉션이 있는 경우
  addFriendWhenNoExist(email: string, uid: string, requestemail: string): Observable<any> {
    console.log('[[request][156]');
    this.approveFriend$.next(true);
    return from(this.db.doc(`friends/${uid}`).collection('myfriends').add({ email, uid, requestemail }));
  }


  // request 삭제
  deleteFindDeletItem(email): Observable<any> {
    console.log('[[request][164]');
    const requestColl = this.requestRef.ref;
    return from(requestColl.where('sender', '==', email).get())
      .pipe(
        map(snaps => snaps.docs[0].id)
      );
  }

  deleteItem(id): Observable<any> {
    console.log('[[request][173]');
    return from(this.requestRef.doc(id).delete());
  }




}

/*******
 *
 valueChanges({idField?: string}) 은 값만 반환받음

 snapshotChanges() 시 DocumentChangeAction[] 값 반환받음.

interface DocumentChangeAction {
  //'added' | 'modified' | 'removed';
  type: DocumentChangeType;
  payload: DocumentChange;
}

interface DocumentChange {
  type: DocumentChangeType;
  doc: DocumentSnapshot;
  oldIndex: number;
  newIndex: number;
}

interface DocumentSnapshot {
  exists: boolean;
  ref: DocumentReference;
  id: string;
  metadata: SnapshotMetadata;
  data(): DocumentData;
  get(fieldPath: string): any;
}

추가하기 add
 // Add a second document with a generated ID.
db.collection("users").add({
    first: "Alan",
    middle: "Mathison",
    last: "Turing",
    born: 1912
})
.then((docRef) => {
    console.log("Document written with ID: ", docRef.id);
})
.catch((error) => {
    console.error("Error adding document: ", error);
});

데이터 읽기
db.collection("users").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
    });
});


 *
 *
 *
 */
