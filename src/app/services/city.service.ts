import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface City {
  name: string;
  asciiName: string;
  latitude: number;
  longitude: number;
  population: number;
}

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private citiesUrl = 'assets/data/cities-india.json';

  constructor(private http: HttpClient) { }
  getCities(): Observable<City[]> {
    return this.http.get<City[]>(this.citiesUrl);
  }
}
