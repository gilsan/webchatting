import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { MessageService } from 'src/app/services/message.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  newmessage: string;

  currentUseremail: string;

  constructor(
    private db: AngularFirestore,
    private firebaseAuth: AngularFireAuth,
    private msgService: MessageService
  ) { }

  ngOnInit(): void {
    this.currentEmail();
  }

  currentEmail(): void {
    this.firebaseAuth.currentUser.then((data) => {
      this.currentUseremail = data.email;
    });
  }


  addMessage(): void {
    if (this.newmessage !== '') {
      const type = 'none';
      this.msgService.addNewMsg(this.newmessage, this.currentUseremail, type);
    }
  }

}
