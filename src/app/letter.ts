import { LetterState } from "./letter-state";

// One letter in a try
export interface Letter {
    text: string;
    state: LetterState;
}
