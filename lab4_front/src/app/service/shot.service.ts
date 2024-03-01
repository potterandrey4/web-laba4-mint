import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { backendURL } from '../../environment/environment';
import { UserService } from './user.service';

export interface Shot {
  id: number;
  x: number;
  y: number;
  r: number;
  inArea: boolean;
  shotTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShotService {
  private readonly baseUrl = `${backendURL}/shots`;

  constructor(private http: HttpClient, private userService: UserService) {}

  retrieveShots() {
    const header = {
      headers: new HttpHeaders().set(
        'Authorization',
        `Basic ${this.userService.authToken}`
      )
    };
    return this.http.get<Shot[]>(this.baseUrl, header);
  }

  createShot(x: number | string, y: number | string, r: number | string) {
    const header = {
      headers: new HttpHeaders().set(
        'Authorization',
        `Basic ${this.userService.authToken}`
      )
    };
    return this.http.post<Shot>(this.baseUrl, { x, y, r }, header);
  }

  deleteShots() {
    const header = {
      headers: new HttpHeaders().set(
        'Authorization',
        `Basic ${this.userService.authToken}`
      )
    };
    return this.http.delete<Shot[]>(this.baseUrl, header);
  }
}
