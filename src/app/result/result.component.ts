
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ResultComponent implements OnInit {

  results: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('/angular-results').subscribe(data => {

      this.results = data;
    });
  }

}