import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Try } from '../try';
import { Letter } from '../letter';
import { LetterState } from '../letter-state';
import { WORDS } from '../words';

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

  // Word shown in the message panel.
  infoMessage = '';

  // Controls info message's fading-out animation.
  fadeOutInfoMessage = false;

  // Tracks the current letter index.
  private currentLetterIndex = 0;

  // Tracks the number of submitted tries.
  private numberSubmittedTries = 0;

  // Store the target word.
  private targetWord = '';

  constructor() {
    // Populate initial state of "tries".
    for(let i = 0; i < NUMBER_OF_TRIES; i++) {
      const letters: Letter[] = [];
      for(let j = 0; j < WORD_LENGTH; j++) {
        letters.push({text: '', state: LetterState.PENDING});
      }
      this.tries.push({letters});
    }

    // Get a target word from the word list.
    const numberOfWords = WORDS.length;
    while(true) {
      // Randomly select a word and check if its length is WORD_LENGTH.
      const index = Math.floor(Math.random() * numberOfWords);
      const word = WORDS[index];
      if(word.length === WORD_LENGTH) {
        this.targetWord = word.toLowerCase();
        break;
      }
    }
    console.log('Target word: ' + this.targetWord);
  }

  @HostListener('document: keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.handleClickKey(event.key);
  }

  private handleClickKey(key: string) {
    // If key is a letter, update the text in the corresponding letter object.
    if(LETTERS[key.toLowerCase()]) {
      // Only allow typing letters in the current try.
      // Don't go over if the current try has not been submitted.
      if(this.currentLetterIndex < (this.numberSubmittedTries + 1) * WORD_LENGTH) {
        this.setLetter(key);
        this.currentLetterIndex++;
      }
    }
    // Handle delete.
    else if(key === 'Backspace') {
      // Don't delete previous try.
      if(this.currentLetterIndex > this.numberSubmittedTries * WORD_LENGTH) {
        this.currentLetterIndex--;
        this.setLetter('');
      }
    }
    // Submit the current try and check.
    else if(key === 'Enter') {
      this.checkCurrentTry();
    }
  }

  private setLetter(letter: string) {
    const tryIndex = Math.floor(this.currentLetterIndex / WORD_LENGTH);
    const letterIndex = this.currentLetterIndex - tryIndex * WORD_LENGTH;
    this.tries[tryIndex].letters[letterIndex].text = letter;
  }

  private checkCurrentTry() {
    // Check if user has typed all the letters.
    const currentTry = this.tries[this.numberSubmittedTries];
    if(currentTry.letters.some(letter => letter.text === '')) {
      this.showInfoMessage('Not enough letters');
      return;
    }

    // Check if the current try is a word of the list.
    const wordFromCurrentTry = currentTry.letters.map(letter => letter.text).join('').toUpperCase();
    if(!WORDS.includes(wordFromCurrentTry)) {
      this.showInfoMessage('Not in word list');
      return;
    }
  }

  private showInfoMessage(message: string) {
    this.infoMessage = message;
    // Hide after 2 seconds.
    setTimeout(() => {
      this.fadeOutInfoMessage = true;
      setTimeout(() => {
        this.infoMessage = '';
        this.fadeOutInfoMessage = false;
      }, 500);
    }, 2000);
  }
}
