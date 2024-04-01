import { Component, OnInit, } from '@angular/core';
import { DataService } from '../data.service';
import { tap } from "rxjs";
import { catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router, TitleStrategy } from '@angular/router';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit{


  constructor(private dataService: DataService, private router: Router, private route: ActivatedRoute, private searchService: SearchService) { }


  watchlist_data:any=[];
  icon!:any;
  isEmpty = true;
  justClick = true;
  showSpinner = false;
  ifRemove = false;
  showItem = '';
  showDataSpinner = false;


  ngOnInit() {
     this.showDataSpinner = true;
      this.dataService.getWatchlistData().subscribe((res) => {
        if(res.length>0){
          this.isEmpty = false;
          res.forEach((object: any) => {
          this.getQuote(object.ticker).subscribe({
            next: (obj) => {
              console.log(object.ticker, obj)
              object['c'] = obj.c;
              object['d'] = obj.d
              object['dp'] = obj.dp
              console.log(object)
            },
            error: (error) => {
             this.isEmpty = true;
            }});
          
          });
          this.watchlist_data = res;
          this.showDataSpinner = false;
    }else{      
      this.isEmpty = true;
      this.showDataSpinner = false;
    }
    
  });
    
  

}

navigate(sts: string){
  
  this.searchService.setSearchRoute('/search/'+sts)
  this.router.navigate(['/search', sts]);
}

  getQuote(sts: string) {  
    return this.dataService.getQuoteData(sts).pipe(
      map((res:any) => {
        res.dp = Math.round(res.dp * 100) / 100;
        console.log(res.dp);
        return res;
      }),
      catchError(error => {
        console.error('Error fetching quote data:', error);
        return throwError(() => new Error('Error fetching quote data'));
      })
    );
  }

  deleteElement(element:any){
    console.log(element)
    this.dataService.deleteWatchlistCompany(element.ticker).subscribe({
      next: (response) => {
        this.showItem = element.ticker;
        console.log('Successfully deleted from watchlist', response);
        this.watchlist_data = this.watchlist_data.filter((item:any) => item.ticker !== element.ticker);
        console.log(this.watchlist_data)
        if(this.watchlist_data.length==0){
          this.isEmpty = true;}
        this.ifRemove = true;
      },
      error: (error) => {
        console.error('There was an error!', error);
        // Handle the error response here
      }
    });
  }

  
}
