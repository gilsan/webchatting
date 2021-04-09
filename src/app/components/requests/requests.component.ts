import { Component, OnInit } from '@angular/core';
import { combineLatest, from } from 'rxjs';
import { map, tap, concatMap, switchMap, filter, distinct } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IRequest, IUser } from 'src/app/models/userInfo';
import { RequestService } from 'src/app/services/request';
import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {

  uid: string;
  myProfile: IUser;
  requests: IUser[] = [];
  constructor(
    private userService: UserService,
    private requestService: RequestService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.requests = [];
    const uID$ = this.userService.getCurrentuser();
    uID$.subscribe(data => {
      if (data) {

        this.uid = data.uid;
        console.log('[request][uid][41][' + this.uid + ']');
        this.userService.getProfile(this.uid)
          .pipe(
            tap(user => this.myProfile = user),
            map(user => user.email),
            concatMap(email => this.requestService.getMyRequests(email)),
            switchMap(result => from(result)),
            distinct((u: IRequest) => u.sender),
            concatMap((request: IRequest) => this.userService.getUsers(request.sender, 'request component')),
          )
          .subscribe(userinfo => {
            this.requests.push(userinfo[0]);
          });
      }

    });
  }

  update(): void {
    this.requests = [];
    console.log('requests component ', this.myProfile.email);
    this.requestService.getMyRequests(this.myProfile.email)
      .pipe(
        tap(data => console.log('requests component ', data)),
        switchMap(result => from(result)),
        distinct((u: IRequest) => u.sender),
        concatMap((request: IRequest) => this.userService.getUsers(request.sender, 'request component')),
      ).subscribe((data) => {
        console.log('update: ', data[0]);
        this.requests.push(data[0]);
      });
  }


  acceptRequest(request: IUser): void {

    this.requestService.getFriend(this.myProfile.email)
      .subscribe((data) => {
        if (data === 'none') {
          this.requestService.addFriend(this.myProfile.email)
            .pipe(
              concatMap(docId => this.requestService.addFriendSub(request.email, docId))
            )
            .subscribe(result => {
              console.log(result);
              if (result) {
                this.requests = [];
                this.init();
                this.snackBar.open('친구 요청을 승인 하였습니다.', '닫기', { duration: 3000 });
              }
            });
        } else {
          this.requestService.addFriendWhenNoExist(request.email, this.uid, this.myProfile.email)
            .subscribe((result) => {
              console.log(result);
              if (result) {
                this.requests = [];
                this.init();
                this.snackBar.open('친구 요청을 승인 하였습니다.', '닫기', { duration: 3000 });
              }
            });
        }
      });
  }


  acceptRequest2(request: IUser): void {
    this.requestService.getFriend(this.myProfile.email)
      .subscribe((data) => {
        if (data === 'none') {
          this.requestService.addFriend2(this.myProfile.email, this.uid)
            .pipe(
              concatMap(() => this.requestService.addFriendSub2(request.email, this.uid, this.myProfile.email))
            )
            .subscribe((result) => {
              console.log(result);
              if (result) {
                this.deleteRequestItem(request.email);
                this.requests = [];
                this.init();
                this.snackBar.open('친구 요청을 승인 하였습니다.', '닫기', { duration: 3000 });
              }
            });
        } else {
          this.requestService.addFriendWhenNoExist(request.email, this.uid, this.myProfile.email)
            .subscribe((result) => {
              console.log(result);
              if (result) {
                this.deleteRequestItem(request.email);
                this.requests = [];
                this.init();
                this.snackBar.open('친구 요청을 승인 하였습니다.', '닫기', { duration: 3000 });
              }
            });
        }
      });

  }

  deleteRequestItem(email): void {
    this.requestService.deleteFindDeletItem(email)
      .pipe(
        tap(data => console.log('delete:', data)),
        concatMap(id => this.requestService.deleteItem(id))
      )
      .subscribe((data) => {
        // console.log('delete:', data);
      });
  }

  ignoreRequest(request: IUser): void {
    this.requestService.deleteFindDeletItem(request.email)
      .pipe(
        concatMap(id => this.requestService.deleteItem(id))
      )
      .subscribe((data) => {
        console.log('무시: ', data);
        this.requests = [];
        this.init();
        this.snackBar.open('친구 요청을 삭제 하였습니다.', '닫기', { duration: 3000 });
      });
  }

}
