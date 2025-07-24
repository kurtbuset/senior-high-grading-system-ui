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
  public subjectSubject: BehaviorSubject<Subject>;
  public subject: Observable<Subject>;

  constructor(private http: HttpClient) {
    this.subjectSubject = new BehaviorSubject<Subject>(null)
    this.subject = this.subjectSubject.asObservable()
  }

  public get subjectValue(): Subject{
    return this.subjectSubject.value
  }


  getAllSubjects(teacherId: number) {
    return this.http.get<Subject[]>(`${baseUrl}/list/${teacherId}`)
  }

  getOneSubject(teacherId: number){
    return this.http.get<Subject>(`${baseUrl}/${teacherId}`)
  }

  createSubject(subject: Subject): Observable<any> {
    return this.http.post(`${baseUrl}`, subject);
  }

  updateSubject(id: number, subject: Subject): Observable<any> {
    return this.http.put(`${baseUrl}/${id}`, subject);
  }

  deleteSubject(id: number): Observable<any> {
    return this.http.delete(`${baseUrl}/${id}`);
  }

  eraseSubjects() {
    this.subjectSubject.next(null);
  }
}
