import { matrixHelper } from './matrix.js'
//--------------------------------------------------------------------------------------------------------//
//  Scene Element
//--------------------------------------------------------------------------------------------------------//
export function Node (_name)
{
    this.type = 0
    this.name = _name
    this.parent = null
    this.children = []
    this.nodeObject = null

    // Create transform for node (= I)
    this.transform = matrixHelper.matrix4.create()
    matrixHelper.matrix4.makeIdentity(this.transform)

    this.animationCallback = null
}

Node.NODE_TYPE = {
    GROUP_ROOT : 0,
    GROUP : 1,
    LIGHT : 2,
    MODEL : 3
}

Node.prototype.draw = function (scene, parentTransform)
{
    let compositeTransform = matrixHelper.matrix4.create()
    matrixHelper.matrix4.multiply(compositeTransform, this.transform, parentTransform)

    if (this.type == Node.NODE_TYPE.MODEL)
    {
        if (this.nodeObject) {
            this.nodeObject.draw(scene, compositeTransform)
        }
    }
	
    let _type = this.type
    let _nodeObject = this.nodeObject

    this.children.forEach(function (childNode) {
        if (_type == Node.NODE_TYPE.LIGHT)
        {
            // Transform light before setting it
            if (_nodeObject) {
                _nodeObject.useTransformed(scene.gl, compositeTransform)
            }
        }

        childNode.draw(scene, compositeTransform)
    })
}

Node.prototype.animate = function (deltaTime)
{
    if (this.animationCallback)
    {this.animationCallback(deltaTime)}

    this.children.forEach(function (childNode) {
        childNode.animate(deltaTime)
    })
}

Node.prototype.print = function (deltaTime)
{
    console.log('Type: ' + this.type + ' parent: '  + this.parent + ' name: ' + this.name + ' children length: ' + this.children.length)

    this.children.forEach(function (childNode) {
        console.log('Child node :: ' + childNode.name)
        childNode.print(deltaTime)
    })
}

//--------------------------------------------------------------------------------------------------------//
//  Scene Graph
//--------------------------------------------------------------------------------------------------------//
export function Scene ()
{
    this.gl = null
    this.canvas = null
    this.root = new Node('ROOT')

    this.indexColour = 0
    this.indexNormal = 0
    this.indexPosition = 0
    this.indexTexCoords = 0

    this.indexMatrixView = 0
    this.indexMatrixModel = 0
    this.indexMatrixProjection = 0

    this.matrixView = matrixHelper.matrix4.create()
    this.matrixModel = matrixHelper.matrix4.create()
    this.matrixProjection = matrixHelper.matrix4.create()

    this.shaderVertex = null
    this.shaderFragment = null

    this.shaderProgram = null

    this.lastUpdate = Date.now()
}

//--------------------------------------------------------------------------------------------------------//
//  Helpers
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.loadShader = function (shaderName, shaderType, shaderTypeString)
{
    try
    {
        let source = document.getElementById(shaderName).text
        let shader = this.gl.createShader(shaderType)
        this.gl.shaderSource(shader, source)
        this.gl.compileShader(shader)

        if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS))
        {return shader}

        alert('Error compiling shader \'' + shaderName + '\', ' + this.gl.getShaderInfoLog(shader))
        return false
    }

    catch (e)
    {
        alert('Exception : Cannot load shader \'' + shaderName + '\'!')
    }
}

//--------------------------------------------------------------------------------------------------------//
//  Scene Initialisation
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.initialiseShaders = function ()
{
    // Load vertex and fragment shaders
    this.shaderVertex = this.loadShader('vertex-shader', this.gl.VERTEX_SHADER, 'VERTEX')
    this.shaderFragment = this.loadShader('fragment-shader', this.gl.FRAGMENT_SHADER, 'FRAGMENT')

    // Create shader program context and attach compiled shaders
    this.shaderProgram = this.gl.createProgram()
    this.gl.attachShader(this.shaderProgram, this.shaderVertex)
    this.gl.attachShader(this.shaderProgram, this.shaderFragment)
    this.gl.linkProgram(this.shaderProgram)

    // Get attribute locations for color, normal, position and texture coordinates in vertex format
    this.indexColour = this.gl.getAttribLocation(this.shaderProgram, 'color')
    this.indexNormal = this.gl.getAttribLocation(this.shaderProgram, 'normal')
    this.indexPosition = this.gl.getAttribLocation(this.shaderProgram, 'position')
    this.indexTexCoords = this.gl.getAttribLocation(this.shaderProgram, 'texcoords')

    // Enable attributes
    this.gl.enableVertexAttribArray(this.indexColour)
    this.gl.enableVertexAttribArray(this.indexNormal)
    this.gl.enableVertexAttribArray(this.indexPosition)
    this.gl.enableVertexAttribArray(this.indexTexCoords)

    // Enable the use of shader program
    this.gl.useProgram(this.shaderProgram)
}

Scene.prototype.initialiseMatrices = function ()
{
    this.indexMatrixView = this.gl.getUniformLocation( this.shaderProgram, 'viewMatrix' )
    this.indexMatrixModel = this.gl.getUniformLocation( this.shaderProgram, 'modelMatrix' )
    this.indexMatrixProjection = this.gl.getUniformLocation( this.shaderProgram, 'projectionMatrix' )

    matrixHelper.matrix4.makeIdentity(this.matrixView)
    matrixHelper.matrix4.makeIdentity(this.matrixModel)
    matrixHelper.matrix4.makeIdentity(this.matrixProjection)
}

Scene.prototype.initialiseFlags = function ()
{
    this.gl.clearColor(0.1, 0.2, 0.8, 1.0)
    this.gl.viewport(0.0, 0.0, this.canvas.width, this.canvas.height)

    this.gl.disable(this.gl.DEPTH_TEST)
    // this.gl.depthFunc(this.gl.LESS)
    this.gl.enable(this.gl.BLEND)  //Enable blending using src_alpha channel in texture image
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
}

Scene.prototype.initialise = function (gl, canvas)
{
    this.gl = gl
    this.canvas = canvas

    this.initialiseShaders()
    this.initialiseMatrices()
    this.initialiseFlags()
}

//--------------------------------------------------------------------------------------------------------//
//  Bind model prior to rendering
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.bindModelData = function (vertexBuffer, indexBuffer)
{
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer)

    // Show how to interpret vertex format attributes
    this.gl.vertexAttribPointer(this.indexPosition, 3, this.gl.FLOAT, this.gl.GL_FALSE, 11 * 4, 0)
    this.gl.vertexAttribPointer(this.indexNormal, 3, this.gl.FLOAT, this.gl.GL_FALSE, 11 * 4, 3 * 4)
    this.gl.vertexAttribPointer(this.indexColour, 3, this.gl.FLOAT, this.gl.GL_FALSE, 11 * 4, 6 * 4)
    this.gl.vertexAttribPointer(this.indexTexCoords, 2, this.gl.FLOAT, this.gl.GL_FALSE, 11 * 4, 9 * 4)

    // Bind index buffer
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
}

//--------------------------------------------------------------------------------------------------------//
//  Scene Graph transform management
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.updateView = function () {
    this.gl.uniformMatrix4fv(this.indexMatrixView, false, this.matrixView)
}

Scene.prototype.updateProjection = function () {
    this.gl.uniformMatrix4fv(this.indexMatrixProjection, false, this.matrixProjection)
}

Scene.prototype.updateModel = function () {
    this.gl.uniformMatrix4fv(this.indexMatrixModel, false, this.matrixModel)
}

Scene.prototype.setViewFrustum = function (near, far, fov)
{
    matrixHelper.matrix4.makeProjection(this.matrixProjection, near, far, fov, this.canvas.aspect)
}

Scene.prototype.lookAt = function (position, target, up)
{
    matrixHelper.matrix4.lookAt(this.matrixView, position, target, up)
}

Scene.prototype.setModel = function (model)
{
    matrixHelper.matrix4.to(this.matrixModel, model)
}

//--------------------------------------------------------------------------------------------------------//
//  Scene Graph node managment
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.findNode = function (nodeName)
{
    let stack = [this.root]
    console.log('Searching for ' + nodeName)

    while (stack.length != 0) {
        let node = stack.pop()
		
        if (node.name.localeCompare(nodeName) == 0)
        {return node}

        node.children.forEach(function (childNode) {
            stack.push(childNode)
        })
    }
}

Scene.prototype.addNode = function (parent, nodeObject, nodeName, nodeType)
{
    let node = new Node()

    node.parent = parent
    node.name = nodeName
    node.type = nodeType
    node.nodeObject = nodeObject

    parent.children[parent.children.length] = node

    console.log('Added new node ' + node.name + ' to SceneGraph at parent ' + node.parent.name + ' Parent children count = ' + node.parent.children.length)
    return node
}

Scene.prototype.removeNode = function (nodeName) {
    console.log('Removing node ' + nodeName)
    let nodeToRemove = this.findNode(nodeName)

    if (!nodeToRemove) {
        console.error(`Node with name ${nodeName} not found in scene graph`)
        return
    }

    // Remove node from parent's children list
    if (nodeToRemove.parent) {
        // use console logs to track the changes regarding the scene graph
        console.log('Index of node to remove : ' + nodeToRemove.parent.children.indexOf(nodeToRemove))
        console.log('Parent Node Name = ' + nodeToRemove.parent.name + ' (BEFORE) Children Count = ' + nodeToRemove.parent.children.length)
        nodeToRemove.parent.children.splice(nodeToRemove.parent.children.indexOf(nodeToRemove), 1)
        console.log('Parent Node Name = ' + nodeToRemove.parent.name + ' (AFTER) Children Count = ' + nodeToRemove.parent.children.length)
    } else { console.log('NO PARENT NODE') }

    // Delete node reference - this is probably enough for the garbage collector to clean up
    nodeToRemove = null
}

//--------------------------------------------------------------------------------------------------------//
//  Animation and Rendering scene graph methods
//--------------------------------------------------------------------------------------------------------//
Scene.prototype.beginFrame = function ()
{
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)

    this.updateProjection()
    this.updateView()
}

Scene.prototype.endFrame = function () {
    this.gl.flush()
}

Scene.prototype.animate = function ()
{
    let now = Date.now()
    let deltaTime = now - this.lastUpdate
    this.lastUpdate = now

    this.root.animate(deltaTime)
}

Scene.prototype.draw = function () {
    this.root.draw(this, matrixHelper.matrix4.identity)
}

Scene.prototype.print = function () {
    this.root.print(0)
}