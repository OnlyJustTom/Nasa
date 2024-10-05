// Import Three.js and the required examples correctly
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Correct path
import { degToRad } from 'three/src/math/MathUtils.js';

// Create the scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100000);

const skyboxGeomtry = new THREE.SphereGeometry(5000,60,40);
skyboxGeomtry.scale(-1,-1,-1);

const skyboxTexture = new THREE.TextureLoader().load("Stars.jpg");
skyboxTexture.colorSpace = THREE.SRGBColorSpace;
const skyboxMaterial = new THREE.MeshBasicMaterial({map: skyboxTexture});

const skyboxMesh = new THREE.Mesh(skyboxGeomtry, skyboxMaterial);

scene.add(skyboxMesh);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight); // Subtract the width of the info panel
document.body.appendChild(renderer.domElement);
renderer.setAnimationLoop(animate); // Used for WebXR or animations

// Define scaling factors
const sizeScalingFactor = 100000; // Scaling factor for sizes
const distanceScalingFactor = 10000000; // Scaling factor for distances

// Planet and sun setup
const sun = createPlanet(0xffd100, (348215 / sizeScalingFactor), 0, 0, 0);
const sunTag = createTextTag("The Sun", sun.position);


const planets = [
    { name: 'Mercury', color: 0xff0000, radius: 2439.5, distance: (57900000 / distanceScalingFactor), speed: 0.474, description: 'Mercury is the closest planet to the Sun.' },
    { name: 'Venus', color: 0xff8700, radius: 6052, distance: (108200000 / distanceScalingFactor), speed: 0.035, description: 'Venus is the hottest planet in the solar system.' },
    { name: 'Earth', color: 0x0000ff, radius: 6378, distance: (149600000 / distanceScalingFactor), speed: 0.017, description: 'Earth is the third planet from the Sun and our home.' },
    { name: 'Mars', color: 0xDD5639, radius: 3398, distance: (227900000 / distanceScalingFactor), speed: 0.009, description: 'Mars is known as the Red Planet.' },
    { name: 'Jupiter', color: 0xFFA500, radius: 69911, distance: (778500000 / distanceScalingFactor), speed: 0.007, description: 'Jupiter is the largest planet in the solar system.' },
    { name: 'Saturn', color: 0xC0C0C0, radius: 58232, distance: (1427000000 / distanceScalingFactor), speed: 0.003, description: 'Saturn is known for its beautiful ring system.' },
    { name: 'Uranus', color: 0xADD8E6, radius: 25362, distance: (2871000000 / distanceScalingFactor), speed: 0.002, description: 'Uranus orbits the Sun on its side.' },
    { name: 'Neptune', color: 0x000080, radius: 24622, distance: (4495000000 / distanceScalingFactor), speed: 0.0015, description: 'Neptune is the farthest planet from the Sun.' }
];

// Create planets and add text tags and orbits
planets.forEach((planetData) => {
    const planetMesh = createPlanet(planetData.color, (planetData.radius / sizeScalingFactor), planetData.distance, 0, 0);
    planetMesh.name = planetData.name; // Set the name to the planet name for identification
    planetData.textTag = createTextTag(planetData.name, planetMesh.position); // Store reference to text tag
    
    // Create orbit line for the planet
    const orbitLine = createOrbitLine(planetData.distance);
    scene.add(orbitLine);
});

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

camera.position.z = 100; // Move camera a bit further back

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate function
function animate() {
    controls.update(); // Update controls on each frame
    
    const time = Date.now() * 0.001;
    planets.forEach((planetData) => {
        const mesh = scene.children.find(child => child.name === planetData.name);
        
        if (mesh) { // Ensure mesh is found before accessing its position
            // Calculate new x and z positions based on time, radius, and speed
            mesh.position.x = planetData.distance * Math.cos(time * planetData.speed);
            mesh.position.z = planetData.distance * Math.sin(time * planetData.speed);

            // Update the text tag position to follow the planet
            if (planetData.textTag) {
                planetData.textTag.position.copy(mesh.position);
            }
        }
    });
    renderer.render(scene, camera); // Render the scene with the camera
}

function createPlanet(colour, size, x, y, z) {
    const SphereGeometry = new THREE.SphereGeometry(size);
    const SphereMaterial = new THREE.MeshBasicMaterial({
        color: colour,
        roughness: 0.5,
        metalness: 0.5
    });

    let planet = new THREE.Mesh(SphereGeometry, SphereMaterial);
    planet.position.set(x, y, z);
    planet.castShadow = true;

    scene.add(planet);
    
    return planet;
}

function createTextTag(text, position) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '48px Roboto';
    context.fillStyle = 'white';
    context.fillText(text, 10, 50);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.position.y += 5; // Raise the text a bit above the planet
    sprite.scale.set(5, 2.5, 1); // Adjust size of the text

    scene.add(sprite);
    
    return sprite; // Return the sprite for later use
}

// Function to create orbit lines (circular for simplicity)
function createOrbitLine(distance) {
    const curve = new THREE.EllipseCurve(
        0, 0,                // x and y center
        distance, distance,   // xRadius and yRadius (same for circular orbit)
        0, 2 * Math.PI,       // Start angle and end angle (full circle)
        false,                // Clockwise?
        0                    // Rotation angle (none)
    );
    const points = curve.getPoints(100); // Create points along the curve
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({ color: 0xffffff }); // Orbit color (white)
    
    const orbitLine = new THREE.Line(geometry, material);
    orbitLine.rotation.x = Math.PI / 2; // Rotate to make it horizontal
    
    return orbitLine;
}


