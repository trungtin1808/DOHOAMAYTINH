// Find the latest version by visiting https://cdn.skypack.dev/three.
import * as THREE from "./lib/three.module.js";
import { OrbitControls } from "./lib/OrbitControls.js";
import { TransformControls } from "./lib/TransformControls.js";
import { GUI } from "./lib/dat.gui.module.js";
import Stats from "./lib/stats.module.js";
import { TGALoader } from "./lib/TGALoader.js";
import { TeapotGeometry } from "./lib/TeapotGeometry.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/loaders/GLTFLoader.js";

// global variables
let camera, scene, renderer;
let floor, geometry, material, mesh, floorMesh, light, axes;
let gui;
let stats;
let loader = new TGALoader();
let textureLoader = new THREE.TextureLoader();
// controls
let obControls, afControls;
const uploadInput = document.getElementById("uploadInput");
// gui settings
let settings = {
  common: {
    showaxes: false,
    background: "color",
    color: "rgb(85 , 85 , 85)",
  },
  Points: {
    play: false,
  },
  geometry: {
    scale: 1,
    shape: "cube",
    material: "phong",
    Points: false,
    wireframe: false,
    color: 0x7a6c6c,
  },
  light: {
    type: "point",
    enable: true,
    shadow: true,
    intensity: 4,
    color: 0xffffff,
    posX: -2,
    posY: 2,
    posZ: -2,
  },
  affine: {
    mode: "none",
  },
  camera: {
    fov: 75,
    near: 0.1,
    far: 100,
    posX: -2,
    posY: 2,
    posZ: 4,
    lookX: 0,
    lookY: 0,
    lookZ: 0,
  },
  animation: {
    color: false,
    play: false,
    type: "go up and down",
    speed: 0.01,
  },
};
var pickMaterial = {
  add: function () {
    alert("Please select");
  },
};
init();
initGUI();
animate();

function init() {
  // scene
  scene = new THREE.Scene();
  //background()
  scene.background = new THREE.Color(settings.common.color);

  // camera
  camera = new THREE.PerspectiveCamera(
    settings.camera.fov,
    window.innerWidth / window.innerHeight,
    settings.camera.near,
    settings.camera.far
  );
  camera.position.set(
    settings.camera.posX,
    settings.camera.posY,
    settings.camera.posZ
  );
  camera.lookAt(
    settings.camera.lookX,
    settings.camera.lookY,
    settings.camera.lookZ
  );

  // renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  // axes
  axes = new THREE.AxesHelper(5);

  // floor plane

  geometry = new THREE.PlaneBufferGeometry(100, 100, 100, 100);
  let floorMat = new THREE.MeshPhongMaterial({
    color: 0x222222,
    side: THREE.DoubleSide,
  });
  floor = new THREE.Mesh(geometry, floorMat);

  // floor mesh
  floorMesh = new THREE.Mesh(geometry, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = -0.5;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  // object box
  geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  material = new THREE.MeshPhongMaterial({
    color: settings.geometry.color,
    side: THREE.DoubleSide,
  });
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0.5, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = false;
  scene.add(mesh);

  // light
  light = new THREE.PointLight(settings.light.color, 2, 100);
  light.position.set(
    settings.light.posX,
    settings.light.posY,
    settings.light.posZ
  );
  light.castShadow = true;

  // shadow
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 50;

  // add light to scene
  scene.add(light);

  // transform controls
  obControls = new OrbitControls(camera, renderer.domElement);
  obControls.enableDamping = true;
  obControls.dampingFactor = 0.25;
  obControls.enableZoom = true;
  obControls.minDistance = 0.5;
  obControls.maxDistance = 1000;
  obControls.minPolarAngle = 0;
  obControls.maxPolarAngle = Math.PI / 2;

  // affine controls
  afControls = new TransformControls(camera, renderer.domElement);
  afControls.addEventListener("change", () => {
    // console.log(afControls.object.position)
    renderer.render(scene, camera);
  });
  afControls.addEventListener("dragging-changed", (event) => {
    if (event.value) {
      obControls.enabled = false;
    } else {
      obControls.enabled = true;
    }
  });
  scene.add(afControls);

  // stats
  stats = new Stats();
  stats.showPanel(0);
  // document.body.appendChild(stats.dom)

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  if (settings.animation.color) {
    var time = performance.now() * 0.001; // Thời gian tính bằng giây
    var red = Math.sin(time) * 0.5 + 0.5; // Giá trị thành phần màu đỏ
    var green = Math.cos(time) * 0.5 + 0.5; // Giá trị thành phần màu xanh lá cây
    var blue = Math.sin(time + Math.PI) * 0.5 + 0.5; // Giá trị thành phần màu xanh dương
    mesh.material.color.setRGB(red, green, blue);
  }
  if (settings.animation.play) {
    switch (settings.animation.type) {
      case "go up and down":
        mesh.position.y = Math.sin(performance.now() * 0.001) * 1;
        break;
      case "go left and right":
        mesh.position.x = Math.sin(performance.now() * 0.001) * 0.5;
        break;
      case "go forward and backward":
        mesh.position.z = Math.sin(performance.now() * 0.001) * 0.5;
        break;
      case "rotate y":
        mesh.rotation.y = performance.now() * 0.001;
        break;
      case "rotate x":
        mesh.rotation.x = performance.now() * 0.001;
        break;
      case "rotate z":
        mesh.rotation.z = performance.now() * 0.001;
        break;
      case "go around counterclockwise":
        mesh.position.x = Math.sin(performance.now() * 0.001) * 0.5;
        mesh.position.z = Math.cos(performance.now() * 0.001) * 0.5;
        break;
      case "go around clockwise":
        mesh.position.x = Math.cos(performance.now() * 0.001) * 0.5;
        mesh.position.z = Math.sin(performance.now() * 0.001) * 0.5;
        break;
      case "color transition":
        var time = performance.now() * 0.001; // Thời gian tính bằng giây
        var red = Math.sin(time) * 0.5 + 0.5; // Giá trị thành phần màu đỏ
        var green = Math.cos(time) * 0.5 + 0.5; // Giá trị thành phần màu xanh lá cây
        var blue = Math.sin(time + Math.PI) * 0.5 + 0.5; // Giá trị thành phần màu xanh dương
        mesh.material.color.setRGB(red, green, blue);
        break;
      default:
        break;
    }
  }

  stats.update();
  renderer.render(scene, camera);
}

function initGUI() {
  // gui
  gui = new GUI();

  // common
  let h = gui.addFolder("Common");
  h.add(settings.common, "background", [
    "texture",
    "color",
    "texture_1",
    "texture_2",
  ]).onChange(() => {
    if (settings.common.background === "texture") {
      var spaceTexture = textureLoader.load("img/textures/skybox_front.jpg");
    } else if (settings.common.background === "color") {
      var spaceTexture = new THREE.Color(settings.common.color);
    } else if (settings.common.background === "texture_1") {
      var spaceTexture = textureLoader.load("img/textures/texture_1.jpg");
    } else if (settings.common.background === "texture_2") {
      var spaceTexture = textureLoader.load("img/textures/texture_2.jpg");
    }
    scene.background = spaceTexture;
  });
  h.addColor(settings.common, "color").onChange(() => {
    if (settings.common.background === "color") {
      scene.background = new THREE.Color(settings.common.color);
    }
  });
  h.add(settings.common, "showaxes").onChange(() => {
    if (settings.common.showaxes) {
      scene.add(axes);
    } else {
      scene.remove(axes);
    }
  });

  // geometry
  let g = gui.addFolder("Geometry");
  g.add(settings.geometry, "scale", 0.1, 20).onChange(() => {
    if (mesh) {
      mesh.scale.set(
        settings.geometry.scale,
        settings.geometry.scale,
        settings.geometry.scale
      );
    }
  });

  g.add(settings.geometry, "shape", [
    "cube",
    "sphere",
    "cone",
    "cylinder",
    "torus",
    "teapot",
    "icosahedron",
    "octahedron",
    "torusknot",
    "circle",
    "custom",
    "custom1",
    "dodecahedron",
  ]).onChange(() => {
    if (settings.geometry.shape === "cube") {
      geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    } else if (settings.geometry.shape === "sphere") {
      geometry = new THREE.SphereBufferGeometry(1, 32, 32);
    } else if (settings.geometry.shape === "cone") {
      geometry = new THREE.ConeBufferGeometry(1, 2, 16);
    } else if (settings.geometry.shape === "circle") {
      geometry = new THREE.CircleGeometry(3, 8);
    } else if (settings.geometry.shape === "dodecahedron") {
      geometry = new THREE.DodecahedronGeometry(2, 1);
    } else if (settings.geometry.shape === "tetrahedron") {
      geometry = new THREE.TetrahedronBufferGeometry(1, 0);
    } else if (settings.geometry.shape === "octahedron") {
      geometry = new THREE.OctahedronGeometry(2, 1);
    } else if (settings.geometry.shape === "cylinder") {
      geometry = new THREE.CylinderBufferGeometry(1, 1, 1, 32);
    } else if (settings.geometry.shape === "icosahedron") {
      geometry = new THREE.IcosahedronGeometry(2, 0);
    } else if (settings.geometry.shape === "torus") {
      geometry = new THREE.TorusBufferGeometry(1, 0.3, 32, 32);
    } else if (settings.geometry.shape === "torusknot") {
      geometry = new THREE.TorusKnotBufferGeometry(1, 0.1, 32, 32);
    } else if (settings.geometry.shape === "teapot") {
      geometry = new TeapotGeometry(0.5);
      console.log(geometry);
    } else if (settings.geometry.shape === "custom") {
      const loader = new GLTFLoader();
      loader.load(
        "model/potted_plant_04_4k.gltf/potted_plant_04_4k.gltf",
        function (gltf) {
          // Retrieve the loaded scene
          const model = gltf.scene;

          // Access the geometry from the loaded model
          model.traverse((node) => {
            geometry = node.geometry;
            mesh.geometry = geometry;
          });
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    } else if (settings.geometry.shape === "custom1") {
      const loader = new GLTFLoader();
      loader.load(
        "model/uploads_files_2639757_gltf/gltf/gltf/wraith.gltf",
        function (gltf) {
          // Retrieve the loaded scene
          const model = gltf.scene;

          // Access the geometry from the loaded model
          model.traverse((node) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = false;

              // Kiểm tra và điều chỉnh vật liệu
              if (node.material) {
                node.material.transparent = false;
                node.material.opacity = 1;
                node.material.side = THREE.DoubleSide; // Render cả hai mặt
              }
            }
            geometry = node.geometry;
            mesh.geometry = geometry;
          });
        },
        undefined,
        function (error) {
          console.error(error);
        }
      );
    }
    mesh.geometry = geometry;
    mesh.position.set(0, 0.5, 0);
  });
  g.add(settings.geometry, "material", [
    "points",
    "solid",
    "phong",
    "lines",
    "wood",
    "earth texture",
    "aluminum texture",
    "custom",
  ]).onChange(() => {
    if (settings.geometry.material === "solid") {
      scene.remove(mesh);
      material = new THREE.MeshBasicMaterial({
        color: settings.geometry.color,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geometry, material);
    } else if (settings.geometry.material === "points") {
      scene.remove(mesh);
      material = new THREE.PointsMaterial({
        color: settings.geometry.color,
        side: THREE.DoubleSide,
        size: 1,
      });
      mesh = new THREE.Points(geometry, material);
    } else if (settings.geometry.material === "lambert") {
      scene.remove(mesh);
      material = new THREE.MeshLambertMaterial({
        color: settings.geometry.color,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geometry, material);
    } else if (settings.geometry.material === "phong") {
      scene.remove(mesh);
      material = new THREE.MeshPhongMaterial({
        color: settings.geometry.color,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geometry, material);
    } else if (settings.geometry.material === "lines") {
      scene.remove(mesh);
      material = new THREE.LineBasicMaterial({
        color: settings.geometry.color,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Line(geometry, material);
    } else if (settings.geometry.material === "wood") {
      scene.remove(mesh);
      let texture = textureLoader.load("img/textures/wood.jpg");
      material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geometry, material);
    } else if (settings.geometry.material === "wireframe") {
      scene.remove(mesh);
      material = new THREE.MeshBasicMaterial({
        color: settings.geometry.color,
        wireframe: true,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geometry, material);
    } else if (settings.geometry.material === "earth texture") {
      scene.remove(mesh);
      let texture = textureLoader.load("img/textures/planets/earth.jpg");
      material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geometry, material);
    } else if (settings.geometry.material === "aluminum texture") {
      scene.remove(mesh);
      var teaPot = textureLoader.load("img/textures/aluminium.jpg");
      material = new THREE.MeshBasicMaterial({
        map: teaPot,
        side: THREE.DoubleSide,
      });
      mesh = new THREE.Mesh(geometry, material);
    } else if (settings.geometry.material === "custom") {
      // Get the uploaded file
      uploadInput.click();
      uploadInput.addEventListener("change", function () {
        const file = uploadInput.files[0];

        console.log(file);
        if (file) {
          // Create a new FileReader
          const reader = new FileReader();
          // Set up the reader onload event
          reader.onload = function (e) {
            // e.target.result contains the image data
            var imageData = e.target.result;
            // Perform your desired operations with the image data here
            scene.remove(mesh);
            const texture = new THREE.TextureLoader().load(imageData);
            material = new THREE.MeshBasicMaterial({
              map: texture,
              side: THREE.DoubleSide,
            });
            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
          };
          // Read the uploaded file as a data URL
          reader.readAsDataURL(file);
        }
      });
    }
    mesh.position.set(0, 0.5, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    scene.add(mesh);
  });
  g.addColor(settings.geometry, "color").onChange(() => {
    if (settings.geometry.material === "points") {
      material = new THREE.PointsMaterial({
        color: settings.geometry.color,
        side: THREE.DoubleSide,
      });
    } else if (settings.geometry.material === "solid") {
      material = new THREE.MeshBasicMaterial({
        color: settings.geometry.color,
        side: THREE.DoubleSide,
      });
    } else if (settings.geometry.material === "lambert") {
      material = new THREE.MeshLambertMaterial({
        color: settings.geometry.color,
        side: THREE.DoubleSide,
      });
    } else if (settings.geometry.material === "phong") {
      material = new THREE.MeshPhongMaterial({
        color: settings.geometry.color,
        side: THREE.DoubleSide,
      });
    } else if (settings.geometry.material === "lines") {
      material = new THREE.LineBasicMaterial({
        color: settings.geometry.color,
        side: THREE.DoubleSide,
      });
    } else if (settings.geometry.material === "wireframe") {
      material = new THREE.MeshBasicMaterial({
        color: settings.geometry.color,
        wireframe: true,
        side: THREE.DoubleSide,
      });
    }
    mesh.material = material;
  });
  // affine
  let f = gui.addFolder("Affine Transformation");
  f.add(settings.affine, "mode", [
    "none",
    "translate",
    "rotate",
    "scale",
  ]).onChange(() => {
    if (settings.affine.mode === "none") {
      afControls.detach();
    } else {
      afControls.setMode(settings.affine.mode);
      afControls.attach(mesh);
    }
  });

  // light
  let l = gui.addFolder("Light and Shadow");
  l.add(settings.light, "type", [
    "point",
    "spot",
    "directional",
    "ambientlight",
  ]).onChange(() => {
    scene.remove(light);
    if (settings.light.type === "point") {
      light = new THREE.PointLight(settings.light.color, 2, 100);
    } else if (settings.light.type === "spot") {
      light = new THREE.SpotLight(settings.light.color, 2, 100);
    } else if (settings.light.type === "directional") {
      light = new THREE.DirectionalLight(settings.light.color, 2);
    } else if (settings.light.type === "ambientlight") {
      light = new THREE.AmbientLight(settings.light.color, 2);
    }

    light.position.set(
      settings.light.posX,
      settings.light.posY,
      settings.light.posZ
    );
    light.castShadow = settings.light.shadow;
    scene.add(light);
  });

  l.add(settings.light, "intensity", 0, 10).onChange(() => {
    light.intensity = settings.light.intensity;
  });

  l.add(settings.light, "shadow", false).onChange(() => {
    light.castShadow = settings.light.shadow;
  });

  l.addColor(settings.light, "color").onChange(() => {
    light.color = new THREE.Color(settings.light.color);
  });

  l.add(settings.light, "posX", -10, 10).onChange(() => {
    light.position.set(
      settings.light.posX,
      settings.light.posY,
      settings.light.posZ
    );
  });

  l.add(settings.light, "posY", -10, 10).onChange(() => {
    light.position.set(
      settings.light.posX,
      settings.light.posY,
      settings.light.posZ
    );
  });

  l.add(settings.light, "posZ", -10, 10).onChange(() => {
    light.position.set(
      settings.light.posX,
      settings.light.posY,
      settings.light.posZ
    );
  });

  // camera
  let c = gui.addFolder("Camera");
  c.add(settings.camera, "fov", 1, 180).onChange(() => {
    camera.fov = settings.camera.fov;
    camera.updateProjectionMatrix();
  });

  c.add(settings.camera, "posX", -10, 10).onChange(() => {
    camera.position.set(
      settings.camera.posX,
      settings.camera.posY,
      settings.camera.posZ
    );
  });

  c.add(settings.camera, "posY", -10, 10).onChange(() => {
    camera.position.set(
      settings.camera.posX,
      settings.camera.posY,
      settings.camera.posZ
    );
  });

  c.add(settings.camera, "posZ", -10, 10).onChange(() => {
    camera.position.set(
      settings.camera.posX,
      settings.camera.posY,
      settings.camera.posZ
    );
  });

  c.add(settings.camera, "lookX", -10, 10).onChange(() => {
    camera.lookAt(
      settings.camera.lookX,
      settings.camera.lookY,
      settings.camera.lookZ
    );
  });

  c.add(settings.camera, "lookY", -10, 10).onChange(() => {
    camera.lookAt(
      settings.camera.lookX,
      settings.camera.lookY,
      settings.camera.lookZ
    );
  });

  c.add(settings.camera, "lookZ", -10, 10).onChange(() => {
    camera.lookAt(
      settings.camera.lookX,
      settings.camera.lookY,
      settings.camera.lookZ
    );
  });

  // animation
  let a = gui.addFolder("Animation");
  a.add(settings.animation, "color");
  a.add(settings.animation, "play");
  a.add(settings.animation, "type", [
    "go up and down",
    "go left and right",
    "go forward and backward",
    "rotate x",
    "rotate y",
    "rotate z",
    "go around clockwise",
    "go around counterclockwise",
  ]);
}

// 'tetrahedron', 'dodecahedron', 'wireframe', 'lambert',
