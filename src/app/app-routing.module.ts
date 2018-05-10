import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { ResultComponent } from './result/result.component';

const appRoutes: Routes = [
	{
		path:'',
		component: AppComponent
	}
];

@NgModule({
	imports: [
		RouterModule.forRoot(
			appRoutes,
			{
				enableTracing: true // <-- For Debugging only 
			}
		)
	],
	exports: [
	  RouterModule
	],
	providers: []
})

export class AppRoutingModule { }