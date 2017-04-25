// ????, a Ludum Dare 38 Entry (Theme: A Small World)
// (c) 2017 by Arthur Langereis (@zenmumbler)

/// <reference path="../../stardazed/dist/stardazed.d.ts" />
/// <reference path="../ext/ammo.d.ts" />

/// <reference path="assets.ts" />
/// <reference path="levelgen.ts" />
/// <reference path="sfx.ts" />

interface Element {
	mozRequestFullScreen(): void;
}

interface Document {
	mozFullScreenElement: HTMLElement;
}

import io = sd.io;
import math = sd.math;
import world = sd.world;
import render = sd.render;
import meshdata = sd.meshdata;
import dom = sd.dom;
import asset = sd.asset;
import container = sd.container;
import audio = sd.audio;

import vec2 = veclib.vec2;
import vec3 = veclib.vec3;
import vec4 = veclib.vec4;
import quat = veclib.quat;
import mat2 = veclib.mat2;
import mat3 = veclib.mat3;
import mat4 = veclib.mat4;


const enum GameMode {
	None,
	Loading,
	Title,
	Start,
	Main,
	End
}


interface FSQPipeline {
	pipeline: render.Pipeline;
	texUniform: WebGLUniformLocation;
}

function makeFSQPipeline(rc: render.RenderContext) {
	const pfp = {} as FSQPipeline;

	const vertexSource = `
		attribute vec2 vertexPos_model;
		varying vec2 vertexUV_intp;
		void main() {
			gl_Position = vec4(vertexPos_model, 0.5, 1.0);
			vertexUV_intp = vertexPos_model * 0.5 + 0.5;
		}
	`.trim();

	const fragmentSource = `
		precision highp float;
		varying vec2 vertexUV_intp;
		uniform sampler2D texSampler;
		void main() {
			vec3 texColor = texture2D(texSampler, vertexUV_intp).xyz;
			gl_FragColor = vec4(texColor, 1.0);
		}
	`.trim();

	// -- pipeline
	const pld = render.makePipelineDescriptor();
	pld.vertexShader = render.makeShader(rc, rc.gl.VERTEX_SHADER, vertexSource);
	pld.fragmentShader = render.makeShader(rc, rc.gl.FRAGMENT_SHADER, fragmentSource);
	pld.attributeNames.set(meshdata.VertexAttributeRole.Position, "vertexPos_model");

	pfp.pipeline = new render.Pipeline(rc, pld);
	pfp.texUniform = rc.gl.getUniformLocation(pfp.pipeline.program, "texSampler")!;

	// -- invariant uniform
	pfp.pipeline.bind();
	rc.gl.uniform1i(pfp.texUniform, 0);
	pfp.pipeline.unbind();

	return pfp;
}

function drawFSQ(rc: render.RenderContext, meshMgr: world.MeshManager, tex: render.Texture, p: FSQPipeline, m: world.MeshInstance) {
	const rpd = render.makeRenderPassDescriptor();
	rpd.clearMask = render.ClearMask.Colour;

	render.runRenderPass(rc, meshMgr, rpd, null, (rp) => {
		rp.setPipeline(p.pipeline);
		rp.setTexture(tex, 0);
		rp.setMesh(m);
		rp.setDepthTest(render.DepthTest.Disabled);

		// render quad without any transforms, filling full FB
		const primGroup0 = meshMgr.primitiveGroups(m)[0];
		rp.drawIndexedPrimitives(primGroup0.type, meshMgr.indexBufferElementType(m), 0, primGroup0.elementCount);
	});
}



class MainScene implements sd.SceneController {
	private scene_: world.Scene;
	private assets_: Assets;
	private sfx_: Sound;
	private level_: Level;

	private player_: PlayerController;
	private mode_ = GameMode.None;


	constructor(private rc: render.RenderContext, private ac: audio.AudioContext) {
		this.scene_ = new world.Scene(rc);
		this.sfx_ = new Sound(ac);

		this.setMode(GameMode.Loading);

		const progress = (ratio: number) => {
			dom.$1(".progress").style.width = (ratio * 100) + "%";
		};

		loadAllAssets(rc, ac, this.scene_.meshMgr, progress).then(assets => {
			this.assets_ = assets;
			this.sfx_.setAssets(assets.sound);
			console.info("ASSETS", assets);

			this.level_ = new Level(rc, ac, assets, this.scene_);
			this.level_.generate().then(() => {
				this.setMode(GameMode.Main);

				dom.on(dom.$(`input[type="radio"]`), "click", evt => {
					const radio = evt.target as HTMLInputElement;
					if (radio.checked) {
						const vpsSize = radio.dataset["vps"] || "hdready";
						const holder = dom.$1(".stageholder");
						holder.className = `stageholder ${vpsSize}`;
						const canvas = rc.gl.canvas;
						canvas.width = ({ small: 960, hdready: 1280, fullhd: 1920 } as any)[vpsSize];
						canvas.height = ({ small: 540, hdready: 720, fullhd: 1080 } as any)[vpsSize];

						if (this.mainFBO) {
							rc.gl.deleteFramebuffer(this.mainFBO.resource);
							this.mainFBO = undefined;
						}
					}
				});

				dom.on("#fullscreen", "click", () => {
					if (this.mode_ == GameMode.Main) {
						const canvas = dom.$1(".stageholder");
						canvas.requestPointerLock();
						(canvas.requestFullscreen || canvas.webkitRequestFullscreen || canvas.mozRequestFullScreen).call(canvas);
					}
				});

				const fsch = () => {
					const canvas = dom.$1(".stageholder");
					if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
						const scaleFactor = Math.min(screen.width / rc.gl.drawingBufferWidth, screen.height / rc.gl.drawingBufferHeight);

						if (document.mozFullScreenElement) {
							// Firefox needs the pointerlock request after fullscreen activates
							canvas.requestPointerLock();
							const hOffset = Math.round((screen.width - rc.gl.drawingBufferWidth) / (2 * scaleFactor)) + "px";
							const vOffset = Math.round((screen.height - rc.gl.drawingBufferHeight) / (2 * scaleFactor)) + "px";

							dom.$(".stageholder > *").forEach((e: HTMLElement) => {
								e.style.transform = `scale(${scaleFactor}) translate(${hOffset}, ${vOffset})`;
							});
						}
						else {
							// Safari and Chrome, the vOffset is for macOS to adjust for the menubar
							const vOffset = "-13px"; // on macOS this == Math.round((screen.availHeight - screen.height) / 2) + "px", Chrome Windows keeps this for compat reasons?
							canvas.style.transform = `scale(${scaleFactor}) translate(0, ${vOffset})`;
						}
					}
					else {
						canvas.style.transform = "";
						dom.$(".stageholder > *").forEach((e: HTMLElement) => {
							e.style.transform = "";
						});
					}
				};

				dom.on(document, "fullscreenchange", fsch);
				dom.on(document, "webkitfullscreenchange", fsch);
				dom.on(document, "mozfullscreenchange", fsch);
			});
		});

	}


	resume() {
		if (this.mode_ >= GameMode.Title) {
			// this.sfx_.startMusic();
		}
	}


	suspend() {
		if (this.mode_ >= GameMode.Title) {
			// this.sfx_.stopMusic();
		}
	}


	setMode(newMode: GameMode) {
		dom.hide(".loading");
		dom.hide(".titles");
		if (newMode === GameMode.Loading) {
			dom.show(".loading");
		}
		else if (newMode === GameMode.Title) {
			dom.show(".titles");
		}

		if (newMode !== GameMode.Loading) {
			dom.show("#stage");
			// this.sfx_.startMusic();
			this.player_ = new PlayerController(this.rc.gl.canvas, [2.5, 1.0, -1], this.scene_, this.level_, this.sfx_);
		}

		this.mode_ = newMode;
	}

	fullQuad: world.MeshInstance = 0;
	quadPipeline?: FSQPipeline;

	SHADOW = true;
	SHADQUAD = false;

	downsample128: render.FilterPass;
	downsample64: render.FilterPass;
	boxFilter: render.FilterPass;
	fxaaPass: render.FXAAPass;
	mainFBO: render.FrameBuffer | undefined;
	antialias = true;

	renderFrame(timeStep: number) {
		if (this.mode_ < GameMode.Title) {
			return;
		}

		if (! this.downsample128) {
			this.downsample128 = render.resamplePass(this.rc, this.scene_.meshMgr, 512);
			this.downsample64 = render.resamplePass(this.rc, this.scene_.meshMgr, 256);
			this.boxFilter = render.boxFilterPass(this.rc, this.scene_.meshMgr, 256);
		}

		let mainPassFBO: render.FrameBuffer | null = null;
		if (this.antialias) {
			if (! this.fxaaPass) {
				this.fxaaPass = new render.FXAAPass(this.rc, this.scene_.meshMgr);
			}
			if (! this.mainFBO) {
				this.mainFBO = render.makeScreenFrameBuffer(this.rc, {
					colourCount: 1,
					useDepth: true,
					pixelComponent: render.FBOPixelComponent.Integer
				});
			}
			mainPassFBO = this.mainFBO;
		}

		// -- shadow pass
		let spotShadow: world.ShadowView | null = null;
		const shadowCaster = this.scene_.pbrModelMgr.shadowCaster();

		if (this.SHADOW && shadowCaster && render.canUseShadowMaps(this.rc)) {
			let rpdShadow = render.makeRenderPassDescriptor();
			rpdShadow.clearMask = render.ClearMask.ColourDepth;
			vec4.set(rpdShadow.clearColour, 1, 1, 1, 1);

			spotShadow = this.scene_.lightMgr.shadowViewForLight(this.rc, shadowCaster, .1);
			if (spotShadow) {
				render.runRenderPass(this.rc, this.scene_.meshMgr, rpdShadow, spotShadow.shadowFBO, (renderPass) => {
					renderPass.setDepthTest(render.DepthTest.Less);
					this.scene_.pbrModelMgr.drawShadows(this.scene_.pbrModelMgr.all(), renderPass, spotShadow!.lightProjection);
				});

				//  filter shadow tex and set as source for shadow calcs
				this.downsample128.apply(this.rc, this.scene_.meshMgr, spotShadow.shadowFBO.colourAttachmentTexture(0)!);
				this.downsample64.apply(this.rc, this.scene_.meshMgr, this.downsample128.output);
				this.boxFilter.apply(this.rc, this.scene_.meshMgr, this.downsample64.output);
				spotShadow.filteredTexture = this.boxFilter.output;

				if (this.fullQuad === 0) {
					const quad = meshdata.gen.generate(new meshdata.gen.Quad(2, 2), [meshdata.attrPosition2(), meshdata.attrUV2()]);
					this.fullQuad = this.scene_.meshMgr.create({ name: "squareQuad", meshData: quad });
					this.quadPipeline = makeFSQPipeline(this.rc);
				}

				if (this.SHADQUAD) {
					drawFSQ(this.rc, this.scene_.meshMgr, this.boxFilter.output, this.quadPipeline!, this.fullQuad);
				}
			}
		}

		if (! this.SHADQUAD) {
			// -- main forward pass
			let rpdMain = render.makeRenderPassDescriptor();
			vec4.set(rpdMain.clearColour, 0, 0, 0, 1);
			rpdMain.clearMask = render.ClearMask.ColourDepth;

			render.runRenderPass(this.rc, this.scene_.meshMgr, rpdMain, mainPassFBO, (renderPass) => {
				const viewport = renderPass.viewport()!;
				let camera: world.ProjectionSetup = {
					projectionMatrix: mat4.perspective([], math.deg2rad(65), viewport.width / viewport.height, 0.1, 100),
					viewMatrix: this.player_.view.viewMatrix
				};

				this.scene_.lightMgr.prepareLightsForRender(this.scene_.lightMgr.allEnabled(), camera, viewport);

				renderPass.setDepthTest(render.DepthTest.LessOrEqual);
				renderPass.setFaceCulling(render.FaceCulling.Back);

				this.scene_.pbrModelMgr.draw(this.scene_.pbrModelMgr.all(), renderPass, camera, spotShadow, world.PBRLightingQuality.CookTorrance, this.assets_.tex.reflectCubeSpace);
			});

			if (this.antialias) {
				this.fxaaPass.apply(this.rc, this.scene_.meshMgr, mainPassFBO!.colourAttachmentTexture(0)!);
			}
		}
	}


	simulationStep(timeStep: number) {
		const txm = this.scene_.transformMgr;
		if (this.mode_ >= GameMode.Main) {
			this.player_.step(timeStep);

			// if (io.keyboard.pressed(io.Key.U)) {
			// 	this.SHADOW = !this.SHADOW;
			// }
			// if (io.keyboard.pressed(io.Key.O)) {
			// 	this.SHADQUAD = !this.SHADQUAD;
			// }
		}
	}
}


dom.on(window, "load", () => {
	// -- create managers
	const canvas = <HTMLCanvasElement>document.getElementById("stage");
	const rctx = render.makeRenderContext(canvas)!;
	const actx = audio.makeAudioContext()!;

	if (! (rctx.extDerivatives && rctx.extFragmentLOD)) {
		alert("Sorry, this game is not compatible with this browser.\n\nTry one of the following:\n- Firefox 50 or newer\n- Safari 9 or newer\n- Chrome 40 or newer\n\nApologies for the trouble.");
		return;
	}
	if (! document.body.requestPointerLock) {
		dom.hide("#fullscreen");
	}
	if (screen.width < 1920 || screen.height < 1080) {
		dom.disable("#vps-fullhd");
		dom.$1("#vps-fullhd").title = "Your display does not support this resolution.";
		dom.$1("#vps-fullhd+label").title = "Your display does not support this resolution.";
	}

	const mainCtl = new MainScene(rctx, actx);
	sd.defaultRunLoop.sceneController = mainCtl;
	sd.defaultRunLoop.start();
});
