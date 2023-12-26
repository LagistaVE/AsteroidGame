import { horizontalScreenLimit, verticalScreenLimit } from './screenlimit.js'

export const placeRandomly = function (object) {
    const randomNr = Math.random()
    const randomNr2 = Math.random()
    if (randomNr > 0.5 && randomNr2 > 0.5) {
        object.x = Math.random() * horizontalScreenLimit * -1
        object.y = Math.random() * verticalScreenLimit * -1
    } else if (randomNr < 0.5 && randomNr2 > 0.5) {
        object.x = Math.random() * horizontalScreenLimit * -1
        object.y = Math.random() * verticalScreenLimit
    } else if (randomNr > 0.5 && randomNr2 < 0.5) {
        object.x = Math.random() * horizontalScreenLimit
        object.y = Math.random() * verticalScreenLimit * -1
    } else {
        object.x = Math.random() * horizontalScreenLimit
        object.y = Math.random() * verticalScreenLimit
    }

    return object
}