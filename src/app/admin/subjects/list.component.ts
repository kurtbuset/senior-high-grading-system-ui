
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AlertService } from "@app/_services/alert.service";

@Component({ 
  standalone: true, 
  templateUrl: 'list.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule]
})
export class ListComponent implements OnInit {
  subjects: any[] = [];
  filteredSubjects: any[] = [];
  groupedSubjects: any[] = []; // New property for grouped subjects
  showModal = false;
  isEditMode = false;
  currentSubject: any = null;
  subjectForm!: FormGroup;
  loading = false;
  submitted = false;
  availableSubjects: string[] = [];

  // Filters
  filterGradeLevel = '';
  filterStrand = '';
  filterSemester = '';
  searchTerm = '';

  // Auto-populate flag
  autoPopulateEnabled = true;

  /**
   * Complete K-12 Senior High School Subjects organized by Grade, Strand, and Semester
   * Covers all combinations from Grade 11 to Grade 12, both semesters
   * Includes all major strands: ABM, HUMSS, STEM, GAS, TVL, ICT
   */
  subjectsByGradeStrandSemester = {
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
      },
      'GAS': {
        '1st': [
          'Oral Communication in Context',
          'Komunikasyon at Pananaliksik sa Wika at Kulturang Filipino',
          'General Mathematics',
          'Earth and Life Science',
          'Personal Development/Pansariling Kaunlaran',
          'Physical Education and Health',
          'Humanities 1'
        ],
        '2nd': [
          'Reading and Writing Skills',
          'Pagbasa at Pagsusuri ng Iba\'t-Ibang Teksto Tungo sa Pananaliksik',
          'Statistics and Probability',
          'Physical Science',
          'Understanding Culture, Society and Politics',
          'Physical Education and Health',
          'Humanities 2'
        ]
      },
      'TVL': {
        '1st': [
          'Oral Communication in Context',
          'Komunikasyon at Pananaliksik sa Wika at Kulturang Filipino',
          'General Mathematics',
          'Earth and Life Science',
          'Personal Development/Pansariling Kaunlaran',
          'Physical Education and Health',
          'Entrepreneurship'
        ],
        '2nd': [
          'Reading and Writing Skills',
          'Pagbasa at Pagsusuri ng Iba\'t-Ibang Teksto Tungo sa Pananaliksik',
          'Statistics and Probability',
          'Physical Science',
          'Understanding Culture, Society and Politics',
          'Physical Education and Health',
          'Computer Programming'
        ]
      },
      'ICT': {
        '1st': [
          'Oral Communication in Context',
          'Komunikasyon at Pananaliksik sa Wika at Kulturang Filipino',
          'General Mathematics',
          'Earth and Life Science',
          'Personal Development/Pansariling Kaunlaran',
          'Physical Education and Health',
          'Computer Programming 1'
        ],
        '2nd': [
          'Reading and Writing Skills',
          'Pagbasa at Pagsusuri ng Iba\'t-Ibang Teksto Tungo sa Pananaliksik',
          'Statistics and Probability',
          'Physical Science',
          'Understanding Culture, Society and Politics',
          'Physical Education and Health',
          'Computer Programming 2'
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
      },
      'HUMSS': {
        '1st': [
          '21st Century Literature from the Philippines and the World',
          'Contemporary Philippine Arts from the Regions',
          'Media and Information Literacy',
          'Introduction to the Philosophy of the Human Person / Pambungad sa Pilosopiya ng Tao',
          'Physical Education and Health',
          'Creative Nonfiction',
          'Disciplines and Ideas in the Social Sciences',
          'Philippine Politics and Governance'
        ],
        '2nd': [
          'English for Academic and Professional Purposes',
          'Pagsulat sa Filipino sa Piling Larangan (Akademik)',
          'Empowerment Technologies (E-Tech): ICT for Professional Tracks',
          'Entrepreneurship',
          'Physical Education and Health',
          'Community Engagement, Solidarity, and Citizenship',
          'Disciplines and Ideas in the Applied Social Sciences',
          'Trends, Networks, and Critical Thinking in the 21st Century Culture'
        ]
      },
      'STEM': {
        '1st': [
          '21st Century Literature from the Philippines and the World',
          'Contemporary Philippine Arts from the Regions',
          'Media and Information Literacy',
          'Introduction to the Philosophy of the Human Person / Pambungad sa Pilosopiya ng Tao',
          'Physical Education and Health',
          'Basic Calculus',
          'General Biology 1',
          'General Physics 1'
        ],
        '2nd': [
          'English for Academic and Professional Purposes',
          'Pagsulat sa Filipino sa Piling Larangan (Akademik)',
          'Empowerment Technologies (E-Tech): ICT for Professional Tracks',
          'Entrepreneurship',
          'Physical Education and Health',
          'General Biology 2',
          'General Chemistry 2',
          'General Physics 2'
        ]
      },
      'GAS': {
        '1st': [
          '21st Century Literature from the Philippines and the World',
          'Contemporary Philippine Arts from the Regions',
          'Media and Information Literacy',
          'Introduction to the Philosophy of the Human Person / Pambungad sa Pilosopiya ng Tao',
          'Physical Education and Health',
          'Applied Economics',
          'Organization and Management',
          'Elective 1'
        ],
        '2nd': [
          'English for Academic and Professional Purposes',
          'Pagsulat sa Filipino sa Piling Larangan (Akademik)',
          'Empowerment Technologies (E-Tech): ICT for Professional Tracks',
          'Entrepreneurship',
          'Physical Education and Health',
          'Disaster Readiness and Risk Reduction',
          'Social Science 1',
          'Elective 2'
        ]
      },
      'TVL': {
        '1st': [
          '21st Century Literature from the Philippines and the World',
          'Contemporary Philippine Arts from the Regions',
          'Media and Information Literacy',
          'Introduction to the Philosophy of the Human Person / Pambungad sa Pilosopiya ng Tao',
          'Physical Education and Health',
          'Entrepreneurship',
          'Workplace Ethics',
          'Technical Drafting'
        ],
        '2nd': [
          'English for Academic and Professional Purposes',
          'Pagsulat sa Filipino sa Piling Larangan (Akademik)',
          'Empowerment Technologies (E-Tech): ICT for Professional Tracks',
          'Entrepreneurship',
          'Physical Education and Health',
          'Work Immersion',
          'Capstone Project',
          'Technical Skills Assessment'
        ]
      },
      'ICT': {
        '1st': [
          '21st Century Literature from the Philippines and the World',
          'Contemporary Philippine Arts from the Regions',
          'Media and Information Literacy',
          'Introduction to the Philosophy of the Human Person / Pambungad sa Pilosopiya ng Tao',
          'Physical Education and Health',
          'Computer Programming 3',
          'Web Development',
          'Database Management'
        ],
        '2nd': [
          'English for Academic and Professional Purposes',
          'Pagsulat sa Filipino sa Piling Larangan (Akademik)',
          'Empowerment Technologies (E-Tech): ICT for Professional Tracks',
          'Entrepreneurship',
          'Physical Education and Health',
          'Work Immersion',
          'Capstone Project',
          'System Analysis and Design'
        ]
      }
    }
  };

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadSubjects();
  }

  initializeForm() {
    this.subjectForm = this.formBuilder.group({
      subjectName: ['', Validators.required],
      grade_level: ['', Validators.required],
      strand: ['', Validators.required],
      section: ['', Validators.required],
      school_year: ['', Validators.required],
      semester: ['', Validators.required]
    });
  }

  get f() { return this.subjectForm.controls; }

  onGradeChange() {
    this.updateAvailableSubjects();
  }

  onStrandChange() {
    this.updateAvailableSubjects();
  }

  onSemesterChange() {
    this.updateAvailableSubjects();
  }

  updateAvailableSubjects() {
    const selectedGrade = this.subjectForm.get('grade_level')?.value;
    const selectedStrand = this.subjectForm.get('strand')?.value;
    const selectedSemester = this.subjectForm.get('semester')?.value;
    
    this.availableSubjects = [];
    
    if (selectedGrade && selectedStrand) {
      if (selectedSemester) {
        // Show subjects for specific grade, strand, and semester
        const subjects = this.subjectsByGradeStrandSemester[selectedGrade]?.[selectedStrand]?.[selectedSemester];
        if (subjects) {
          this.availableSubjects = [...subjects].sort();
        }
      } else {
        // Show all subjects for grade and strand (both semesters)
        const firstSem = this.subjectsByGradeStrandSemester[selectedGrade]?.[selectedStrand]?.['1st'] || [];
        const secondSem = this.subjectsByGradeStrandSemester[selectedGrade]?.[selectedStrand]?.['2nd'] || [];
        this.availableSubjects = [...new Set([...firstSem, ...secondSem])].sort();
      }
    }
    
    // Reset subject selection when filters change
    this.subjectForm.get('subjectName')?.setValue('');
  }

  loadSubjects() {
    // Generate all subjects from the predefined structure
    this.subjects = [];
    let id = 1;

    // Iterate through all grades, strands, and semesters to create complete subject list
    Object.keys(this.subjectsByGradeStrandSemester).forEach(grade => {
      Object.keys(this.subjectsByGradeStrandSemester[grade]).forEach(strand => {
        Object.keys(this.subjectsByGradeStrandSemester[grade][strand]).forEach(semester => {
          const subjects = this.subjectsByGradeStrandSemester[grade][strand][semester];
          subjects.forEach((subjectName: string) => {
            this.subjects.push({
              id: id++,
              subjectName: subjectName,
              grade_level: grade,
              strand: strand,
              school_year: '2023-2024',
              semester: semester
            });
          });
        });
      });
    });

    this.applyFilters(); // This will also trigger grouping
  }

  applyFilters() {
    // First, filter subjects based on criteria
    this.filteredSubjects = this.subjects.filter(subject => {
      const matchesGrade = !this.filterGradeLevel || subject.grade_level === this.filterGradeLevel;
      const matchesStrand = !this.filterStrand || subject.strand === this.filterStrand;
      const matchesSemester = !this.filterSemester || subject.semester === this.filterSemester;
      const matchesSearch = !this.searchTerm ||
        subject.subjectName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        subject.strand.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesGrade && matchesStrand && matchesSemester && matchesSearch;
    });

    // Group subjects by name, grade, and semester
    this.groupSubjects();
  }

  groupSubjects() {
    const grouped = new Map<string, any>();
    
    this.filteredSubjects.forEach(subject => {
      const key = `${subject.subjectName}-${subject.grade_level}-${subject.semester}`;
      
      if (grouped.has(key)) {
        // Add strand to existing group
        const existing = grouped.get(key);
        if (!existing.strands.includes(subject.strand)) {
          existing.strands.push(subject.strand);
          existing.strands.sort();
        }
      } else {
        // Create new group
        grouped.set(key, {
          id: subject.id,
          subjectName: subject.subjectName,
          grade_level: subject.grade_level,
          semester: subject.semester,
          school_year: subject.school_year,
          strands: [subject.strand],
          originalSubjects: [subject]
        });
      }
    });
    
    // Convert map to array and sort
    this.groupedSubjects = Array.from(grouped.values()).sort((a, b) => {
      if (a.grade_level !== b.grade_level) {
        return a.grade_level.localeCompare(b.grade_level);
      }
      if (a.semester !== b.semester) {
        return a.semester.localeCompare(b.semester);
      }
      return a.subjectName.localeCompare(b.subjectName);
    });
    
    // Assign consecutive IDs
    this.groupedSubjects.forEach((group, index) => {
      group.displayId = index + 1;
    });
  }



  // Method to clear all filters
  clearFilters() {
    this.filterGradeLevel = '';
    this.filterStrand = '';
    this.filterSemester = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentSubject = null;
    this.subjectForm.reset();
    this.submitted = false;
    this.availableSubjects = [];
    this.showModal = true;
  }

  editSubject(subject: any) {
    this.isEditMode = true;
    this.currentSubject = subject;
    this.subjectForm.patchValue(subject);
    this.updateAvailableSubjects();
    this.submitted = false;
    this.showModal = true;
  }

  editGroupedSubject(groupedSubject: any) {
    // For grouped subjects, edit the first subject in the group
    if (groupedSubject.originalSubjects && groupedSubject.originalSubjects.length > 0) {
      this.editSubject(groupedSubject.originalSubjects[0]);
    }
  }

  deleteGroupedSubject(groupedSubject: any) {
    const subjectName = groupedSubject.subjectName;
    const grade = groupedSubject.grade_level;
    const semester = groupedSubject.semester;
    const strandsText = groupedSubject.strands.join(', ');

    if (confirm(`Are you sure you want to delete "${subjectName}" for Grade ${grade} ${semester} Semester from all strands (${strandsText})?`)) {
      // Remove all subjects that match this group
      this.subjects = this.subjects.filter(s =>
        !(s.subjectName === subjectName && s.grade_level === grade && s.semester === semester)
      );

      this.applyFilters();
      this.alertService.success(`Deleted "${subjectName}" from all applicable strands.`);
    }
  }

  closeModal() {
    this.showModal = false;
    this.subjectForm.reset();
    this.submitted = false;
    this.availableSubjects = [];
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.subjectForm.invalid) {
      return;
    }

    this.loading = true;
    
    // Simulate API call
    setTimeout(() => {
      if (this.isEditMode) {
        const index = this.subjects.findIndex(s => s.id === this.currentSubject.id);
        if (index !== -1) {
          this.subjects[index] = { ...this.currentSubject, ...this.subjectForm.value };
        }
        this.alertService.success('Subject updated successfully');
      } else {
        const newSubject = {
          id: this.subjects.length + 1,
          ...this.subjectForm.value
        };
        this.subjects.push(newSubject);
        this.alertService.success('Subject added successfully');
      }
      
      this.applyFilters(); // This will refresh the grouped view
      this.closeModal();
      this.loading = false;
    }, 1000);
  }

  deleteSubject(id: number) {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.subjects = this.subjects.filter(s => s.id !== id);
      this.applyFilters();
      this.alertService.success('Subject deleted successfully');
    }
  }

  assignTeacher(subject: any) {
    // Navigate to teacher assignment or open assignment modal
    console.log('Assign teacher to subject:', subject);
    this.alertService.success('Teacher assignment feature coming soon!');
  }
}
