import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

import { Observable, BehaviorSubject, of, from, Subject, combineLatest } from 'rxjs';
import { concatMap, delay, distinct, finalize, first, map, switchMap, take, tap } from 'rxjs/operators';
import { IConversation, IGroup, IMsg, INotifaction, IUser } from '../models/userInfo';
import * as firebase from 'firebase';
import { SubSink } from 'subsink';
import { GroupService } from 'src/app/services/groups.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService implements OnDestroy {

  enteredChat = new BehaviorSubject<boolean>(false);
  enteredChat$ = this.enteredChat.asObservable();

  messages = new BehaviorSubject<IMsg[]>([]);
  messages$ = this.messages.asObservable();

  addMessage = new BehaviorSubject<IMsg[]>([]);
  addMessage$ = this.addMessage.asObservable();
  addMsg$: Observable<any>;

  currentChatUser: IUser = { displayName: '', email: '', photoURL: '', state: '', uid: '' };
  email: string;
  user: IUser = { displayName: '', email: '', photoURL: '', uid: '' };
  firstDocId: string;
  secondDocId: string;

  groupMsgFlag = new Subject();
  groupMsgFlag$ = this.groupMsgFlag.asObservable();

  private subs = new SubSink();

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private storage: AngularFireStorage,
    private groupService: GroupService
  ) {
    this.updateMessageState();
    this.auth.currentUser.then(user => {
      if (user !== null) {
        this.email = user.email;
        this.getMyProfile(this.email);
      }

    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // 내정보 찿기
  getMyProfile(email): void {
    this.db.collection('users', ref => ref.where('email', '==', this.email)).get()
      .subscribe(snaps => {
        snaps.forEach(snap => {
          this.user = snap.data() as IUser;
        });
      });
  }

  enterChat(user): void {

    if (user !== 'closed') {
      this.currentChatUser = user;
      this.enteredChat.next(true);
    } else {
      this.enteredChat.next(false);
      this.currentChatUser = { displayName: '', email: '', photoURL: '', state: '', uid: '' };
    }

  }

  // testAddmsg(): void {
  //   const collRef = this.db.collection('conversations').ref;
  //   const queryRef = collRef.where('myemail', '==', this.email)
  //     .where('withWhom', '==', this.currentChatUser.email);
  //   queryRef.get().then((snapShot) => {
  //     console.log('[저장물확인][2]', snapShot);
  //     if (snapShot.empty) {
  //     } else {
  //     }
  //   });
  // }

  addNewMsg(newMsg: string, myemail: string, type: string = 'txt'): void {
    let isPic;
    if (type === 'txt') {
      isPic = false;
    } else if (type === 'pic') {
      isPic = true;
    }

    const collRef = this.db.collection('conversations').ref;
    const queryRef = collRef.where('myemail', '==', myemail)
      .where('withWhom', '==', this.currentChatUser.email);

    queryRef.get().then((snapShot) => {
      // document 처음 만듬
      if (snapShot.empty) {
        this.db.collection('conversations').add({
          myemail,
          withWhom: this.currentChatUser.email,
          timestamp: firebase.default.firestore.FieldValue.serverTimestamp(),
        }).then((firstDocRef) => {
          this.firstDocId = firstDocRef.id;
          this.db.collection('conversations').add({
            myemail: this.currentChatUser.email,
            withWhom: myemail,
            timestamp: firebase.default.firestore.FieldValue.serverTimestamp(),
          }).then((secondDocRef) => {
            this.secondDocId = secondDocRef.id;
            this.db.collection('messages').add({
              key: Math.floor(Math.random() * 10000000)
            }).then((docRef) => {

              this.db.collection('messages').doc(docRef.id).collection('msgs').add({
                message: newMsg,
                timestamp: firebase.default.firestore.FieldValue.serverTimestamp(),
                sentBy: myemail,  // 보낸사람
                receiveBy: this.currentChatUser.email,  // 받는 사람
                isPic
              }).then(() => {
                this.db.collection('conversations').doc(this.firstDocId).update({
                  messageId: docRef.id
                }).then(() => {
                  this.db.collection('conversations').doc(this.secondDocId).update({
                    messageId: docRef.id
                  }).then(() => {
                    console.log('확인 Firestore IF 파트,  저장했습니다.');
                    this.addNotifications();
                    // this.addMessage.next(true);
                  });
                });
              });
            });
          });
        });
      } else {
        const conversation: any = snapShot.docs[0].data();
        const messageId = conversation.messageId;
        this.db.collection('messages').doc(messageId).collection('msgs').add({
          message: newMsg,
          timestamp: firebase.default.firestore.FieldValue.serverTimestamp(),
          sentBy: myemail,
          receiveBy: this.currentChatUser.email,  // 받는 사람
          isPic
        }).then(() => {
          console.log('확인 Firebase else 파트,  저장했습니다.');
          this.addNotifications();
        });
      }

    });

  }


  getAllMessages(count): void {
    from(this.auth.currentUser)
      .pipe(
        map(data => data.email),
        // tap(email => console.log('[메세지 가져오기][]', email)),
        delay(600),
        map(email => {
          const collRef = this.db.collection('conversations').ref;
          const queryRef = collRef.where('myemail', '==', email)
            .where('withWhom', '==', this.currentChatUser.email).orderBy('timestamp', 'desc').limit(count);
          return queryRef;
        }),
        switchMap(ref => ref.get()),
        map(snapshots => snapshots.docs.map(doc => doc.data())),
        map(lists => lists.map((list: IConversation) => list.messageId)),
        // tap(list => console.log('[메세지 가져오기][]', this.currentChatUser.email))
      ).subscribe((ids: string[]) => {

        const msgs: IMsg[] = [];
        const len = ids.length - 1;
        ids.forEach((messageId, i) => {
          this.db.collection('messages').doc(messageId).collection('msgs').valueChanges()
            .pipe(
              take(1),
              tap((msg: IMsg[]) => msgs.push(msg[0]))
            )
            .subscribe((result: IMsg[]) => {
              // msgs.push(result[0]);
              if (len === i) {
                // console.log('[수집한값]: ', msgs);
                this.messages.next(msgs);
              }

            });

        });
      });
  }

  getSecAllMessages(count): Promise<any> {
    return new Promise((resolve) => {
      const collRef = this.db.collection('conversations').ref;
      const queryRef = collRef.where('myemail', '==', this.email)
        .where('withWhom', '==', this.currentChatUser.email);

      queryRef.get().then((snapshot) => {
        if (snapshot.empty) {
          resolve(false);
        } else {
          const data: any = snapshot.docs[0].data();
          const uid = data.messageId;
          // tslint:disable-next-line:max-line-length
          resolve(this.db.collection('messages').doc(`${uid}`).collection('msgs', ref => ref.orderBy('timestamp', 'desc').limit(count)).valueChanges());
        }
      });
    });

  }



  //// 메세지 상태 변경
  updateMessageState(): void {
    this.subs.sink = this.db.collection('messages').snapshotChanges(['added'])
      .subscribe((data) => {

        if (data.length) {
          const id = data[0].payload.doc.id;
          this.db.doc(`messages/${id}`).collection('msgs').valueChanges()
            .subscribe((value: IMsg[]) => {
              this.addMessage.next(value);
            });
        }

      });
  }

  // 그림전송
  addPicMsg(pic, myemail): void {
    let downloadURL;
    const randNo = Math.floor(Math.random() * 10000000);
    const picName = 'picture' + randNo;
    const path = this.storage.ref('/picmessages/' + picName);
    const uploadTask = this.storage.upload('/picmessages/' + picName, pic);

    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        path.getDownloadURL().subscribe(imageURL => {
          downloadURL = imageURL;
        });
        path.getMetadata().subscribe(metadata => {
          if (metadata.contentType.match('image/.*')) {
            this.addNewMsg(downloadURL, myemail);
          } else {
            path.delete().subscribe(data => console.log('그림파일이 아닙니다.'));
          }
        });
      })
    ).subscribe((err => console.log('파일올리기 실패!!')));


  }

  // 그림 올리기
  uploadPic(file, uid): Observable<any> {
    return from(this.storage.upload(`picmessages/${uid}`, file));
  }

  // 그림 URL 가저오기
  downloadProfilePic(uid): Observable<any> {
    return this.storage.ref(`picmessages/${uid}`).getDownloadURL();
  }

  addGroupMsg(newMessage): void {
    let groupId: IGroup;
    const groupCollRef = this.db.collection('groups').ref;
    const queryRef = groupCollRef.where('groupName', '==', this.groupService.currentGroup.groupName)
      .where('creator', '==', this.groupService.currentGroup.creator);
    queryRef.get().then((snapShot) => {
      const groupid = snapShot.docs[0].data() as IGroup;
      const checkforMsgs = this.db.doc('groupconvos/' + groupid.conversationId)
        .collection('messages').ref;
      if (checkforMsgs === undefined) {
        this.groupMsgFlag.next('firstmsg');
      }
      // tslint:disable-next-line:one-variable-per-declaration
      groupId = snapShot.docs[0].data() as IGroup;
      this.db.doc('groupconvos/' + groupId.conversationId).collection('messages').add({
        message: newMessage,
        timestamp: firebase.default.firestore.FieldValue.serverTimestamp,
        sentBy: this.email
      });
    });
  }

  getGroupMessages(count): Promise<any> {
    return new Promise((resolve) => {
      const groupCollRef = this.db.collection('groups').ref;
      const queryRef = groupCollRef.where('groupName', '==', this.groupService.currentGroup.groupName)
        .where('creator', '==', this.groupService.currentGroup.creator);
      queryRef.get().then((snapShot) => {
        const groupId = snapShot.docs[0].data() as IGroup;
        const checkforMsgs = this.db.doc('groupconvos/' + groupId.conversationId)
          .collection('messages').ref;
        if (checkforMsgs !== undefined) {
          const conId = snapShot.docs[0].data() as IGroup;
          resolve(this.db.doc('groupconvos/' + conId.conversationId)
            .collection('messages').valueChanges());
        } else {
          resolve(this.groupMsgFlag);
          setTimeout(() => {
            this.groupMsgFlag.next('Nothing');
          }, 1000);
        }
      });
    });
  }

  addGroupPic(pic): void {
    let downloadURL;
    const randNo = Math.floor(Math.random() * 10000000);
    const picName = 'picture' + randNo;
    const path = this.storage.ref('/groupPicmessages/' + picName);
    const uploadTask = this.storage.upload('/picmessages/' + picName, pic);

    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        path.getDownloadURL().subscribe(imageURL => {
          downloadURL = imageURL;
        });
        path.getMetadata().subscribe(metadata => {
          if (metadata.contentType.match('image/.*')) {
            this.addGroupMsg(downloadURL);
          } else {
            path.delete().subscribe(data => console.log('그림파일이 아닙니다.'));
          }
        });
      })
    ).subscribe((err => console.log('파일올리기 실패!!')));
  }


  addNotifications(sender: string = '', senderPic: string = '', senderName: string = ''): void {
    this.db.collection('notifications').add({
      receiver: this.user.email,
      receiverName: this.user.displayName,
      sender,
      senderPic,
      senderName,
      timestamp: firebase.default.firestore.FieldValue.serverTimestamp()
    });
  }

  // 알림 가져오기
  getMyNotifications(): Observable<any> {
    return this.db.collection('notifications', ref => ref.where('sender', '==', this.user.email)).valueChanges();
  }

  // 알림 삭제
  clearNotifications(): void {
    const notificationsRef = this.db.collection('notifications').ref;
    const queryRef = notificationsRef.where('sender', '==', this.user.email);
    queryRef.get().then((snapShot) => {
      if (!snapShot.empty) {
        snapShot.docs.forEach((element) => {
          element.ref.delete();
        });
      }
    });
  }

















}


/*
 메세지 구조
 conversations
   messagId: someid
   myemail: hong@test.com
   wihtWhom: jang@hong.com

   messageid: someid
   myemail: jang@hong.com
   withWhom: hong@test.com


 messages
    someid
           msgs
                 message: hello
                 timestamp:
                 sentby: email


*/
