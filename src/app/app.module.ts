import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpModule } from '@angular/http';
// used to create fake backend
import { I18nCountrySelectModule } from 'ngx-i18n-country-select';
import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { SidebarModule } from 'ng-sidebar';
import { AlertComponent } from './_directives/index';
import { AuthGuard } from './_guards/index';
// import { JwtInterceptor, fakeBackendProvider } from './_helpers/index';
import { AlertService, AuthenticationService, UserService, ClaimService, BigchanDbService, OothService, VoteService, MongoService,SwarmService, GoogleGeoService } from './_services/index';
import { HomeComponent } from './home/index';
import { LoginComponent } from './login/index';
import { ClaimComponent } from './claim/claim.component';
// import { ContractComponent } from './contract/contract.component';
import { SideNavComponent } from './side-nav/side-nav.component'
import { Globals } from './globals'
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TopNavComponent } from './top-nav/top-nav.component';
import { ClaimDetailComponent } from './claim-detail/claim-detail.component';
import { NgbModule, NgbModal, ModalDismissReasons, NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgbdDatepickerPopup } from './datepicker-popup/datepicker-popup';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
// this includes the core NgIdleModule but includes keepalive providers for easy wireup
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { MomentModule } from 'angular2-moment';

import { ListingsComponent } from './listings/listings.component';
import { ModalContent } from './modal/modal.component';
import { ProfileComponent } from './profile/profile.component'; // optional, provides moment-style pipes for date formatting
import { ConfirmEqualValidatorDirective } from './_directives/confirm-equal-validator.directive';
import { Select2Module } from 'ng2-select2';
//import { InputMaskModule } from 'ng2-inputmask';
import {  ReactiveFormsModule } from '@angular/forms';
import { LightboxModule } from 'ngx-lightbox';
import { NguCarouselModule } from '@ngu/carousel';
import { ActivationComponent } from './activation/activation.component';
import { SafePipe } from './_helpers/safe.pipe';
import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import {MegaMenuModule} from 'primeng/megamenu';
import { InternationalPhoneNumberModule } from 'ngx-international-phone-number';
import { NewestComponent } from './newest/newest.component';
import { DatePipe } from '@angular/common';
import { ImageCompressService,ResizeOptions,ImageUtilityService } from 'ng2-image-compress';
// const SERVICES = [
//   MetaCoinService,
//   Web3Service,
// ]
@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    routing,
    SidebarModule.forRoot(),
    HttpModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgbModule.forRoot(),
    BrowserAnimationsModule,
    ToasterModule.forRoot(),
    MomentModule,
    NgxQRCodeModule,
    NgIdleKeepaliveModule.forRoot(),
    I18nCountrySelectModule.forRoot(),
    Select2Module,
    LightboxModule,
    NguCarouselModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyA5IGhOP4Sk_MzGLLMtmmjdXNP1bN_3Y_g'
    }),
    AgmJsMarkerClustererModule,
    MegaMenuModule,
    InternationalPhoneNumberModule
  ],
  declarations: [
    AppComponent,
    AlertComponent,
    HomeComponent,
    LoginComponent,
    ClaimComponent,
    // ContractComponent,
    SideNavComponent,
    TopNavComponent,
    ClaimDetailComponent,
    ListingsComponent,
    ModalContent,
    ProfileComponent,
    ConfirmEqualValidatorDirective,
    ActivationComponent,
    SafePipe,
    NewestComponent,
    NgbdDatepickerPopup
  ],
  providers: [
    // SERVICES,
    AuthGuard,
    AlertService,
    AuthenticationService,
    UserService,
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: JwtInterceptor,
    //   multi: true
    // },
    ClaimService,
    BigchanDbService,
    OothService,
    Globals,
    VoteService,
    MongoService,
    SwarmService,
    GoogleGeoService,
    // provider used to create fake backend
    // fakeBackendProvider,
    Title,
    DatePipe,
    ImageCompressService,ResizeOptions
  ],
  entryComponents: [ModalContent],
  bootstrap: [AppComponent]
})

export class AppModule {


 }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
