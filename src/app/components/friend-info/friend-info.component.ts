import { Component, OnInit } from '@angular/core';
import { MessageService } from 'src/app/services/message.service';



@Component({
  selector: 'app-friend-info',
  templateUrl: './friend-info.component.html',
  styleUrls: ['./friend-info.component.scss']
})
export class FriendInfoComponent implements OnInit {

  currentUser;
  isUserSelected = false;

  constructor(
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.messageService.enteredChat$.subscribe((value) => {

      if (value) {
        this.currentUser = this.messageService.currentChatUser;
        this.isUserSelected = true;

      } else {
        this.isUserSelected = false;
      }
    });
  }
  audioCall(): void {

  }

  closeChat(): void {
    this.messageService.enterChat('closed');
  }

}
