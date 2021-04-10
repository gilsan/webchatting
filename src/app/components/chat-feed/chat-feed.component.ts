import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { MessageService } from 'src/app/services/message.service';
import { IMsg } from './../../models/userInfo';

@Component({
  selector: 'app-chat-feed',
  templateUrl: './chat-feed.component.html',
  styleUrls: ['./chat-feed.component.scss']
})
export class ChatFeedComponent implements OnInit {

  constructor(
    private firebaseAuth: AngularFireAuth,
    private messagesService: MessageService
  ) { }

  showChat: boolean;
  currentUseremail: string;
  messages: IMsg[];

  ngOnInit(): void {
    this.currentEmail();
    this.enteredChat();
    this.getmessage();

  }

  enteredChat(): void {
    this.messagesService.enteredChat$.subscribe((value) => {
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

  getmessage(): void {
    this.messages = [];
    this.messagesService.messages$.subscribe(data => {
      this.messages = data;
    });
  }

}
