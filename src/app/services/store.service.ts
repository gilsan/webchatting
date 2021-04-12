import { Injectable } from "@angular/core";
import { IUser } from '../models/userInfo';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  friends: IUser[] = [];

  setFriends(friends: IUser): void {
    this.friends = [...this.friends, friends];
  }

  getFriends(): IUser[] {
    return this.friends;
  }

  clearFriends(): void {
    this.friends = [];
  }

}
