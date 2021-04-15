import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserService } from './../../services/user.service';
import { FriendsService } from './../../services/friends.service';
import { RequestService } from 'src/app/services/request';
import { IFriend, IRUserInfo, IUser } from 'src/app/models/userInfo';
import { switchMap, tap, concatMap, map, take, first } from 'rxjs/operators';
import { from, combineLatest, Observable } from 'rxjs';
import { FirestoreService } from 'src/app/services/firestore.service';
import { MessageService } from './../../services/message.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { StoreService } from './../../services/store.service';

@Component({
  selector: 'app-myfriend',
  templateUrl: './myfriend.component.html',
  styleUrls: ['./myfriend.component.scss']
})
export class MyfriendComponent implements OnInit, OnDestroy {

  friends: IUser[] = [];
  status = [];
  myUid: string;
  myProfile: IUser = { displayName: '', email: '', photoURL: '', status: '', uid: '' };

  users: IUser[] = [];
  bkupUsers: IUser[];

  constructor(
    private userService: UserService,
    private friendsService: FriendsService,
    private firestoreService: FirestoreService,
    private requestService: RequestService,
    private messagesService: MessageService,
    private db: AngularFirestore,
    private store: StoreService
  ) { }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.friends = [];
    this.status = [];
    this.myUid = '';
  }

  init(): void {
    combineLatest([this.friendsService.friendsCollTrigger$,
    this.firestoreService.currentUid$,
    ])
      .subscribe(([value, uid]) => {
        this.myUid = uid;

        // console.log('[MYFRIEND][51][누가 그렇게 많이 불러!!]', value);
        if (value === 'Nothing') {  // 내정보 가져오기
          this.friends = [];
          this.userService.getUserProfile(this.myUid, 'MYFRIEND INIT')
            .pipe(
              map((user: IUser) => user.email),
              // tap(email => console.log('[MYFRIEND][1][내이메일로 getRequestFriendList 에서 친구검색][58]', email)),
              switchMap(email => this.friendsService.getRequestFriendList(email, 'MYFRIEND INIT 59')), // requestemail 검색
              switchMap(friends => from(friends)),
              map((friend: IRUserInfo) => friend.uid),
              switchMap(fid => this.userService.getProfile(fid, 'MYFRIEND INIT 62')),
              // tap(friend => console.log('[MYFRIEND][61][친구의 상세내역!!][63]', friend)),
            )
            .subscribe((friend: IUser) => {
              const idx = this.friends.findIndex(arrfriend => arrfriend.email === friend.email);
              if (idx === -1) {
                this.friends.push(friend);
                // console.log('[MYFRIEND][67][친구의 상세내역!!][67]', friend, this.friends);
              }
            });
        }
      });

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
    this.friendsService.getmyFriends(this.myProfile.email).then((res: Observable<any>) => {
      res.subscribe(data => {
        // console.log('[MYFRIEND][109][친구내역!!][1]', data);
        if (data === 'Nothing') {
          this.friendsService.getRequestFriendList(this.myProfile.email, 'myfriend')
            .pipe(
              switchMap((friends: IRUserInfo[]) => from(friends)),
              map(user => user.uid),
              switchMap(uid => this.userService.getUserProfile(uid)),
              map(user => tempUser = [...tempUser, user]),
            )
            .subscribe((friends: IUser[]) => {
              // console.log('[MYFRIEND][118][친구내역!!][3]', friends);
              this.userService.getStatusFriend(friends, 'MYFRIEND getFriendsData 112');
            });
        }
      });
    });


    this.friendsService.getMyFriends(this.myUid, this.myProfile.email)
      .pipe(
        switchMap(emails => from(emails)),
        concatMap((friend: IRUserInfo) => this.userService.getUsers(friend.requestemail, 'myFriend Component')),
        take(1),
        map(item => item[0]),
      ).subscribe((data) => {
        this.friends = [];
        this.friends.push(data);
        // console.log('[MYFRIEND][112][친구내역!!][112]', this.friends);
        // this.userService.getFriendStatus(this.friends);  1안
        this.userService.getStatusFriend(this.friends, 'MYFRIEND getFriendsData 112');  // 2안
      });

  }

  getFriendsStatus(): void {
    this.userService.friendsStatus$
      .subscribe((data: IUser[]) => {
        this.friends = [];
        this.friends = data;
        // console.log('[MYFRIEND][146][친구내역!!][4]', data);
      });
  }

  friendsUpdate(): void {
    this.userService.statusUpdate$
      .subscribe(value => {
        if (value === 'StatusUpdated') {
          if (this.friends.length > 0) {
            this.getFriendsData();
          }
        }
      });
  }

  enterChat(user): void {
    this.messagesService.enterChat(user);
  }

}
