import * as THREE from "https://threejs.org/build/three.module.js";
import { GUI } from "https://threejs.org/examples/jsm/libs/dat.gui.module.js";

let scene, camera, renderer, clock
var rollercoasterpath, obj

const types = {
    'Extern View': 0,
    'On Sled View': 1,
    'Drone View': 2,
};

const params = {
    type: 'Extern View',
};

main();

function main () {
    // Criação do horário
    clock = new THREE.Clock();
    
    // Criação da cena
    scene = new THREE.Scene();
    const envMap = new THREE.CubeTextureLoader()
        .setPath(`img/`)
        .load(['px.png',
                'nx.png',
                'py.png',
                'ny.png',
                'pz.png',
                'nz.png']);
    scene.background = envMap;

    // Definindo camera e luz amviente e direcional
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 45, 3000);
    camera.position.set(-500, 500, 900);
    camera.lookAt(0,0,0);

    const ambientLight = new THREE.AmbientLight('white', 2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight('white', 5);
    mainLight.position.set(-100, 100, 200);
    scene.add(mainLight);

    // Eixo de ajuda
    const axesHelper = new THREE.AxesHelper( 500 );
    scene.add( axesHelper );

    // Criação do trenó
    obj = new THREE.Mesh();
    sledMaker(envMap);
    scene.add(obj);
    
    // Construindo o caminho
    rollercoasterpath = rollercoasterhMaker(envMap);
    scene.add(rollercoasterpath);

    // Renderização
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Inserindo a escolha de camera
    const gui = new GUI( { width: 300 } );

    const folderCamera = gui.addFolder( 'Camera' );
    folderCamera.add( params, 'type', Object.keys( types ) ).onChange( function () {
        setCamera();
    } );

    window.addEventListener('resize', resize);

    // Atualizando
    update();
};

function sledMaker(envMap) {
    const sled = new THREE.Mesh();

    // Curvas do Treno
    var curves = new THREE.CatmullRomCurve3( [
        new THREE.Vector3(60.5, -21, 0),
        new THREE.Vector3(55.0, 0, 0),
        new THREE.Vector3(-55.0, 0, 0),
        new THREE.Vector3(-60.5, -21, 0)
    ] );
    curves.tension = 0.2;
    curves.curveType = 'catmullrom';

    var geometry = new THREE.TubeGeometry(curves, 40, 1, 20, false);
    const materials = new THREE.MeshStandardMaterial({ 
        color: 0xadadad,

        metalness: 1,
        roughness: 0,

        side: THREE.FrontSide,

        envMap: envMap
    } );
    const sledarcfront = new THREE.Mesh(geometry, materials);
    sled.add(sledarcfront);

    const sledarcback = new THREE.Mesh(geometry, materials);
    sledarcback.translateZ(40);
    sled.add(sledarcback);

    // Base de metal do treno
    curves = new THREE.CatmullRomCurve3( [
        new THREE.Vector3(60, -20, 70),
        new THREE.Vector3(60, -20, -30),
        new THREE.Vector3(35, 9, -70),
        new THREE.Vector3(-35, 9, -70),
        new THREE.Vector3(-60, -20, -30),
        new THREE.Vector3(-60, -20, 70)
    ]);
    curves.tension = 0.2;
    curves.curveType = 'catmullrom'

    geometry = new THREE.TubeGeometry(curves, 100, 1.5, 20, false);
    const sledbase = new THREE.Mesh(geometry, materials);
    sled.add(sledbase);

    // Fechando base de metal do treno
    geometry = new THREE.CircleGeometry( 1.5, 32 );
    var coverleft = new THREE.Mesh(geometry, materials);
    coverleft.position.x = 60;
    coverleft.position.y = -20;
    coverleft.position.z = 70;
    sled.add(coverleft);
    var coverright = new THREE.Mesh(geometry, materials);
    coverright.position.x = -60;
    coverright.position.y = -20;
    coverright.position.z = 70;
    sled.add(coverright);

    // Bancos de madeira do Treno
    const wood = new THREE.TextureLoader().load( 'img/crate.gif' );
    const geometrywood = new THREE.BoxGeometry( 15, 5, 100 );
    const materialwood = new THREE.MeshBasicMaterial( {map: wood} );
    
    var xOffset = -30;
    var yOffset = 1;
    var zOffset = 20;

    for(var i = 0; i < 4; i++){
        var sledchair  = new THREE.Mesh(geometrywood, materialwood);
        sledchair.position.x = (20 * i) + xOffset;
        sledchair.position.z = zOffset
        sledchair.position.y = yOffset
        sled.add(sledchair);
    };

    // Adiciona o treno ao objeto geral
    obj.add(sled);
};

function rollercoasterhMaker(envMap) {
    var curvecenter = new THREE.CurvePath();

    // Definição dos pontos para a curva bezier
    var points = [
        [new THREE.Vector3(  ), new THREE.Vector3( 0, 0, 200 ), new THREE.Vector3( 0, 0, 400 ), new THREE.Vector3( 200, 0, 400 )],
        [new THREE.Vector3( 200, 0, 400 ), new THREE.Vector3( 400, 0, 400 ), new THREE.Vector3( 300, 100, 400 ), new THREE.Vector3( 400, 100, 400 )],
        [new THREE.Vector3( 400, 100, 400 ), new THREE.Vector3(500, 100, 400), new THREE.Vector3(150, 300, 0), new THREE.Vector3( 300, 400, -50 )], 
        [new THREE.Vector3( 300, 400, -50 ), new THREE.Vector3(450, 500, -100), new THREE.Vector3(200, 0, -300), new THREE.Vector3( -300, -200, -400 )],
        [new THREE.Vector3( -300, -200, -400 ), new THREE.Vector3(-800, -400, -500), new THREE.Vector3(-200, 200, -100), new THREE.Vector3( -300, -200, 0 )],
        [new THREE.Vector3( -300, -200, 0 ), new THREE.Vector3(-400, -600, 100), new THREE.Vector3(0, 0, -200), new THREE.Vector3( 0, 0, 0 )]];
    
    for (let pnt of points) {
        curvecenter.add(
            new THREE.CubicBezierCurve3(
                pnt[0],
                pnt[1],
                pnt[2],
                pnt[3]
        ));
    };
    var geometry = new THREE.TubeGeometry( curvecenter, 300, 2, 50, false );
    
    // Curva com material de metal
    var material = new THREE.MeshStandardMaterial({ 
        color: 0xadadad,

        metalness: 1,
        roughness: 0,

        side: THREE.FrontSide,

        envMap: envMap
    } );

    const path = new THREE.Mesh( geometry, material);

    return path;
};

function setCamera() {
    // Se view de drone, coloca a camera junto com o treno com uma distancia
    if (types[params.type] == 2) {
        obj.add(camera);
        
        camera.position.setLength(200);
        camera.rotation.set(obj.rotation);
        camera.lookAt(obj.position);
    }
    else {
        // Caso contrário, camera distante inicialmente para visão externa ou primeira mão
        obj.remove(camera);
        camera.position.set(-500, 500, 900);
        camera.lookAt(0,0,0);
    };
}

// Atualiza
function update(){
    requestAnimationFrame(update);
    updateposition();
    renderer.render(scene, camera);  
};

// Ajuste de tamanho de tela
function resize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};

// Muda posição do treno
function updateposition() {
    const time = clock.getElapsedTime();
    const looptime = 20;
	const t1 = 1-( time % looptime ) / looptime;
    const t2 = 1-( (time - 0.1) % looptime) / looptime;
    
    const pos1 = rollercoasterpath.geometry.parameters.path.getPointAt( t1 );
    const pos2 = rollercoasterpath.geometry.parameters.path.getPointAt( t2 );
    
    obj.position.copy(pos1);
    obj.lookAt(pos2);
    
    // Se for camera de primeira pessoa
    if (types[params.type] == 1) {
        const t3 = 1-( (time + 0.1) % looptime) / looptime;
        
        const pos3 = rollercoasterpath.geometry.parameters.path.getPointAt( t3 );

        // Camera vai junto com o treno e olha pra frente
        camera.position.copy(pos1);
        camera.lookAt(pos3);
    };
};