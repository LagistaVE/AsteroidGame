export function displayTitle (title) {
    const elementTitle = document.querySelector('.game-title')
    if (elementTitle) {
        elementTitle.textContent = title
    }
}

export function displayHighScores (highscores) {
    const highScoresElement = document.querySelector('.high-scores')
    if (highScoresElement) {
        let displayText = 'High Scores: '
        //loop over the array and split up the array through commas
        for (let i = 0; i < highscores.length; i++) {
            if (i > 0) {
                displayText += ', ' // Add comma separator for scores after the first one
            }
            displayText += highscores[i]
        }
        highScoresElement.textContent = displayText
    }
}

export function displayInstructions (instruction) {
    const instructionsElement = document.querySelector('.instructions')
    if (instructionsElement) {
        instructionsElement.textContent = instruction
    }
}

export function displayControls () {
    const controlsElement = document.querySelector('.controls')
    if (controlsElement) {
        controlsElement.textContent = 'Controls: Use WASD keys to move and spacebar to shoot'
    }
}
