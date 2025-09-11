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

  addTransmutedGrade(params){
    return this.http.post(`${baseUrl}/final-grades`, params)
  }

  getQuarterlyGradeSheet(id: string, params: { quarter: string }){
    return this.http.get<any>(`${baseUrl}/quizzes/quarterly-grade-sheet/${id}`, { params } )
  }

  getFinalSemesterGradeSheet(id: string){
    return this.http.get(`${baseUrl}/quizzes/semestral-final-grade/${id}`)
  }

  deleteQuiz(id){
    return this.http.delete(`${baseUrl}/quizzes/${id}`)
  }

  getSubjectsLockingHistory(id: number){
    return this.http.get<any>(`${baseUrl}/final-grades/${id}`)
  }

  lockSubject(params: { teacher_subject_id: string, quarter: string}){
    return this.http.post(`${baseUrl}/subject-quarter-locks`, params)
  }

  requestToUnlock(teacher_subject_id: string, payload: { reason: string, quarter: string }){
    return this.http.put(`${baseUrl}/subject-quarter-locks/request/${teacher_subject_id}`, payload)
  }

  updateSubjectStatus(teacher_subject_id: string, payload: { status: string, quarter: string }) {
  return this.http.put(
    `${baseUrl}/subject-quarter-locks/${teacher_subject_id}`,
    payload
  );
}

}
