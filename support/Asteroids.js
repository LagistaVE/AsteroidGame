import { getRandomNrHorizontal, getRandomNrVertical, horizontalScreenLimit, verticalScreenLimit } from './screenlimit.js'

let asteroidCountID = 0

class Asteroid {
    constructor () {
        this.x = getRandomNrHorizontal()
        this.y = getRandomNrVertical()
        this.spawned = false
        this.isHit = false //shows if the asteroid is hit --> easier to remove then from the array and scene graph
        asteroidCountID++
    }
}

export class LargeAsteroid extends Asteroid {
    constructor () {
        super()
        this.type = 'large'
        this.angle = 3
        this.radius = 1.5
        this.speed = 0.005
        this.name = 'largeAsteroid' + asteroidCountID
        this.value = 20
        asteroidCountID++
    }
}

export class MediumAsteroid extends Asteroid {
    constructor () {
        super ()
        this.type = 'medium'
        this.angle = 2
        this.radius = 1.2
        this.speed = 0.008
        this.name = 'mediumAsteroid' + asteroidCountID
        this.value = 50
        asteroidCountID++
    }
}

export class SmallAsteroid extends Asteroid {
    constructor () {
        super ()
        this.type = 'small'
        this.angle = 1
        this.radius = 0.6
        this.speed = 0.015
        this.name = 'smallAsteroid' + asteroidCountID
        this.value = 100

        asteroidCountID++
    }
}

export const spawnAsteroids = function (amount, largeAsteroids, mediumAsteroids, smallAsteroids, scene) {
    for (let i = 0; i < amount; i++) {
        if (i % 3 === 0) {
            largeAsteroids.push(new LargeAsteroid())
        } else if (i % 3 === 1) {
            mediumAsteroids.push(new MediumAsteroid())
        } else {
            smallAsteroids.push(new SmallAsteroid())
        }
    }
}

export const moveAsteroids = function (asteroids) {
    for (let i = 0; i < asteroids.length; i++) {
        const angle = asteroids[i].angle
        const deltaX = asteroids[i].speed * Math.sin(angle)
        const deltaY = -asteroids[i].speed * Math.cos(angle)

        asteroids[i].x += deltaX * Math.cos(angle)
        asteroids[i].y += deltaY * Math.sin(angle)
        //invert the position so it wraps around the screen
        if (asteroids[i].y > verticalScreenLimit || asteroids[i].y < verticalScreenLimit * -1) {
            asteroids[i].y *= -1
        }
        if (asteroids[i].x > horizontalScreenLimit || asteroids[i].x < horizontalScreenLimit * -1) {
            asteroids[i].x *= -1
        }
    }
}