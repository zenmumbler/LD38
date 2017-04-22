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

		const roomLight = scene.makeEntity({
			transform: {
				position: [2.5, 2.2, -2.5]
			},
			light: {
				name: "bulb",
				colour: [1, 1, 1],
				type: asset.LightType.Point,
				intensity: .5,
				range: 4,
			}
		});

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
