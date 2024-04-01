import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError  } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  // private apiUrl = 'http://localhost:3000';
  private apiUrl = 'https://assgn3-pooja.wl.r.appspot.com';


  constructor(private http: HttpClient) { 
    }
  private watchlistState: any;
  private portfolioState: any;
  private searchState: any;
  private stockPriceState: any;
  private stockPriceTicker: any;


  getWatchlistData(): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/watchlist`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }

  getPortfolioData(): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/portfolio`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }
  getBalance(): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/wallet`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }

  putBalance(balance: number): Observable<any> {
    console.log('here')
    let item = {
      "balance": Number(balance)
    }
    return this.http.put(`${this.apiUrl}/wallet/${balance}`, item).pipe(
      catchError(error => {
        console.error('Error adding data:', error);
        return throwError(error);
      }));;
  }

  getWatchlistItem(sts: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/watchlist/${sts}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }

  getPortfolioItem(sts: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/portfolio/${sts}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }

  deleteWatchlistCompany(sts: string): Observable<any> {
    console.log('here')
    return this.http.delete(`${this.apiUrl}/watchlist/${sts}`).pipe(
      catchError(error => {
        console.error('Error deleting data:', error);
        return throwError(error);
      }));;
  }

  deletePortfolioCompany(sts: string): Observable<any> {
    console.log('here')
    return this.http.delete(`${this.apiUrl}/portfolio/${sts}`).pipe(
      catchError(error => {
        console.error('Error deleting data:', error);
        return throwError(error);
      }));;
  }

  addWatchlistCompany(sts:string, item: any): Observable<any> {
    console.log('here')
    return this.http.post(`${this.apiUrl}/watchlist`, item).pipe(
      catchError(error => {
        console.error('Error adding data:', error);
        return throwError(error);
      }));;
  }

  putPortfolioCompany(sts:string, item: any): Observable<any> {
    console.log('here')
    return this.http.put(`${this.apiUrl}/portfolio/${sts}`, item).pipe(
      catchError(error => {
        console.error('Error adding data:', error);
        return throwError(error);
      }));;
  }

  addPortfolioCompany(sts:string, item: any): Observable<any> {
    console.log('here')
    return this.http.post(`${this.apiUrl}/portfolio`, item).pipe(
      catchError(error => {
        console.error('Error adding data:', error);
        return throwError(error);
      }));;
  }

  setSearchState(state: any) {
    this.searchState = state;
    localStorage.setItem('searchState', JSON.stringify(state));
  }

  getSearchState() {
    let _searchState = localStorage.getItem('searchState');
    console.log(_searchState)
    if(_searchState){
      this.searchState = JSON.parse(_searchState)
    }
    console.log(this.searchState)
    
    return this.searchState;
  }

  setStockPriceState(state: any) {
    console.log(state)
    this.stockPriceState = state[0];
    this.stockPriceTicker = state[1];
    localStorage.setItem('stockPriceState', JSON.stringify(state))
  }

  getStockPriceState() {
    let _stockPriceState = localStorage.getItem('stockPriceState');
    console.log(_stockPriceState)
    if(_stockPriceState){
      this.stockPriceState = JSON.parse(_stockPriceState)
    }
    console.log(this.stockPriceState)
    return this.stockPriceState;
  }
  
  setWatchlistState(state: any) {    
    this.watchlistState = state;
    localStorage.setItem('watchlistState', JSON.stringify(state));
  }

  getWatchlistState() {
    let _watchlistState = localStorage.getItem('watchlistState');
    console.log(_watchlistState)
    if(_watchlistState){
      this.watchlistState = JSON.parse(_watchlistState)
    }
    console.log(this.watchlistState)
    return this.watchlistState;
  }

  setPortfolioState(state: any) {
    this.portfolioState = state;
    localStorage.setItem('portfolioState', JSON.stringify(state));
  }

  getPortfolioState() {
    let _portfolioState = localStorage.getItem('portfolioState');
    console.log(_portfolioState)
    if(_portfolioState){
      this.portfolioState = JSON.parse(_portfolioState)
    }
    console.log(this.portfolioState)
    return this.portfolioState;
  }



  getAutocompleteData(sts: string): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/autocomplete/${sts}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }




  

  getDescriptionData(sts: string): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/description/${sts}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }

  getQuoteData(sts: string): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/quote/${sts}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }

  getNewsData(sts: string): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/news/${sts}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }

  getRecommendationData(sts: string): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/recommendation/${sts}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }
  
  getSentimentData(sts: string): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/sentiment/${sts}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }
  getPeersData(sts: string): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/peers/${sts}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }

  getStockPriceData(sts: string, api_to: string): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/stock_price/${sts}/${api_to}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }

  getChartData(sts: string): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/chart/${sts}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }

  getEarningsData(sts: string): Observable<any[]> {
    // console.log('service');
    return this.http.get<any[]>(`${this.apiUrl}/earnings/${sts}`).pipe(
      catchError(error => {
        console.error('Error fetching data:', error);
        return throwError(error);
      }));
  }

  


}
