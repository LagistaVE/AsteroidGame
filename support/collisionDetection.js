//the following methods check if the spaceship collides with the asteroids and saucers. Two methods are needed, as the other 2 objects
//have special properties that need to be handled

//gives info if there was a collision with asteroids

export const checkCollisionTarget = function (spaceship, target) {
    let collided = false

    const targetRadius = target.radius
    const targetX = target.x
    const targetY = target.y
    
    const distance = Math.sqrt(Math.pow(spaceship.x - targetX, 2) + Math.pow(spaceship.y - targetY, 2))
    if (distance <= targetRadius) {
        collided = true
    }
    return collided
}

export const laserHit = function (laser, object) {
    let isHit = false

    const objectRadius = object.radius
    const objectX = object.x
    const objectY = object.y

    const distance = Math.sqrt(Math.pow(laser.x - objectX, 2) + Math.pow(laser.y - objectY, 2))
    if (distance <= objectRadius) {
        isHit = true
    }
    return isHit
}

export const addToHighscore = function (highscore, object) {
    return highscore += object.value
}