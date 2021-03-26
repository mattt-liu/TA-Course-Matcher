import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  url = environment.apiUrl; 
  
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  login(username: string, password: string) {

    let header = this.getAuthorizationHeader();

    let body = {
      username: username,
      password: password
    }

    return this.http.post(`${this.url}/login`, body, {headers: header});
  }

  getAuthorizationHeader() {
    let token = localStorage.getItem('token');

    if (!token) {
      return {};
    }

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Bearer '+token);
    return headers;
  }

  setToken(token) {
    localStorage.setItem('token', token.accessToken);
  }

  logout() {    
    localStorage.removeItem('token');
  }
}
