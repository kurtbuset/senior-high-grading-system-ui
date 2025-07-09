import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '@environments/environment';

const baseUrl = `${environment.apiUrl}/teacher-subject-assignment`;

@Injectable({ providedIn: 'root' })
export class GradingService{
  
  constructor(private http: HttpClient){}

  updatePercentages(teacher_subject_id, value){
    return this.http.put(`${baseUrl}/${teacher_subject_id}`, value)
  }
}