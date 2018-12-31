import { Injectable, Output, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Globals } from '../globals'
import { Observer } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Marker } from 'app/_models/marker';
// import { AnyARecord } from 'dns';

@Injectable()
export class GoogleGeoService {
    constructor(private http: Http, private globals: Globals, private router: Router) {

    }
    formatAddress(street: string, city: string, state: string, zip: string) {
        let formattedAddress = "";
        if (street) {
            formattedAddress += street.trim();
        }
        if (city) {
            formattedAddress += city.trim();
        }
        if (state) {
            formattedAddress += state.trim();
        }

        return encodeURIComponent(formattedAddress);
    }
    getGoogleGeoData(street: string, city: string, state: string, zip: string): any {
        let address = this.formatAddress(street, city, state, zip);
        return this.http.get(environment.GoogleGeocodingAPI.replace("{addr}", address));
    }
}
