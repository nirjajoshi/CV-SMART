import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FindcandComponent } from './findcand/findcand.component';
import { FindjobComponent } from './findjob/findjob.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
    {
        path:'home',
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

  

];
