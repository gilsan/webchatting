import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { SignupPageComponent } from '../signup-page/signup-page.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  loginForm: FormGroup;
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

    this.service.login(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe(data => {

        this.service.setUserStatus('online', data.user.uid);
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
