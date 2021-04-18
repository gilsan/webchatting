import { Component, OnInit, OnDestroy } from '@angular/core';
import { GroupService } from 'src/app/services/groups.service';
import { MessageService } from 'src/app/services/message.service';
import { combineLatest } from 'rxjs';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit, OnDestroy {

  isGroupExpand = false;
  isMessageExpand = false;

  private subs = new SubSink();
  constructor(
    private groupService: GroupService,
    private messagesService: MessageService,
  ) { }

  ngOnInit(): void {
    this.getGroupState();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getGroupState(): void {
    const group$ = this.groupService.enteredGroup$;
    const message$ = this.messagesService.enteredChat$;

    this.subs.sink = combineLatest([group$, message$])
      .subscribe(([group, msg]) => {
        if (group && !msg) {
          this.isGroupExpand = true;
          this.isMessageExpand = false;
        } else if (!group && msg) {
          this.isGroupExpand = false;
          this.isMessageExpand = true;
        }
      });
  }

}
