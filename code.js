// Import Three.js and the required examples correctly
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Correct path

// Create the scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate); // Used for WebXR or animations
document.body.appendChild(renderer.domElement);

// Bottom Plane
const Plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10000, 10000), // Set width and height (not 100x1 for a proper plane)
    new THREE.MeshStandardMaterial({ color: 0xa6a6a6, emissive: 0xa6a6a6 }) // Correct material
);

// Rotate the plane to make it horizontal (facing up)
Plane.rotation.x = -Math.PI / 2; // Rotate by 90 degrees to lie flat
Plane.position.y = -100; // Lower the plane slightly
//scene.add(Plane);

// Define scaling factors
const sizeScalingFactor = 100000; // Scaling factor for sizes
const distanceScalingFactor = 10000000; // Scaling factor for distances

// Planet and sun setup
const sun = createPlanet(0xffd100, (348215 / sizeScalingFactor), 0, 0, 0);

const planets = [
    { name: 'Mercury', color: 0xff0000, radius: 2439.5, distance: (57900000 / distanceScalingFactor), speed: 0.474 },
    { name: 'Venus', color: 0xff8700, radius: 6052, distance: (108200000 / distanceScalingFactor), speed: 0.035 },
    { name: 'Earth', color: 0x0000ff, radius: 6378, distance: (149600000 / distanceScalingFactor), speed: 0.017 },
    { name: 'Mars', color: 0xDD5639, radius: 3398, distance: (227900000 / distanceScalingFactor), speed: 0.009 },
    { name: 'Jupiter', color: 0xFFA500, radius: 69911, distance: (778500000 / distanceScalingFactor), speed: 0.007 },
    { name: 'Saturn', color: 0xC0C0C0, radius: 58232, distance: (1427000000 / distanceScalingFactor), speed: 0.003 },
    { name: 'Uranus', color: 0xADD8E6, radius: 25362, distance: (2871000000 / distanceScalingFactor), speed: 0.002 },
    { name: 'Neptune', color: 0x000080, radius: 24622, distance: (4495000000 / distanceScalingFactor), speed: 0.0015 }
];

// Create planets and add text tags
planets.forEach((planetData) => {
    const planetMesh = createPlanet(planetData.color, (planetData.radius / sizeScalingFactor), planetData.distance, 0, 0);
    planetMesh.name = planetData.name; // Set the name to the planet name for identification
    planetData.textTag = createTextTag(planetData.name, planetMesh.position); // Store reference to text tag
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
                planetData.textTag.position.y += 0; // Raise the text a bit above the planet
                planetData.textTag.position.x += 1.25
                //planetData.textTag.scale.set(planetData.textTag.scale * camera.position.z)
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
    context.font = '48px Arial';
    context.fillStyle = 'white';
    context.fillText(text, 0, 50);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.position.y += 10; // Raise the text a bit above the planet
    sprite.scale.set(5, 2.5, 1); // Adjust size of the text

    scene.add(sprite);
    
    return sprite; // Return the sprite for later use
}
