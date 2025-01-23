import { verticalScreenLimit, horizontalScreenLimit } from './screenlimit.js'
import { placeRandomly } from './placeRandomly.js'
import { Laser } from './Laser.js'

let isReady = true      // gives info about the spaceship being ready to shoot or not

//class for spaceship
export class Spaceship {
    constructor (x, y, angle, speed) {
        this.x = x
        this.y = y
        this.angle = angle
        this.speed = speed
        this.hyperDriveCD = 0
        this.lives = 3
        this.lasers = []

        this.lasersCountID = 0  //use this as ID for the lasers. Just increment by one any time you create a laser object.
    }

    move (keys, gameState) {
        if (gameState !== 'GameOverMode') {
            const rotationSpeed = 0.05
            if (keys['KeyW']) {
                const angle = this.angle
                const deltaX = -this.speed * Math.sin(angle)
                const deltaY = this.speed * Math.cos(angle)

                this.x += deltaX
                this.y += deltaY
                // wrap around the screen
                if (this.y > verticalScreenLimit || this.y < verticalScreenLimit * -1) {
                    this.y *= -1
                }
                if (this.x > horizontalScreenLimit || this.x < horizontalScreenLimit * -1) {
                    this.x *= -1
                }
            }
            //hyperdrive implementation
            if (keys['KeyS']) {
                if (this.hyperDriveCD === 0) {
                    placeRandomly(this)
                    this.hyperDriveCD = 30
                    this.countdownCooldown()
                }
            }
            if (keys['KeyA']) {
                this.angle += rotationSpeed
            }
            if (keys['KeyD']) {
                this.angle -= rotationSpeed
            }
            if (keys['Space']) {
                if (isReady) {
                    isReady = false
                    console.log('Laser Count ID = ' + this.lasersCountID)
                    this.lasers.push(new Laser(this.x, this.y, this.angle, 'laser' + this.lasersCountID))
                    this.lasersCountID++
                    console.log('Added new Laser. Laser Count ID = ' + this.lasersCountID)

                    setTimeout(() => {
                        isReady = true
                    }, 500)
                }
            }
        }
    }

    countdownCooldown () {
        // Check if the hyperDriveCD is greater than 0
        if (this.hyperDriveCD > 0) {
            // Create an interval that decreases the hyperDriveCD every second
            const intervalId = setInterval(function () {
                this.hyperDriveCD--

                // Check if the countdown has reached zero
                if (this.hyperDriveCD === 0) {
                    // Stop the interval when the countdown reaches zero
                    clearInterval(intervalId)
                    console.log('Hyperdrive is ready!')
                }
            }, 1000) // Interval set to 1000 milliseconds (1 second)
        }
    }
}

//--------------------------------------------------------------------------------------------------------//
// collision detection --> respawn spaceship
//--------------------------------------------------------------------------------------------------------//
export const spaceshipRespawn = function (spaceship) {
    spaceship.x = 0
    spaceship.y = -1
    spaceship.lives--
}
