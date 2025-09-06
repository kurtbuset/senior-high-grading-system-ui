import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize, tap } from 'rxjs/operators';

import { SubjectService } from './subject.service';
import { environment } from '@environments/environment';
import { Account } from '@app/_models/account';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountSubject: BehaviorSubject<Account>;
  public account: Observable<Account>;

  constructor(private router: Router, private http: HttpClient, private subjectService: SubjectService) {
    // Check if there's an existing account in localStorage on init
    const storedAccount = localStorage.getItem('account');
    let initialAccount = null;
    
    if (storedAccount) {
      try {
        const parsedAccount = JSON.parse(storedAccount);
        // Only use stored account if it has a valid JWT token
        if (parsedAccount && parsedAccount.jwtToken) {
          // Additional check to see if token is not expired
          try {
            const jwtToken = JSON.parse(atob(parsedAccount.jwtToken.split('.')[1]));
            const expires = new Date(jwtToken.exp * 1000);
            if (expires.getTime() > Date.now()) {
              initialAccount = parsedAccount;
            } else {
              // Token is expired, clear it
              localStorage.removeItem('account');
            }
          } catch (tokenError) {
            // Invalid token format, clear it
            localStorage.removeItem('account');
          }
        } else {
          // Clear invalid account data
          localStorage.removeItem('account');
        }
      } catch (error) {
        // Clear corrupted account data
        localStorage.removeItem('account');
      }
    }
    
    this.accountSubject = new BehaviorSubject<Account>(initialAccount);
    this.account = this.accountSubject.asObservable();
    
    // Start refresh token timer if we have a valid account
    if (initialAccount) {
      this.startRefreshTokenTimer();
    }
  }

  public get accountValue(): Account {
    return this.accountSubject.value;
  }

  setLoginDate(id: string){
    return this.http.post(`${baseUrl}/setLogin`, { accountId: id })
  }

  setLogoutDate(id: string){
    return this.http.post(`${baseUrl}/setLogout`, { accountId: id })
  }

  login(username: string, password: string) {
    return this.http
      .post<any>(`${baseUrl}/authenticate`, { username, password }, { withCredentials: true })
      .pipe(
        map((account) => {
          this.accountSubject.next(account);
          this.startRefreshTokenTimer();
          return account;
        })
      );
  }

  register(account: Account) {
    return this.http.post(`${baseUrl}/register`, account);
  }

  loggingHistory(){
    return this.http.get<any>(`${baseUrl}/historyLogging`);
  }

  logout() {
    this.http
      .post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true })
      .subscribe();
    localStorage.removeItem('account');
    localStorage.removeItem('studentLoginId'); // Clear student login ID
    this.stopRefreshTokenTimer();
    this.setLogoutDate(this.accountValue.id).subscribe()
    this.accountSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  refreshToken() {
    return this.http
      .post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        map((account) => {
          // Store updated account in localStorage
          localStorage.setItem('account', JSON.stringify(account));
          this.accountSubject.next(account);
          this.startRefreshTokenTimer();
          return account;
        })
      );
  }

  verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/verify-email`, { token });
  }

  getAll() {
    return this.http.get<Account[]>(baseUrl);
  }

  getById(id: string) {
    return this.http.get<Account>(`${baseUrl}/${id}`);
  }

  update(id: string, params: any) {
    console.log('AccountService.update called with ID:', id);
    console.log('Update URL:', `${baseUrl}/${id}`);
    console.log('Update params:', { ...params, password: params.password ? '[HIDDEN]' : undefined, confirmPassword: params.confirmPassword ? '[HIDDEN]' : undefined });
    
    return this.http.put(`${baseUrl}/${id}`, params).pipe(
      map((response: any) => {
        console.log('Account update response:', response);
        return response;
      })
    );
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`);
  }

  private refreshTokenTimeout;

  private startRefreshTokenTimer() {
    // parse json object from base64 encoded jwt token
    const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));

    // set a timeout to refresh the token a minute before it expires
    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - 60 * 1000;
    this.refreshTokenTimeout = setTimeout(
      () => this.refreshToken().subscribe(),
      timeout
    );
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}
