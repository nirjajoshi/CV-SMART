import { Routes } from '@angular/router';
import { FindcandComponent } from './findcand/findcand.component';
import { FindjobComponent } from './findjob/findjob.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegistrationComponent } from './registration/registration.component';
import { HomeComponent } from './home/home.component';
import { UpdateJobListingComponent } from './update-job-listing/update-job-listing.component';

export const routes: Routes = [
    {
        path:'',
        component:HomeComponent
    },
    {
        path:'findcand',
        component:FindcandComponent
    },
    {
        path:'findjob',
        component:FindjobComponent
    },
    {
        path:'dashboard',
        component:DashboardComponent
    },
    { 
        path: 'registration', 
        component: RegistrationComponent
     },{
        path:'update-job-listing',
        component: UpdateJobListingComponent
     }
];
