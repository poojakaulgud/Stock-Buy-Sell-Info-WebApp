import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchRoute: any = null;
  
  constructor() { }

  setSearchRoute(Route: any): void {
    this.searchRoute = Route;
  }

  getSearchRoute(): any {
    return this.searchRoute;
  }
}
