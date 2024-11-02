import { Component, OnInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { JobListingComponent } from '../job-listing/job-listing.component';
import { Job } from '../job-listing/job.model';

interface City {
  name: string;
  state: string;
}

@Component({
  selector: 'app-findjob',
  standalone: true,
  imports: [FormsModule,CommonModule,HttpClientModule,JobListingComponent],
  templateUrl: './findjob.component.html',
  styleUrls: ['./findjob.component.css']
})

export class FindjobComponent implements OnInit {
  message: string = '';
  location: string = '';
  jobdescriptionUploaded: boolean = false;
  cities: City[] = [];
  isUploading: boolean = false;
  uploadProgress: number = 0;

  selectedFile: File | null = null;
  selectedFileName: string = '';
  fileChosen: boolean = false;

  showSuggestions: boolean = false;
  filteredCities: City[] = [];
  activeSuggestionIndex: number = -1;
  userEmail: string = ''; 

  jobs: Job[] = []; 
  showJobList: boolean = false;
  
  uploadSuccessful: boolean = false;

  private searchSubject: Subject<string> = new Subject();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.loadCities();
    this.initializeSearch();

    if (isPlatformBrowser(this.platformId)) {
      try {
        const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
        this.userEmail = userDetails.email || ''; 
      } catch (error) {
        console.error('Error parsing user details from localStorage:', error);
      }
    }
  }

  initializeSearch(): void {
    this.searchSubject.pipe(debounceTime(300)).subscribe(searchText => {
      this.location = searchText;
      this.filterCities();
    });
  }

  loadCities(): void {
    this.getCities().subscribe(
      data => { this.cities = data; },
      error => { console.error('Error fetching cities:', error); }
    );
  }

  getCities(): Observable<City[]> {
    return this.http.get<City[]>('assets/data/cities-india.json');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      this.fileChosen = true;

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(this.selectedFile.type)) {
        this.message = 'Invalid file type. Please select a PDF or DOCX file.';
        this.resetFileInput();
        return;
      }

      this.validateFileSize();
    }
  }

  validateFileSize(): void {
    const maxSizeInMB = 5;
    if (this.selectedFile && this.selectedFile.size > maxSizeInMB * 1024 * 1024) {
      this.message = `File size exceeds ${maxSizeInMB}MB. Please select a smaller file.`;
      this.resetFileInput();
    }
  }

  resetFileInput(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.fileChosen = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  isFormValid(): boolean {
    return this.selectedFile !== null && this.location.trim() !== '';
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
        alert('Please select a file and enter a location.');
        return;
    }

    // Fetch the user ID using the email before submitting the form
    this.http.get<{ userId: string }>(`https://cv-smart-backend.onrender.com/api/v1/userid/get-user-id?email=${this.userEmail}`)
        .subscribe(
            (response: { userId: string }) => {
                const userId = response.userId;

                // Create FormData and append necessary details
                const formData = new FormData();
                formData.append('file', this.selectedFile!);
                formData.append('commonId', 'cvsmart');
                formData.append('email', this.userEmail); 
                formData.append('location', this.location);
                formData.append('userId', userId); // Add the user ID fetched from the backend

                console.log('Form Data:', formData);

                // Submit the form data with userId included
                this.http.post('https://cv-smart-backend.onrender.com/api/v1/resume/uploadResume', formData)
                    .subscribe(
                        (response: any) => {
                            alert(response.message);
                            this.message = 'Resume submitted successfully!';
                            this.uploadSuccessful = true;
                            this.fileChosen = false;
                        },
                        (error: any) => {
                            console.error('Error:', error);
                            alert('An error occurred while submitting the resume.');
                        }
                    );
            },
            (error: any) => {
                console.error('Error fetching user ID:', error);
                alert('An error occurred while fetching user ID.');
            }
        );
}

  removeFile(): void {
    this.resetFileInput();
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    if (inputElement) {
      this.searchSubject.next(inputElement.value);
    }
  }

  filterCities(): void {
    const query = this.location.toLowerCase().trim();
    this.filteredCities = query.length > 0 ? this.cities.filter(city =>
      city.name.toLowerCase().startsWith(query)
    ).slice(0, 10) : [];
    this.showSuggestions = this.filteredCities.length > 0;
    this.activeSuggestionIndex = -1;
  }

  selectCity(city: City): void {
    this.location = city.name;
    this.showSuggestions = false;
    this.filteredCities = [];
  }

  fetchJobs(): void {
    const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
    const userId = userDetails.id || '';  // Use 'id' here
  
    const commonId = 'cvsmart';
    const apiUrl = `https://cv-smart-backend.onrender.com/api/v1/matching-jobs?userId=${userId}&commonId=${commonId}`;
    
    console.log('Fetching jobs for userId:', userId);
    console.log('API URL:', apiUrl);
    
    this.http.get<Job[]>(apiUrl).subscribe(
      (response: Job[]) => {
        console.log('Received job response:', response);
        this.jobs = response;
        this.showJobList = true;
      },
      (error) => {
        console.error('Error fetching jobs:', error.message || error);
        alert('An error occurred while fetching job listings.');
      }
    );
  }
  
findJob(): void {
  console.log('isFormValid:', this.isFormValid(), 'uploadSuccessful:', this.uploadSuccessful);
  if (this.isFormValid() && this.uploadSuccessful) {
    this.fetchJobs();
  } else {
    console.log('Form is invalid. Please ensure all fields are filled out correctly.');
  }
}

  hideSuggestions(): void {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  highlightMatch(name: string): string {
    const regex = new RegExp(`(${this.location})`, 'gi');
    return name.replace(regex, '<strong>$1</strong>');
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.showSuggestions) {
      if (event.key === 'ArrowDown') {
        this.activeSuggestionIndex = (this.activeSuggestionIndex + 1) % this.filteredCities.length;
        event.preventDefault();
      } else if (event.key === 'ArrowUp') {
        this.activeSuggestionIndex = (this.activeSuggestionIndex - 1 + this.filteredCities.length) % this.filteredCities.length;
        event.preventDefault();
      } else if (event.key === 'Enter') {
        if (this.activeSuggestionIndex >= 0 && this.activeSuggestionIndex < this.filteredCities.length) {
          this.selectCity(this.filteredCities[this.activeSuggestionIndex]);
          event.preventDefault();
        }
      }
    }
  }


}
