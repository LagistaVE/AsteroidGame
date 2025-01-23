
export class Laser {
    constructor (x, y, angle, name) {
        this.x = x
        this.y = y
        this.angle = angle
        this.speed = 0.1
        this.radius = 0.3

        this.name = name      //name of the laser .... use this to remove from scene graph
        this.spawned = false  //use this to determine if object is attached to scene graph
        this.hasHit = false
    }
    animate () {
        // Update the position of each laser
        const angle = this.angle
        const deltaX = -this.speed * Math.sin(angle)
        const deltaY = this.speed * Math.cos(angle)

        this.x += deltaX  // Update the x-coordinate
        this.y += deltaY  // Update the y-coordinate
    }
}