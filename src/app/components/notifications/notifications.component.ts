import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { IUser } from 'src/app/models/userInfo';
import { FriendsService } from 'src/app/services/friends.service';
import { MessageService } from 'src/app/services/message.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {

  myNotifications = [];
  showNotifications = false;
  user: IUser;
  currentChatUser: IUser;
  private subs = new SubSink();

  constructor(
    // private userService: UserService,
    // private firestoreService: FirestoreService,
    private friendsService: FriendsService,
    private messagesService: MessageService,
    private firebaseAuth: AngularFireAuth,
  ) { }

  ngOnInit(): void {
    this.init();
    this.getChatUser();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  init(): void {
    this.subs.sink = this.firebaseAuth.authState.subscribe((user) => {
      this.user = user;
    });
  }

  getChatUser(): void {
    this.subs.sink = this.messagesService.enteredChat$.subscribe((value) => {
      if (value) {
        this.currentChatUser = this.messagesService.currentChatUser;
        this.messagesService.clearNotifications();
      }
    });
  }

  getNotifications(): void {
    this.subs.sink = this.messagesService.getMyNotifications().subscribe((notifications) => {
      this.showNotifications = false;
      if (this.currentChatUser !== undefined) {
        notifications.forEach((element, i) => {
          if (element.sender === this.currentChatUser.email) {
            notifications.splice(i, 1);
            this.messagesService.clearNotifications();
          }
        });
      }

      this.myNotifications = notifications;
      this.showNotifications = true;
    });
  }




}
