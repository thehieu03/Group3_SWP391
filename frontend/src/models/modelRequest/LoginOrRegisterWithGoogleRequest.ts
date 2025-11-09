export interface LoginOrRegisterWithGoogleRequest {
  id: string; // NOT googleId!
  email: string;
  name: string; // NOT username!
  picture: string; // NOT image!
}
