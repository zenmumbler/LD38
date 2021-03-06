// ????, a Ludum Dare 38 Entry
// (c) 2017 by Arthur Langereis (@zenmumbler)

/// <reference path="levelgen.ts" />

class PlayerViewAmmo {
	private pos_ = [0, 0, 0];
	private angleX_ = 0;
	private angleY_ = Math.PI;
	private rot_: sd.Float4;
	private dir_ = [0, 0, -1];
	private up_ = [0, 1, 0];
	private velocity_ = [0, 0, 0];
	private effectiveSpeed_ = 0;

	private shape_: Ammo.btCapsuleShapeZ;
	private rigidBody_: Ammo.btRigidBody;
	private tempBV3_: Ammo.btVector3;
	private tempTX_: Ammo.btTransform;
	readonly HEIGHT = 1.7;
	readonly MASS = 70;

	constructor(initialPos: sd.Float3, private physicsWorld_: Ammo.btDiscreteDynamicsWorld) {
		vec3.copy(this.pos_, initialPos);
		this.rotate([0, 0]);

		this.shape_ = new Ammo.btCapsuleShape(0.2, this.HEIGHT); // 60cm diameter
		const localInertia = new Ammo.btVector3(0, 0, 0);
		this.shape_.calculateLocalInertia(this.MASS, localInertia);

		const btTX = new Ammo.btTransform();
		btTX.setOrigin(new Ammo.btVector3(this.pos_[0], this.pos_[1] + 0.01, this.pos_[2]));
		btTX.setRotation(new Ammo.btQuaternion(this.rot_[0], this.rot_[1], this.rot_[2], this.rot_[3]));
		this.rigidBody_ = new Ammo.btRigidBody(
			new Ammo.btRigidBodyConstructionInfo(
				this.MASS,
				new Ammo.btDefaultMotionState(btTX),
				this.shape_,
				localInertia
			)
		);
		// this.rigidBody_.setCollisionFlags(this.rigidBody_.getCollisionFlags() | Ammo.CollisionFlags.CF_KINEMATIC_OBJECT);
		this.rigidBody_.setAngularFactor(new Ammo.btVector3(0, 1, 0));
		this.rigidBody_.setActivationState(Ammo.ActivationState.DISABLE_DEACTIVATION);
		this.physicsWorld_.addRigidBody(this.rigidBody_);

		this.tempBV3_ = new Ammo.btVector3();
		this.tempTX_ = new Ammo.btTransform();
	}

	rotate(localRelXY: sd.Float2) {
		this.angleX_ -= Math.PI * 1.3 * localRelXY[1];
		this.angleX_ = math.clamp(this.angleX_, -Math.PI * 0.3, Math.PI * 0.3);
		this.angleY_ += Math.PI * 1.8 * localRelXY[0];
		this.rot_ = quat.fromEuler(0, this.angleY_, this.angleX_);
		vec3.transformQuat(this.dir_, [0, 0, 1], this.rot_);
		vec3.normalize(this.dir_, this.dir_);
		vec3.transformQuat(this.up_, [0, 1, 0], this.rot_);
		vec3.normalize(this.up_, this.up_);
	}

	update(timeStep: number, acceleration: number, sideAccel: number) {
		const fwdXZ = vec3.normalize([], [this.dir_[0], 0, this.dir_[2]]);
		const rightXZ = vec3.cross([], fwdXZ, [0, 1, 0]);

		vec3.scaleAndAdd(this.velocity_, this.velocity_, fwdXZ, acceleration * timeStep);
		vec3.scaleAndAdd(this.velocity_, this.velocity_, rightXZ, sideAccel * timeStep);

		vec3.scale(this.velocity_, this.velocity_, 0.85);
		if (vec3.length(this.velocity_) < 0.001) {
			vec3.set(this.velocity_, 0, 0, 0);
		}

		const lv = this.rigidBody_.getLinearVelocity();
		this.tempBV3_.setValue(this.velocity_[0], lv.y(), this.velocity_[2]);
		this.rigidBody_.setLinearVelocity(this.tempBV3_);

		this.physicsWorld_.stepSimulation(timeStep, 2);

		const ms = this.rigidBody_.getMotionState();
		ms.getWorldTransform(this.tempTX_);
		const pos = this.tempTX_.getOrigin();
		// const rot = this.tempTX_.getRotation();
		this.pos_[0] = pos.x();
		this.pos_[1] = pos.y();
		this.pos_[2] = pos.z();

		if (io.keyboard.pressed(io.Key.SPACE)) {
			this.rigidBody_.applyCentralForce(new Ammo.btVector3(0, 20000, 0));
		}

		// const newVel = this.rigidBody_.getLinearVelocity();
		// this.velocity_[0] = newVel.x();
		// this.velocity_[1] = newVel.y();
		// this.velocity_[2] = newVel.z();

		// this.effectiveSpeed_ = vec3.length(this.velocity_);
	}

	// step(timeStep: number, accel: number, sideForce: number) {
	// 	const fwdXZ = vec3.normalize([], [this.dir_[0], 0, this.dir_[2]]);
	// 	const rightXZ = vec3.cross([], fwdXZ, [0, 1, 0]);

	// 	vec3.scale(fwdXZ, fwdXZ, force);
	// 	vec3.scale(rightXZ, rightXZ, force);

	// 	const lv = this.rigidBody_.getLinearVelocity();
	// 	this.tempBV3_.setValue(fwdXZ[0], lv.y(), fwdXZ[2]);
	// 	this.rigidBody_.setLinearVelocity(this.tempBV3_);

	// 	this.physicsWorld_.stepSimulation(timeStep, 2);

	// 	const ms = this.rigidBody_.getMotionState();
	// 	ms.getWorldTransform(this.tempTX_);
	// 	const pos = this.tempTX_.getOrigin();
	// 	// const rot = this.tempTX_.getRotation();
	// 	this.pos_[0] = pos.x();
	// 	this.pos_[1] = pos.y();
	// 	this.pos_[2] = pos.z();
	// }

	get pos() { return this.pos_; }
	get posXZ() { return [this.pos_[0], this.pos_[2]]; }
	get dir() { return this.dir_; }
	get dirXZ() { return [this.dir_[0], this.dir_[2]]; }
	get rotation() { return this.rot_; }
	get moving() { return false; }
	get focusPos() { return vec3.add([], this.pos_, this.dir_); }
	get viewMatrix() {
		return mat4.lookAt([],
			[this.pos_[0], this.pos_[1] + 0.2, this.pos_[2]],
			[this.focusPos[0], this.focusPos[1] + 0.2, this.focusPos[2]],
			this.up_
		);
	}
}


const enum KeyboardType {
	QWERTY,
	QWERTZ,
	AZERTY
}


const enum KeyCommand {
	Forward,
	Backward,
	Left,
	Right,
	Interact
}


class PlayerController {
	view: PlayerViewAmmo;
	private vpWidth_: number;
	private vpHeight_: number;
	private tracking_ = false;
	private lastPos_ = [0, 0];
	private keyboardType_ = KeyboardType.QWERTY;

	constructor(sensingElem: HTMLElement, initialPos: sd.Float3, private scene: world.Scene, private level: Level, private sfx: Sound) {
		this.view = new PlayerViewAmmo(initialPos, level.physicsWorld);

		this.vpWidth_ = sensingElem.offsetWidth;
		this.vpHeight_ = sensingElem.offsetHeight;

		// -- mouse based rotation
		dom.on(sensingElem, "mousedown", (evt: MouseEvent) => {
			this.tracking_ = true;
			this.lastPos_ = [evt.clientX, evt.clientY];
		});

		dom.on(window, "mousemove", (evt: MouseEvent) => {
			if ((document.pointerLockElement === null) && (!this.tracking_)) {
				return;
			}
			const newPos = [evt.clientX, evt.clientY];
			const delta = document.pointerLockElement ? [evt.movementX, evt.movementY] : vec2.sub([], newPos, this.lastPos_);
			vec2.divide(delta, delta, [-this.vpWidth_, -this.vpHeight_]);
			vec2.scale(delta, delta, document.pointerLockElement ? .5 : 1);
			this.lastPos_ = newPos;

			this.view.rotate(delta);
		});

		dom.on(window, "mouseup", (evt: MouseEvent) => {
			this.tracking_ = false;
		});
	}


	private keyForKeyCommand(cmd: KeyCommand): io.Key {
		let keys: io.Key[] | undefined;
		switch (cmd) {
			case KeyCommand.Forward:
				keys = [io.Key.W, io.Key.W, io.Key.Z];
				break;
			case KeyCommand.Backward:
				keys = [io.Key.S, io.Key.S, io.Key.S];
				break;
			case KeyCommand.Left:
				keys = [io.Key.A, io.Key.A, io.Key.Q];
				break;
			case KeyCommand.Right:
				keys = [io.Key.D, io.Key.D, io.Key.D];
				break;
			case KeyCommand.Interact:
				keys = [io.Key.E, io.Key.E, io.Key.E];
				break;
		}

		return keys ? keys[this.keyboardType_] : 0;
	}


	private stepSoundTimer_ = -1;

	handleStepSounds() {
		if (this.view.moving) {
			if (this.stepSoundTimer_ == -1) {
				this.stepSoundTimer_ = setInterval(() => { this.sfx.play(SFX.FootStep); }, 500);
			}
		}
		else {
			if (this.stepSoundTimer_ > -1) {
				clearInterval(this.stepSoundTimer_);
				this.stepSoundTimer_ = -1;
			}
		}
	}

	step(timeStep: number) {
		const maxAccel = 40;
		var accel = 0, sideAccel = 0;

		if (io.keyboard.down(io.Key.UP) || io.keyboard.down(this.keyForKeyCommand(KeyCommand.Forward))) {
			accel = maxAccel;
		}
		else if (io.keyboard.down(io.Key.DOWN) || io.keyboard.down(this.keyForKeyCommand(KeyCommand.Backward))) {
			accel = -maxAccel;
		}
		if (io.keyboard.down(io.Key.LEFT) || io.keyboard.down(this.keyForKeyCommand(KeyCommand.Left))) {
			sideAccel = -maxAccel;
		}
		else if (io.keyboard.down(io.Key.RIGHT) || io.keyboard.down(this.keyForKeyCommand(KeyCommand.Right))) {
			sideAccel = maxAccel;
		}

		this.view.update(timeStep, accel, sideAccel);

		this.handleStepSounds();
	}
}
