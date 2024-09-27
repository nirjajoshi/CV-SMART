import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  submitted = false;
  constructor(private formBuilder:FormBuilder){
    this.registrationForm = this.formBuilder.group({
      email:['',[Validators.required,Validators.email],],
      phone:['',[Validators.required,Validators.pattern(/^\d{10}$/)],],
      role:['',[Validators.required,Validators.pattern(/^(candidate|admin|company)$/i),],],
    });
  }
  get f(){
    return this.registrationForm.controls;
  }
  
  onSubmit():void{
    this.submitted=true;
    if(this.registrationForm.valid){
      console.log('Form Submitted:', this.registrationForm.value);
    }else{
      console.log('Form is Invalid ')
    }
  }

}


