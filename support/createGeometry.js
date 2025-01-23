
export function makeSphere (centre, radius, h, v, colour)
{
    let vertexList = [], indexList = []
    for (let i = 0; i <= v + 1; i++) {
        for (let j = 0; j <= h; j++) {
            let theta = 2 * Math.PI * j / h
            let y = (i / v - 0.5) * 2
            let r = Math.sqrt(1 - y * y)
            let x = Math.cos(theta) * r
            let z = Math.sin(theta) * r
            let point = [x, y, z]

            for (let k = 0; k < 3; k++)
            {vertexList[vertexList.length] = point[k] * radius + centre[k]}
            for (let k = 0; k < 3; k++)
            {vertexList[vertexList.length] = point[k]}
            for (let k = 0; k < 3; k++)
            {vertexList[vertexList.length] = colour[k]}

            vertexList[vertexList.length] = j / h
            vertexList[vertexList.length] = i / v
        }}

    for (let i = 0; i < v; i++) {
        for (let j = 0; j < h; j++) {
            indexList[indexList.length] = i * h + j
            indexList[indexList.length] = (i + 1) * h + (j + 1) % h
            indexList[indexList.length] = i * h + (j + 1) % h
            indexList[indexList.length] = i * h + j
            indexList[indexList.length] = (i + 1) * h + j
            indexList[indexList.length] = (i + 1) * h + (j + 1) % h
        }}

    return {
        vertex : vertexList,
        index : indexList
    }
}

// //--------------------------------------------------------------------------------------------------------//
export function makeQuad (positions, normals, colours, uvs)
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

    return {
        vertex : vertexList,
        index : indexList
    }
}

export function makeTri (positions, normals, colours, uvs)
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

    return {
        vertex : vertexList,
        index : indexList
    }
}

//--------------------------------------------------------------------------------------------------------//
// deform the sphere so they look like asteroids!
//--------------------------------------------------------------------------------------------------------//

export function deformedSphere (centre, radius, h, v, colour, deformationAmount) {
    // Initialize empty lists to store vertices and indices
    let vertexList = [],
        indexList = []

    // Iterate over vertical subdivisions
    for (let i = 0; i <= v + 1; i++) {
        // Iterate over horizontal subdivisions
        for (let j = 0; j <= h; j++) {
            // Calculate spherical coordinates
            let theta = 2 * Math.PI * j / h
            let y = (i / v - 0.5) * 2
            let r = Math.sqrt(1 - y * y)
            let x = Math.cos(theta) * r
            let z = Math.sin(theta) * r

            // Apply deformation
            let deformation = (Math.random() - 0.5) * deformationAmount
            x += deformation
            y += deformation
            z += deformation

            // Create a point with deformed coordinates
            let point = [x, y, z]

            // Add deformed vertex position
            for (let k = 0; k < 3; k++) {
                vertexList.push(point[k] * radius + centre[k])
            }

            // Add original vertex position
            for (let k = 0; k < 3; k++) {
                vertexList.push(point[k])
            }

            // Add vertex color
            for (let k = 0; k < 3; k++) {
                vertexList.push(colour[k])
            }

            // Add texture coordinates
            vertexList.push(j / h)
            vertexList.push(i / v)
        }
    }

    // Generate indices for triangles
    for (let i = 0; i < v; i++) {
        for (let j = 0; j < h; j++) {
            indexList.push(i * h + j)
            indexList.push((i + 1) * h + (j + 1) % h)
            indexList.push(i * h + (j + 1) % h)
            indexList.push(i * h + j)
            indexList.push((i + 1) * h + j)
            indexList.push((i + 1) * h + (j + 1) % h)
        }
    }

    // Return the generated vertex and index data
    return {
        vertex: vertexList,
        index: indexList
    }
}
