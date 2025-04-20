import { AmbientLight } from "./lights/AmbientLight"
import { AnimationMixer } from "./animation/AnimationMixer"
import { AxesHelper } from "./helpers/AxesHelper"
import { BoxGeometry } from "./geometries/BoxGeometry"
import { Clock } from "./core/Clock"
import { DirectionalLight } from "@/lights/DirectionalLight"
import { GLTFLoader } from "./jsm/loaders/GLTFLoader"
import { LoadingManager } from "./loaders/LoadingManager"
import { Mesh } from "./objects/Mesh"
import { MeshPhongMaterial } from "./materials/MeshPhongMaterial"
import { OrbitControls } from "./jsm/controls/OrbitControls"
import { PerspectiveCamera } from "./cameras/PerspectiveCamera"
import { PointLight } from "./lights/PointLight"
import { RoomEnvironment } from "./jsm/environments/RoomEnvironment"
import { Scene } from "./scenes/Scene"
import { WebGLRenderer } from "./renderers/WebGLRenderer"
import GUI from "./gui/GUI"
import { AnimationClip } from "./animation/AnimationClip"
import { NumberKeyframeTrack } from "./animation/tracks/NumberKeyframeTrack"
import { EquirectangularReflectionMapping, NormalAnimationBlendMode } from "./constants"
import { aniTime, aniValues } from "./data"
import { RGBELoader } from "./jsm/loaders/RGBELoader"
import { EXRLoader } from "./jsm/loaders/EXRLoader"
import { EffectComposer } from "./jsm/postprocessing/EffectComposer"
import { RenderPass } from "./jsm/postprocessing/RenderPass"
import { ShaderPass } from "./jsm/postprocessing/ShaderPass"
import { HorizontalBlurShader } from "./jsm/shaders/HorizontalBlurShader"
import { CopyShader } from "./jsm/shaders/CopyShader"
import { VerticalBlurShader } from "./jsm/shaders/VerticalBlurShader"

const loadingManager = new LoadingManager()
loadingManager.onProgress = (url, loaded, total) => {
	// console.log(`Loading file: ${url}.\nLoaded ${loaded} of ${total} files.`)
}

const MODEL_PATH = new URL("/facecap_output.gltf", import.meta.url).href

class App {
	canvas
	renderer
	composer
	camera
	scene
	mixer
	controls
	clock
	material
	model
	composer
	effectFXAA
	meshWithMorphTargets
	morphTargetFolder
	gui
	helpers = {
		axes: null,
		box: null,
		mainLight: null,
		frontLight: null,
		backLight: null,
		point1: null,
		point2: null,
	}
	lights = {
		ambient: undefined,
		main: undefined,
		front: undefined,
		back: undefined,
		point1: undefined,
		point2: undefined,
	}

	mouseX = 0
	mouseY = 0
	targetX = 0
	targetY = 0
	windowHalfX = window.innerWidth / 2
	windowHalfY = window.innerHeight / 2

	constructor() {
		this.createRenderer()
		this.setupCamera()
		this.createClock()
		this.createControls()
		this.setupLights()
		this.setupCube()
		// this.loadModel()
		this.createGUI()
		this.createEnvironment()
		this.postProcessing()

		this.setupEventListeners()

		this.renderer.setAnimationLoop(() => {
			this.render()
		})
	}

	createEnvironment() {
		// const rgbeLoader = new RGBELoader()
		// rgbeLoader.load("/studio_small_03_1k.hdr", function (texture) {
		// 	texture.mapping = EquirectangularReflectionMapping
		// 	scene.background = texture
		// 	scene.environment = texture
		// })
		const scene = this.scene

		// const hdrEquirect = new RGBELoader().load("/studio_small_03_1k.hdr", function (texture) {
		// 	texture.mapping = EquirectangularReflectionMapping
		// 	// Set the environment map
		// 	scene.environment = texture
		// 	// Optionally, set the background
		// 	scene.background = texture
		// })

		const exrLoader = new EXRLoader()
		exrLoader.load("/forest.exr", function (texture) {
			texture.mapping = EquirectangularReflectionMapping

			// Set the environment map
			scene.environment = texture

			// Optionally, set the background
			scene.background = texture
		})
	}
	createClock() {
		this.clock = new Clock()
	}

	setupCamera() {
		this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		this.camera.position.z = 5
		// this.camera.position.set(-1, 0.8, 5)
	}

	createRenderer() {
		const canvas = document.querySelector("#scene")
		if (!canvas) throw new Error("Canvas element not found")
		this.canvas = canvas

		this.scene = new Scene()

		this.renderer = new WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		// this.renderer.setClearColor(0xffffff, 1)

		const room = new RoomEnvironment()
		// this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture
	}

	createControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		// this.controls.enableDamping = false
		// this.controls.minDistance = 2.5
		// this.controls.maxDistance = 5
		// this.controls.minAzimuthAngle = -Math.PI / 2
		// this.controls.maxAzimuthAngle = Math.PI / 2
		// this.controls.maxPolarAngle = Math.PI / 1.8
		// this.controls.target.set(0, 0.15, -0.2)

		// this.controls.enableDamping = true
		// this.controls.dampingFactor = 0.05
		// this.controls.screenSpacePanning = true
	}

	setupCube() {
		const geometry = new BoxGeometry(1, 1, 1)
		const material = new MeshPhongMaterial({ color: 0x00ff00 })
		this.cube = new Mesh(geometry, material)
		this.scene.add(this.cube)
	}

	setupLights() {
		// const ambientLight = new AmbientLight(0xffffff, 0.5)
		// this.scene.add(ambientLight)

		// const pointLight = new PointLight(0xffffff, 1)
		// pointLight.position.set(5, 5, 5)
		// this.scene.add(pointLight)
		this.lights.main = new DirectionalLight("white", 8)
		this.lights.main.position.set(10, 10, 10)
		this.scene.add(this.lights.main)

		this.lights.ambient = new AmbientLight("white", 2)
		this.scene.add(this.lights.ambient)
	}

	setupEventListeners() {
		window.addEventListener("resize", () => this.onWindowResize())
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)
	}

	createGUI() {
		this.gui = new GUI()

		// Add helper visibility controls
		const helperFolder = this.gui.addFolder("Helpers")
		helperFolder.close() // Close by default
		helperFolder.add({ showAxes: true }, "showAxes").onChange((visible) => {
			if (this.helpers.axes) this.helpers.axes.visible = visible
		})
		helperFolder.add({ showBox: true }, "showBox").onChange((visible) => {
			if (this.helpers.box) this.helpers.box.visible = visible
		})
		helperFolder.add({ showLightHelpers: true }, "showLightHelpers").onChange((visible) => {
			if (this.helpers.mainLight) this.helpers.mainLight.visible = visible
			if (this.helpers.frontLight) this.helpers.frontLight.visible = visible
			if (this.helpers.backLight) this.helpers.backLight.visible = visible
			if (this.helpers.point1) this.helpers.point1.visible = visible
			if (this.helpers.point2) this.helpers.point2.visible = visible
		})

		// Ambient Light controls
		const ambientFolder = this.gui.addFolder("Ambient Light")
		ambientFolder.close() // Close by default
		ambientFolder.add(this.lights.ambient, "intensity", 0, 2).name("Intensity")
		ambientFolder.addColor(this.lights.ambient, "color").name("Color")

		// Main Light controls
		const mainFolder = this.gui.addFolder("Main Light")
		mainFolder.close() // Close by default
		mainFolder.add(this.lights.main, "intensity", 0, 2).name("Intensity")
		mainFolder.addColor(this.lights.main, "color").name("Color")
		mainFolder.add(this.lights.main.position, "x", -10, 10).name("Position X")
		mainFolder.add(this.lights.main.position, "y", -10, 10).name("Position Y")
		mainFolder.add(this.lights.main.position, "z", -10, 10).name("Position Z")

		// // Front Light controls
		// const frontFolder = this.gui.addFolder("Front Light")
		// frontFolder.close() // Close by default
		// frontFolder.add(this.lights.front, "intensity", 0, 2).name("Intensity")
		// frontFolder.addColor(this.lights.front, "color").name("Color")
		// frontFolder.add(this.lights.front.position, "x", -10, 10).name("Position X")
		// frontFolder.add(this.lights.front.position, "y", -10, 10).name("Position Y")
		// frontFolder.add(this.lights.front.position, "z", -10, 10).name("Position Z")

		// // Back Light controls
		// const backFolder = this.gui.addFolder("Back Light")
		// backFolder.close() // Close by default
		// backFolder.add(this.lights.back, "intensity", 0, 2).name("Intensity")
		// backFolder.addColor(this.lights.back, "color").name("Color")
		// backFolder.add(this.lights.back.position, "x", -10, 10).name("Position X")
		// backFolder.add(this.lights.back.position, "y", -10, 10).name("Position Y")
		// backFolder.add(this.lights.back.position, "z", -10, 10).name("Position Z")

		// // // Point Light 1 controls
		// // const point1Folder = this.gui.addFolder('Point Light 1')
		// // point1Folder.close() // Close by default
		// // point1Folder.add(this.lights.point1, 'intensity', 0, 2).name('Intensity')
		// // point1Folder.addColor(this.lights.point1, 'color').name('Color')
		// // point1Folder.add(this.lights.point1.position, 'x', -10, 10).name('Position X')
		// // point1Folder.add(this.lights.point1.position, 'y', -10, 10).name('Position Y')
		// // point1Folder.add(this.lights.point1.position, 'z', -10, 10).name('Position Z')
		// // point1Folder.add(this.lights.point1, 'distance', 0, 2000).name('Distance')

		// // // Point Light 2 controls
		// // const point2Folder = this.gui.addFolder('Point Light 2')
		// // point2Folder.close() // Close by default
		// // point2Folder.add(this.lights.point2, 'intensity', 0, 2).name('Intensity')
		// // point2Folder.addColor(this.lights.point2, 'color').name('Color')
		// // point2Folder.add(this.lights.point2.position, 'x', -10, 10).name('Position X')
		// // point2Folder.add(this.lights.point2.position, 'y', -10, 10).name('Position Y')
		// // point2Folder.add(this.lights.point2.position, 'z', -10, 10).name('Position Z')
		// // point2Folder.add(this.lights.point2, 'distance', 0, 2000).name('Distance')

		// // Add camera controls
		// const cameraFolder = this.gui.addFolder("Camera")
		// cameraFolder.add(this.camera.position, "x", -5, 5, 0.1).name("Position X")
		// cameraFolder.add(this.camera.position, "y", -5, 5, 0.1).name("Position Y")
		// cameraFolder.add(this.camera.position, "z", -5, 5, 0.1).name("Position Z")
		// cameraFolder.close()

		this.morphTargetFolder = this.gui.addFolder("Morph Targets")
		this.morphTargetFolder.close()

		// this.gui.close()
	}

	// async loadModel() {
	// 	const aniClipKF = new NumberKeyframeTrack("mesh_2.morphTargetInfluences", aniTime, aniValues)
	// 	const aniClip = new AnimationClip("Key|Take 001|BaseLayer", 11.18083381652832, [aniClipKF], NormalAnimationBlendMode)
	// 	// ~~~~~~~~~~~~~~~

	// 	const loader = new GLTFLoader(loadingManager)
	// 	console.log("MODEL_PATH", MODEL_PATH)
	// 	const axesHelper = new AxesHelper(10)
	// 	this.scene.add(axesHelper)

	// 	const animationKF = new NumberKeyframeTrack(".facialanimation", [0, 1, 2], [1, 0, 1])

	// 	const clip = new AnimationClip("Action", 3, [animationKF])

	// 	loader.load(MODEL_PATH, (gltf) => {
	// 		// console.log("gltf", gltf)
	// 		const mesh = gltf.scene.children[0]
	// 		// console.log("mesh", mesh)
	// 		// console.log("gltf.scene", gltf.scene)
	// 		// console.log("gltf.scene.children", gltf.scene.children[0])
	// 		this.mixer = new AnimationMixer(mesh)
	// 		const facialAnimation = gltf.animations[0]
	// 		// console.log("facialAnimation", facialAnimation)
	// 		// console.log("aniClip", aniClip)

	// 		const animationAction = this.mixer.clipAction(aniClip)
	// 		// console.log("animationAction", animationAction)
	// 		// animationAction.play()
	// 		// const head = mesh.getObjectByName("mesh_2")
	// 		// const influences = head.morphTargetInfluences
	// 		//   // Center the model
	// 		//   const box = new Box3().setFromObject(this.model)
	// 		//   const center = box.getCenter(new Vector3())
	// 		//   this.model.position.sub(center)
	// 		//   // Setup morph targets
	// 		//   this.model.traverse((node) => {
	// 		//     if (node.isMesh && node.morphTargetDictionary) {
	// 		//       this.meshWithMorphTargets = node
	// 		//     }
	// 		//   })
	// 		// // Handle animations
	// 		// if (gltf.animations?.length) {
	// 		//   this.mixer = new AnimationMixer(this.model)
	// 		//   this.animations = gltf.animations
	// 		//   this.animations.forEach((clip) => {
	// 		//     this.mixer.clipAction(clip).play()
	// 		//   })
	// 		// }
	// 		// for (const [key, value] of Object.entries(head.morphTargetDictionary)) {
	// 		// 	this.morphTargetFolder.add(influences, value, 0, 1, 0.01).name(key.replace("blendShape1.", "")).listen()
	// 		// }
	// 		//   this.gui.close()
	// 		this.scene.add(mesh)
	// 		//   this.scene.add(this.model)

	// 		// function printHierarchy(object, depth = 0) {
	// 		// 	console.log(`${' '.repeat(depth * 2)}📦 ${object.type} (${object.name || 'Unnamed'})`);
	// 		// 	object.children.forEach(child => printHierarchy(child, depth + 1));
	// 		// }

	// 		// printHierarchy(this.scene);
	// 	})
	// }

	render() {
		const delta = this.clock.getDelta()

		if (this.mixer) {
			this.mixer.update(delta)
		}

		// Rotate the cube
		this.cube.rotation.x += 0.01
		this.cube.rotation.y += 0.01

		if (this.controls) {
			this.controls.update()
		}

		// this.renderer.render(this.scene, this.camera)
		this.composer.render()
	}

	postProcessing() {
		this.composer = new EffectComposer(this.renderer)
		const renderPass = new RenderPass(this.scene, this.camera)
		this.composer.addPass(renderPass)

		// Add a horizontal blur pass
		const horizontalBlurPass = new ShaderPass(HorizontalBlurShader)
		horizontalBlurPass.uniforms["h"].value = 2.0 / window.innerWidth // Adjust blur strength
		this.composer.addPass(horizontalBlurPass)

		// Add a vertical blur pass
		const verticalBlurPass = new ShaderPass(VerticalBlurShader)
		verticalBlurPass.uniforms["v"].value = 2.0 / window.innerHeight // Adjust blur strength
		this.composer.addPass(verticalBlurPass)

		// Add a copy pass to render the final result
		const copyPass = new ShaderPass(CopyShader)
		copyPass.renderToScreen = true
		this.composer.addPass(copyPass)
	}
}

// Initialize the app
const app = new App()
