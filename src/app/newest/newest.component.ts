import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Http, Response } from '@angular/http';
import { UserService, MongoService } from '../_services/index';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { ISubscription } from 'rxjs/Subscription';
import { Globals } from '../globals'
import { ToasterService } from 'angular2-toaster';

@Component({
  selector: 'app-newest',
  templateUrl: './newest.component.html',
  styleUrls: ['./newest.component.css']
})

/**
 * Contain Top 10 newest items
 *
 * @author Jason_Su
 */
export class NewestComponent implements OnInit {
  claims: any[] = [];
  private subscription: ISubscription;
  page: number;
  pageSize: number;
  maxSize: number;
  currentUser: string;
  model: any = {};
  categories: any[] = [];
  countries: any[] = [];
  catParam = "";
  subcatPram = "";
  IDparam = "";
  postedTime: number;

  constructor(private router: Router, private route: ActivatedRoute, private userService: UserService, private titleService: Title,
    private mongoService: MongoService, private http: Http, private globals: Globals,
    private toasterService: ToasterService ) { }

  ngOnInit() {
    this.titleService.setTitle("Tokenpon");
    this.currentUser = sessionStorage.getItem('currentUser');
    if (this.currentUser) {
      this.model.submitBy = this.currentUser;
    }
    this.subscription = this.http.get('/assets/cat.json')
      .subscribe(data => {
        this.categories = data.json();
        // console.log(data);
      });
    this.subscription = this.http.get('/assets/country.json')
      .subscribe(data => {
        this.countries = data.json();
        // console.log(data);
      });

    // get query param
    this.page = 1;
    this.maxSize = 10;
    this.pageSize = 8;
    this.subscription = this.route.queryParams.subscribe(params => {
      /**
       * load listings from MongoDB
       * 1. catagory exists
       * 2. subcatagory exsits
       * 3. otherwise
       */
      this.catParam = params['cat'];
      this.subcatPram = params['subcat'];
      if (this.catParam) {
        this.subscription = this.mongoService.GetListingsByCat(this.catParam, this.globals.TokenponAppId)
          .subscribe(response => {
            if (response.status == 200) {
              console.log(response.json());
              this.getListings(response);
            } else {
              this.toasterService.pop("error", response.statusText);
            }
          })
      } else if (this.subcatPram) {
        this.subscription = this.mongoService.GetListingsBySubcat(this.subcatPram, this.globals.TokenponAppId)
          .subscribe(response => {
            if (response.status == 200) {
              console.log(response.json());
              this.getListings(response);
            } else {
              this.toasterService.pop("error", response.statusText);
            }
          })
      } else {
        this.subscription = this.mongoService.GetListings(this.globals.TokenponAppId)
          .subscribe(response => {
            if (response.status == 200) {
              // this.postedTime = response.json()[0].postedTime;
              this.getListings(response);
            } else {
              this.toasterService.pop("error", response.statusText);
            }
        });
      }
    });
  }

  /**
   *
   * @param response
   * get all listings from response and sort them by postedDate descendingly
   */
  getListings(response: Response) {
    this.claims = response.json();
    this.claims.sort((obj1, obj2) => {
      return -(obj1.postedTime - obj2.postedTime);
    });
    // console.log(response.json());
  }

  /**
   *
   * @param id: claim's id
   * go to selected claim's page
   */
  selectOffer(id: string) {
    this.router.navigate(['/home/claim-detail'], { queryParams: { id: id } });
  }

}
