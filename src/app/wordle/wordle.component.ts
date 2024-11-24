import { Component } from '@angular/core';
import { Try } from '../try';
import { Letter } from '../letter';
import { LetterState } from '../letter-state';

const WORD_LENGTH = 5;
const NUMBER_OF_TRIES = 6;

@Component({
  selector: 'app-wordle',
  imports: [],
  templateUrl: './wordle.component.html',
  styleUrl: './wordle.component.scss'
})
export class WordleComponent {
  // Stores all tries.
  // One try is one row in the UI.
  readonly tries: Try[] = [];

  constructor() {
    // Populate initial state of "tries".
    for(let i = 0; i < NUMBER_OF_TRIES; i++) {
      const letters: Letter[] = [];
      for(let j = 0; j < WORD_LENGTH; j++) {
        letters.push({text: '', state: LetterState.PENDING});
      }
      this.tries.push({letters});
    }
  }
}
