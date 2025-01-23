// Function to display lives using class name
export function displayLives (lives) {
    const livesElements = document.querySelectorAll('.lives')
    livesElements.forEach((element) => {
        element.textContent = `Lives: ${lives}`
    })
}

// Function to display score using class name
export function displayScore (score) {
    const scoreElements = document.querySelectorAll('.score')
    scoreElements.forEach((element) => {
        element.textContent = `Score: ${score}`
    })
}

export function displayWaveNr (waveNr) {
    const waveElement = document.querySelectorAll('.waveNr')
    waveElement.forEach((element) => {
        element.textContent = `Wave: ${waveNr}`
    })
}