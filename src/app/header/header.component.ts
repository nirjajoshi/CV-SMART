import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';  
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpClientModule,HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 

interface UserDetails {
  id: string;
  email: string;
  status: string;
  // Add other fields as necessary
}

interface LoginResponse {
  accessToken: string;
  user: UserDetails;
}

interface LogoutResponse {
  message: string;
}

interface UpdateStatusResponse {
  message: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule,NgIf,CommonModule,HttpClientModule,FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
  isMenuOpen = false;
  isLoginModalOpen = false;
  isAuthenticated = false;
  isUserDetailsOpen = false;
  showStatusOptions = false;
  
  userDetails: UserDetails = { id: '', email: '', status: '' };
  loginData = { email: '', password: '' };
  selectedStatus: string = '';
  
  isAdmin = false;
  isCandidate = false;
  isCompany = false;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = this.getLocalStorageItem('accessToken');
    if (token) {
      const user = this.getLocalStorageItem('userDetails');
      if (user) {
        this.userDetails = JSON.parse(user) as UserDetails;
        this.isAuthenticated = true;
        this.setUserRole(this.userDetails.status);
        console.log('User is authenticated on init:', this.userDetails); // For debugging
      }
    }
  }

  // Determine user role based on status
  private setUserRole(status: string) {
    if (status === 'admin') {
      this.isAdmin = true;
      this.isCandidate = false;
      this.isCompany = false;
    } else if (status === 'open_to_network' || status === 'not_open_to_network') {
      this.isCandidate = true;
      this.isCompany = false;
      this.isAdmin = false;
    } else if (status === 'hiring' || status === 'not_hiring') {
      this.isCompany = true;
      this.isCandidate = false;
      this.isAdmin = false; 
    } else {
      this.isAdmin = false;
      this.isCandidate = false;
      this.isCompany = false;
    }
  }

  // Toggle methods
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleLoginModal() {
    this.isLoginModalOpen = !this.isLoginModalOpen;
    this.isUserDetailsOpen = false; 
  }

  showUserDetails() {
    this.isUserDetailsOpen = !this.isUserDetailsOpen;
  }

  toggleStatusOptions() {
    this.showStatusOptions = !this.showStatusOptions;
  }

  login() {
    // Validate email and password
    if (!this.loginData.email || !this.loginData.password) {
      alert('Please enter both email and password.');
      return;
    }
  
    // Make HTTP POST request to login
    this.http.post<LoginResponse>('https://cv-smart-l56k8qczd-nirja-joshis-projects.vercel.app/api/v1/users/login', this.loginData).subscribe(
      (response) => {
        // Check for valid response
        if (response && response.accessToken && response.user) {
          this.isAuthenticated = true;
          this.userDetails = response.user;
          this.setUserRole(this.userDetails.status);
          this.isLoginModalOpen = false;
  
          // Store the token and userDetails in localStorage
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('userDetails', JSON.stringify({
            id: response.user.id,  // Use 'id' instead of 'userId'
            email: response.user.email,
            status: response.user.status
          }));
  
          // Navigate to the home page
          this.router.navigate(['']);
          this.isUserDetailsOpen = true;
          console.log('Login successful:', this.userDetails); // For debugging
        } else {
          alert('Invalid login response. Please try again.');
          console.error('Invalid login response:', response);
        }
      },
      (error: HttpErrorResponse) => {
        // Handle login error
        alert('Login failed: ' + (error.error.message || 'Please try again.'));
        console.error('Login error:', error); // For debugging
      }
    );
  }

  // Logout method
  logout() {
    if (this.userDetails && this.userDetails.id) {
      this.http.post<LogoutResponse>('https://cv-smart-nirja-joshis-projects.vercel.app/api/v1/users/logout', { userId: this.userDetails.id }).subscribe(
        (response) => {
          console.log(response.message); // Optionally log the message
          this.clearAuthentication();
        },
        (error: HttpErrorResponse) => {
          alert('Logout failed: ' + (error.error.message || 'Please try again.'));
          console.error('Logout error:', error);
          this.clearAuthentication(); // Proceed to clear authentication even if logout API fails
        }
      );
    } else {
      console.error("User details are not available for logout.");
      this.clearAuthentication();
    }
  }

  // Clear authentication data
  private clearAuthentication() {
    this.isAuthenticated = false;
    this.userDetails = { id: '', email: '', status: '' };
    this.isAdmin = false;
    this.isCandidate = false;
    this.isCompany = false;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userDetails');
    this.router.navigate(['']);
  }

  // Save Status method
  saveStatus() {
    if (this.selectedStatus && this.userDetails.id) {
      this.http.post<UpdateStatusResponse>('https://cv-smart-nirja-joshis-projects.vercel.app/api/v1/users/save-status', {
        userId: this.userDetails.id,
        status: this.selectedStatus,
      }).subscribe(
        (response) => {
          console.log('Status updated successfully:', response);
          this.userDetails.status = this.selectedStatus; // Update the local user details
          this.setUserRole(this.selectedStatus); // Update role flags
          this.showStatusOptions = false; // Close the dropdown
          // Update localStorage with new user details
          localStorage.setItem('userDetails', JSON.stringify(this.userDetails));
        },
        (error: HttpErrorResponse) => {
          alert('Error updating status: ' + (error.error.message || 'Please try again.'));
          console.error('Error:', error);
        }
      );
    } else {
      alert('Please select a valid status.');
    }
  }

  // Utility functions for localStorage
  private getLocalStorageItem(key: string): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setLocalStorageItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  private removeLocalStorageItem(key: string): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}


