import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { first, map, distinct, tap, filter, take, finalize } from 'rxjs/operators';
import * as firebase from 'firebase';
import { IGroup, IUser } from 'src/app/models/userInfo';
import { AngularFireStorage } from '@angular/fire/storage';
import { query } from '@angular/animations';


@Injectable({
  providedIn: 'root'
})
export class GroupService {

  email;
  user: IUser = { displayName: '', email: '', photoURL: '', uid: '' };
  groupPicDefault = 'assets/images/mountains.jpg';
  groupDocRef;
  currentGroup: IGroup;
  enteredGroup = new BehaviorSubject<boolean>(false);
  enteredGroup$ = this.enteredGroup.asObservable();

  constructor(
    private afauth: AngularFireAuth,
    private afs: AngularFirestore,
    private storage: AngularFireStorage
  ) {
    this.afauth.currentUser.then(user => {
      console.log('group:afauth.currentUser:[31][group SERVICE]  ', user);
      this.email = user.email;
      this.getMyProfile(this.email);
    });
  }

  // 내정보 찿기
  getMyProfile(email): void {
    console.log('group:afauth.currentUser:[31]  ', email, this.email);
    this.afs.collection('users', ref => ref.where('email', '==', this.email)).get()
      .subscribe(snaps => {
        snaps.forEach(snap => {
          this.user = snap.data() as IUser;
        });
      });
  }

  // 구룹생성
  createGroup(groupName): Promise<any> {
    return new Promise((resolve) => {
      this.afs.collection('groups').add({
        groupName,
        creator: this.email,
        conversationId: '',
        groupPic: this.groupPicDefault
      }).then((docRef) => {
        this.groupDocRef = docRef.id;
        docRef.collection('members').add({
          email: this.email,
          displayName: this.user.displayName,
          photoURL: this.user.photoURL
        }).then(() => {
          this.afs.collection('groupconvos').add({
            groupName,
            creator: this.email
          }).then((docref) => {
            this.afs.collection('groups').doc(this.groupDocRef).update({
              conversationId: docref.id
            }).then(() => {
              resolve('');
            });
          });
        });
      });
    });

  }


  // get groups
  getGroups2(): Observable<any> {
    return this.afs.collection('groups', ref => ref.where('creator', '==', this.email)).valueChanges();
  }

  getGroups(): Promise<any> {
    return new Promise((resolve) => {
      const createdGroupObs = this.afs.collection('groups', ref => ref.where('creator', '==', this.email)).valueChanges();
      const memberofCollRef = this.afs.collection('memberof').ref;
      const queryRef = memberofCollRef.where('email', '==', this.email);
      queryRef.get().then((snapShot) => {
        console.log('[구룹가져오기][93] ', this.email, snapShot);
        if (snapShot.empty) {
          console.log('[구룹가져오기][93] ', this.email, snapShot);
          resolve(createdGroupObs);
        } else {
          console.log('[구룹가져오기] [96]', this.email, snapShot);
          const memberofObs = this.afs.doc('memberof/' + snapShot.docs[0].id).collection('groups').valueChanges();
          resolve(combineLatest([createdGroupObs, memberofObs]));

        }
      });

    });


  }

  // group 선택시 동작
  enterGroup(group): void {
    if (group !== 'closed') {
      this.currentGroup = group;
      this.enteredGroup.next(true);
    } else {
      this.currentGroup = {
        conversationId: '',
        creator: '',
        groupName: '',
        groupPic: '',
      };
      this.enteredGroup.next(false);
    }
  }

  addMember(user: IUser): Promise<any> {
    return new Promise((resolve) => {
      const groupCollRef = this.afs.collection('groups').ref;
      const firstlevelquery = groupCollRef.where('groupName', '==', this.currentGroup.groupName);
      const secondquery = firstlevelquery.where('creator', '==', this.email);
      // console.log('[addMember] ', user);
      secondquery.get().then((snapShot) => {
        // console.log('[102]', user, this.currentGroup.groupName, this.email, snapShot);
        if (!snapShot.empty) {
          // console.log('[][105] ', snapShot);
          this.afs.doc('groups/' + snapShot.docs[0].id).collection('members').add(user);
          const memberofCollRef = this.afs.collection('memberof').ref;
          const queryRef = memberofCollRef.where('email', '==', user.email);
          // tslint:disable-next-line:no-shadowed-variable
          queryRef.get().then((snapShot) => {
            // console.log('[][111] ', snapShot);
            if (snapShot.empty) {
              this.afs.collection('memberof').add({
                email: user.email
              }).then((docRef) => {
                this.afs.doc('memberof/' + docRef.id).collection('groups').add(this.currentGroup)
                  .then(() => {
                    resolve('New Root');
                  });
              });
            } else {
              this.afs.doc('memberof/' + snapShot.docs[0].id).collection('groups').add(this.currentGroup)
                .then(() => resolve('OK'));
            }
          });  // End of queryRef
        }
      }); // End of secodquery
    });
  }

  // 구릅에서 회원찿기
  getMembers(): Promise<any> {
    return new Promise((resolve) => {
      const groupCollRef = this.afs.collection('groups').ref;
      const queryRef = groupCollRef.where('groupName', '==', this.currentGroup.groupName)
        .where('creator', '==', this.email);
      queryRef.get().then((snapShot) => {
        if (!snapShot.empty) {
          resolve(this.afs.doc('groups/' + snapShot.docs[0].id).collection('members').valueChanges());
        } else {
          resolve('Not Exist');
        }

      });
    });
  }


  removeMember(user): Promise<any> {

    return new Promise((resolve) => {
      const groupCollRef = this.afs.collection('groups').ref;
      const queryRef = groupCollRef.where('groupName', '==', this.currentGroup.groupName)
        .where('creator', '==', this.email);
      queryRef.get().then((snapShot) => {
        if (!snapShot.empty) {
          const memberCollRef = this.afs.doc('groups/' + snapShot.docs[0].id).collection('members').ref;
          const queryMemberRef = memberCollRef.where('email', '==', user.email);
          // tslint:disable-next-line:no-shadowed-variable
          queryMemberRef.get().then((snapShot) => {
            if (!snapShot.empty) {
              console.log('[삭제][members]', user, snapShot.docs[0].ref, snapShot, snapShot.docs[0].id);
              snapShot.docs[0].ref.delete().then(() => {
                const memberofRef = this.afs.collection('memberof').ref;
                const queryref = memberofRef.where('email', '==', user.email);
                queryref.get().then((snapshot) => {
                  if (!snapshot.empty) {
                    const groupsubCollRef = this.afs.doc('memberof/' + snapshot.docs[0].id).collection('groups').ref;
                    const query = groupsubCollRef.where('groupName', '==', this.currentGroup.groupName)
                      .where('creator', '==', this.currentGroup.creator);
                    query.get().then((snapSHot) => {
                      if (!snapSHot.empty) {
                        // this.afs.doc('memberof/' + snapshot.docs[0].id).doc('group')
                        snapSHot.docs[0].ref.delete().then(() => {
                          resolve('Delete');
                        });
                      }
                    });
                  }
                });
              });
            }
          });
        }
      });
    });
  }

  changePicture(pic): void {

    let downloadURL;
    const path = this.storage.ref('/groupPics/' + this.currentGroup.groupName);
    const uploadTask = this.storage.upload('/groupPics/' + this.currentGroup.groupName, pic);
    uploadTask.snapshotChanges()
      .pipe(
        finalize(() => {
          downloadURL = path.getDownloadURL().subscribe(data => {
            downloadURL = data;
            path.getMetadata().subscribe(metadata => {
              if (metadata.contentType.match('image/.*')) {
                const groupCollRef = this.afs.collection('groups').ref;
                const queryRef = groupCollRef.where('groupName', '==', this.currentGroup.groupName);
                queryRef.get().then((snapShot) => {
                  if (!snapShot.empty) {
                    console.log('[changePicture]', this.currentGroup, snapShot.docs[0].id, downloadURL);
                    snapShot.docs[0].ref.update({
                      groupPic: downloadURL
                    });
                  }
                });
              }
            });
          });
        })
      ).subscribe(() => {

      });

  }


}

/**

 * AngularFirestoreDocument
 * AngularFirestoreCollection
 * To retrieve a nested collection use the collection(path: string) method.
 *   constructor(private afs: AngularFirestore) {
 * user/<uid>/tasks.
 * this.userDoc = afs.doc<Item>('user/david');
 * this.tasks = this.userDoc.collection<Task>('tasks').valueChanges();
 * }
 *
 */
