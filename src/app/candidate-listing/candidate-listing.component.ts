import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Candidate } from './candidate.model';

@Component({
  selector: 'app-candidate-listing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './candidate-listing.component.html',
  styleUrl: './candidate-listing.component.css'
})
export class CandidateListingComponent {
  // Accept candidates as an input from the parent component
  @Input() candidates: Candidate[] = [];

  // Function to handle viewing resume
  viewResume(cloudinaryUrl: string): void {
    window.open(cloudinaryUrl, '_blank');  // Remove the link after clicking
}

contactCandidate(email: string) {
  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`;
  window.open(gmailLink, '_blank'); // Opens Gmail's compose window in a new tab
}

}
