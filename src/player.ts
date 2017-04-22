// ????, a Ludum Dare 38 Entry
// (c) 2017 by Arthur Langereis (@zenmumbler)

/// <reference path="levelgen.ts" />

type ContactPoints = number[][];

function intersectCircleLineSeg(C: sd.ConstFloat2, r: number, line: LineSeg): ContactPoints | null {
	const E = [line[0], line[1]];
	const L = [line[2], line[3]];
	const d = vec2.sub([], L, E);
	const f = vec2.sub([], E, C);
	const a = vec2.dot(d, d);
	const b = 2 * vec2.dot(f, d);
	const c = vec2.dot(f, f) - r * r;

	let discriminant = b * b - 4 * a * c;
	if (discriminant < 0) {
		// no intersection
		return null;
	}
	else {
		const result: ContactPoints = [];
		// ray didn't totally miss sphere,
		// so there is a solution to
		// the equation.
		discriminant = Math.sqrt(discriminant);

		// either solution may be on or off the ray so need to test both
		// t1 is always the smaller value, because BOTH discriminant and
		// a are nonnegative.
		const t1 = (-b - discriminant) / (2 * a);
		const t2 = (-b + discriminant) / (2 * a);

		// 3x HIT cases:
		//          -o->             --|-->  |            |  --|->
		// Impale(t1 hit,t2 hit), Poke(t1 hit,t2>1), ExitWound(t1<0, t2 hit),

		// 3x MISS cases:
		//       ->  o                     o ->              | -> |
		// FallShort (t1>1,t2>1), Past (t1<0,t2<0), CompletelyInside(t1<0, t2>1)

		if (t1 >= 0 && t1 <= 1) {
			// t1 is the intersection, and it's closer than t2
			// (since t1 uses -b - discriminant)
			// Impale, Poke

			result.push(vec2.scaleAndAdd([], E, d, t1));
		}

		// here t1 didn't intersect so we are either started
		// inside the sphere or completely past it
		if (t2 >= 0 && t2 <= 1) {
			// ExitWound
			result.push(vec2.scaleAndAdd([], E, d, t2));
		}

		// no intn: FallShort, Past, CompletelyInside
		return result.length === 0 ? null : result;
	}
}


class PlayerView {
	private pos_ = [0, 0, 0];
	private angleX_ = 0;
	private angleY_ = Math.PI;
	private rot_: sd.Float4;
	private dir_ = [0, 0, -1];
	private up_ = [0, 1, 0];
	private velocity_ = [0, 0, 0];
	private effectiveSpeed_ = 0;

	constructor(initialPos: sd.Float3, private clipLines: LineSeg[]) {
		vec3.copy(this.pos_, initialPos);
		this.rotate([0, 0]);
	}

	private clipMovement(a: sd.Float3, b: sd.Float3): sd.Float3 {
		const posXZ = [b[0], b[2]];
		for (const cl of this.clipLines) {
			const ip = intersectCircleLineSeg(posXZ, .25, cl);
			if (ip) {
				if (ip.length == 2) {
					const center = vec2.lerp([], ip[0], ip[1], .5);
					const pdir = vec2.sub([], posXZ, center);
					const pen = .25 / vec2.length(pdir);
					vec2.scaleAndAdd(posXZ, posXZ, pdir, pen - 1);
				}
			}
		}

		// reconstruct 3d pos
		return [posXZ[0], b[1], posXZ[1]];
	}

	update(timeStep: number, acceleration: number, sideAccel: number) {
		const fwdXZ = vec3.normalize([], [this.dir_[0], 0, this.dir_[2]]);
		const rightXZ = vec3.cross([], fwdXZ, [0, 1, 0]);

		vec3.scaleAndAdd(this.velocity_, this.velocity_, fwdXZ, acceleration * timeStep);
		vec3.scaleAndAdd(this.velocity_, this.velocity_, rightXZ, sideAccel * timeStep);

		if (vec3.length(this.velocity_) >= 0.001) {
			const targetPos = vec3.add([], this.pos_, this.velocity_);
			const clippedPos = this.clipMovement(this.pos, targetPos);
			vec3.sub(this.velocity_, clippedPos, this.pos_);
			vec3.copy(this.pos_, clippedPos);

			this.effectiveSpeed_ = vec3.length(this.velocity_);
		}

		vec3.scale(this.velocity_, this.velocity_, 0.85);
		if (vec3.length(this.velocity_) < 0.001) {
			vec3.set(this.velocity_, 0, 0, 0);
			this.effectiveSpeed_ = 0;
		}
	}

	rotate(localRelXY: sd.Float2) {
		this.angleX_ -= Math.PI * 1.3 * localRelXY[1];
		this.angleX_ = math.clamp(this.angleX_, -Math.PI * 0.27, Math.PI * 0.21);
		this.angleY_ += Math.PI * 1.8 * localRelXY[0];
		this.rot_ = quat.fromEuler(0, this.angleY_, this.angleX_);
		vec3.transformQuat(this.dir_, [0, 0, 1], this.rot_);
		vec3.normalize(this.dir_, this.dir_);
		vec3.transformQuat(this.up_, [0, 1, 0], this.rot_);
		vec3.normalize(this.up_, this.up_);
	}

	get pos() { return this.pos_; }
	get posXZ() { return [this.pos_[0], this.pos_[2]]; }
	get dir() { return this.dir_; }
	get dirXZ() { return [this.dir_[0], this.dir_[2]]; }
	get rotation() { return this.rot_; }
	get effectiveSpeed() { return this.effectiveSpeed_; }
	get focusPos() { return vec3.add([], this.pos_, this.dir_); }
	get viewMatrix() { return mat4.lookAt([], this.pos_, this.focusPos, this.up_); }
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
	view: PlayerView;
	private vpWidth_: number;
	private vpHeight_: number;
	private tracking_ = false;
	private lastPos_ = [0, 0];
	private keyboardType_ = KeyboardType.QWERTY;

	constructor(sensingElem: HTMLElement, initialPos: sd.Float3, private scene: world.Scene, private level: Level, private sfx: Sound) {
		this.view = new PlayerView(initialPos, level.clipLines);

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
		if (this.view.effectiveSpeed > 0.01) {
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
		const maxAccel = 0.66;
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
