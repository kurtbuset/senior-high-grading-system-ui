import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AccountService } from '@app/_services/account.service';
import { Account } from '@app/_models/account';
import { Role } from '@app/_models/role';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
  account: Account;
  Role = Role;
  
  // Header properties
  schoolName = 'Benedicto College Senior High School';
  logoPath = '../assets/images/bc logo.png';
  
  // Date and time
  currentDateTime: string = '';
  private dateTimeInterval: any;
  
  // Editing state
  isEditing = false;
  editedSchoolName = '';
  editedLogoPath = '';
  logoFile: File | null = null;
  logoPreview: string | null = null;

  constructor(private accountService: AccountService) {
    this.accountService.account.subscribe(x => this.account = x);
  }

  ngOnInit(): void {
    // Load saved header settings from localStorage if available
    const savedHeaderSettings = localStorage.getItem('headerSettings');
    if (savedHeaderSettings) {
      const settings = JSON.parse(savedHeaderSettings);
      this.schoolName = settings.schoolName || this.schoolName;
      this.logoPath = settings.logoPath || this.logoPath;
    }
    
    // Initialize edited values
    this.editedSchoolName = this.schoolName;
    this.editedLogoPath = this.logoPath;
    
    // Initialize and update date/time
    this.updateDateTime();
    this.dateTimeInterval = setInterval(() => this.updateDateTime(), 1000);
  }
  
  ngOnDestroy(): void {
    if (this.dateTimeInterval) {
      clearInterval(this.dateTimeInterval);
    }
  }
  
  updateDateTime(): void {
    const now = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true
    };
    
    const dateString = now.toLocaleDateString('en-US', dateOptions);
    const timeString = now.toLocaleTimeString('en-US', timeOptions);
    this.currentDateTime = `${dateString} | ${timeString}`;
  }

  startEditing(): void {
    if (this.account && this.account.role === Role.SuperAdmin) {
      this.isEditing = true;
      this.editedSchoolName = this.schoolName;
      this.editedLogoPath = this.logoPath;
      this.logoFile = null;
      this.logoPreview = null;
    }
  }

  onLogoFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges(): void {
    this.schoolName = this.editedSchoolName;
    
    // If a new logo was uploaded, use it; otherwise keep the existing logo path
    if (this.logoFile && this.logoPreview) {
      this.logoPath = this.logoPreview;
    } else if (this.editedLogoPath) {
      this.logoPath = this.editedLogoPath;
    }
    
    // Save to localStorage
    const headerSettings = {
      schoolName: this.schoolName,
      logoPath: this.logoPath
    };
    localStorage.setItem('headerSettings', JSON.stringify(headerSettings));
    
    this.isEditing = false;
    this.logoFile = null;
    this.logoPreview = null;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.editedSchoolName = this.schoolName;
    this.editedLogoPath = this.logoPath;
    this.logoFile = null;
    this.logoPreview = null;
  }

  isSuperAdmin(): boolean {
    return this.account && this.account.role === Role.SuperAdmin;
  }
}