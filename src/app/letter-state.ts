export enum LetterState {
    // Letter and position are all wrong.
    WRONG,
    // Letter in word but position is wrong.
    PARTIAL_MATCH,
    // Letter and position are all correct.
    FULL_MATCH,
    // Before the current try is submitted.
    PENDING,
}
