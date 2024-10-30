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

 private constantApplyUrl = "https://careers.jio.com/frmJobCategories.aspx?flag=/wASbQn4xyQ="

 // Function to handle applying for a job
 apply(jobId: string) {
  console.log('Applying for job with ID:', jobId);
  // Open the constant apply URL in a new tab
  window.open(this.constantApplyUrl, '_blank');
 }

 // Function to handle viewing job description
 viewJobDescription(cloudinaryUrl: string) {
  window.open(cloudinaryUrl, '_blank'); // Opens the file in a new browser tab
 }


}
