import { PerspectiveCamera } from "./cameras/PerspectiveCamera"
import { BoxGeometry } from "./geometries/BoxGeometry"
import { AmbientLight } from "./lights/AmbientLight"
import { PointLight } from "./lights/PointLight"
import { DirectionalLight } from "./lights/DirectionalLight"
import { MeshPhongMaterial } from "./materials/MeshPhongMaterial"
import { Mesh } from "./objects/Mesh"
import { WebGLRenderer } from "./renderers/WebGLRenderer"
import { Scene } from "./scenes/Scene"
import { Clock } from "./core/Clock"
import { Vector3 } from "./math/Vector3"
import { Color } from "./math/Color"
import { HalfFloatType, SRGBColorSpace } from "./constants"
import { WebGLRenderTarget } from "./renderers/WebGLRenderTarget"
import { DepthTexture } from "./textures/DepthTexture"
import { TextureLoader } from "./loaders/TextureLoader"
import { Vector2 } from "./math/Vector2"
import { Box3 } from "./math/Box3"
import { AnimationMixer } from "./animation/AnimationMixer"

class App {
	canvas
	renderer
	camera
	scene
	mixer
	controls
	clock
	material
	model
	composer
	effectFXAA
	stats
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
		const canvas = document.querySelector("#scene")
		if (!canvas) throw new Error("Could not find #scene")
		this.canvas = canvas
		this.scene = new Scene()
		this.scene.background = new Color("#000")
		this.clock = new Clock()

		this.createCamera()
		this.createRenderer()
		this.createLights()
		this.createMesh()

		window.addEventListener("resize", this.onWindowResize.bind(this), false)
		document.addEventListener("mousemove", this.onDocumentMouseMove.bind(this))

		this.renderer.setAnimationLoop(() => {
			this.render()
		})
	}

	createCamera() {
		this.camera = new PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 10000)
		this.camera.position.set(0, 0, 1000)
	}

	createRenderer() {
		this.renderer = new WebGLRenderer({
			antialias: true,
			alpha: true,
		})
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.canvas.appendChild(this.renderer.domElement)
	}

	createLights() {
		// Ambient light for overall scene illumination
		this.lights.ambient = new AmbientLight(0xffffff, 2)
		this.scene.add(this.lights.ambient)

		// Main directional light (like sun)
		this.lights.main = new DirectionalLight(0xffffff, 2)
		this.lights.main.position.set(0, 5, 10)
		this.scene.add(this.lights.main)

		// Fill light from the front
		this.lights.front = new DirectionalLight(0xffffff, 0.7)
		this.lights.front.position.set(0, 0, 1)
		this.scene.add(this.lights.front)

		// Back light for rim lighting
		this.lights.back = new DirectionalLight(0xffffff, 0.5)
		this.lights.back.position.set(0, 0, -5)
		this.scene.add(this.lights.back)

		// Add point lights for additional detail
		this.lights.point1 = new PointLight(0xffffff, 1, 1000)
		this.lights.point1.position.set(2, 2, 2)
		this.scene.add(this.lights.point1)

		this.lights.point2 = new PointLight(0xffffff, 1, 1000)
		this.lights.point2.position.set(-2, 2, -2)
		this.scene.add(this.lights.point2)
	}

	createMesh() {
		// Create a cube for now
		const geometry = new BoxGeometry(1, 1, 1)
		const material = new MeshPhongMaterial({
			color: 0xdddddd,
			specular: 0x222222,
			shininess: 35,
		})
		this.model = new Mesh(geometry, material)
		this.scene.add(this.model)
	}

	onWindowResize() {
		const width = window.innerWidth
		const height = window.innerHeight

		this.camera.aspect = width / height
		this.camera.updateProjectionMatrix()

		this.renderer.setSize(width, height)
	}

	onDocumentMouseMove(event) {
		this.mouseX = event.clientX - this.windowHalfX
		this.mouseY = event.clientY - this.windowHalfY
	}

	render() {
		const delta = this.clock.getDelta()

		if (this.model) {
			this.targetX = this.mouseX * 0.001
			this.model.rotation.y += 0.05 * (this.targetX - this.model.rotation.y)
		}

		this.renderer.render(this.scene, this.camera)
	}
}

// Create a new instance of the App class
new App()
