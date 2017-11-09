import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { ApiServiceProvider } from './api-service';

@NgModule({
    imports: [
        HttpModule
    ],
    providers: [
        ApiServiceProvider
    ]
})
export class AppiServiceModule {}
