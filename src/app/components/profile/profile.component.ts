import { Component, OnInit } from '@angular/core';
import { IUser } from 'src/app/models/userInfo';
import { FirestoreService } from 'src/app/services/firestore.service';
import { UserService } from './../../services/user.service';
import { concatMap, distinct, tap } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  nickNameedit = false;
  newNickName = '';
  user: IUser = { displayName: '', email: '', photoURL: '' };
  uid: string;
  selectedFiles: FileList;
  spinnerToggle = false;

  constructor(
    private userService: UserService,
    private firestoreService: FirestoreService,
  ) {


  }

  ngOnInit(): void {

    this.init();
  }

  init(): void {
    this.firestoreService.currentUid$.subscribe((uid: string) => {
      this.uid = uid;
    });
    this.userService.getCurrentuser()
      .subscribe(data => {
        if (data) {
          this.uid = data.uid;

          this.userService.getProfile(this.uid)
            .pipe(
              tap(user => this.user = user),
              distinct((u: IUser) => u.email),
            )
            .subscribe((user) => {

            });
        }
      });

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
    this.userService.getProfile(this.uid).subscribe((user: IUser) => {
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
