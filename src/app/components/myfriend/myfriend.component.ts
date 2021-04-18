import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './../../services/user.service';
import { FriendsService } from './../../services/friends.service';
import { RequestService } from 'src/app/services/request';
import { IFriend, IRUserInfo, IStatus, IUser, IUserState } from 'src/app/models/userInfo';
import { switchMap, tap, concatMap, map, take, first } from 'rxjs/operators';
import { from, combineLatest, Observable } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';
import { MessageService } from './../../services/message.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { StoreService } from './../../services/store.service';
import { GroupService } from './../../services/groups.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-myfriend',
  templateUrl: './myfriend.component.html',
  styleUrls: ['./myfriend.component.scss']
})
export class MyfriendComponent implements OnInit, OnDestroy {

  friends: IUser[] = [];
  state = [];
  myUid: string;
  myProfile: IUser = { displayName: '', email: '', photoURL: '', state: '', uid: '' };
  user: IUser;
  users: IUser[] = [];
  bkupUsers: IUser[];
  private subs = new SubSink();
  friendState: IUserState[] = [];
  isShow = false;
  constructor(
    private userService: UserService,
    private friendsService: FriendsService,
    private firestoreService: FirestoreService,
    private requestService: RequestService,
    private messagesService: MessageService,
    private db: AngularFirestore,
    private store: StoreService,
    private groupService: GroupService
  ) { }

  ngOnInit(): void {
    this.subs.sink = this.userService.currentUser$.subscribe((user) => {
      this.user = user;
    });
    this.init();

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  init(): void {

    this.subs.sink = this.firestoreService.currentUid$.subscribe(uid => this.myUid = uid);

    this.getMyProfile();
    this.getFriendsStatus();
    this.friendsUpdate();
  }

  getMyProfile(): void {
    this.userService.getUserProfile(this.myUid, 'MYFRIEND getMyProfile')
      .pipe(
        tap(user => this.myProfile = user),
        map(user => user.email),
        concatMap(email => this.userService.getAllUsers(email)),
        tap(users => this.users = users),
        tap(users => this.bkupUsers = users)
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
    // friends/${uid}/myfriends ㅡ 검색
    let tempUser: IUser[] = [];
    this.friendsService.getmyFriends(this.myProfile.email).then((myfriends: Observable<any>) => {
      myfriends.subscribe(isThere => {
        if (isThere === 'Nothing') {
          this.friendsService.getRequestFriendList(this.myProfile.email, 'myfriend')
            .pipe(
              switchMap((friends: IRUserInfo[]) => from(friends)),
              map(user => user.uid),
              switchMap(uid => this.userService.getUserProfile(uid)),
              map(user => tempUser = [...tempUser, user]),
            )
            .subscribe((friends: IUser[]) => {
              this.userService.getStatusFriend(friends, 'MYFRIEND getFriendsData 112');
            });
        }
        // else if (isThere === 'Exists') {
        //   this.friendsService.getFriendList()
        //     .subscribe((friends) => {
        //       this.friends = friends;
        //       this.userService.getUserDetailsOrg(friends).then((friendsDetails) => {
        //         this.userService.findUserStatus(friends).then((friendsStates) => {

        //           this.friends = friendsDetails;
        //           this.friendState = friendsStates;

        //           console.log('[][화면값] ', this.friends, this.friendState);
        //         });
        //       });

        //     });
        // }
      });
    });

    this.getMyFriends();

  }

  getMyFriends(): void {
    this.friends = [];
    this.friendsService.getMyFriends(this.myUid)
      .pipe(
        // tap(data => console.log('MyFriends ... 있음 ...', data)),
      ).subscribe((friends) => {
        this.friends = friends;
        this.userService.getUserDetailsOrg(friends).then((friendsDetails) => {
          this.userService.findUserStatus(friends).then((friendsStates) => {
            // console.log('MyFriends ... 있음 ...', friendsDetails, friendsStates);
            this.friends = friendsDetails;
            this.friendState = friendsStates;
            this.isShow = true;
          });
        });
        // this.userService.getFriendStatus(this.friends);  1안
        // this.userService.getStatusFriend(this.friends, 'MYFRIEND getFriendsData 112');  // 2안
      });
  }

  updateMyFriendsState(): void {
    this.friends = [];
    this.friendsService.getMyFriends(this.myUid)
      .pipe(
        // tap(data => console.log('MyFriends 갱신 ... 있음 ...', data)),
      ).subscribe((friends) => {
        this.userService.findUserStatus(friends).then((friendsStates) => {
          // console.log('MyFriends 갱신 2 ... 있음 ...', friendsStates);
          this.friendState = friendsStates;
        });
      });
  }

  getFriendsStatus(): void {
    // this.subs.sink = this.userService.friendsStatus$
    //   .subscribe((data: IUser[]) => {
    //     console.log(' [상태변환] ', data);
    //     // this.friends = [];
    //     this.friendState = [];
    //     // this.friends = data;
    //     // data.forEach((el, i) => {
    //     //   this.friendState.push({ state: el.state });
    //     // });

    //     console.log('[MYFRIEND][183][친구내역!!]***', data);
    //   });

    // this.userService.updateStatuses2().subscribe((state) => {
    //   console.log('[MYFRIEND][158][상태감시]====', state);
    // });
  }

  friendsUpdate(): void {
    this.userService.statusUpdate$
      .subscribe(value => {
        if (value === 'StatusUpdated') {
          if (this.friends.length > 0) {
            // this.getFriendsData();
            this.getMyFriends();

          }
        }
      });
  }



  enterChat(user): void {
    this.messagesService.enterChat(user);
    this.groupService.enterGroup('closed');
  }

}
