import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FirestoreService } from 'src/app/services/firestore.service';

import { SubSink } from 'subsink';

import { MessageService } from 'src/app/services/message.service';
import { IMsg, IUser } from './../../models/userInfo';
import { UserService } from './../../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

import * as _ from 'lodash';
import { concatMap } from 'rxjs/operators';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-group-chat-feed',
  templateUrl: './group-chat-feed.component.html',
  styleUrls: ['./group-chat-feed.component.scss']
})
export class GroupChatFeedComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  @ViewChild('scrollMe') private myScroller: ElementRef;

  constructor(
    private firebaseAuth: AngularFireAuth,
    private messagesService: MessageService,
    private auth: FirestoreService,
    private firestoreService: FirestoreService,
    private userService: UserService,
    private dialogRef: MatDialog
  ) { }

  showChat: boolean;
  currentUseremail: string;
  myProfile: IUser = { displayName: '', email: '', photoURL: '', state: '', uid: '' };
  messages: IMsg[] = [];
  loadingSpinner = false;
  MyId: string;
  MyAvatar: string;
  currentChatUser: IUser = { displayName: '', email: '', photoURL: '', state: '', uid: '' };

  newmessage: string;
  checkFirst = 1;
  count = 5; // InfiniteScrollHelper
  trackMsgCount = 0;
  shouldLoad = true;
  allLoaded = false;

  pickMessage: FileList;
  isPicMsg = false;


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

    // this.getMessagesList();
    this.addMessageEvent();
    this.getMessages2();

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  enteredChat(): void {
    this.subs.sink = this.messagesService.enteredChat$.subscribe((value) => {

      this.currentChatUser = this.messagesService.currentChatUser;

      if (value) {
        this.showChat = value;
        // this.getMessages();
        this.getMessages2();
      } else {
        this.showChat = value;
      }


    });
  }

  currentEmail(): void {
    this.firebaseAuth.currentUser.then((data) => {
      this.currentUseremail = data.email;
    });
  }

  getMessages(): void {
    this.messagesService.getAllMessages(this.count);
  }

  getMessages2(): void {

    this.messagesService.getSecAllMessages(this.count).then((messagesObs) => {
      this.checkFirst = 1;
      if (!messagesObs) {
        this.messages = [];
        // console.log('???????????? ????????????.!!!');
      } else {
        messagesObs.subscribe((messages) => {
          this.messages = [];

          const reverse = _.reverse(messages);
          this.messages = reverse; // ????????? ???????????? ??????

          if (this.messages.length === this.trackMsgCount) {
            this.shouldLoad = false;
          } else {
            this.trackMsgCount = this.messages.length;
          }

          if (this.checkFirst === 1) {
            this.openDialog();
            this.checkFirst += 1;
          }
          this.scrollDown();

        });
      }
    });
  }

  getMessagesList(): void {
    this.checkFirst = 1;

    this.subs.sink = this.messagesService.messages$.subscribe((msgs: IMsg[]) => {
      this.messages = [];

      if (msgs.length) {
        const reverse = _.reverse(msgs);
        this.messages = reverse; // ????????? ???????????? ??????
        if (this.messages.length === this.trackMsgCount) {
          this.shouldLoad = false;
        } else {
          this.trackMsgCount = this.messages.length;
        }

        if (this.checkFirst === 1) {
          this.openDialog();
          this.checkFirst += 1;
        }

        this.scrollDown();
      }
    });
  }


  addMessage(type): void {
    if (this.newmessage !== '') {
      this.messagesService.addNewMsg(this.newmessage, this.currentUseremail, type);
      this.messagesService.enterChat(this.currentChatUser);
      this.newmessage = '';
      this.messagesService.updateMessageState();
    }
  }


  addMessageEvent(): void {
    this.subs.sink = this.messagesService.addMessage$.subscribe((addMsg) => {
      if (addMsg.length) {
        if (this.currentChatUser.email === addMsg[0].sentBy || this.currentUseremail === addMsg[0].sentBy) {
          this.messagesService.getAllMessages(this.count);
        }
      }
    });
  }

  // ????????? ??????
  openDialog(): void {
    this.dialogRef.open(LoadingSpinnerComponent, {
      height: '150px',
      width: '150px'
    });
  }

  // ??????????????? ??????
  closeDialog(): void {
    this.dialogRef.closeAll();
  }


  scrollDown(): void {
    setTimeout(() => {
      this.myScroller.nativeElement.scrollTop = this.myScroller.nativeElement.scrollHeight;
      this.closeDialog();
    }, 1000);
  }


  // ?????? ?????????
  scrollHandler(e): void {
    if (e === 'top') {
      if (this.shouldLoad) {

        this.count += 5;
        // console.log('scroll is top');
        this.messagesService.getAllMessages(this.count);

      } else {
        this.allLoaded = true;
      }

    }
  }

  sendImage(evt): void {
    // this.pickMessage = event.target.file;
    // if (this.pickMessage.item(0)) {
    //   this.messagesService.addPicMsg(this.pickMessage.item(0), this.myProfile.email);
    // }
    const selectedFiles = evt.target.files;
    if (selectedFiles.item(0)) {
      this.messagesService.uploadPic(selectedFiles.item(0), this.myProfile.uid)
        .pipe(
          concatMap(() => this.messagesService.downloadProfilePic(this.myProfile.uid)),
        ).subscribe(data => {
          this.newmessage = data;
          this.addMessage('pic');
        });
    }

  }


}
