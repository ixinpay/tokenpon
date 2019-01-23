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
import { NguCarousel, NguCarouselStore } from '@ngu/carousel';
import { Lightbox } from 'ngx-lightbox';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  //ng-carousel
  public carouselBanner: NguCarousel;
  public carouselTileOneItems: Array<any> = [];
  storeCarouselData: NguCarouselStore;

  regionDisplayName: string = null;
  inBusinessEdit = false;
  model: any = {};  
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
  profileModel: any = {};
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
  // isUpdate: boolean = false;
  maincategoryid: this;
  private albums: any[] = [];
  private isRegularAccount: boolean = true;
  private accountTypeList: any[];
  private accountType: string;
  //end claim page
  constructor(private oothService: OothService, private route: ActivatedRoute
    , private toasterService: ToasterService, private translate: TranslateService,
    private router: Router, private lightbox: Lightbox,
    private userService: UserService, private bigchaindbService: BigchanDbService,
    private globals: Globals, private mongoService: MongoService,
    private alertService: AlertService,
    private http: Http, private swarmService: SwarmService) {

    this.accountNumber = localStorage.getItem("currentUserAccount");
    this.accountEmail = localStorage.getItem("currentUserEmail");
    console.log(localStorage.getItem("accountType"));
    this.accountType = localStorage.getItem("accountType");
    this.accountTypeList = this.globals.TokenponAccountType;

    this.route.queryParams.subscribe(params => {
      this.userName = params["user"];
      this.getProfileData();
    });

    this.profilePages = new Array("Account Information", "Account Profile", "Account Settings");
    this.selectedPage = this.profilePages[0];
    //get user data
    this.oothService.getUser()
      .then(res => {
        this.model = res;
        console.log(this.model.local)
        console.log(this.model.local.region)
      });
    //get super node list
    // this.oothService.getInfo()
    //   .then(res => {
    //     // console.log(res.supernodes);
    //     this.supernodes = [];
    //     for (let node of res.supernodes) {
    //       for (let key in node) {
    //         console.log("      key:", key, "value:", node[key]);
    //         this.supernodes.push(new SupoerNode(key, node[key]));
    //         //get region display string
    //         if (this.model.local.region === key) {
    //           this.regionDisplayName = node[key];
    //         }
    //       }
    //     }
    //     // this.supernodes.forEach(node => {
    //     //   console.log(node.key + ":" + node.region);
    //     // });
    //   });

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
  //get user profile data
  getProfileData() {
    this.mongoService.GetProfile(this.userName, this.globals.TokenponAppId)
      .subscribe(response => {
        if (response.status == 200) {
          console.log(response);
          this.profileModel = response.json();
          if (this.accountType == undefined || this.accountType.trim() == ""
            || this.accountType == this.globals.TokenponAccountType[0]) {
            this.isRegularAccount = true;
          }
          else {
            this.isRegularAccount = false;
          }
          console.log(this.profileModel);
          this.onChange(this.profileModel.country);
          this.MainCategoryDropDownChanged(this.profileModel.businessMainCategory);
          // retrieve pictures from SWARM
          // if (this.profileModel.pictures !== undefined) {
          //   this.swarmService.getFileUrls(this.profileModel.pictures)
          //     .forEach(img => {
          //       const src = img;
          //       //const caption = 'Image caption here';
          //       const thumb = img;
          //       const album = {
          //         src: src,
          //         //caption: caption,
          //         thumb: thumb
          //       };
          //       console.log(album);
          //       this.albums.push(album);
          //     });
          // }

          if (this.profileModel.pictures !== undefined) {
            let id = -1;
            this.profileModel.pictures.forEach(url => {
              console.log("url: " + url);
              const src = url;
              //const caption = 'Image caption here';
              const thumb = url;
              const album = {
                src: src,
                //caption: caption,
                thumb: thumb
              };
              this.albums.push(album)
              this.urls.push({ "id": id, "url": url });
              this.files.push({ "id": id, "file": url });
              id--;
            });
          }
        }
      });
  }
  open(index: number): void {
    // open lightbox
    this.lightbox.open(this.albums, index);
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
  //     console.log(this.profileModel.local.region);
  //     this.oothService.onUpdateUser(this.profileModel.local.region)
  //     .then(() => {this.getRegionDisplayNameByKey(this.profileModel.local.region);});
  //   }
  // }
  getRegionDisplayNameByKey(key: string) {
    for (let node of this.supernodes) {
      //get region display string
      if (node.key === key) {
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

    //load picture carousel
    this.carouselBanner = {
      grid: { xs: 2, sm: 3, md: 4, lg: 4, all: 0 },
      speed: 600,
      slide: 1,
      point: {
        visible: true
      },
      load: 2,
      // loop: true,
      touch: true,
      easing: 'ease',
      animation: 'lazy'
    }
    this.carouselTileOneLoad();
  }
  public carouselTileOneLoad() {
    const len = this.carouselTileOneItems.length;
    if (len <= 30) {
      for (let i = len; i < len + 15; i++) {
        // this.carouselTileOneItems.push(
        //   this.imgags[Math.floor(Math.random() * this.imgags.length)]
        // );
        this.carouselTileOneItems = this.albums;
      }
    }
  }
  onMoveData(data) {
    // console.log(data);
  }
  getCarouselData(ent) {
    this.storeCarouselData = ent;
  }
  public myfunc(event: Event) {
    // carouselLoad will trigger this funnction when your load value reaches
    // it is helps to load the data by parts to increase the performance of the app
    // must use feature to all carousel
  }
  onmoveFn(data: NguCarouselStore) {
    console.log(data);
  }
  
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
        if (this.files.length >= environment.BusinessProfileLogoMaxCount) {
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
              // console.log(e.target.result);
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
    // console.log(this.urls);
    // console.log(this.files);
    // console.log(this.fileNames);
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
        this.profileModel.pictures = res
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
    delete this.profileModel["__v"]
    // console.log("profileModel = " + JSON.stringify(this.profileModel));
    // if (this.profileModel.id === undefined) {
    //   this.profileModel.id = "NA";
    // }
    this.profileModel.postedBy = this.currentUser;
    this.profileModel.postedTime = Date.now();
    this.profileModel.accountAddress = this.accountNumber;
    this.profileModel.pictures = this.urls.map(e => e.url);
    //this.profileModel.notification = this.toNotify;    
    console.log(this.profileModel.pictures)
    // if (this.inBusinessEdit == true) {
    // console.log(this.profileModel);
    this.profileModel.appId = this.globals.TokenponAppId;
    // this.mongoService.updateProfile(this.profileModel)
    this.oothService.updateAccountType(localStorage.getItem("currentUserId"), this.accountType)
      .then(response => {
        // console.log(response);
        this.toasterService.pop('success', 'Update successful');
        // this.router.navigate(['/home/claim-detail'], { queryParams: { id: this.claimId } });
      },
        err => {
          this.toasterService.pop("error", "fail to update listing");
        }
      );
    // }
    // else {
    //   //upload to mongodb
    //   // console.log(this.profileModel);
    //   this.profileModel.appId = this.globals.TokenponAppId;
    //   this.mongoService.saveProfile(this.profileModel)
    //     .subscribe(
    //       response => {
    //         console.log(response);
    //         if (response.status === 200) {
    //           let id: String = JSON.parse(JSON.stringify(response))._body;
    //           id = id.replace(/"/g, "");
    //           this.toasterService.pop('success', 'Submit successful');
    //           // this.router.navigate(['/home/claim-detail'], { queryParams: { id: id } });
    //         }
    //         else {
    //           this.toasterService.pop("error", "fail to submit listing");
    //         }
    //       },
    //       err => {
    //         this.toasterService.pop("error", "fail to submit listing");
    //       }
    //     );
    // }
  }
  updateBusinessProfile() {
    this.submitted = true;
    // if there are pictures to upload, upload to SWARM
    // if (this.files.length > 0) {
    //   console.log("have pictures to upload")
    //   this.uploadFiles();
    // }
    // else {
    //   console.log("no pictures to upload")
    //   //set pictures to empty
    //   this.profileModel.pictures = [];
    //   this.uploadData();
    // }
    this.uploadData();
    this.inBusinessEdit = false;
  }
  countryDropDownChanged(value: any) {
    if (value == "2") {
      this.state_province = this.provinces;
    }
    else {
      this.state_province = this.states;
    }
  }
  accountDropDownChanged(value: any) {
    if (value == undefined || value.trim() == "" || value == this.globals.TokenponAccountType[0]) {
      this.isRegularAccount = true;
    }
    else {
      this.isRegularAccount = false;
    }
  }
  test() {
    this.profileModel = new Claim("John", "John Business", "123 abc st.", "DC", "DC", "20001",
      "USA", "test@test.com", "123-123-1234", "http://www.test.com", "Baby", "DC", "9-5",
      "Food & Drink", "Group Purchase", this.globals.chainFormName, Date.now()
      , new Array<Comment>(), new Array<Vote>());
  }
  toggleBusinessEdit() {
    this.inBusinessEdit = !this.inBusinessEdit;
  }
  cancelProfileUpdate() {
    this.inBusinessEdit = false;
    
    console.log(this.inBusinessEdit);
  }
  //end of update merchant profile
}
