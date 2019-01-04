import { Component, OnInit } from '@angular/core';
import { Claim, User, Vote } from '../_models/index'
import { UserService, AlertService, BigchanDbService, MongoService, SwarmService } from '../_services/index';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { HttpClient } from '@angular/common/http';
//import { driver} from '../../../node_modules/bigchaindb-driver';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../globals'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { Validators, AbstractControl, NG_VALIDATORS } from '@angular/forms';
import { forEach } from '@angular/router/src/utils/collection';
import { environment } from 'environments/environment.prod';
// import { HttpHeaders } from '@angular/common/http';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.css']
})


export class ClaimComponent implements OnInit {
  
  isOversize: boolean = false;
  isOverTotal: boolean = false;
  isAlreadyAdded: boolean = false;
  urls: any[] = [];
  files: any[] = [];
  fileNames: any[] = [];
  currentUser: string;
  model: any = {};
  claims: Claim[] = [];
  submitted = false;
  categories: any[] = [];
  subcategories: any[] = [];
  countries: any[] = [];
  states: any[] = [];
  provinces: any[] = [];
  catarr: any[] = [];
  state_province: any[] = [];
  claimId: string;
  isUpdate: boolean = false;
  maincategoryid: this;
  private discountArray: Array<any> = [];
  private newDiscount: any = {};

  constructor(
    private router: Router, private route: ActivatedRoute, private translate: TranslateService,
    private userService: UserService, private bigchaindbService: BigchanDbService,
    private globals: Globals, private mongoService: MongoService,
    private alertService: AlertService, private toasterService: ToasterService,
    private http: Http, private swarmService: SwarmService
  ) {
    this.currentUser = localStorage.getItem('currentUser');
    this.model.submitBy = this.currentUser;
  }

  onChange(newValue: string) {
    if (newValue.toLowerCase() == "usa") {
      // console.log(newValue);
      this.http.get('/assets/us_states.json')
        .subscribe(data => {
          this.states = data.json();
          this.state_province = this.states;
          //console.log(data);

        });
    }
    else if (newValue.toLowerCase() == "canada") {
      // console.log(newValue);
      this.http.get('/assets/canada_provinces.json')
        .subscribe(data => {
          this.provinces = data.json();
          this.state_province = this.provinces;
          //console.log(data);
        });
    }
  }
  getClaim(id: string) {
    this.mongoService.GetListing(id, this.globals.TokenponAppId)
      .subscribe(response => {
        // console.log(response)
        this.model = response.json();
        console.log(this.model.notification);
        let id = -1;
        this.swarmService.getFileUrls(this.model.pictures)
          .forEach(url => {
            console.log("url: " + url);
            this.urls.push({ "id": id, "url": url });
            this.files.push({ "id": id, "file": url });
            id--;
          });
        this.isUpdate = true;
        // let claimData = JSON.parse(JSON.stringify(data));
        // this.model = claimData.asset.data;
        // if (this.model.id === "NA") {
        //   this.model.id = claimData.id;
        // }
        // console.log(this.model);
        this.onChange(this.model.country);
      });
  }

  async onSubmit() {
    this.submitted = true;
    // if there are pictures to upload
    // if (this.files.length > 0) {
    //   console.log("have pictures to upload")
    //   this.uploadFiles();
    // }
    // else {
    //   console.log("no pictures to upload")
    //   //set pictures to empty
    //   this.model.pictures = [];
    //   this.uploadData();
    // }
  }
  isAuthor(user: string): boolean {
    //console.log(this.currentUser.username == user);
    return this.currentUser == user;
  }
  addDiscount() {
    this.discountArray.push(this.newDiscount)
    this.newDiscount = {};
}

deleteDiscount(index) {
    this.discountArray.splice(index, 1);
}
  ngOnInit() {
    // this.loadAllClaims();
  }

}
