import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import { map, tap, concatMap, switchMap, filter, distinct, take } from 'rxjs/operators';
import { IRUserInfo, IUser } from 'src/app/models/userInfo';
import { RequestService } from 'src/app/services/request';
import { UserService } from './../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FriendsService } from 'src/app/services/friends.service';
import { findReadVarNames } from '@angular/compiler/src/output/output_ast';
import { FirestoreService } from 'src/app/services/firestore.service';
@Component({
  selector: 'app-addfriend',
  templateUrl: './addfriend.component.html',
  styleUrls: ['./addfriend.component.scss']
})
export class AddfriendComponent implements OnInit {

  myUid: string;
  myProfile: IUser;
  users: IUser[];
  bkupUsers: IUser[];
  isFriends = [];
  isRequested = [];
  isSent = [];

  startAt = new Subject();
  endAt = new Subject();

  myFriends = [];
  myRequests = [];
  mySendRequests = [];

  constructor(
    private userService: UserService,
    private requestService: RequestService,
    private friendService: FriendsService,
    private firestoreService: FirestoreService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.init();
  }

  // 내기본 정보 가져오기 uid , 프로파일, 친구목록
  init(): void {
    this.firestoreService.currentUid$.subscribe((uid: string) => {
      console.log('[48][init][' + uid + ']');
      this.myUid = uid;
      this.getMyProfile();
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
            this.myFriends = friends;
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

        } else {  // sub-collection myfriend 에서 찿음.
          this.friendService.getRequestFriendList(this.myProfile.email).subscribe(snapshot => {
            this.findFriends(snapshot);
          });
        }


      });
    });
  }

  getMyRequest(): void {
    // Filter out the previously required users
    this.requestService.getMyRequests(this.myProfile.email).subscribe((request: any) => {
      let flag = 0;
      this.myRequests = request;
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
      this.mySendRequests = request;
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

  getMyProfile(): void {

    console.log('[175][addfriend][getMyProfile][' + this.myUid + ']');
    this.userService.getProfile(this.myUid)
      .pipe(
        tap(user => this.myProfile = user),
        map(user => user.email),
        concatMap(email => this.userService.getAllUsers(email)),
        tap(users => this.users = users),
        tap(users => this.bkupUsers = users)
      )
      .subscribe(user => {

        this.getMyFriends();
        this.getMyRequest();
        this.getMySend();
      });
  }



  findFriends(friends: IRUserInfo[]): void {
    if (friends) {  // 친구 있는 경우
      this.isFriends = [];
      let flag = 0;
      this.users.map((userElement, i) => {
        friends.forEach((friendElement) => {
          if (userElement.email === friendElement.requestemail) {
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
  }

  instantSearch($event): void {
    const q = $event.target.value;
    if (q !== '') {
      this.startAt.next(q);
      this.endAt.next(q + '\uf8ff');
      combineLatest([this.startAt, this.endAt])
        .pipe(
          take(1)
        )
        .subscribe(([startValue, endValue]) => {
          this.userService.instantSearch(startValue, endValue)
            .subscribe((users) => {
              this.instantSearchFilter(users);
              this.users = users;
            });
        });
    } else {
      this.instantSearchFilter(this.bkupUsers);
      this.users = this.bkupUsers;
    }
  }

  instantSearchFilter(users): void {
    if (this.myFriends) {
      this.instantFriend(this.myFriends);
    } else if (this.myRequests) {
      this.instantRequest(this.myRequests);
    } else if (this.mySendRequests) {
      this.instanceSend(this.mySendRequests);
    }
  }

  instantFriend(friends): void {
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
  }

  instantRequest(request): void {
    this.isRequested = [];
    let flag = 0;
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
  }

  instanceSend(request): void {
    this.isSent = [];
    let flag = 0;
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
  }

}
