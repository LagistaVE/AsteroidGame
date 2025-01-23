import { horizontalScreenLimit, getRandomNrHorizontal, getRandomNrVertical } from './screenlimit.js'
import { Laser } from './Laser.js'

let saucerCountID = 0 // distinct id for each saucers
let laserCountID = 0 // distinct id for each bullet
let lastShootTime = Date.now() //takes the current time and saves it

const BERNOULLI_CONSTANT = 0.5

class Saucer {
    constructor () {
        this.x = getRandomNrHorizontal()
        this.y = getRandomNrVertical()
        this.isHit = false //shows if the asteroid is hit --> easier to remove then from the array and scene graph --> when spawned also false
    }
}

export class largeSaucer  extends Saucer {
    constructor () {
        super()
        this.type = 'large'
        this.speed = 0.05
        this.radius = 0.8
        this.name = 'largeSaucer' + saucerCountID
        this.value = 200
    
        saucerCountID++
    }
}

export class smallSaucer extends Saucer {
    constructor () {
        super()
        this.type = 'small'
        this.speed = 0.08
        this.radius = 0.4
        this.name = 'smallSaucer' + saucerCountID
        this.value = 1000
     
        saucerCountID++
    }
}

export const spawnSaucers = (largeSaucers, smallSaucers, highscore) => {
    const randomNumber = Math.random()
  
    if (randomNumber > 0.75) {
        if (highscore < 10000) {
            const saucer = new largeSaucer()
            largeSaucers.push(saucer)
        } else {
            const saucer = new smallSaucer()
            smallSaucers.push(saucer)
        }
    }
}

export const moveSaucers = function (saucer, spaceship, saucersLasers) {
    changeOrientation(saucer)
    saucer.x += saucer.speed        // just horizontal movement for the saucers!
    if (saucer instanceof largeSaucer) {        //check if the saucer is large and then decide what shooting function should be applied
        saucersShoot(saucer, saucersLasers)
    } else {                         //check if the saucer is small and then decide what shooting function should be applied
        smallSaucersShoot(saucer, spaceship, saucersLasers)
    }
}

export const saucersShoot = function (saucer, saucersLasers) {
    // Check if the saucer should shoot
    if (shouldShoot()) {
        // Choose a random location on the map for the laser
        const targetX = Math.random() * horizontalScreenLimit * 2 - horizontalScreenLimit
        const targetY = Math.random() * horizontalScreenLimit * 2 - horizontalScreenLimit

        // Calculate angle towards the target
        const angle = Math.atan2(targetY - saucer.y, targetX - saucer.x)

        // Create and add a new laser to the global array
        const newLaser = new Laser(saucer.x, saucer.y, angle, 'EvilLaser' + laserCountID)
        saucersLasers.push(newLaser)

        laserCountID++
    }
}

export const smallSaucersShoot = function (saucer, spaceship, saucersLasers) {
    // Check if the saucer should shoot
    if (shouldShoot()) {
        // Calculate angle towards the spaceship
        const angle = Math.atan2(spaceship.y - saucer.y, spaceship.x - saucer.x)

        // Create and add a new laser to the global array
        const laser = new Laser(saucer.x, saucer.y, angle, 'EvilLaser' + laserCountID)
        saucersLasers.push(laser)

        laserCountID++
    }
}

//change saucer orientation when it hits the other end of the screen
const changeOrientation = function (saucer) {
    if (saucer.x > horizontalScreenLimit) {
        saucer.speed *= -1
    }

    if (saucer.x < -horizontalScreenLimit) {
        saucer.speed *= -1
    }
}

//determines wheter or not a laser has been shot or not
export const shouldShoot = function () {
    // Check if it's been at least 2 seconds since the last shoot
    if (Date.now() - lastShootTime > 2000) {
        lastShootTime = Date.now() // Update the last shoot time
        const randomNumber = Math.random()
        if (randomNumber < BERNOULLI_CONSTANT) {
            return true
        }
    }
    return false
}