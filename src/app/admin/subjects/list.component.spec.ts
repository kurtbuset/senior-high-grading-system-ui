import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListComponent } from './list.component';
import { AlertService } from '@app/_services/alert.service';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let mockAlertService: jasmine.SpyObj<AlertService>;

  beforeEach(async () => {
    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['success', 'error', 'info']);

    await TestBed.configureTestingModule({
      imports: [ListComponent, FormsModule, ReactiveFormsModule],
      providers: [
        { provide: AlertService, useValue: alertServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    mockAlertService = TestBed.inject(AlertService) as jasmine.SpyObj<AlertService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all subjects on initialization', () => {
    component.ngOnInit();
    expect(component.subjects.length).toBeGreaterThan(0);
    expect(component.filteredSubjects.length).toBeGreaterThan(0);
  });

  it('should filter subjects by grade level', () => {
    component.ngOnInit();
    component.filterGradeLevel = '11';
    component.applyFilters();
    
    const grade11Subjects = component.filteredSubjects.filter(s => s.grade_level === '11');
    expect(component.filteredSubjects.length).toBe(grade11Subjects.length);
  });

  it('should filter subjects by strand', () => {
    component.ngOnInit();
    component.filterStrand = 'ABM';
    component.applyFilters();
    
    const abmSubjects = component.filteredSubjects.filter(s => s.strand === 'ABM');
    expect(component.filteredSubjects.length).toBe(abmSubjects.length);
  });

  it('should filter subjects by semester', () => {
    component.ngOnInit();
    component.filterSemester = '1st';
    component.applyFilters();
    
    const firstSemSubjects = component.filteredSubjects.filter(s => s.semester === '1st');
    expect(component.filteredSubjects.length).toBe(firstSemSubjects.length);
  });

  it('should filter subjects by grade, strand, and semester combination', () => {
    component.ngOnInit();
    component.filterGradeLevel = '11';
    component.filterStrand = 'ABM';
    component.filterSemester = '1st';
    component.applyFilters();
    
    const expectedSubjects = component.filteredSubjects.filter(s => 
      s.grade_level === '11' && s.strand === 'ABM' && s.semester === '1st'
    );
    expect(component.filteredSubjects.length).toBe(expectedSubjects.length);
    expect(component.filteredSubjects.length).toBeGreaterThan(0);
  });

  it('should clear all filters', () => {
    component.filterGradeLevel = '11';
    component.filterStrand = 'ABM';
    component.filterSemester = '1st';
    component.searchTerm = 'Math';
    
    component.clearFilters();
    
    expect(component.filterGradeLevel).toBe('');
    expect(component.filterStrand).toBe('');
    expect(component.filterSemester).toBe('');
    expect(component.searchTerm).toBe('');
  });

  it('should have subjects for all grade/strand/semester combinations', () => {
    component.ngOnInit();
    
    // Test that we have subjects for Grade 11 ABM 1st Semester
    const grade11Abm1st = component.subjects.filter(s => 
      s.grade_level === '11' && s.strand === 'ABM' && s.semester === '1st'
    );
    expect(grade11Abm1st.length).toBeGreaterThan(0);
    
    // Test that we have subjects for Grade 12 STEM 2nd Semester
    const grade12Stem2nd = component.subjects.filter(s => 
      s.grade_level === '12' && s.strand === 'STEM' && s.semester === '2nd'
    );
    expect(grade12Stem2nd.length).toBeGreaterThan(0);
  });

  it('should populate all subjects correctly', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.populateAllSubjects();
    
    expect(component.subjects.length).toBeGreaterThan(0);
    expect(mockAlertService.success).toHaveBeenCalled();
  });
});
