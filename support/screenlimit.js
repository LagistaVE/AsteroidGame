export const horizontalScreenLimit = 6.5
export const verticalScreenLimit = 6.5
let randomNrHorizontal
let randomNrVertical

// get a random nr within screen limits:
export const getRandomNrHorizontal = function () {
    const horizontalMax = horizontalScreenLimit
    const horizontalMin = -horizontalScreenLimit
    return randomNrHorizontal = Math.floor(Math.random() * (horizontalMax - horizontalMin + 1) + horizontalMin)
}

export const getRandomNrVertical = function () {
    const verticalMax = verticalScreenLimit
    const verticalMin = -verticalScreenLimit
    return randomNrVertical = Math.floor(Math.random() * (verticalMax - verticalMin + 1) + verticalMin)
}

//shows that object is on screen or not --> uses helper methods below for simplification and modularity of the code responsibilites
export const isOnScreen = function (object) {
    let validPosition = true
    if (!isOnScreenHorizontally(object)) {
        validPosition = false
    }
    if (!isOnScreenVertically(object)) {
        validPosition = false
    }
    return validPosition
}

// on screen checks isolated for coordinate system
const isOnScreenHorizontally = function (object) {
    let validPosition = true
    if (object.x < -horizontalScreenLimit * 2 || object.x > horizontalScreenLimit *  2) {
        validPosition = false
    }
    return validPosition
}

const isOnScreenVertically = function (object) {
    let validPosition = true
    if (object.y < -verticalScreenLimit * 2 || object.y > verticalScreenLimit * 2) {
        validPosition = false
    }
    return validPosition
}