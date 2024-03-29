import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js'
import openSimplexNoise from 'https://cdn.skypack.dev/open-simplex-noise';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

//#region Planet class creation
export default class Planet {
    constructor(radius, positionX, positionY, textureFile) {
        this.radius = radius;
        this.positionX = positionX;
        this.positionY = positionY;
        this.textureFile = textureFile;

    }

    getMesh() {
        if (this.mesh === undefined || this.mesh === null) {
            const geometry = new THREE.SphereGeometry(this.radius);
            const texture = new THREE.TextureLoader().load(this.textureFile);
            const material = new THREE.MeshBasicMaterial({ transparent: true, map: texture });
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.x += this.positionX;
            this.mesh.position.y += this.positionY;
        }
        return this.mesh;
    }
}
//#endregion

//#region Creating a scene and a camera

// Create a scene
const scene = new THREE.Scene();
// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 15);

//#endregion

//#region Creating the "Art of Life" text

//Load the font
const fontloader = new FontLoader();
fontloader.load('./src/fonts/ethno.json', (hetigon) => {
    const geo = new TextGeometry('Art of Life', {
        font: hetigon,
        size: 1,
        height: 2,
    })
    const textMesh = new THREE.Mesh(geo, [
        new THREE.MeshPhongMaterial({ color: 0x5E1986 }), //front
        new THREE.MeshPhongMaterial({ color: 0x441062 }), //side
    ])

    textMesh.position.set(-6, 0, 0)
    scene.add(textMesh)
    //#endregion

    //#region Adding the lights


    const light = new THREE.SpotLight(0xffffff, 5, 0, Math.PI / 2, 1, 0.01);
    // Set the position of the light
    light.position.set(0, 0, 20);
    light.target = textMesh;
    scene.add(light);


    const light2 = new THREE.SpotLight(0xffffff, 5, 0, Math.PI / 2, 1, 0.01);
    // Set the position of the light
    light2.position.set(0, 0, -20);
    light2.target = textMesh;
    scene.add(light2);
})

//#endregion

//#region Creating the two "particles" spheres

//Creating the bigger sphere
const particlesGeometry = new THREE.SphereGeometry(20, 60, 60);
// Material
const particlesMaterial = new THREE.PointsMaterial();
particlesMaterial.size = 0.002;
particlesMaterial.sizeAttenuation = true;
// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);


//Creating the smaller sphere
const particlesGeometry2 = new THREE.SphereGeometry(6.5, 60, 60);
// Material
const particlesMaterial2 = new THREE.PointsMaterial();
particlesMaterial2.size = 0.002;
particlesMaterial2.sizeAttenuation = true;
// Points
const particles2 = new THREE.Points(particlesGeometry2, particlesMaterial2);
scene.add(particles2);
//#endregion

//#region Creating the 4 spinning "planets"

const solarSystem = new THREE.Group();

const planet1 = new Planet(1, -7.41, 0, './src/assets/purple_planet.jpg');
const planet1Mesh = planet1.getMesh();
let planet1System = new THREE.Group();
planet1System.add(planet1Mesh);


const planet2 = new Planet(1, 0, -7.41, './src/assets/purple_planet2.jpg');
const planet2Mesh = planet2.getMesh();
let planet2System = new THREE.Group();
planet2System.add(planet2Mesh);

const planet3 = new Planet(1, 7.41, 0, './src/assets/purple_planet3.png');
const planet3Mesh = planet3.getMesh();
let planet3System = new THREE.Group();
planet3System.add(planet3Mesh);

const planet4 = new Planet(1, 0, 7.41, './src/assets/purple_planet4.jpg');
const planet4Mesh = planet4.getMesh();
let planet4System = new THREE.Group();
planet4System.add(planet4Mesh);

solarSystem.add(planet1System, planet2System, planet3System, planet4System);

scene.add(solarSystem);

//#endregion



//#region Import the canvas + resize 

// Import the canvas element
const canvas = document.getElementById('canvas');

// Create a WebGLRenderer and set its width and height
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);


// Handle the window resize event
window.addEventListener('resize', () => {
    // Update the camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update the renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.render(scene, camera);

});


//#endregion

//#region Creating the middle animated sphere

let sphereGeometry = new THREE.SphereGeometry(4, 50, 50);
sphereGeometry.positionData = [];
let v3 = new THREE.Vector3();
for (let i = 0; i < sphereGeometry.attributes.position.count; i++) {
    v3.fromBufferAttribute(sphereGeometry.attributes.position, i);
    sphereGeometry.positionData.push(v3.clone());
}
const sphereMesh = new THREE.PointsMaterial();
sphereMesh.size = 0.002;
sphereMesh.sizeAttenuation = true;

let sphere = new THREE.Points(sphereGeometry, sphereMesh);
scene.add(sphere);


let noise = openSimplexNoise.makeNoise4D(Date.now());
let clock = new THREE.Clock();

window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight)
    renderer.render(scene, camera);


});

// renderer.setAnimationLoop(() => {
//     let t = clock.getElapsedTime() / 1.;
//     sphereGeometry.positionData.forEach((p, idx) => {
//         let setNoise = noise(p.x, p.y, p.z, t * 1.05);
//         v3.copy(p).addScaledVector(p, setNoise);
//         sphereGeometry.attributes.position.setXYZ(idx, v3.x, v3.y, v3.z);
//     })
//     sphereGeometry.computeVertexNormals();
//     sphereGeometry.attributes.position.needsUpdate = true;


//     renderer.render(scene, camera);
// })
//#endregion

//#region Creating the Raycaster

const raycaster = new THREE.Raycaster();
let pointerPosition = { x: 0, y: 0 };
window.addEventListener('pointermove', (event) => {
    pointerPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerPosition.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

//#endregion

// Step 1: Add an HTML element for displaying text
const infoText = document.createElement('div');
infoText.style.position = 'absolute';
infoText.style.bottom = '10px';
infoText.style.left = '10px';
infoText.style.color = 'white';
infoText.style.fontFamily = 'Arial';
infoText.style.fontSize = '16px';
document.body.appendChild(infoText);

// Step 2: Create a function to update the displayed text
function updateInfoText(message) {
    infoText.innerText = message;
}

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.3, // strength
    1, // radius
    0.1 // threshold
);
const outputPass = new OutputPass();

composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(outputPass);
//#region Create the animation loop
const animate = () => {
    // Call animate recursively
    requestAnimationFrame(animate);

    //#region Rotation of the Spheres and Planets

    particles.rotation.x += 0.0025;
    particles.rotation.y += 0.007;
    particles.rotation.z += 0.005;
    particles2.rotation.x += 0.0025;
    particles2.rotation.y += 0.007;
    particles2.rotation.z += 0.005;

    planet1System.rotation.x += 0.0025;
    planet1System.rotation.y += 0.007;
    planet1System.rotation.z += 0.005;
    planet2System.rotation.x += 0.0025;
    planet2System.rotation.y += 0.007;
    planet2System.rotation.z += 0.005;
    planet3System.rotation.x += 0.0025;
    planet3System.rotation.y += 0.007;
    planet3System.rotation.z += 0.005;
    planet4System.rotation.x += 0.0025;
    planet4System.rotation.y += 0.007;
    planet4System.rotation.z += 0.005;
    //#endregion


    //#region Raycaster events
    raycaster.setFromCamera(pointerPosition, camera);
    const planet1_intersects = raycaster.intersectObject(planet1System);
    const planet2_intersects = raycaster.intersectObject(planet2System);
    const planet3_intersects = raycaster.intersectObject(planet3System);
    const planet4_intersects = raycaster.intersectObject(planet4System);

    if (planet1_intersects.length > 0 || planet2_intersects.length > 0 || planet3_intersects.length > 0 || planet4_intersects.length > 0) {
        particles.rotation.x -= 0.0025;
        particles.rotation.y -= 0.007;
        particles.rotation.z -= 0.005;
        particles2.rotation.x -= 0.0025;
        particles2.rotation.y -= 0.007;
        particles2.rotation.z -= 0.005;

        planet1System.rotation.x -= 0.0025;
        planet1System.rotation.y -= 0.007;
        planet1System.rotation.z -= 0.005;
        planet2System.rotation.x -= 0.0025;
        planet2System.rotation.y -= 0.007;
        planet2System.rotation.z -= 0.005;
        planet3System.rotation.x -= 0.0025;
        planet3System.rotation.y -= 0.007;
        planet3System.rotation.z -= 0.005;
        planet4System.rotation.x -= 0.0025;
        planet4System.rotation.y -= 0.007;
        planet4System.rotation.z -= 0.005;

        if (planet1_intersects.length > 0) {
            planet1Mesh.material.opacity = 0.5;

            updateInfoText('The Art of Life is an innovative artistic project that aims to enhance the\ninteractivity in immersive art installations. By putting the human at the center of a generative artistic performance, \nthe Art of Life bring a platform for the users to both listen and vizualise themselves.\nThis can be used for relaxation purposes or just as an artistic experience.');

        }
        if (planet2_intersects.length > 0 && planet1_intersects.length <= 0) {
            planet2Mesh.material.opacity = 0.5;
            updateInfoText('By putting multiple biometrical sensors on its users, the installation can analyze their physiological state.\nThe sensors used in this project are an Electrocardiograph, monitoring the heart rate, \nan Electrodermal activity sensor, monotoring the electrical properties of the skin, \nand a breathing sensor monitoring the breathing rate of its users.')

        }
        if (planet3_intersects.length > 0 && planet1_intersects.length <= 0 && planet2_intersects.length <= 0) {
            planet3Mesh.material.opacity = 0.5;
            updateInfoText('The users raw data is processed to make it readable by the different softwares used to convert the said data.\nReceived as arrays of value, the processing outputs simple values, such as the beating per minute or breaths per minute.')
        }
        if (planet4_intersects.length > 0 && planet1_intersects.length <= 0 && planet2_intersects.length <= 0 && planet3_intersects.length <= 0) {
            planet4Mesh.material.opacity = 0.5;
            updateInfoText('The processed data is finally sent to different softwares, such as FL Studio for the sonification or MadMapper for the video-mapping of the data.\nThe mapping is projected on a 3D Sculpture placed on a wall in front of the users, showing visuals that reflects the physiological signals received.\nWhile the visuals are shown, music is generated in an headset for the users to listen to, giving a melody to their own body.')
        }
    }
    else {
        planet1Mesh.material.opacity = 1;
        planet2Mesh.material.opacity = 1;
        planet3Mesh.material.opacity = 1;
        planet4Mesh.material.opacity = 1;
        updateInfoText('');
    }


    //#endregion
    let t = clock.getElapsedTime() / 1.;
    sphereGeometry.positionData.forEach((p, idx) => {
        let setNoise = noise(p.x, p.y, p.z, t * 1.05);
        v3.copy(p).addScaledVector(p, setNoise);
        sphereGeometry.attributes.position.setXYZ(idx, v3.x, v3.y, v3.z);
    })
    sphereGeometry.computeVertexNormals();
    sphereGeometry.attributes.position.needsUpdate = true;


    // composer.render()
    renderer.render(scene, camera)

}

// Call animate for the first time
animate();

//#endregion