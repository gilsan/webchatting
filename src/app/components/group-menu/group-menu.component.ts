import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { IGroup, IUser } from 'src/app/models/userInfo';
import { FirestoreService } from 'src/app/services/firestore.service';
import { GroupService } from './../../services/groups.service';
import { SubSink } from 'subsink';
import { MatDialog } from '@angular/material/dialog';
import { AddMemberComponent } from '../add-member/add-member.component';
import { GroupInfoComponent } from '../group-info/group-info.component';
import { RemoveMemberComponent } from '../remove-member/remove-member.component';
import { UserService } from 'src/app/services/user.service';
import { concatMap, tap } from 'rxjs/operators';

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
  selectedFiles: FileList;
  uid: string;
  private subs = new SubSink();

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private auth: FirestoreService,
    private firebaseAuth: AngularFireAuth,
    private firestoreService: FirestoreService,
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

    this.subs.sink = this.firestoreService.currentUid$.subscribe(uid => {
      this.uid = uid;
    });
  }


  getUser(): void {

  }

  loseGroup(): void {
    this.isGroup = !this.isGroup;
  }

  onFileInput(evt): void {
    this.selectedFiles = evt.target.files;
    if (this.selectedFiles.item(0)) {
      this.groupService.changePicture(this.selectedFiles.item(0));
    }
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

  // tslint:disable-next-line:adjacent-overload-signatures
  removeMember(): void {
    this.dialog.open(RemoveMemberComponent, {
      height: '500px',
      width: '400px'
    });
  }



}
