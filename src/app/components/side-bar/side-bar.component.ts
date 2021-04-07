import { Component, OnInit } from '@angular/core';

import { UserService } from './../../services/user.service';
import { FriendsService } from './../../services/friends.service';
import { RequestService } from 'src/app/services/request';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {

  constructor(
    private userService: UserService,
    private friendsService: FriendsService,
    private requestService: RequestService
  ) { }

  ngOnInit(): void {
  }

  storeTest(): void {

  }

}
