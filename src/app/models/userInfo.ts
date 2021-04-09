
export class IUser {
  displayName: string;
  email: string;
  photoURL: string;
  status?: string;
}

export class IRequest {
  receiver: string;
  sender: string;
}

export class IRUserInfo {
  email: string;
  uid: string;
  requestemail: string;
}

export class IStatus {
  status: string;
  uid: string;
}
