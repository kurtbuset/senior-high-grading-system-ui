
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AccountService } from '@app/_services/account.service';
import { AlertService } from '@app/_services/alert.service';
import { first } from 'rxjs/operators';

@Component({
  standalone: true,
  templateUrl: 'list.component.html',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule]
})
export class ListComponent implements OnInit {
  teacherAssignments: any[] = [];
  subjects: any[] = [];
  teachers: any[] = [];
  showModal = false;
  isEditMode = false;
  currentAssignment: any = null;
  assignmentForm: FormGroup;
  submitted = false;
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadData();
  }

  initializeForm() {
    this.assignmentForm = this.formBuilder.group({
      teacherId: ['', Validators.required],
      subjectId: ['', Validators.required]
    });
  }

  loadData() {
    this.loadTeachers();
    this.generateSubjects();
    this.teacherAssignments = [];

    // Add a test assignment to verify functionality
    setTimeout(() => {
      if (this.teachers.length > 0 && this.subjects.length > 0) {
        console.log('Test data available - teachers and subjects loaded successfully');
      }
    }, 1000);
  }

  loadTeachers() {
    // Try backend first
    this.accountService.getAll()
      .pipe(first())
      .subscribe({
        next: (accounts) => {
          const backendTeachers = accounts.filter(account => account.role === 'Teacher');

          // Also get localStorage teachers
          const localAccounts = JSON.parse(localStorage.getItem('localAccounts') || '[]');
          const localTeachers = localAccounts.filter((account: any) => account.role === 'Teacher');

          // Combine both sources
          this.teachers = [...backendTeachers, ...localTeachers];

          console.log('Loaded teachers:', this.teachers);
        },
        error: () => {
          // Backend failed, use only localStorage
          const localAccounts = JSON.parse(localStorage.getItem('localAccounts') || '[]');
          this.teachers = localAccounts.filter((account: any) => account.role === 'Teacher');

          console.log('Using localStorage teachers:', this.teachers);
        }
      });
  }

  generateSubjects() {
    // Use the same subject structure as in the subjects component
    const subjectsByGradeStrandSemester = {
      '11': {
        'ABM': {
          '1st': [
            'Oral Communication in Context',
            'Komunikasyon at Pananaliksik sa Wika at Kulturang Filipino',
            'General Mathematics',
            'Earth and Life Science',
            'Personal Development/Pansariling Kaunlaran',
            'Physical Education and Health',
            'Fundamentals of Accountancy, Business and Management 1'
          ],
          '2nd': [
            'Reading and Writing Skills',
            'Pagbasa at Pagsusuri ng Iba\'t-Ibang Teksto Tungo sa Pananaliksik',
            'Statistics and Probability',
            'Physical Science',
            'Understanding Culture, Society and Politics',
            'Physical Education and Health',
            'Fundamentals of Accountancy, Business and Management 2'
          ]
        },
        'HUMSS': {
          '1st': [
            'Oral Communication in Context',
            'Komunikasyon at Pananaliksik sa Wika at Kulturang Filipino',
            'General Mathematics',
            'Earth and Life Science',
            'Personal Development/Pansariling Kaunlaran',
            'Physical Education and Health',
            'Creative Writing / Malikhaing Pagsulat'
          ],
          '2nd': [
            'Reading and Writing Skills',
            'Pagbasa at Pagsusuri ng Iba\'t-Ibang Teksto Tungo sa Pananaliksik',
            'Statistics and Probability',
            'Physical Science',
            'Understanding Culture, Society and Politics',
            'Physical Education and Health',
            'Introduction to World Religions and Belief Systems'
          ]
        },
        'STEM': {
          '1st': [
            'Oral Communication in Context',
            'Komunikasyon at Pananaliksik sa Wika at Kulturang Filipino',
            'General Mathematics',
            'Earth and Life Science',
            'Personal Development/Pansariling Kaunlaran',
            'Physical Education and Health',
            'Pre-Calculus'
          ],
          '2nd': [
            'Reading and Writing Skills',
            'Pagbasa at Pagsusuri ng Iba\'t-Ibang Teksto Tungo sa Pananaliksik',
            'Statistics and Probability',
            'Physical Science',
            'Understanding Culture, Society and Politics',
            'Physical Education and Health',
            'General Chemistry 1'
          ]
        }
      },
      '12': {
        'ABM': {
          '1st': [
            '21st Century Literature from the Philippines and the World',
            'Contemporary Philippine Arts from the Regions',
            'Media and Information Literacy',
            'Introduction to the Philosophy of the Human Person / Pambungad sa Pilosopiya ng Tao',
            'Physical Education and Health',
            'Applied Economics',
            'Business Ethics and Social Responsibility',
            'Business Math'
          ],
          '2nd': [
            'English for Academic and Professional Purposes',
            'Pagsulat sa Filipino sa Piling Larangan (Akademik)',
            'Empowerment Technologies (E-Tech): ICT for Professional Tracks',
            'Entrepreneurship',
            'Physical Education and Health',
            'Business Finance',
            'Organization and Management',
            'Principles of Marketing',
            'Business Enterprise Simulation'
          ]
        }
      }
    };

    this.subjects = [];
    let id = 1;

    // Generate subjects from the structure
    Object.keys(subjectsByGradeStrandSemester).forEach(grade => {
      Object.keys(subjectsByGradeStrandSemester[grade]).forEach(strand => {
        Object.keys(subjectsByGradeStrandSemester[grade][strand]).forEach(semester => {
          const subjects = subjectsByGradeStrandSemester[grade][strand][semester];
          subjects.forEach((subjectName: string) => {
            this.subjects.push({
              id: id++,
              subjectName: subjectName,
              grade_level: grade,
              strand: strand,
              semester: semester
            });
          });
        });
      });
    });

    console.log(`Generated ${this.subjects.length} subjects:`, this.subjects.slice(0, 5)); // Show first 5 for debugging
  }

  openAddModal() {
    this.loadTeachers(); // Refresh teachers list

    this.isEditMode = false;
    this.currentAssignment = null;
    this.assignmentForm.reset();
    this.submitted = false;
    this.showModal = true;
  }

  editAssignment(assignment: any) {
    this.isEditMode = true;
    this.currentAssignment = assignment;
    this.assignmentForm.patchValue({
      teacherId: assignment.teacherId,
      subjectId: assignment.subjectId
    });
    this.submitted = false;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.assignmentForm.reset();
    this.submitted = false;
  }

  onSubmit() {
    console.log('Form submitted!');
    this.submitted = true;

    console.log('Form value:', this.assignmentForm.value);
    console.log('Form valid:', this.assignmentForm.valid);
    console.log('Teachers count:', this.teachers.length);
    console.log('Subjects count:', this.subjects.length);

    if (this.assignmentForm.invalid) {
      console.log('Form is invalid');
      this.alertService.error('Please select both teacher and subject');
      return;
    }

    this.loading = true;

    const teacherId = this.assignmentForm.value.teacherId;
    const subjectId = this.assignmentForm.value.subjectId;

    console.log('Selected teacher ID:', teacherId);
    console.log('Selected subject ID:', subjectId);

    const teacher = this.teachers.find(t => t.id == teacherId);
    const subject = this.subjects.find(s => s.id == subjectId);

    console.log('Found teacher:', teacher);
    console.log('Found subject:', subject);

    if (!teacher || !subject) {
      console.log('Teacher or subject not found');
      this.alertService.error('Invalid selection. Please try again.');
      this.loading = false;
      return;
    }

    // Create the assignment
    const newAssignment = {
      id: Date.now(),
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName}`,
      subjectId: subject.id,
      subjectName: subject.subjectName,
      grade_level: subject.grade_level,
      strand: subject.strand,
      semester: subject.semester
    };

    console.log('Creating assignment:', newAssignment);

    if (this.isEditMode && this.currentAssignment) {
      // Update existing assignment
      const index = this.teacherAssignments.findIndex(a => a.id === this.currentAssignment.id);
      if (index !== -1) {
        this.teacherAssignments[index] = { ...newAssignment, id: this.currentAssignment.id };
      }
      this.alertService.success('Assignment updated successfully');
    } else {
      // Add new assignment
      this.teacherAssignments.push(newAssignment);
      console.log('Assignment added. Total assignments:', this.teacherAssignments.length);
      this.alertService.success(`${teacher.firstName} ${teacher.lastName} assigned to ${subject.subjectName}`);
    }

    this.closeModal();
    this.loading = false;
  }

  deleteAssignment(id: number) {
    if (confirm('Are you sure you want to delete this teacher assignment?')) {
      this.teacherAssignments = this.teacherAssignments.filter(a => a.id !== id);
      this.alertService.success('Teacher assignment deleted successfully');
    }
  }



  get f() { return this.assignmentForm.controls; }

  getStrandColor(strand: string): string {
    switch (strand) {
      case 'ABM': return '#16a34a'; // Green
      case 'HUMSS': return '#0ea5e9'; // Blue
      case 'STEM': return '#dc2626'; // Red
      case 'GAS': return '#7c3aed'; // Purple
      case 'TVL': return '#ea580c'; // Orange
      case 'ICT': return '#1f2937'; // Dark gray
      default: return '#374151'; // Default gray
    }
  }
}
