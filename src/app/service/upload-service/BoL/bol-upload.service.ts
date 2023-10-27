import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BolUploadService {
  private httpOptions = {
    headers: new HttpHeaders({
      // 'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${localStorage.getItem('id_token')}`,
    }),
  };

  constructor(private http: HttpClient) {}

  upload(body: any): Observable<any> {
    return this.http.post(
      environment.BASE_API_URI.BASE_SERVICE_API + `/billofladings/create`,
      body,
      this.httpOptions
    );
  }

  get(id: String): Observable<any> {
    return this.http.get(
      environment.BASE_API_URI.BASE_SERVICE_API + `/billofladings/${id}`,
      { headers: this.httpOptions.headers, responseType: 'arraybuffer' }
    );
  }

  approve(id: String, body:any): Observable<any> {
    return this.http.patch(
      environment.BASE_API_URI.BASE_SERVICE_API + `/billofladings/${id}/approve`,
      body,
      this.httpOptions
    );
  }

  reject(id: String, body:any): Observable<any> {
    return this.http.patch(
      environment.BASE_API_URI.BASE_SERVICE_API + `/billofladings/${id}/reject`,
      body,
      this.httpOptions
    );
  }
}
