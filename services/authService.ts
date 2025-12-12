
export class AuthService {
  static isAuthenticated(): boolean {
    return true; // Login Disabled: Always authenticated as Default User
  }

  static login(): Promise<boolean> {
    return Promise.resolve(true);
  }

  static logout() {
    localStorage.removeItem('sentinel_token');
    window.location.reload();
  }
}
