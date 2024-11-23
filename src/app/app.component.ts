import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WordleComponent } from './wordle/wordle.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WordleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'wordle-app';
}
