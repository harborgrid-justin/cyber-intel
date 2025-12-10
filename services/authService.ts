
export class AuthService {
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('sentinel_token');
  }

  static login(): Promise<boolean> {
    return new Promise((resolve) => {
        setTimeout(() => {
            localStorage.setItem('sentinel_token', 'mock_jwt_token');
            resolve(true);
        }, 1000);
    });
  }

  static logout() {
    localStorage.removeItem('sentinel_token');
    window.location.reload();
  }
}
