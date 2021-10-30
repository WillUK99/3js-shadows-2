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

window.addEventListener('resize', () => {
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
camera.position.y = 6
camera.position.z = -10
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Objects
 */
// Ground plane
{
    const planeSize = 20
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
const sphereShadowBases = []
{
    const sphereRadius = .75
    const sphereWidthDivisions = 32
    const sphereHeightDivisions = 16
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions)

    // Shadow plane geo
    const planeSize = 1
    const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize)

    const numSpheres = 10
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

        const u = i / numSpheres
        console.log(u)
        const sphereMat = new THREE.MeshStandardMaterial()
        const normalMap = loader.load("/5689d0a9cef193cefd363cf7c23e3dac.png")
        sphereMat.normalMap = normalMap
        sphereMat.roughness = .1
        sphereMat.metalness = .4
        sphereMat.color.setHSL(u, 1, .75)
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat)
        sphereMesh.position.set(0, sphereRadius + 2, 0)
        base.add(sphereMesh)

        sphereShadowBases.push({ base, sphereMesh, shadowMesh, y: sphereMesh.position.y })
    }
}
console.log(sphereShadowBases[0].sphereMesh)

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
// Hemi Light
{
    const skyColor = 0xB1E1FF;
    const groundColor = 0x8c8c8c;
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
}

// Dir Light
{
    const color = 0xFFFFFF;
    const intensity = .5;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 5);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
}
/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    sphereShadowBases.forEach((sphereShadowBase, ndx) => {
        const { base, sphereMesh, shadowMesh, y } = sphereShadowBase

        const u = ndx / sphereShadowBases.length;

        const speed = elapsedTime * 0.2
        const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1)
        const radius = Math.sin(speed - ndx) * 10
        // console.log(radius)
        base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)

        const yOff = Math.abs(Math.sin(elapsedTime * 2 + ndx)) * 1.1

        sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff)
        shadowMesh.material.opacity = THREE.MathUtils.lerp(1, .1, yOff)
        sphereMesh.material.color.setHSL(angle, .75, .5)
        sphereMesh.rotation.x = yOff / 2 
        // sphereMesh.rotation.z += yOff / 10
        sphereMesh.rotation.y = yOff / 1.2
    })

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}


tick()