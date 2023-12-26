import { verticalScreenLimit, horizontalScreenLimit } from './screenlimit.js'
import { placeRandomly } from './placeRandomly.js'

//class for spaceship
export class Spaceship {
    constructor (x, y, angle, speed, hyperDriveCD) {
        this.x = x
        this.y = y
        this.angle = angle
        this.speed = speed
        this.hyperDriveCD = hyperDriveCD
    }
}

export const moveSpaceship = function (spaceship, keys) {
    // console.log(keys);
    const rotationSpeed = 0.05
    if (keys['KeyW']) {
        const angle = spaceship.angle
        const deltaX = spaceship.speed * Math.sin(angle)
        const deltaY = -spaceship.speed * Math.cos(angle)
        
        spaceship.x += deltaX
        spaceship.y += deltaY

        if (spaceship.y > verticalScreenLimit || spaceship.y < verticalScreenLimit * -1) {
            spaceship.y *= -1
        }
        if (spaceship.x > horizontalScreenLimit || spaceship.x < horizontalScreenLimit * -1) {
            spaceship.x *= -1
        }
    }
    //hyperdrive implementation
    if (keys['KeyS']) {
        if (spaceship.hyperDriveCD === 0) {
            placeRandomly(spaceship)
            spaceship.hyperDriveCD = 50
        }
    }
    if (keys['KeyA']) {
        spaceship.angle -= rotationSpeed
    }
    if (keys['KeyD']) {
        spaceship.angle += rotationSpeed
    }
    //if(keys['Space']){
    //    shootLasers();
    //}

    console.log('x= ' + spaceship.x + ' y= ' + spaceship.y)
}