import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SubSink } from 'subsink';
import { FirestoreService } from '../../services/firestore.service';
import { SignupPageComponent } from '../signup-page/signup-page.component';
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  private subs = new SubSink();

  constructor(
    private fb: FormBuilder,
    private service: FirestoreService,
    private dialog: MatDialog,
    private router: Router,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadForm();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  register(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.height = '600px';
    dialogConfig.width = '800px';
    const dialogRef = this.dialog.open(SignupPageComponent, dialogConfig);
  }

  login(): void {

    this.subs.sink = this.service.login(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe(data => {
        // 현사용자


        this.service.setUserStatus('online', data.user.uid, this.loginForm.value.email);
        this.router.navigate(['/dashboard']);
      },
        (err) => {
          console.log(err);
          if (err.code === 'auth/user-not-found') {
            this._snackBar.open('등록된 사용자가 아님니다.', '닫기', { duration: 3000 });
          }
          if (err.code === 'auth/wrong-password') {
            this._snackBar.open('비밀번호가 틀립니다', '닫기', { duration: 3000 });
          }
          // alert('등록된 사용자가 아님니다.');
          this.loginForm.reset();
        });





  }



}
