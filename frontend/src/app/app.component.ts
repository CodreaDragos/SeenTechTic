import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // Importă FormsModule
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'seen-tech-tic';
  products: any[] = [];  // Array pentru a salva produsele

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    // Apelăm serviciul pentru a obține produsele
    this.apiService.getProducts().subscribe((data) => {
      this.products = data;  // Stocăm produsele în array-ul 'products'
    });
  }
}
