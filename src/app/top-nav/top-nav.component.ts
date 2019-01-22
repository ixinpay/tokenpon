import { Component, OnInit, Output, Input, ChangeDetectorRef, Inject, LOCALE_ID } from '@angular/core';
import { User, Claim } from '../_models/index';
import { Http, Response } from '@angular/http';
import { OothService, AlertService } from '../_services/index';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { EventEmitter } from 'events';
import { getNames } from 'i18n-iso-countries';
import { Select2OptionData } from 'ng2-select2';
import { MenuItem } from 'primeng/components/common/menuitem';
import {MenubarModule} from 'primeng/menubar';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})
export class TopNavComponent implements OnInit {
  private validLocales = ['de', 'en', 'es', 'fr', 'it', 'nl', 'pl', 'ru'];
  private pleaseChoose = {
    en: 'Please choose...',
    de: 'Bitte auswählen...',
    fr: 'Choisissez s\'il vous plaît...',
    es: 'Elija por favor...',
    it: 'si prega di scegliere...',
    nl: 'Gelieve te kiezen...',
    pl: 'proszę wybrać...'
  };
  private defaultLabel: string;

  private sub: any;

  @Input()
  public iso3166Alpha2: string;

  @Input()
  public size: 'sm' | 'lg';

  @Output()
  public iso3166Alpha2Change = new EventEmitter();

  public myCountries: any[] = [];

  categories: any[] = [];
  subcategories: any[] = [];
  currentUser: string = undefined;
  currentUserAccount: string = undefined;
  CurrentUserName: string = undefined;
  currentUserEmail: string = undefined;
  selectedLanguage = "1";
  selectedFlag: string;
  language: any[] = [];
  elementType: 'url' | 'canvas' | 'img' = 'url';
  tokenBalance: number;
  items: MenuItem[];
  // public languages: Array<Select2OptionData>;

  constructor(private http: Http, private alertService: AlertService, private toasterService: ToasterService,
    private oothService: OothService, private router: Router,
    private route: ActivatedRoute, private translate: TranslateService,
    private cdRef: ChangeDetectorRef,
    @Inject(LOCALE_ID) private localeId: string) {

    let locale = 'en';
    //get main cat
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

    if (this.localeId.length > 2) {
      // convert Locale from ISO 3166-2 to ISO 3166 alpha2
      locale = this.localeId.toLowerCase().slice(0, 2);
    } else {
      locale = this.localeId.toLowerCase();
    }

    if (this.validLocales.indexOf(locale) > -1) {
      this.loadCountries(locale);
    } else {
      this.loadCountries('en'); // fallback locale is english
    }
    this.defaultLabel = this.pleaseChoose.hasOwnProperty(locale) ? this.pleaseChoose[locale] : this.pleaseChoose.en;

    this.currentUser = localStorage.getItem("currentUser");
    this.currentUserAccount = localStorage.getItem("currentUserAccount");
    this.currentUserEmail = localStorage.getItem("currentUserEmail");
    this.oothService.getLoggedInUserName
      .subscribe(dname => {
        this.currentUser = dname;
        console.log("this.oothService.getLoggedInName: " + this.oothService.getLoggedInName);
      });
    // this.oothService.getLoggedInAccount
    //   .subscribe(account => {
    //     this.currentUserAccount = account;
    //     console.log("account: " + this.currentUser);
    //     // let balanceSession = localStorage.getItem('tokenBalance');
    //     // if (balanceSession) {
    //     //   this.tokenBalance = Number.parseFloat(balanceSession);
    //     //   console.log("session balance=" + balanceSession)
    //     // }
    //     // else {
    //     //   this.oothService.getTokenBalance(this.currentUserAccount)
    //     //     .then(balance => {
    //     //       console.log("balance=" + balance)
    //     //       this.tokenBalance = balance;
    //     //     });
    //     // }
    //   });
    // this.oothService.getAccountBalance
    //   .subscribe(balance => {
    //     console.log("new balance=" + balance)
    //     this.tokenBalance = balance;
    //   });

    this.http.get('/assets/language.json')
      .subscribe(data => {
        this.language = data.json();
        this.language.forEach(element => {
          // console.log(element)
          if (element.Short == "cn") {
            this.selectedLanguage = element.Id;
            this.selectedFlag = element.src;
            // console.log(this.selectedFlag)
          }
        });
      });
  }
  // get userLoggedIn(): boolean {
  //   // if (localStorage.getItem("currentUser")) {
  //   //   this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
  //   //   return true;
  //   // }
  //   // return false;
  //   console.log(this.currentUser);
  //   return this.oothService.isLoggedIn;
  // }
  
  Login() {
    console.log(this.router.url)
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
  }
  LogOut() {
    // reset login status
    this.oothService.Logout()
      // .then(() => this.toasterService.pop('success', 'Logout successful'));
    // .then(() => this.alertService.success('Logout successful', true));
    //this.globals.isLoggedIn = false;
    this.currentUser = undefined;
    localStorage.setItem("oothtoken", "");
    // get return url from route parameters or default to '/'
    //this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.router.navigate(['/login']);
  }
  onChange(newValue) {
    //console.log(this.language.find(n => n.Id==newValue).Short);
    this.translate.setDefaultLang(this.language.find(n => n.Id == newValue).Short);
    this.selectedFlag = this.language.find(n => n.Id == newValue).src;
  }
  // getTokenBalance() {
  //   console.log("in getTokenBalance()")
  //   this.oothService.getTokenBalance(this.currentUserAccount).then(balance => this.tokenBalance = balance);
  // }
  ngOnInit() {
    this.items = [
      {
          label: 'File',
          icon: 'pi pi-fw pi-file',
          items: [{
                  label: 'New', 
                  icon: 'pi pi-fw pi-plus',
                  items: [
                      {label: 'Project'},
                      {label: 'Other'},
                  ]
              },
              {label: 'Open'},
              {separator:true},
              {label: 'Quit'}
          ]
      },
      {
          label: 'Edit',
          icon: 'pi pi-fw pi-pencil',
          items: [
              {label: 'Delete', icon: 'pi pi-fw pi-trash'},
              {label: 'Refresh', icon: 'pi pi-fw pi-refresh'}
          ]
      },
      {
          label: 'Help',
          icon: 'pi pi-fw pi-question',
          items: [
              {
                  label: 'Contents'
              },
              {
                  label: 'Search', 
                  icon: 'pi pi-fw pi-search', 
                  items: [
                      {
                          label: 'Text', 
                          items: [
                              {
                                  label: 'Workspace'
                              }
                          ]
                      },
                      {
                          label: 'File'
                      }
              ]}
          ]
      },
      {
          label: 'Actions',
          icon: 'pi pi-fw pi-cog',
          items: [
              {
                  label: 'Edit',
                  icon: 'pi pi-fw pi-pencil',
                  items: [
                      {label: 'Save', icon: 'pi pi-fw pi-save'},
                      {label: 'Update', icon: 'pi pi-fw pi-save'},
                  ]
              },
              {
                  label: 'Other',
                  icon: 'pi pi-fw pi-tags',
                  items: [
                      {label: 'Delete', icon: 'pi pi-fw pi-minus'}
                  ]
              }
          ]
      },
      {separator:true},
      {
          label: 'Quit', icon: 'pi pi-fw pi-times'
      }
  ];
  }
  private loadCountries(locale: string): void {
    const iso3166 = getNames(locale);

    this.myCountries = [];
    // console.log(iso3166)
    for (const key of Object.keys(iso3166)) {

      this.myCountries.push({ display: iso3166[key], value: key.toLowerCase() });
    }
    // sort
    this.myCountries.sort((a: any, b: any) => a.display.localeCompare(b.display));
  }

  public change(newValue: string): void {
    this.iso3166Alpha2 = newValue;
    this.iso3166Alpha2Change.emit(newValue);
  }

  ngAfterViewChecked() {
    if (this.iso3166Alpha2) {
      this.iso3166Alpha2 = this.iso3166Alpha2.toLowerCase();
    }
    this.cdRef.detectChanges(); // avoid ExpressionChangedAfterItHasBeenCheckedError
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }
}
