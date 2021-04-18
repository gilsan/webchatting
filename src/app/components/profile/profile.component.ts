import { Component, OnInit, OnDestroy } from '@angular/core';
import { IUser } from 'src/app/models/userInfo';
import { FirestoreService } from 'src/app/services/firestore.service';
import { UserService } from './../../services/user.service';
import { concatMap, distinct, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {

  nickNameedit = false;
  newNickName = '';
  user: IUser = { displayName: '', email: '', photoURL: '' };
  uid: string;
  selectedFiles: FileList;
  spinnerToggle = false;
  private subs = new SubSink();

  constructor(
    private userService: UserService,
    private firestoreService: FirestoreService,
  ) { }

  ngOnInit(): void {

    this.init();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  init(): void {
    this.subs.sink = this.firestoreService.currentUid$.subscribe((uid: string) => {
      this.uid = uid;
    });
    this.userService.currentUser$.subscribe((user: IUser) => {
      if (user) {
        this.user = user;
      } else {
        this.user = { displayName: '', email: '', photoURL: '' };
      }
    });
    // this.userService.getCurrentuser()
    //   .subscribe(data => {
    //     if (data) {
    //       this.uid = data.uid;

    //       this.userService.getProfile(this.uid)
    //         .pipe(
    //           tap(user => this.user = user),
    //           distinct((u: IUser) => u.email),
    //         )
    //         .subscribe((user) => {

    //         });
    //     }
    //   });

  }


  editName(): void {
    this.nickNameedit = !this.nickNameedit;
  }

  updateName(): void {
    // console.log('uid: ', this.uid, this.newNickName);
    this.userService.updateName(this.newNickName, this.uid)
      .subscribe(data => {
        console.log('updateName: ', data);
        this.newNickName = '';
        this.editName();
        this.getMyInfo();
      });
  }

  getMyInfo(): void {
    this.userService.getUserProfile(this.uid, 'PROFILE getMyInfo').subscribe((user: IUser) => {
      this.user = user;
    });
  }

  changePic(): void { }



  chooseImage(evt): void {
    this.spinnerToggle = true;
    this.selectedFiles = evt.target.files;
    if (this.selectedFiles.item(0)) {
      this.userService.updateProfilePic(this.selectedFiles.item(0), this.uid)
        .pipe(
          concatMap(() => this.userService.downloadProfilePic(this.uid)),
          tap((photoURL) => this.user.photoURL = photoURL),
          concatMap(photoURL => this.userService.updatePhotoURL(photoURL, this.uid))
        ).subscribe(data => {
          this.spinnerToggle = false;
        });

    }
  }


  changeNickname(newName: string): void {
    this.newNickName = newName;
  }

}
