declare namespace Ammo {

	export class btDefaultCollisionConfiguration {}

	export class btCollisionDispatcher {
		constructor(c: btDefaultCollisionConfiguration);
	}

	export class btVector3 {
		x(): number;
		y(): number;
		z(): number;
		constructor(x: number, y: number, z: number);
	}

	export class btAxisSweep3 {
		constructor(min: btVector3, max: btVector3);
	}

	export class btSequentialImpulseConstraintSolver {}

	export class btDiscreteDynamicsWorld {
		constructor(a: btCollisionDispatcher, b: btAxisSweep3, c: btSequentialImpulseConstraintSolver, d: btDefaultCollisionConfiguration);
		setGravity(v: btVector3);
		addRigidBody(b: btRigidBody);
		stepSimulation(n1: number, n2: number);
	}

	export class btCollisionShape {
		calculateLocalInertia(mass: number, inertia: btVector3);
		getMargin(): number;
		setMargin(collisionMargin: number): void;
		setLocalScaling(scaling: btVector3): void;
	}

	export class btConvexShape extends btCollisionShape {
	}

	export class btConcaveShape extends btCollisionShape {
	}

	export class btBoxShape extends btConvexShape {
		constructor(v: btVector3);
	}

	export class btSphereShape extends btConvexShape {
		constructor(radius: number);
	}

	export class btRigidBody {
		constructor(info: btRigidBodyConstructionInfo);
		setActivationState(s: number);
	}

	export class btQuaternion {
		constructor(x: number, y: number, z: number, w: number);
		x(): number;
		y(): number;
		z(): number;
		w(): number;
	}

	export class btTransform {
		setIdentity(): void;
		setOrigin(v: btVector3): void;
		getOrigin(): btVector3;
		setRotation(q: btQuaternion): void;
		getRotation(): btQuaternion;
	}

	export class btTriangleMesh {
		constructor(use32bitIndices = true, use4componentVertices = true);
		addTriangle(a: btVector3, b: btVector3, c: btVector3, removeDuplicateVertices = false): void;
	}

	export class btBvhTriangleMeshShape extends btConcaveShape {
		constructor(meshInterface: btTriangleMesh, useQuantizedAabbCompression: boolean, buildBvh = true);
	}

	export class btRigidBodyConstructionInfo {
		constructor(mass: number, motionState: btDefaultMotionState, shape: btCollisionShape, inertia: btVector3);
	}

	export class btDefaultMotionState {
		constructor(t: btTransform);
	}
}
