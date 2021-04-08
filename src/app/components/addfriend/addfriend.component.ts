import { Component, OnInit } from '@angular/core';
import { from, BehaviorSubject } from 'rxjs';
import { map, tap, concatMap, switchMap, filter, distinct } from 'rxjs/operators';
import { IUser } from 'src/app/models/userInfo';
import { RequestService } from 'src/app/services/request';
import { UserService } from './../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FriendsService } from 'src/app/services/friends.service';
import { findReadVarNames } from '@angular/compiler/src/output/output_ast';
@Component({
  selector: 'app-addfriend',
  templateUrl: './addfriend.component.html',
  styleUrls: ['./addfriend.component.scss']
})
export class AddfriendComponent implements OnInit {

  myUid: string;
  myProfile: IUser;
  users: IUser[];
  isFriends = [];
  isRequested = [];
  isSent = [];

  constructor(
    private userService: UserService,
    private requestService: RequestService,
    private friendService: FriendsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.init();
  }

  // 내기본 정보 가져오기 uid , 프로파일, 친구목록
  init(): void {
    const uID$ = this.userService.getCurrentuser();
    uID$.subscribe(data => {
      if (data) {
        this.users = [];
        this.myUid = data.id;
        this.userService.getProfile(data.uid)
          .pipe(
            tap(user => this.myProfile = user),
            map(user => user.email),
            concatMap(email => this.userService.getAllUsers(email)),
            tap(users => this.users = users),
            // tap(user => console.log('TAP === ', console.log(this.users))),
            // switchMap(users => from(users)),
            // distinct((u: IUser) => u.email),
            // filter((user: IUser) => user.email !== this.myProfile.email),
            // tap(user => this.users.push(user))
          )
          .subscribe(user => {
            // console.log('===== myProfile ', this.myProfile, this.users);
            this.getMyFriends();
            this.getMyRequest();
            this.getMySend();
          });
      }
    });

  }


  addfriend(user: IUser): void {
    this.requestService.addRequest(user.email, this.myProfile.email)
      .subscribe(data => {
        // console.log(data);
        if (data.id) {
          this.snackBar.open('친구 요청을 하였습니다.', '닫기', { duration: 3000 });
        } else {
          this.snackBar.open('친구 요청실패 하였습니다.', '닫기', { duration: 3000 });
        }

      });
  }

  canShow(idx: number): boolean {
    if (this.isSent[idx]) {
      return false;
    } else if (this.isRequested[idx]) {
      return false;
    } else if (this.isFriends[idx]) {
      return false;
    } else {
      return true;
    }
  }

  getMyFriends(): void {
    // 친구 필터링
    this.friendService.getmyFriends(this.myProfile.email).then((res: any) => {
      this.friendService.friendsCollTrigger$.subscribe((hasUser) => {
        if (hasUser === 'Exists') {
          this.friendService.getFriendList().subscribe((friends: { email: string }[]) => {
            // console.log(' ===  users === ', friends);
            if (friends) {  // 친구 있는 경우
              this.isFriends = [];
              let flag = 0;
              this.users.map((userElement, i) => {
                friends.forEach((friendElement) => {
                  if (userElement.email === friendElement.email) {
                    flag += 1;
                  }
                });
                if (flag === 1) { // 친구가 있는 경우
                  this.isFriends[i] = true;
                  flag = 0;
                } else {
                  this.isFriends[i] = false;
                  flag = 0;
                }
              });
            } else {  // 친구 없는 경우
              this.users.map((userElement, i) => {
                this.isFriends[i] = false;
              });

            }

          });

        }
      });
    });
  }

  getMyRequest(): void {
    // Filter out the previously required users
    this.requestService.getMyRequests(this.myProfile.email).subscribe((request: any) => {
      let flag = 0;
      this.isRequested = [];
      this.users.forEach((userElement, i) => {
        request.forEach((requestElement) => {
          if (userElement.email === requestElement.sender) {
            flag += 1;
          }
        });
        if (flag === 1) { // 친구가 있는 경우
          this.isRequested[i] = true;
          flag = 0;
        } else {
          this.isRequested[i] = false;
          flag = 0;
        }

      });
    });

  }

  getMySend(): void {
    // 나에게 보낸 요청수
    this.requestService.getSentRequests(this.myProfile.email).subscribe((request: any) => {
      let flag = 0;
      this.isSent = [];
      this.users.forEach((userElement, i) => {
        request.forEach((requestElement) => {
          if (userElement.email === requestElement.receiver) {
            flag += 1;
          }
        });
        if (flag === 1) { // 친구가 있는 경우
          this.isSent[i] = true;
          flag = 0;
        } else {
          this.isSent[i] = false;
          flag = 0;
        }

      });
    });

  }

  instantSearch(evt): void {
    console.log(evt);
  }

}
