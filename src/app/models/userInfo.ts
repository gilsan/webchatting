
export class IUser {
  displayName: string;
  email: string;
  photoURL: string;
  status?: string;
  uid?: string;

}

export interface IFriend {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
}

export interface IRequest {
  receiver: string;
  sender: string;
}

export interface IRUserInfo {
  email: string;
  uid: string;
  requestemail: string;
}

export interface IStatus {
  status: string;
  uid: string;
}

export interface IConversation {
  messageId: string;
  myemail: string;
  wihtWhom: string;
}
export interface IMsg {
  message: string;
  timestamp: string;
  sentBy: string;
}
