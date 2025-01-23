import { horizontalScreenLimit, verticalScreenLimit } from './screenlimit.js'

//this function places an object at a random location within screen limits!
export const placeRandomly = function (object) {
    const horizontalMax = horizontalScreenLimit
    const horizontalMin = horizontalScreenLimit * -1
    // define random horizontal number within screen limits
    const randomNrHorizontal = Math.floor(Math.random() * (horizontalMax - horizontalMin + 1) + horizontalMin)

    const verticalMax = verticalScreenLimit
    const verticalMin = verticalScreenLimit * -1
    // define random vertical number within screen limits
    const randomNrVertical = Math.floor(Math.random() * (verticalMax - verticalMin + 1) + verticalMin)

    object.x = randomNrHorizontal   //assign random nr. to the x coordinate
    object.y = randomNrVertical     //assign random nr. to the y coordinate
    return object
}