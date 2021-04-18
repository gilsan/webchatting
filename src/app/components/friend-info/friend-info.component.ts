import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageService } from 'src/app/services/message.service';
import { SubSink } from 'subsink';


@Component({
  selector: 'app-friend-info',
  templateUrl: './friend-info.component.html',
  styleUrls: ['./friend-info.component.scss']
})
export class FriendInfoComponent implements OnInit, OnDestroy {

  currentUser;
  isUserSelected = false;
  private subs = new SubSink();

  constructor(
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.subs.sink = this.messageService.enteredChat$.subscribe((value) => {

      if (value) {
        this.currentUser = this.messageService.currentChatUser;
        this.isUserSelected = true;

      } else {
        this.isUserSelected = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  audioCall(): void {

  }

  closeChat(): void {
    this.messageService.enterChat('closed');
  }

}
