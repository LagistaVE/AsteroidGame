import { Vector3, Matrix4 } from './matrix.js'
import { Spaceship } from './support/Spaceship.js'
import { placeRandomly } from './support/placeRandomly.js'
import { verticalScreenLimit, horizontalScreenLimit } from './support/screenlimit.js'
import { largeAsteroid, mediumAsteroid, smallAsteroid } from './support/Asteroids.js'

//--------------------------------------------------------------------------------------------------------//
// initialize canvas
//--------------------------------------------------------------------------------------------------------//
let highscore

//--------------------------------------------------------------------------------------------------------//
// initialize canvas
//--------------------------------------------------------------------------------------------------------//

const getCanvas = function () {
    // Get reference to canvas
    let canvas = document.getElementById('webgl-canvas')
    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;

    // Add aspect property for perspective projection matrix
    canvas.aspect = canvas.width / canvas.height

    return canvas
}
 
//--------------------------------------------------------------------------------------------------------//
// Load shader program (from DOM element)
//--------------------------------------------------------------------------------------------------------//
function loadShader (gl, shaderName, shaderType, shaderTypeString)
{
    try
    {
        let source = document.getElementById(shaderName).text
        let shader = gl.createShader(shaderType)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)

        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        {return shader}

        alert('Error compiling shader \'' + shaderName + '\', ' + gl.getShaderInfoLog(shader))
        return false
    }

    catch (e)
    {
        alert('Exception : Cannot load shader \'' + shaderName + '\'!')
    }
}

//--------------------------------------------------------------------------------------------------------//
// fetching of models through this code block
//--------------------------------------------------------------------------------------------------------//

function fetchModel (filepath, geometry) {
    return fetch(filepath)
        .then  ( (res) => res.json())
        .then  ( (data) => { geometry.addVertices(data.v); geometry.addIndices(data.i) } )
        .catch ( (error) => console.log(error))
}

function loadingDone (count, max) {
    count += 1
    return count
}

function reportProblem (errMsg)
{
    console.log(errMsg)
}

class Geometry {
    constructor () {
        this.vertices = []
        this.indices = []
        this.geometryVertexBuffer = 0
        this.geometryIndexBuffer = 0
    }

    addVertices (vertex_list) {
        this.vertices.push(...vertex_list)
    }

    clearVertices () {
        this.vertices.clear()
    }

    addIndices (index_list) {
        this.indices.push(...index_list)
    }

    clearIndices () {
        this.indices.clear()
    }

    initBuffers (gl) {
        console.log(this.vertices)
        console.log(this.indices)

        this.geometryVertexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryVertexBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)

        // Triangle indices (connectivity)
        this.geometryIndexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.geometryIndexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW)
    }

    toString () {
        return 'Vertex Count: ' + this.vertices.length + ' -- Triangle Count: ' + this.indices.length / 3
    }
}

//--------------------------------------------------------------------------------------------------------//
// creation of spaceship and its methods
//--------------------------------------------------------------------------------------------------------//
 
//track inputs from player
const keys = {}
window.addEventListener('keydown', (e) => {
    keys[e.code] = true
})

window.addEventListener('keyup', (e) => {
    keys[e.code] = false
})

//--------------------------------------------------------------------------------------------------------//
// asteroids managment
//--------------------------------------------------------------------------------------------------------//
const asteroids = []
const spawnAsteroids = function (numberOfAsteroids) {
    for (let i = 0; i <= numberOfAsteroids; i++) {
        const size = i % 3 === 0 ? largeAsteroid.size : i % 3 === 1 ? mediumAsteroid.size : smallAsteroid.size
        
        const asteroid = {
            x: Math.random(),
            y: Math.random(),
            angle: Math.random(),
            speed: Math.random(),
            size: size
        }
        asteroid.x = placeRandomly(asteroid)
        asteroid.y = placeRandomly(asteroid)
        if (size == largeAsteroid.size) {
            asteroid.angle = largeAsteroid.angle
            asteroid.speed = largeAsteroid.speed
        } else if (size == mediumAsteroid.size) {
            asteroid.angle = mediumAsteroid.angle
            asteroid.speed = mediumAsteroid.speed
        } else {
            asteroid.angle = smallAsteroid.angle
            asteroid.speed = smallAsteroid.speed
        }
     
        asteroids.push(asteroid)
        moveAsteroids(asteroid)
    }
}

const moveAsteroids = function (asteroids) {
    for (let i = 0; i < asteroids.length; i++) {
        const asteroid = asteroids[i]

        asteroid.x += asteroid.speed * asteroid.angle
        asteroid.y += asteroid.speed * asteroid.angle
        //make the asteroids wrap around the canvas
        if (asteroid.x > horizontalScreenLimit || asteroid.x < horizontalScreenLimit * -1) {
            asteroid.x *= -1
        }
        if (asteroid.y > verticalScreenLimit || asteroid.y < verticalScreenLimit * -1) {
            asteroid.y *= -1
        }
    }
}

//--------------------------------------------------------------------------------------------------------//
// handle highscore
//--------------------------------------------------------------------------------------------------------//
const setHighscore = function (newHighscore) {
    highscore = newHighscore
    return highscore
}

//--------------------------------------------------------------------------------------------------------//
// Program main entry point
//--------------------------------------------------------------------------------------------------------//
let main = function ()
{
    // Initialise context (canvas, gl)
    const canvas = getCanvas()

    let gl = null
    try { gl = canvas.getContext('webgl2', {
        antialias: true
    }) }
    catch (e) { alert('No webGL compatibility detected!'); return false }

    let Vec3 = new Vector3
    let Mat4x4 = new Matrix4

    let modelsLoaded = 0
    const modelsMax = 1

    //const spaceshipGeometry = new Geometry()
    // fetchModel('./properties_spaceship.json', spaceshipGeometry)
    //     .then(() => {console.log('spaceshipGeometry:' + spaceshipGeometry.toString())
    //         spaceshipGeometry.initBuffers(gl)
    //         modelsLoaded = loadingDone(modelsLoaded, modelsMax)
    //         if (modelsLoaded == modelsMax) {animate()}} )
    //     .catch((error) => reportProblem('Loading Model Failed :( ' + error))

    const asteroidGeometry = new Geometry()
    fetchModel('./properties_asteroids.json', asteroidGeometry)
        .then(() => {console.log('asteroidGeometry: +' + asteroidGeometry.toString())
            asteroidGeometry.initBuffers(gl)
            modelsLoaded = loadingDone(modelsLoaded, modelsMax)
            if (modelsLoaded == modelsMax) {animate()}}
        ). catch((error) => reportProblem('Loading Model Failed : ( ' + error))

    //--------------------------------------------------------------------------------------------------------//
    // Set up shaders
    //--------------------------------------------------------------------------------------------------------//
  
    // Load vertex and fragment shaders
    let vertexShader = loadShader(gl, 'vertex-shader', gl.VERTEX_SHADER, 'VERTEX')
    let fragmentShader = loadShader(gl, 'fragment-shader', gl.FRAGMENT_SHADER, 'FRAGMENT')

    // Create shader program context and attach compiled shaders
    let shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    // Get attribute locations for color and position in vertex format
    let _colour = gl.getAttribLocation(shaderProgram, 'color')
    let _position = gl.getAttribLocation(shaderProgram, 'position')

    // Enable both colour and position attributes
    gl.enableVertexAttribArray(_colour)
    gl.enableVertexAttribArray(_position)

    // Enable the use of shader program
    gl.useProgram(shaderProgram)

    //--------------------------------------------------------------------------------------------------------//
    // Set up render loop
    //--------------------------------------------------------------------------------------------------------//

    // Set clear colour (RGB = 0/black, alpha = 1)
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.viewport(0.0, 0.0, canvas.width, canvas.height)

    let matProjection = Mat4x4.create()
    Mat4x4.makeProjection(matProjection, 1, 100, 0.5236, canvas.aspect)

    let matView = Mat4x4.create()
    Mat4x4.makeView(matView, [1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 5])
    // Mat4x4.lookAt(matView, [0,0,5], [0,0,0], [0,1,0]);

    let matModelViewIndex = gl.getUniformLocation( shaderProgram, 'modelViewMatrix' )
    let matProjectionIndex = gl.getUniformLocation( shaderProgram, 'projectionMatrix' )

    let theta = 0
    let model = Mat4x4.create()
    let rotation = Mat4x4.create()
    let rX = Mat4x4.create()
    let rY = Mat4x4.create()
    let rXY = Mat4x4.create()
    let rXYZ = Mat4x4.create()
    let rZ = Mat4x4.create()
    let s_half = Mat4x4.create()
    Mat4x4.makeScalingUniform(s_half, 0.1)
    let t_r = Mat4x4.create()
    let r_s = Mat4x4.create()
    let t_r_s = Mat4x4.create()
    let tX = Mat4x4.create()
  
    let view = Mat4x4.create()
    let observer = Vec3.create()

    Mat4x4.makeIdentity(model)
    Mat4x4.makeIdentity(rotation)
    Mat4x4.makeIdentity(view)
  
    // const spaceship = new Spaceship(0, 0, 1, 0.01, 0) //spawn spaceship at middle of the screen
    spawnAsteroids(1)

    const animate = function ()
    {
    // Clear viewport
        gl.clear(gl.COLOR_BUFFER_BIT)

        gl.enable(gl.DEPTH_TEST)
        gl.depthFunc(gl.LEQUAL)

        // moveSpaceship(spaceship, keys)

        theta = 0 // Increment rotation angle

        Mat4x4.makeRotationX(rX, theta)   // create rotation of X matrix
        Mat4x4.makeRotationY(rY, theta)   // create rotation of Y matrix
        Mat4x4.makeRotationZ(rZ, theta)   // create rotation of Z matrix
        Mat4x4.multiply(rXY, rX, rY)      // combine rotations on X and Y
        Mat4x4.multiply(rXYZ, rZ, rXY)    // combine rotations on XY and Z
    
        // if (dir==0) x < 1 ? x+=0.01 : dir=1;    // a simple 4 state automaton for moving the cube along a frame
        //if (dir==1) y < 1 ? y+=0.01 : dir=2;
        //if (dir==2) x > -1 ? x-=0.01 : dir=3;
        //if (dir==3) y > -1 ? y-=0.01 : dir=0;

        // Mat4x4.makeTranslation(tX, Vec3.from(spaceship.x, spaceship.y, 0))  // create translation transform
    
        for (let i = 0; i < asteroids.length; i++) {
            const asteroid = asteroids[i]
            Mat4x4.makeTranslation(tX, Vec3.from(asteroid.x, asteroid.y, 0))
        }
    
        Mat4x4.multiply(t_r, tX, rXYZ)      //combine translation with rotation
        Mat4x4.multiply(t_r_s, t_r, s_half) // combine Tx and Rxyz with scale
        Mat4x4.to(model, t_r_s)             // set a model transform for cube

        //Mat4x4.makeRotationX(model, theta);   // rotate model about x
        //Mat4x4.makeRotationY(rotation, theta);  // rotate camera about y
        //Mat4x4.multiplyPoint(observer, rotation, [0,0,5]);  // apply camera rotation
        Mat4x4.lookAt(view, [0, 0, 5], [0, 0, 0], [0, 1, 0])    // generate view matrix

        // Compose model and view matrices
        Mat4x4.multiply(matView, view, model)  // compose view and model

        // Set modelview and projection matrices
        gl.uniformMatrix4fv(matModelViewIndex, false, matView) // set view matrix in shader
        gl.uniformMatrix4fv(matProjectionIndex, false, matProjection)  // set projection matrix in shader
    
        // Bind vertex buffer

        //gl.bindBuffer(gl.ARRAY_BUFFER, asteroidGeometry.geometryVertexBuffer)

        gl.bindBuffer(gl.ARRAY_BUFFER, asteroidGeometry.geometryVertexBuffer)

        // Show how to interpret vertex format attributes
        gl.vertexAttribPointer(_position, 3, gl.FLOAT, gl.GL_FALSE, 6 * 4, 0)
        gl.vertexAttribPointer(_colour, 3, gl.FLOAT, gl.GL_FALSE, 6 * 4, 3 * 4)

        // Bind index buffer
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, asteroidGeometry.geometryIndexBuffer)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, asteroidGeometry.geometryIndexBuffer)
    
        // Draw
        gl.drawElements(gl.TRIANGLES, asteroidGeometry.indices.length, gl.UNSIGNED_SHORT, 0)
        // gl.drawElements(gl.TRIANGLES, asteroidGeometry.indices.length, gl.UNSIGNED_SHORT, 0)

        /*Mat4x4.makeRotationZ(model, theta*1.1);   // rotate model about z
    Mat4x4.multiply(matView, view, model);  // compose view and model
    gl.uniformMatrix4fv(matModelViewIndex, false, matView); // set view matrix in shader
    gl.drawElements(gl.TRIANGLES, boxGeometry.indices.length/3, gl.UNSIGNED_SHORT, 12);
    
    Mat4x4.makeRotationZ(model, theta*1.2);   // rotate model about z
    Mat4x4.multiply(matView, view, model);  // compose view and model
    gl.uniformMatrix4fv(matModelViewIndex, false, matView); // set view matrix in shader
    gl.drawElements(gl.TRIANGLES, boxGeometry.indices.length/3, gl.UNSIGNED_SHORT, 24);
    */
        gl.flush()
        window.requestAnimationFrame(animate)
    }

    let test = function () {
        let v = Vec3.from(1, 2, 3)
        let t = Vec3.from(5, -5, 10)
        let r1 = Vec3.create()
        let r2 = Vec3.create()
        let m = Mat4x4.create()
        Mat4x4.makeTranslation(m, t)
        Mat4x4.multiplyPoint(r1, m, v)
        Mat4x4.multiplyVector(r2, m, v)
        alert('R1=' + Vec3.toString(r1) + ' R2' + Vec3.toString(r2) )
    }

    //  document.addEventListener('keydown', moveSpaceship)
    // document.addEventListener('keyup', moveSpaceship);

    // Go!
    //test();
    //animate();
}
window.addEventListener('DOMContentLoaded', main)