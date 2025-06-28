import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Subject } from '@app/_models/Subject';


const baseUrl = `${environment.apiUrl}/teacher-subject-assignment`;

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private subjectsSubject = new BehaviorSubject<Subject[]>([]);
  public subjects$ = this.subjectsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllSubjects(teacherId: number) {
    return this.http.get<Subject[]>(`${baseUrl}/${teacherId}`);
  }

  eraseSubjects() {
    this.subjectsSubject.next([]);
  }
}
