import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { UserService, GoogleGeoService, AlertService, OothService, MongoService, SwarmService } from '../_services/index';
import { Globals } from "../globals";
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { ISubscription } from "rxjs/Subscription";
import { FormControl } from '@angular/forms';
// import * as alaSQLSpace from 'alasql';
// import { error } from 'util';
// import { Comment } from '../_models/comment';
import { Http } from '@angular/http';
import { environment } from 'environments/environment';
import { Lightbox } from 'ngx-lightbox';
import { NguCarousel, NguCarouselStore } from '@ngu/carousel';
import { Title } from '@angular/platform-browser';
import { AgmCoreModule, MouseEvent, GoogleMapsAPIWrapper, AgmMap, LatLngBounds, LatLngBoundsLiteral } from '@agm/core';
import { } from 'googlemaps';
import { Marker } from '../_models/index'
import { NgbModal, NgbActiveModal, ModalDismissReasons, NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-claim-detail',
  templateUrl: './claim-detail.component.html',
  styleUrls: ['./claim-detail.component.css'],
  providers: [NgbCarouselConfig]
})
export class ClaimDetailComponent implements OnInit {
  public carouselBanner: NguCarousel;
  public carouselTileOneItems: Array<any> = [];
  imgags: string[];
  storeCarouselData: NguCarouselStore;
  stateCtrl: FormControl;
  states: { name: string; img: string }[];


  private subscription: ISubscription;
  private isAuthor: boolean = false;
  private reactions: string[] = ['like', 'dislike']
  currentUser: string = undefined;
  currentUserEmail: string = undefined;
  claimId: string;
  country: string;
  category: string;
  model: any = {};
  submitted: boolean = false;
  comments: any[] = [];
  commentsNum: number;
  totalItems: number;
  page: number;
  previousPage: any;
  pageSize: number;
  maxSize: number;
  commentsPage: any[] = [];
  ownComment: any;
  ownComments: any[] = [];
  likes: number = 0;
  dislikes: number = 0;
  alreadyLiked: boolean = false;
  alreadyDisliked: boolean = false;
  ownVote: any;
  private albums: any[] = [];
  private account: string;
  private userId: string;
  private tokenBalance: number;
  private discountArray: Array<any> = [];
  private discountTokenCost: number;
  @ViewChild('AgmMap') agmMap: AgmMap;
  // map: google.maps.Map;
  protected map: any;
  markers: Marker[] = []
  zoom: number = 10;
  // initial center position for the map
  lat: number;
  lng: number;
  modalSuccess: boolean = false;
  failMessage: string = "There was an error. iXin coin was not deducted from your account. Sorry for the inconvenience.";
  closeResult: string;
  loading = false;
  returnUrl: string;
  phoneLogin: boolean = true; // true = phone number, false = username/email

  constructor(private http: Http, private route: ActivatedRoute, private globals: Globals, private oothService: OothService,
    private lightbox: Lightbox, private toasterService: ToasterService, private titleService: Title, private googleGeoService: GoogleGeoService,
    private router: Router, private mongoService: MongoService, private swarmService: SwarmService, private modalService: NgbModal,
    private config: NgbCarouselConfig) {

    //ng-bootstrap carousel config
    // customize default values of carousels used by this component tree
    config.interval = 10000;
    config.wrap = false;
    config.keyboard = false;
    // config.pauseOnHover = false;

    this.account = localStorage.getItem("currentUserAccount");
    this.page = 1;
    this.maxSize = 100;
    this.pageSize = 5;
    this.currentUser = localStorage.getItem("currentUser");
    this.currentUserEmail = localStorage.getItem("currentUserEmail");
    this.oothService.getTokenBalance(this.account)
      .then(balance => {
        console.log("balance=" + balance)
        this.tokenBalance = balance;
      });
    this.oothService.getLoggedInName
      .subscribe(name => {
        if (name === "") {
          this.currentUser = undefined;
        }
        else {
          this.currentUser = name;
        }
      });
    //get query param
    this.route.queryParams.subscribe(params => {
      // console.log(params['id']);
      this.claimId = params['id'];
      // this.country = params['cid'];
      // this.category = params['catid'];
      // this.getClaimDetails(this.claimId);
      this.getDetails();
    });
  }
  open(index: number): void {
    // open lightbox
    this.lightbox.open(this.albums, index);
  }
  private getDetails() {
    // console.log(this.claimId)
    //reset counts
    this.likes = 0;
    this.dislikes = 0;
    this.comments = [];
    this.ownComment = "";
    this.albums = [];
    this.mongoService.GetListing(this.claimId, this.globals.TokenponAppId)
      .subscribe(response => {
        if (response.status == 200) {
          // console.log(response);
          this.model = response.json();
          console.log(this.model);
          //get discounts
          this.discountArray = this.model.discounts;
          console.log("discount: " + this.discountArray);
          //get map geo
          this.googleGeoService.getGoogleGeoData(this.model.street, this.model.city, this.model.state, this.model.zip)
            .subscribe(response => {
              if (response.status === 200) {
                if (response.json().results[0] !== undefined) {
                  // console.log(response.json().results[0].geometry.location);
                  if (this.lat == undefined) {
                    this.lat = parseFloat(response.json().results[0].geometry.location.lat);
                    this.lng = parseFloat(response.json().results[0].geometry.location.lng);
                  }
                  console.log("lat = " + this.lat + " lng = " + this.lng)
                  // const bounds = new google.maps.LatLngBounds();
                  // for (const mm of this.markers) {
                  //   bounds.extend(new google.maps.LatLng(mm.lat, mm.lng));
                  // }
                  // // @ts-ignore
                  // this.agmMap.fitBounds(bounds);

                  let marker = {
                    lat: parseFloat(response.json().results[0].geometry.location.lat),
                    lng: parseFloat(response.json().results[0].geometry.location.lng),
                    label: '',
                    tooltip: '',
                    draggable: false
                  };
                  this.markers.push(marker);
                  console.log(this.markers);
                }
              }
            });
          //set title
          this.titleService.setTitle(this.model.businessName + " " + this.model.city + " " + (this.model.discounts[0].discount * 100) + "% off");
          //get pictures from SWARM
          // this.swarmService.getFileUrls(this.model.pictures)
          //   .forEach(img => {
          //     const src = img;
          //     //const caption = 'Image caption here';
          //     const thumb = img;
          //     const album = {
          //       src: src,
          //       //caption: caption,
          //       thumb: thumb
          //     };

          //     this.albums.push(album);
          //   });
          //get pictures from Mongo
          if (this.model.pictures !== undefined) {
            console.log("pic count: " + this.model.pictures.length);
            this.model.pictures.forEach(img => {
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

          // console.log(this.urls)
          //check if current user is the author of the listing
          // console.log("current user: " + this.currentUser + " author: " + this.model.postedBy)
          // if author is not available, hide Edit button
          if (this.model.postedBy == null || this.model.postedBy == undefined) {
            this.isAuthor = false;
          }
          else {
            // if current user is not logged in, hide Edit button
            if (this.currentUser == null || this.currentUser == undefined) {
              this.isAuthor = false;
            }
            else {
              if (this.currentUser == this.model.postedBy) {
                this.isAuthor = true;
              }
              else {
                this.isAuthor = false;
              }
            }
          }
          //retrieve comments
          // console.log(this.model.comments)
          this.totalItems = this.model.comments.length;
          this.model.comments = this.model.comments.sort(function (a, b) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return b.postedTime - a.postedTime;
          });

          // this.model.comments.forEach(element => {
          //   if (element.postedBy == this.currentUser) {
          //     this.ownComment = element;
          //     // console.log("ownComment: " + this.ownComment)
          //   }
          //   else {
          //     // console.log(element)
          //     this.comments.push(element);
          //   }
          // });
          this.model.commentsNum = this.model.comments.length;
          // this.commentsPage = this.comments.slice(0, this.pageSize);
          this.commentsPage = this.model.comments.slice(0, this.pageSize);
          // console.log("comments: " + this.commentsPage);
          //retrieve votes
          this.model.votes.forEach(element => {
            // get the current user's vote
            if (element.postedBy == this.currentUser) {
              this.ownVote = element;
              if (element.vote == "like") {
                this.alreadyLiked = true;
                this.alreadyDisliked = false;
              }
              else if (element.vote == "dislike") {
                this.alreadyDisliked = true;
                this.alreadyLiked = false;
              }
              else {
                this.alreadyLiked = false;
                this.alreadyDisliked = false;
              }
            }
            // get vote counts
            if (element.vote == "like") {
              this.likes++;
            }
            else if (element.vote == "dislike") {
              this.dislikes++;
            }
          });
        }
        else {
          this.toasterService.pop("error", response.statusText);
        }
      });
  }

  loadPage(pageNum: number) {
    if (pageNum !== this.previousPage) {
      this.previousPage = pageNum;
      this.loadData(pageNum);
    }
  }
  loadData(pageNum: number) {
    this.commentsPage = this.comments.slice(this.pageSize * (pageNum - 1), this.pageSize * (pageNum - 1) + this.pageSize)
    console.log(this.commentsPage);
  }
  async onSubmit(commentText: string) {
    // console.log("onSubmit: " + this.claimId)
    if (localStorage.getItem("oothtoken") != undefined && localStorage.getItem("oothtoken").toString().trim() != "") {
      // console.log(this.oothService.getUser());
      // console.log("calling onSubmit()");
      // console.log(localStorage.getItem("oothtoken"));
      // this.VerifyToken();
      //let user = await this.oothService.getUser();
      // console.log(user.local.email);
      // add new comment
      // if (!this.ownComment) {
      if (this.tokenBalance >= this.globals.tokenDeductAmmount_TokenponComment) {
        let data = {
          _id: this.claimId,
          appId: this.globals.TokenponAppId,
          comment: {
            comment: commentText,
            postedBy: this.currentUser,
            postedTime: Date.now()
          }
        };
        // console.log((JSON.stringify(data)));
        this.mongoService.addComment(data)
          .subscribe(response => {
            console.log(response);
            if (response.status == 200) {
              this.toasterService.pop('success', 'Thanks for you comment!');
              this.submitted = true;
              console.log("account: " + this.account);
              //email author about new comment if allowed
              // if (this.model.notification) {
              //   console.log("sending email to author ...");
              //   this.oothService.sendEmail(this.model.postedBy, this.globals.ChainPageNewCommentSubject
              //     , this.globals.ChainPageNewCommentMessageToAuthor + window.location + '<br/><br/>New Comment by ' + this.currentUser + ':<br/>' + commentText);

              // }
              //send email to comment provider if he is not the author
              // if (this.model.postedBy !== this.currentUser) {
              //   console.log("sending email to commenter ...");
              //   this.oothService.sendEmail(this.currentUser, this.globals.ChainPostNewCommentSubject
              //     , this.globals.ChainPageNewCommentMessageToProvider + window.location);
              // }
              //deduct token
              // if (!this.ownComment) {
              // console.log("deduct new comment token from " + localStorage.getItem("currentUserId"));
              // this.oothService.deductToken(localStorage.getItem("currentUserId"), this.globals.tokenDeductAmmount_ChainpageComment);
              this.oothService.onUserAction(this.globals.TokenponAppId, this.globals.action.comment);
              // }
              //reload comments
              this.getDetails();
              return true;
            }
            else {
              this.toasterService.pop("error", response.statusText);
            }
          })
      }
      else {
        this.toasterService.pop("error", "You don't have enough tokens");
      }
      // }
      // update comment
      // else {
      //   let data = {
      //     _id: this.claimId,
      //     appId: this.globals.TokenponAppId,
      //     comment: {
      //       _id: this.ownComment._id,
      //       comment: commentText,
      //       postedTime: Date.now()
      //     }
      //   };
      //   this.mongoService.updateComment(data)
      //     .subscribe(response => {
      //       if (response.status == 200) {
      //         this.toasterService.pop('success', 'Comment submitted successfully');
      //         this.submitted = true;
      //         // console.log("account: " + this.account);
      //         //deduct token
      //         // if (!this.ownComment) {
      //         //   console.log("deduct new comment token from " + this.account);
      //         //   this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageComment);
      //         // }
      //         //reload comments
      //         this.getDetails();
      //         return true;
      //       }
      //       else {
      //         this.toasterService.pop("error", response.statusText);
      //       }
      //     })
      // }
      // console.log(result);
    }
    else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return false;
    }
  }
  thumbsUp() {
    if (!this.alreadyDisliked) {
      if (this.alreadyLiked) {
        // console.log("already liked: " + this.alreadyLiked);
        let data = {
          _id: this.claimId,
          appId: this.globals.TokenponAppId,
          vote: {
            _id: this.ownVote._id
          }
        };
        this.mongoService.deleteVote(data)
          .subscribe(response => {
            if (response.status == 200) {
              // this.toasterService.pop('success', 'Vote deleted successfully');
              this.submitted = true;
              // this.likes--;
              // console.log("user id: " + localStorage.getItem("currentUserId"));
              //deduct token
              // this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageUpVote);
              //reload votes
              this.getDetails();
              this.alreadyLiked = !this.alreadyLiked;
              return true;
            }
            else {
              this.toasterService.pop("error", response.statusText);
            }
          })
      }
      else {
        console.log("token balance: " + this.tokenBalance)
        if (this.tokenBalance >= this.globals.tokenDeductAmmount_TokenponUpVote) {
          // console.log("not yet liked: " + this.alreadyLiked)
          let data = {
            _id: this.claimId,
            appId: this.globals.TokenponAppId,
            vote: {
              vote: this.reactions[0],  //like
              postedBy: this.currentUser,
              postedTime: Date.now()
            }
          };
          this.mongoService.addVote(data)
            .subscribe(response => {
              if (response.status == 200) {
                // this.toasterService.pop('success', 'Vote submitted successfully');
                this.submitted = true;
                // this.likes++;
                console.log("user id: " + localStorage.getItem("currentUserId"));
                //deduct token
                this.oothService.onUserAction(this.globals.TokenponAppId, this.globals.action.like)
                //this.oothService.deductToken(localStorage.getItem("currentUserId"), this.globals.tokenDeductAmmount_ChainpageUpVote);
                //reload votes
                this.getDetails();
                this.alreadyLiked = !this.alreadyLiked;
                return true;
              }
              else {
                this.toasterService.pop("error", response.statusText);
              }
            })
        }
        else {
          this.toasterService.pop("error", "You don't have enough tokens");
        }
      }

    }
  }
  thumbsDown() {
    // console.log(this.alreadyDisliked);
    if (!this.alreadyLiked) {
      if (this.alreadyDisliked) {
        // console.log(this.alreadyDisliked);
        let data = {
          _id: this.claimId,
          appId: this.globals.TokenponAppId,
          vote: {
            _id: this.ownVote._id
          }
        };
        this.mongoService.deleteVote(data)
          .subscribe(response => {
            if (response.status == 200) {
              // this.toasterService.pop('success', 'Vote deleted successfully');
              this.submitted = true;
              // this.likes--;
              // console.log("account: " + this.account);
              //deduct token
              // this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageDownVote);
              //reload votes
              this.getDetails();
              this.alreadyDisliked = !this.alreadyDisliked;
              return true;
            }
            else {
              this.toasterService.pop("error", response.statusText);
            }
          })
      }
      else {
        if (this.tokenBalance >= this.globals.tokenDeductAmmount_TokenponDownVote) {
          // console.log(this.alreadyDisliked);
          let data = {
            _id: this.claimId,
            appId: this.globals.TokenponAppId,
            vote: {
              vote: this.reactions[1],  //dislike
              postedBy: this.currentUser,
              postedTime: Date.now()
            }
          };
          this.mongoService.addVote(data)
            .subscribe(response => {
              if (response.status == 200) {
                // this.toasterService.pop('success', 'Vote submitted successfully');
                this.submitted = true;
                // this.likes++;
                // console.log("account: " + this.account);
                //deduct token
                this.oothService.onUserAction(this.globals.TokenponAppId, this.globals.action.dislike);
                //this.oothService.deductToken(localStorage.getItem("currentUserId"), this.globals.tokenDeductAmmount_ChainpageDownVote);
                //reload votes
                this.getDetails();
                this.alreadyDisliked = !this.alreadyDisliked;
                return true;
              }
              else {
                this.toasterService.pop("error", response.statusText);
              }
            })
        }
        else {
          this.toasterService.pop("error", "You don't have enough tokens");
        }
      }

      // console.log(this.alreadyDisliked);
    }
  }
  formatURL(url: string): string {
    if (url != undefined && (!url.startsWith("http:///") || !url.startsWith("https:///"))) {
      return "http://" + url;
    }
    else {
      return url;
    }
  }
  // getClaimDetails(id: string) {
  //   this.bigchainService.getTransactionsById(id)
  //     .subscribe(
  //       // error => {
  //       //   // console.log(JSON.stringify(error));
  //       //   this.toasterService.pop('error', 'Failed to load data');
  //       // },
  //       data => {
  //         console.log(data);
  //         let claim = (JSON.parse(JSON.stringify(data))).asset.data;
  //         // use record's transaction id as the id
  //         if (claim.id === "NA") {
  //           claim.id = (JSON.parse(JSON.stringify(data))).id;
  //         }
  //         this.model = claim;
  //         if (this.currentUser == this.model.postedBy) {
  //           this.isAuthor = true;
  //           console.log(this.isAuthor);
  //         }
  //         // get comments and votes
  //         this.getComments(this.model.id);
  //         this.getVotes(this.model.id);
  //       });
  // }
  // deleteClaim(id: number) {
  //   this.claimService.delete(id);
  // }
  // editClaim(id: number) {
  //   this.claimService.getById(id).subscribe(claim => { this.model = claim });;
  //   //console.log(this.model);
  // }
  // async onSubmit(commentText: string) {
  //   if (localStorage.getItem("oothtoken") != undefined && localStorage.getItem("oothtoken").toString().trim() != "") {
  //     // console.log(this.oothService.getUser());
  //     // console.log("calling onSubmit()");
  //     // console.log(localStorage.getItem("oothtoken"));
  //     // this.VerifyToken();
  //     let user = await this.oothService.getUser();
  //     // console.log(user.local.email);

  //     // let data = {
  //     //   id: this.model.id,
  //     //   type: this.globals.chainPageComment,
  //     //   comment: commentText,
  //     //   postedBy: user.local.email,
  //     //   postedTime: Date.now()
  //     // };
  //     let data = new Comment(this.globals.chainPageComment, commentText,
  //       user.local.email, Date.now());
  //     // console.log((JSON.stringify(data)));
  //     var result = await this.bigchaindbService.createTransaction(JSON.parse(JSON.stringify(data)), this.globals.chainFormName)
  //       .then(
  //         (data) => {
  //           this.toasterService.pop('success', 'Comment submitted successfully');
  //           this.submitted = true;
  //           console.log("account: " + this.account);
  //           //deduct token
  //           if (!this.ownComment) {
  //             console.log("deduct new comment token from " + this.account);
  //             this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageComment);
  //           }
  //           //reload comments
  //           this.getComments(this.model.id);
  //           return true;
  //         },
  //         (err) => {
  //           if (err.message.toLowerCase().includes("error")) {
  //             this.toasterService.pop('error', 'Failed to submit comment');
  //             return false;
  //           }
  //         }
  //       );
  //     // console.log(result);
  //   }
  //   else {
  //     this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  //     return false;
  //   }
  // }
  // getComments(id: string) {
  //   // let foundData: any[];
  //   this.comments = [];
  //   this.ownComments = [];
  //   this.ownComment = "";
  //   // console.log("in getComments()");
  //   this.subscription = this.bigchaindbService.getAllTransactionsByAsset(id)
  //     .subscribe(
  //       // error => {
  //       //   // console.log(JSON.stringify(error));
  //       //   this.toasterService.pop('error', 'Failed to load comments');
  //       // },

  //       dataset => {
  //         // let data = (JSON.parse(JSON.stringify(dataset))).data;
  //         // console.log(dataset);
  //         JSON.parse(JSON.stringify(dataset)).forEach(element => {
  //           // console.log(element.data);
  //           if (element.data.type == this.globals.chainPageComment) {
  //             if (localStorage.getItem("currentUser") != undefined) {
  //               if (element.data.postedBy == localStorage.getItem("currentUser").toString()) {
  //                 this.ownComments.push(element.data);
  //                 // console.log("push to ownComments");
  //                 // console.log(element.data);
  //               }
  //               else {
  //                 this.comments.push(element.data);
  //                 // console.log("push to comments");
  //               }
  //             }
  //             else {
  //               this.comments.push(element.data);
  //             }
  //           }
  //         });
  //         // get the latest comment for current user
  //         // console.log(this.ownComments.length);
  //         if (this.ownComments.length > 0 && this.ownComments.length <= 1) {
  //           this.ownComment = this.ownComments[0];
  //         }
  //         else if (this.ownComments.length > 1) {
  //           let max = Math.max.apply(Math, this.ownComments.map(function (o) { return o.postedTime; }));
  //           this.ownComments.forEach(comment => {
  //             // console.log(comment);
  //             if (comment.postedTime == max) {
  //               this.ownComment = comment;
  //               // console.log(this.ownComment.comment);
  //             }
  //           })
  //         }
  //         // console.log(alasql("SELECT a.* FROM ? AS a LEFT JOIN ? AS b ON a.postedBy = b.postedBy AND a.postedTime < b.postedTime Where b.postedBy IS null", [this.comments,this.comments]));
  //         this.comments = alasql("SELECT a.* FROM ? AS a LEFT JOIN ? AS b ON a.postedBy = b.postedBy AND a.postedTime < b.postedTime Where b.postedBy IS null", [this.comments, this.comments]);
  //         this.totalItems = this.comments.length;
  //         console.log(this.totalItems);
  //         // console.log(this.ownComments);
  //         let data = {
  //           ownComment: this.ownComment,
  //           comments: this.comments
  //         }
  //         this.commentsPage = this.comments.slice(0, this.pageSize);
  //         return data;
  //       });
  // }
  // thumbsUp() {
  //   if (!this.alreadyDisliked) {
  //     if (this.alreadyLiked) {
  //       this.likes--;
  //       this.voteService.vote(this.model.id, "neutral", this.currentUser, this.globals.chainPageVote)
  //         .then(
  //           data => {
  //             console.log("deduct from account: " + this.account + " " + this.globals.tokenDeductAmmount_ChainpageVote + " token");
  //             this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageVote);
  //           },
  //           err => {
  //             this.toasterService.pop("error", "Fail to submit vote");
  //           }
  //         )

  //     }
  //     else {
  //       this.likes++;
  //       this.voteService.vote(this.model.id, "like", this.currentUser, this.globals.chainPageVote)
  //         .then(
  //           data => {
  //             console.log("deduct from account: " + this.account + " " + this.globals.tokenDeductAmmount_ChainpageVote + " token");
  //             this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageVote);
  //           },
  //           err => {
  //             this.toasterService.pop("error", "Fail to submit vote");
  //           }
  //         )
  //     }

  //     this.alreadyLiked = !this.alreadyLiked;
  //   }

  // }
  // thumbsDown() {
  //   // console.log(this.alreadyDisliked);
  //   if (!this.alreadyLiked) {
  //     if (this.alreadyDisliked) {
  //       // console.log(this.alreadyDisliked);
  //       this.dislikes--;
  //       this.voteService.vote(this.model.id, "neutral", this.currentUser, this.globals.chainPageVote)
  //         .then(
  //           data => {

  //             this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageVote);
  //           },
  //           err => {
  //             this.toasterService.pop("error", "Fail to submit vote");
  //           }
  //         )
  //     }
  //     else {
  //       // console.log(this.alreadyDisliked);
  //       this.dislikes++;
  //       this.voteService.vote(this.model.id, "dislike", this.currentUser, this.globals.chainPageVote)
  //         .then(
  //           data => {

  //             this.oothService.deductToken(this.account, this.globals.tokenDeductAmmount_ChainpageVote);
  //           },
  //           err => {
  //             this.toasterService.pop("error", "Fail to submit vote");
  //           }
  //         )
  //     }
  //     this.alreadyDisliked = !this.alreadyDisliked;
  //     // console.log(this.alreadyDisliked);
  //   }
  // }
  /*
  getVotes(id: string) {
    this.likes = 0;
    this.dislikes = 0;

    // let data: any;
    this.voteService.voteData.subscribe(data => {
      // data=data;
      // console.log(data);
      // this.zone.run(() => {
      if (data != undefined) {
        this.likes = data.likes;
        this.dislikes = data.dislikes;
        this.alreadyLiked = data.alreadyLiked;
        this.alreadyDisliked = data.alreadyDisliked;
        // console.log(this.alreadyDisliked);
      }
      //     if (data != undefined) {
      //   // console.log(data.votes)
      //   if (data.votes && data.votes.length > 0) {
      //     this.likes = (alasql("SELECT count(*) as cnt FROM ? Where vote = 'like'", [data.votes]))[0].cnt;
      //     this.dislikes = (alasql("SELECT count(*) as cnt FROM ? Where vote = 'dislike'", [data.votes]))[0].cnt;
      //     // console.log("like = " + this.likes + " dislike = " + this.dislikes);
      //   }
      //   // console.log((alasql("SELECT count(*) as cnt FROM ? Where vote = 'like'", [data.votes]))[0].cnt)
      //   if (data.ownVote) {
      //     if (data.ownVote.vote == "like") {
      //       this.alreadyLiked = true;
      //       this.alreadyDisliked = false;
      //       this.likes++;
      //       // console.log(this.alreadyLiked + " like = " + this.likes);
      //     }
      //     else if (data.ownVote.vote == "dislike") {
      //       this.alreadyLiked = false;
      //       this.alreadyDisliked = true;
      //       this.dislikes++;
      //     }
      //   }
      //   console.log(this.likes);
      // }
      // })
    });
    this.voteService.getVotes(id);
  }*/
  ngOnDestroy(): void {
    // this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.carouselBanner = {
      grid: { xs: 1, sm: 1, md: 1, lg: 1, all: 0 },
      speed: 600,
      slide: 1,
      point: {
        visible: true
      },
      load: 2,
      loop: true,
      interval: 5000,
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

  protected mapReady(map) {
    this.map = map;
  }

  purchaseCoupon(i, finalConfirm) {
    this.oothService.onCouponPurchase(this.model.merchantAccountAddress, this.account, this.discountArray[i]._id, this.discountArray[i].token)
      .then(response => {
        if (response.status == 200) {
          console.log(response);
          this.modalSuccess = true;
          this.modalService.open(finalConfirm);
        }
        if (response.status === 'error') {
          console.log(response.message);
          this.modalSuccess = false;
          this.failMessage = response.message;
          this.modalService.open(finalConfirm);
        }
        else {
          console.log(response);
          this.modalSuccess = true;
          this.modalService.open(finalConfirm);
        }
      })
      .catch(error => {
        console.log(error);
        this.modalSuccess = false;
        this.modalService.open(finalConfirm);
      });

  }
  displayBuyModal(content, i, finalConfirm, loginModal) {
    if (this.currentUser !== null && this.currentUser !== undefined && this.currentUser.trim() !== "") {
      this.discountTokenCost = this.discountArray[i].token;
      this.modalService.open(content).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason, i, finalConfirm)}`;
      });
    }
    else {
      this.modalService.open(loginModal).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        if (reason === 'Login') {
          this.login();
        }
      });
    }
  }
  private getDismissReason(reason: any, i: number, finalConfirm): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else if (reason === 'Confirm') {
      // call purchase coupon API
      this.purchaseCoupon(i, finalConfirm);
    }
  }

  Remove_Listing(id, deleteConfirmation) {
    this.modalService.open(deleteConfirmation).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      if (reason === "Yes") {
        this.subscription = this.mongoService.deleteListing(id, this.globals.TokenponAppId)
          .subscribe(response => {
            if (response.status == 200) {
              this.toasterService.pop("success", "Listing deleted")
              this.router.navigate(['/home']);
            }
            else {
              this.toasterService.pop("error", response.statusText)
            }
          });
      }
    });
  }
  shareDeal(shareModal) {
    this.modalService.open(shareModal).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      if (reason === "Send") {
        this.toasterService.pop("success", "Your invite was sent successfully!");
      }
    });
  }

  login() {
    this.oothService.Logout();
    let userid = "";
    if (!this.phoneLogin) {
      userid = this.model.email
    }
    else {
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
          this.currentUser = localStorage.getItem("currentUser");
          // console.log("redirect to: " + this.returnUrl);
          // // var arr = this.returnUrl.split("?");
          // // if(arr.length == 1){
          // //     this.router.navigate([arr[0]]); 
          // // }   
          // // else if(arr.length > 1){
          // this.router.navigateByUrl(this.returnUrl);
          // // }               
        }
      })
      .catch(error => {
        this.toasterService.pop("error", error);
      });
  }
}
