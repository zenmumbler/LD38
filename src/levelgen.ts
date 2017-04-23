// ????, a Ludum Dare 38 Entry
// (c) 2017 by Arthur Langereis (@zenmumbler)

function srgb8Color(r: number, g: number, b: number) {
	return [Math.pow(r / 255, 2.2), Math.pow(g / 255, 2.2), Math.pow(b / 255, 2.2)];
}

type LineSeg = sd.Float4;

class Level {
	clipLines: LineSeg[] = [];
	physicsWorld: Ammo.btDiscreteDynamicsWorld;

	constructor(private rc: render.RenderContext, private ac: audio.AudioContext, private assets: Assets, private scene: world.Scene) {
		(Ammo as any)().then(() => {
			// init Ammo
			const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
			const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
			const overlappingPairCache = new Ammo.btAxisSweep3(new Ammo.btVector3(-100,-100,-100), new Ammo.btVector3(100,100,100));
			const solver = new Ammo.btSequentialImpulseConstraintSolver();

			this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
			this.physicsWorld.setGravity( new Ammo.btVector3(0, -9.8, 0));
		});
	}

	createMeshShape(vertexBuffer: meshdata.VertexBuffer, indexBuffer: meshdata.IndexBuffer) {
		const posAttr = vertexBuffer.attrByRole(meshdata.VertexAttributeRole.Position)!;
		const posView = new meshdata.VertexBufferAttributeView(vertexBuffer, posAttr);
		const triView = new meshdata.IndexBufferTriangleView(indexBuffer);

		const vertexCount = posView.count;
		const baseVertex = posView.baseVertex;

		const collMesh = new Ammo.btTriangleMesh();

		triView.forEach((face: meshdata.TriangleProxy) => {
			const posA = posView.copyItem(face.a() - baseVertex);
			const posB = posView.copyItem(face.b() - baseVertex);
			const posC = posView.copyItem(face.c() - baseVertex);

			collMesh.addTriangle(
				new Ammo.btVector3(posA[0], posA[1], posA[2]),
				new Ammo.btVector3(posB[0], posB[1], posB[2]),
				new Ammo.btVector3(posC[0], posC[1], posC[2])
			);
		});

		return new Ammo.btBvhTriangleMeshShape(collMesh, true, true);
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
				position: [3, 2.2, -6]
			},
			light: {
				name: "bulb",
				colour: [1, 1, 1],
				type: asset.LightType.Point,
				intensity: .5,
				range: 4,
			}
		});
		scene.makeEntity({
			transform: {
				position: [16, 2.2, -14]
			},
			light: {
				name: "bulb",
				colour: [1, 1, 1],
				type: asset.LightType.Point,
				intensity: .5,
				range: 4,
			}
		});
		scene.makeEntity({
			transform: {
				position: [30, 2.2, -3]
			},
			light: {
				name: "bulb",
				colour: [1, 1, 1],
				type: asset.LightType.Point,
				intensity: .5,
				range: 4,
			}
		});
		scene.makeEntity({
			transform: {
				position: [7, 2.2, -11]
			},
			light: {
				name: "bulb",
				colour: [1, 1, 1],
				type: asset.LightType.Point,
				intensity: .5,
				range: 4,
			}
		});

		const levelModel = assets.model.plants;
		const testObj = scene.makeEntity({
			transform: {
				position: [0, 0, 0],
				// scale: [.25, .25, .25]
			},
			mesh: {
				name: "test",
				meshData: levelModel.mesh!.meshData
			},
			pbrModel: {
				materials: levelModel.materials!,
				castsShadows: true
			}
		});

		const levelVB = levelModel.mesh!.meshData.vertexBuffers[0];
		const levelIB = levelModel.mesh!.meshData.indexBuffer!;
		const levelCollShape = this.createMeshShape(levelVB, levelIB);

		const levelTransform = new Ammo.btTransform();
		levelTransform.setIdentity();
		const body = new Ammo.btRigidBody(
			new Ammo.btRigidBodyConstructionInfo(
				0,
				new Ammo.btDefaultMotionState(levelTransform),
				levelCollShape,
				new Ammo.btVector3(0, 0, 0)
			)
		);
		this.physicsWorld.addRigidBody(body);

		return Promise.resolve();
	}
}
