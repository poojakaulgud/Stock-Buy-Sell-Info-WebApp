import { Component, ElementRef, OnInit } from '@angular/core';
import { Router,Event as RouterEvent, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SearchService } from '../search.service';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{
  currentSearchRoute: string = '/search/home';

  constructor(private el: ElementRef, private router: Router, private searchService: SearchService) {  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Now that we've filtered the events, TypeScript knows this is a NavigationEnd event.
      if (event.urlAfterRedirects.startsWith('/search/') && !event.urlAfterRedirects.endsWith('/search/home')) {
        this.currentSearchRoute = event.urlAfterRedirects;
        this.searchService.setSearchRoute(this.currentSearchRoute)
      } 
      // else if (event.urlAfterRedirects === '/search/home') {
      //   // If navigating back to 'search/home', set it as the current search route.
      //   this.currentSearchRoute = '/search/home';
      //   this.searchService.setSearchRoute(this.currentSearchRoute)
      // }
    });
  }
  toggleSearchClass(){
    let link = this.searchService.getSearchRoute();
    console.log(link)
    // let search = this.el.nativeElement.querySelector('.search')
    // search.classList.add("active");
    // let watchlist = this.el.nativeElement.querySelector('.watchlist');
    // watchlist.classList.remove("active");
    // let portfolio = this.el.nativeElement.querySelector('.portfolio');
    // portfolio.classList.remove("active"); 
    if(link){      
    this.router.navigate([link]);
    }else{
      this.router.navigate([this.currentSearchRoute])
    }
  }

  togglePortfolioClass(){
    // let search = this.el.nativeElement.querySelector('.search')
    // search.classList.remove("active");
    // let watchlist = this.el.nativeElement.querySelector('.watchlist');
    // watchlist.classList.remove("active");
    // let portfolio = this.el.nativeElement.querySelector('.portfolio');
    // portfolio.classList.add("active");
  }

  toggleWatchlistClass(){
    // let search = this.el.nativeElement.querySelector('.search');
    // search.classList.remove("active");
    // let watchlist = this.el.nativeElement.querySelector('.watchlist');
    // watchlist.classList.add("active");
    // let portfolio = this.el.nativeElement.querySelector('.portfolio');
    // portfolio.classList.remove("active");
  }

  
}
