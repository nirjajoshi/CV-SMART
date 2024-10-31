import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,HttpClientModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  submitted = false;
  serverError: string = '';
  serverSuccess: string = '';


  // Define status options
  candidateStatuses = [
      { value: 'open_to_network', display: 'Open to Network' },
      { value: 'not_open_to_network', display: 'Not Open to Network' }
    ];
  
  companyStatuses = [
      { value: 'hiring', display: 'Hiring' },
      { value: 'not_hiring', display: 'Not Hiring' }
    ];

  constructor(private formBuilder:FormBuilder,private http: HttpClient,private router: Router){
    this.registrationForm = this.formBuilder.group({
      email:['',[Validators.required,Validators.email],],
      fullname: ['', [Validators.required, Validators.minLength(2)]],
      password: ['',[ Validators.required,Validators.minLength(6),Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/)]],
      role:['',[Validators.required,Validators.pattern(/^(candidate|admin|company)$/i)]],
      status: ['']
    });
    this.registrationForm.get('role')?.valueChanges.subscribe(role => {
      const statusControl = this.registrationForm.get('status');
      if (role.toLowerCase() === 'candidate' || role.toLowerCase() === 'company') {
        statusControl?.setValidators([Validators.required]);
      } else {
        statusControl?.clearValidators();
        statusControl?.setValue('');
      }
      statusControl?.updateValueAndValidity();
    });

  }
  get f(){
    return this.registrationForm.controls;
  }
  
  onSubmit():void{
    this.submitted=true;
    this.serverError = '';
    this.serverSuccess = '';
    if(this.registrationForm.valid){
      const payload = {
        email: this.f['email'].value,
        fullname: this.f['fullname'].value,
        password: this.f['password'].value,
        role: this.f['role'].value,
        status: this.f['status'].value
      };
      this.http.post<any>('https://cv-smart-nirja-joshis-projects.vercel.app/api/v1/users/register', payload).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.serverSuccess = response.message || 'Registration successful!';
          this.registrationForm.reset();
          this.submitted = false;
          this.router.navigate(['']);
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.serverError = error.error.message || 'An error occurred during registration.';
        }
      });

    }else{
      console.log('Form is Invalid ')
    }
  }

}

