import { Component, OnInit, OnDestroy } from '@angular/core';
import { FriendsService } from 'src/app/services/friends.service';
import { UserService } from './../../services/user.service';
import { GroupService } from 'src/app/services/groups.service';
import { SubSink } from 'subsink';
import { AngularFireAuth } from '@angular/fire/auth';
import { IRUserInfo, IUser } from 'src/app/models/userInfo';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})
export class AddMemberComponent implements OnInit, OnDestroy {

  myFriends: IRUserInfo[] = [];
  user: IUser;
  private subs = new SubSink();
  loadingSpinner = false;
  isMember = [];

  constructor(
    private friendService: FriendsService,
    private userService: UserService,
    private groupsService: GroupService,
    private firebaseAuth: AngularFireAuth,
  ) { }

  ngOnInit(): void {
    this.init();
  }



  init(): void {
    this.subs.sink = this.firebaseAuth.authState.subscribe((user) => {
      this.user = user;
      this.getFriends(this.user.email);
    });
  }

  getFriends(email): void {
    this.friendService.getmyFriends(email).then((value: Observable<any>) => {
      value.subscribe((friendsemail) => {
        if (friendsemail === 'Exists') {
          this.subs.sink = this.friendService.getFriendList().subscribe((friends) => {
            this.userService.getUserDetailsOrg(friends).then((friendDetails: IRUserInfo[]) => {
              this.updateList();
              this.myFriends = friendDetails;
            });
          });
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  addFriend(user): void {
    this.groupsService.addMember(user);
  }

  updateList(): void {
    this.groupsService.getMembers().then((memberList: any) => {
      let flag = 0;
      memberList.subscribe((members) => {
        this.isMember = [];
        this.myFriends.forEach((member, i) => {
          members.forEach((element) => {
            if (member.email === element.email) {
              flag += 1;
            }
          });
          if (flag === 1) {
            this.isMember.push(false);
            flag = 0;
          } else {
            this.isMember.push(true);
          }
        });
      });
    });
  }

}
