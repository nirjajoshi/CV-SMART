import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-listing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-listing.component.html',
  styleUrls:[ './job-listing.component.css']
})
export class JobListingComponent {
 // Accept jobs as an input from the parent component
 @Input() jobs: any[] = [];

 // Function to handle applying for a job
 apply(jobId: string) {
   console.log('Applying for job with ID:', jobId);
   // You can trigger the apply action here (e.g., calling an API)
 }

 // Function to handle viewing job description
 viewJobDescription(fileUrl: string) {
   window.open(fileUrl, '_blank'); // Opens the file in a new browser tab
 }


}
