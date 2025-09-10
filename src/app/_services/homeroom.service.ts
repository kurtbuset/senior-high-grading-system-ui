import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '@environments/environment';

import { Homeroom } from '@app/_models/homeroom';

const baseUrl = `${environment.apiUrl}/homerooms`;

@Injectable({ providedIn: 'root' })
export class HomeroomService {
  public homeroomSubject: BehaviorSubject<Homeroom>;
  public homeroom: Observable<Homeroom>;

  constructor(private http: HttpClient) {
    this.homeroomSubject = new BehaviorSubject<Homeroom>(null);
    this.homeroom = this.homeroomSubject.asObservable();
  }

  public get homeroomValue(): Homeroom {
    return this.homeroomSubject.value;
  }

  getOneHomeroom(homeroomId: number) {
    return this.http.get<Homeroom>(`${baseUrl}/${homeroomId}`);
  }

  getHomerooms(role: string, accountId: string) {
    return this.http.get<any>(`${baseUrl}?role=${role}&accountId=${accountId}`);
  }

  getConsolidatedSheet(homeroomId: string, params: { semester: string }) {
    return this.http.get<any>(`${baseUrl}/conso/${homeroomId}`, { params });
  }
}
