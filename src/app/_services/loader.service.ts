import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class LoaderService {
    private showLoaderSource = new Subject<boolean>();
    // Observable
    showLoader$ = this.showLoaderSource.asObservable();

    showLoader(loader: boolean) {
        this.showLoaderSource.next(loader);
    }
}
