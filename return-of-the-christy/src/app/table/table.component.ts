import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { NgIf, DatePipe } from '@angular/common';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Input } from '@angular/core';
import { FetchService } from '../fetch.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class TableComponent {
  @Input()
  title: string = '';

  @Input()
  displayedColumns: string[] = [];

  @Input()
  expandedColumns: string[] = [];

  public _array = Array;
  public _number = Number;
  public _string = String;

  columnsToDisplayWithExpand: string[] = [];
  expandedRow: PeopleApi | PlanetsApi | StarshipsApi | null | undefined;
  peopleDatabase!: FetchService | null;
  data: any = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(private _httpClient: HttpClient) { }

  ngAfterViewInit() {
    this.columnsToDisplayWithExpand = [...this.displayedColumns];
    this.peopleDatabase = new FetchService(this._httpClient);

    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.peopleDatabase!.GetTableData(
            this.paginator.pageIndex,
            this.title
          ).pipe(catchError(() => observableOf(null)));
        }),
        map((data) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          // Only refresh the result length if there is new data. In case of rate
          // limit errors, we do not want to reset the paginator to zero, as that
          // would prevent users from re-triggering requests.
          this.resultsLength = data.count;
          return data.results;
        })
      )
      .subscribe((data) => (this.data = data));
  }
}

export interface PeopleApi {
  results: Person[];
  count: number;
  next: string;
  previous: string;
}

export interface Person {
  birth_year: string;
  created: string;
  edited: string;
  eye_color: string;
  films: Array<string>;
  gender: string;
  hair_color: string;
  height: string;
  homeworld: string;
  mass: string;
  name: string;
  skin_color: string;
  species: Array<string>;
  starships: Array<string>;
  url: string;
  vehicles: Array<string>;
}

export interface PlanetsApi {
  results: Planet[];
  count: number;
  next: string;
  previous: string;
}

export interface Planet {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: Array<string>;
  films: Array<string>;
  created: string;
  edited: string;
  url: string;
}

export interface StarshipsApi {
  results: Starship[];
  count: number;
  next: string;
  previous: string;
}

export interface Starship {
  name: string;
  model: string;
  manufacturer: string;
  cost_in_credits: string;
  length: string;
  max_atmosphering_speed: string;
  crew: string;
  passengers: string;
  cargo_capacity: string;
  consumables: string;
  hyperdrive_rating: string;
  MGLT: string;
  starship_class: string;
  pilots: Array<string>;
  films: Array<string>;
  created: string;
  edited: string;
  url: string;
}