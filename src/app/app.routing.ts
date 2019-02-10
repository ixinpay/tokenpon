import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/index';
import { LoginComponent } from './login/index';
import { AuthGuard } from './_guards/index';
// import { ContractComponent } from './contract/contract.component';
import { ClaimComponent } from './claim/claim.component';
import { ClaimDetailComponent } from './claim-detail/claim-detail.component';
import { ListingsComponent } from './listings/listings.component';
import { ProfileComponent } from './profile/profile.component';
import {ActivationComponent} from './activation/activation.component'
import { NewestComponent } from './newest/newest.component';
const appRoutes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    // { path: 'landing', component: LandingComponent },
    { path: 'activate', component: ActivationComponent },
    { path: 'home', component: HomeComponent, children:[
        { path: '', component: ListingsComponent },
        { path: 'listing:/cat', component: ListingsComponent },
        // { path: 'contract', component: ContractComponent, canActivate: [AuthGuard] },
        { path: 'claim', component: ClaimComponent },
        { path: 'claim-detail', component: ClaimDetailComponent }
    ] },
    // {path: 'chainpost', component: ChainPostComponent, children:[
    //   { path: '', component: PostListingsComponent },
    //   { path: 'Post-listings', component: PostListingsComponent },
    //   { path: 'Post-listings:/cat', component: PostListingsComponent },
    //   { path: 'Post', component: PostComponent},
    //   { path: 'Post-detail', component: PostDetailsComponent }

    // ]},
    { path: 'profile', component: ProfileComponent },
    { path: 'login', component: LoginComponent },
    // { path: 'register', component: RegisterComponent },

    // daily newest page
    { path: 'newest', component: NewestComponent},
    // otherwise redirect to home
    { path: '**', redirectTo: '/home' }

];

export const routing = RouterModule.forRoot(appRoutes);
