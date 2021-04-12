import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FirestoreService } from 'src/app/services/firestore.service';

import { MessageService } from 'src/app/services/message.service';
import { IMsg, IUser } from './../../models/userInfo';
import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-chat-feed',
  templateUrl: './chat-feed.component.html',
  styleUrls: ['./chat-feed.component.scss']
})
export class ChatFeedComponent implements OnInit {

  constructor(
    private firebaseAuth: AngularFireAuth,
    private messagesService: MessageService,
    private auth: FirestoreService,
    private firestoreService: FirestoreService,
    private userService: UserService,
    private msgService: MessageService
  ) { }

  showChat: boolean;
  currentUseremail: string;
  myProfile: IUser;
  messages: IMsg[];
  loadingSpinner = false;
  MyId: string;
  MyAvatar: string;
  currentChatUser: IUser;

  newmessage: string;

  ngOnInit(): void {
    this.currentEmail();
    this.enteredChat();


    this.userService.currentUser$.subscribe(user => {
      this.myProfile = user;
      this.MyAvatar = this.myProfile.photoURL;
      this.MyId = this.myProfile.email;
    });
  }

  enteredChat(): void {
    this.messagesService.enteredChat$.subscribe((value) => {
      this.currentChatUser = this.messagesService.currentChatUser;
      console.log('[chat-feed][enteredChat] ', value, this.currentChatUser);
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
    this.messagesService.getAllMessages();
  }


  addMessage(): void {
    if (this.newmessage !== '') {
      this.msgService.addNewMsg(this.newmessage, this.currentUseremail);
    }
  }



}
