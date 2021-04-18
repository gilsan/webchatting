import { Component, OnInit, OnDestroy } from '@angular/core';
import { FriendsService } from 'src/app/services/friends.service';
import { UserService } from './../../services/user.service';
import { GroupService } from 'src/app/services/groups.service';
import { SubSink } from 'subsink';
import { AngularFireAuth } from '@angular/fire/auth';
import { IFriend, IGroup, IUser } from 'src/app/models/userInfo';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-group-info',
  templateUrl: './group-info.component.html',
  styleUrls: ['./group-info.component.scss']
})
export class GroupInfoComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
  user: IUser;
  members: IFriend[] = [];
  currentGroup: IGroup;

  constructor(
    private friendService: FriendsService,
    private userService: UserService,
    private groupService: GroupService,
    private firebaseAuth: AngularFireAuth,
    private dialogRef: MatDialogRef<GroupInfoComponent>
  ) { }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  init(): void {
    this.subs.sink = this.groupService.enteredGroup$.subscribe((value) => {
      if (value) {
        this.currentGroup = this.groupService.currentGroup;
        this.firebaseAuth.authState.subscribe((user) => {
          this.user = user;

          this.groupService.getMembers().then((memberList: any) => {
            memberList.subscribe((members) => {
              this.members = members;
            });
          });

        });
      }
    });
  }

  onclose(): void {
    this.dialogRef.close();
  }

}
