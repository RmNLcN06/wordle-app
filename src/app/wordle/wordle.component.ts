import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Try } from '../try';
import { Letter } from '../letter';
import { LetterState } from '../letter-state';

// Length of the word.
const WORD_LENGTH = 5;

// Number of tries.
const NUMBER_OF_TRIES = 6;

// Letter mapping.
const LETTERS = (() => {
  // letter -> true. Easier to check.
  const response: {[key: string]: boolean} = {};
  for(let charCode = 97; charCode < 97 + 26; charCode++) {
    response[String.fromCharCode(charCode)] = true;
  }
  //console.log(response);
  return response;
})();

@Component({
  selector: 'app-wordle',
  imports: [CommonModule],
  templateUrl: './wordle.component.html',
  styleUrl: './wordle.component.scss'
})
export class WordleComponent {
  // Stores all tries.
  // One try is one row in the UI.
  readonly tries: Try[] = [];

  // Tracks the current letter index.
  private currentLetterIndex = 0;

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

  @HostListener('document: keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.handleClickKey(event.key);
  }

  private handleClickKey(key: string) {
    // If key is a letter, update the text in the corresponding letter object.
    if(LETTERS[key.toLowerCase()]) {
      this.setLetter(key);
      this.currentLetterIndex++;
    }
  }

  private setLetter(letter: string) {
    const tryIndex = Math.floor(this.currentLetterIndex / WORD_LENGTH);
    const letterIndex = this.currentLetterIndex - tryIndex * WORD_LENGTH;
    this.tries[tryIndex].letters[letterIndex].text = letter;
  }
}
