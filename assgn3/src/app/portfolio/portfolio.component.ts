import { Component, OnInit, inject, Input, EventEmitter, Output} from '@angular/core';
import { DataService } from '../data.service';
import { catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms'
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, TitleStrategy } from '@angular/router';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit{
  constructor(private dataService: DataService, private router: Router, private route: ActivatedRoute, private searchService: SearchService) { }


  portfolio_data:any=[];
  isModalOpen: boolean = false;
  quote_data:any={};
  icon!:any;
  isEmpty = true;
  justClick = true;
  showSpinner = false;
  balance = 0
  wallet: any={}
  private modalService = inject(NgbModal);
  bought = false;
  sold = false;
  text = ''
  showDataSpinner = false;

  ngOnInit() {
    this.showDataSpinner = true;
    
       
      this.loadData();
    
  }

  loadData(){
    this.dataService.getBalance().subscribe((res) => {
      this.wallet = res[0]        
      console.log('wallet', this.wallet)
      this.balance = Math.round(this.wallet.balance*100)/100
      console.log('BALANCE', this.balance)
    });  
    this.dataService.getPortfolioData().subscribe((res) => {      
      if(res.length>0){
        this.isEmpty = false;
        res.forEach((object: any) => {
        this.getQuote(object.ticker).subscribe({
          next: (obj) => {
            console.log(object.ticker, obj)
            object['c'] = Math.round(obj.c *100)/100;
            object['change'] = Math.round((object.avg_cost - obj.c)*100)/100
            object['market_value'] = Math.round((obj.c * object.qty)*100)/100;
            console.log(object)
          },
          error: (error) => {
            console.log('Error in load data');
            this.isEmpty = true;
          }}
          );
          // 
        });
        this.portfolio_data = res;
        this.showDataSpinner = false;
    }else{      
      this.isEmpty = true;
      this.showDataSpinner = false;
    }
    });
    console.log('portfolio', this.portfolio_data);        
  
  }

  openDialog(element: any, action:string) {
    const modalRef = this.modalService.open(NgbdModalBuyContent);
    console.log(modalRef.componentInstance);
    modalRef.componentInstance.ticker = element.ticker;
    modalRef.componentInstance.c = element.c;
    modalRef.componentInstance.action = action;
    modalRef.componentInstance.stock_quantity = element.qty;
    modalRef.componentInstance.balance = Math.round(this.wallet.balance*100)/100;
    this.isModalOpen = true;
    modalRef.result.then(
      (result) => {
        console.log("Modal closed with result:", result);
        let myArray = result.split(" ");
        this.text = myArray[0];
        if(myArray[1]==='buy'){this.bought = true;}
        if(myArray[1]==='sell'){this.sold = true;}
        if(myArray[1]==='delete'){
          this.sold = true;
          this.portfolio_data = this.portfolio_data.filter((item:any) => item.ticker !== element.ticker);
          this.balance = modalRef.componentInstance.balance;
        }
        
        this.loadData();
        
      },
      (reason) => {
        console.log("Modal dismissed with reason:", reason);
        this.loadData();
      }
    );

  }

  handleModalClose() {
    this.isModalOpen = false;
    console.log('here')
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
    // this.dataService.deleteWatchlistCompany(element.ticker).subscribe({
    //   next: (response) => {
    //     console.log('Successfully deleted from watchlist', response);
    //     this.watchlist_data = this.watchlist_data.filter((item:any) => item.ticker !== element.ticker);
    //     this.dataService.setWatchlistState(this.watchlist_data);
    //     this.isEmpty = true;

    //   },
    //   error: (error) => {
    //     console.error('There was an error!', error);
    //     // Handle the error response here
    //   }
    // });
  }
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
  @Input() action: any;
  @Input() balance!: number;
  @Input() c!: number;
  @Input() stock_quantity!: number;

  constructor(private dataService: DataService) {
    this.calculateTotal(); // Initial total calculation
  }

  ngOnInit(): void {
    console.log(this.action, typeof this.action)
    if(this.action==='Buy'){
      this.showBuyButton = true;
    }
    if(this.action==='Sell'){
      this.showSellButton = true;
    }
    
  }
  

  calculateTotal() {
    this.c=this.c
    let quantity = Number(this.quantityControl.value);
    console.log(quantity, this.c)
    if (quantity !== null && quantity>0) {
      this.disableButton = false;
      this.total = Math.round((quantity * this.c) *100)/100
      console.log(this.total);
      if(this.total>this.balance && this.showBuyButton){
        this.showWarning = true;
        this.disableButton = true;
        console.log(this.showWarning)
      }else if(quantity>this.stock_quantity && this.showSellButton){
        this.showWarning = true;
        this.disableButton = true;
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
      },
      error: (error) => {
        console.error('There was an error!', error);
        // this.adding(quantity, total);
      }
    });   
    console.log('Buying', quantity, 'shares of', this.ticker);
    // Add your buy logic here...
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
        // this.adding(quantity, total);
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
      total_cost: Math.round((item.total_cost - (quantity*item.avg_cost))*100)/100,
      avg_cost: Math.round(((item.total_cost - (quantity*item.avg_cost))/(item.qty - quantity)) * 100) / 100,
    }

    this.dataService.putPortfolioCompany(item.ticker, itemData).subscribe({
      next: (response) => {
        // Handle the successful response here
        console.log('Item bought successfully', response);
        

        this.dataService.putBalance(this.balance + total).subscribe({
          next:(res)=>{console.log('Balance updated successfully', response);
          this.balance = this.balance + total
          
        this.activeModal.close(this.ticker + ' sell');
        }
          
        })

        this.showBuyButton = false;
        this.showSellButton = false;
        
        
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
        console.log(this.balance, total)
      this.activeModal.close(this.ticker + ' delete');
      }});

      this.showBuyButton = false;
      this.showSellButton = false;

      },
      error: (error) => {
        console.error('There was an error!', error);
        // Handle the error response here
      }
    });
  }

  

  }

  buying(item: any, quantity: number|null, total:number){    
    let itemData = { 
      qty: item.qty + quantity,
      total_cost: Math.round((item.total_cost + total)*100)/100,
      avg_cost: Math.round(((item.total_cost + total)/(item.qty + quantity)) * 100) / 100,
    }

    this.dataService.putPortfolioCompany(item.ticker, itemData).subscribe({
      next: (response) => {
        // Handle the successful response here
        console.log('Item bought successfully', response);
        

        this.dataService.putBalance(this.balance - total).subscribe({
          next:(res)=>{console.log('Balance updated successfully', response);
          this.balance = this.balance - total
          
        this.activeModal.close(this.ticker + ' buy');
        }
          
        })
        
        this.showBuyButton = false;
        this.showSellButton = false;
      },
      error: (error) => {
        
        this.activeModal.close(this.ticker + ' buy');
        this.showBuyButton = false;
        this.showSellButton = false;
        console.error('Error updating item', error);
      }
    });

    

  }

  // adding(quantity: number|null, total:number){

  //   this.dataService.addWatchlistCompany(this.sts, itemData).subscribe({
  //     next: (response) => {
  //       // Handle the successful response here
  //       console.log('Item updated successfully', response);
  //       let savedState = this.dataService.getWatchlistState();
  //       if(savedState){
  //         savedState.push(itemData);
  //       this.dataService.setWatchlistState(savedState);}
  //       else{
  //         this.dataService.getWatchlistData().subscribe((res) => {
  //           savedState = res;
  //           console.log('watchlist', savedState);        
  //         this.dataService.setWatchlistState(savedState);
  //         });
  //       }
  //       this.ifFill = true;
  //     },
  //     error: (error) => {
  //       // Handle errors here
  //       console.error('Error updating item', error);
  //     }
  //   });
  // }

  



}
