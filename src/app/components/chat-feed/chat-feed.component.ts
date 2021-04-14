import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FirestoreService } from 'src/app/services/firestore.service';

import { SubSink } from 'subsink';

import { MessageService } from 'src/app/services/message.service';
import { IMsg, IUser } from './../../models/userInfo';
import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-chat-feed',
  templateUrl: './chat-feed.component.html',
  styleUrls: ['./chat-feed.component.scss']
})
export class ChatFeedComponent implements OnInit, OnDestroy {

  private subs = new SubSink();

  constructor(
    private firebaseAuth: AngularFireAuth,
    private messagesService: MessageService,
    private auth: FirestoreService,
    private firestoreService: FirestoreService,
    private userService: UserService,

  ) {

  }

  showChat: boolean;
  currentUseremail: string;
  myProfile: IUser = { displayName: '', email: '', photoURL: '', status: '', uid: '' };
  messages: IMsg[] = [];
  loadingSpinner = false;
  MyId: string;
  MyAvatar: string;
  currentChatUser: IUser = { displayName: '', email: '', photoURL: '', status: '', uid: '' };

  newmessage: string;

  ngOnInit(): void {
    this.currentEmail();
    this.enteredChat();


    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.myProfile = user;
        this.MyAvatar = this.myProfile.photoURL;
        this.MyId = this.myProfile.email;
      }

    });



    this.getMessagesList();
    // this.getSecondMsg();
    this.addMessageEvent();


  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  enteredChat(): void {
    this.subs.sink = this.messagesService.enteredChat$.subscribe((value) => {

      this.currentChatUser = this.messagesService.currentChatUser;

      this.showChat = value;
      this.getMessages();
    });
  }


  currentEmail(): void {
    this.firebaseAuth.currentUser.then((data) => {
      this.currentUseremail = data.email;
    });
  }

  getMessages(): void {
    // console.log('[메세지  받음]');
    this.messagesService.getAllMessages();
  }
  getMessagesList(): void {
    this.subs.sink = this.messagesService.messages$.subscribe((msgs: IMsg[]) => {
      this.messages = [];
      this.messages = msgs;

    });
  }


  addMessage(): void {
    if (this.newmessage !== '') {
      this.messagesService.addNewMsg(this.newmessage, this.currentUseremail);
      this.messagesService.enterChat(this.currentChatUser);
      this.newmessage = '';

      this.messagesService.updateMessafeStatuses();

    }
  }




  addMessageEvent(): void {
    // console.log('메제지 추가');
    this.subs.sink = this.messagesService.addMessage$.subscribe((addMsg) => {
      console.log('[새로운 메제지 추가][117]', addMsg);
      // if (addMsg) {
      //   this.messagesService.getAllMessages();
      // }
      if (addMsg.length) {
        if (this.currentChatUser.email === addMsg[0].sentBy || this.currentUseremail === addMsg[0].sentBy) {
          this.messagesService.getAllMessages();
        }
      }

    });
  }

}
