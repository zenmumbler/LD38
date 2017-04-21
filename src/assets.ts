// ????, a Ludum Dare 38 Entry
// (c) 2017 by Arthur Langereis (@zenmumbler)

interface SoundAssets {
	xxx: AudioBuffer;
}

interface MaterialAssets {
	whiteness: asset.Material;
}

interface TextureAssets {
	envCubeSpace: render.Texture;
	reflectCubeSpace: render.Texture;
}

interface Assets {
	sound: SoundAssets;
	mat: MaterialAssets;
	tex: TextureAssets;
}

function loadAllAssets(rc: render.RenderContext, ac: audio.AudioContext, meshMgr: world.MeshManager, progress: (ratio: number) => void) {
	const a = { mat: {}, sound: {}, tex: {} } as Assets;

	var totalAssets = 1, assetsLoaded = 0;
	const loaded = (n = 1) => {
		assetsLoaded += n;
		progress(assetsLoaded / totalAssets);
	};

	function localURL(path: string) {
		return new URL(path, document.baseURI!);
	}

	function loadLocalMTL<K extends keyof MaterialAssets>(path: string, ks: K[]) {
		return asset.loadMTLFile(localURL(path)).then(ag => {
			loaded();
			for (const mat of ag.materials) {
				if (ks.indexOf(<any>mat.name) > -1) {
					a.mat[mat.name as K] = <any>mat;
				}
			}
			totalAssets += ag.textures.length;
			return asset.resolveTextures(rc, ag.textures).then(tex => {
				loaded(tex.length);
			});
		});
	}

	function loadEnvCubeTex<K extends keyof TextureAssets>(dirPath: string, k: K) {
		render.loadCubeTexture(rc, render.makeCubeMapPaths(dirPath, ".jpg")).then(texture => {
			loaded();
			a.tex[k] = <any>texture;
		});
	}

	function makeReflectionMap<K extends keyof TextureAssets>(k1: K, k2: K) {
		const envTexture = render.prefilteredEnvMap(rc, meshMgr, <any>a.tex[k1] as render.Texture, 256);
		a.tex[k2] = <any>envTexture;
	}

	const stuff: Promise<void>[] = [
		// asset.loadSoundFile(ac, "data/sound/some_sound.mp3").then(buf => { a.sound.xxx = buf; loaded(); }),

		// loadLocalMTL("data/mat/somemat.mtl", ["xxx"]),

		// loadEnvCubeTex("data/mat/galaxy/galaxy-", "envCubeSpace")
	];
	totalAssets = stuff.length;

	return Promise.all(stuff).then(() => {
		makeReflectionMap("envCubeSpace", "reflectCubeSpace");

		a.mat.whiteness = asset.makeMaterial("whiteness");
		a.mat.whiteness.roughness = .8;

		return a;
	});
}
