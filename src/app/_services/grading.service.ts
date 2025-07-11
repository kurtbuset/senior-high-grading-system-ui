import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '@environments/environment';

const baseUrl = `${environment.apiUrl}`;

@Injectable({ providedIn: 'root' })
export class GradingService {
  constructor(private http: HttpClient) {}

  updatePercentages(teacher_subject_id, value) {
    return this.http.put(
      `${baseUrl}/teacher-subject-assignment/${teacher_subject_id}`,
      value
    );
  }

  addHighestPossibleScore(teacher_subject_id, value) {
    return this.http.post(`${baseUrl}/quizzes/${teacher_subject_id}`, value);
  }

  getHighestPossibleScore(
    teacher_subject_id: string,
    values: { quarter: string; type: string }
  ) {
    return this.http.get<any>(`${baseUrl}/quizzes/${teacher_subject_id}`, { params: values });
  }
}
