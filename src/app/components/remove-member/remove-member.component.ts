import { Component, OnInit, OnDestroy } from '@angular/core';
import { FriendsService } from 'src/app/services/friends.service';
import { UserService } from './../../services/user.service';
import { GroupService } from 'src/app/services/groups.service';
import { SubSink } from 'subsink';
import { AngularFireAuth } from '@angular/fire/auth';
import { IRUserInfo, IUser } from 'src/app/models/userInfo';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, switchMap, tap } from 'rxjs/operators';
import { FirestoreService } from './../../services/firestore.service';
@Component({
  selector: 'app-remove-member',
  templateUrl: './remove-member.component.html',
  styleUrls: ['./remove-member.component.scss']
})
export class RemoveMemberComponent implements OnInit, OnDestroy {

  myFriends: IRUserInfo[] = [];
  currentUser: IUser;
  private subs = new SubSink();
  loadingSpinner = false;
  isMember = [];

  constructor(
    private friendService: FriendsService,
    private userService: UserService,
    private groupsService: GroupService,
    private firebaseAuth: AngularFireAuth,
    private firestoreService: FirestoreService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  init(): void {
    this.subs.sink = this.firestoreService.currentUid$
      .pipe(
        switchMap(uid => this.userService.getUserProfile(uid)),
      )
      .subscribe((user) => {
        this.currentUser = user;
        this.getMembers();
      });
  }

  getMembers(): void {
    this.groupsService.getMembers().then((memberList: any) => {
      memberList.subscribe((members) => {
        // console.log('[회원] ', members, this.currentUser);
        this.myFriends = members;
      });
    });
  }


  removeFriend(user): void {
    this.groupsService.removeMember(user).then(() => {
      this.snackBar.open('항목을 삭제 하였습니다.', '당기', { duration: 3000 });
    });
  }



}
