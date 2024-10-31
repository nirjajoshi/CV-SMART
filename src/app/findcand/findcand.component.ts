import { Component, OnInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import{CandidateListingComponent}from '../candidate-listing/candidate-listing.component'
import { Candidate } from '../candidate-listing/candidate.model';
import { Router } from '@angular/router';

interface City {
  name: string;
  state: string;
}

@Component({
  selector: 'app-findcand',
  standalone: true,
  imports: [FormsModule,CommonModule, HttpClientModule,CandidateListingComponent],
  templateUrl: './findcand.component.html',
  styleUrls: ['./findcand.component.css']
})
  export class FindcandComponent implements OnInit {
    message: string = '';
    location: string = '';
    status: string = '';
    jobdescriptionUploaded: boolean = false;
    cities: City[] = [];
    isUploading: boolean = false;
    uploadProgress: number = 0;


    candidates: Candidate[] = [];
    uploadSuccessful: boolean = false;
    showCandidateList: boolean = false; 
  
    // File upload properties
    selectedFile: File | null = null;
    selectedFileName: string = '';
    fileChosen: boolean = false;
  
    // Auto-suggestion properties
    showSuggestions: boolean = false;
    filteredCities: City[] = [];
    activeSuggestionIndex: number = -1;
    userEmail: string = ''; // Store user email

  
    private searchSubject: Subject<string> = new Subject();
  
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
    constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object,private router: Router) {}
  
    ngOnInit(): void {
      this.loadCities();
      this.initializeSearch();
  
      // Load user email from localStorage if in browser
      if (isPlatformBrowser(this.platformId)) {
        try {
          const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
          this.userEmail = userDetails.email || ''; // Set userEmail from user details
        } catch (error) {
          console.error('Error parsing user details from localStorage:', error);
        }
      }
    }

    navigateToJobListing(): void {
      this.router.navigate(['/update-job-listing']); // Adjust the path if needed
    }
  
    initializeSearch(): void {
      this.searchSubject.pipe(debounceTime(300)).subscribe(searchText => {
        this.location = searchText;
        this.filterCities();
      });
    }
  
    loadCities(): void {
      this.getCities().subscribe(
        data => {
          this.cities = data;
        },
        error => {
          console.error('Error fetching cities:', error);
        }
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
    
        const allowedTypes = ['application/pdf', 'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
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
      return this.selectedFile !== null && this.location.trim() !== '' && this.status.trim() !== '';
    }
  
    onSubmit(): void {
      if (!this.isFormValid() || !this.selectedFile) {
        alert('Please select a file and enter a location.');
        return;
      }
    
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('email', this.userEmail);
      formData.append('status', this.status);
      formData.append('commonId', 'cvsmart');
      formData.append('location', this.location);
    
      console.log('Form Data:', formData);

      this.http.post('https://cv-smart-nirja-joshis-projects.vercel.app/api/v1/job_description/add_job_description', formData)
        .subscribe(
          (response: any) => {
            alert(response.message);
            this.message = 'Job description submitted successfully!';
            this.fileChosen = false;
            this.uploadSuccessful = true;
          },
          (error: any) => {
            console.error('Error:', error);
            alert('An error occurred while submitting the job description.');
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

    fetchCandidates(): void {
      const userDetails = JSON.parse(localStorage.getItem('userDetails') || '{}');
      const userId = userDetails.id || '';  // Use 'id' here
      const commonId = 'cvsmart';  // This can be dynamic if needed
      const apiUrl = `https://cv-smart-nirja-joshis-projects.vercel.app/api/v1//matching-candidates?userId=${userId}&commonId=${commonId}`;
      
      console.log('Fetching candidates for userId:', userId);
      console.log('API URL:', apiUrl);
    
      this.http.get<Candidate[]>(apiUrl).subscribe(
        (response: Candidate[]) => {
          console.log('Received candidate response:', response);
          this.candidates = response;  // Assuming candidates is a property in your component
          this.showCandidateList = true;  // Toggle visibility of the candidate list if needed
        },
        (error) => {
          console.error('Error fetching candidates:', error.message || error);
          alert('An error occurred while fetching candidate listings.');
        }
      );
    }


    findCandidates(): void {
      console.log('isFormValid:', this.isFormValid(), 'uploadSuccessful:', this.uploadSuccessful);
      
      if (this.isFormValid() && this.uploadSuccessful) {
        this.fetchCandidates();
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
  