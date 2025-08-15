import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-modify-account',
  standalone: true,
  imports: [CommonModule, FormsModule], // FIX: FormsModule added so ngForm/ngModel work
  templateUrl: './modify-account.component.html',
})
export class ModifyAccountComponent {
  student = {
    name: '',
    email: '',
    password: '',
  };

  saving = false;
  message = '';

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    this.saving = true;
    // simulate save
    setTimeout(() => {
      this.saving = false;
      this.message = 'Account updated successfully.';
      form.form.markAsPristine();
    }, 600);
  }
}
