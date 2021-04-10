import { Component, OnInit } from '@angular/core';
import { UserService } from './../../services/user.service';
import { FriendsService } from './../../services/friends.service';
import { RequestService } from 'src/app/services/request';
import { IFriend, IUser } from 'src/app/models/userInfo';
import { switchMap, tap, concatMap, map, take, first } from 'rxjs/operators';
import { from } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';
import { MessageService } from './../../services/message.service';

@Component({
  selector: 'app-myfriend',
  templateUrl: './myfriend.component.html',
  styleUrls: ['./myfriend.component.scss']
})
export class MyfriendComponent implements OnInit {

  friends: IUser[] = [];
  status = [];
  myUid: string;
  myProfile: IUser;
  constructor(
    private userService: UserService,
    private friendsService: FriendsService,
    private firestoreService: FirestoreService,
    private requestService: RequestService,
    private messagesService: MessageService
  ) { }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.firestoreService.currentUid$.subscribe((uid: string) => {
      this.myUid = uid;
    });
    this.getMyProfile();
    this.getFriendsStatus();
    this.friendsUpdate();
  }


  getMyProfile(): void {
    this.userService.getProfile(this.myUid)
      .pipe(
        tap(user => this.myProfile = user),
      )
      .subscribe((datas) => {
        try {
          this.getFriendsData();
        } catch (err) {
          console.log(err);
        }

      });
  }

  getFriendsData(): void {  // 친구정보

    this.friendsService.getMyFriends(this.myUid, this.myProfile.email)
      .pipe(
        switchMap(emails => from(emails)),
        map((email: { email: string }) => email.email),
        concatMap(email => this.userService.getUsers(email, 'myFriend Component')),
        take(1),
        map(item => item[0]),
      ).subscribe((data) => {
        this.friends = [];
        this.friends.push(data);
        // this.userService.getFriendStatus(this.friends);  1안
        this.userService.getStatusFriend(this.friends);  // 2안
      });

  }

  getFriendsStatus(): void {
    this.userService.friendsStatus$
      .subscribe((data: IUser[]) => {
        this.friends = [];
        // console.log('친구 상태 [78]: ', data);
        this.friends = data;
      });
  }

  friendsUpdate(): void {
    this.userService.statusUpdate$
      .subscribe(value => {
        // console.log('[myfriend][friendsUpdate][87] ', value);
        if (value === 'StatusUpdated') {
          if (this.friends) {
            this.getFriendsData();
          }
        }
      });
  }

  enterChat(user): void {
    this.messagesService.enterChat(user);
  }

}
