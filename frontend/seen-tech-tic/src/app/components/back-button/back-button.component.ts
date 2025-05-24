import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-back-button',
  template: `
    <button class="back-button" (click)="goBack()">
      <i class="fas fa-arrow-left"></i> Back
    </button>
  `,
  styles: [`
    .back-button {
      position: fixed;
      top: 20px;
      left: 20px;
      padding: 8px 20px;
      background: rgba(20, 18, 21, 0.65);
      color: #fff;
      border: 1.5px solid #ff1a1a;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 1000;
      font-weight: 600;
      font-size: 1.1rem;
      box-shadow: 0 2px 12px 0 rgba(255,26,26,0.12);
      backdrop-filter: blur(2px);
      transition: background 0.2s, border 0.2s, box-shadow 0.2s;
    }
    .back-button:hover {
      background: rgba(40, 0, 0, 0.7);
      border-color: #ff3333;
      box-shadow: 0 4px 18px 0 rgba(255,26,26,0.22);
    }
  `]
})
export class BackButtonComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
} 