import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Loader
 */
const loader = new THREE.TextureLoader()

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Objects
 */
// Ground plane
{
    const planeSize = 40
    const texture = loader.load("/checkerboard.png")
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.magFilter = THREE.NearestFilter
    const repeats = planeSize / 2
    texture.repeat.set(repeats, repeats)

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize)
    const planeMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    })
    planeMat.color.setRGB(1.5, 1.5, 1.5)
    const mesh = new THREE.Mesh(planeGeo, planeMat)
    mesh.rotation.x = Math.PI * -.5
    scene.add(mesh)
}

// Sphere w/shadows
const shadowTexture = loader.load("/roundshadow.png")
const sphereShadowBase = []
{
    const sphereRadius = 1
    const sphereWidthDivisions = 32
    const sphereHeightDivisions = 16
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions)

    // Shadow plane geo
    const planeSize = 1
    const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize)

    const numSpheres = 6
    for (let i = 0; i < numSpheres; i++) {
        const base = new THREE.Object3D()
        scene.add(base)

        const shadowMat = new THREE.MeshBasicMaterial({
            map: shadowTexture,
            transparent: true,
            depthWrite: false,
        })
        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
        shadowMesh.position.y = 0.001
        shadowMesh.rotation.x = Math.PI * -.5
        const shadowSize = sphereRadius * 4
        shadowMesh.scale.set(shadowSize, shadowSize, shadowSize)
        base.add(shadowMesh)
    }
}

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Lighting
 */
{
    scene.add(new THREE.DirectionalLight(0xccc, 1))
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()