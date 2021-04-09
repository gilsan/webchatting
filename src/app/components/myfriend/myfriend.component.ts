import { Component, OnInit } from '@angular/core';
import { UserService } from './../../services/user.service';
import { FriendsService } from './../../services/friends.service';
import { RequestService } from 'src/app/services/request';
import { IUser } from 'src/app/models/userInfo';
import { switchMap, tap, concatMap, map, take } from 'rxjs/operators';
import { from } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';

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
    private requestService: RequestService
  ) { }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.firestoreService.currentUid$.subscribe((uid: string) => {
      this.myUid = uid;
      this.getMyProfile();
      this.getFriendStatus();
    });

  }


  getMyProfile(): void {
    this.userService.getProfile(this.myUid)
      .pipe(
        tap(user => this.myProfile = user),
      )
      .subscribe((datas) => {
        try {
          this.getData();
        } catch (err) {
          console.log(err);
        }

      });
  }

  getData(): void {
    // console.log('[myFriend][getData()][60]', this.myProfile, this.myUid);
    this.friends = [];
    this.friendsService.getMyFriends(this.myUid, this.myProfile.email)
      .pipe(
        switchMap(emails => from(emails)),
        map((email: { email: string }) => email.email),
        concatMap(email => this.userService.getUsers(email, 'myFriend Component')),
        take(1),
        map(item => item[0])
      ).subscribe((data) => {
        this.friends.push(data);
        // console.log('myfriend [69]: ', this.friends);
        this.userService.getUserStatus(this.friends);
      });

  }

  getFriendStatus(): void {
    this.userService.userStatus$
      .subscribe((data: any) => {
        console.log('친구 상태: ', status);
        this.friends.push(data);
      });
  }



}
