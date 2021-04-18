import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { IGroup, IUser } from 'src/app/models/userInfo';
import { FirestoreService } from 'src/app/services/firestore.service';
import { GroupService } from './../../services/groups.service';
import { SubSink } from 'subsink';
import { MatDialog } from '@angular/material/dialog';
import { AddMemberComponent } from '../add-member/add-member.component';
import { GroupInfoComponent } from '../group-info/group-info.component';


@Component({
  selector: 'app-group-menu',
  templateUrl: './group-menu.component.html',
  styleUrls: ['./group-menu.component.scss']
})
export class GroupMenuComponent implements OnInit, OnDestroy {

  currentGroup: IGroup;
  isGroup = false;
  isOwner = false;
  user: IUser;
  private subs = new SubSink();

  constructor(
    private groupService: GroupService,
    private auth: FirestoreService,
    private firebaseAuth: AngularFireAuth,
    private dialog: MatDialog,
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

          if (this.currentGroup.creator === this.user.email) {
            this.isOwner = true;
            this.isGroup = true;
          } else {
            this.isOwner = false;
            this.isGroup = false;
          }
        });
      } else {
        this.isOwner = false;
        this.isGroup = false;
      }
    });
  }

  getUser(): void {

  }



  loseGroup(): void {
    this.isGroup = !this.isGroup;
  }

  onFileInput(event): void {

  }

  addMember(): void {
    this.dialog.open(AddMemberComponent, {
      height: '500px',
      width: '400px'
    });
  }

  groupInfo(): void {
    this.dialog.open(GroupInfoComponent, {
      height: '500px',
      width: '400px'
    });
  }

}
