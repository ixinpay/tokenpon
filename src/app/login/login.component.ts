import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService, OothService } from '../_services/index';
import { Globals } from '../globals'
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';
@Component({
    moduleId: module.id.toString(),
    templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {
    model: any = {};
    loading = false;
    returnUrl: string;
    phoneLogin: boolean = true; // true = phone number, false = username/email

    constructor(
        private globals: Globals, private oothService: OothService,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        private toasterService: ToasterService) { }

    ngOnInit() {
        // reset login status
        this.authenticationService.logout();

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }
    toggleLogin(){
        this.phoneLogin = !this.phoneLogin;
    }
    login() {
        this.oothService.Logout();
        let userid = "";
        if(!this.phoneLogin){
            userid = this.model.email
        }
        else{
            userid = this.model.phone.substring(1);
        }
        this.oothService.Login(userid, this.model.password, this.phoneLogin)
            .then(res => {//console.log(this.model.email + " " + this.model.password)
                console.log(res)
                if (res.status === 'error') {
                    // console.log("error: "+res.status)
                    this.toasterService.pop("error", res.message.message);
                    this.loading = false;
                }
                else {
                    console.log("redirect to: " + this.returnUrl);
                    // var arr = this.returnUrl.split("?");
                    // if(arr.length == 1){
                    //     this.router.navigate([arr[0]]); 
                    // }   
                    // else if(arr.length > 1){
                    this.router.navigateByUrl(this.returnUrl);
                    // }               
                }
            })
            .catch(error => {
                this.toasterService.pop("error", error);
            });
    }
}
