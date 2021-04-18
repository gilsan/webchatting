import { Component, OnInit, OnDestroy } from '@angular/core';
import { FriendsService } from 'src/app/services/friends.service';
import { UserService } from './../../services/user.service';
import { GroupService } from 'src/app/services/groups.service';
import { SubSink } from 'subsink';
import { AngularFireAuth } from '@angular/fire/auth';
import { IUser } from 'src/app/models/userInfo';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-member',
  templateUrl: './add-member.component.html',
  styleUrls: ['./add-member.component.scss']
})
export class AddMemberComponent implements OnInit, OnDestroy {

  myFriends = [];
  user: IUser;
  private subs = new SubSink();
  loadingSpinner = false;


  constructor(
    private friendService: FriendsService,
    private userService: UserService,
    private groupService: GroupService,
    private firebaseAuth: AngularFireAuth,
  ) { }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.firebaseAuth.authState.subscribe((user) => {
      this.user = user;

    });
  }

  getFriends(email): void {
    this.friendService.getmyFriends(email).then((value: Observable<any>) => {
      value.subscribe()
    });
  }

  ngOnDestroy(): void {

  }

  addFriend(user) {

  }

}
