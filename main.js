// main.js
// 3D 夾娃娃機簡易範例（重置版，只用基本幾何體）

let scene, camera, renderer;
let claw, dolls = [];
let grabbedDoll = null;

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 15);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 地板
  const floorGeo = new THREE.BoxGeometry(20, 1, 20);
  const floorMat = new THREE.MeshPhongMaterial({ color: 0xcccccc });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.5;
  scene.add(floor);

  // 爪子（三爪結構，細緻彎曲造型）
  claw = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const armGroup = new THREE.Group();
    // 第一段：直臂
    const arm1Geo = new THREE.BoxGeometry(0.12, 0.8, 0.18);
    const armMat = new THREE.MeshPhongMaterial({ color: 0xb0b0b0, metalness: 0.8, shininess: 120 });
    const arm1 = new THREE.Mesh(arm1Geo, armMat);
    arm1.position.y = -0.4;
    armGroup.add(arm1);
    // 第二段：彎臂
    const arm2Geo = new THREE.BoxGeometry(0.10, 0.5, 0.14);
    const arm2 = new THREE.Mesh(arm2Geo, armMat);
    arm2.position.y = -0.9;
    arm2.rotation.z = Math.PI / 4; // 彎曲
    armGroup.add(arm2);
    // 指尖
    const tipGeo = new THREE.BoxGeometry(0.10, 0.18, 0.10);
    const tip = new THREE.Mesh(tipGeo, armMat);
    tip.position.y = -1.18;
    tip.position.x = 0.13;
    tip.rotation.z = Math.PI / 2.5;
    armGroup.add(tip);
    // 分布在圓周上
    armGroup.rotation.y = (i / 3) * Math.PI * 2;
    armGroup.position.x = Math.sin(armGroup.rotation.y) * 0.5;
    armGroup.position.z = Math.cos(armGroup.rotation.y) * 0.5;
    armGroup.rotation.x = Math.PI / 10;
    claw.add(armGroup);
  }
  claw.position.set(0, 4, 0);
  scene.add(claw);

  // 娃娃（球體）
  for (let i = 0; i < 5; i++) {
    const dollGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const dollMat = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
    const doll = new THREE.Mesh(dollGeo, dollMat);
    if (i === 0) {
      doll.position.set(0, 4, 0);
      grabbedDoll = doll;
    } else {
      doll.position.set(Math.random()*8-4, 0.7, Math.random()*8-4);
    }
    dolls.push(doll);
    scene.add(doll);
  }

  // 光源
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7);
  scene.add(light);

  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('keydown', onKeyDown, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(event) {
  switch(event.key) {
    case 'ArrowLeft':
      claw.position.x -= 0.5;
      break;
    case 'ArrowRight':
      claw.position.x += 0.5;
      break;
    case 'ArrowUp':
      claw.position.z -= 0.5;
      break;
    case 'ArrowDown':
      claw.position.z += 0.5;
      break;
    case ' ': // 空白鍵：如果有夾住就放下，沒夾住就夾娃娃
      if (grabbedDoll) {
        // 放下娃娃
        grabbedDoll.position.y = 0.7;
        grabbedDoll = null;
      } else {
        tryGrab();
      }
      break;
  }
  if (grabbedDoll) {
    grabbedDoll.position.x = claw.position.x;
    grabbedDoll.position.y = claw.position.y;
    grabbedDoll.position.z = claw.position.z;
  }
}

function tryGrab() {
  if (grabbedDoll) return;
  for (let doll of dolls) {
    if (Math.abs(claw.position.x - doll.position.x) < 1 && Math.abs(claw.position.z - doll.position.z) < 1) {
      doll.position.y = 4;
      doll.position.x = claw.position.x;
      doll.position.z = claw.position.z;
      grabbedDoll = doll;
      break;
    }
  }
}

function animate() {
  if (grabbedDoll) {
    grabbedDoll.position.x = claw.position.x;
    grabbedDoll.position.y = claw.position.y;
    grabbedDoll.position.z = claw.position.z;
  }
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
