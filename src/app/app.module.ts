import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { Router } from '@angular/router';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { ResultComponent } from './result/result.component';

@NgModule({
    imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  declarations: [
    AppComponent,
    ResultComponent,
  ],

  providers: [],
  bootstrap: [ AppComponent ]
})

export class AppModule { 
  // Diagnostic only: inpsect router configuration
  constructor(router: Router) {
    console.log('Routes: ' , JSON.stringify(router.config, undefined, 2));
  }
 }