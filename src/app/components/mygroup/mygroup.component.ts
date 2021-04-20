import { Component, OnInit, OnDestroy } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { SubSink } from 'subsink';
import { GroupService } from './../../services/groups.service';
import { MessageService } from 'src/app/services/message.service';
import { Observable } from 'rxjs';
import { IGroup } from 'src/app/models/userInfo';
import { filter, map, tap } from 'rxjs/operators';
import { isArray } from 'lodash';

@Component({
  selector: 'app-mygroup',
  templateUrl: './mygroup.component.html',
  styleUrls: ['./mygroup.component.scss']
})
export class MygroupComponent implements OnInit, OnDestroy {

  groupName: string;
  showAdd = false;
  myGroups: IGroup[] = [];

  private subs = new SubSink();
  constructor(
    private snackBar: MatSnackBar,
    private groupService: GroupService,
    private messagesService: MessageService
  ) { }

  ngOnInit(): void {
    this.groupService.getGroups().then((groupObs: Observable<any>) => {
      this.subs.sink = groupObs
        .pipe(
          filter(val => val !== undefined),
          map(val => val[0]),
        )
        .subscribe((allGroups) => {
          // console.log('===== ', isArray(allGroups), allGroups);
          const arr = isArray(allGroups);
          if (arr) {
            this.myGroups = allGroups;
          } else {
            if (allGroups !== undefined) {
              this.myGroups.push(allGroups);
              // console.log('****** ', this.myGroups[0].groupName);
            }

          }

        });
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.myGroups = [];
  }

  addGroup(): void {
    this.showAdd = !this.showAdd;
  }

  createGroup(): void {
    this.groupService.createGroup(this.groupName)
      .then(() => {
        this.snackBar.open('구룹 생성 했습니다.', '닫기', { duration: 3000 });
      });
  }

  refreshList(): void {

  }

  openGroup(group): void {
    this.groupService.enterGroup(group);
    this.messagesService.enterChat('closed');

  }

}
