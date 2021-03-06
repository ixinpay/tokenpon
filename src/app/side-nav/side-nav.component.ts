import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { User, Claim } from '../_models/index';
import { Globals } from '../globals'
import { AuthenticationService } from '../_services/index';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
// import { HttpRequest } from '@angular/common/http';
import 'rxjs/add/operator/switchMap';
import { filter } from 'rxjs/operators';
import { ISubscription } from "rxjs/Subscription";
import { isNgTemplate } from '@angular/compiler';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {
  private subscription: ISubscription;
  categories: any[] = [];
  subcategories: any[] = [];
  returnUrl: string;
  catParam = "";
//variable to hold boolean value to style1
isClass1Visible: false;
//variable to hold boolean value to style2
isClass2Visible: false;

  constructor(
    private http: Http, private globals: Globals,
    private authenticationService: AuthenticationService, private router: Router,
    private route: ActivatedRoute, private translate: TranslateService) {
    this.http.get('/assets/cat.json')
      .subscribe(data => {
        this.categories = data.json();
         for(let cat of this.categories){
          cat.subcategories = [];
          let param = cat.Category
          this.http.get('/assets/subCat.json')
          .subscribe(data => {
            cat.subcategories = data.json().filter((item)=> item.Category == param);
          })
         }
      });
  }
  
  OpenSection2(item)
  {
      this.catParam = item;
      console.log("----CatID Param Value---------"+this.catParam);
      
      this.http.get('/assets/subCat.json')
        .subscribe(data => {
          this.subcategories = data.json().filter((item)=> item.Category == this.catParam);
          console.log(this.subcategories);
        });

  }
  toggleMenu(){
    $('#sidebar').toggleClass('active');
    $('#btnClose').toggleClass('active');
    // if($('#sidebar').hasClass('active')) {
    //   $('#sidebarCollapse').html('>')
    // }
    // else{
    //   $('#sidebarCollapse').html('<')
    // }
    // $('#sidebarCollapse').toggleClass('active');
}
  ngOnInit() {
  }

}
