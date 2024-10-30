import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
export interface updateJob {
  id: string;
  title: string;
  status: string;
  // Add other properties as needed
}

@Component({
  selector: 'app-update-job-listing',
  standalone: true,
  imports: [FormsModule,CommonModule  ],
  templateUrl: './update-job-listing.component.html',
  styleUrl: './update-job-listing.component.css'
})
export class UpdateJobListingComponent {
  updatejobs: updateJob[] = [];
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.fetchupdateJobs();
  }
    fetchupdateJobs(): void {
      this.http.get<updateJob[]>('http://localhost:8000/api/v1/jobs')
        .subscribe(
          (response: updateJob[]) => {
            this.updatejobs = response;
          },
          (error) => {
            console.error('Error fetching jobs:', error);
          }
        );
    }

    updateJobStatus(jobId: string, newStatus: string): void {
      const apiUrl = `http://localhost:8000/api/v1/jobs/${jobId}/status`;
      this.http.put(apiUrl, { status: newStatus })
        .subscribe(
          () => {
            alert('Status updated successfully!');
            this.fetchupdateJobs(); // Refresh the job list
          },
          (error) => {
            console.error('Error updating status:', error);
            alert('An error occurred while updating the status.');
          }
        );
    }
  }


