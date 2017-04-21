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
				colour: [.5, .5, .9],
				type: asset.LightType.Directional,
				intensity: .16,
			}
		});
		scene.lightMgr.setDirection(sun.light!, [.2, -1, -.4]);

		const testObj = scene.makeEntity({
			transform: {
				position: [0, .5, -3]
			},
			mesh: {
				name: "test",
				meshData: meshdata.gen.generate(new meshdata.gen.Box(meshdata.gen.cubeDescriptor(1)))
			},
			pbrModel: {
				materials: [assets.mat.whiteness],
				castsShadows: true
			}
		});

		return Promise.resolve();
	}
}
