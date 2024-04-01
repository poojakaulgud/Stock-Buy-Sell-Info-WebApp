import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './navbar/navbar.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { FooterComponent } from './footer/footer.component';
import {NgbdModalBuyContent} from './portfolio/portfolio.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
// import { StockGridComponent } from './search-bar/stock-grid/stock-grid.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDialogModule } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { HighchartsChartModule } from 'highcharts-angular';
// import { HighchartsChartComponent } from 'highcharts-angular';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
// import { StockPriceChartComponent } from './search-bar/stock-price-chart/stock-price-chart.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    SearchBarComponent,
    WatchlistComponent,
    PortfolioComponent,
    FooterComponent,
    // StockPriceChartComponent,
    // HighchartsChartComponent
    
    
    // StockGridComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule,
    MatAutocompleteModule,
    MatInputModule, 
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    HighchartsChartModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
