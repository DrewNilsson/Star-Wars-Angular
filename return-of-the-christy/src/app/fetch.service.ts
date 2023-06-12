import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PeopleApi, PlanetsApi, StarshipsApi } from './table/table.component';

@Injectable({
  providedIn: 'root',
})
export class FetchService {
  constructor(private _http: HttpClient) {}

  GetTableData = (page: number, title: string): Observable<PeopleApi | PlanetsApi | StarshipsApi> => {
    const href = `https://swapi.dev/api/${title}`;
    const requestUrl = `${href}?page=${page + 1}`;

    return this._http.get<PeopleApi | PlanetsApi | StarshipsApi>(requestUrl);
  }

  GetDataName(url: string) {
    return this._http.get(url);
  }
}
