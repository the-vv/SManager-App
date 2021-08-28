import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }

  postAsync(body, endpoint): Observable<any> {
    return this.http.post<any>([this.baseUrl, endpoint].join('/'), body, {
    });
  }

}
