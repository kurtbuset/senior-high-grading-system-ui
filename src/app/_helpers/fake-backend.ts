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
        // first registered account is an admin
        account.role = Role.Admin;
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
                        <p>you can login directly as first user where role is admin and account is verified</p>
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
      console.log('asd');
      const { email, password } = body;
      const emailExist = accounts.find((x) => x.email === email);
      if (!emailExist) return error('email doesnt exist');

      const account = accounts.find(
        (x) => x.email === email && x.password === password
      );
      if (!account) return error('password is incorrect');

      const isActive = accounts.find(
        (x) => x.email === email && x.password === password && x.isActive
      );
      if (!isActive)
        return error(
          'Account is inActive. Please contact system Administrator!'
        );

      const isVerified = accounts.find(
        (x) => x.email === email && x.password === password && x.isVerified
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

      // const account = accounts.find(x => x.email === email && x.password === password && x.isVerified);
      // if(!account) return error('hell nah')

      // add refresh token to account
      account.refreshTokens.push(generateRefreshToken());
      localStorage.setItem(accountsKey, JSON.stringify(accounts));

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
