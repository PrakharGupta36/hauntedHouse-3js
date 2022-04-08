import "./style.css";
import * as three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import grass from "./textures/grass.jpg";
import bricks from "./textures/bricks2.jpg";
import wood from "./textures/wood.jpg";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import door from "./textures/door2.jpg";
import gravel from "./textures/gravel.jpg";

const scene = new three.Scene();

const texture = new three.TextureLoader();
const grassTexture = texture.load(grass);
const bricksTexture = texture.load(bricks);
const woodTexture = texture.load(wood);
const doorTexture = texture.load(door);

grassTexture.wrapS = three.RepeatWrapping;
grassTexture.wrapT = three.RepeatWrapping;
grassTexture.repeat.set(100, 100);

// fog
const fog = new three.Fog("#000000", 1, 15);
scene.fog = fog;

// house
const house = new three.Group();
scene.add(house);

const houseMaterial = new three.MeshPhysicalMaterial({ map: bricksTexture });

const houseCube = new three.Mesh(
  new three.BoxGeometry(2, 1.25, 2),
  houseMaterial
);

const roofMaterial = new three.MeshPhongMaterial({ map: woodTexture });

const houseRoof = new three.Mesh(
  new three.ConeBufferGeometry(1.5, 0.5, 4),
  roofMaterial
);

const doorMaterial = new three.MeshPhongMaterial({ map: doorTexture });

const houseDoor = new three.Mesh(new three.PlaneGeometry(0.5, 1), doorMaterial);

// plane

const planeMaterial = new three.MeshPhongMaterial({ map: grassTexture });

const plane = new three.Mesh(new three.PlaneGeometry(100, 100), planeMaterial);

houseCube.castShadow = true;
plane.receiveShadow = true;
plane.castShadow = false;
// positioning elements

houseDoor.position.x = 1;
houseDoor.rotation.y = Math.PI / 2;
houseDoor.position.x = 1.001;

plane.rotation.x = -Math.PI / 2;
plane.position.y = -0.5;

houseCube.position.y = plane.position.y + 0.5;

houseRoof.position.y = 0.85;
houseRoof.rotation.y = Math.PI / 4;

const zGrass = [0.3, -0.3];
for (let i = 0; i < 2; i++) {
  const loader = new GLTFLoader();
  loader.load(
    "model/grass/scene.gltf",
    function (gltf) {
      scene.add(gltf.scene);
      gltf.scene.position.set(
        houseDoor.position.x + 0.2,
        -0.5,
        houseDoor.position.z + zGrass[i]
      );
      gltf.scene.scale.set(0.009, 0.009, 0.009);
    },
    undefined,
    function (error) {
      console.error(error);
    }
  );
}

// graves
const graveTexture = texture.load(gravel);

const gravesGeometry = new three.BoxBufferGeometry(0.6, 0.8, 0.2);
const graveMaterial = new three.MeshPhysicalMaterial({ map: graveTexture });

graveTexture.wrapS = three.RepeatWrapping;
graveTexture.wrapT = three.RepeatWrapping;
graveTexture.repeat.set(100, 100);

for (let i = 0; i < 25; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 6;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  const grave = new three.Mesh(gravesGeometry, graveMaterial);
  grave.position.set(x, -0.25, z);
  grave.castShadow = true;
  grave.receiveShadow = false;
  grave.rotation.y = (Math.random() - 0.5) * 0.4;
  grave.rotation.z = (Math.random() - 0.5) * 0.4;
  scene.add(grave);
}

// scene and adding elements to the house group
house.add(houseCube, houseRoof, houseDoor);

scene.add(plane);

plane.receiveShadow = true;

const sizes = { width: window.innerWidth, height: window.innerHeight };

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
});

const canvas = document.getElementById("canvas");
const renderer = new three.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = three.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor("#000000");
renderer.setAnimationLoop(animation);

const camera = new three.PerspectiveCamera(
  70,
  sizes.width / sizes.height,
  0.01,
  10000
);
camera.position.z = 5;
camera.position.x = 3;
camera.position.y = 1;

// lighting

const pointLightDoor = new three.PointLight(0x5f4f24, 1.5);

pointLightDoor.position.set(
  houseDoor.position.x + 1,
  houseDoor.position.y + 1,
  houseDoor.position.z
);

pointLightDoor.castShadow = true;
pointLightDoor.shadow.mapSize.width = 1024;
pointLightDoor.shadow.mapSize.height = 1024;

const ghostLight1 = new three.PointLight(0xff00ff, 2, 3);
const ghostLight2 = new three.PointLight(0x00ffff, 1, 3);
const ghostLight3 = new three.PointLight(0xffff00, 0.5, 3);

const ghostLights = [ghostLight1, ghostLight2, ghostLight3];

ghostLights.forEach((e) => {
  scene.add(e);
  e.castShadow = true;
  e.shadow.mapSize.width = 1024
  e.shadow.mapSize.height = 1024
  e.shadow.camera.far = 7
});

scene.add(pointLightDoor);

// orbitControls and animation

const controls = new OrbitControls(camera, canvas);
controls.update();

function animation(time) {
  ghostLight1.position.x = Math.sin(-time * 0.00025) * 4;
  ghostLight1.position.z = Math.cos(-time * 0.00025) * 4;
  ghostLight2.position.x = Math.sin(time * 0.0005) * 2;
  ghostLight2.position.z = Math.cos(time * 0.0005) * 2;
  ghostLight3.position.x = Math.sin(time * 0.00035) * 3;
  ghostLight3.position.z = Math.cos(time * 0.00035) * 3;

  renderer.render(scene, camera);
}
