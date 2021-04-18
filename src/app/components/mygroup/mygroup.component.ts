import { Component, OnInit, OnDestroy } from '@angular/core';

import { MatSnackBar } from '@angular/material/snack-bar';
import { SubSink } from 'subsink';
import { GroupService } from './../../services/groups.service';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-mygroup',
  templateUrl: './mygroup.component.html',
  styleUrls: ['./mygroup.component.scss']
})
export class MygroupComponent implements OnInit, OnDestroy {

  groupName: string;
  showAdd = false;
  myGroups = [];

  private subs = new SubSink();
  constructor(
    private snackBar: MatSnackBar,
    private groupService: GroupService,
    private messagesService: MessageService
  ) { }

  ngOnInit(): void {
    this.subs.sink = this.groupService.getGroups().subscribe((allGroups) => {
      this.myGroups = allGroups;
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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
