import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpClientModule,HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 

interface UserDetails {
  id: string; // Assuming id is of type string, adjust if necessary
  email: string;
  status: string;
}

interface UpdateStatusResponse {
  message: string; // Adjust based on your API response structure
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule,NgIf,CommonModule,HttpClientModule,FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  // role='admin'
  isMenuOpen = false;
  isLoginModalOpen = false;
  isAuthenticated = false;
  isUserDetailsOpen = false;
  showStatusOptions = false;
  userDetails: UserDetails = { id: '', email: '', status: '' };
  // Login data model
  loginData = {email: '',password: ''};
  selectedStatus: string='';

  constructor(private http: HttpClient, private router: Router) {}

  // Method to update the user status
  updateStatus(newStatus: string) {
    this.http.post<UpdateStatusResponse>('http://localhost:8000/api/v1/users/update-status', { status: newStatus })
      .subscribe(
        (response: UpdateStatusResponse) => {
          console.log('Status updated successfully', response);
        },
        (error: HttpErrorResponse) => {
          console.error('Error updating status', error);
        }
      );
  }
    // Method to update the user status
    saveStatus() {
      if (this.selectedStatus && this.userDetails.id) {
        this.http.post<UpdateStatusResponse>('http://localhost:8000/api/v1/users/save-status', {
          userId: this.userDetails.id,
          status: this.selectedStatus,
        }).subscribe(
          (response) => {
            console.log('Status updated successfully:', response);
            this.userDetails.status = this.selectedStatus; // Update the local user details
            this.showStatusOptions = false; // Close the dropdown
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
    ngOnInit() {
      const token = this.getLocalStorageItem('accessToken');
      if (token) {
        const user = this.getLocalStorageItem('userDetails');
        if (user) {
          this.userDetails = JSON.parse(user) as UserDetails;
          this.isAuthenticated = true;
          console.log('User is authenticated on init:', this.userDetails); // For debugging
        }
      }
    }
  
    // Utility function to access localStorage safely
    private getLocalStorageItem(key: string): string | null {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null; // Return null if localStorage is not available
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

  showUserDetails() {
    this.isUserDetailsOpen = !this.isUserDetailsOpen; // Toggle visibility of user details box
  }

  toggleStatusOptions() {
    this.showStatusOptions = !this.showStatusOptions;
  }
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserDetails() {
    this.isUserDetailsOpen = !this.isUserDetailsOpen;
  }


  toggleLoginModal() {
    this.isLoginModalOpen = !this.isLoginModalOpen;
    this.isUserDetailsOpen = false; 
  }


  login() {
    if (!this.loginData.email || !this.loginData.password) {
      alert('Please enter both email and password.');
      return;
    }
    this.http.post('http://localhost:8000/api/v1/users/login', this.loginData).subscribe(
      (response: any) => {
        this.isAuthenticated = true;
        this.userDetails = response.user; // Changed from response.userDetails to response.user
        this.isLoginModalOpen = false;
        // Store the token and userDetails in localStorage
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('userDetails', JSON.stringify(response.user)); // Ensure 'userDetails' key is used
        this.router.navigate(['']);
        this.isUserDetailsOpen = true;
        console.log('Login successful:', this.userDetails); // For debugging
      },
      (error) => {
        alert('Login failed: ' + (error.error.message || 'Please try again.'));
        console.error('Login error:', error); // For debugging
      }
    );
  }

  logout() {
    // Check if userDetails is available before proceeding
    if (this.userDetails) {
        this.http.post('http://localhost:8000/api/v1/users/logout', { userId: this.userDetails.id }).subscribe(
            (response: any) => {
                console.log(response.message); // Optionally log the message
            },
            (error) => {
                alert('Logout failed: ' + (error.error.message || 'Please try again.'));
            }
        );
    } else {
        console.error("User details are not available for logout.");
    }

    // Clear user authentication data
    this.isAuthenticated = false;
    this.userDetails = { id: '', email: '', status: '' }; // Reset userDetails // Clear userDetails after the logout request
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userDetails');
    this.router.navigate(['']); // Optionally navigate to the home or login page after logout
}
 

}
