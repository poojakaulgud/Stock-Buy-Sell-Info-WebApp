
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from '../data.service';
import {FormControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, filter, switchMap, tap} from "rxjs";
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ChangeDetectorRef } from '@angular/core';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  options: string[] = ['One', 'Two', 'Three'];
  myControl = new FormControl();
  sts: string = '';// Initialize the property here
   // Initialize the property here
  desc_data: any = {};
  quote_data: any = {};
  autocomplete_data: any = {};
  recommendation_data: any = {};
  sentiment_data: any = {};
  news_data: any = {};
  showSpinner = false;
  peers_data: any = {};
  autocomplete_list: any = [];
  prompt_list: any = [];
  prompt :string ='';
  myForm!: FormGroup;
  isError: boolean = false;
  isClear: boolean = true;
  // peer: string = '';
  timestamp = '';
  current_time = '';
  market_status = '';
  add_line = '';
  icon!: any;
  m_status!: any;

  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger | undefined;
  constructor(private dataService: DataService, 
    private formBuilder: FormBuilder, private cdr: ChangeDetectorRef, private el: ElementRef, 
    private router: Router, private route: ActivatedRoute, private searchService: SearchService) {}



  ngOnInit(): void{
    this.myForm = this.formBuilder.group({
      name: [''] 
    });

    
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
        this.autocomplete_list = this.autocomplete_data.result.filter((item: { displaySymbol: string,  type: string }) => !item.displaySymbol.includes('.') && item.type === "Common Stock");
        
        console.log(this.autocomplete_list);
        });        
    });
  }

  clearFunc(){
    this.isError=false;
    this.myControl.reset();
    this.cdr.detectChanges();
    this.isClear=false;
  }

  somefunc(){
    this.searchService.setSearchRoute('/search/'+this.sts)
    console.log('/search/'+this.sts)
    this.router.navigate(['/search', this.sts]);
  }

  onAutoSelect(){
    this.sts = this.sts;
    this.searchService.setSearchRoute('/search/'+this.sts)
    this.router.navigate(['/search', this.sts]);    
  }

  displayWith(value: any) {
    if(value === null) return '';
    return value;
  }
}
