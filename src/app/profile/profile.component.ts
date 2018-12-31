import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { ToasterService } from 'angular2-toaster';
import { OothService } from '../_services';
import { UserService, AlertService, BigchanDbService, MongoService, SwarmService } from '../_services/index';
import { TranslateService } from '@ngx-translate/core';
import { SupoerNode, Claim, Vote } from '../_models/index'
import { Globals } from 'app/globals';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { environment } from 'environments/environment';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  regionDisplayName: string = null;
  inBusinessEdit = false;
  // model: any = {};
  showPassword = false;
  userName: string;
  tokenBalance: number;
  accountNumber: string;
  profilePages: string[];
  selectedPage: string;
  accountEmail: string;
  toAddress: string;
  token: number;
  supernodes: SupoerNode[];
  //from claim page
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
  //end claim page
  constructor(private oothService: OothService, private route: ActivatedRoute
    , private toasterService: ToasterService, private translate: TranslateService,
    private router: Router,
    private userService: UserService, private bigchaindbService: BigchanDbService,
    private globals: Globals, private mongoService: MongoService,
    private alertService: AlertService,
    private http: Http, private swarmService: SwarmService) {
      
    this.accountNumber = localStorage.getItem("currentUserAccount");
    this.accountEmail = localStorage.getItem("currentUserEmail");
    this.route.queryParams.subscribe(params => {
      this.userName = params["user"];
    });
    this.profilePages = new Array("Account Information", "Business Profile", "Account Settings");
    this.selectedPage = this.profilePages[0];
    //get user data
    this.oothService.getUser()
      .then(res =>{
        this.model = res;
        console.log(this.model.local)
        console.log(this.model.local.region)
      });
    this.oothService.getInfo()
      .then(res => {
        // console.log(res.supernodes);
        this.supernodes = [];
        for (let node of res.supernodes) {
          for (let key in node) {
            console.log("      key:", key, "value:", node[key]);
            this.supernodes.push(new SupoerNode(key, node[key]));
            //get region display string
            if(this.model.local.region === key){
              this.regionDisplayName = node[key];
            }
          }
        }
        // this.supernodes.forEach(node => {
        //   console.log(node.key + ":" + node.region);
        // });
      });
    // let balanceSession = localStorage.getItem('tokenBalance');
    //     if (balanceSession) {
    //       this.tokenBalance = Number.parseFloat(balanceSession);
    //       console.log("session balance=" + balanceSession)
    //     }
    //     else {
    //       this.oothService.getTokenBalance(this.accountNumber)
    //         .then(balance => {
    //           console.log("balance=" + balance)
    //           this.tokenBalance = balance;
    //         });
    //     }
    this.currentUser = localStorage.getItem('currentUser');
    this.model.submitBy = this.currentUser;

    this.http.get('/assets/cat.json')
      .subscribe(data => {
        this.categories = data.json();
        //console.log(data);

      });

    this.http.get('/assets/country.json')
      .subscribe(data => {
        this.countries = data.json();
        //console.log(data);
      });
  }
  togglePass() {
    this.showPassword = !this.showPassword;
  }
  sendToken() {
    //if(confirm("Are you sure you want to transfer tokens to another account?")) {
    //alert("Sending..")
    console.log(this.token)
    this.oothService.transferToken(this.toAddress, this.token)
      .then(res => {
        if (res.status == 200) {
          this.translate.get('Tokens transferred successfully!')
            .subscribe(trans => {
              console.log(trans);
              this.toasterService.pop("success", "Tokens transferred successfully!");
            });
        }
        else {
          this.translate.get('Failed to transfer tokens!')
            .subscribe(trans => {
              console.log(trans);
              this.toasterService.pop("error", "Failed to transfer tokens!");
            });
        }
      });
    //}    
  }
  onPageClick(value) {
    // console.log(value);
    this.selectedPage = value.trim();
  }
  // updateProfile(){
  //   this.inEdit = !this.inEdit;
  //   if(!this.inEdit){
  //     console.log(this.model.local.region);
  //     this.oothService.onUpdateUser(this.model.local.region)
  //     .then(() => {this.getRegionDisplayNameByKey(this.model.local.region);});
  //   }
  // }
  getRegionDisplayNameByKey(key: string) {
    for (let node of this.supernodes) {     
        //get region display string
        if(node.key === key){
          this.regionDisplayName = node.region;
          return;        
      }
    }
  }
  ngOnInit() {
    this.oothService.getTokenBalance(this.accountNumber)
      .then(balance => {
        console.log("balance=" + balance)
        this.tokenBalance = balance;
      });
  }

  //update merchant profile
  MainCategoryDropDownChanged(newValue: string) {
    // console.log(newValue);

    this.http.get('/assets/cat.json')
      .subscribe(data => {
        this.catarr = data.json().filter((item) => item.Description == newValue);

        this.maincategoryid = this.catarr[0].Category;
        // console.log(this.maincategoryid);
      });
    this.http.get('/assets/subCat.json')
      .subscribe(data => {
        this.subcategories = data.json().filter((item) => item.Category == this.maincategoryid);



        // console.log(this.subcategories);
      });

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
        if(this.files.length >= environment.chainPageImageMaxCount){
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
            console.log(Math.max.apply(Math, this.files.map(function(obj){return obj.id;})))
            id = Math.max.apply(Math, this.files.map(function(obj){return obj.id;})) + 1;
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
    this.model.postedBy = this.currentUser;
    this.model.postedTime = Date.now();
    //this.model.notification = this.toNotify;    
    console.log(this.model.notification)
    if (this.isUpdate == true) {
      // console.log(this.model);
      this.model.appId = this.globals.ChainpageAppId;
      this.mongoService.updateProfile(this.model)
        .subscribe(response => {
          // console.log(response);
          this.toasterService.pop('success', 'Update successful');
          // this.router.navigate(['/home/claim-detail'], { queryParams: { id: this.claimId } });
        },
          err => {
            this.toasterService.pop("error", "fail to update listing");
          }
        );
    }
    else {
      //upload to mongodb
      // console.log(this.model);
      this.model.appId = this.globals.ChainpageAppId;
      this.mongoService.saveProfile(this.model)
        .subscribe(
          response => {
            console.log(response);
            if (response.status === 200) {
              let id: String = JSON.parse(JSON.stringify(response))._body;
              id = id.replace(/"/g, "");
              this.toasterService.pop('success', 'Submit successful');
              // this.router.navigate(['/home/claim-detail'], { queryParams: { id: id } });
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
  updateBusinessProfile() {
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
  countryDropDownChanged(value: any) {
    if (value == "2") {
      this.state_province = this.provinces;
    }
    else {
      this.state_province = this.states;
    }
  }
  test() {
    this.model = new Claim("John", "John Business", "123 abc st.", "DC", "DC", "20001",
      "USA", "test@test.com", "123-123-1234", "http://www.test.com", "Baby", "DC", "9-5",
      "Food & Drink", "Group Purchase", this.globals.chainFormName, this.currentUser, Date.now()
      , new Array<Comment>(), new Array<Vote>());
  }
  toggleBusinessEdit(){
    this.inBusinessEdit = !this.inBusinessEdit;
  }
  //end of update merchant profile
}
