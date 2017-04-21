// ????, a Ludum Dare 38 Entry
// (c) 2017 by Arthur Langereis — @zenmumbler

const enum SFX {
	FootStep,
}


const enum Music {
	None,
	Main,
	End
}


class Sound {
	private assets_: SoundAssets;
	private ctx: NativeAudioContext;

	private endMusic_ = false;

	private stepGain: GainNode;
	private musicGain: GainNode;
	private effectGain: GainNode;

	private stepSource: AudioBufferSourceNode | null = null;
	private musicSource: AudioBufferSourceNode | null = null;
	private effectSource: AudioBufferSourceNode | null = null;

	private stepToggle = 0;

	constructor(private ac: audio.AudioContext) {
		const ctx = this.ctx = ac.ctx;

		this.stepGain = ctx.createGain();
		this.musicGain = ctx.createGain();
		this.effectGain = ctx.createGain();

		this.stepGain.connect(ac.ctx.destination);
		this.musicGain.connect(ac.ctx.destination);
		this.effectGain.connect(ac.ctx.destination);
	}


	setAssets(assets: SoundAssets) {
		this.assets_ = assets;
	}


	startMusic() {
		if (! this.musicSource) {
			this.musicSource = this.ac.ctx.createBufferSource();
			this.musicSource.buffer = this.endMusic_ ? this.assets_.xxx : this.assets_.xxx;
			this.musicSource.loop = !this.endMusic_;
			this.musicSource.connect(this.musicGain);
			this.musicGain.gain.value = 0.7;

			this.musicSource.start(0);
		}
	}

	stopMusic() {
		if (this.endMusic_) {
			return;
		}
		if (this.musicSource) {
			this.musicSource.stop();
			this.musicSource = null;
		}
	}


	setEndMusic() {
		this.endMusic_ = true;
	}


	play(what: SFX) {
		var assets = this.assets_;
		if (! this.ac) {
			return;
		}

		var buffer: AudioBuffer | null = null;
		var source: AudioBufferSourceNode | null = null;
		var gain: GainNode | null = null;
		var volume = 0;
		var rate: number | null = null;

		switch (what) {
			// case SFX.FootStep: buffer = assets.steps[this.stepToggle]; source = this.stepSource; gain = this.stepGain; volume = .5; rate = .85; this.stepToggle ^= 1; break;
			case SFX.FootStep: buffer = assets.xxx; source = this.effectSource; gain = this.effectGain; volume = .5; rate = 1.0; break;

			default: buffer = null;
		}

		if (! buffer || ! gain) {
			return;
		}
		if (source) {
			source.stop();
		}

		var bufferSource: AudioBufferSourceNode | null = this.ac.ctx.createBufferSource();
		bufferSource.buffer = buffer;
		bufferSource.connect(gain);
		if (rate !== null) {
			bufferSource.playbackRate.value = rate;
		}
		bufferSource.start(0);
		gain.gain.value = volume;

		if (what === SFX.FootStep) {
			this.stepSource = bufferSource;
		}
		else {
			this.effectSource = bufferSource;
		}

		bufferSource.onended = () => {
			if (this.effectSource === bufferSource) {
				this.effectSource = null;
			}
			else if (this.stepSource === bufferSource) {
				this.stepSource = null;
			}

			bufferSource!.disconnect();
			bufferSource = null;
		};

	}
}
