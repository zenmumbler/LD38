"use strict";
function loadAllAssets(rc, ac, meshMgr, progress) {
    var a = { mat: {}, sound: {}, tex: {} };
    var totalAssets = 1, assetsLoaded = 0;
    var loaded = function (n) {
        if (n === void 0) { n = 1; }
        assetsLoaded += n;
        progress(assetsLoaded / totalAssets);
    };
    function localURL(path) {
        return new URL(path, document.baseURI);
    }
    function loadLocalMTL(path, ks) {
        return asset.loadMTLFile(localURL(path)).then(function (ag) {
            loaded();
            for (var _i = 0, _a = ag.materials; _i < _a.length; _i++) {
                var mat = _a[_i];
                if (ks.indexOf(mat.name) > -1) {
                    a.mat[mat.name] = mat;
                }
            }
            totalAssets += ag.textures.length;
            return asset.resolveTextures(rc, ag.textures).then(function (tex) {
                loaded(tex.length);
            });
        });
    }
    function loadEnvCubeTex(dirPath, k) {
        render.loadCubeTexture(rc, render.makeCubeMapPaths(dirPath, ".jpg")).then(function (texture) {
            loaded();
            a.tex[k] = texture;
        });
    }
    function makeReflectionMap(k1, k2) {
        var envTexture = render.prefilteredEnvMap(rc, meshMgr, a.tex[k1], 256);
        a.tex[k2] = envTexture;
    }
    var stuff = [];
    totalAssets = stuff.length;
    return Promise.all(stuff).then(function () {
        makeReflectionMap("envCubeSpace", "reflectCubeSpace");
        a.mat.whiteness = asset.makeMaterial("whiteness");
        a.mat.whiteness.roughness = .8;
        return a;
    });
}
"use strict";
function srgb8Color(r, g, b) {
    return [Math.pow(r / 255, 2.2), Math.pow(g / 255, 2.2), Math.pow(b / 255, 2.2)];
}
var Level = (function () {
    function Level(rc, ac, assets, scene) {
        this.rc = rc;
        this.ac = ac;
        this.assets = assets;
        this.scene = scene;
        this.clipLines = [];
    }
    Level.prototype.generate = function () {
        var scene = this.scene;
        var assets = this.assets;
        var pbrm = scene.pbrModelMgr;
        var ltm = scene.lightMgr;
        var rc = this.rc;
        var ac = this.ac;
        var sun = scene.makeEntity({
            light: {
                name: "sun",
                colour: [.5, .5, .9],
                type: 1,
                intensity: .16,
            }
        });
        scene.lightMgr.setDirection(sun.light, [.2, -1, -.4]);
        var testObj = scene.makeEntity({
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
    };
    return Level;
}());
"use strict";
var Sound = (function () {
    function Sound(ac) {
        this.ac = ac;
        this.endMusic_ = false;
        this.stepSource = null;
        this.musicSource = null;
        this.effectSource = null;
        this.stepToggle = 0;
        var ctx = this.ctx = ac.ctx;
        this.stepGain = ctx.createGain();
        this.musicGain = ctx.createGain();
        this.effectGain = ctx.createGain();
        this.stepGain.connect(ac.ctx.destination);
        this.musicGain.connect(ac.ctx.destination);
        this.effectGain.connect(ac.ctx.destination);
    }
    Sound.prototype.setAssets = function (assets) {
        this.assets_ = assets;
    };
    Sound.prototype.startMusic = function () {
        if (!this.musicSource) {
            this.musicSource = this.ac.ctx.createBufferSource();
            this.musicSource.buffer = this.endMusic_ ? this.assets_.xxx : this.assets_.xxx;
            this.musicSource.loop = !this.endMusic_;
            this.musicSource.connect(this.musicGain);
            this.musicGain.gain.value = 0.7;
            this.musicSource.start(0);
        }
    };
    Sound.prototype.stopMusic = function () {
        if (this.endMusic_) {
            return;
        }
        if (this.musicSource) {
            this.musicSource.stop();
            this.musicSource = null;
        }
    };
    Sound.prototype.setEndMusic = function () {
        this.endMusic_ = true;
    };
    Sound.prototype.play = function (what) {
        var _this = this;
        var assets = this.assets_;
        if (!this.ac) {
            return;
        }
        var buffer = null;
        var source = null;
        var gain = null;
        var volume = 0;
        var rate = null;
        switch (what) {
            case 0:
                buffer = assets.xxx;
                source = this.effectSource;
                gain = this.effectGain;
                volume = .5;
                rate = 1.0;
                break;
            default: buffer = null;
        }
        if (!buffer || !gain) {
            return;
        }
        if (source) {
            source.stop();
        }
        var bufferSource = this.ac.ctx.createBufferSource();
        bufferSource.buffer = buffer;
        bufferSource.connect(gain);
        if (rate !== null) {
            bufferSource.playbackRate.value = rate;
        }
        bufferSource.start(0);
        gain.gain.value = volume;
        if (what === 0) {
            this.stepSource = bufferSource;
        }
        else {
            this.effectSource = bufferSource;
        }
        bufferSource.onended = function () {
            if (_this.effectSource === bufferSource) {
                _this.effectSource = null;
            }
            else if (_this.stepSource === bufferSource) {
                _this.stepSource = null;
            }
            bufferSource.disconnect();
            bufferSource = null;
        };
    };
    return Sound;
}());
"use strict";
var io = sd.io;
var math = sd.math;
var world = sd.world;
var render = sd.render;
var meshdata = sd.meshdata;
var dom = sd.dom;
var asset = sd.asset;
var container = sd.container;
var audio = sd.audio;
var vec2 = veclib.vec2;
var vec3 = veclib.vec3;
var vec4 = veclib.vec4;
var quat = veclib.quat;
var mat2 = veclib.mat2;
var mat3 = veclib.mat3;
var mat4 = veclib.mat4;
function makeFSQPipeline(rc) {
    var pfp = {};
    var vertexSource = "\n\t\tattribute vec2 vertexPos_model;\n\t\tvarying vec2 vertexUV_intp;\n\t\tvoid main() {\n\t\t\tgl_Position = vec4(vertexPos_model, 0.5, 1.0);\n\t\t\tvertexUV_intp = vertexPos_model * 0.5 + 0.5;\n\t\t}\n\t".trim();
    var fragmentSource = "\n\t\tprecision highp float;\n\t\tvarying vec2 vertexUV_intp;\n\t\tuniform sampler2D texSampler;\n\t\tvoid main() {\n\t\t\tvec3 texColor = texture2D(texSampler, vertexUV_intp).xyz;\n\t\t\tgl_FragColor = vec4(texColor, 1.0);\n\t\t}\n\t".trim();
    var pld = render.makePipelineDescriptor();
    pld.vertexShader = render.makeShader(rc, rc.gl.VERTEX_SHADER, vertexSource);
    pld.fragmentShader = render.makeShader(rc, rc.gl.FRAGMENT_SHADER, fragmentSource);
    pld.attributeNames.set(1, "vertexPos_model");
    pfp.pipeline = new render.Pipeline(rc, pld);
    pfp.texUniform = rc.gl.getUniformLocation(pfp.pipeline.program, "texSampler");
    pfp.pipeline.bind();
    rc.gl.uniform1i(pfp.texUniform, 0);
    pfp.pipeline.unbind();
    return pfp;
}
function drawFSQ(rc, meshMgr, tex, p, m) {
    var rpd = render.makeRenderPassDescriptor();
    rpd.clearMask = 1;
    render.runRenderPass(rc, meshMgr, rpd, null, function (rp) {
        rp.setPipeline(p.pipeline);
        rp.setTexture(tex, 0);
        rp.setMesh(m);
        rp.setDepthTest(0);
        var primGroup0 = meshMgr.primitiveGroups(m)[0];
        rp.drawIndexedPrimitives(primGroup0.type, meshMgr.indexBufferElementType(m), 0, primGroup0.elementCount);
    });
}
var MainScene = (function () {
    function MainScene(rc, ac) {
        var _this = this;
        this.rc = rc;
        this.ac = ac;
        this.mode_ = 0;
        this.fullQuad = 0;
        this.SHADOW = true;
        this.SHADQUAD = false;
        this.antialias = false;
        this.scene_ = new world.Scene(rc);
        this.sfx_ = new Sound(ac);
        this.setMode(1);
        var progress = function (ratio) {
            dom.$1(".progress").style.width = (ratio * 100) + "%";
        };
        loadAllAssets(rc, ac, this.scene_.meshMgr, progress).then(function (assets) {
            _this.assets_ = assets;
            _this.sfx_.setAssets(assets.sound);
            console.info("ASSETS", assets);
            _this.makeSkybox();
            _this.level_ = new Level(rc, ac, assets, _this.scene_);
            _this.level_.generate().then(function () {
                _this.setMode(4);
                dom.on(dom.$("input[type=\"radio\"]"), "click", function (evt) {
                    var radio = evt.target;
                    if (radio.checked) {
                        var vpsSize = radio.dataset["vps"] || "hdready";
                        var holder = dom.$1(".stageholder");
                        holder.className = "stageholder " + vpsSize;
                        var canvas = rc.gl.canvas;
                        canvas.width = { small: 960, hdready: 1280, fullhd: 1920 }[vpsSize];
                        canvas.height = { small: 540, hdready: 720, fullhd: 1080 }[vpsSize];
                        if (_this.mainFBO) {
                            rc.gl.deleteFramebuffer(_this.mainFBO.resource);
                            _this.mainFBO = undefined;
                        }
                    }
                });
                dom.on("#fullscreen", "click", function () {
                    if (_this.mode_ == 4) {
                        var canvas = dom.$1(".stageholder");
                        canvas.requestPointerLock();
                        (canvas.requestFullscreen || canvas.webkitRequestFullscreen || canvas.mozRequestFullScreen).call(canvas);
                    }
                });
                var fsch = function () {
                    var canvas = dom.$1(".stageholder");
                    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement) {
                        var scaleFactor_1 = Math.min(screen.width / rc.gl.drawingBufferWidth, screen.height / rc.gl.drawingBufferHeight);
                        if (document.mozFullScreenElement) {
                            canvas.requestPointerLock();
                            var hOffset_1 = Math.round((screen.width - rc.gl.drawingBufferWidth) / (2 * scaleFactor_1)) + "px";
                            var vOffset_1 = Math.round((screen.height - rc.gl.drawingBufferHeight) / (2 * scaleFactor_1)) + "px";
                            dom.$(".stageholder > *").forEach(function (e) {
                                e.style.transform = "scale(" + scaleFactor_1 + ") translate(" + hOffset_1 + ", " + vOffset_1 + ")";
                            });
                        }
                        else {
                            var vOffset = "-13px";
                            canvas.style.transform = "scale(" + scaleFactor_1 + ") translate(0, " + vOffset + ")";
                        }
                    }
                    else {
                        canvas.style.transform = "";
                        dom.$(".stageholder > *").forEach(function (e) {
                            e.style.transform = "";
                        });
                    }
                };
                dom.on(document, "fullscreenchange", fsch);
                dom.on(document, "webkitfullscreenchange", fsch);
                dom.on(document, "mozfullscreenchange", fsch);
            });
        });
    }
    MainScene.prototype.makeSkybox = function () {
        var sb = this.scene_.makeEntity();
        this.skyBox_ = new world.Skybox(this.rc, this.scene_.transformMgr, this.scene_.meshMgr, this.assets_.tex.envCubeSpace);
        this.skyBox_.setEntity(sb.entity);
    };
    MainScene.prototype.resume = function () {
        if (this.mode_ >= 2) {
        }
    };
    MainScene.prototype.suspend = function () {
        if (this.mode_ >= 2) {
        }
    };
    MainScene.prototype.setMode = function (newMode) {
        dom.hide(".loading");
        dom.hide(".titles");
        if (newMode === 1) {
            dom.show(".loading");
        }
        else if (newMode === 2) {
            dom.show(".titles");
        }
        if (newMode !== 1) {
            dom.show("#stage");
            this.player_ = new PlayerController(this.rc.gl.canvas, [0, 1.5, 0], this.scene_, this.level_, this.sfx_);
        }
        this.mode_ = newMode;
    };
    MainScene.prototype.renderFrame = function (timeStep) {
        var _this = this;
        if (this.mode_ < 2) {
            return;
        }
        if (!this.downsample128) {
            this.downsample128 = render.resamplePass(this.rc, this.scene_.meshMgr, 512);
            this.downsample64 = render.resamplePass(this.rc, this.scene_.meshMgr, 256);
            this.boxFilter = render.boxFilterPass(this.rc, this.scene_.meshMgr, 256);
        }
        var mainPassFBO = null;
        if (this.antialias) {
            if (!this.fxaaPass) {
                this.fxaaPass = new render.FXAAPass(this.rc, this.scene_.meshMgr);
            }
            if (!this.mainFBO) {
                this.mainFBO = render.makeScreenFrameBuffer(this.rc, {
                    colourCount: 1,
                    useDepth: true,
                    pixelComponent: 0
                });
            }
            mainPassFBO = this.mainFBO;
        }
        var spotShadow = null;
        var shadowCaster = this.scene_.pbrModelMgr.shadowCaster();
        if (this.SHADOW && shadowCaster && render.canUseShadowMaps(this.rc)) {
            var rpdShadow = render.makeRenderPassDescriptor();
            rpdShadow.clearMask = 3;
            vec4.set(rpdShadow.clearColour, 1, 1, 1, 1);
            spotShadow = this.scene_.lightMgr.shadowViewForLight(this.rc, shadowCaster, .1);
            if (spotShadow) {
                render.runRenderPass(this.rc, this.scene_.meshMgr, rpdShadow, spotShadow.shadowFBO, function (renderPass) {
                    renderPass.setDepthTest(3);
                    _this.scene_.pbrModelMgr.drawShadows(_this.scene_.pbrModelMgr.all(), renderPass, spotShadow.lightProjection);
                });
                this.downsample128.apply(this.rc, this.scene_.meshMgr, spotShadow.shadowFBO.colourAttachmentTexture(0));
                this.downsample64.apply(this.rc, this.scene_.meshMgr, this.downsample128.output);
                this.boxFilter.apply(this.rc, this.scene_.meshMgr, this.downsample64.output);
                spotShadow.filteredTexture = this.boxFilter.output;
                if (this.fullQuad === 0) {
                    var quad = meshdata.gen.generate(new meshdata.gen.Quad(2, 2), [meshdata.attrPosition2(), meshdata.attrUV2()]);
                    this.fullQuad = this.scene_.meshMgr.create({ name: "squareQuad", meshData: quad });
                    this.quadPipeline = makeFSQPipeline(this.rc);
                }
                if (this.SHADQUAD) {
                    drawFSQ(this.rc, this.scene_.meshMgr, this.boxFilter.output, this.quadPipeline, this.fullQuad);
                }
            }
        }
        if (!this.SHADQUAD) {
            var rpdMain = render.makeRenderPassDescriptor();
            vec4.set(rpdMain.clearColour, 0, 0, 0, 1);
            rpdMain.clearMask = 3;
            render.runRenderPass(this.rc, this.scene_.meshMgr, rpdMain, mainPassFBO, function (renderPass) {
                var viewport = renderPass.viewport();
                var camera = {
                    projectionMatrix: mat4.perspective([], math.deg2rad(60), viewport.width / viewport.height, 0.1, 100),
                    viewMatrix: _this.player_.view.viewMatrix
                };
                _this.scene_.lightMgr.prepareLightsForRender(_this.scene_.lightMgr.allEnabled(), camera, viewport);
                renderPass.setDepthTest(3);
                renderPass.setFaceCulling(2);
                _this.scene_.pbrModelMgr.draw(_this.scene_.pbrModelMgr.all(), renderPass, camera, spotShadow, 2, _this.assets_.tex.reflectCubeSpace);
                _this.skyBox_.draw(renderPass, camera);
            });
            if (this.antialias) {
                this.fxaaPass.apply(this.rc, this.scene_.meshMgr, mainPassFBO.colourAttachmentTexture(0));
            }
        }
    };
    MainScene.prototype.simulationStep = function (timeStep) {
        var txm = this.scene_.transformMgr;
        if (this.mode_ >= 4) {
            this.player_.step(timeStep);
            if (io.keyboard.pressed(io.Key.X)) {
                this.antialias = !this.antialias;
            }
            if (this.skyBox_) {
                this.skyBox_.setCenter(this.player_.view.pos);
            }
        }
    };
    return MainScene;
}());
dom.on(window, "load", function () {
    var canvas = document.getElementById("stage");
    var rctx = render.makeRenderContext(canvas);
    var actx = audio.makeAudioContext();
    if (!(rctx.extDerivatives && rctx.extFragmentLOD)) {
        alert("Sorry, this game is not compatible with this browser.\n\nTry one of the following:\n- Firefox 50 or newer\n- Safari 9 or newer\n- Chrome 40 or newer\n\nApologies for the trouble.");
        return;
    }
    if (!document.body.requestPointerLock) {
        dom.hide("#fullscreen");
    }
    if (screen.width < 1920 || screen.height < 1080) {
        dom.disable("#vps-fullhd");
        dom.$1("#vps-fullhd").title = "Your display does not support this resolution.";
        dom.$1("#vps-fullhd+label").title = "Your display does not support this resolution.";
    }
    var mainCtl = new MainScene(rctx, actx);
    sd.defaultRunLoop.sceneController = mainCtl;
    sd.defaultRunLoop.start();
});
"use strict";
function intersectCircleLineSeg(C, r, line) {
    var E = [line[0], line[1]];
    var L = [line[2], line[3]];
    var d = vec2.sub([], L, E);
    var f = vec2.sub([], E, C);
    var a = vec2.dot(d, d);
    var b = 2 * vec2.dot(f, d);
    var c = vec2.dot(f, f) - r * r;
    var discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
        return null;
    }
    else {
        var result = [];
        discriminant = Math.sqrt(discriminant);
        var t1 = (-b - discriminant) / (2 * a);
        var t2 = (-b + discriminant) / (2 * a);
        if (t1 >= 0 && t1 <= 1) {
            result.push(vec2.scaleAndAdd([], E, d, t1));
        }
        if (t2 >= 0 && t2 <= 1) {
            result.push(vec2.scaleAndAdd([], E, d, t2));
        }
        return result.length === 0 ? null : result;
    }
}
var PlayerView = (function () {
    function PlayerView(initialPos, clipLines) {
        this.clipLines = clipLines;
        this.pos_ = [0, 0, 0];
        this.angleX_ = 0;
        this.angleY_ = Math.PI;
        this.dir_ = [0, 0, -1];
        this.up_ = [0, 1, 0];
        this.velocity_ = [0, 0, 0];
        this.effectiveSpeed_ = 0;
        vec3.copy(this.pos_, initialPos);
        this.rotate([0, 0]);
    }
    PlayerView.prototype.clipMovement = function (a, b) {
        var posXZ = [b[0], b[2]];
        for (var _i = 0, _a = this.clipLines; _i < _a.length; _i++) {
            var cl = _a[_i];
            var ip = intersectCircleLineSeg(posXZ, .25, cl);
            if (ip) {
                if (ip.length == 2) {
                    var center = vec2.lerp([], ip[0], ip[1], .5);
                    var pdir = vec2.sub([], posXZ, center);
                    var pen = .25 / vec2.length(pdir);
                    vec2.scaleAndAdd(posXZ, posXZ, pdir, pen - 1);
                }
            }
        }
        return [posXZ[0], b[1], posXZ[1]];
    };
    PlayerView.prototype.update = function (timeStep, acceleration, sideAccel) {
        var fwdXZ = vec3.normalize([], [this.dir_[0], 0, this.dir_[2]]);
        var rightXZ = vec3.cross([], fwdXZ, [0, 1, 0]);
        vec3.scaleAndAdd(this.velocity_, this.velocity_, fwdXZ, acceleration * timeStep);
        vec3.scaleAndAdd(this.velocity_, this.velocity_, rightXZ, sideAccel * timeStep);
        if (vec3.length(this.velocity_) >= 0.001) {
            var targetPos = vec3.add([], this.pos_, this.velocity_);
            var clippedPos = this.clipMovement(this.pos, targetPos);
            vec3.sub(this.velocity_, clippedPos, this.pos_);
            vec3.copy(this.pos_, clippedPos);
            this.effectiveSpeed_ = vec3.length(this.velocity_);
        }
        vec3.scale(this.velocity_, this.velocity_, 0.85);
        if (vec3.length(this.velocity_) < 0.001) {
            vec3.set(this.velocity_, 0, 0, 0);
            this.effectiveSpeed_ = 0;
        }
    };
    PlayerView.prototype.rotate = function (localRelXY) {
        this.angleX_ -= Math.PI * 1.3 * localRelXY[1];
        this.angleX_ = math.clamp(this.angleX_, -Math.PI * 0.27, Math.PI * 0.21);
        this.angleY_ += Math.PI * 1.8 * localRelXY[0];
        this.rot_ = quat.fromEuler(0, this.angleY_, this.angleX_);
        vec3.transformQuat(this.dir_, [0, 0, 1], this.rot_);
        vec3.normalize(this.dir_, this.dir_);
        vec3.transformQuat(this.up_, [0, 1, 0], this.rot_);
        vec3.normalize(this.up_, this.up_);
    };
    Object.defineProperty(PlayerView.prototype, "pos", {
        get: function () { return this.pos_; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlayerView.prototype, "posXZ", {
        get: function () { return [this.pos_[0], this.pos_[2]]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlayerView.prototype, "dir", {
        get: function () { return this.dir_; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlayerView.prototype, "dirXZ", {
        get: function () { return [this.dir_[0], this.dir_[2]]; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlayerView.prototype, "rotation", {
        get: function () { return this.rot_; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlayerView.prototype, "effectiveSpeed", {
        get: function () { return this.effectiveSpeed_; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlayerView.prototype, "focusPos", {
        get: function () { return vec3.add([], this.pos_, this.dir_); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PlayerView.prototype, "viewMatrix", {
        get: function () { return mat4.lookAt([], this.pos_, this.focusPos, this.up_); },
        enumerable: true,
        configurable: true
    });
    return PlayerView;
}());
var PlayerController = (function () {
    function PlayerController(sensingElem, initialPos, scene, level, sfx) {
        var _this = this;
        this.scene = scene;
        this.level = level;
        this.sfx = sfx;
        this.tracking_ = false;
        this.lastPos_ = [0, 0];
        this.keyboardType_ = 0;
        this.stepSoundTimer_ = -1;
        this.view = new PlayerView(initialPos, level.clipLines);
        this.vpWidth_ = sensingElem.offsetWidth;
        this.vpHeight_ = sensingElem.offsetHeight;
        dom.on(sensingElem, "mousedown", function (evt) {
            _this.tracking_ = true;
            _this.lastPos_ = [evt.clientX, evt.clientY];
        });
        dom.on(window, "mousemove", function (evt) {
            if ((document.pointerLockElement === null) && (!_this.tracking_)) {
                return;
            }
            var newPos = [evt.clientX, evt.clientY];
            var delta = document.pointerLockElement ? [evt.movementX, evt.movementY] : vec2.sub([], newPos, _this.lastPos_);
            vec2.divide(delta, delta, [-_this.vpWidth_, -_this.vpHeight_]);
            vec2.scale(delta, delta, document.pointerLockElement ? .5 : 1);
            _this.lastPos_ = newPos;
            _this.view.rotate(delta);
        });
        dom.on(window, "mouseup", function (evt) {
            _this.tracking_ = false;
        });
    }
    PlayerController.prototype.keyForKeyCommand = function (cmd) {
        var keys;
        switch (cmd) {
            case 0:
                keys = [io.Key.W, io.Key.W, io.Key.Z];
                break;
            case 1:
                keys = [io.Key.S, io.Key.S, io.Key.S];
                break;
            case 2:
                keys = [io.Key.A, io.Key.A, io.Key.Q];
                break;
            case 3:
                keys = [io.Key.D, io.Key.D, io.Key.D];
                break;
            case 4:
                keys = [io.Key.E, io.Key.E, io.Key.E];
                break;
        }
        return keys ? keys[this.keyboardType_] : 0;
    };
    PlayerController.prototype.handleStepSounds = function () {
        var _this = this;
        if (this.view.effectiveSpeed > 0.01) {
            if (this.stepSoundTimer_ == -1) {
                this.stepSoundTimer_ = setInterval(function () { _this.sfx.play(0); }, 500);
            }
        }
        else {
            if (this.stepSoundTimer_ > -1) {
                clearInterval(this.stepSoundTimer_);
                this.stepSoundTimer_ = -1;
            }
        }
    };
    PlayerController.prototype.step = function (timeStep) {
        var maxAccel = 0.66;
        var accel = 0, sideAccel = 0;
        if (io.keyboard.down(io.Key.UP) || io.keyboard.down(this.keyForKeyCommand(0))) {
            accel = maxAccel;
        }
        else if (io.keyboard.down(io.Key.DOWN) || io.keyboard.down(this.keyForKeyCommand(1))) {
            accel = -maxAccel;
        }
        if (io.keyboard.down(io.Key.LEFT) || io.keyboard.down(this.keyForKeyCommand(2))) {
            sideAccel = -maxAccel;
        }
        else if (io.keyboard.down(io.Key.RIGHT) || io.keyboard.down(this.keyForKeyCommand(3))) {
            sideAccel = maxAccel;
        }
        this.view.update(timeStep, accel, sideAccel);
        this.handleStepSounds();
    };
    return PlayerController;
}());
