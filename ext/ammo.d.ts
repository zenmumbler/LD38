declare namespace Ammo {

	export class btVector3 {
		constructor();
		constructor(x: number, y: number, z: number);

		x(): number;
		setX(x: number): void;
		y(): number;
		setY(y: number): void;
		z(): number;
		setZ(z: number): void;
		setValue(x: number, y: number, z: number): void;

		normalize(): void;
		length(): number;
		dot(v: btVector3): number;

		op_add(v: btVector3): btVector3;
		op_sub(v: btVector3): btVector3;
		op_mul(v: btVector3): btVector3;

		rotate(wAxis: btVector3, angle: number): btVector3;
	}

	export class btCollisionConfiguration {}

	export class btDefaultCollisionConfiguration extends btCollisionConfiguration {}

	export abstract class btDispatcher {}

	export class btCollisionDispatcher extends btDispatcher {
		constructor(c: btDefaultCollisionConfiguration);
	}

	export abstract class btBroadphaseInterface {}

	export class btAxisSweep3 extends btBroadphaseInterface {
		constructor(min: btVector3, max: btVector3);
	}


	export abstract class btConstraintSolver {}

	export class btSequentialImpulseConstraintSolver extends btConstraintSolver {}

	export abstract class ContactResultCallback {}
	export abstract class ConvexResultCallback {}
	export abstract class RayResultCallback {}

	export const enum CollisionFilterGroups {
		DefaultFilter = 1,
		StaticFilter = 2,
		KinematicFilter = 4,
		DebrisFilter = 8,
		SensorTrigger = 16,
		CharacterFilter = 32,
		AllFilter = -1
	}

	export abstract class btOverlappingPairCache {}

	export interface btDispatcherInfo {}

	export class btCollisionWorld {
		constructor(dispatcher: btDispatcher, broadphasePairCache: btBroadphaseInterface, collisionConfiguration: btCollisionConfiguration);

		contactPairTest(colObjA: btCollisionObject, colObjB: btCollisionObject, resultCallback: ContactResultCallback): void;
		contactTest(colObj: btCollisionObject, resultCallback: ContactResultCallback): void;
		convexSweepTest(castShape: btConvexShape, from: btTransform, to: btTransform, resultCallback: ConvexResultCallback, allowedCcdPenetration?: number): void;
		rayTest(rayFromWorld: btVector3, rayToWorld: btVector3, resultCallback: RayResultCallback): void;

		addCollisionObject(collisionObject: btCollisionObject, collisionFilterGroup?: CollisionFilterGroups, collisionFilterMask?: CollisionFilterGroups);

		getBroadphase(): btBroadphaseInterface;
		getDispatchInfo(): btDispatcherInfo;
		getDispatcher(): btDispatcher;
		getPairCache(): btOverlappingPairCache;
	}

	export interface btContactSolverInfo {}
	export abstract class btActionInterface {}
	export abstract class btTypedConstraint {}

	export abstract class btDynamicsWorld extends btCollisionWorld {
		addAction(action: btActionInterface): void;
		removeAction(action: btActionInterface): void;

		addConstraint(constraint: btTypedConstraint, disableCollisionsBetweenLinkedBodies?: boolean): void;
		removeConstraint(constraint: btTypedConstraint): void;

		addRigidBody(body: btRigidBody): void;
		addRigidBody(body: btRigidBody, group: number, mask: number): void;
		removeRigidBody(body: btRigidBody): void;

		getGravity(): btVector3;
		setGravity(gravity: btVector3): void;

		getSolverInfo(): btContactSolverInfo;

		stepSimulation (timeStep: number, maxSubSteps?: number, fixedTimeStep?: number): void;
	}

	export class btDiscreteDynamicsWorld extends btDynamicsWorld {
		constructor(a: btDispatcher, b: btBroadphaseInterface, c: btConstraintSolver, d: btCollisionConfiguration);
	}

	export class btCollisionShape {
		calculateLocalInertia(mass: number, inertia: btVector3): void;
		getMargin(): number;
		setMargin(collisionMargin: number): void;
		setLocalScaling(scaling: btVector3): void;
	}

	export class btConvexShape extends btCollisionShape {}
	export class btConcaveShape extends btCollisionShape {}

	export class btBoxShape extends btConvexShape {
		constructor(v: btVector3);
	}

	export class btSphereShape extends btConvexShape {
		constructor(radius: number);
	}

	export class btCapsuleShape extends btConvexShape {
		constructor(radius: number, height: number);
	}

	export class btCapsuleShapeX extends btCapsuleShape {
		constructor(radius: number, height: number);
	}

	export class btCapsuleShapeZ extends btCapsuleShape {
		constructor(radius: number, height: number);
	}


	export const enum CollisionFlags {
		CF_STATIC_OBJECT = 1,
		CF_KINEMATIC_OBJECT = 2,
		CF_NO_CONTACT_RESPONSE = 4,
		CF_CUSTOM_MATERIAL_CALLBACK = 8,
		CF_CHARACTER_OBJECT = 16,
		CF_DISABLE_VISUALIZE_OBJECT = 32,
		CF_DISABLE_SPU_COLLISION_PROCESSING = 64
	}

	export const enum AnisotropicFrictionFlags { 
		CF_ANISOTROPIC_FRICTION_DISABLED = 0,
		CF_ANISOTROPIC_FRICTION = 1,
		CF_ANISOTROPIC_ROLLING_FRICTION = 2
	}

	export const enum ActivationState {
		ACTIVE_TAG = 1,
		ISLAND_SLEEPING = 2,
		WANTS_DEACTIVATION = 3,
		DISABLE_DEACTIVATION = 4,
		DISABLE_SIMULATION = 5
	}

	export class btCollisionObject {
		activate(forceActivation = false): void;
		forceActivationState(newState: ActivationState): void;
		// getActivationState(): ActivationState;
		setActivationState(newState: ActivationState): void;

		getCollisionFlags(): CollisionFlags;
		setCollisionFlags(flags: CollisionFlags): void;
		getCollisionShape(): btCollisionShape;
		setCollisionShape(shape: CollisionShape): void;

		// getFriction(): number;
		setFriction(friction: number): void;
		// getRestitution(): number;
		setRestitution(rest: number): void;
		// getRollingFriction(): number;
		setRollingFriction(friction: number): void;

		// hasAnisotropicFriction(frictionMode: AnisotropicFrictionFlags): boolean;
		// getAnisotropicFriction(): btVector3;
		setAnisotropicFriction(anisotropicFriction: btVector3, frictionMode: AnisotropicFrictionFlags): void;

		getUserIndex(): number;
		setUserIndex(index: number): void;
		getUserPointer(): any;
		setUserPointer(userPointer: any): void;

		getWorldTransform(): btTransform;
		setWorldTransform(worldTrans: btTransform): void;

		isActive(): boolean;
		isKinematicObject(): boolean;

		// getCcdMotionThreshold(): number;
		setCcdMotionThreshold(ccdMotionThreshold: number): void;
		// getCcdSweptSphereRadius(): number;
		setCcdSweptSphereRadius(radius: number): void;
		// getContactProcessingThreshold(): number;
		setContactProcessingThreshold (contactProcessingThreshold: number): void;
	}

	export class btRigidBody extends btCollisionObject {
		constructor(info: btRigidBodyConstructionInfo);

		applyCentralForce(force: btVector3): void;
		applyCentralImpulse(impulse: btVector3): void;
		applyCentralLocalForce(localForce: btVector3): void;
		applyForce(force: btVector3, relPos: btVector3): void;
		applyImpulse(impulse: btVector3, relPos: btVector3): void;
		applyLocalTorque(torque: btVector3): void;
		applyTorque(torque: btVector3): void;
		applyTorqueImpulse(torque: btVector3): void;

		// getLinearFactor(): btVector3;
		setLinearFactor(linearFactor: btVector3): void;
		// getAngularFactor(): btVector3;
		setAngularFactor(angFac: number | btVector3): void;
		getAngularVelocity(): btVector3;
		setAngularVelocity(angVel: btVector3): void;
		getLinearVelocity(): btVector3;
		setLinearVelocity(linVel: btVector3): void;
		getCenterOfMassTransform(): btTransform;
		setCenterOfMassTransform(xform: btTransform): void;
		getMotionState(): btMotionState;
		setMotionState(motionState: btMotionState): void;
		setDamping(linearDamping: number, angularDamping: number): void;

		setMassProps(mass: number, inertia: btVector3): void;
		setSleepingThresholds(linear: number, angular: number): void;
		updateInertiaTensor(): void;

		upcast(colObj: btCollisionObject): btRigidBody; // static member in C++
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
		addTriangle(a: btVector3, b: btVector3, c: btVector3, removeDuplicateVertices?: boolean): void;
	}

	export class btBvhTriangleMeshShape extends btConcaveShape {
		constructor(meshInterface: btTriangleMesh, useQuantizedAabbCompression: boolean, buildBvh?: boolean);
	}

	export class btRigidBodyConstructionInfo {
		constructor(mass: number, motionState: btMotionState, shape: btCollisionShape, inertia: btVector3);
	}

	export abstract class btMotionState {
		getWorldTransform(worldTrans: btTransform);
 		setWorldTransform(worldTrans: btTransform);
	}

	export class btDefaultMotionState extends btMotionState {
		constructor(startTrans?: btTransform, centerOfMassOffset?: btTransform);
	}
}
