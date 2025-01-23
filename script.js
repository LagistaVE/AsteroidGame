import { Scene, Node } from './scene.js'
import { Model } from './model.js'
import { Material } from './material.js'
import { Light } from './light.js'
import { matrixHelper } from './matrix.js'
import { Spaceship, spaceshipRespawn } from './support/Spaceship.js'
import { LargeAsteroid, MediumAsteroid, moveAsteroids, SmallAsteroid, spawnAsteroids  } from './support/Asteroids.js'
import { moveSaucers, spawnSaucers } from './support/Saucer.js'
import { addToHighscore, laserHit, checkCollisionTarget } from './support/collisionDetection.js'
import { isOnScreen } from './support/screenlimit.js'
import { displayTitle, displayControls, displayHighScores, displayInstructions } from './GameStateModes/AttractMode.js'
import { displayScore, displayLives, displayWaveNr } from './GameStateModes/GameplayMode.js'
import { makeQuad, makeSphere, makeTri, deformedSphere } from './support/CreateGeometry.js'

//--------------------------------------------------------------------------------------------------------//
// global variables
//--------------------------------------------------------------------------------------------------------//
// arrays of different kinds of enemies
let largeSaucers = []
let largeSaucerLasers = []
let smallSaucers = []
let smallSaucerLasers = []
let largeAsteroids = []
let mediumAsteroids = []
let smallAsteroids = []
let amountToSpawn = 4 // indicates how many asteroids to spawn
const INITIAL_LIVES = 3
// variables that define game behviour etc.
let highscores = [] // array that saves the top 3 highscores
let highscore = 0 // shows the current highscore of the player
let waveNr = 0  // saves the current wave nr.
let possibleExtraLife = true //flag used to distribute extra life when reaching 10k points

//--------------------------------------------------------------------------------------------------------//
// variables for the UI
//--------------------------------------------------------------------------------------------------------//

let gameState = 'AttractMode' // starts with Attract, as it always does this to begin with --> gets changed to transitin between game states

const startButton = document.querySelector('.start-button')
const gameTitle = document.querySelector('.game-title')
const highScores = document.querySelector('.high-scores')
const instructions = document.querySelector('.instructions')
const controls = document.querySelector('.controls')
const gameplayContainer = document.querySelector('.gameplay-container')
const gameOverContainer = document.querySelector('.gameOver-container')
const initialsInput = document.getElementById('initials-input')
const submitInitialsButton = document.getElementById('submit-initials-button')
const returnButton = document.getElementById('return-button')

gameplayContainer.classList.add('hidden')
gameOverContainer.classList.add('hidden')

//--------------------------------------------------------------------------------------------------------//
// UI implementation
//--------------------------------------------------------------------------------------------------------//

const updateGameState = function (spaceship, scene) {
    if (gameState === 'AttractMode') {
        startButton.addEventListener('click', () => {
            startButton.classList.add('hidden')
            gameTitle.classList.add('hidden')
            highScores.classList.add('hidden')
            instructions.classList.add('hidden')
            controls.classList.add('hidden')
            gameState = 'GameplayMode'
        })
        // Display game title
        displayTitle('Asteroids')

        // Display high scores
        displayHighScores(highscores)

        // Display instructions on how to start the game
        displayInstructions('Press the start button to start your game :)')

        // Ensure all controls are well communicated to the player through the UI
        displayControls()
    } else if (gameState === 'GameplayMode') {
        // Display lives and score during gameplay
        gameplayContainer.classList.remove('hidden')

        displayLives(spaceship.lives)
        displayScore(highscore)
        displayWaveNr(waveNr)

        if (spaceship.lives <= 0) {
            gameState = 'GameOverMode'
        }
    } else if (gameState === 'GameOverMode') {
        // Display game over screen
        gameOverContainer.classList.remove('hidden')

        // Handle high score input
        submitInitialsButton.addEventListener('click', () => {
            // Get  input value and trip whitespace
            const initials = initialsInput.value.trim()
            // Check if initials is not empty and not already in highscores array
            //--> this is supposed to not let the same initial be set one after the other
            if (initials && !highscores.includes(initials)) {
                // Add to highscores array
                highscores.push(initials)
                // Log highscores array for debugging
                console.log(highscores)
            }
        })

        // Handle return to Attract Mode or restart
        returnButton.addEventListener('click', () => {
            gameOverContainer.classList.add('hidden')
            gameState = 'AttractMode'
            spaceship.lives = INITIAL_LIVES // Reset spaceship lives to initial value
            highscore = 0 // Reset the highscore
            waveNr = 0 // Reset the wave number or any other game progress indicators
            amountToSpawn = 4
        
            // Reset any other necessary variables or game state
        
            // Hide gameplay container if it was displayed
            gameplayContainer.classList.add('hidden')
        
            // Call functions to display attract mode elements
            startButton.classList.remove('hidden')
            gameTitle.classList.remove('hidden')
            highScores.classList.remove('hidden')
            instructions.classList.remove('hidden')
            controls.classList.remove('hidden')

            //reset the gameplay arrays
            removeAllFromArrayAndScene(largeAsteroids, scene)
            removeAllFromArrayAndScene(mediumAsteroids, scene)
            removeAllFromArrayAndScene(smallAsteroids, scene)
            removeAllFromArrayAndScene(largeSaucers, scene)
            removeAllFromArrayAndScene(smallSaucers, scene)
        })
    }
}
//--------------------------------------------------------------------------------------------------------//
// initialize canvas
//--------------------------------------------------------------------------------------------------------//

const getCanvas = function () {
    // Get reference to canvas
    let canvas = document.getElementById('webgl-canvas')

    // Add aspect property for perspective projection matrix
    canvas.aspect = canvas.width / canvas.height

    return canvas
}

//--------------------------------------------------------------------------------------------------------//
// helper methods
//--------------------------------------------------------------------------------------------------------//

//checks if the arrays are empty so that new asteroids can be spawned through initNewWave
function checkArrayLengths () {
    return largeAsteroids.length === 0 && mediumAsteroids.length === 0 && smallAsteroids.length === 0
}

//control and spawn new waves
function initNewWave () {
    if (checkArrayLengths()) {
        waveNr++
        amountToSpawn++
        spawnAsteroids(amountToSpawn, largeAsteroids, mediumAsteroids, smallAsteroids)
    }
}

//track key inputs and make array out of it
const keys = {}
window.addEventListener('keydown', (e) => {
    keys[e.code] = true
})

window.addEventListener('keyup', (e) => {
    keys[e.code] = false
})

// uses the previous check if the spaceship has been hit to trigger the effects on the game (decrement the spaceship.lives variable and reset it)
const handleCollisionTarget = function (spaceship, targets) {
    for (let i = 0; i < targets.length; i++) {
        const target = targets[i]
        if (checkCollisionTarget(spaceship, target)) {
            spaceshipRespawn(spaceship)
        }
    }
}

function removeAllFromArrayAndScene (array, scene) {
    // Iterate over each element in the array
    array.forEach((element) => {
        // Remove the element from the array
        const index = array.indexOf(element)
        if (index > -1) {
            array.splice(index, 1)
        }
        // Remove the corresponding node from the scene graph
        // Assuming the node is stored with a unique identifier or reference
        const nodeToRemove = scene.removeNode(element.name) // Adjust this based on your scene graph implementation
        if (nodeToRemove) {
            scene.removeNode(nodeToRemove)
        }
    })
}

//--------------------------------------------------------------------------------------------------------//
// Program main entry point
//--------------------------------------------------------------------------------------------------------//
let main = function () {
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

    // create quad that laps over entire screen and acts as background
    let backgroundGeometry = makeQuad(
        [[-8, -8, 0], [8, -8, 0], [8, 8, 0], [-8, 8, 0]],
        [[0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0], [1, 0], [1, 1], [0, 1]]
    )
    let backgroundModel = new Model()
    backgroundModel.name = 'background'
    backgroundModel.index = backgroundGeometry.index
    backgroundModel.vertex = backgroundGeometry.vertex
    backgroundModel.compile(scene)
    
    //create different asteroid geometries and models that has different indices than the other asteroids

    let largeAsteroidGeometry = deformedSphere([0, 0, 0], 1.5, 60, 60, [0, 0, 0], 0.4)
    let largeAsteroidModel = new Model()
    largeAsteroidModel.name = 'large Asteroid'
    largeAsteroidModel.index = largeAsteroidGeometry.index
    largeAsteroidModel.vertex = largeAsteroidGeometry.vertex
    largeAsteroidModel.compile(scene)

    let mediumAsteroidGeometry = deformedSphere([0, 0, 0], 1, 60, 60, [0, 0, 0], 0.3)
    let mediumAsteroidModel = new Model()
    mediumAsteroidModel.name = 'medium Asteroid'
    mediumAsteroidModel.index = mediumAsteroidGeometry.index
    mediumAsteroidModel.vertex = mediumAsteroidGeometry.vertex
    mediumAsteroidModel.compile(scene)

    let smallAsteroidGeometry = deformedSphere([0, 0, 0], 0.5, 60, 60, [0, 0, 0], 0.2)
    let smallAsteroidModel = new Model()
    smallAsteroidModel.name = 'small Asteroid'
    smallAsteroidModel.index = smallAsteroidGeometry.index
    smallAsteroidModel.vertex = smallAsteroidGeometry.vertex
    smallAsteroidModel.compile(scene)
    
    // make the Spaceship render and create object from class that interacts with it

    const spaceship = new Spaceship(0, -1, 0, 0.05)
    let spaceshipGeometry = makeTri(
        [[-0.5, -0.9, 0], [0, 0.5, 0], [0.5, -0.9, 0]],
        [[0, 0, 1], [0, 0, 1], [0, 0, 1]],
        [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
        [[0, 0], [0.5, 1], [1, 0]]
    )
    let spaceshipModel = new Model()
    spaceshipModel.name = 'spaceship'
    spaceshipModel.index = spaceshipGeometry.index
    spaceshipModel.vertex = spaceshipGeometry.vertex
    spaceshipModel.compile(scene)

    //lasers for the scene
    let lasersGeometry = makeTri(
        [[-0.15, -0.15, 0], [0.15, 0.15, 0], [0.15, -0.15, 0]],
        [[0, 0, 1], [0, 0, 1], [0, 0, 1]],
        [[1, 1, 0], [1, 1, 0], [1, 1, 0]],
        [[0, 0], [1, 0], [1, 1]]
    )
    let lasersModel = new Model()
    lasersModel.name = 'laser'
    lasersModel.index = lasersGeometry.index
    lasersModel.vertex = lasersGeometry.vertex
    lasersModel.compile(scene)
    
    //create saucers --> want them to be a small spheres and work with textures

    let largeSaucersGeometry = makeSphere([0, 0, 0], 0.6, 60, 60, [0, 0, 0])
    let largeSaucersModel = new Model ()
    largeSaucersModel.name = 'large Saucer'
    largeSaucersModel.index = largeSaucersGeometry.index
    largeSaucersModel.vertex = largeSaucersGeometry.vertex
    largeSaucersModel.compile(scene)

    let smallSaucerGeometry = makeSphere([0, 0, 0], 0.4, 60, 60, [0, 0, 0])
    let smallSaucerModel = new Model ()
    smallSaucerModel.name = 'small Saucer'
    smallSaucerModel.index = smallSaucerGeometry.index
    smallSaucerModel.vertex = smallSaucerGeometry.vertex
    smallSaucerModel.compile(scene)

    //--------------------------------------------------------------------------------------------------------//
    // Set up lights
    //--------------------------------------------------------------------------------------------------------//

    let light = new Light()
    light.type = Light.LIGHT_TYPE.DIRECTIONAL
    light.setDiffuse([2, 2, 2])
    light.setSpecular([0.1, 0.1, 0.1])
    light.setAmbient([0.2, 0.2, 0.2])
    light.setPosition([-2.18, 3.8, 0])          // position of the star shining in the background
    light.setDirection([0, 0, -1])
    light.setCone(0.7, 0.6)
    light.attenuation = Light.ATTENUATION_TYPE.NONE
    light.bind(gl, scene.shaderProgram, 0)

    //--------------------------------------------------------------------------------------------------------//
    // Set up textures and materials
    //--------------------------------------------------------------------------------------------------------//

    let materialBackground = new Material()

    const backgroundSprite = new Image()
    backgroundSprite.src = '/pictures/space_background.jpeg'
    backgroundSprite.onload = () => {
        materialBackground.setAlbedo(gl, backgroundSprite)
    }
    materialBackground.setShininess(96.0)
    materialBackground.setSpecular([1, 1, 1])
    materialBackground.setAmbient([1, 1, 1])
    materialBackground.setDiffuse([1, 1, 1])
    materialBackground.bind(gl, scene.shaderProgram)

    let materialSpaceship = new Material()

    const spaceshipSprite = new Image()
    spaceshipSprite.src = '/pictures/spaceshipSprite.png'
    spaceshipSprite.onload = () => {
        materialSpaceship.setAlbedo(gl, spaceshipSprite)
    }
    materialSpaceship.setShininess(96.0)
    materialSpaceship.setSpecular([1, 1, 1])
    materialSpaceship.setAmbient([1, 1, 1])
    materialSpaceship.setDiffuse([1, 1, 1])
    materialSpaceship.bind(gl, scene.shaderProgram)

    let materialSaucer = new Material()

    const saucerSprite = new Image()
    saucerSprite.src = '/pictures/evilSpaceship.jpeg'
    saucerSprite.onload = () => {
        materialSaucer.setAlbedo(gl, saucerSprite)
    }
    materialSaucer.setDiffuse([1, 1, 1])
    materialSaucer.setShininess(0.0)
    materialSaucer.setSpecular([0, 0, 0])
    materialSaucer.setAmbient([1, 1, 1])
    materialSaucer.bind(gl, scene.shaderProgram)

    let materialAsteroid = new Material()

    const asteroidSprite = new Image()
    asteroidSprite.src = '/pictures/asteroid.jpeg'
    asteroidSprite.onload = () => {
        materialAsteroid.setAlbedo(gl, asteroidSprite)
    }
    materialAsteroid.setDiffuse([1, 1, 1])
    materialAsteroid.setShininess(0.0)
    materialAsteroid.setSpecular([0, 0, 0])
    materialAsteroid.setAmbient([1, 1, 1])
    materialAsteroid.bind(gl, scene.shaderProgram)

    //--------------------------------------------------------------------------------------------------------//
    // Set up scene graph
    //--------------------------------------------------------------------------------------------------------//

    //background
    backgroundModel.material = materialBackground

    //spaceship and laser
    spaceshipModel.material = materialSpaceship
    lasersModel.material = materialSpaceship

    //asteroids

    largeAsteroidModel.material = materialAsteroid
    mediumAsteroidModel.material = materialAsteroid
    smallAsteroidModel.material = materialAsteroid
    //saucers
    largeSaucersModel.material = materialSaucer
    smallSaucerModel.material = materialSaucer

    //--------------------------------------------------------------------------------------------------------//
    // Set up the group nodes but also the spaceship Model node, as this one won't change
    //--------------------------------------------------------------------------------------------------------//
    
    let lightNode = scene.addNode(scene.root, light, 'lightNode', Node.NODE_TYPE.LIGHT)
    //implement the starry background --> needs to be first so the other stuff renders on top of it!!
    let backgroundNode = scene.addNode(lightNode, backgroundModel, 'backgroundNode', Node.NODE_TYPE.MODEL)
    let asteroidNode = scene.addNode(lightNode, null, 'asteroidNode', Node.NODE_TYPE.GROUP)
    let spaceshipNode = scene.addNode(lightNode, spaceshipModel, 'spaceshipNode', Node.NODE_TYPE.MODEL)
    let lasersNode = scene.addNode(lightNode, null, 'lasersNode', Node.NODE_TYPE.GROUP)
    let evilLasersNode = scene.addNode(lightNode, null, 'evilLasersNode', Node.NODE_TYPE.GROUP)
    let saucerNode = scene.addNode(lightNode, null, 'saucerNode', Node.NODE_TYPE.GROUP)

    // scene.print(0)

    function createAsteroidAnimationCallback (asteroid, asteroidNode) {
        return function () {
            // Only move when the asteroid exists in the array
            if (asteroid) {
                moveAsteroids([asteroid])
                matrixHelper.matrix4.makeRotationZ(asteroidNode.transform, asteroid.angle)
                asteroidNode.transform[12] = asteroid.x
                asteroidNode.transform[13] = asteroid.y
            }
        }
    }

    const handleAsteroidRendering = function () {
        // Loop for large asteroids
        largeAsteroids.forEach((asteroid) => {
            if (!asteroid.spawned) {
                let largeAsteroidNode = scene.addNode(asteroidNode, largeAsteroidModel, asteroid.name, Node.NODE_TYPE.MODEL)
                largeAsteroidNode.animationCallback = createAsteroidAnimationCallback(asteroid, largeAsteroidNode)
                asteroid.spawned = true
            }
        })
        
        // Loop for medium asteroids
        mediumAsteroids.forEach((asteroid) => {
            if (!asteroid.spawned) {
                let mediumAsteroidNode = scene.addNode(asteroidNode, mediumAsteroidModel, asteroid.name, Node.NODE_TYPE.MODEL)
                mediumAsteroidNode.animationCallback = createAsteroidAnimationCallback(asteroid, mediumAsteroidNode)
                asteroid.spawned = true
            }
        })
        
        // Loop for small asteroids
        smallAsteroids.forEach((asteroid) => {
            if (!asteroid.spawned) {
                let smallAsteroidNode = scene.addNode(asteroidNode, smallAsteroidModel, asteroid.name, Node.NODE_TYPE.MODEL)
                smallAsteroidNode.animationCallback = createAsteroidAnimationCallback(asteroid, smallAsteroidNode)
                asteroid.spawned = true
            }
        })
    }

    //--------------------------------------------------------------------------------------------------------//
    // control spaceship behaviour and interactions and visualize them
    //--------------------------------------------------------------------------------------------------------//
    const handleSpaceshipRendering = function () {
        spaceshipNode.animationCallback = function () {
        //movement of spaceship
            spaceship.move(keys, gameState)
            matrixHelper.matrix4.makeRotationZ(this.transform, spaceship.angle)
            this.transform[12] = spaceship.x
            this.transform[13] = spaceship.y

            //check for collisions of the asteroids with the spaceship
            handleCollisionTarget(spaceship, largeAsteroids)
            handleCollisionTarget(spaceship, mediumAsteroids)
            handleCollisionTarget(spaceship, smallAsteroids)
            handleCollisionTarget(spaceship, largeSaucers)
            handleCollisionTarget(spaceship, smallSaucers)

            //laser handling (scene graph)

            //create new array that has all the lasers that are off screen and store them
            let offScreenLasers = spaceship.lasers.filter((laser, i) => !isOnScreen(spaceship.lasers[i]))

            //manipulate the lasers array that has all the lasers that are on screen
            spaceship.lasers = spaceship.lasers.filter((laser, i) => isOnScreen(spaceship.lasers[i]))

            offScreenLasers.forEach((node) => { scene.removeNode(node.name) })

            spaceship.lasers.forEach((laser, i) => {
                if (!laser.spawned) {
                    let node = scene.addNode(lasersNode, lasersModel, laser.name, Node.NODE_TYPE.MODEL)
                    node.animationCallback = () => {
                        node.transform[12] = laser.x
                        node.transform[13] = laser.y

                        //method to handle laser hitting
                        const handleLaserHitDetection = function (laser, targets) {
                            for (let target of targets) {
                                target.isHit = laserHit(laser, target)
                                if (target.isHit) {
                                    highscore = addToHighscore (highscore, target)
                                    const index = targets.indexOf(target)
                                    targets.splice(index, 1)

                                    // If the target is a large or medium asteroid, split it into two smaller ones
                                    if (target instanceof LargeAsteroid) {
                                        mediumAsteroids.push(new MediumAsteroid())
                                        mediumAsteroids.push(new MediumAsteroid())
                                    } else if ( target instanceof MediumAsteroid) {
                                        smallAsteroids.push(new SmallAsteroid())
                                        smallAsteroids.push(new SmallAsteroid())
                                    }

                                    const targetNode = scene.findNode(target.name)
                                    if (targetNode) {
                                        scene.removeNode(targetNode.name)
                                    } else {
                                        console.error('node not found')
                                    }
                                }
                            }
                        }
                        handleLaserHitDetection(laser, largeAsteroids)
                        handleLaserHitDetection(laser, mediumAsteroids)
                        handleLaserHitDetection(laser, smallAsteroids)
                        handleLaserHitDetection(laser, largeSaucers)
                        handleLaserHitDetection(laser, smallSaucers)
                    }
                    laser.spawned = true    // makes sure that it does not spawn again
                }

                laser.animate()
            })
        }
    }
    // specfic animationcallback creation function, so the code gets more concise
    function createSaucerAnimationCallback (saucer, saucerNode, saucerLasers) {
        return function () {
            if (saucer) {
                moveSaucers(saucer, spaceship, saucerLasers)
                saucerNode.transform[12] = saucer.x
                saucerNode.transform[13] = saucer.y
            }
        }
    }
    
    function spawnAndMoveSaucers () {
        // save ctrl number of the arrays. handles that the same saucer does not get multiple nodes
        let crtNumberLargeSaucers = largeSaucers.length
        let crtNumberSmallSaucers = smallSaucers.length
    
        spawnSaucers(largeSaucers, smallSaucers, highscore)
    
        // Add nodes and animation callbacks for large saucers
        for (let i = crtNumberLargeSaucers; i < largeSaucers.length; i++) {
            let largeSaucersNode = scene.addNode(saucerNode, largeSaucersModel, largeSaucers[i].name, Node.NODE_TYPE.MODEL)
            largeSaucersNode.animationCallback = createSaucerAnimationCallback(largeSaucers[i], largeSaucersNode, largeSaucerLasers)
        }
    
        // Add nodes and animation callbacks for small saucers
        for (let i = crtNumberSmallSaucers; i < smallSaucers.length; i++) {
            let smallSaucersNode = scene.addNode(saucerNode, smallSaucerModel, smallSaucers[i].name, Node.NODE_TYPE.MODEL)
            smallSaucersNode.animationCallback = createSaucerAnimationCallback(smallSaucers[i], smallSaucersNode, smallSaucerLasers)
        }
    }

    // Run the function initially
    spawnAndMoveSaucers()

    // Set interval to run the function every 10 seconds
    setInterval(spawnAndMoveSaucers, 10000)

    const handleShootingOfSaucers = function () {
        //method to handle laser hitting
        const handleLaserHitDetection = function (laser, targets) {
            for (let target of targets) {
                target.isHit = laserHit(laser, target)
                if (target.isHit) {
                    const index = targets.indexOf(target)
                    targets.splice(index, 1)

                    // If the target is a large or medium asteroid, split it into two smaller ones
                    if (target instanceof LargeAsteroid) {
                        mediumAsteroids.push(new MediumAsteroid())
                        mediumAsteroids.push(new MediumAsteroid())
                    } else if ( target instanceof MediumAsteroid) {
                        smallAsteroids.push(new SmallAsteroid())
                        smallAsteroids.push(new SmallAsteroid())
                    }

                    const targetNode = scene.findNode(target.name)
                    if (targetNode) {
                        scene.removeNode(targetNode.name)
                    } else {
                        console.error('node not found')
                    }
                }
            }
        }
        // when the laser hits the spaceship reset it and decrement life --> see spaceshipRespawn function
        const handleLaserHitOnSpaceship = function (laser) {
            if (laserHit(laser, spaceship)) {
                spaceshipRespawn(spaceship)
            }
        }

        // Handle saucer laser shooting for large saucers
    
        // Add lasers to the scene graph for large saucers
        largeSaucerLasers.forEach((laser) => {
            if (!laser.spawned) {
                let node = scene.addNode(evilLasersNode, lasersModel, laser.name, Node.NODE_TYPE.MODEL)
                node.animationCallback = () => {
                    node.transform[12] = laser.x
                    node.transform[13] = laser.y
                    // Handle collision detection for saucer lasers here if needed
                    handleLaserHitOnSpaceship(laser)
                    handleLaserHitDetection(laser, largeAsteroids, largeSaucers)
                    handleLaserHitDetection(laser, mediumAsteroids, largeSaucers)
                    handleLaserHitDetection(laser, smallAsteroids, largeSaucers)
                }
                laser.spawned = true    // makes sure that it does not spawn again
            }
            laser.animate()
        })
    
        // Add lasers to the scene graph for small saucers
        smallSaucerLasers.forEach((laser) => {
            if (!laser.spawned) {
                let node = scene.addNode(evilLasersNode, lasersModel, laser.name, Node.NODE_TYPE.MODEL)
                node.animationCallback = () => {
                    node.transform[12] = laser.x
                    node.transform[13] = laser.y
                    // Handle collision detection for saucer lasers here if needed
                    handleLaserHitOnSpaceship(laser)
                    handleLaserHitDetection(laser, largeAsteroids, smallSaucers)
                    handleLaserHitDetection(laser, mediumAsteroids, smallSaucers)
                    handleLaserHitDetection(laser, smallAsteroids, smallSaucers)
                }
                laser.spawned = true    // makes sure that it does not spawn again
            }
            laser.animate()
        })
    }

    let Vec3 = matrixHelper.vector3
    let Mat4x4 = matrixHelper.matrix4
  
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
        updateGameState(spaceship, scene)

        handleSpaceshipRendering()
        handleShootingOfSaucers()
        handleAsteroidRendering()
        initNewWave()

        //if the extra life is possible to have and highscore high enough then add the extra life
        if (possibleExtraLife && highscore > 10000) {
            spaceship.lives++
            possibleExtraLife = false
        }
     
        scene.lookAt(observer, [0, 0, 0], [0, 1, 0])

        scene.beginFrame()
        scene.animate()
        scene.draw()
        scene.endFrame()

        window.requestAnimationFrame(render)
    }

    render()
}

window.addEventListener('DOMContentLoaded', main)