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
  profileModel: any = {};
  private albums: any[] = [];
  productDescription: string;

  constructor(
    private router: Router, private route: ActivatedRoute, private translate: TranslateService,
    private userService: UserService, private bigchaindbService: BigchanDbService,
    private globals: Globals, private mongoService: MongoService,
    private alertService: AlertService, private toasterService: ToasterService,
    private http: Http, private swarmService: SwarmService
  ) {
    this.currentUser = localStorage.getItem('currentUser');
    this.model.submitBy = this.currentUser;
    this.route.queryParams.subscribe(params => {
      // console.log(params['id']);
      this.claimId = params['id'];
      if (this.claimId) {
        this.getDetails(this.claimId);
      }
    });
    this.getProfileData();
  }
  //get user profile data
  getProfileData() {
    this.mongoService.GetProfile(this.currentUser, this.globals.TokenponAppId)
      .subscribe(response => {
        if (response.status == 200) {
          console.log(response);
          this.profileModel = response.json();
          console.log(this.profileModel);
        }
      });
    if (this.profileModel.pictures !== undefined) {
      this.swarmService.getFileUrls(this.profileModel.pictures)
        .forEach(img => {
          const src = img;
          //const caption = 'Image caption here';
          const thumb = img;
          const album = {
            src: src,
            //caption: caption,
            thumb: thumb
          };

          this.albums.push(album);
        });
    }
  }
  detectFiles(event) {
    // this.urls = [];
    // this.files = [];
    this.isOversize = false;
    this.isOverTotal = false;
    this.isAlreadyAdded = false;
    let filesToUpload = event.target.files || event.srcElement.files;

    if (filesToUpload) {
      for (let file of filesToUpload) {
        //reach max image allowed
        if (this.files.length >= environment.chainPageImageMaxCount) {
          this.isOverTotal = true;
          return;
        }
        //skip file >2M
        if (file.size > environment.chainPageImageMaxSize) {
          console.log("file size: " + file.size)
          this.isOversize = true;
          continue;
        }
        else {
          let id: number;
          //if no files are selected yet, just insert the files to array
          if (this.files === undefined || this.files.length === 0) {
            id = 0;
            this.files.push({ "id": id, "file": file });
            this.fileNames.push({ "id": id, "filename": file.name });
            let reader = new FileReader();
            reader.onload = (e: any) => {
              this.urls.push({ "id": id, "url": e.target.result });
            }
            reader.readAsDataURL(file);
          }
          else {
            //get set id = max(id) + 1
            console.log(Math.max.apply(Math, this.files.map(function (obj) { return obj.id; })))
            id = Math.max.apply(Math, this.files.map(function (obj) { return obj.id; })) + 1;
            //only add files which are not in the array yet
            if (!this.fileAlreadyAdded(file.name)) {
              this.files.push({ "id": id, "file": file });
              this.fileNames.push({ "id": id, "filename": file.name });
              let reader = new FileReader();
              reader.onload = (e: any) => {
                this.urls.push({ "id": id, "url": e.target.result });
              }
              reader.readAsDataURL(file);
            }
          }
        }
      }
    }
    console.log(this.urls);
    console.log(this.files);
    console.log(this.fileNames);
  }
  fileAlreadyAdded(fileName: String): boolean {
    // console.log(fileName)
    if (this.fileNames == undefined || this.fileNames.length == 0) {
      return false;
    }
    else {
      for (var i = 0; i < this.fileNames.length; i++) {
        if (this.fileNames[i].filename == fileName) {
          console.log(this.fileNames[i].filename + " : " + fileName)
          return this.isAlreadyAdded = true;
        }
      }
    }
    return false;
  }
  deleteFile(url) {
    // console.log(url)
    //remove from urls (remove from display)
    this.urls = this.urls.filter(ele => ele.id !== url.id);
    //remove from files (remove from upload)
    this.files = this.files.filter(ele => ele.id !== url.id);
    //remove from files (remove from upload)
    this.fileNames = this.fileNames.filter(ele => ele.id !== url.id);
    this.isOversize = false;
    this.isOverTotal = false;
    this.isAlreadyAdded = false;
    // console.log("urls after delete:");
    // console.log(this.urls);
    // console.log("files after delete:");
    // console.log(this.files);
    // console.log("fileNames after delete:");
    // console.log(this.fileNames);
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
  getDetails(id: string) {
    this.mongoService.GetListing(id, this.globals.TokenponAppId)
      .subscribe(response => {
        // console.log(response)
        this.model = response.json();
        this.discountArray = this.model.discounts;
        console.log(this.model.notification);
        let id = -1;
        // this.swarmService.getFileUrls(this.model.pictures)
        //   .forEach(url => {
        //     console.log("url: " + url);
        //     this.urls.push({ "id": id, "url": url });
        //     this.files.push({ "id": id, "file": url });
        //     id--;
        //   });
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
  uploadFiles() {
    //upload pictures first
    this.swarmService.uploadFiles(this.files)
      .subscribe(res => {
        console.log(res);
        this.model.pictures = res
        // after uploading pictures, upload data
        this.uploadData();
      },
        err => {
          this.toasterService.pop("error", "fail to upload pictures")
        }
      );
  }
  uploadData() {
    // set the upload time stamp
    delete this.model["__v"]
    // console.log("model = " + JSON.stringify(this.model));
    // if (this.model.id === undefined) {
    //   this.model.id = "NA";
    // }
    this.model.appId = this.globals.TokenponAppId;
    this.model.businessName = this.profileModel.businessName;
    this.model.street = this.profileModel.street;
    this.model.city = this.profileModel.city;
    this.model.state = this.profileModel.state;
    this.model.zip = this.profileModel.zip;
    this.model.country = this.profileModel.country;
    this.model.email = this.profileModel.email;
    this.model.phone = this.profileModel.phone;
    this.model.webPage = this.profileModel.webPage;
    this.model.service = this.profileModel.service;
    this.model.servicingArea = this.profileModel.servicingArea;
    this.model.businessHour = this.profileModel.businessHour;
    this.model.businessMainCategory = this.profileModel.businessMainCategory;
    this.model.businessSubCategory = this.profileModel.businessSubCategory;
    this.model.postedBy = this.profileModel.postedBy;
    this.model.pictures = this.profileModel.pictures;
    this.model.notification = this.profileModel.notification;
    this.model.discounts = this.discountArray;
    // this.model.productDescription = this.productDescription;
    //convert discount rate to %
    this.model.discounts.forEach(element => {
      element.discount = (element.discount / 100).toFixed(2);
    });
    this.model.postedTime = Date.now();
    //this.model.notification = this.toNotify;    
    console.log(this.model.notification)
    if (this.isUpdate == true) {
      // console.log(this.model);
      this.model.appId = this.globals.TokenponAppId;
      this.mongoService.updateListing(this.model)
        .subscribe(response => {
          // console.log(response);
          this.toasterService.pop('success', 'Update successful');
          this.router.navigate(['/home/claim-detail'], { queryParams: { id: this.claimId } });
        },
          err => {
            this.toasterService.pop("error", "fail to update listing");
          }
        );
    }
    else {
      //upload to mongodb
      // console.log(this.model);

      this.mongoService.saveListing(this.model)
        .subscribe(
          response => {
            console.log(response);
            if (response.status === 200) {
              let id: String = JSON.parse(JSON.stringify(response))._body;
              id = id.replace(/"/g, "");
              this.toasterService.pop('success', 'Submit successful');
              this.router.navigate(['/home/claim-detail'], { queryParams: { id: id } });
            }
            else {
              this.toasterService.pop("error", "fail to submit listing");
            }
          },
          err => {
            this.toasterService.pop("error", "fail to submit listing");
          }
        );
    }
  }
  async onSubmit() {
    this.submitted = true;

    // if there are pictures to upload
    if (this.files.length > 0) {
      console.log("have pictures to upload")
      this.uploadFiles();
    }
    else {
      console.log("no pictures to upload")
      //set pictures to empty
      this.model.pictures = [];
      this.uploadData();
    }
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
