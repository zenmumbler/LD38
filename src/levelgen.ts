// ????, a Ludum Dare 38 Entry
// (c) 2017 by Arthur Langereis (@zenmumbler)

function srgb8Color(r: number, g: number, b: number) {
	return [Math.pow(r / 255, 2.2), Math.pow(g / 255, 2.2), Math.pow(b / 255, 2.2)];
}

type LineSeg = sd.Float4;

class Level {
	public clipLines: LineSeg[] = [];

	constructor(private rc: render.RenderContext, private ac: audio.AudioContext, private assets: Assets, private scene: world.Scene) {
	}

	generate() {
		const scene = this.scene;
		const assets = this.assets;
		const pbrm = scene.pbrModelMgr;
		const ltm = scene.lightMgr;
		const rc = this.rc;
		const ac = this.ac;

		const sun = scene.makeEntity({
			light: {
				name: "sun",
				colour: [1, 1, 1],
				type: asset.LightType.Directional,
				intensity: .5,
			}
		});
		scene.lightMgr.setDirection(sun.light!, [1, -.4, -.7]);
		// const sun2 = scene.makeEntity({
		// 	light: {
		// 		name: "sun2",
		// 		colour: [1, 1, 1],
		// 		type: asset.LightType.Directional,
		// 		intensity: .5,
		// 	}
		// });
		// scene.lightMgr.setDirection(sun2.light!, [-1, -.4, 1]);

		const testObj = scene.makeEntity({
			transform: {
				position: [0, 0, 0],
				// scale: [.25, .25, .25]
			},
			mesh: {
				name: "test",
				meshData: assets.model.plants.mesh!.meshData
			},
			pbrModel: {
				materials: assets.model.plants.materials!,
				castsShadows: true
			}
		});

		return Promise.resolve();
	}
}
