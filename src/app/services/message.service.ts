import { Injectable, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

import { Observable, BehaviorSubject, of, from, Subject } from 'rxjs';
import { concatMap, distinct, first, map, switchMap, tap } from 'rxjs/operators';
import { IConversation, IMsg, IUser } from '../models/userInfo';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  enteredChat = new BehaviorSubject<boolean>(false);
  enteredChat$ = this.enteredChat.asObservable();

  messages = new BehaviorSubject<IMsg[]>([]);
  messages$ = this.messages.asObservable();

  currentChatUser: IUser;
  email: string;
  firstDocId: string;
  secondDocId: string;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private storage: AngularFireStorage
  ) { }


  enterChat(user): void {
    this.currentChatUser = user;
    // console.log('[35][message service][enterChat]순서[1][친구클릭] ', user);
    this.enteredChat.next(true);
  }


  addNewMsg(newMsg, myemail: string): void {

    const collRef = this.db.collection('conversaions').ref;
    const queryRef = collRef.where('myemail', '==', myemail)
      .where('withWhom', '==', this.currentChatUser.email);

    queryRef.get().then((snapShot) => {
      // document 처음 만듬
      if (snapShot.empty) {
        this.db.collection('conversations').add({
          myemail,
          withWhom: this.currentChatUser.email
        }).then((firstDocRef) => {
          this.firstDocId = firstDocRef.id;
          this.db.collection('conversations').add({
            myemail: this.currentChatUser.email,
            withWhom: myemail
          }).then((secondDocRef) => {
            this.secondDocId = secondDocRef.id;
            this.db.collection('messages').add({
              key: Math.floor(Math.random() * 10000000)
            }).then((docRef) => {
              console.log('[messages][docRef] ', docRef.id);
              this.db.collection('messages').doc(docRef.id).collection('msgs').add({
                message: newMsg,
                tiemstamp: firebase.default.firestore.FieldValue.serverTimestamp(),
                sentBy: myemail
              }).then(() => {
                this.db.collection('conversations').doc(this.firstDocId).update({
                  messageId: docRef.id
                }).then(() => {
                  this.db.collection('conversations').doc(this.secondDocId).update({
                    messageId: docRef.id
                  }).then(() => {
                    console.log('확인 Firestore IF 파트');
                  });
                });
              });
            });
          });
        });
      } else {
        const conversation: any = snapShot.docs[0].data();
        const messageId = conversation.messagId;
        this.db.collection('messages').doc(messageId).collection('msgs').add({
          message: newMsg,
          timestamp: firebase.default.firestore.FieldValue.serverTimestamp(),
          sentby: myemail
        }).then(() => {
          console.log('확인 Firebase else 파트');
        });
      }

    });

  }


  getAllMessages(): void {
    from(this.auth.currentUser)
      .pipe(
        map(data => data.email),
        map(email => {
          const collRef = this.db.collection('conversations').ref;
          const queryRef = collRef.where('myemail', '==', email)
            .where('withWhom', '==', this.currentChatUser.email);
          return queryRef;
        }),
        switchMap(ref => ref.get()),
        map(snapshots => snapshots.docs.map(doc => doc.data())),
        map(lists => lists.map((list: IConversation) => list.messageId)),
      ).subscribe((ids: string[]) => {
        const msgs: IMsg[] = [];

        ids.forEach((messageId) => {
          this.db.collection('messages', ref => ref.orderBy('timestamp')).doc(messageId).collection('msgs').valueChanges()
            .pipe(
              distinct((u: IMsg[]) => u[0].message),
            )
            .subscribe((result: IMsg[]) => {
              msgs.push(result[0]);
              this.messages.next(msgs);
            });
        });
      });
  }

  test(): void {

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
