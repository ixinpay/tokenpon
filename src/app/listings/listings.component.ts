import { Component, OnInit, Input, NgModule, ViewChild } from '@angular/core';
import { UserService, AlertService, SwarmService, MongoService } from '../_services/index';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { Http, Response } from '@angular/http';
import { User, Claim } from '../_models/index';
import { forEach } from '@angular/router/src/utils/collection';
import { Globals } from '../globals'
import { Observable } from 'rxjs/Observable';
// import { HttpRequest } from '@angular/common/http';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import 'rxjs/add/operator/switchMap';
import { filter } from 'rxjs/operators';
import { ISubscription } from "rxjs/Subscription";
import * as alaSQLSpace from 'alasql';
import { error, element } from 'protractor';
import { environment } from 'environments/environment';
import { isNullOrUndefined } from 'util';
import { Title } from '@angular/platform-browser';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// import { AgmCoreModule } from '@agm/core';
import { MouseEvent, GoogleMapsAPIWrapper, AgmMap, LatLngBounds, LatLngBoundsLiteral } from '@agm/core';
import { } from 'googlemaps';
import { Marker } from '../_models/index'
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NotifierService } from 'angular-notifier';

@Component({
  moduleId: module.id.toString(),
  templateUrl: './listings.component.html',
  styleUrls: ['./listings.component.css']
})

export class ListingsComponent implements OnInit {
  @ViewChild('AgmMap') agmMap: AgmMap;
  // map: google.maps.Map;
  protected map: any;

  @Input() catId = 0;
  private subscription: ISubscription;
  // currentUser: User;
  currentUser: string;
  model: any = {};
  imgUrl: String;
  votes: any[] = [];
  claims: any[] = [];
  submitted = false;
  categories: any[] = [];
  countries: any[] = [];
  catParam = "";
  subcatPram = "";
  IDparam = "";
  totalItems: number;
  page: number;
  previousPage: any;
  pageSize: number;
  maxSize: number;
  claimsPage: any[] = [];
  listings: any[] = [];
  likes: number = 0;
  dislikes: number = 0;
  numoflikes: number = 0;
  numofdislikes: number = 0;
  listView: boolean = true;
  showModal: boolean = false;
  // accountType: string;
  isAdmin: boolean = false;

  markers: Marker[] = []
  zoom: number = 10;
  // initial center position for the map
  lat: number;
  lng: number;

  constructor(
    private route: ActivatedRoute, private swarmService: SwarmService,
    private router: Router, private globals: Globals, private mongoService: MongoService,
    private userService: UserService, private toasterService: ToasterService,
    private alertService: AlertService, private titleService: Title,
    private http: Http, private translate: TranslateService, private modalService: NgbModal,
    private notifier: NotifierService
  ) {
    if((sessionStorage.getItem("isAdmin") == null? '' : sessionStorage.getItem("isAdmin").toLowerCase()) == 'true'){
      this.isAdmin = true;
    }
    // this.accountType = sessionStorage.getItem("accountType");
    this.route.queryParams.subscribe(params => {
      // console.log(params['id']);
      let searchText = params['search']
      if (searchText) {
        this.Search(searchText);
      }
    });
  }
  goSearch(text) {
    this.router.navigate(['/home'], { queryParams: { search: text } });
  }
  public getLikeCount(claim: any): number {
    let likeCount = 0;
    claim.votes.forEach(element => {
      // get like counts
      if (element.vote === "like") {
        likeCount++;
      }
    });
    return likeCount;
  }
  private getBusinessName(name?: string): any {
    return (name != null && name != undefined) ? name : "ZZZZZ";
  }
  private showListings(response: Response) {
    this.claims = response.json();
    //filter published = true
    this.claims = this.claims.filter(m => m.published == true || m.published == null || m.published == undefined);
    //filter scope if logged in, show all, otherwise only show public ones (scope = 0)
    if ( this.currentUser == null && this.currentUser == undefined) {
      this.claims = this.claims.filter(m => m.scope == 0 || m.scope == null || m.scope == undefined);
    }

    //sort by business name first
    // this.claims.sort((obj1, obj2) => {
    //   if (this.getBusinessName(obj1.businessName) < this.getBusinessName(obj2.businessName)) {
    //     return -1;
    //   }
    //   if (this.getBusinessName(obj1.businessName) > this.getBusinessName(obj2.businessName)) {
    //     return 1;
    //   }
    //   return 0;
    // });
    //then sort by number of likes
    this.claims.sort((obj1, obj2) => {
      if (this.getLikeCount(obj2) < this.getLikeCount(obj1)) {
        return -1;
      }
      else if (this.getLikeCount(obj2) > this.getLikeCount(obj1)) {
        return 1;
      }
      else {
        if (this.getBusinessName(obj1.businessName) < this.getBusinessName(obj2.businessName)) {
          return -1;
        }
        else if (this.getBusinessName(obj1.businessName) > this.getBusinessName(obj2.businessName)) {
          return 1;
        }
        else {
          return 0;
        }
      }
    });
    // console.log(this.claims[1].businessName + " = " + this.getLikeCount(this.claims[1]))
    this.totalItems = this.claims.length;
    this.model = this.claims;
    // console.log( JSON.stringify(this.model));
    for (var i = 0; i < this.model.length; i++) {
      this.numoflikes = 0;
      this.numofdislikes = 0;
      this.model[i].votes.forEach(element => {
        // console.log(element.vote);
        // get vote counts
        if (element.vote === "like") {
          this.numoflikes++;
        }
        else if (element.vote === "dislike") {
          this.numofdislikes++;
        }
      });
      this.votes[i] = {
        _id: this.model[i]._id,
        likes: this.numoflikes,
        dislikes: this.numofdislikes
      };
    }
    this.listings = [];
    for (var j = 0; j < this.claims.length; j++) {
      // console.log(this.claims[j].pictures[0]);
      this.listings[j] = {
        // imgUrl: imgUrl: this.claims[j].pictures[0],(this.claims[j].pictures[0]) || this.claims[j].pictures[0] == "" ?
        //   "../../assets/linkGearGGold.png" : this.claims[j].pictures[0],
        imgUrl: isNullOrUndefined(this.claims[j].pictures[0]) ? "" : this.claims[j].pictures[0],
        _id: this.claims[j]._id,
        overallTitle: this.claims[j].overallTitle,
        productDescription: this.claims[j].productDescription,
        businessMainCategory: this.claims[j].businessMainCategory,
        businessName: this.claims[j].businessName,
        offers: this.claims[j].discounts.slice(-1), //only show the last deal(best deal)
        service: this.claims[j].service,
        phone: this.claims[j].phone,
        street: this.claims[j].street,
        city: this.claims[j].city,
        state: this.claims[j].state,
        zip: this.claims[j].zip,
        likes: this.votes[j].likes,
        dislikes: this.votes[j].dislikes,
        viewCount: this.claims[j].viewCount == null || this.claims[j].viewCount == undefined ? 0 : this.claims[j].viewCount,
        comments: this.claims[j].comments.length,
        isOwner: this.claims[j].postedBy == this.currentUser
      };
    }
    this.claimsPage = this.listings.slice(0, this.pageSize);
    // console.log(this.claimsPage)
    //get coordinates
    // this.getCoordinates();
  }
  Search(searchTxt: string) {
    // console.log("Search text: " + searchTxt);
    // this.catParam = undefined;
    searchTxt = encodeURI(searchTxt);
    if (searchTxt) {
      this.mongoService.searchListings(searchTxt, this.globals.TokenponAppId)
        .subscribe(response => {
          // console.log(response);
          this.claims = response.json();
          //filter published = true
          this.claims = this.claims.filter(m => m.published == true);
          //filter scope if logged in, show all, otherwise only show public ones (scope = 0)
          if ( this.currentUser == null && this.currentUser == undefined ) {
            this.claims = this.claims.filter(m => m.scope == 0 || m.scope == null || m.scope == undefined);
          }
          this.totalItems = this.claims.length;
          // console.log(this.claims)
          this.model = this.claims;
          // console.log( JSON.stringify(this.model));

          for (var i = 0; i < this.model.length; i++) {
            this.numoflikes = 0;
            this.numofdislikes = 0;

            this.model[i].votes.forEach(element => {
              // console.log(element.vote);
              // get vote counts
              if (element.vote === "like") {
                this.numoflikes++;
              } else if (element.vote === "dislike") {
                this.numofdislikes++;
              }
            });

            this.votes[i] = {
              _id: this.model[i]._id,
              likes: this.numoflikes,
              dislikes: this.numofdislikes
            };
          }

          //  console.log("claims length: " + this.claims.length)
          this.listings = [];
          //  console.log(this.listings);
          for (var j = 0; j < this.claims.length; j++) {
            this.listings[j] = {
              // imgUrl: isNullOrUndefined(this.claims[j].pictures[0]) || this.claims[j].pictures[0] == "" ?
              //   "../../assets/linkGearGGold.png" : this.claims[j].pictures[0],
              imgUrl: isNullOrUndefined(this.claims[j].pictures[0]) ? "" : this.claims[j].pictures[0],
              _id: this.claims[j]._id,
              overallTitle: this.claims[j].overallTitle,
              productDescription: this.claims[j].productDescription,
              businessMainCategory: this.claims[j].businessMainCategory,
              businessName: this.claims[j].businessName,
              // offers: this.claims[j].discounts,
              offers: this.claims[j].discounts.slice(-1), //only show the last deal(best deal)
              service: this.claims[j].service,
              phone: this.claims[j].phone,
              street: this.claims[j].street,
              city: this.claims[j].city,
              state: this.claims[j].state,
              zip: this.claims[j].zip,
              likes: this.votes[j].likes,
              dislikes: this.votes[j].dislikes,
              viewCount: this.claims[j].viewCount == null || this.claims[j].viewCount == undefined ? 0 : this.claims[j].viewCount,
              comments: this.claims[j].comments.length,
              isOwner: this.claims[j].postedBy == this.currentUser
            };
          }
          // console.log(this.listings);
          this.claimsPage = this.listings.slice(0, this.pageSize);
          //console.log("votes:"+JSON.stringify(this.votes));
          //console.log("listings:"+JSON.stringify(this.listings));
        })
    }
    else {
      // console.log("else");
      this.subscription = this.mongoService.GetListings(this.globals.TokenponAppId)
        .subscribe(response => {
          if (response.status == 200) {
            // console.log(response.json());
            this.claims = response.json();
            //filter published = true
            this.claims = this.claims.filter(m => m.published == true);
            //filter scope if logged in, show all, otherwise only show public ones (scope = 0)
            if ( this.currentUser == null && this.currentUser == undefined) {
              this.claims = this.claims.filter(m => m.scope == 0 || m.scope == null || m.scope == undefined);
            }
            this.totalItems = this.claims.length;
            this.model = this.claims;
            // console.log( JSON.stringify(this.model));

            for (var i = 0; i < this.model.length; i++) {
              this.numoflikes = 0;
              this.numofdislikes = 0;

              this.model[i].votes.forEach(element => {
                // console.log(element.vote);
                // get vote counts
                if (element.vote === "like") {
                  this.numoflikes++;
                } else if (element.vote === "dislike") {
                  this.numofdislikes++;
                }
              });

              this.votes[i] = {
                _id: this.model[i]._id,
                likes: this.numoflikes,
                dislikes: this.numofdislikes
              };
            }

            this.listings = [];
            for (var j = 0; j < this.claims.length; j++) {
              this.listings[j] = {
                // imgUrl: isNullOrUndefined(this.claims[j].pictures[0]) || this.claims[j].pictures[0] == "" ?
                //   "../../assets/linkGearGGold.png" : this.claims[j].pictures[0],
                imgUrl: isNullOrUndefined(this.claims[j].pictures[0]) ? "" : this.claims[j].pictures[0],
                _id: this.claims[j]._id,
                overallTitle: this.claims[j].overallTitle,
                productDescription: this.claims[j].productDescription,
                businessMainCategory: this.claims[j].businessMainCategory,
                businessName: this.claims[j].businessName,
                offers: this.claims[j].discounts.slice(-1), //only show the last deal(best deal)
                service: this.claims[j].service,
                phone: this.claims[j].phone,
                street: this.claims[j].street,
                city: this.claims[j].city,
                state: this.claims[j].state,
                zip: this.claims[j].zip,
                likes: this.votes[j].likes,
                dislikes: this.votes[j].dislikes,
                viewCount: this.claims[j].viewCount == null || this.claims[j].viewCount == undefined ? 0 : this.claims[j].viewCount,
                comments: this.claims[j].comments.length,
                isOwner: this.claims[j].postedBy == this.currentUser
              };
            }
            this.claimsPage = this.listings.slice(0, this.pageSize);
            //console.log("votes:"+JSON.stringify(this.votes));
            //console.log("listings:"+JSON.stringify(this.listings));
          }
          else {
            // this.toasterService.pop("error", response.statusText);
            this.notifier.notify("error", response.statusText);
          }
        });
      //
    }
  }

  /**
   *
   * @param pageNum : The number of page selected by users
   * check if we need load a new page
   */
  loadPage(pageNum: number) {
    if (pageNum !== this.previousPage) {
      this.previousPage = pageNum;
      this.loadData(pageNum);
    }
  }

  /**
   *
   * @param pageNum : The number of page
   * load new page data
   */
  loadData(pageNum: number) {
    // console.log("this.pageSize * (pageNum - 1)" + this.pageSize * (pageNum - 1))
    // console.log("this.pageSize * " + this.pageSize * (pageNum - 1) + this.pageSize)


    this.claimsPage = this.listings.slice(this.pageSize * (pageNum - 1), this.pageSize * (pageNum - 1) + this.pageSize)


  }
  public getCountryName(id: number): string {
    var value = "";
    this.countries.forEach(pair => {
      if (pair.ID == id) {
        value = pair.Country;
        //break;
      }
    });
    return value;
  }
  public getCategoryName(id: string): string {
    var value = "";
    this.categories.forEach(pair => {
      //console.log(pair.Country)
      if (pair.Category == id) {
        value = pair.Description;
        //break;
      }
    });
    return value;
  }
  public getCategoryId(name: string): string {
    var value = "";
    this.categories.forEach(pair => {
      //console.log(pair.Country)
      if (pair.Description == name) {
        value = pair.Category;
        //break;
      }
    });
    return value;
  }

  approveClaim(id: number) {
    //alert("approved");
  }

  ngOnInit() {
    //set title
    this.titleService.setTitle("Tokenpon");
    // translate.onLangChange.subscribe((event: LangChangeEvent) => {
    //   console.log("lang changed")
    //   translate.get('page_title').subscribe((res: string) => {
    //     titleService.setTitle(res);
    //   });
    // });

    // this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    this.currentUser = sessionStorage.getItem('currentUser');
    if (this.currentUser) {
      this.model.submitBy = this.currentUser;
    }
    this.subscription = this.http.get('/assets/cat.json')
      .subscribe(data => {
        this.categories = data.json();
        //console.log(data);
      });
    this.subscription = this.http.get('/assets/country.json')
      .subscribe(data => {
        this.countries = data.json();
        //console.log(data);
      });
    //get query param
    this.page = 1;
    this.maxSize = 10;
    this.pageSize = 8;
    this.subscription = this.route.queryParams.subscribe(params => {
      //console.log(params['cat']);
      this.catParam = params['cat'];
      this.subcatPram = params['subcat'];
      // console.log(this.catParam);
      // load listings from BigChainDB
      // this.getAllTransactionsByAsset(this.catParam);
      // load listings from MongoDB
      if (this.catParam) {
        // console.log("here")
        this.subscription = this.mongoService.GetListingsByCat(this.catParam, this.globals.TokenponAppId)
          .subscribe(response => {
            if (response.status == 200) {
              // console.log(response.json());
              this.showListings(response);
            }
            else {
              // this.toasterService.pop("error", response.statusText);
              this.notifier.notify("error", response.statusText);
            }
          })
      }
      else if (this.subcatPram) {
        this.subscription = this.mongoService.GetListingsBySubcat(this.subcatPram, this.globals.TokenponAppId)
          .subscribe(response => {
            if (response.status == 200) {
              // console.log(response.json());
              this.showListings(response);
            }
            else {
              // this.toasterService.pop("error", response.statusText);
              this.notifier.notify("error", response.statusText);
            }
          })
      }
      else {
        // console.log("else");
        this.subscription = this.mongoService.GetListings(this.globals.TokenponAppId)
          .subscribe(response => {
            if (response.status == 200) {
              // console.log(response.json());
              this.showListings(response);
            }
            else {
              // this.toasterService.pop("error", response.statusText);
              this.notifier.notify("error", response.statusText);
            }
          });
      }

    }); console.log(this.markers)
  }
  // ngAfterViewInit() {
  //   //populate markers
  //   this.getCoordinates();
  //   // For center
  //   var mapProp = {
  //     center: new google.maps.LatLng(28.4595, 77.0266),
  //     zoom: 13,
  //     mapTypeId: google.maps.MapTypeId.HYBRID // also use ROADMAP,SATELLITE or TERRAIN
  //   };

  //   this.map = new google.maps.Map(this.gmapElement.nativeElement, mapProp);
  //   var marker = new google.maps.Marker({ position: mapProp.center });
  //   marker.setMap(this.map);
  //   var infowindow = new google.maps.InfoWindow({ content: "Hey !! Here we are" });
  //   infowindow.open(this.map, marker);
  //   this.setMultipleMarker(this.markers, this);
  // }
  setMultipleMarker(markers, self) {
    markers.forEach(function (marker) {
      (function (marker) {
        let mark = new google.maps.Marker({ position: new google.maps.LatLng(marker.lat, marker.lng) });
        let infowindow = new google.maps.InfoWindow({ content: marker.toolTip });
        infowindow.open(self.map, mark);
        mark.setMap(self.map);
      })(marker)
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }


  Remove_Listing(id, deleteConfirmation) {

    this.modalService.open(deleteConfirmation).result.then((result) => {
      
    }, (reason) => {
      if (reason === "Yes") {
        this.subscription = this.mongoService.deleteListing(id, this.globals.TokenponAppId)
          .subscribe(response => {
            if (response.status == 200) {
              //remove it from array
              console.log(this.claimsPage)
              this.claimsPage = this.claimsPage.filter(element => element.id != id);
              console.log(this.claimsPage)
              // this.toasterService.pop("success", "Listing deleted")
              this.notifier.notify("success", "Listing deleted");
              // this.router.navigate(['/home']);
            }
            else {
              // this.toasterService.pop("error", response.statusText)
              this.notifier.notify("error", response.statusText);
            }
          });
      }
    });
  }

  // getVotes(id: string) {
  //   this.likes = 0;
  //   this.dislikes = 0;

  //   // let data: any;
  //   this.voteService.voteData.subscribe(data => {
  //     // data=data;
  //     console.log('---DATA-----' + data);
  //     // this.zone.run(() => {
  //     if (data !== undefined) {
  //       this.likes = data.likes;
  //       this.dislikes = data.dislikes;
  //       // console.log(this.alreadyDisliked);
  //     }
  //   });
  //   console.log('---DATA ID-----' + id);
  //   this.voteService.getVotes(id);
  // }

  incrementViewCount(id) {
    this.mongoService.incrementViewCount(id, this.globals.TokenponAppId)
      .subscribe(response => {
        if (response.status == 200) {
          // console.log(response.json());
        }
        else {
          // this.toasterService.pop("error", response.statusText);
          this.notifier.notify("error", response.statusText);
        }
      });
  }
  toggleView() {
    this.listView = !this.listView;
  }
  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`)
  }

  // mapClicked($event: MouseEvent) {
  //   this.markers.push({
  //     lat: $event.coords.lat,
  //     lng: $event.coords.lng,
  //     draggable: true
  //   });
  // }
  public markerClicked = (markerObj) => {
    if (this.map)
      this.map.setCenter({ lat: markerObj.latitude, lng: markerObj.longitude });
    console.log('clicked', markerObj, { lat: markerObj.latitude, lng: markerObj.longitude });
  }
  markerDragEnd(m: Marker, $event: MouseEvent) {
    console.log('dragEnd', m, $event);
  }
  getAddresses(): string[] {
    let addresses: any[] = [];
    this.claimsPage.forEach(element => {
      let tooltip = {
        businessName: element.businessName,
        street: element.street.trim(),
        city: element.city.trim(),
        state: element.state.trim()
      }
      addresses.push(JSON.stringify(tooltip) + "||" + element.street.trim().replace(/ /g, "+") + ",+"
        + element.city.trim().replace(/ /g, "+") + ",+" + element.state.trim().replace(/ /g, "+"));
    });
    return addresses;
  }
  getCoordinates() {
    this.markers = [];
    let index = 1;
    this.getAddresses().forEach(element => {
      // console.log(element);
      let values = element.split("||");
      let tooltip = JSON.parse(values[0]);
      let address = values[1];
      this.http.get(environment.GoogleGeocodingAPI.replace("{addr}", address))
        .subscribe(response => {
          if (response.status === 200) {
            if (response.json().results[0] !== undefined) {
              // console.log(response.json().results[0].geometry.location);
              if (this.lat == undefined) {
                this.lat = parseFloat(response.json().results[0].geometry.location.lat);
                this.lng = parseFloat(response.json().results[0].geometry.location.lng);
              }
              // const bounds = new google.maps.LatLngBounds();
              // for (const mm of this.markers) {
              //   bounds.extend(new google.maps.LatLng(mm.lat, mm.lng));
              // }
              // // @ts-ignore
              // this.agmMap.fitBounds(bounds);

              let mk: Marker = {
                lat: parseFloat(response.json().results[0].geometry.location.lat),
                lng: parseFloat(response.json().results[0].geometry.location.lng),
                label: index.toString(),
                tooltip: tooltip,
                draggable: false
              };
              this.markers.push(mk);
              index++;
              console.log(mk);
            }
          }
        });
    });
  }
  protected mapReady(map) {
    this.map = map;
  }

  displayModal(content) {
    this.modalService.open(content).result.then((result) => {
      // this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  addListing(content) {
    if (sessionStorage.getItem("accountType") == undefined || sessionStorage.getItem("accountType").trim() == ""
      || sessionStorage.getItem("accountType") == this.globals.TokenponAccountType[0]) {

      this.showModal = true;
      this.displayModal(content);
    }
    else {
      this.router.navigate(['/home/claim']);
    }
    // this.getProfileData()
    // .subscribe(response => {
    //   if (response.status == 200) {
    //     console.log(response);
    //     let profileModel = response.json();
    //     if (this.accountType == undefined || this.accountType.trim() == ""
    //       || this.accountType == this.globals.TokenponAccountType[0]) {

    //         this.showModal = true;
    //         this.displayModal(content);
    //     }
    //     else {
    //       this.router.navigate(['/home/claim']);
    //     }
    //   }
    // });
  }
  getProfileData() {
    let userName = sessionStorage.getItem("currentUser");
    return this.mongoService.GetProfile(userName, this.globals.TokenponAppId);
  }
  selectOffer(id: string) {
    this.router.navigate(['/home/claim-detail'], { queryParams: { id: id } });
  }
}
