import { Component, OnInit, ViewChild, ElementRef, Input, inject, AfterViewInit, OnDestroy, } from '@angular/core';
import { DataService } from '../data.service';
import { SearchService } from '../search.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from "rxjs";
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, TitleStrategy } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as Highcharts from 'highcharts/highstock';
import { Options } from 'highcharts';
import StockModule from 'highcharts/modules/stock';
import IndicatorsCore from 'highcharts/indicators/indicators-all';
import VBPModule from 'highcharts/indicators/volume-by-price';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { interval } from 'rxjs';
import { Subscription } from 'rxjs';

import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { HighchartsChartComponent } from 'highcharts-angular';
// import HC_more from 'highcharts/highcharts-more'
// import SMAModule from 'highcharts/indicators/indicators';
// import 'highcharts/indicators';

// HC_more(Highcharts);
// SMAModule(Highcharts);
IndicatorsCore(Highcharts);
StockModule(Highcharts);
VBPModule(Highcharts);
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';


@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
})
export class SearchBarComponent implements OnInit, AfterViewInit, OnDestroy {
  // @ViewChild('myChart') myChart!: HighchartsChartComponent;
  options: string[] = ['One', 'Two', 'Three'];
  myControl = new FormControl();
  sts: string = '';// Initialize the property here
  // Initialize the property here
  desc_data: any = {};
  quote_data: any = {};
  autocomplete_data: any = {};
  recommendation_data: any = {};
  sentiment_data: any = {};
  earnings_data: any = {};
  news_data: any = {};
  showSpinner = false;
  showDataSpinner = false;

  peers_data: any = {};
  stock_price_data: any = {};
  // main_chart_data: any = {};
  chart_response: any = {};
  rec_chart_data: any = {};
  earnings_chart_data: any = {};
  autocomplete_list: any = [];
  prompt_list: any = [];
  prompt: string = '';
  myForm!: FormGroup;
  isError: boolean = false;
  isClear: boolean = true;
  wallet: any={}
  // peer: string = '';
  timestamp = '';
  current_time = '';
  market_status = '';
  add_line = '';
  icon!: any;
  m_status!: any;
  news_rows: any = [];
  total_mspr!: number;
  positive_mspr!: number;
  negative_mspr!: number;
  total_change!: number;
  positive_change!: number;
  negative_change!: number;
  api_to = '';
  api_from = '';
  today = '';
  close_date = '';
  highcharts = Highcharts;
  stockChartOptions!: Options;
  recChartOptions!: Options;
  earningsChartOptions!: Options;
  mainChartOptions!: Options;
  chartKey = true;
  fill='';
  ifFill = false;
  ifBlock = false;
  justClick = false;
  showSellButton = false;
  bought = false;
  sold = false;
  text = ''
  private quoteSubscription!: Subscription;
  private intervalId: any;
  private newIntervalId: any;
  private requestInProgress = false;
  private newRequestInProgress = false;

  color = '';

  private modalService = inject(NgbModal);

  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger | undefined;
  constructor(private dataService: DataService, private searchService: SearchService,
    private formBuilder: FormBuilder, private cdr: ChangeDetectorRef, private el: ElementRef,
    private router: Router, private route: ActivatedRoute, public dialog: MatDialog) { 
      this.getCurrentDateTime()
    }


    ngAfterViewInit() {
      // this.mainChartOptions = {
      //   ...this.mainChartOptions,
      //   rangeSelector: {
      //     selected: 3
      //   }
      // };
      // this.cdr.detectChanges();
    }

  ngOnInit(): void {
    this.myForm = this.formBuilder.group({
      name: [''] // Default value is empty
    });
    this.getCurrentDateTime();
    this.route.paramMap.subscribe(params => {
      let new_sts = params.get('value');
      if (new_sts) {
        this.sts = new_sts.toUpperCase();
      }
      console.log('asdfghjk', this.sts);
    //   const searchResults = this.getStockData(); 
    // this.searchService.setSearchResults(searchResults);
      const searchResults = this.dataService.getSearchState();
      if(searchResults){console.log(searchResults[11], typeof searchResults, searchResults)}
      
      if(searchResults && searchResults[11]===this.sts){
        this.forkJoinFunc(searchResults)
        console.log('HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE')
      }else{
        this.getStockData()
        console.log('ELSE HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE')
      }
    });
    
       this.dataService.getWatchlistItem(this.sts.toUpperCase()).subscribe({
              next: (response) => {
                console.log('FILLLLLLLLLLL', response);
                this.ifFill=true;
              },
              error: (error) => {
                console.error('There was an error!', error);
                this.ifFill= false;
              }
            });
    

   
            this.dataService.getPortfolioItem(this.sts.toUpperCase()).subscribe({
              next: (response) => {
                console.log('FILLLLLLLLLLL', response);
                this.showSellButton=true;
              },
              error: (error) => {
                console.error('There was an error!', error);
                this.showSellButton= false;
              }
            });
    
    

    // Subscribe to value changes of the 'name' field
    this.myForm.get('name')!.valueChanges.pipe(
      filter(res => res !== null && res.trim().length > 0),
      distinctUntilChanged(),
      debounceTime(200),
      tap(() => {
        this.showSpinner = true;
        this.autocomplete_list = [];
      })).subscribe(value => {
        console.log(value);
        this.dataService.getAutocompleteData(value).subscribe((res) => {
          this.autocomplete_data = res;
          this.showSpinner = false;
          console.log(this.autocomplete_data);
          this.autocomplete_list = this.autocomplete_data.result.filter((item: { displaySymbol: string, type: string }) => !item.displaySymbol.includes('.') && item.type === "Common Stock");
        });
      });


     
      
      



    // this.myControl.value
    // this.myControl.valueChanges.pipe(
    //   filter(res => {
    //     return res !== null
    //   }),
    //   distinctUntilChanged(),
    //   debounceTime(200),
    //   tap(() => {
    //     this.autocomplete_list = []
    //   }),
    //   switchMap((value) => this.dataService.getAutocompleteData(value))
    // )
    //   .subscribe((data) => {
    //     this.autocomplete_data = data
    //       this.autocomplete_list = this.autocomplete_data.result;
    //       console.log(this.autocomplete_list);
    //     }
    //   )

  }


  ngOnDestroy() {
    if (this.quoteSubscription) {
      this.quoteSubscription.unsubscribe();
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.newIntervalId) {
      clearInterval(this.newIntervalId);
    }
  }

  callStockPriceHighcharts() {
    // highcharts = Highcharts;
    if (this.icon) {
      this.color = 'green'
    } else {
      this.color = 'red'
    }
    this.stockChartOptions = {
      chart: {
        type: "line",
        backgroundColor: "#f6f6f6"
      },
      title: {
        text: this.sts.toUpperCase() + " Hourly Price Variation"
      },
      xAxis: {
        type: 'datetime'
      },
      scrollbar: {
        enabled: true
      },
      //   tooltip: {
      //      valueSuffix:" °C"
      //   },
      yAxis: {
        opposite: true,
        tickAmount: 6,
        title:{
          text:null
        }
      },
      legend:{
        enabled: false,
      },
      series: [{
        type: 'line',
        name: 'StockPrice',
        data: this.stock_price_data.StockPrice,
        marker: {
          enabled: false // This hides the markers/points on the line
        },
        color: this.color,
      }]
    };
  }

  isObjectNotEmpty(obj: any): boolean {
    // console.log(Object.keys(obj).length);
    return Object.keys(obj).length > 0;
  }

  sendTheNewValue(event: any) {
    this.prompt = event.target.value;
  }

  displayWith(value: any) {
    if (value === null) return '';
    return value;
  }

  onAutoSelect() {
    this.sts = this.sts;
    const searchResults = this.dataService.getSearchState();
      if(searchResults && searchResults[11]===this.sts){
        this.forkJoinFunc(searchResults)
      }else{
        this.getStockData()
      }
  }

  openDialog(rowIndex: any, articleIndex: any) {
    const modalRef = this.modalService.open(NgbdModalContent);
    let innerArray = this.news_rows[rowIndex];
    let article = innerArray[articleIndex];
    console.log(modalRef.componentInstance);
    modalRef.componentInstance.source = article.source;
    const myDate = new Date(article.datetime * 1000);
    let y = myDate.getFullYear();
    let m = myDate.toLocaleString('default', { month: 'long' });;
    let d = myDate.getDate();
    let p_date = d.toString() + ' ' + m + ', ' + y;
    modalRef.componentInstance.date = p_date;
    modalRef.componentInstance.title = article.headline;
    modalRef.componentInstance.description = article.summary;
    modalRef.componentInstance.url = article.url;
  }


  openBuyDialog(desc: any, quote: any, action:string) {
    const modalRef = this.modalService.open(NgbdModalBuyContent);
    console.log(modalRef.componentInstance);
    modalRef.componentInstance.ticker = desc.ticker;
    modalRef.componentInstance.description = desc.name;
    
    modalRef.componentInstance.action = action;
    modalRef.componentInstance.c = quote.c;
    modalRef.componentInstance.balance = Math.round(this.wallet.balance*100)/100;
    
    modalRef.result.then(
      (result) => {
        console.log("Modal closed with result:", result);
        let myArray = result.split(" ");
        this.text = myArray[0];
        if(myArray[1]==='buy'){this.bought = true;}
        if(myArray[1]==='sell'){this.sold = true;}
        if(myArray[1]==='add'){this.showSellButton = true; this.bought = true}
        
      },
      (reason) => {
        console.log("Modal dismissed with reason:", reason);
      }
    );

  }

  clearFunc() {
    this.isError = false;
    this.myControl.reset();
    this.cdr.detectChanges();
    this.isClear = false;
    
    this.searchService.setSearchRoute('/search/'+this.sts)
    this.router.navigate(['/search/home']);
  }




  somefunc() {
    this.sts = this.sts;
    const searchResults = this.dataService.getSearchState();
      if(searchResults && searchResults[11]===this.sts){
        this.forkJoinFunc(searchResults)
      }else{
        this.getStockData()
      }
  }



  getStockData() {
    this.showDataSpinner = true; 
    this.isClear = false;
    this.isError = false;
    if (this.autocompleteTrigger) {
      this.autocompleteTrigger.closePanel();
    }
    if (this.sts) {
      const stsuc = this.sts.toUpperCase();

      const requests = [
        this.dataService.getDescriptionData(stsuc).pipe(
          catchError(error => {
            console.error('Error fetching description data', error);
            return of(null); // Continue execution even if there's an error
          })
        ),
        this.dataService.getWatchlistItem(stsuc).pipe(
          catchError(error => {
            console.error('Error fetching description data', error);
            return of(null); // Continue execution even if there's an error
          })
        ),
        this.dataService.getPortfolioItem(stsuc).pipe(
          catchError(error => {
            console.error('Error fetching description data', error);
            return of(null); // Continue execution even if there's an error
          })
        ),
        this.dataService.getBalance().pipe(
          catchError(error => {
            console.error('Error fetching description data', error);
            return of(null); // Continue execution even if there's an error
          })
        ),
        this.dataService.getQuoteData(stsuc).pipe(
          catchError(error => {
            console.error('Error fetching description data', error);
            return of(null); // Continue execution even if there's an error
          })
        ),
        this.dataService.getNewsData(stsuc).pipe(
          catchError(error => {
            console.error('Error fetching description data', error);
            return of(null); // Continue execution even if there's an error
          })
        ),
        this.dataService.getRecommendationData(stsuc).pipe(
          catchError(error => {
            console.error('Error fetching description data', error);
            return of(null); // Continue execution even if there's an error
          })
        ),
        this.dataService.getEarningsData(stsuc).pipe(
          catchError(error => {
            console.error('Error fetching description data', error);
            return of(null); // Continue execution even if there's an error
          })
        ),
        this.dataService.getSentimentData(stsuc).pipe(
          catchError(error => {
            console.error('Error fetching description data', error);
            return of(null); // Continue execution even if there's an error
          })
        ),
        this.dataService.getPeersData(stsuc).pipe(
          catchError(error => {
            console.error('Error fetching description data', error);
            return of(null); // Continue execution even if there's an error
          })
        ),
        this.dataService.getChartData(stsuc).pipe(
          catchError(error => {
            console.error('Error fetching description data', error);
            return of(null); // Continue execution even if there's an error
          })
        ),
        
      ];

      forkJoin(requests).subscribe({
        next: ([descData, watchlistItem, portfolioItem, walletData, quoteData, newsData, recData, earData, sentiData, peersData, chartData]) => {
          this.forkJoinFunc([descData, watchlistItem, portfolioItem, walletData, quoteData, newsData, recData, earData, sentiData, peersData, chartData, stsuc]);
          this.dataService.setSearchState([descData, watchlistItem, portfolioItem, walletData, quoteData, newsData, recData, earData, sentiData, peersData, chartData, stsuc])
        },
        error: (error) => {
          // Handle any errors that might occur with the combined observable
          console.error('An error occurred with the requests', error);
          this.showDataSpinner = false;
        }
      });
    }else{      
      this.isError = true;
      this.showDataSpinner = false;
    }


    }

    forkJoinFunc(array: any){
      
          // this.sts = array[11]
          this.desc_data = array[0];
          
          if (!(this.isObjectNotEmpty(this.desc_data))) {
            console.log('here')
            this.isError = true;
            
          }
          this.ifFill = !!array[1]; 
          this.showSellButton = !!array[2]
          this.wallet = array[3][0]        
          this.quote_data = array[4];
          this.quote_data.dp = Math.round(this.quote_data.dp * 100) / 100;
          console.log('quote',this.quote_data.dp);
          this.newCall();
          this.news_data = array[5];
          console.log('news', this.news_data);
          let articles = this.news_data;
          this.fillRows(articles);
          this.recommendation_data = array[6];
          console.log('recommendation', this.recommendation_data);
          this.getRecommendationTrends();
          this.earnings_data = array[7];
          console.log('EARNINGS', this.earnings_data);
          this.getEarnings();
          this.sentiment_data = array[8];
          console.log('sentiment', this.sentiment_data);
          this.total_mspr = this.sentiment_data.data.reduce((acc: number, curr: { mspr: number }) => acc + curr.mspr, 0);
          this.total_mspr = Math.round(this.total_mspr * 100) / 100
          console.log(this.total_mspr);
          this.positive_mspr = this.sentiment_data.data.filter((item: { mspr: number }) => item.mspr > 0).reduce((acc: number, curr: { mspr: number }) => acc + curr.mspr, 0);
          this.negative_mspr = this.sentiment_data.data.filter((item: { mspr: number }) => item.mspr < 0).reduce((acc: number, curr: { mspr: number }) => acc + curr.mspr, 0);
          this.positive_mspr = Math.round(this.positive_mspr * 100) / 100
          this.negative_mspr = Math.round(this.negative_mspr * 100) / 100
          console.log(this.positive_mspr, this.negative_mspr);
          this.total_change = this.sentiment_data.data.reduce((acc: number, curr: { change: number }) => acc + curr.change, 0);
          console.log(this.total_change);
          this.positive_change = this.sentiment_data.data.filter((item: { change: number }) => item.change > 0).reduce((acc: number, curr: { change: number }) => acc + curr.change, 0);
          this.negative_change = this.sentiment_data.data.filter((item: { change: number }) => item.change < 0).reduce((acc: number, curr: { change: number }) => acc + curr.change, 0);
          console.log(this.positive_change, this.negative_change);          
          this.peers_data = array[9].filter((item: any) => !item.includes('.'));
          console.log('peers', this.peers_data);
          this.chart_response = array[10];
          console.log('MAIN CHART', this.chart_response);
          this.addMainChartData();

          
          this.isClear = true;
          this.showDataSpinner = false;
    }

    scheduleQuoteUpdate() {
      this.intervalId = setInterval(() => {
        if (!this.requestInProgress) {
          this.requestInProgress = true;
          this.quoteSubscription = this.dataService.getQuoteData(this.sts).subscribe({
            next: (res) => {
              this.quote_data = res;
              this.quote_data.dp = Math.round(this.quote_data.dp * 100) / 100;
              console.log(this.quote_data.dp);
              console.log('CHECKKKKKKKKKK');
              if (this.quote_data.dp < 0) {
                this.icon = false;
              } else {
                this.icon = true;
              }
              this.getTimestamp();
              // this.getCurrentDateTime();
              let lastTimestamp = this.quote_data.t * 1000;
              const currentTime = new Date().getTime();
              const timeDifferenceMinutes = (currentTime - lastTimestamp) / (1000 * 60);
              if (timeDifferenceMinutes > 5) {
                this.market_status = 'Closed';
                this.add_line = 'Market Closed on ' + this.timestamp;
                this.m_status = false;
              } else {
                this.market_status = 'Open';
                this.add_line = 'Market is Open';
                this.m_status = true;
              }

              if (this.market_status === 'Open') {
                this.api_to = this.today;
              } else {
                this.api_to = this.close_date;
              }
              console.log('COMPANY QUOTE', this.quote_data);
            },
            error: (error) => {
              console.error(error);
            },
            complete: () => {
              this.requestInProgress = false;
            }
          });
        }
      }, 15000);
    }


  


  // getStockData() {
  //   this.showSpinner = true; 
  //   if (this.autocompleteTrigger) {
  //     this.autocompleteTrigger.closePanel();
  //   }
  //   if (this.sts) {


  //     this.dataService.getDescriptionData(this.sts).subscribe((res) => {
  //       this.desc_data = res;
  //       if (this.isObjectNotEmpty(this.desc_data) === false) {
  //         this.isError = true;
  //       }
  //       console.log('COMPANY DESCRIPTION', this.desc_data);
  //     });

  //     this.dataService.getWatchlistItem(this.sts.toUpperCase()).subscribe({
  //       next: (response) => {
  //         console.log('FILLLLLLLLLLL', response);
  //         this.ifFill=true;
  //       },
  //       error: (error) => {
  //         console.error('There was an error!', error);
  //         this.ifFill= false;
  //       }
  //     });

  //     this.dataService.getPortfolioItem(this.sts.toUpperCase()).subscribe({
  //       next: (response) => {
  //         console.log('FILLLLLLLLLLL', response);
  //         this.showSellButton=true;
  //       },
  //       error: (error) => {
  //         console.error('There was an error!', error);
  //         this.showSellButton= false;
  //       }
  //     });


  //     this.dataService.getBalance().subscribe((res) => {
  //       this.wallet = res[0]        
  //       console.log('wallet', this.wallet)
  //     });


      
  //     this.dataService.getQuoteData(this.sts).subscribe((res) => {
  //       this.quote_data = res;
  //       this.quote_data.dp = Math.round(this.quote_data.dp * 100) / 100;
  //       console.log(this.quote_data.dp);
  //       this.newCall();
  //       console.log('COMPANY QUOTE', this.quote_data);
  //     });
  //     this.dataService.getNewsData(this.sts).subscribe((res) => {
  //       this.news_data = res;
  //       console.log('news', this.news_data);
  //       let articles = this.news_data;
  //       this.fillRows(articles);
  //     });
  //     this.dataService.getRecommendationData(this.sts).subscribe((res) => {
  //       this.recommendation_data = res;
  //       console.log('recommendation', this.recommendation_data);
  //       this.getRecommendationTrends();
  //     });
  //     this.dataService.getEarningsData(this.sts).subscribe((res) => {
  //       this.earnings_data = res;
  //       console.log('EARNINGS', this.earnings_data);
  //       this.getEarnings();
  //     });
  //     this.dataService.getSentimentData(this.sts).subscribe((res) => {
  //       this.sentiment_data = res;
  //       console.log('sentiment', this.sentiment_data);
  //       this.total_mspr = this.sentiment_data.data.reduce((acc: number, curr: { mspr: number }) => acc + curr.mspr, 0);
  //       this.total_mspr = Math.round(this.total_mspr * 100) / 100
  //       console.log(this.total_mspr);
  //       this.positive_mspr = this.sentiment_data.data.filter((item: { mspr: number }) => item.mspr > 0).reduce((acc: number, curr: { mspr: number }) => acc + curr.mspr, 0);
  //       this.negative_mspr = this.sentiment_data.data.filter((item: { mspr: number }) => item.mspr < 0).reduce((acc: number, curr: { mspr: number }) => acc + curr.mspr, 0);
  //       this.positive_mspr = Math.round(this.positive_mspr * 100) / 100
  //       this.negative_mspr = Math.round(this.negative_mspr * 100) / 100
  //       console.log(this.positive_mspr, this.negative_mspr);
  //       this.total_change = this.sentiment_data.data.reduce((acc: number, curr: { change: number }) => acc + curr.change, 0);
  //       console.log(this.total_change);
  //       this.positive_change = this.sentiment_data.data.filter((item: { change: number }) => item.change > 0).reduce((acc: number, curr: { change: number }) => acc + curr.change, 0);
  //       this.negative_change = this.sentiment_data.data.filter((item: { change: number }) => item.change < 0).reduce((acc: number, curr: { change: number }) => acc + curr.change, 0);
  //       console.log(this.positive_change, this.negative_change);

  //     });
  //     this.dataService.getPeersData(this.sts).subscribe((res) => {
  //       this.peers_data = res;
  //       console.log('peers', this.peers_data);
  //     });
  //     this.dataService.getChartData(this.sts).subscribe((res) => {
  //       this.chart_response = res;
  //       console.log('MAIN CHART', this.chart_response);
  //       this.addMainChartData();
  //     });

  //   }


  // }

  addMainChartData() {
    let ohlc: any = []
    let volume: any = []
    this.chart_response.forEach((object: any) => {
      ohlc.push([object['t'], object['o'], object['h'], object['l'], object['c']]);
      volume.push([object['t'], object['v']]);
    });
    let main_chart_data:any = {}
    main_chart_data['ohlc'] = ohlc;
    main_chart_data['volume'] = volume
    main_chart_data['groupingUnits'] = [[
      'week',
      [1]
    ], [
      'month',
      [1, 2, 3, 4, 6]
    ]];

    if(ohlc.length > 0 && volume.length > 0){
      console.log('calling func');
    this.callMainChart(main_chart_data);
    }
  }

  callMainChart(main_chart_data: any) {
    console.log('HEREEEEEEE', main_chart_data);
    this.mainChartOptions = {
      
      navigator: {
        enabled:true,
    },
      rangeSelector: {    
        selected: 2,
        enabled: true,
        inputEnabled: true,
    //     buttons: [{
    //       type: 'month',
    //       count: 1,
    //       text: '1m'
    //   }, {
    //       type: 'month',
    //       count: 3,
    //       text: '3m'
    //   },{
    //       type: 'month',
    //       count: 6,
    //       text: '6m',
    //   }, {
    //       type: 'ytd',
    //       text: 'YTD',
    //       title: 'View year to date'
    //   },{
    //     type: 'year',
    //     text: '1y',
    //     title: '1y'
    // }, {
    //       type: 'all',
    //       text: 'All',
    //       title: 'View all'
    //   }],    
      },

      title: {
        text: this.sts.toUpperCase() + ' Historical'
      },

      subtitle: {
        text: 'With SMA and Volume by Price technical indicators'
      },
      xAxis: {
        type: 'datetime',
        ordinal: true,
      },
      legend:{
        enabled: false,
      },

      yAxis: [{
        opposite: true,
        startOnTick: false,
        endOnTick: false,
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'OHLC'
        },
        height: '60%',
        lineWidth: 2,
        resize: {
          enabled: true
        },
        tickAmount:4,
      }, {
        opposite: true,
        labels: {
          align: 'right',
          x: -3
        },
        title: {
          text: 'Volume'
        },
        top: '65%',
        height: '35%',
        offset: 0,
        tickAmount:3,
        lineWidth: 2
      }],

      tooltip: {
        split: true
      },
      scrollbar:{
        enabled: true
      },

      plotOptions: {
        series: {
          dataGrouping: {
            units: this.getGU(main_chart_data),
          }
        }
      },

      series: [{
        type: 'candlestick',
        id: 'ohlc',
        name: this.sts.toUpperCase(),
        zIndex: 2,
        data: this.getOHLC(main_chart_data)
      }, {
        type: 'column',
        id: 'volume',
        name: 'Volume',
        data: this.getV(main_chart_data),
        yAxis: 1
      }, {
        type: 'vbp',
        linkedTo: 'ohlc',
        params: {
          volumeSeriesID: 'volume'
        },
        dataLabels: {
          enabled: false
        },
        zoneLines: {
          enabled: false
        }
      }, {
        type: 'sma',
        linkedTo: 'ohlc',
        zIndex: 1,
        marker: {
          enabled: false
        }
      }]
    };
    // this.cdr.detectChanges();
  };

  getGU(main_chart_data: any){
    return main_chart_data.groupingUnits;
  }
  getV(main_chart_data: any){
    return main_chart_data.volume;
  }
  getOHLC(main_chart_data: any){
    return main_chart_data.ohlc;
  }


  


getEarnings(){
  let dates: any = []
  let surprise: any = []
  let actual: any = []
  let estimate: any = []
  this.earnings_data.forEach((object: any) => {
    dates.push(object['period']);
    surprise.push(object['surprise']);
    actual.push(object['actual']);
    estimate.push(object['estimate']);
  });
  this.earnings_chart_data['dates'] = dates;
  this.earnings_chart_data['surprise'] = surprise;
  this.earnings_chart_data['actual'] = actual;
  this.earnings_chart_data['estimate'] = estimate;
  console.log('CHECK EARCHART DATA', this.earnings_chart_data);
  this.callEarChart();
}

getRecommendationTrends(){
  let dates: any = []
  let strong_buy: any = []
  let buy: any = []
  let hold: any = []
  let sell: any = []
  let strong_sell: any = []

  this.recommendation_data.forEach((object: any) => {
    dates.push(object['period']);
    strong_buy.push(object['strongBuy']);
    buy.push(object['buy']);
    hold.push(object['hold']);
    sell.push(object['sell']);
    strong_sell.push(object['strongSell']);
  });
  this.rec_chart_data['dates'] = dates;
  this.rec_chart_data['strong_buy'] = strong_buy;
  this.rec_chart_data['buy'] = buy;
  this.rec_chart_data['hold'] = hold;
  this.rec_chart_data['sell'] = sell;
  this.rec_chart_data['strong_sell'] = strong_sell;
  console.log('CHECK RECHCART DATA', this.rec_chart_data);
  this.callRecChart();
}

callEarChart(){
  this.earningsChartOptions = {
    chart: {
      type: "spline",
      backgroundColor: "#f6f6f6"
    },
    title: {
      text: "Historical EPS Surprises"
    },
    xAxis: [{
      categories: this.earnings_chart_data.dates,
    }, { // Secondary x-axis
      categories: this.earnings_chart_data.surprise, // Define your second x-axis categories here
      linkedTo: 0, // This links the secondary axis to the primary axis
      opposite: false,
      labels: {
        formatter: function () {
          return 'Surprise: ' + this.value; // You can customize the label text here
        } // This will place the secondary x-axis on the opposite side
      },
      lineWidth: 0, // Hides the axis line
      minorTickLength: 0, // Hides the minor ticks
      tickLength: 0, // Hides the major ticks
      gridLineWidth: 0, // Hides the grid lines
      title: {
        text: null // Hides the axis title
      },
      offset: 15
    }],
    scrollbar: {
      enabled: false
    },
    //   tooltip: {
    //      valueSuffix:" °C"
    //   },
    yAxis: {
      opposite: false,
      tickAmount: 6,
      title: {
        text: 'Quarterly EPS',
      },
    },
    series: [{
      type: 'spline',
      name: 'Actual',
      data: this.earnings_chart_data.actual,
      marker: {
        enabled: true // This hides the markers/points on the line
      },
      // color: this.color,
    },
    {
      type: 'spline',
      name: 'Estimate',
      data: this.earnings_chart_data.estimate,
      marker: {
        enabled: true // This hides the markers/points on the line
      },
      //  color: this.color,
    }]
  };
}

callRecChart(){
  this.recChartOptions = {
    chart: {
      type: "column",
      backgroundColor: "#f6f6f6"
    },
    title: {
      text: "Recommendation Trends"
    },
    xAxis: {
      categories: this.rec_chart_data.dates,
    },
    scrollbar: {
      enabled: false
    },
    //   tooltip: {
    //      valueSuffix:" °C"
    //   },
    yAxis: {
      min: 0,
      title: {
        text: '#Analysis',
      },
      labels: {
        overflow: 'justify'
      }
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true
        }
      },
      series: {
        stacking: 'normal'
      }
    },
    series: [{
      type: 'column',
      name: 'Strong Buy',
      data: this.rec_chart_data.strong_buy,
      color: '#114f0e'
    },
    {
      type: 'column',
      name: 'Buy',
      data: this.rec_chart_data.buy,
      color: '#429418'
    },
    {
      type: 'column',
      name: 'Hold',
      data: this.rec_chart_data.hold,
      color: '#947518',
    },
    {
      type: 'column',
      name: 'Sell',
      data: this.rec_chart_data.sell,
      color: '#d13058',
    },
    {
      type: 'column',
      name: 'Strong Sell',
      data: this.rec_chart_data.strong_sell,
      color: '#591e0c',
    }]
  };
}



fillRows(articles: any){
  const itemsPerRow = 2; // for example, for 3 articles per row
  let rows = []
  for (let i = 0; i < articles.length; i += itemsPerRow) {
    rows.push(articles.slice(i, i + itemsPerRow));
  }
  if (rows) {
    this.news_rows = rows;
    console.log('NEWS_ROWS', this.news_rows)
  }
}

newCall(){
  // if(this.quote_data.length>0){
  console.log('CHECKKKKKKKKKK');
  // let tag = this.el.nativeElement.querySelector('.checkColor');
  if (this.quote_data.dp < 0) {
    // tag.classList.add("text-danger");
    this.icon = false;
  } else {
    // tag.classList.add("text-success");
    this.icon = true;
  }
  this.getTimestamp();
  this.getCurrentDateTime();
  this.isMarketOpen();
  // }
}

toggleWatchlist(desc_data:any, quote_data:any){
  console.log('NEW', desc_data)
  let itemData = {
    'ticker': desc_data.ticker,
    'description': desc_data.name,
  }
  if(this.ifFill){
    this.dataService.deleteWatchlistCompany(desc_data.ticker).subscribe({
      next: (response) => {
        console.log('Successfully deleted from watchlist', response);
        
        this.justClick = true;
        this.ifFill = false;
        this.ifBlock = false;
      },
      error: (error) => {
        console.error('There was an error!', error);
        // Handle the error response here
      }
    });
  }
  else{
    
  this.dataService.addWatchlistCompany(desc_data.ticker, itemData).subscribe({
    next: (response) => {
      // Handle the successful response here
      console.log('Item updated successfully', response);
      
      
      this.justClick = true;
      this.ifFill = true;
      this.ifBlock = true;
    },
    error: (error) => {
      // Handle errors here
      console.error('Error updating item', error);
    }
  });
  }
}

isMarketOpen() {
  // Convert lastTimestamp to milliseconds (assuming it's in seconds)
  let lastTimestamp = this.quote_data.t * 1000;

  // Calculate the current time in milliseconds
  const currentTime = new Date().getTime();

  // Calculate the time difference in minutes
  const timeDifferenceMinutes = (currentTime - lastTimestamp) / (1000 * 60);

  // If more than 5 minutes have elapsed, the market is considered closed

  // let statustag = this.el.nativeElement.querySelector('.checkStatus');
  if (timeDifferenceMinutes > 5) {
    this.market_status = 'Closed';
    this.add_line = 'Market Closed on ' + this.timestamp; 
    this.m_status = false;
    let now = new Date();
    // Get the components of the current date and time
    let year = now.getFullYear();
    let month = ('0' + (now.getMonth() + 1)).slice(-2);
    let day = ('0' + now.getDate()).slice(-2);
    let hours = ('0' + now.getHours()).slice(-2);
    let minutes = ('0' + now.getMinutes()).slice(-2);
    let seconds = ('0' + now.getSeconds()).slice(-2);

    this.current_time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    this.today = `${year}-${month}-${day}`;
  } else {
    this.market_status = 'Open';
    this.add_line = 'Market is Open';
    this.m_status = true;      
    this.scheduleQuoteUpdate();
  }

  if (this.market_status === 'Open') {
    this.api_to = this.today;
  } else {
    this.api_to = this.close_date;
  }

  const stockPriceState = this.dataService.getStockPriceState();
  console.log(stockPriceState)
  if(stockPriceState && stockPriceState[1]===this.sts){
    this.stock_price_data = stockPriceState[0];
    console.log('STOCK PRICE', this.stock_price_data.StockPrice);
    this.callStockPriceHighcharts();
    console.log('IFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')
  }else{
    console.log('ELSEEEEEEEEEEEEEEEEEEEEEEEEEE')
  this.dataService.getStockPriceData(this.sts, this.api_to).subscribe((res) => {
    this.stock_price_data = res;
    console.log('STOCK PRICE', this.stock_price_data.StockPrice);
    this.callStockPriceHighcharts(); 
    this.dataService.setStockPriceState([this.stock_price_data, this.sts])
  });
  }
}



getCurrentDateTime() {
  this.newIntervalId = setInterval(() => {
   
  let now = new Date();

  // Get the components of the current date and time
  let year = now.getFullYear();
  let month = ('0' + (now.getMonth() + 1)).slice(-2);
  let day = ('0' + now.getDate()).slice(-2);
  let hours = ('0' + now.getHours()).slice(-2);
  let minutes = ('0' + now.getMinutes()).slice(-2);
  let seconds = ('0' + now.getSeconds()).slice(-2);

  this.current_time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  this.today = `${year}-${month}-${day}`;

}, 15000);
}



getTimestamp(){
  
  let date = new Date((this.quote_data.t) * 1000);
  console.log(this.quote_data.t)
  // Get the components of the date
  let year = date.getFullYear();
  console.log(year)
  let month = ('0' + (date.getMonth() + 1)).slice(-2); // Adding 1 because months are zero-based
  let day = ('0' + date.getDate()).slice(-2);
  let hours = ('0' + date.getHours()).slice(-2);
  let minutes = ('0' + date.getMinutes()).slice(-2);
  let seconds = ('0' + date.getSeconds()).slice(-2);

  // Format the date
  this.timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  this.close_date = `${year}-${month}-${day}`
  console.log(this.timestamp)

}

changeStockData(event: MouseEvent, peer: string){
  event.preventDefault();
  // this.clearFunc();
  console.log(peer);
  this.sts = peer;
  // this.myControl.setValue(peer);
  
  this.searchService.setSearchRoute('/search/'+this.sts)
  this.router.navigate(['/search', this.sts]);
  // this.getStockData();
}
}

@Component({
  selector: 'ngbd-modal-content',
  standalone: true,
  template: `      
		<div class="modal-header">	          
    <div><h2 class="modal-title mb-0">{{source}}</h2><p>{{date}}</p></div>    
    <button type="button" class="btn-close float-right position-relative-top" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
		</div>    
		<div class="modal-body">
			<h3 class="modal-title">{{title}}</h3>
      <h5>{{description}}</h5>
      <p>For more details click here <a href="{{url}}" target="_blank">here</a>
		</div>
		<div class="card px-4 py-2">
			<p class="modal-title">Share</p>
      <p><a target='_blank' class="twitter-share-button"
      href="https://twitter.com/intent/tweet?title={{title}}&url={{url}}">
      <svg width="5vw" height="5vh" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg></a>
      <a target="_blank" 
      href="https://www.facebook.com/sharer/sharer.php?u={{ url }}" class="fb-xfbml-parse-ignore">
      <svg width="5vw" height="5vh" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" id="facebook"><path fill="#1976D2" d="M14 0H2C.897 0 0 .897 0 2v12c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V2c0-1.103-.897-2-2-2z"></path><path fill="#FAFAFA" fill-rule="evenodd" d="M13.5 8H11V6c0-.552.448-.5 1-.5h1V3h-2a3 3 0 0 0-3 3v2H6v2.5h2V16h3v-5.5h1.5l1-2.5z" clip-rule="evenodd"></path></svg></a></p>
      </div>
	`,
})
export class NgbdModalContent {
  activeModal = inject(NgbActiveModal);

  @Input() source!: string;
  @Input() date!: string;
  @Input() title!: string;
  @Input() description!: string;
  @Input() url!: string;


}


@Component({
  selector: 'ngbd-modal-buy',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `   
  
        <div class="modal-header">
          <h2 class="modal-title" id="purchaseModalLabel">{{ticker}}</h2>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" (click)="activeModal.dismiss('Cross click')"></button>
        </div>
        <div class="modal-body">
          <p>Current Price: {{c}}</p>
          <p>Money in Wallet: $ {{balance}}</p>
          <div class="mb-3">
            <div class="row"><div class="col-2"><label for="quantityInput" class="form-label">Quantity:</label></div>
            <div class="col-10"><input type="number" class="form-control" [formControl]="quantityControl" (input)="calculateTotal()" id="quantityInput"></div></div>
            <p *ngIf="showWarning && showBuyButton" class="text-danger">Not enough money in wallet!</p>
            <p *ngIf="showWarning && showSellButton" class="text-danger">You cannot sell the stocks that you don't have!</p>
          </div>
        </div>
        <div class="modal-footer">
          <div class="d-flex justify-content-between align-items-center w-100">
            <p class="mb-0">Total: <span>{{total}}</span></p>
            <button type="button" *ngIf="showBuyButton" class="btn btn-success" [disabled]="disableButton" (click)="buy()">Buy</button>
            <button type="button" *ngIf="showSellButton" class="btn btn-success" [disabled]="disableButton" (click)="sell()">Sell</button>
          </div>
        </div>

      `,
})
export class NgbdModalBuyContent implements OnInit{
  activeModal = inject(NgbActiveModal);
  quantityControl = new FormControl(0);  
  showWarning = false;
  disableButton = true;
  showBuyButton = false;
  showSellButton = false;
  total!: number;
  @Input() element!: {};
  @Input() ticker!: '';
  // @Input() balance!: number;
  @Input() c!: number;
  @Input() description!: '';
  @Input() action: any;
  balance!: number;

  qty!:number;
  

  constructor(private dataService: DataService) {
    this.calculateTotal(); // Initial total calculation
  }

  ngOnInit(): void {
    this.dataService.getBalance().subscribe((res) => {
      let wallet = res[0]        
      console.log('wallet', wallet)
      this.balance = Math.round(wallet.balance*100)/100
      console.log('BALANCE', this.balance)
    });
    console.log(this.action, typeof this.action)
    if(this.action==='Buy'){
      this.showBuyButton = true;
    }
    if(this.action==='Sell'){
      this.showSellButton = true;
      this.dataService.getPortfolioItem(this.ticker.toUpperCase()).subscribe({
        next: (response) => {
          console.log('SOME RESPONSE', response);
          // this.selling(response, quantity, total);
          this.qty = response.qty;
        },
        error: (error) => {
          console.error('There was an error!', error);
          // this.adding(quantity, total);
        }
      });
    }
  }

  

  calculateTotal() {
    this.c=this.c
    let quantity = Number(this.quantityControl.value);
    console.log(quantity, this.c)
    if (quantity !== null && quantity>0) {
      this.disableButton = false;
      this.total = Math.round((quantity * this.c) *100)/100;
      console.log(this.total);
      if(this.total>this.balance && this.showBuyButton){
        this.showWarning = true;
        this.disableButton = true;
        console.log(this.showWarning)
      }else if(quantity>this.qty && this.showSellButton){
        this.showWarning = true;
        this.disableButton = true;
        console.log('here')
      }else{
        this.showWarning = false;
      }
    } else {
      console.log('NULL QUANTITY')      
      this.disableButton = true;
    }
  }

  sell(){
    let quantity = this.quantityControl.value;
    let total = this.total;
    let c = this.c;
    this.dataService.getPortfolioItem(this.ticker.toUpperCase()).subscribe({
      next: (response) => {
        console.log('SOME RESPONSE', response);
        this.selling(response, quantity, total);
        // this.qty = response.qty;
      },
      error: (error) => {
        console.error('There was an error!', error);
        // this.adding(quantity, total);
      }
    });
       
    console.log('Selling', quantity, 'shares of', this.ticker);
  }

  buy() {
    let quantity = this.quantityControl.value;
    let total = this.total;
    let c = this.c;
    this.dataService.getPortfolioItem(this.ticker.toUpperCase()).subscribe({
      next: (response) => {
        console.log('FILLLLLLLLLLL', response);
        this.buying(response, quantity, total);
      },
      error: (error) => {
        console.error('There was an error!', error);
        this.adding(quantity, total);
      }
    });   
    console.log('Buying', quantity, 'shares of', this.ticker);
    // Add your buy logic here...
  }

  selling(item: any, quantity: number| null, total:number){    
    if (quantity === null || quantity === 0) {
      console.error('Invalid quantity');
      return;
    }
    if((item.qty-quantity)!==0){
      
    
    let itemData = { 
      qty: item.qty - quantity,
      total_cost: Math.round((item.total_cost - total)*100)/100,
      avg_cost: Math.round(((item.total_cost - total)/(item.qty - quantity)) * 100) / 100,
    }

    this.dataService.putPortfolioCompany(item.ticker, itemData).subscribe({
      next: (response) => {
        // Handle the successful response here
        console.log('Item bought successfully', response);
        

        this.dataService.putBalance(this.balance + total).subscribe({
          next:(res)=>{console.log('Balance updated successfully', response);
          this.balance = this.balance + total
        }
          
        })
        
        
      },
      error: (error) => {
        
        this.activeModal.close(this.ticker +  ' sell');
        this.showBuyButton = false;
        this.showSellButton = false;
        console.error('Error updating item', error);
      }
    });
  }else{
    this.dataService.deletePortfolioCompany(item.ticker).subscribe({
      next: (response) => {
        console.log('Successfully deleted from portfolio', response);
       

      this.dataService.putBalance(this.balance + total).subscribe({
        next:(res)=>{console.log('Balance updated successfully', response);
        this.balance = this.balance + total
      }});

      },
      error: (error) => {
        console.error('There was an error!', error);
        // Handle the error response here
      }
    });
  }

  this.activeModal.close(this.ticker + ' sell');
  this.showBuyButton = false;
  this.showSellButton = false;

  }

  buying(item: any, quantity: number|null, total:number){    
    let itemData = { 
      qty: item.qty + quantity,
      total_cost: item.total_cost + total,
      avg_cost: Math.round((item.total_cost + total)/(item.qty + quantity) * 100) / 100,
    }

    this.dataService.putPortfolioCompany(item.ticker, itemData).subscribe({
      next: (response) => {
        // Handle the successful response here
        console.log('Item updated successfully', response);
        
          

        this.dataService.putBalance(this.balance - total).subscribe({
          next:(res)=>{console.log('Balance updated successfully', response);
          this.balance = this.balance - total
        }
          
        })
        
        this.activeModal.close(this.ticker + ' buy');
      },
      error: (error) => {
        
        this.activeModal.close(this.ticker + ' buy');
        console.error('Error updating item', error);
      }
    });

    

  }

  adding(quantity: number|null, total:number){
    if (quantity === null || quantity === 0) {
      console.error('Invalid quantity');
      return;
    }
    let itemData = {
      ticker: this.ticker.toUpperCase(),
      description: this.description,
      qty: quantity,
      total_cost: total,
      avg_cost: Math.round((total)/(quantity) * 100) / 100,
    }
    this.dataService.addPortfolioCompany(this.ticker, itemData).subscribe({
      next: (response) => {
        // Handle the successful response here
        console.log('Item added successfully', response);
        

        this.dataService.putBalance(this.balance - total).subscribe({
          next:(res)=>{console.log('Balance updated successfully', response);
          this.balance = this.balance - total
        }});

        
        this.activeModal.close(this.ticker + ' add');
      },
      error: (error) => {
        // Handle errors here
        console.error('Error adding item', error);
      }
    });
  }

  



}

