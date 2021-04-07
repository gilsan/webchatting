import { Component, OnInit } from '@angular/core';
import { UserService } from './../../services/user.service';
import { FriendsService } from './../../services/friends.service';
import { IUser } from 'src/app/models/userInfo';
import { switchMap, tap, concatMap, map } from 'rxjs/operators';
import { from } from 'rxjs';
import { RequestService } from 'src/app/services/request';

@Component({
  selector: 'app-myfriend',
  templateUrl: './myfriend.component.html',
  styleUrls: ['./myfriend.component.scss']
})
export class MyfriendComponent implements OnInit {

  friends: IUser[] = [];
  myUid: string;
  myProfile: IUser;
  constructor(
    private userService: UserService,
    private friendsService: FriendsService,
    private requestService: RequestService
  ) { }

  ngOnInit(): void {
    this.init();
    this.requestService.approveFriendObserver$.subscribe(result => {
      if (result) {
        this.friends = [];
        this.getData();
      }
    });
  }

  init(): void {
    const uID$ = this.userService.getCurrentuser();
    uID$.subscribe(data => {
      if (data) {
        this.myUid = data.uid;
        this.userService.getProfile(data.uid)
          .pipe(
            tap(user => this.myProfile = user),
          )
          .subscribe((datas) => {
            // console.log(this.myProfile, this.myUid);
            this.getData();
          });
      }
    });
  }


  getData(): void {
    this.friendsService.getMyFriends(this.myUid, this.myProfile.email)
      .pipe(
        switchMap(emails => from(emails)),
        map((email: { email: string }) => email.email),
        concatMap(email => this.userService.getUsers(email)),
        map(item => item[0])
      ).subscribe((data) => {
        this.friends.push(data);
      });
  }



}
