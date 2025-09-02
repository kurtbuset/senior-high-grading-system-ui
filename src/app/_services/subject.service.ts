import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Subject } from '@app/_models/Subject';


const baseUrl = `${environment.apiUrl}`;

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


  getAllAssignedSubjects(teacherId: number) {
    return this.http.get<Subject[]>(`${baseUrl}/teacher-subject-assignment/list/${teacherId}`)
  }

  getOneSubject(teacherId: number){
    return this.http.get<Subject>(`${baseUrl}/teacher-subject-assignment/${teacherId}`)
  }

  eraseSubjects() {
    this.subjectSubject.next(null);
  }

  getFilteredSubjects(filters: any){
    return this.http.get<any>(`${baseUrl}/curriculum-subjects/filtered`, { params: filters})
  }

  getAllSubjects(){
    return this.http.get<any>(`${baseUrl}/subjects`)
  }
}
