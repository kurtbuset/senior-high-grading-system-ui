import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

import { AlertService } from '@app/_services/alert.service';
import { Role } from '@app/_models/role';

const accountsKey = 'accountsKey';
let accounts = JSON.parse(localStorage.getItem(accountsKey)) || [];

// Initialize with default accounts if none exist
if (accounts.length === 0) {
  accounts = [
    {
      id: 1,
      firstName: 'Student',
      lastName: 'User',
      email: '2025-00001',
      password: 'password123',
      role: Role.Student,
      isActive: true,
      isVerified: true,
      dateCreated: new Date().toISOString(),
      refreshTokens: []
    },
    {
      id: 2,
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@test.com',
      password: 'admin123',
      role: Role.SuperAdmin,
      isActive: true,
      isVerified: true,
      dateCreated: new Date().toISOString(),
      refreshTokens: []
    }
  ];
  localStorage.setItem(accountsKey, JSON.stringify(accounts));
}

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  constructor(private alertService: AlertService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const { url, method, headers, body } = req;
    const alertService = this.alertService;

    return handleRoute();

    function handleRoute() {
      switch (true) {
        case url.endsWith('/accounts/authenticate') && method === 'POST':
          return authenticate();
        case url.endsWith('/accounts/refresh-token') && method === 'POST':
          return refreshToken();
        case url.endsWith('/accounts/register') && method === 'POST':
          return register();
        case url.endsWith('/accounts/revoke-token') && method === 'POST':
          return revokeToken();
        case url.match(/\/accounts\/\d+$/) && method === 'PUT':
          return updateAccount();
        default:
          // pass through any requests not handled above
          return next.handle(req);
      }
    }

    function revokeToken() {
      if (!isAuthenticated()) return unauthorized();

      const refreshToken = getRefreshToken();
      const account = accounts.find((x) =>
        x.refreshTokens.includes(refreshToken)
      );

      // revoke token and save
      account.refreshTokens = account.refreshTokens.filter(
        (x) => x !== refreshToken
      );
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      return ok();
    }

    function register() {
      const account = body;

      if (accounts.find((x) => x.email === account.email)) {
        // display email already registered "email" in alert
        setTimeout(() => {
          alertService.info(
            `
                        <h4>Email Already Registered</h4>
                        <p>Your email ${account.email} is already registered.</p>
                        <p>If you don't know your password please visit the <a href="${location.origin}/account/forgot-password">forgot password</a> page.</p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `,
            { autoClose: false }
          );
        }, 1000);

        // always return ok() response to prevent email enumeration
        return ok();
      }

      // assign account id and a few other properties then save
      account.id = newId(accounts);
      if (account.id === 1) {
        // first registered account is verified
        account.isVerified = true;
      } else {
        account.role = Role.Teacher;
        account.isVerified = false;
      }
      account.isActive = true;
      account.dateCreated = new Date().toISOString();
      account.verificationToken = new Date().getTime().toString();
      account.refreshTokens = [];
      delete account.confirmPassword;
      accounts.push(account);
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      // display verification email in alert

      if (account.id === 1) {
        setTimeout(() => {
          alertService.info(
            `
                        <h4>First user login</h4>
                        <p>you can login directly as first user where account is verified</p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `,
            { autoClose: false }
          );
        }, 1000);
      } else {
        setTimeout(() => {
          const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
          alertService.info(
            `
                        <h4>Verification Email</h4>
                        <p>Thanks for registering!</p>
                        <p>Please click the below link to verify your email address:</p>
                        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `,
            { autoClose: false }
          );
        }, 1000);
      }

      return ok();
    }

    function newId(list) {
      return list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;
    }

    function authenticate() {
      console.log('Fake backend: authentication attempt');
      const { username, password } = body;
      console.log('Authentication request for username:', username);
      
      // Find account by email or username (for student ID format)
      const emailExist = accounts.find((x) => x.email === username);
      if (!emailExist) {
        console.log('Account not found for username:', username);
        return error('Account does not exist');
      }

      const account = accounts.find(
        (x) => x.email === username && x.password === password
      );
      if (!account) {
        console.log('Password incorrect for username:', username);
        return error('Password is incorrect');
      }

      const isActive = accounts.find(
        (x) => x.email === username && x.password === password && x.isActive
      );
      if (!isActive) {
        console.log('Account inactive for username:', username);
        return error(
          'Account is inActive. Please contact system support!'
        );
      }

      const isVerified = accounts.find(
        (x) => x.email === username && x.password === password && x.isVerified
      );
      if (!isVerified) {
        setTimeout(() => {
          const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
          alertService.info(
            `
                        <h4>Verification Email</h4> 
                        <p>Please click the below link to verify your email address:</p>
                        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `,
            { autoClose: false }
          );
        }, 1000);
        return error('Email is not verified');
      }

      // add refresh token to account
      account.refreshTokens.push(generateRefreshToken());
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      console.log('Authentication successful for:', username, 'Role:', account.role);
      return ok({
        ...basicDetails(account),
        jwtToken: generateJwtToken(account),
      });
    }

    function refreshToken() {
      const refreshToken = getRefreshToken();

      if (!refreshToken) return unauthorized();

      const account = accounts.find((x) =>
        x.refreshTokens.includes(refreshToken)
      );

      if (!account) return unauthorized();

      // replace old refresh token with a new one and save
      account.refreshTokens = account.refreshTokens.filter(
        (x) => x !== refreshToken
      );
      account.refreshTokens.push(generateRefreshToken());
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

      return ok({
        ...basicDetails(account),
        jwtToken: generateJwtToken(account),
      });
    }

    function updateAccount() {
      if (!isAuthenticated()) return unauthorized();

      // get account id from URL
      const urlParts = url.split('/');
      const id = parseInt(urlParts[urlParts.length - 1]);
      
      const account = accounts.find(x => x.id === id);
      if (!account) return error('Account not found');

      console.log('Fake backend: updating account', id, 'with data:', body);

      // update password if provided
      if (body.password) {
        if (!body.confirmPassword) {
          return error('Confirm password is required');
        }
        if (body.password !== body.confirmPassword) {
          return error('Passwords do not match');
        }
        if (body.password.length < 6) {
          return error('Password must be at least 6 characters');
        }
        
        // update the password
        account.password = body.password;
        console.log('Fake backend: password updated for account', id);
      }

      // update other fields if provided
      if (body.firstName !== undefined) account.firstName = body.firstName;
      if (body.lastName !== undefined) account.lastName = body.lastName;
      if (body.email !== undefined) account.email = body.email;
      if (body.role !== undefined) account.role = body.role;

      // save updated accounts
      localStorage.setItem(accountsKey, JSON.stringify(accounts));
      
      console.log('Fake backend: account update completed, accounts saved to localStorage');
      
      return ok({ message: 'Account updated successfully' });
    }

    // helper functions
    function error(message: string) {
      return throwError(() => ({ error: { message } })).pipe(
        materialize(),
        delay(500),
        dematerialize()
      );
    }

    function ok(body?) {
      return of(new HttpResponse({ status: 200, body })).pipe(delay(500)); // delay observable to simulate server api call
    }

    function unauthorized() {
      return throwError(() => ({
        status: 401,
        error: { message: 'Unauthorized' },
      })).pipe(materialize(), delay(500), dematerialize());
    }

    function currentAccount() {
      // check if jwt token is in auth header
      const authHeader = headers.get('Authorization');
      if (!authHeader.startsWith('Bearer fake-jwt-token')) return;

      // check if token is expired
      const jwtToken = JSON.parse(atob(authHeader.split('.')[1]));
      const tokenExpired = Date.now() > jwtToken.exp * 1000;
      if (tokenExpired) return;

      const account = accounts.find((x) => x.id === jwtToken.id);
      return account;
    }

    function isAuthenticated() {
      return !!currentAccount();
    }

    function basicDetails(account) {
      const {
        id,
        title,
        firstName,
        lastName,
        email,
        role,
        dateCreated,
        isVerified,
        isActive,
      } = account;
      return {
        id,
        title,
        firstName,
        lastName,
        email,
        role,
        dateCreated,
        isVerified,
        isActive,
      };
    }

    function generateJwtToken(account) {
      // create token that expires in 15 minutes
      const tokenPayload = {
        exp: Math.round(new Date(Date.now() + 15 * 60 * 1000).getTime() / 1000),
        // exp: 1,
        id: account.id,
      };
      return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
    }

    function generateRefreshToken() {
      const token = new Date().getTime().toString();

      // add token cookie that expires in 7 days
      const expires = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toUTCString();
      document.cookie = `fakeRefreshToken=${token}; expires=${expires}; path=/`;

      return token;
    }

    function getRefreshToken() {
      // get refresh token from cookie
      return (
        document.cookie
          .split(';')
          .find((x) => x.includes('fakeRefreshToken')) || '='
      ).split('=')[1];
    }
  }
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true,
};
