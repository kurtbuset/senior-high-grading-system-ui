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

  addQuiz(value) {
    return this.http.post(`${baseUrl}/quizzes`, value);
  }

  getQuizzes(
    teacher_subject_id: string,
    values
  ) {
    return this.http.get<any>(`${baseUrl}/quizzes/${teacher_subject_id}`, { params: values });
  }

  updateQuiz(id, params){
    return this.http.put(`${baseUrl}/quizzes/${id}`, params)
  }

  getStudentsWithoutScore(params: { teacher_subject_id: string; quiz_id: string }){
    return this.http.get(`${baseUrl}/quiz-scores`, { params })
  }

  getStudentsWithScore(id: number){
    return this.http.get(`${baseUrl}/quiz-scores/${id}`)
  }

  addStudentScore(params){
    return this.http.post(`${baseUrl}/quiz-scores`, params)
  }

  updateStudentScore(params){
    return this.http.put(`${baseUrl}/quiz-scores/update`, params)
  }

  getQuarterlyGradeSheet(id: string, params: { quarter: string }){
    return this.http.get(`${baseUrl}/quizzes/quarterly-grade-sheet/${id}`, { params } )
  }

  getFinalSemesterGradeSheet(id: string){
    return this.http.get(`${baseUrl}/quizzes/semestral-final-grade/${id}`)
  }

  deleteQuiz(id){
    return this.http.delete(`${baseUrl}/quizzes/${id}`)
  }
}
