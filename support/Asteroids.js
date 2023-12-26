import { horizontalScreenLimit, verticalScreenLimit } from './screenlimit.js'

export class largeAsteroid {
    constructor (x, y) {
        this.x = x
        this.y = y
        this.angle = 3
        this.speed = 0.1
        this.size = 'large'
    }
}

export class mediumAsteroid {
    constructor (x, y, speed) {
        this.x = x
        this.y = y
        this.angle = 2
        this.speed = 0.2
        this.size = 'medium'
    }
}

export class smallAsteroid {
    constructor (x, y, speed) {
        this.x = x
        this.y = y
        this.angle = 1
        this.speed = 0.5
        this.size = 'small'
    }
}

export const moveAsteroids = function (asteroid) {
    const angle = asteroid.angle
    const deltaX = asteroid.speed * Math.sin(angle)
    const deltaY = -asteroid.speed * Math.cos(angle)
    asteroid.x += deltaX
    asteroid.y += deltaY

    if (asteroid.y > verticalScreenLimit || asteroid.y < verticalScreenLimit * -1) {
        asteroid.y *= -1
    }
    if (asteroid.x > horizontalScreenLimit || asteroid.x < horizontalScreenLimit * -1) {
        asteroid.x *= -1
    }
}