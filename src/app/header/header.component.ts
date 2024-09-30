import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient,HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 

interface UserDetails {
  id: string; // Assuming id is of type string, adjust if necessary
  email: string;
  status: string;
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
  userDetails: UserDetails | null = null;
  isUserDetailsOpen = false;

  // Login data model
  loginData = {
    email: '',
    password: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      // Check if the user is already logged in by checking the token in localStorage
      const token = localStorage.getItem('accessToken');
      if (token) {
        const user = localStorage.getItem('userDetails');
        if (user) {
          this.userDetails = JSON.parse(user) as UserDetails;
          this.isAuthenticated = true;
          console.log('User is authenticated on init:', this.userDetails); // For debugging
        }
      }
    }
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
        this.userDetails = response.user as UserDetails; // Changed from response.userDetails to response.user
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
    this.userDetails = null; // Clear userDetails after the logout request
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userDetails');
    this.router.navigate(['']); // Optionally navigate to the home or login page after logout
}
  showUserDetails() {
    this.isUserDetailsOpen = !this.isUserDetailsOpen; // Toggle visibility of user details box
  }

}
