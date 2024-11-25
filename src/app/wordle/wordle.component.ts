import { Component, ElementRef, HostListener, QueryList, ViewChildren } from '@angular/core';
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
  @ViewChildren('tryContainer') tryContainers!: QueryList<ElementRef>;

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

  // Stores the count for each letter from the target word.
  // For example, if the target word is "avion", then this map will look like:
  // {'a': 1, 'v': 1, 'i': 1, 'o': 1, 'n': 1}
  private targetWordLetterCounts: {[letter: string]: number} = {};

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

    // Generate letter counts for target word.
    for(const letter of this.targetWord) {
      const count = this.targetWordLetterCounts[letter];
      if(count == null) {
        this.targetWordLetterCounts[letter] = 0;
      }
      this.targetWordLetterCounts[letter]++;
    }
    console.log(this.targetWordLetterCounts);
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
      // Shake the current row.
      const tryContainer = this.tryContainers.get(this.numberSubmittedTries)?.nativeElement as HTMLElement;
      tryContainer.classList.add('shake');
      setTimeout(() => {
        tryContainer.classList.remove('shake');
      }, 500);
      return;
    }

    // Check if the current try matches the target word.

    // Stores the check results.
    // Clone the counts map. Need to use it in every check with the initial values.
    const targetWordLetterCounts = {...this.targetWordLetterCounts};
    const states: LetterState[] = [];
    for(let i = 0; i < WORD_LENGTH; i++) {
      const expectedWord = this.targetWord[i];
      const currentLetter = currentTry.letters[i];
      const gotLetter = currentLetter.text.toLowerCase();
      let state = LetterState.WRONG;

      // Need to make sure only performs the check when the letter hasn't beenchecked before.
      // For example, if the target word is "pomme", the first "o" user types
      // should be checked, but the second "o" shouldn't, because there is no more "o"
      // left in the target word that hasn't been checked.
      if(expectedWord === gotLetter && targetWordLetterCounts[gotLetter] > 0) {
        targetWordLetterCounts[expectedWord]--;
        state = LetterState.FULL_MATCH;
      } else if(this.targetWord.includes(gotLetter) && targetWordLetterCounts[gotLetter] > 0) {
        targetWordLetterCounts[gotLetter]--;
        state = LetterState.PARTIAL_MATCH;
      }
      states.push(state);
    }
    console.log(states);
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
