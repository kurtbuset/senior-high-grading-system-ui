import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Student } from '@app/_models/student';

const baseUrl = `${environment.apiUrl}/enrollments`
const studentUrl = `${environment.apiUrl}/students`

@Injectable({ providedIn: 'root' })
export class StudentService {
  private studentSubject = new BehaviorSubject<Student[]>([]);
  public subjects$ = this.studentSubject.asObservable();

  constructor(private http: HttpClient) {}

  getStudentsByTeacherSubjectId(id: number){
    return this.http.get<Student[]>(`${baseUrl}/${id}`)
  }
  
  updateStudentEnrollment(id: number, params: Object){
    return this.http.put(`${baseUrl}/${id}`, params)
  }

  getEnrolledStudents(id: number){
    return this.http.get<Student[]>(`${baseUrl}/enrolled/${id}`)
  }

  getSubjectsAndGrades(id: number){
    return this.http.get<{ schoolYear: string; subjects: any[] }>(`${studentUrl}/egrades/${id}`)
  }

  getStudentInfo(id: number){
    return this.http.get<any>(`${studentUrl}/${id}`)
  }

  getAllStudents(){
    return this.http.get<any>(`${studentUrl}`)
  }
}
