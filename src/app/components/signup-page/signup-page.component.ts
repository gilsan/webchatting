import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { constants } from '../../constants';
@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent implements OnInit {

  formGroup: FormGroup;
  pictureUrl = constants.PICTURE_URL;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SignupPageComponent>,
    private firestoreService: FirestoreService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadForm();
  }

  loadForm(): void {
    this.formGroup = this.fb.group({
      email: [],
      password: [],
      pwconfirm: []
    });
  }

  onRegister(): void {
    if (this.formGroup.value.password === this.formGroup.value.pwconfirm) {
      this.firestoreService.signup(
        this.formGroup.value.email,
        this.formGroup.value.password
      ).subscribe(data => {
        this.firestoreService.setUserData(this.formGroup.value.email, '문정', this.pictureUrl);
        console.log('[onRegister][41]', data);
        this.router.navigate(['/dashboard']);
        this.dialogRef.close();
      });
    }

  }

  onClose(): void {
    this.dialogRef.close();
  }



}


