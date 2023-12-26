import { Scene, Node } from './scene.js'
import { Model } from './model.js'
import { Material } from './material.js'
import { Light } from './light.js'
import { Textures } from './textures.js'
import { matrixHelper } from './matrix.js'
import { Spaceship, moveSpaceship } from './support/Spaceship.js'
import { placeRandomly } from './support/placeRandomly.js'
import { largeAsteroid, mediumAsteroid, moveAsteroids, smallAsteroid } from './support/Asteroids.js'

//--------------------------------------------------------------------------------------------------------//
// initialize canvas
//--------------------------------------------------------------------------------------------------------//
const getCanvas = function () {
    // Get reference to canvas
    let canvas = document.getElementById('webgl-canvas')
    // canvas.width = window.innerWidth
    // canvas.height = window.innerHeight

    // Add aspect property for perspective projection matrix
    canvas.aspect = canvas.width / canvas.height

    return canvas
}

//--------------------------------------------------------------------------------------------------------//
// spaceship fetching and methods
//--------------------------------------------------------------------------------------------------------//

//track key inputs and make array out of it
const keys = {}
window.addEventListener('keydown', (e) => {
    keys[e.code] = true
})

window.addEventListener('keyup', (e) => {
    keys[e.code] = false
})
//--------------------------------------------------------------------------------------------------------//
// Make sphere helper method
//--------------------------------------------------------------------------------------------------------//

// function makeSphere (centre, radius, h, v, colour)
// {
//     let vertexList = [], indexList = []
//     for (let i = 0; i <= v + 1; i++) {
//         for (let j = 0; j <= h; j++) {
//             let theta = 2 * Math.PI * j / h
//             let y = (i / v - 0.5) * 2
//             let r = Math.sqrt(1 - y * y)
//             let x = Math.cos(theta) * r
//             let z = Math.sin(theta) * r
//             let point = [x, y, z]

//             for (let k = 0; k < 3; k++)
//             {vertexList[vertexList.length] = point[k] * radius + centre[k]}
//             for (let k = 0; k < 3; k++)
//             {vertexList[vertexList.length] = point[k]}
//             for (let k = 0; k < 3; k++)
//             {vertexList[vertexList.length] = colour[k]}

//             vertexList[vertexList.length] = j / h
//             vertexList[vertexList.length] = i / v
//         }}
  
//     for (let i = 0; i < v; i++) {
//         for (let j = 0; j < h; j++) {
//             indexList[indexList.length] = i * h + j
//             indexList[indexList.length] = (i + 1) * h + (j + 1) % h
//             indexList[indexList.length] = i * h + (j + 1) % h
//             indexList[indexList.length] = i * h + j
//             indexList[indexList.length] = (i + 1) * h + j
//             indexList[indexList.length] = (i + 1) * h + (j + 1) % h
//         }}

//     return {
//         vertex : vertexList,
//         index : indexList
//     }
// }

// //--------------------------------------------------------------------------------------------------------//
function makeQuad (positions, normals, colours, uvs)
{
    let vertexList = [], indexList = []

    for (let i = 0; i < 4; ++i)
    {
        for (let k = 0; k < 3; ++k)
        {vertexList[vertexList.length] = positions[i][k]}
        for (let k = 0; k < 3; ++k)
        {vertexList[vertexList.length] = normals[i][k]}
        for (let k = 0; k < 3; ++k)
        {vertexList[vertexList.length] = colours[i][k]}
        for (let k = 0; k < 2; ++k)
        {vertexList[vertexList.length] = uvs[i][k]}
    }

    indexList[indexList.length] = 0
    indexList[indexList.length] = 1
    indexList[indexList.length] = 2
    indexList[indexList.length] = 0
    indexList[indexList.length] = 2
    indexList[indexList.length] = 3

    console.log('Vertext: ' + vertexList + 'Index: ' + indexList )

    return {
        vertex : vertexList,
        index : indexList
    }
}

function makeSpaceship (positions, normals, colours, uvs)
{
    let vertexList = [], indexList = []

    for (let i = 0; i < 3; ++i)
    {
        for (let k = 0; k < 3; ++k)
        {vertexList[vertexList.length] = positions[i][k]}
        for (let k = 0; k < 3; ++k)
        {vertexList[vertexList.length] = normals[i][k]}
        for (let k = 0; k < 3; ++k)
        {vertexList[vertexList.length] = colours[i][k]}
        for (let k = 0; k < 2; ++k)
        {vertexList[vertexList.length] = uvs[i][k]}
    }

    indexList[indexList.length] = 0
    indexList[indexList.length] = 1
    indexList[indexList.length] = 2

    console.log('Vertext: ' + vertexList + 'Index: ' + indexList )

    return {
        vertex : vertexList,
        index : indexList
    }
}

//--------------------------------------------------------------------------------------------------------//
// Convert Base64 encoded images to img objects and add them to DOM
//--------------------------------------------------------------------------------------------------------//
function convertTextures (textureList) {
    for (let e in textureList) {
        let img = document.createElement('img')
        let imgContainer = document.getElementById('imageCollection')
        img.src = textureList[`${e}`]
        imgContainer.appendChild(img)

        textureList[`${e}`] = img
    }
}

//--------------------------------------------------------------------------------------------------------//
// Program main entry point
//--------------------------------------------------------------------------------------------------------//
const main = function ()
{
    // Initialise context (canvas, gl)
    const canvas = getCanvas()

    // Assign context to gl
    let gl = null
    try { gl = canvas.getContext('experimental-webgl', {
        antialias: true
    }) }
    catch (e) {alert('No webGL compatibility detected!'); return false}

    //--------------------------------------------------------------------------------------------------------//
    // Set up scene
    //--------------------------------------------------------------------------------------------------------//
    const scene = new Scene()
    scene.initialise(gl, canvas)

    //--------------------------------------------------------------------------------------------------------//
    // Set up geometry
    //--------------------------------------------------------------------------------------------------------//
    // make asteroids:
    let asteroids = []

    const spawnAsteroids = function (amountOfAsteroids) {
        for (let i = 0; i <= amountOfAsteroids; i++) {
            let asteroid
            if (i % 3 === 0) {
                asteroid = new largeAsteroid()
            } else if (i % 3 === 1) {
                asteroid = new mediumAsteroid()
            } else {
                asteroid = new smallAsteroid()
            }
            asteroid.x = placeRandomly(asteroid)
            asteroid.y = placeRandomly(asteroid)
    
            asteroids.push(asteroid)
        }
    }

    let asteroidGeometry = makeQuad(
        [[-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0]],
        [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0], [1, 0], [1, 1], [0, 1]])
    let asteroidModel = new Model()
    asteroidModel.name = 'AsteroidModel'
    asteroidModel.index = asteroidGeometry.index
    asteroidModel.vertex = asteroidGeometry.vertex
    asteroidModel.compile(scene)
    
    //create largeAsteroid model that has different indices than the other asteroids
    let largeAsteroidGeometry = makeQuad(
        [[-1.4, -1.6, 0], [1.3, -1.7, 0], [2.2, 2.3, 0], [-2.2, 2.4, 0]],
        [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0], [1, 0], [1, 1], [0, 1]]
    )
    let largeAsteroidModel = new Model()
    largeAsteroidModel.name = 'large Asteroid'
    largeAsteroidModel.index = largeAsteroidGeometry.index
    largeAsteroidModel.vertex = largeAsteroidGeometry.vertex
    largeAsteroidModel.compile(scene)
    
    // make the Spaceship render and create object from class that interacts with it
    const spaceship = new Spaceship(0, 0, 1, 0.05, 0)
    let spaceshipGeometry = makeSpaceship(
        [[-0.5, -1, 0], [0, 1, 0], [0.5, -1, 0]],
        [[0, 0, 1], [0, 0, 1], [0, 0, 1]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0], [1, 0], [1, 1]]
    )
    let spaceShipmodel = new Model()
    spaceShipmodel.name = 'spaceship'
    spaceShipmodel.index = spaceshipGeometry.index
    spaceShipmodel.vertex = spaceshipGeometry.vertex
    spaceShipmodel.compile(scene)

    //--------------------------------------------------------------------------------------------------------//
    // Set up lights
    //--------------------------------------------------------------------------------------------------------//
    let light = new Light()
    //light.type = Light.LIGHT_TYPE.SPOT;
    //light.type = Light.LIGHT_TYPE.POINT;
    light.type = Light.LIGHT_TYPE.DIRECTIONAL
    light.setDiffuse([2, 2, 2])
    light.setSpecular([1, 1, 1])
    light.setAmbient([0.2, 0.2, 0.2])
    light.setPosition([0, 0, 0])
    light.setDirection([0, 0, -1])
    light.setCone(0.7, 0.6)
    light.attenuation = Light.ATTENUATION_TYPE.NONE
    light.bind(gl, scene.shaderProgram, 0)

    //--------------------------------------------------------------------------------------------------------//
    // Set up textures and materials
    //--------------------------------------------------------------------------------------------------------//
    let material = new Material()
    let textureList = new Textures()
    convertTextures(textureList)

    material.setAlbedo(gl, textureList.earth)
    material.setShininess(96.0)
    material.setSpecular([1, 1, 1])
    material.setAmbient([1, 1, 1])
    material.setDiffuse([1, 1, 1])
    material.bind(gl, scene.shaderProgram)

    let material2 = new Material()

    material2.setAlbedo(gl, textureList.earth)
    material2.setDiffuse([1, 1, 1])
    material2.setShininess(0.0)
    material2.setSpecular([0, 0, 0])
    material2.setAmbient([1, 1, 1])
    material2.bind(gl, scene.shaderProgram)

    // let material3 = new Material()

    // material3.setAlbedo(gl, textureList.earth)
    // material3.setDiffuse([1, 1, 1])
    // material3.setShininess(8.0)
    // material3.setSpecular([1, 1, 1])
    // material3.setAmbient([0.2, 0.2, 0.2])
    // material3.bind(gl, scene.shaderProgram)

    //--------------------------------------------------------------------------------------------------------//
    // Set up scene graph
    //--------------------------------------------------------------------------------------------------------//
    spaceShipmodel.material = material
    asteroidModel.material = material2
    largeAsteroidModel.material = material2
    // model3.material = material3

    let lightNode = scene.addNode(scene.root, light, 'lightNode', Node.NODE_TYPE.LIGHT)
    let spaceshipNode = scene.addNode(lightNode, spaceShipmodel, 'spaceshipNode', Node.NODE_TYPE.MODEL)
    //make a master node of asteroids and then work have 3 different nodes attached to it --> large, small and medium
    let asteroidNode = scene.addNode(lightNode, asteroidModel, 'asteroidNode', Node.NODE_TYPE.GROUP)
    let largeAsteroidNode = scene.addNode(asteroidNode, largeAsteroidModel, 'largeAsteroidNode', Node.NODE_TYPE.MODEL)
    // var quadNode = scene.addNode(lightNode, model3, "quadNode", Node.NODE_TYPE.MODEL);

    //--------------------------------------------------------------------------------------------------------//
    // Set up animation
    //--------------------------------------------------------------------------------------------------------//
    let ang = 0

    //handles the movement of the objects --> animationCallback mehthod
    spaceshipNode.animationCallback = function () {
        moveSpaceship(spaceship, keys)
        matrixHelper.matrix4.makeRotationZ(this.transform, spaceship.angle)
        this.transform[12] = spaceship.x
        this.transform[13] = spaceship.y
    }

    largeAsteroidNode.animationCallback = function () {
        spawnAsteroids(4)
        for (let i = 0; i < asteroids.length; i++) {
            moveAsteroids(asteroids[i])
            this.transform = matrixHelper.matrix4.makeTranslation([asteroids[i].x, asteroids[i].y, 0])
        }
    }

    // quadNode.animationCallback = function(deltaTime) {
    //   ang += deltaTime / 1000;
    //   this.transform[13] = Math.cos(ang) * 3;
    // };

    let Vec3 = matrixHelper.vector3
    let Mat4x4 = matrixHelper.matrix4

    let theta = 0
    let lightTransform = Mat4x4.create()
    let modelTransform = Mat4x4.create()
    let viewTransform = Mat4x4.create()
    let observer = Vec3.from(0, 0, 25)

    Mat4x4.makeIdentity(viewTransform)
    Mat4x4.makeIdentity(modelTransform)
    Mat4x4.makeIdentity(lightTransform)

    //--------------------------------------------------------------------------------------------------------//
    // Set up render loop
    //--------------------------------------------------------------------------------------------------------//
    
    scene.setViewFrustum(1, 100, 0.5236)

    let render = function ()
    {
        theta += 0.01 // Increment rotation angle

        //Mat4x4.makeTranslation(spaceshipNode.transform, [10, 0, 0])

        Mat4x4.makeRotationY(viewTransform, theta)  // rotate camera about y
        //Mat4x4.multiplyPoint(observer, viewTransform, [0,0,15]);  // apply camera rotation
        scene.lookAt(observer, [0, 0, 0], [0, 1, 0])

        scene.beginFrame()
        scene.animate()
        scene.draw()
        scene.endFrame()

        window.requestAnimationFrame(render)
    }

    // Go!
    render()
}
window.addEventListener('DOMContentLoaded', main)