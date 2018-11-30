import { Exclude } from "class-transformer";

export class User {
  UserName: string;
  clientID: string;
  role: string;
  token: string;
  userID: string;

  @Exclude()
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";

  @Exclude()
  aud: string;

  @Exclude()
  exp: string;
  
  @Exclude()
  iss: string;
  
  @Exclude()
  nbf: string;
}
