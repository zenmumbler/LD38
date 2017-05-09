"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var sd;
(function (sd) {
    var asset;
    (function (asset) {
        var AssetLibrary = (function () {
            function AssetLibrary() {
                this.roots_ = new Map();
            }
            AssetLibrary.prototype.addRoot = function (name, baseURL) {
                sd.assert(!this.roots_.has(name), "An asset root named '" + name + "' already exists.");
                this.roots_.set(name, baseURL);
            };
            AssetLibrary.prototype.addLocalRoot = function (name, relativePath) {
                sd.assert(!this.roots_.has(name), "An asset root named '" + name + "' already exists.");
                this.roots_.set(name, new URL(relativePath, location.href));
            };
            AssetLibrary.prototype.deleteRoot = function (name) {
                sd.assert(this.roots_.has(name), "No asset root named '" + name + "' exists.");
                this.roots_.delete(name);
            };
            AssetLibrary.prototype.resolvePath = function (path) {
                var firstSlash = path.indexOf("/");
                sd.assert(firstSlash > 0, "path must have a root name and separating slash");
                var rootName = path.substring(0, firstSlash);
                var rootURL = this.roots_.get(rootName);
                sd.assert(rootURL, "root " + rootName + " does not exist");
                var resourcePath = path.substring(firstSlash + 1);
                return new URL(resourcePath, rootURL.href);
            };
            AssetLibrary.prototype.load = function (_path) {
            };
            return AssetLibrary;
        }());
        asset.AssetLibrary = AssetLibrary;
    })(asset = sd.asset || (sd.asset = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    function assert(cond, msg) {
        if (!cond) {
            console.error(msg || "assertion failed");
            throw new Error(msg || "assertion failed");
        }
    }
    sd.assert = assert;
    function cloneStruct(object) {
        var copy = {};
        Object.getOwnPropertyNames(object).forEach(function (name) {
            copy[name] = object[name];
        });
        return copy;
    }
    sd.cloneStruct = cloneStruct;
    function cloneStructDeep(object) {
        var copy = {};
        Object.getOwnPropertyNames(object).forEach(function (name) {
            if (typeof object[name] === "object") {
                copy[name] = cloneStructDeep(object[name]);
            }
            else {
                copy[name] = object[name];
            }
        });
        return copy;
    }
    sd.cloneStructDeep = cloneStructDeep;
})(sd || (sd = {}));
var sd;
(function (sd) {
    var asset;
    (function (asset) {
        var extensionMimeTypeMap = new Map();
        function registerFileExtension(extension, mimeType) {
            var ext = extension.toLowerCase().trim();
            var mime = mimeType.toLowerCase().trim();
            sd.assert(ext.length > 0, "empty file extension provided");
            sd.assert(mime.length > 0, "empty mime-type provided");
            extensionMimeTypeMap.set(ext, mime);
        }
        asset.registerFileExtension = registerFileExtension;
        function mimeTypeForFileExtension(extension) {
            var ext = extension.toLowerCase().trim();
            return extensionMimeTypeMap.get(ext);
        }
        asset.mimeTypeForFileExtension = mimeTypeForFileExtension;
        function mimeTypeForURL(url) {
            var extension = asset.fileExtensionOfURL(url);
            return mimeTypeForFileExtension(extension);
        }
        asset.mimeTypeForURL = mimeTypeForURL;
        var urlAssetLoaders = new Map();
        var bufferAssetLoaders = new Map();
        function registerURLLoaderForMIMEType(mimeType, loader) {
            var mime = mimeType.toLowerCase().trim();
            sd.assert(!urlAssetLoaders.has(mime), "Tried to override file loader for MIME type '" + mime + "'");
            urlAssetLoaders.set(mime, loader);
        }
        asset.registerURLLoaderForMIMEType = registerURLLoaderForMIMEType;
        function registerBufferLoaderForMIMEType(mimeType, loader) {
            var mime = mimeType.toLowerCase().trim();
            sd.assert(!bufferAssetLoaders.has(mime), "Tried to override buffer loader for MIME type '" + mime + "'");
            bufferAssetLoaders.set(mime, loader);
        }
        asset.registerBufferLoaderForMIMEType = registerBufferLoaderForMIMEType;
        function registerLoadersForMIMEType(mimeType, urlLoader, bufferLoader) {
            registerURLLoaderForMIMEType(mimeType, urlLoader);
            registerBufferLoaderForMIMEType(mimeType, bufferLoader);
        }
        asset.registerLoadersForMIMEType = registerLoadersForMIMEType;
        function urlLoaderForMIMEType(mimeType) {
            var mime = mimeType.toLowerCase().trim();
            return urlAssetLoaders.get(mime);
        }
        asset.urlLoaderForMIMEType = urlLoaderForMIMEType;
        function bufferLoaderForMIMEType(mimeType) {
            var mime = mimeType.toLowerCase().trim();
            return bufferAssetLoaders.get(mime);
        }
        asset.bufferLoaderForMIMEType = bufferLoaderForMIMEType;
    })(asset = sd.asset || (sd.asset = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var asset;
    (function (asset) {
        function makeMaterial(name) {
            return {
                name: name || "",
                flags: 0,
                baseColour: [1, 1, 1],
                specularColour: [0, 0, 0],
                specularIntensity: 0,
                specularExponent: 0,
                emissiveColour: [0, 0, 0],
                emissiveIntensity: 0,
                textureScale: [1, 1],
                textureOffset: [0, 0],
                opacity: 1,
                anisotropy: 1,
                metallic: 0,
                roughness: 0
            };
        }
        asset.makeMaterial = makeMaterial;
        function makeTransform() {
            return {
                position: [0, 0, 0],
                rotation: [0, 0, 0, 1],
                scale: [1, 1, 1]
            };
        }
        asset.makeTransform = makeTransform;
        function makeModel(name, ref) {
            return {
                name: name,
                userRef: ref,
                transform: makeTransform(),
                children: []
            };
        }
        asset.makeModel = makeModel;
        var AssetGroup = (function () {
            function AssetGroup() {
                this.meshes = [];
                this.textures = [];
                this.materials = [];
                this.models = [];
                this.anims = [];
            }
            AssetGroup.prototype.addMesh = function (mesh) {
                this.meshes.push(mesh);
                return this.meshes.length - 1;
            };
            AssetGroup.prototype.addTexture = function (tex) {
                this.textures.push(tex);
                return this.textures.length - 1;
            };
            AssetGroup.prototype.addMaterial = function (mat) {
                this.materials.push(mat);
                return this.materials.length - 1;
            };
            AssetGroup.prototype.addModel = function (model) {
                this.models.push(model);
                return this.models.length - 1;
            };
            AssetGroup.prototype.addSkeletonAnimation = function (anim) {
                this.anims.push(anim);
                return this.anims.length;
            };
            return AssetGroup;
        }());
        asset.AssetGroup = AssetGroup;
    })(asset = sd.asset || (sd.asset = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var asset;
    (function (asset) {
        function fileExtensionOfURL(url) {
            var path = (url instanceof URL) ? url.href : url;
            var lastDot = path.lastIndexOf(".");
            if (lastDot > -1) {
                return path.substr(lastDot + 1).toLowerCase();
            }
            return "";
        }
        asset.fileExtensionOfURL = fileExtensionOfURL;
        function responseTypeForFileLoadType(flt) {
            switch (flt) {
                case 1: return "arraybuffer";
                case 2: return "blob";
                case 3: return "document";
                case 4: return "json";
                case 5: return "text";
                default: return "";
            }
        }
        function loadFile(url, opts) {
            return new Promise(function (resolve, reject) {
                opts = opts || {};
                var xhr = new XMLHttpRequest();
                if (opts.tryBreakCache) {
                    url += "?__ts=" + Date.now();
                }
                xhr.open("GET", (url instanceof URL) ? url.href : url);
                if (opts.responseType) {
                    xhr.responseType = responseTypeForFileLoadType(opts.responseType);
                }
                if (opts.mimeType) {
                    xhr.overrideMimeType(opts.mimeType);
                }
                xhr.onreadystatechange = function () {
                    if (xhr.readyState != 4) {
                        return;
                    }
                    sd.assert(xhr.status == 200 || xhr.status == 0);
                    resolve(xhr.response);
                };
                xhr.onerror = function () {
                    var message = "'" + url + "' doesn't exist or failed to load";
                    sd.assert(false, message);
                    reject(message);
                };
                xhr.send();
            });
        }
        asset.loadFile = loadFile;
        var BlobReader = (function () {
            function BlobReader() {
            }
            BlobReader.readerPromise = function () {
                var reader = new FileReader();
                var promise = new Promise(function (resolve, reject) {
                    reader.onerror = function () {
                        reject(reader.error);
                    };
                    reader.onabort = function () {
                        reject("Blob load was aborted.");
                    };
                    reader.onload = function () {
                        resolve(reader.result);
                    };
                });
                return { promise: promise, reader: reader };
            };
            BlobReader.readAsArrayBuffer = function (blob) {
                var pr = this.readerPromise();
                pr.reader.readAsArrayBuffer(blob);
                return pr.promise;
            };
            BlobReader.readAsDataURL = function (blob) {
                var pr = this.readerPromise();
                pr.reader.readAsDataURL(blob);
                return pr.promise;
            };
            BlobReader.readAsText = function (blob, encoding) {
                var pr = this.readerPromise();
                pr.reader.readAsText(blob, encoding);
                return pr.promise;
            };
            return BlobReader;
        }());
        asset.BlobReader = BlobReader;
        function resolveTextures(rc, textures) {
            return Promise.all(textures.map(function (tex) {
                if (!tex) {
                    return null;
                }
                if (!tex.url || (tex.descriptor && tex.descriptor.pixelData)) {
                    return tex;
                }
                return asset.loadImageURL(tex.url).then(function (img) {
                    tex.descriptor = sd.render.makeTexDesc2DFromImageSource(img, tex.colourSpace, tex.useMipMaps);
                    tex.texture = new sd.render.Texture(rc, tex.descriptor);
                    return tex;
                }).catch(function (error) {
                    console.warn("resolveTextures error: ", error);
                    return null;
                });
            }).filter(function (p) { return !!p; }));
        }
        asset.resolveTextures = resolveTextures;
        function loadSoundFile(ac, filePath) {
            return loadFile(filePath, {
                responseType: 1
            }).then(function (data) {
                return sd.audio.makeAudioBufferFromData(ac, data);
            });
        }
        asset.loadSoundFile = loadSoundFile;
        function convertBytesToString(bytes) {
            var maxBlockSize = 65536;
            var strings = [];
            var bytesLeft = bytes.length;
            var offset = 0;
            while (bytesLeft > 0) {
                var blockSize = Math.min(bytesLeft, maxBlockSize);
                var str = String.fromCharCode.apply(null, bytes.subarray(offset, offset + blockSize));
                strings.push(str);
                offset += blockSize;
                bytesLeft -= blockSize;
            }
            return strings.length == 1 ? strings[0] : strings.join("");
        }
        asset.convertBytesToString = convertBytesToString;
    })(asset = sd.asset || (sd.asset = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var asset;
    (function (asset) {
        var fbx;
        (function (fbx) {
            var parse;
            (function (parse) {
                var FBXBinaryParser = (function () {
                    function FBXBinaryParser(data, delegate_) {
                        this.delegate_ = delegate_;
                        this.offset_ = 0;
                        this.length_ = 0;
                        this.version_ = 0;
                        this.stack_ = [];
                        this.inProp70Block_ = false;
                        this.twoExp21 = Math.pow(2, 21);
                        this.twoExp32 = Math.pow(2, 32);
                        this.length_ = data.byteLength;
                        this.bytes_ = new Uint8Array(data);
                        this.dataView_ = new DataView(data);
                    }
                    Object.defineProperty(FBXBinaryParser.prototype, "delegate", {
                        get: function () {
                            return this.delegate_;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    FBXBinaryParser.prototype.error = function (msg, offset) {
                        if (offset == null) {
                            offset = this.offset_;
                        }
                        this.delegate_.error(msg, offset);
                        this.offset_ = this.length_;
                    };
                    FBXBinaryParser.prototype.inflateCompressedArray = function (dataBlock, outElementType) {
                        sd.assert(dataBlock.byteLength > 6, "Compressed array data size is too small");
                        var compData = new Uint8Array(dataBlock.buffer, dataBlock.byteOffset + 2, dataBlock.byteLength - 6);
                        var inf = new Inflater();
                        var result = inf.append(compData);
                        inf.flush();
                        sd.assert(result.byteLength % outElementType.byteSize == 0, "Invalid aligned size of output buffer");
                        return new (outElementType.arrayType)(result.buffer);
                    };
                    FBXBinaryParser.prototype.checkFileHeader = function () {
                        var ident = String.fromCharCode.apply(null, this.bytes_.subarray(0, 20));
                        if (ident != "Kaydara FBX Binary  ") {
                            this.error("Not an FBX binary file");
                            return false;
                        }
                        if (this.dataView_.getUint16(21, true) != 0x001A) {
                            this.error("Expected 0x001A marker in header");
                            return false;
                        }
                        this.version_ = this.dataView_.getUint32(23, true);
                        if (this.version_ < 7000 || this.version_ >= 8000) {
                            this.error("This parser only supports v7.x files.");
                            return false;
                        }
                        this.offset_ = 27;
                        return true;
                    };
                    FBXBinaryParser.prototype.readFieldHeader = function () {
                        var endOffset = this.dataView_.getUint32(this.offset_, true);
                        var propertyCount = this.dataView_.getUint32(this.offset_ + 4, true);
                        var propertiesSizeBytes = this.dataView_.getUint32(this.offset_ + 8, true);
                        var nameLength = this.dataView_.getUint8(this.offset_ + 12);
                        var result = {
                            offset: this.offset_,
                            endOffset: endOffset,
                            valueCount: propertyCount,
                            valuesSizeBytes: propertiesSizeBytes,
                            nameLength: nameLength,
                            name: nameLength > 0 ? String.fromCharCode.apply(null, this.bytes_.subarray(this.offset_ + 13, this.offset_ + 13 + nameLength)) : ""
                        };
                        this.offset_ += 13 + nameLength;
                        return result;
                    };
                    FBXBinaryParser.prototype.readArrayProperty = function (element) {
                        var arrayLength = this.dataView_.getUint32(this.offset_, true);
                        var encoding = this.dataView_.getUint32(this.offset_ + 4, true);
                        var compressedSizeBytes = this.dataView_.getUint32(this.offset_ + 8, true);
                        this.offset_ += 12;
                        var array = null;
                        var dataSizeBytes = 0;
                        if (encoding == 0) {
                            dataSizeBytes = element.byteSize * arrayLength;
                            sd.assert(dataSizeBytes < (this.length_ - this.offset_), "array length out of bounds");
                            var source = this.bytes_.subarray(this.offset_, this.offset_ + dataSizeBytes);
                            var dest = new Uint8Array(dataSizeBytes);
                            dest.set(source);
                            array = new (element.arrayType)(dest.buffer);
                        }
                        else if (encoding == 1) {
                            dataSizeBytes = compressedSizeBytes;
                            sd.assert(dataSizeBytes < (this.length_ - this.offset_), "array compressed size out of bounds");
                            var source = this.bytes_.subarray(this.offset_, this.offset_ + dataSizeBytes);
                            array = this.inflateCompressedArray(source, element);
                        }
                        else {
                            console.warn("Unknown array encoding encountered: " + encoding + ". Skipping array.");
                            dataSizeBytes = compressedSizeBytes;
                        }
                        this.offset_ += dataSizeBytes;
                        return array;
                    };
                    FBXBinaryParser.prototype.convertInt64ToDouble = function (dv, offset) {
                        var vLo = dv.getUint32(offset, true);
                        var vHi = dv.getInt32(offset + 4, true);
                        if (vHi > this.twoExp21 || vHi < -this.twoExp21) {
                            console.warn("A 64-bit int property was larger than (+/-)2^53 so it may not be accurately represented.");
                        }
                        return vLo + vHi * this.twoExp32;
                    };
                    FBXBinaryParser.prototype.readValues = function (header) {
                        var values = [];
                        var firstPropOffset = this.offset_;
                        var count = header.valueCount;
                        while (count--) {
                            var val = void 0;
                            var type = String.fromCharCode(this.bytes_[this.offset_]);
                            var propLen = void 0;
                            this.offset_ += 1;
                            switch (type) {
                                case "S":
                                case "R":
                                    propLen = this.dataView_.getUint32(this.offset_, true);
                                    if (propLen > 0) {
                                        var propData = this.bytes_.subarray(this.offset_ + 4, this.offset_ + 4 + propLen);
                                        if (type == "S") {
                                            var str = asset.convertBytesToString(propData);
                                            str = str.split("\x00\x01").reverse().join("::");
                                            val = str;
                                        }
                                        else {
                                            val = propData.buffer.slice(this.offset_ + 4, this.offset_ + 4 + propLen);
                                        }
                                    }
                                    else {
                                        val = "";
                                    }
                                    this.offset_ += 4 + propLen;
                                    break;
                                case "C":
                                    val = this.dataView_.getInt8(this.offset_);
                                    this.offset_ += 1;
                                    break;
                                case "Y":
                                    val = this.dataView_.getInt16(this.offset_, true);
                                    this.offset_ += 2;
                                    break;
                                case "I":
                                    val = this.dataView_.getInt32(this.offset_, true);
                                    this.offset_ += 4;
                                    break;
                                case "L":
                                    val = this.convertInt64ToDouble(this.dataView_, this.offset_);
                                    this.offset_ += 8;
                                    break;
                                case "F":
                                    val = this.dataView_.getFloat32(this.offset_, true);
                                    this.offset_ += 4;
                                    break;
                                case "D":
                                    val = this.dataView_.getFloat64(this.offset_, true);
                                    this.offset_ += 8;
                                    break;
                                case "b":
                                    val = this.readArrayProperty(sd.UInt8);
                                    break;
                                case "i":
                                    val = this.readArrayProperty(sd.SInt32);
                                    break;
                                case "l":
                                    {
                                        var doubles = this.readArrayProperty(sd.Double);
                                        if (doubles) {
                                            var view = new DataView(doubles.buffer);
                                            for (var di = 0; di < doubles.length; ++di) {
                                                var v = this.convertInt64ToDouble(view, di * 8);
                                                doubles[di] = v;
                                            }
                                        }
                                        val = doubles;
                                    }
                                    break;
                                case "f":
                                    val = this.readArrayProperty(sd.Float);
                                    break;
                                case "d":
                                    val = this.readArrayProperty(sd.Double);
                                    break;
                                default:
                                    console.warn("Unknown property type: '" + type + "'. Skipping further properties for this field.");
                                    count = 0;
                                    val = 0;
                                    this.offset_ = firstPropOffset + header.valuesSizeBytes;
                                    break;
                            }
                            if (val !== null) {
                                values.push(val);
                            }
                        }
                        sd.assert(this.offset_ - header.valuesSizeBytes == firstPropOffset);
                        return values;
                    };
                    FBXBinaryParser.prototype.parse = function () {
                        if (!this.checkFileHeader()) {
                            return;
                        }
                        while (this.offset_ < this.length_) {
                            var hdr = this.readFieldHeader();
                            if (hdr.endOffset == 0) {
                                if (this.stack_.length > 0) {
                                    var closing = this.stack_.pop();
                                    sd.assert(closing.endOffset == this.offset_, "Offset mismatch at end of scope");
                                    if (this.inProp70Block_) {
                                        sd.assert(closing.name == "Properties70", "Invalid parser state, assumed closing a Prop70 but was closing a " + closing.name);
                                        this.inProp70Block_ = false;
                                    }
                                    else {
                                        this.delegate_.endBlock();
                                    }
                                }
                                else {
                                    this.delegate_.completed();
                                    return;
                                }
                            }
                            else {
                                var values = this.readValues(hdr);
                                if (hdr.endOffset != this.offset_) {
                                    var blockAction = 0;
                                    if (hdr.name == "Properties70") {
                                        this.inProp70Block_ = true;
                                    }
                                    else {
                                        blockAction = this.delegate_.block(hdr.name, values);
                                    }
                                    if (blockAction == 0) {
                                        this.stack_.push(hdr);
                                    }
                                    else {
                                        this.offset_ = hdr.endOffset;
                                    }
                                }
                                else {
                                    if (this.inProp70Block_) {
                                        sd.assert(hdr.name == "P", "Only P properties are allowed in a Properties70 block.");
                                        var p70p = parse.interpretProp70P(values);
                                        this.delegate_.typedProperty(p70p.name, p70p.type, p70p.typeName, p70p.values);
                                    }
                                    else {
                                        this.delegate_.property(hdr.name, values);
                                    }
                                }
                            }
                        }
                        this.error("Unexpected EOF at nesting depth " + this.stack_.length);
                    };
                    return FBXBinaryParser;
                }());
                parse.FBXBinaryParser = FBXBinaryParser;
            })(parse = fbx.parse || (fbx.parse = {}));
        })(fbx = asset.fbx || (asset.fbx = {}));
    })(asset = sd.asset || (sd.asset = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var asset;
    (function (asset) {
        var fbx;
        (function (fbx) {
            var parse;
            (function (parse) {
                var FBXTextTokenizer = (function () {
                    function FBXTextTokenizer(source) {
                        this.source = source;
                        this.offset_ = -1;
                        this.length_ = 0;
                        this.lastChar_ = "";
                        this.length_ = source.length;
                    }
                    FBXTextTokenizer.prototype.nextChar = function () {
                        this.offset_++;
                        if (this.offset_ < this.length_) {
                            this.lastChar_ = this.source[this.offset_];
                        }
                        else {
                            this.lastChar_ = null;
                        }
                        return this.lastChar_;
                    };
                    FBXTextTokenizer.prototype.skipWS = function () {
                        var c;
                        while (c = this.nextChar()) {
                            if (c != " " && c != "\t" && c != "\r" && c != "\n") {
                                break;
                            }
                        }
                    };
                    FBXTextTokenizer.prototype.skipToLineEnd = function () {
                        var c;
                        while (c = this.nextChar()) {
                            if (c == "\r" || c == "\n") {
                                break;
                            }
                        }
                    };
                    Object.defineProperty(FBXTextTokenizer.prototype, "offset", {
                        get: function () { return this.offset_; },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(FBXTextTokenizer.prototype, "length", {
                        get: function () { return this.length_; },
                        enumerable: true,
                        configurable: true
                    });
                    FBXTextTokenizer.prototype.nextToken = function () {
                        var _this = this;
                        this.skipWS();
                        if (this.offset_ >= this.length_) {
                            this.offset_ = this.length_;
                            return {
                                type: 1,
                                offset: this.length_
                            };
                        }
                        var tokenStart = this.offset_;
                        var tokenEnd = 0;
                        var c = this.lastChar_;
                        var invalid = function () {
                            return {
                                type: 0,
                                offset: tokenStart,
                                val: _this.source.substring(tokenStart, tokenEnd + 1)
                            };
                        };
                        if (c == ";") {
                            this.skipToLineEnd();
                            return this.nextToken();
                        }
                        else if (c == '"') {
                            while (c = this.nextChar()) {
                                if (c == '"' || c == "\r" || c == "\n") {
                                    break;
                                }
                            }
                            tokenEnd = this.offset_;
                            if (c != '"') {
                                return invalid();
                            }
                            else {
                                return {
                                    type: 3,
                                    offset: tokenStart,
                                    val: this.source.substring(tokenStart + 1, tokenEnd)
                                };
                            }
                        }
                        else if (c == ",") {
                            return {
                                type: 8,
                                offset: tokenStart
                            };
                        }
                        else if (c == "{") {
                            return {
                                type: 6,
                                offset: tokenStart
                            };
                        }
                        else if (c == "}") {
                            return {
                                type: 7,
                                offset: tokenStart
                            };
                        }
                        else {
                            var firstChar = c;
                            while (c = this.nextChar()) {
                                if (c == " " || c == "\t" || c == "\r" || c == "\n" || c == "," || c == "{" || c == "}") {
                                    break;
                                }
                            }
                            tokenEnd = this.offset_;
                            this.offset_--;
                            var token = this.source.substring(tokenStart, tokenEnd);
                            if ((firstChar >= "A" && firstChar <= "Z") || (firstChar >= "a" && firstChar <= "z")) {
                                if (token == "T" || token == "Y") {
                                    return {
                                        type: 3,
                                        offset: tokenStart,
                                        val: token
                                    };
                                }
                                if (token.length < 2 || (token[token.length - 1] != ":")) {
                                    return invalid();
                                }
                                return {
                                    type: 2,
                                    offset: tokenStart,
                                    val: token.substr(0, token.length - 1)
                                };
                            }
                            else if (firstChar == "*" || firstChar == "-" || (firstChar >= "0" && firstChar <= "9")) {
                                if (firstChar == "*") {
                                    if (token.length < 2) {
                                        return invalid();
                                    }
                                    else {
                                        var count = parseFloat(token.substr(1));
                                        if (isNaN(count) || count != (count | 0) || count < 1) {
                                            return invalid();
                                        }
                                        return {
                                            type: 5,
                                            offset: tokenStart,
                                            val: count | 0
                                        };
                                    }
                                }
                                else {
                                    var num = parseFloat(token);
                                    if (isNaN(num)) {
                                        return invalid();
                                    }
                                    return {
                                        type: 4,
                                        offset: tokenStart,
                                        val: num
                                    };
                                }
                            }
                            else {
                                return invalid();
                            }
                        }
                    };
                    return FBXTextTokenizer;
                }());
                var FBXTextParser = (function () {
                    function FBXTextParser(text, delegate_) {
                        this.delegate_ = delegate_;
                        this.expect_ = 1;
                        this.expectNextKey_ = null;
                        this.eof_ = false;
                        this.depth_ = 0;
                        this.inProp70Block_ = false;
                        this.skippingUntilDepth_ = 1000;
                        this.array_ = null;
                        this.arrayLength_ = 0;
                        this.arrayIndex_ = 0;
                        this.values_ = [];
                        this.tokenizer_ = new FBXTextTokenizer(text);
                    }
                    Object.defineProperty(FBXTextParser.prototype, "delegate", {
                        get: function () {
                            return this.delegate_;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    FBXTextParser.prototype.unexpected = function (t) {
                        if (t.type == 0) {
                            this.delegate_.error("Invalid token", t.offset, t.val !== undefined ? t.val.toString() : undefined);
                        }
                        else {
                            this.delegate_.error("Unexpected token", t.offset, t.val !== undefined ? t.val.toString() : undefined);
                        }
                        this.eof_ = true;
                    };
                    FBXTextParser.prototype.reportBlock = function () {
                        sd.assert(this.values_.length > 0);
                        var blockName = this.values_[0];
                        var blockAction = 0;
                        if (this.array_ == null) {
                            if (blockName == "Properties70") {
                                this.inProp70Block_ = true;
                            }
                            else {
                                if (this.depth_ <= this.skippingUntilDepth_) {
                                    blockAction = this.delegate_.block(blockName, this.values_.slice(1));
                                }
                            }
                            this.values_ = [];
                        }
                        return blockAction;
                    };
                    FBXTextParser.prototype.reportProperty = function () {
                        sd.assert(this.values_.length > 0);
                        var propName = this.values_[0];
                        var values = this.values_.slice(1);
                        if (this.depth_ <= this.skippingUntilDepth_) {
                            if (this.inProp70Block_) {
                                sd.assert(propName == "P", "Only P properties are allowed in a Properties70 block.");
                                var p70p = parse.interpretProp70P(values);
                                this.delegate_.typedProperty(p70p.name, p70p.type, p70p.typeName, p70p.values);
                            }
                            else {
                                this.delegate_.property(propName, values);
                            }
                        }
                        this.values_ = [];
                    };
                    FBXTextParser.prototype.arrayForKey = function (key, elementCount) {
                        if (key == "PolygonVertexIndex" ||
                            key == "UVIndex" ||
                            key == "ColorIndex" ||
                            key == "NormalsIndex" ||
                            key == "BinormalsIndex" ||
                            key == "TangentsIndex" ||
                            key == "Edges" ||
                            key == "Smoothing" ||
                            key == "Visibility" ||
                            key == "Materials" ||
                            key == "TextureId" ||
                            key == "KnotVectorU" ||
                            key == "KnotVectorV" ||
                            key == "MultiplicityU" ||
                            key == "MultiplicityV" ||
                            key == "Indexes" ||
                            key == "KeyAttrFlags" ||
                            key == "KeyAttrRefCount") {
                            return new Int32Array(elementCount);
                        }
                        if (key == "KeyValueFloat" ||
                            key == "KeyAttrDataFloat") {
                            return new Float32Array(elementCount);
                        }
                        if (key == "Vertices" ||
                            key == "Normals" ||
                            key == "NormalsW" ||
                            key == "Binormals" ||
                            key == "BinormalsW" ||
                            key == "Tangents" ||
                            key == "TangentsW" ||
                            key == "UV" ||
                            key == "Colors" ||
                            key == "Weights" ||
                            key == "Points" ||
                            key == "KeyTime" ||
                            key == "Transform" ||
                            key == "TransformLink" ||
                            key == "Matrix") {
                            return new Float64Array(elementCount);
                        }
                        console.warn("Unknown array key '" + key + "', making default Float64 array.");
                        return new Float64Array(elementCount);
                    };
                    FBXTextParser.prototype.parse = function () {
                        do {
                            var token = this.tokenizer_.nextToken();
                            switch (token.type) {
                                case 2:
                                    if (this.expect_ & 1) {
                                        if (this.expectNextKey_ == null || this.expectNextKey_ == token.val) {
                                            if (token.val != "a") {
                                                if (this.values_.length > 0) {
                                                    this.reportProperty();
                                                }
                                                this.values_.push(token.val);
                                            }
                                            this.expect_ = 10;
                                            this.expectNextKey_ = null;
                                        }
                                        else {
                                            return this.unexpected(token);
                                        }
                                    }
                                    else {
                                        return this.unexpected(token);
                                    }
                                    break;
                                case 3:
                                case 4:
                                    if ((this.expectNextKey_ == null) && (this.expect_ & 2)) {
                                        if (this.array_) {
                                            if (token.type != 4) {
                                                this.delegate_.error("Only numbers are allowed in arrays", token.offset, token.val !== undefined ? token.val.toString() : undefined);
                                                return;
                                            }
                                            this.array_[this.arrayIndex_++] = token.val;
                                            if (this.arrayIndex_ == this.arrayLength_) {
                                                this.values_.push(this.array_);
                                                this.expect_ = 16;
                                            }
                                            else {
                                                this.expect_ = 4;
                                            }
                                        }
                                        else {
                                            this.values_.push(token.val);
                                            this.expect_ = 13;
                                        }
                                        if (this.depth_ > 0) {
                                            this.expect_ |= 16;
                                        }
                                    }
                                    else {
                                        return this.unexpected(token);
                                    }
                                    break;
                                case 5:
                                    if ((this.expectNextKey_ == null) && (this.expect_ == 10)) {
                                        this.array_ = this.arrayForKey(this.values_[0], token.val);
                                        this.arrayIndex_ = 0;
                                        this.arrayLength_ = this.array_.length;
                                        this.expect_ = 8;
                                        this.expectNextKey_ = "a";
                                    }
                                    else {
                                        return this.unexpected(token);
                                    }
                                    break;
                                case 6:
                                    if (this.expect_ & 8) {
                                        var blockAction = this.reportBlock();
                                        if (blockAction == 1) {
                                            this.skippingUntilDepth_ = this.depth_;
                                        }
                                        this.depth_++;
                                        this.expect_ = 1;
                                        if (this.expectNextKey_ == null) {
                                            this.expect_ |= 16;
                                        }
                                    }
                                    else {
                                        this.unexpected(token);
                                    }
                                    break;
                                case 7:
                                    if ((this.expectNextKey_ == null) && (this.expect_ & 16)) {
                                        if (this.values_.length > 0) {
                                            this.reportProperty();
                                        }
                                        if (this.array_) {
                                            this.array_ = null;
                                        }
                                        else if (this.inProp70Block_) {
                                            this.inProp70Block_ = false;
                                        }
                                        else if (this.depth_ <= this.skippingUntilDepth_) {
                                            this.delegate_.endBlock();
                                        }
                                        this.depth_--;
                                        if (this.depth_ == this.skippingUntilDepth_) {
                                            this.skippingUntilDepth_ = 1000;
                                        }
                                        this.expect_ = 1;
                                        if (this.depth_ > 0) {
                                            this.expect_ |= 16;
                                        }
                                    }
                                    else {
                                        this.unexpected(token);
                                    }
                                    break;
                                case 8:
                                    if ((this.expectNextKey_ == null) && (this.expect_ & 4)) {
                                        this.expect_ = 2;
                                    }
                                    else {
                                        this.unexpected(token);
                                    }
                                    break;
                                case 0:
                                    this.unexpected(token);
                                    break;
                                case 1:
                                    this.eof_ = true;
                                    break;
                            }
                        } while (!this.eof_);
                        if (this.depth_ > 0) {
                            this.delegate_.error("Unexpected EOF at nesting depth " + this.depth_, this.tokenizer_.offset);
                        }
                        else {
                            this.delegate_.completed();
                        }
                    };
                    return FBXTextParser;
                }());
                parse.FBXTextParser = FBXTextParser;
            })(parse = fbx.parse || (fbx.parse = {}));
        })(fbx = asset.fbx || (asset.fbx = {}));
    })(asset = sd.asset || (sd.asset = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var asset;
    (function (asset) {
        var fbx;
        (function (fbx) {
            var parse;
            (function (parse) {
                var fbxTypeNameMapping = {
                    "enum": 1,
                    "int": 1,
                    "integer": 1,
                    "float": 2,
                    "double": 2,
                    "number": 2,
                    "ulonglong": 2,
                    "fieldofview": 2,
                    "fieldofviewx": 2,
                    "fieldofviewy": 2,
                    "roll": 2,
                    "opticalcenterx": 2,
                    "opticalcentery": 2,
                    "bool": 3,
                    "visibility": 3,
                    "visibility inheritance": 3,
                    "ktime": 4,
                    "kstring": 5,
                    "datetime": 5,
                    "vector3d": 6,
                    "vector": 6,
                    "color": 6,
                    "colorrgb": 6,
                    "lcl translation": 6,
                    "lcl rotation": 6,
                    "lcl scaling": 6,
                    "colorandalpha": 7,
                    "object": 8,
                    "compound": 9,
                    "referenceproperty": 9
                };
                function interpretProp70P(pValues) {
                    sd.assert(pValues.length >= 4, "A P must have 4 or more values.");
                    var typeName = pValues[1];
                    var result = {
                        name: pValues[0],
                        typeName: typeName,
                        type: fbxTypeNameMapping[typeName.toLowerCase()] || 0,
                        values: pValues.slice(4)
                    };
                    if (result.type == 0) {
                        console.warn("Unknown typed prop typename: " + typeName);
                    }
                    return result;
                }
                parse.interpretProp70P = interpretProp70P;
            })(parse = fbx.parse || (fbx.parse = {}));
            var FBXNode = (function () {
                function FBXNode(name, values, type, typeName) {
                    if (type === void 0) { type = 0; }
                    if (typeName === void 0) { typeName = ""; }
                    this.name = name;
                    this.values = values;
                    this.type = type;
                    this.typeName = typeName;
                    this.children = [];
                    this.parent = null;
                    this.connectionsIn = [];
                    this.connectionsOut = [];
                }
                FBXNode.prototype.appendChild = function (node) {
                    sd.assert(node.parent == null, "Can't re-parent a Node");
                    node.parent = this;
                    this.children.push(node);
                };
                Object.defineProperty(FBXNode.prototype, "objectName", {
                    get: function () {
                        var cns = this.values[1];
                        return cns.split("::")[1];
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(FBXNode.prototype, "objectID", {
                    get: function () {
                        return this.values[0];
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(FBXNode.prototype, "objectSubClass", {
                    get: function () {
                        return this.values[2];
                    },
                    enumerable: true,
                    configurable: true
                });
                FBXNode.prototype.childByName = function (name) {
                    return this.children.find(function (c) { return c.name == name; });
                };
                return FBXNode;
            }());
            ;
            var FBXDocumentGraph = (function () {
                function FBXDocumentGraph(fbxFilePath) {
                    this.fbxFilePath = fbxFilePath;
                    this.globals = [];
                    this.allObjects = {};
                    this.geometryNodes = {};
                    this.videoNodes = {};
                    this.textureNodes = {};
                    this.materialNodes = {};
                    this.modelNodes = {};
                    this.attributeNodes = {};
                    this.animCurves = {};
                    this.animCurveNodes = {};
                    this.skinNodes = {};
                    this.clusterNodes = {};
                    this.connections = [];
                    this.hierarchyConnections = [];
                    this.flattenedModels = new Map();
                    this.bumpedMaterials = [];
                    this.rootNode = new FBXNode("Model", [0, "Model::RootNode", "RootNode"]);
                    this.allObjects[0] = this.rootNode;
                    this.modelNodes[0] = this.rootNode;
                    this.flattenedModels.set(0, asset.makeModel("RootNode", 0));
                }
                FBXDocumentGraph.prototype.globalSetting = function (node) {
                    this.globals.push(node);
                };
                FBXDocumentGraph.prototype.addObject = function (node) {
                    var typeSetMap = {
                        "Geometry": this.geometryNodes,
                        "Video": this.videoNodes,
                        "Texture": this.textureNodes,
                        "Material": this.materialNodes,
                        "Model": this.modelNodes,
                        "NodeAttribute": this.attributeNodes,
                        "AnimationCurveNode": this.animCurveNodes,
                        "AnimationCurve": this.animCurves,
                        "Deformer": this.clusterNodes
                    };
                    var id = node.objectID;
                    var subClass = node.objectSubClass;
                    var nodeSet = typeSetMap[node.name];
                    sd.assert(nodeSet != null, "Unknown object class " + node.name);
                    if (node.name == "Model") {
                        if (subClass != "Mesh" && subClass != "Root" && subClass != "LimbNode" && subClass != "Null" && subClass != "Light") {
                            return;
                        }
                    }
                    else if (node.name == "Geometry") {
                        if (subClass != "Mesh") {
                            return;
                        }
                    }
                    else if (node.name == "Video") {
                        if (subClass != "Clip") {
                            return;
                        }
                    }
                    else if (node.name == "NodeAttribute") {
                        if (subClass != "Root" && subClass != "LimbNode" && subClass != "Light") {
                            return;
                        }
                    }
                    else if (node.name == "Deformer") {
                        if (subClass == "Skin") {
                            nodeSet = this.skinNodes;
                        }
                        else if (subClass != "Cluster") {
                            return;
                        }
                    }
                    nodeSet[id] = node;
                    this.allObjects[id] = node;
                };
                FBXDocumentGraph.prototype.addConnection = function (conn) {
                    conn.fromNode = this.allObjects[conn.fromID];
                    conn.toNode = this.allObjects[conn.toID];
                    if (conn.fromNode && conn.toNode) {
                        conn.fromNode.connectionsOut.push(conn);
                        conn.toNode.connectionsIn.push(conn);
                        this.connections.push(conn);
                    }
                };
                FBXDocumentGraph.prototype.loadTextures = function (group, options) {
                    var _this = this;
                    var fileProms = [];
                    Object.keys(this.videoNodes).forEach(function (idStr) {
                        var vidID = +idStr;
                        var fbxVideo = _this.videoNodes[vidID];
                        var tex = {
                            name: fbxVideo.objectName,
                            userRef: vidID,
                            colourSpace: 1,
                            useMipMaps: options.forceMipMapsOn ? 1 : 0
                        };
                        var fileData = null;
                        for (var _i = 0, _a = fbxVideo.children; _i < _a.length; _i++) {
                            var c = _a[_i];
                            if (c.name == "UseMipMap") {
                                if (!options.forceMipMapsOn) {
                                    tex.useMipMaps = (c.values[0] != 0) ? 1 : 0;
                                }
                            }
                            else if (c.name == "RelativeFilename") {
                                tex.url = new URL(c.values[0], _this.fbxFilePath);
                            }
                            else if (c.name == "Content") {
                                fileData = c.values[0];
                            }
                        }
                        var makeTexDesc = function (img) {
                            return sd.render.makeTexDesc2DFromImageSource(img, 0, tex.useMipMaps);
                        };
                        if (fileData) {
                            var mime_1 = tex.url ? asset.mimeTypeForURL(tex.url) : "";
                            if (!mime_1) {
                                var err = "Cannot create texture, no mime-type found for file path " + tex.url;
                                if (options.allowMissingTextures) {
                                    console.warn(err);
                                }
                                else {
                                    fileProms.push(Promise.reject(err));
                                }
                            }
                            else {
                                fileProms.push(new Promise(function (resolve, reject) {
                                    asset.loadImageFromBuffer(fileData, mime_1).then(function (img) {
                                        tex.descriptor = makeTexDesc(img);
                                        resolve(tex);
                                    }, function (error) {
                                        if (options.allowMissingTextures) {
                                            console.warn(error);
                                            resolve(null);
                                        }
                                        else {
                                            reject(error);
                                        }
                                    });
                                }));
                            }
                        }
                        else if (tex.url) {
                            fileProms.push(asset.loadImageURL(tex.url).then(function (img) {
                                tex.descriptor = makeTexDesc(img);
                                return tex;
                            }).catch(function (error) {
                                if (options.allowMissingTextures) {
                                    console.warn(error);
                                    return null;
                                }
                                else {
                                    throw error;
                                }
                            }));
                        }
                        else {
                            var err = "Texture " + tex.userRef + " did not have relative filename or content.";
                            if (options.allowMissingTextures) {
                                console.warn(err);
                            }
                            else {
                                fileProms.push(Promise.reject(err));
                            }
                        }
                    });
                    return Promise.all(fileProms).then(function (textures) {
                        for (var _i = 0, textures_1 = textures; _i < textures_1.length; _i++) {
                            var tex = textures_1[_i];
                            group.addTexture(tex);
                        }
                        return group;
                    }, function () { return null; });
                };
                FBXDocumentGraph.prototype.buildMaterials = function (group, _options) {
                    for (var matID in this.materialNodes) {
                        var fbxMat = this.materialNodes[matID];
                        var mat = asset.makeMaterial();
                        mat.name = fbxMat.objectName;
                        mat.userRef = matID;
                        var haveFullDiffuse = false;
                        for (var _i = 0, _a = fbxMat.children; _i < _a.length; _i++) {
                            var c = _a[_i];
                            if (c.name == "Diffuse") {
                                sd.vec3.copy(mat.baseColour, c.values);
                                haveFullDiffuse = true;
                            }
                            else if (c.name == "DiffuseColor") {
                                if (!haveFullDiffuse) {
                                    sd.vec3.copy(mat.baseColour, c.values);
                                }
                            }
                            else if (c.name == "SpecularColor") {
                                sd.vec3.copy(mat.specularColour, c.values);
                            }
                            else if (c.name == "SpecularFactor") {
                                mat.specularIntensity = c.values[0];
                            }
                            else if (c.name == "ShininessExponent") {
                                mat.specularExponent = c.values[0];
                            }
                            else if (c.name == "EmissiveColor") {
                                sd.vec3.copy(mat.emissiveColour, c.values);
                            }
                            else if (c.name == "EmissiveFactor") {
                                mat.emissiveIntensity = c.values[0];
                            }
                            else if (c.name == "Opacity") {
                                mat.opacity = sd.math.clamp01(c.values[0]);
                            }
                        }
                        var _loop_1 = function (texIn) {
                            var texNode = texIn.fromNode;
                            var vidTexConn = texNode.connectionsIn[0];
                            var vidNodeID = vidTexConn && vidTexConn.fromID;
                            var tex2D = group.textures.find(function (t) { return !!t && t.userRef == vidNodeID; });
                            if (!(texNode && vidTexConn && tex2D)) {
                                console.warn("Could not link texture " + texIn.fromID + " to material prop " + texIn.propName + " because link or texture is invalid.");
                            }
                            else {
                                if (texIn.propName == "DiffuseColor") {
                                    mat.albedoTexture = tex2D;
                                }
                                else if (texIn.propName == "SpecularColor") {
                                    mat.specularTexture = tex2D;
                                }
                                else if (texIn.propName == "NormalMap") {
                                    mat.normalTexture = tex2D;
                                }
                                else if (texIn.propName == "Bump") {
                                    mat.heightTexture = tex2D;
                                }
                                else if (texIn.propName == "TransparentColor") {
                                    mat.transparencyTexture = tex2D;
                                }
                                else {
                                    console.warn("Unsupported texture property link: " + texIn.propName);
                                    return "continue";
                                }
                                for (var _i = 0, _a = texNode.children; _i < _a.length; _i++) {
                                    var tc = _a[_i];
                                    if (tc.name == "ModelUVTranslation") {
                                        sd.vec2.copy(mat.textureOffset, tc.values);
                                    }
                                    else if (tc.name == "ModelUVScaling") {
                                        sd.vec2.copy(mat.textureScale, tc.values);
                                    }
                                }
                            }
                        };
                        for (var _b = 0, _c = fbxMat.connectionsIn; _b < _c.length; _b++) {
                            var texIn = _c[_b];
                            _loop_1(texIn);
                        }
                        if (mat.normalTexture) {
                            this.bumpedMaterials.push(mat);
                        }
                        group.addMaterial(mat);
                    }
                };
                FBXDocumentGraph.prototype.makeLayerElementStream = function (layerElemNode) {
                    var valueArrayName, indexArrayName;
                    var stream = {
                        name: "",
                        includeInMesh: true,
                        mapping: 0
                    };
                    var layerElemIndex = layerElemNode.values[0];
                    if (layerElemIndex > 0) {
                        if (layerElemNode.name != "LayerElementUV") {
                            console.warn("FBX: ignoring non-UV geometry LayerElement with index > 0", layerElemNode);
                            return null;
                        }
                        else if (layerElemIndex > 3) {
                            console.warn("FBX: ignoring UV geometry LayerElement with index > 3", layerElemNode);
                            return null;
                        }
                    }
                    if (layerElemNode.name == "LayerElementNormal") {
                        valueArrayName = "Normals";
                        indexArrayName = "NormalsIndex";
                        stream.attr = { role: 2, field: 23 };
                    }
                    else if (layerElemNode.name == "LayerElementColor") {
                        valueArrayName = "Colors";
                        indexArrayName = "ColorIndex";
                        stream.attr = { role: 4, field: 23 };
                    }
                    else if (layerElemNode.name == "LayerElementUV") {
                        valueArrayName = "UV";
                        indexArrayName = "UVIndex";
                        stream.attr = { role: 6 + layerElemIndex, field: 22 };
                    }
                    else if (layerElemNode.name == "LayerElementTangent") {
                        valueArrayName = "Tangents";
                        indexArrayName = "TangentsIndex";
                        stream.attr = { role: 3, field: 23 };
                    }
                    else if (layerElemNode.name == "LayerElementMaterial") {
                        valueArrayName = "Materials";
                        indexArrayName = "--UNUSED--";
                        stream.includeInMesh = false;
                        stream.controlsGrouping = true;
                        stream.attr = { role: 5, field: 17 };
                    }
                    else {
                        sd.assert(false, "Unhandled layer element node");
                        valueArrayName = "--UNHANDLED--";
                        indexArrayName = "--UNHANDLED--";
                    }
                    for (var _i = 0, _a = layerElemNode.children; _i < _a.length; _i++) {
                        var c = _a[_i];
                        if (c.name == "Name") {
                            stream.name = c.values[0];
                        }
                        else if (c.name == "MappingInformationType") {
                            var mappingName = c.values[0];
                            if (mappingName == "ByVertice") {
                                stream.mapping = 1;
                            }
                            else if (mappingName == "ByPolygonVertex") {
                                stream.mapping = 2;
                            }
                            else if (mappingName == "ByPolygon") {
                                stream.mapping = 3;
                            }
                            else if (mappingName == "AllSame") {
                                stream.mapping = 4;
                            }
                            else {
                                sd.assert(false, "Unknown stream mapping name: " + mappingName);
                            }
                        }
                        else if (c.name == valueArrayName) {
                            stream.values = c.values[0];
                        }
                        else if (c.name == indexArrayName) {
                            stream.indexes = c.values[0];
                        }
                    }
                    if (layerElemNode.name == "LayerElementMaterial") {
                        sd.assert(stream.mapping == 3 || stream.mapping == 4, "A material stream must be a single value or be applied per polygon");
                    }
                    if (layerElemNode.name == "LayerElementUV") {
                        var uvElements = stream.values;
                        sd.assert(uvElements, "LayerElementUV without values is invalid!");
                        var uvElementCount = uvElements.length;
                        var uvOffset = 0;
                        while (uvOffset < uvElementCount) {
                            uvElements[uvOffset + 1] = 1.0 - uvElements[uvOffset + 1];
                            uvOffset += 2;
                        }
                    }
                    return stream;
                };
                FBXDocumentGraph.prototype.buildMeshes = function (group, _options) {
                    var tStreams = 0;
                    var tMeshData = 0;
                    for (var geomID in this.geometryNodes) {
                        var fbxGeom = this.geometryNodes[geomID];
                        var streams = [];
                        var positions = void 0;
                        var polygonIndexes = null;
                        for (var _i = 0, _a = fbxGeom.children; _i < _a.length; _i++) {
                            var c = _a[_i];
                            if (c.name == "Vertices") {
                                positions = c.values[0];
                            }
                            else if (c.name == "PolygonVertexIndex") {
                                polygonIndexes = c.values[0];
                            }
                            else if (c.name == "LayerElementNormal" ||
                                c.name == "LayerElementTangent" ||
                                c.name == "LayerElementColor" ||
                                c.name == "LayerElementUV" ||
                                c.name == "LayerElementMaterial") {
                                var strm = this.makeLayerElementStream(c);
                                if (strm) {
                                    streams.push(strm);
                                }
                            }
                        }
                        if (!(positions && polygonIndexes)) {
                            console.warn("FBXGeom ", fbxGeom, "is unsuitable for use.");
                            continue;
                        }
                        var t0 = performance.now();
                        var mb = new sd.meshdata.MeshBuilder(positions, null, streams);
                        var polygonIndexCount = polygonIndexes.length;
                        var polygonVertexIndexArray = [];
                        var vertexIndexArray = [];
                        for (var pvi = 0; pvi < polygonIndexCount; ++pvi) {
                            var vi = polygonIndexes[pvi];
                            polygonVertexIndexArray.push(pvi);
                            if (vi < 0) {
                                vertexIndexArray.push(~vi);
                                mb.addPolygon(polygonVertexIndexArray, vertexIndexArray);
                                polygonVertexIndexArray = [];
                                vertexIndexArray = [];
                            }
                            else {
                                vertexIndexArray.push(vi);
                            }
                        }
                        var t1 = performance.now();
                        var meshAsset = {
                            name: fbxGeom.objectName,
                            userRef: fbxGeom.objectID,
                            meshData: mb.complete(),
                            indexMap: mb.indexMap
                        };
                        var t2 = performance.now();
                        tStreams += (t1 - t0);
                        tMeshData += (t2 - t1);
                        group.addMesh(meshAsset);
                        for (var _b = 0, _c = fbxGeom.connectionsOut; _b < _c.length; _b++) {
                            var mco = _c[_b];
                            var model = mco.toNode;
                            if (model && model.name == "Model") {
                                var sdModel = this.flattenedModels.get(model.objectID);
                                sdModel.mesh = meshAsset;
                            }
                        }
                    }
                    console.info("fbx streams build time " + tStreams.toFixed(1));
                    console.info("fbx meshdata build time " + tMeshData.toFixed(1));
                };
                FBXDocumentGraph.prototype.makeLightAssetFromFBXLight = function (lightAttrNode) {
                    var ld = {
                        name: lightAttrNode.name,
                        userRef: lightAttrNode.objectID,
                        type: 2,
                        colour: [1, 1, 1],
                        intensity: 1,
                        range: 1,
                        cutoff: sd.math.deg2rad(45 / 2),
                        shadowType: 0,
                        shadowQuality: 0,
                        shadowStrength: 1
                    };
                    var fbxIntensity = 100;
                    var fbxDecayType = 1;
                    for (var _i = 0, _a = lightAttrNode.children; _i < _a.length; _i++) {
                        var c = _a[_i];
                        if (c.name == "LightType") {
                            var fbxLightType = c.values[0];
                            if (fbxLightType == 0) {
                                ld.type = 2;
                            }
                            else if (fbxLightType == 1) {
                                ld.type = 1;
                            }
                            else if (fbxLightType == 2) {
                                ld.type = 3;
                            }
                            else {
                                console.warn("Invalid FBX light type: " + fbxLightType);
                            }
                        }
                        else if (c.name == "Color") {
                            sd.vec3.copy(ld.colour, c.values);
                        }
                        else if (c.name == "Intensity") {
                            fbxIntensity = c.values[0];
                        }
                        else if (c.name == "OuterAngle") {
                            ld.cutoff = sd.math.deg2rad(c.values[0] / 2);
                        }
                        else if (c.name == "CastShadows") {
                            ld.shadowType = 2;
                        }
                        else if (c.name == "DecayType") {
                            fbxDecayType = c.values[0];
                        }
                    }
                    if (ld.type == 1) {
                        ld.intensity = 2;
                    }
                    else {
                        ld.range = Math.sqrt(fbxIntensity) * 2;
                        ld.intensity = fbxIntensity / 250;
                    }
                    return ld;
                };
                FBXDocumentGraph.prototype.buildModels = function (group, options) {
                    for (var modelID in this.modelNodes) {
                        var fbxModel = this.modelNodes[modelID];
                        var sdModel = asset.makeModel(fbxModel.objectName, fbxModel.objectID);
                        if (options.removeUnusedBones) {
                            var modelName = fbxModel.objectName;
                            if (modelName.length > 3 && modelName.substr(-3) == "Nub") {
                                continue;
                            }
                        }
                        var preRot = [0, 0, 0, 1];
                        var postRot = [0, 0, 0, 1];
                        var localRot = [0, 0, 0, 1];
                        for (var _i = 0, _a = fbxModel.children; _i < _a.length; _i++) {
                            var c = _a[_i];
                            var vecVal = c.values;
                            if (c.name == "Lcl Translation") {
                                sd.vec3.copy(sdModel.transform.position, vecVal);
                            }
                            else if (c.name == "Lcl Scaling") {
                                sd.vec3.copy(sdModel.transform.scale, vecVal);
                            }
                            else if (c.name == "Lcl Rotation") {
                                localRot = sd.quat.fromEuler(sd.math.deg2rad(vecVal[2]), sd.math.deg2rad(vecVal[1]), sd.math.deg2rad(vecVal[0]));
                            }
                            else if (c.name == "PreRotation") {
                                preRot = sd.quat.fromEuler(sd.math.deg2rad(vecVal[2]), sd.math.deg2rad(vecVal[1]), sd.math.deg2rad(vecVal[0]));
                            }
                            else if (c.name == "PostRotation") {
                                postRot = sd.quat.fromEuler(sd.math.deg2rad(vecVal[2]), sd.math.deg2rad(vecVal[1]), sd.math.deg2rad(vecVal[0]));
                            }
                        }
                        sdModel.transform.rotation = sd.quat.mul([], sd.quat.mul([], preRot, localRot), postRot);
                        var _loop_2 = function (conn) {
                            if (!conn.fromNode) {
                                console.error("Invalid model in-connection", conn);
                                return "continue";
                            }
                            var connType = conn.fromNode.name;
                            var connSubType = conn.fromNode.objectSubClass;
                            if (connType == "Material") {
                                var mat = group.materials.find(function (t) { return t && t.userRef == conn.fromID; });
                                if (mat) {
                                    if (!sdModel.materials) {
                                        sdModel.materials = [];
                                    }
                                    sdModel.materials.push(mat);
                                }
                                else {
                                    console.warn("Could not connect material " + conn.fromID + " to model " + modelID);
                                }
                            }
                            else if (connType == "NodeAttribute") {
                                if (connSubType == "LimbNode" || connSubType == "Root") {
                                    sdModel.joint = {
                                        root: connSubType == "Root"
                                    };
                                }
                                else if (connSubType == "Light") {
                                    sdModel.light = this_1.makeLightAssetFromFBXLight(conn.fromNode);
                                }
                            }
                            else if (connType == "Model") {
                                this_1.hierarchyConnections.push(conn);
                            }
                        };
                        var this_1 = this;
                        for (var _b = 0, _c = fbxModel.connectionsIn; _b < _c.length; _b++) {
                            var conn = _c[_b];
                            _loop_2(conn);
                        }
                        this.flattenedModels.set(sdModel.userRef, sdModel);
                    }
                };
                FBXDocumentGraph.prototype.buildHierarchy = function (group, _options) {
                    for (var _i = 0, _a = this.hierarchyConnections; _i < _a.length; _i++) {
                        var conn = _a[_i];
                        var childModel = this.flattenedModels.get(conn.fromID);
                        var parentModel = this.flattenedModels.get(conn.toID);
                        if (childModel && parentModel) {
                            parentModel.children.push(childModel);
                            sd.assert(childModel.parent == null, "Cannot re-parent node " + childModel.userRef);
                            childModel.parent = parentModel;
                            if (conn.toID == 0) {
                                group.addModel(childModel);
                            }
                        }
                    }
                };
                FBXDocumentGraph.prototype.animPropForConnectionNames = function (curvePropName, modelPropName) {
                    var ap = 0;
                    if (modelPropName == "Lcl Translation") {
                        if (curvePropName == "d|X") {
                            ap = 1;
                        }
                        else if (curvePropName == "d|Y") {
                            ap = 2;
                        }
                        else if (curvePropName == "d|Z") {
                            ap = 3;
                        }
                    }
                    else if (modelPropName == "Lcl Rotation") {
                        if (curvePropName == "d|X") {
                            ap = 4;
                        }
                        else if (curvePropName == "d|Y") {
                            ap = 5;
                        }
                        else if (curvePropName == "d|Z") {
                            ap = 6;
                        }
                    }
                    else if (modelPropName == "Lcl Scaling") {
                        if (curvePropName == "d|X") {
                            ap = 7;
                        }
                        else if (curvePropName == "d|Y") {
                            ap = 8;
                        }
                        else if (curvePropName == "d|Z") {
                            ap = 9;
                        }
                    }
                    return ap;
                };
                FBXDocumentGraph.prototype.buildAnimations = function (_group, _options) {
                    var KTimeUnit = 46186158000;
                    for (var curveNodeID in this.animCurveNodes) {
                        var fbxCurveNode = this.animCurveNodes[curveNodeID];
                        if (fbxCurveNode.connectionsIn.length == 0 || fbxCurveNode.connectionsOut.length == 0) {
                            continue;
                        }
                        var outConn = fbxCurveNode.connectionsOut[0];
                        if (!(outConn && outConn.propName)) {
                            continue;
                        }
                        var jointModel = this.flattenedModels.get(outConn.toID);
                        if (!jointModel) {
                            continue;
                        }
                        var tracks = [];
                        for (var _i = 0, _a = fbxCurveNode.connectionsIn; _i < _a.length; _i++) {
                            var inConn = _a[_i];
                            var curve = inConn.fromNode;
                            if (!(curve && inConn.propName)) {
                                console.error("AnimationCurve in-connection is invalid!", inConn);
                                continue;
                            }
                            var timesNode = curve.childByName("KeyTime");
                            var valuesNode = curve.childByName("KeyValueFloat");
                            if (timesNode && valuesNode) {
                                var times = timesNode.values[0];
                                var values = valuesNode.values[0];
                                var count = times.length;
                                sd.assert(times.length == values.length, "Invalid animation key data");
                                var animProp = this.animPropForConnectionNames(inConn.propName, outConn.propName);
                                for (var t = 0; t < count; ++t) {
                                    times[t] /= KTimeUnit;
                                }
                                if (animProp >= 4 && animProp <= 6) {
                                    for (var t = 0; t < count; ++t) {
                                        values[t] = sd.math.deg2rad(values[t]);
                                    }
                                }
                                tracks.push({
                                    animationName: "Take 001",
                                    property: animProp,
                                    key: {
                                        times: times,
                                        values: values
                                    }
                                });
                            }
                        }
                        if (tracks.length) {
                            jointModel.animations = (jointModel.animations || []).concat(tracks);
                        }
                    }
                };
                FBXDocumentGraph.prototype.buildSkins = function (_group, _options) {
                    for (var skinNodeID in this.skinNodes) {
                        var fbxSkin = this.skinNodes[skinNodeID];
                        if (fbxSkin.connectionsIn.length == 0 || fbxSkin.connectionsOut.length == 0) {
                            console.warn("Skin " + skinNodeID + " either has no mesh or no clusters. Skipping.");
                            continue;
                        }
                        var sdSkin = {
                            name: fbxSkin.objectName,
                            userRef: fbxSkin.objectID,
                            groups: []
                        };
                        for (var _i = 0, _a = fbxSkin.connectionsIn; _i < _a.length; _i++) {
                            var clusterConn = _a[_i];
                            var cluster = clusterConn.fromNode;
                            if (!cluster) {
                                console.error("Skin cluster connection is invalid", fbxSkin);
                                continue;
                            }
                            var wvg = {
                                name: cluster.objectName,
                                userRef: cluster.objectID,
                                indexes: null,
                                weights: null,
                                bindPoseLocalTranslation: null,
                                bindPoseLocalRotation: null,
                                bindPoseLocalMatrix: null
                            };
                            for (var _b = 0, _c = cluster.children; _b < _c.length; _b++) {
                                var cc = _c[_b];
                                if (cc.name == "Indexes") {
                                    wvg.indexes = (cc.values[0]);
                                }
                                else if (cc.name == "Weights") {
                                    wvg.weights = (cc.values[0]);
                                }
                                else if (cc.name == "Transform") {
                                    var txmat = (cc.values[0]);
                                    var mat33 = sd.mat3.fromMat4([], txmat);
                                    var txq = sd.quat.fromMat3([], mat33);
                                    var trans = [txmat[12], txmat[13], txmat[14]];
                                    wvg.bindPoseLocalTranslation = trans;
                                    wvg.bindPoseLocalRotation = txq;
                                    wvg.bindPoseLocalMatrix = txmat;
                                }
                            }
                            if (!(wvg.indexes && wvg.weights && wvg.bindPoseLocalTranslation && wvg.bindPoseLocalRotation)) {
                                console.warn("Incomplete cluster " + clusterConn.fromID, cluster, wvg);
                            }
                            else {
                                for (var _d = 0, _e = cluster.connectionsIn; _d < _e.length; _d++) {
                                    var cinc = _e[_d];
                                    var cinNode = cinc.fromNode;
                                    if (!cinNode) {
                                        console.error("Cluster in-connection Model is invalid", cluster);
                                        continue;
                                    }
                                    if (cinNode.name == "Model") {
                                        var sdModel = this.flattenedModels.get(cinNode.objectID);
                                        if (sdModel) {
                                            if (sdModel.joint) {
                                                sdModel.vertexGroup = wvg;
                                            }
                                            else {
                                                console.warn("Model " + cinNode.objectID + " has a cluster but no joint?");
                                            }
                                        }
                                        else {
                                            console.warn("Can't connect cluster " + cluster.objectID + " to non-existent model " + cinNode.objectID);
                                        }
                                    }
                                }
                                sdSkin.groups.push(wvg);
                            }
                        }
                    }
                };
                FBXDocumentGraph.prototype.resolve = function (options) {
                    var _this = this;
                    var defaults = __assign({ allowMissingTextures: true, forceMipMapsOn: true, removeUnusedBones: true }, options);
                    return this.loadTextures(new asset.AssetGroup(), defaults)
                        .then(function (group) {
                        _this.buildMaterials(group, defaults);
                        _this.buildModels(group, defaults);
                        _this.buildHierarchy(group, defaults);
                        _this.buildSkins(group, defaults);
                        _this.buildAnimations(group, defaults);
                        _this.buildMeshes(group, defaults);
                        console.info("Doc", _this);
                        return group;
                    });
                };
                return FBXDocumentGraph;
            }());
            var FBX7DocumentParser = (function () {
                function FBX7DocumentParser(filePath) {
                    this.state = 0;
                    this.depth = 0;
                    this.curObject = null;
                    this.curNodeParent = null;
                    this.assets_ = null;
                    this.parseT0 = 0;
                    this.doc = new FBXDocumentGraph(filePath);
                    this.knownObjects = new Set([
                        "Geometry", "Video", "Texture", "Material", "Model", "NodeAttribute",
                        "AnimationCurve", "AnimationCurveNode", "Deformer"
                    ]);
                }
                FBX7DocumentParser.prototype.block = function (name, values) {
                    if (this.parseT0 == 0) {
                        this.parseT0 = performance.now();
                    }
                    var skip = false;
                    if (this.state == 0) {
                        if (name == "GlobalSettings") {
                            this.state = 1;
                        }
                        else if (name == "Objects") {
                            this.state = 2;
                        }
                        else if (name == "Connections") {
                            this.state = 4;
                        }
                        else {
                            skip = true;
                        }
                    }
                    else if (this.state == 2) {
                        if (this.knownObjects.has(name)) {
                            this.state = 3;
                            this.curObject = new FBXNode(name, values);
                            this.curNodeParent = this.curObject;
                        }
                        else {
                            skip = true;
                        }
                    }
                    else if (this.curNodeParent) {
                        var node = new FBXNode(name, values);
                        this.curNodeParent.appendChild(node);
                        this.curNodeParent = node;
                    }
                    if (!skip) {
                        this.depth++;
                        return 0;
                    }
                    return 1;
                };
                FBX7DocumentParser.prototype.endBlock = function () {
                    this.depth--;
                    if (this.depth == 1) {
                        if (this.state == 3) {
                            this.doc.addObject(this.curObject);
                            this.curObject = null;
                            this.curNodeParent = null;
                            this.state = 2;
                        }
                    }
                    else if (this.depth == 0) {
                        this.state = 0;
                    }
                    else if (this.curNodeParent) {
                        this.curNodeParent = this.curNodeParent.parent;
                        sd.assert(this.curNodeParent != null);
                    }
                };
                FBX7DocumentParser.prototype.property = function (name, values) {
                    this.typedProperty(name, 0, "", values);
                };
                FBX7DocumentParser.prototype.typedProperty = function (name, type, typeName, values) {
                    var node = new FBXNode(name, values, type, typeName);
                    if (this.state == 1) {
                        this.doc.globalSetting(node);
                    }
                    else if (this.state == 3) {
                        this.curNodeParent.appendChild(node);
                    }
                    else if (this.state == 4) {
                        sd.assert(name == "C", "Only C properties are allowed inside Connections");
                        var binding = node.values[0];
                        var fromID = node.values[1];
                        var toID = node.values[2];
                        if (binding == "OO") {
                            this.doc.addConnection({ fromID: fromID, toID: toID });
                        }
                        else if (binding == "OP") {
                            this.doc.addConnection({ fromID: fromID, toID: toID, propName: node.values[3] });
                        }
                        else {
                            console.warn("Don't know what to do with connection: ", node.values);
                        }
                    }
                };
                FBX7DocumentParser.prototype.completed = function () {
                    var parseTime = (performance.now() - this.parseT0).toFixed(1);
                    console.info("fbx parse time " + parseTime);
                    this.assets_ = this.doc.resolve();
                };
                FBX7DocumentParser.prototype.error = function (msg, offset, token) {
                    console.warn("FBX parse error @ offset " + offset + ": " + msg, token);
                };
                Object.defineProperty(FBX7DocumentParser.prototype, "assets", {
                    get: function () {
                        return this.assets_ || Promise.reject("No assets have been created yet.");
                    },
                    enumerable: true,
                    configurable: true
                });
                return FBX7DocumentParser;
            }());
            fbx.FBX7DocumentParser = FBX7DocumentParser;
        })(fbx = asset.fbx || (asset.fbx = {}));
        function parseFBXSource(filePath, source) {
            var t0 = performance.now();
            var del = new fbx.FBX7DocumentParser(filePath);
            var parser;
            if (typeof source === "string") {
                parser = new fbx.parse.FBXTextParser(source, del);
            }
            else {
                parser = new fbx.parse.FBXBinaryParser(source, del);
            }
            parser.parse();
            return del.assets.then(function (grp) {
                var totalTime = (performance.now() - t0).toFixed(1);
                console.info("fbx total time: " + totalTime + "ms");
                return grp;
            });
        }
        function loadFBXTextFile(url) {
            return asset.loadFile(url).then(function (text) { return parseFBXSource(url.href, text); });
        }
        asset.loadFBXTextFile = loadFBXTextFile;
        function loadFBXBinaryFile(url) {
            return asset.loadFile(url, { responseType: 1 }).then(function (data) { return parseFBXSource(url.href, data); });
        }
        asset.loadFBXBinaryFile = loadFBXBinaryFile;
        function loadFBXFile(url) {
            return asset.loadFile(url, { responseType: 1 }).then(function (data) {
                var ident = asset.convertBytesToString(new Uint8Array(data, 0, 20));
                if (ident === "Kaydara FBX Binary  ") {
                    return parseFBXSource(url.href, data);
                }
                else {
                    var blob = new Blob([data], { type: "text/plain" });
                    return asset.BlobReader.readAsText(blob).then(function (source) {
                        return parseFBXSource(url.href, source);
                    });
                }
            });
        }
        asset.loadFBXFile = loadFBXFile;
        asset.registerFileExtension("fbx", "application/fbx");
        asset.registerURLLoaderForMIMEType("application/fbx", function (url, _) { return loadFBXFile(url); });
    })(asset = sd.asset || (sd.asset = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var asset;
    (function (asset) {
        function loadImageURL(url, mimeType) {
            if (!mimeType) {
                var extension = asset.fileExtensionOfURL(url);
                mimeType = asset.mimeTypeForFileExtension(extension);
            }
            if (!mimeType) {
                return Promise.reject("Cannot determine mime-type of '" + url + "'");
            }
            var loader = asset.urlLoaderForMIMEType(mimeType);
            if (!loader) {
                return Promise.reject("No buffer loader available for mime-type '" + mimeType + "'");
            }
            else {
                return loader(url, mimeType).then(function (group) {
                    var tex = group.textures[0];
                    if (tex && tex.descriptor && tex.descriptor.pixelData && (tex.descriptor.pixelData.length === 1)) {
                        return tex.descriptor.pixelData[0];
                    }
                    else {
                        throw new Error("Internal error in image loader.");
                    }
                });
            }
        }
        asset.loadImageURL = loadImageURL;
        function loadImageFromBuffer(buffer, mimeType) {
            var loader = asset.bufferLoaderForMIMEType(mimeType);
            if (!loader) {
                return Promise.reject("No buffer loader available for mime-type '" + mimeType + "'");
            }
            else {
                return loader(buffer, mimeType).then(function (group) {
                    var tex = group.textures[0];
                    if (tex && tex.descriptor && tex.descriptor.pixelData && (tex.descriptor.pixelData.length === 1)) {
                        return tex.descriptor.pixelData[0];
                    }
                    else {
                        throw new Error("Internal error in image loader.");
                    }
                });
            }
        }
        asset.loadImageFromBuffer = loadImageFromBuffer;
        function imageData(image) {
            var cvs = document.createElement("canvas");
            cvs.width = image.width;
            cvs.height = image.height;
            var tc = cvs.getContext("2d");
            tc.drawImage(image, 0, 0);
            return tc.getImageData(0, 0, image.width, image.height);
        }
        asset.imageData = imageData;
        function loadImageDataURL(url) {
            return loadImageURL(url).then(function (imageOrData) {
                if ("data" in imageOrData) {
                    return imageOrData;
                }
                else {
                    return imageData(imageOrData);
                }
            });
        }
        asset.loadImageDataURL = loadImageDataURL;
        function assetGroupForImage(image) {
            var ag = new asset.AssetGroup();
            ag.addTexture({
                name: name,
                descriptor: sd.render.makeTexDesc2DFromImageSource(image, 0),
                colourSpace: 0
            });
            return ag;
        }
        function debugDumpPixelData(pixels, width, height) {
            var cvs = document.createElement("canvas");
            cvs.width = width;
            cvs.height = height;
            var ctx = cvs.getContext("2d");
            var imageData = ctx.createImageData(width, height);
            imageData.data.set(pixels);
            ctx.putImageData(imageData, 0, 0);
            document.body.appendChild(cvs);
        }
        asset.debugDumpPixelData = debugDumpPixelData;
        function loadBuiltInImageFromURL(url) {
            return new Promise(function (resolve, reject) {
                var image = new Image();
                image.onload = function () {
                    resolve(image);
                };
                image.onerror = function () {
                    reject(url.href + " doesn't exist or is not supported");
                };
                if (url.origin !== location.origin) {
                    image.crossOrigin = "anonymous";
                }
                image.src = url.href;
            });
        }
        asset.loadBuiltInImageFromURL = loadBuiltInImageFromURL;
        function loadBuiltInImageFromBuffer(buffer, mimeType) {
            return new Promise(function (resolve, reject) {
                var blob = new Blob([buffer], { type: mimeType });
                asset.BlobReader.readAsDataURL(blob).then(function (dataURL) {
                    var img = new Image();
                    img.onload = function () {
                        resolve(img);
                    };
                    img.onerror = function () {
                        reject("Bad or unsupported image data.");
                    };
                    img.src = dataURL;
                }, function (error) {
                    reject(error);
                });
            });
        }
        asset.loadBuiltInImageFromBuffer = loadBuiltInImageFromBuffer;
        function builtInImageLoader(source, mimeType) {
            var imagePromise = (source instanceof URL) ? loadBuiltInImageFromURL(source) : loadBuiltInImageFromBuffer(source, mimeType);
            return imagePromise.then(function (img) {
                return assetGroupForImage(img);
            });
        }
        asset.registerFileExtension("bm", "image/bmp");
        asset.registerFileExtension("bmp", "image/bmp");
        asset.registerFileExtension("png", "image/png");
        asset.registerFileExtension("jpg", "image/jpeg");
        asset.registerFileExtension("jpeg", "image/jpeg");
        asset.registerFileExtension("gif", "image/gif");
        asset.registerLoadersForMIMEType("image/bmp", builtInImageLoader, builtInImageLoader);
        asset.registerLoadersForMIMEType("image/png", builtInImageLoader, builtInImageLoader);
        asset.registerLoadersForMIMEType("image/jpeg", builtInImageLoader, builtInImageLoader);
        asset.registerLoadersForMIMEType("image/gif", builtInImageLoader, builtInImageLoader);
        var nativeTGASupport = null;
        function checkNativeTGASupport() {
            if (nativeTGASupport === null) {
                return new Promise(function (resolve, _) {
                    var img = new Image();
                    img.onload = function () { nativeTGASupport = true; resolve(true); };
                    img.onerror = function () { nativeTGASupport = false; resolve(false); };
                    img.src = "data:image/tga;base64,AAACAAAAAAAAAAAAAQABABgA////";
                });
            }
            return Promise.resolve(nativeTGASupport);
        }
        function loadTGAImageFromBuffer(buffer) {
            var headerView = new DataView(buffer, 0, 18);
            var identLengthUnused = headerView.getUint8(0);
            var usePalette = headerView.getUint8(1);
            var imageType = headerView.getUint8(2);
            sd.assert(identLengthUnused === 0, "Unsupported TGA format.");
            sd.assert(usePalette === 0, "Paletted TGA images are not supported.");
            sd.assert((imageType & 32) === 0, "Compressed TGA images are not supported.");
            var width = headerView.getUint16(12, true);
            var height = headerView.getUint16(14, true);
            var bitDepth = headerView.getUint8(16);
            var bytesPerPixel = 0;
            if ((imageType & 7) == 2) {
                if (bitDepth == 24) {
                    bytesPerPixel = 3;
                }
                else if (bitDepth == 32) {
                    bytesPerPixel = 4;
                }
                else {
                    throw new Error("Only 24 or 32 bit RGB TGA images are supported.");
                }
            }
            else if ((imageType & 7) == 3) {
                bytesPerPixel = 1;
                sd.assert(bitDepth === 8, "Only 8-bit grayscale TGA images are supported.");
            }
            else {
                throw new Error("Unknown or inconsistent TGA image type");
            }
            var tempCanvas = document.createElement("canvas");
            var imageData = tempCanvas.getContext("2d").createImageData(width, height);
            var sourcePixels = new Uint8ClampedArray(buffer, 18);
            var destPixels = imageData.data;
            var sourceOffset = 0;
            var destOffset = (height - 1) * width * 4;
            var pixelsLeft = width * height;
            var pixelRunLeft = imageType & 8 ? 0 : pixelsLeft;
            var pixelRunRaw = true;
            var linePixelsLeft = width;
            if (bytesPerPixel == 1) {
                while (pixelsLeft > 0) {
                    if (pixelRunLeft == 0) {
                        var ctrl = sourcePixels[sourceOffset];
                        pixelRunRaw = (ctrl & 0x80) == 0;
                        pixelRunLeft = 1 + (ctrl & 0x7f);
                        sourceOffset += 1;
                    }
                    var gray = sourcePixels[sourceOffset];
                    destPixels[destOffset] = gray;
                    destPixels[destOffset + 1] = gray;
                    destPixels[destOffset + 2] = gray;
                    destPixels[destOffset + 3] = 255;
                    pixelRunLeft -= 1;
                    pixelsLeft -= 1;
                    if (pixelRunRaw || pixelRunLeft == 0) {
                        sourceOffset += 1;
                    }
                    destOffset += 4;
                    linePixelsLeft -= 1;
                    if (linePixelsLeft == 0) {
                        destOffset -= 2 * width * 4;
                        linePixelsLeft = width;
                    }
                }
            }
            else if (bytesPerPixel == 3) {
                while (pixelsLeft > 0) {
                    if (pixelRunLeft == 0) {
                        var ctrl = sourcePixels[sourceOffset];
                        pixelRunRaw = (ctrl & 0x80) == 0;
                        pixelRunLeft = 1 + (ctrl & 0x7f);
                        sourceOffset += 1;
                    }
                    destPixels[destOffset] = sourcePixels[sourceOffset + 2];
                    destPixels[destOffset + 1] = sourcePixels[sourceOffset + 1];
                    destPixels[destOffset + 2] = sourcePixels[sourceOffset];
                    destPixels[destOffset + 3] = 255;
                    pixelRunLeft -= 1;
                    pixelsLeft -= 1;
                    if (pixelRunRaw || pixelRunLeft == 0) {
                        sourceOffset += 3;
                    }
                    destOffset += 4;
                    linePixelsLeft -= 1;
                    if (linePixelsLeft == 0) {
                        destOffset -= 2 * width * 4;
                        linePixelsLeft = width;
                    }
                }
            }
            else if (bytesPerPixel == 4) {
                while (pixelsLeft > 0) {
                    if (pixelRunLeft == 0) {
                        var ctrl = sourcePixels[sourceOffset];
                        pixelRunRaw = (ctrl & 0x80) == 0;
                        pixelRunLeft = 1 + (ctrl & 0x7f);
                        sourceOffset += 1;
                    }
                    destPixels[destOffset] = sourcePixels[sourceOffset + 2];
                    destPixels[destOffset + 1] = sourcePixels[sourceOffset + 1];
                    destPixels[destOffset + 2] = sourcePixels[sourceOffset];
                    destPixels[destOffset + 3] = sourcePixels[sourceOffset + 3];
                    pixelRunLeft -= 1;
                    pixelsLeft -= 1;
                    if (pixelRunRaw || pixelRunLeft == 0) {
                        sourceOffset += 4;
                    }
                    destOffset += 4;
                    linePixelsLeft -= 1;
                    if (linePixelsLeft == 0) {
                        destOffset -= 2 * width * 4;
                        linePixelsLeft = width;
                    }
                }
            }
            return imageData;
        }
        asset.loadTGAImageFromBuffer = loadTGAImageFromBuffer;
        function tgaLoader(source, mimeType) {
            if (source instanceof URL) {
                return checkNativeTGASupport().then(function (supported) {
                    if (supported) {
                        return loadBuiltInImageFromURL(source).then(function (image) {
                            return assetGroupForImage(image);
                        });
                    }
                    else {
                        return asset.loadFile(source.href, { responseType: 1 }).then(function (buf) {
                            return assetGroupForImage(loadTGAImageFromBuffer(buf));
                        });
                    }
                });
            }
            else {
                return checkNativeTGASupport().then(function (supported) {
                    if (supported) {
                        return loadBuiltInImageFromBuffer(source, mimeType).then(function (image) {
                            return assetGroupForImage(image);
                        });
                    }
                    else {
                        return Promise.resolve(assetGroupForImage(loadTGAImageFromBuffer(source)));
                    }
                });
            }
        }
        asset.tgaLoader = tgaLoader;
        asset.registerFileExtension("tga", "image/tga");
        asset.registerLoadersForMIMEType("image/tga", tgaLoader, tgaLoader);
    })(asset = sd.asset || (sd.asset = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var asset;
    (function (asset) {
        var md5;
        (function (md5) {
            var parse;
            (function (parse) {
                var MD5Tokenizer = (function () {
                    function MD5Tokenizer(source) {
                        this.source = source;
                        this.offset_ = -1;
                        this.length_ = 0;
                        this.lastChar_ = "";
                        this.length_ = source.length;
                    }
                    MD5Tokenizer.prototype.nextChar = function () {
                        this.offset_++;
                        if (this.offset_ < this.length_) {
                            this.lastChar_ = this.source[this.offset_];
                        }
                        else {
                            this.lastChar_ = null;
                        }
                        return this.lastChar_;
                    };
                    MD5Tokenizer.prototype.skipWS = function () {
                        var c;
                        while (c = this.nextChar()) {
                            if (c != " " && c != "\t" && c != "\r" && c != "\n") {
                                break;
                            }
                        }
                    };
                    MD5Tokenizer.prototype.skipToLineEnd = function () {
                        var c;
                        while (c = this.nextChar()) {
                            if (c == "\r" || c == "\n") {
                                break;
                            }
                        }
                    };
                    Object.defineProperty(MD5Tokenizer.prototype, "offset", {
                        get: function () { return this.offset_; },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(MD5Tokenizer.prototype, "length", {
                        get: function () { return this.length_; },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(MD5Tokenizer.prototype, "eof", {
                        get: function () { return this.offset_ >= this.length_; },
                        enumerable: true,
                        configurable: true
                    });
                    MD5Tokenizer.prototype.nextToken = function () {
                        var _this = this;
                        this.skipWS();
                        if (this.offset_ >= this.length_) {
                            this.offset_ = this.length_;
                            return {
                                type: 1,
                                offset: this.length_
                            };
                        }
                        var tokenStart = this.offset_;
                        var tokenEnd = 0;
                        var c = this.lastChar_;
                        var invalid = function () {
                            return {
                                type: 0,
                                offset: tokenStart,
                                val: _this.source.substring(tokenStart, tokenEnd + 1)
                            };
                        };
                        if (c == "/") {
                            var cc = this.nextChar();
                            if (cc == "/") {
                                this.skipToLineEnd();
                                return this.nextToken();
                            }
                            else {
                                return invalid();
                            }
                        }
                        else if (c == '"') {
                            while (c = this.nextChar()) {
                                if (c == '"' || c == "\r" || c == "\n") {
                                    break;
                                }
                            }
                            tokenEnd = this.offset_;
                            if (c != '"') {
                                return invalid();
                            }
                            else {
                                return {
                                    type: 3,
                                    offset: tokenStart,
                                    val: this.source.substring(tokenStart + 1, tokenEnd)
                                };
                            }
                        }
                        else if (c == "{") {
                            return {
                                type: 5,
                                offset: tokenStart
                            };
                        }
                        else if (c == "}") {
                            return {
                                type: 6,
                                offset: tokenStart
                            };
                        }
                        else if (c == "(") {
                            return {
                                type: 7,
                                offset: tokenStart
                            };
                        }
                        else if (c == ")") {
                            return {
                                type: 8,
                                offset: tokenStart
                            };
                        }
                        else {
                            var firstChar = c;
                            while (c = this.nextChar()) {
                                if (c == " " || c == "\t" || c == "\r" || c == "\n" || c == "," || c == "{" || c == "}" || c == "(" || c == ")" || c == '"') {
                                    break;
                                }
                            }
                            tokenEnd = this.offset_;
                            this.offset_--;
                            var token = this.source.substring(tokenStart, tokenEnd);
                            if ((firstChar >= "A" && firstChar <= "Z") || (firstChar >= "a" && firstChar <= "z")) {
                                return {
                                    type: 2,
                                    offset: tokenStart,
                                    val: token.substr(0, token.length).toLowerCase()
                                };
                            }
                            else if (firstChar == "-" || (firstChar >= "0" && firstChar <= "9")) {
                                var num = parseFloat(token);
                                if (isNaN(num)) {
                                    return invalid();
                                }
                                return {
                                    type: 4,
                                    offset: tokenStart,
                                    val: num
                                };
                            }
                            else {
                                return invalid();
                            }
                        }
                    };
                    return MD5Tokenizer;
                }());
                var MD5Parser = (function () {
                    function MD5Parser(source, delegate_) {
                        this.delegate_ = delegate_;
                        this.stop_ = false;
                        this.tokenizer_ = new MD5Tokenizer(source);
                    }
                    MD5Parser.prototype.unexpected = function (token, message) {
                        if (!message) {
                            message = (token.type == 0) ? "Invalid token" : "Unexpected token";
                        }
                        this.delegate_.error(message, token.offset, token.val !== undefined ? token.val.toString() : undefined);
                        this.stop_ = true;
                    };
                    MD5Parser.prototype.expectNext = function (tokenType, tokenVal) {
                        var token = this.tokenizer_.nextToken();
                        if (token.type == 1) {
                            this.stop_ = true;
                        }
                        if (token.type == tokenType) {
                            if (tokenVal === undefined || tokenVal === token.val) {
                                return token;
                            }
                        }
                        this.unexpected(token);
                        return null;
                    };
                    MD5Parser.prototype.nextToken = function () {
                        var token = this.tokenizer_.nextToken();
                        if (token.type == 1) {
                            this.stop_ = true;
                        }
                        return token;
                    };
                    Object.defineProperty(MD5Parser.prototype, "offset", {
                        get: function () { return this.tokenizer_.offset; },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(MD5Parser.prototype, "eof", {
                        get: function () { return this.tokenizer_.eof; },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(MD5Parser.prototype, "stop", {
                        get: function () { return this.stop_; },
                        enumerable: true,
                        configurable: true
                    });
                    return MD5Parser;
                }());
                function computeQuatW(q) {
                    var t = 1.0 - (q[0] * q[0]) - (q[1] * q[1]) - (q[2] * q[2]);
                    if (t < 0.0) {
                        q[3] = 0.0;
                    }
                    else {
                        q[3] = -Math.sqrt(t);
                    }
                }
                parse.computeQuatW = computeQuatW;
                var MD5MeshParser = (function () {
                    function MD5MeshParser(source, delegate_) {
                        this.delegate_ = delegate_;
                        this.meshCount_ = 0;
                        this.jointCount_ = 0;
                        this.parser_ = new MD5Parser(source, delegate_);
                    }
                    MD5MeshParser.prototype.parseMeshVertices = function (count) {
                        while (!this.parser_.stop && count > 0) {
                            if (this.parser_.expectNext(2, "vert")) {
                                var index = this.parser_.expectNext(4);
                                if (index && this.parser_.expectNext(7)) {
                                    var texU = this.parser_.expectNext(4);
                                    var texV = this.parser_.expectNext(4);
                                    if (texU && texV && this.parser_.expectNext(8)) {
                                        var weightOffset = this.parser_.expectNext(4);
                                        var weightCount = this.parser_.expectNext(4);
                                        if (weightOffset && weightCount) {
                                            var uv = [texU.val, texV.val];
                                            this.delegate_.vertex(index.val | 0, uv, weightOffset.val | 0, weightCount.val | 0);
                                        }
                                    }
                                }
                            }
                            --count;
                        }
                    };
                    MD5MeshParser.prototype.parseMeshTriangles = function (count) {
                        while (!this.parser_.stop && count > 0) {
                            if (this.parser_.expectNext(2, "tri")) {
                                var index = this.parser_.expectNext(4);
                                var a = this.parser_.expectNext(4);
                                var b = this.parser_.expectNext(4);
                                var c = this.parser_.expectNext(4);
                                if (index && a && b && c) {
                                    var points = [a.val | 0, b.val | 0, c.val | 0];
                                    this.delegate_.triangle(index.val | 0, points);
                                }
                            }
                            --count;
                        }
                    };
                    MD5MeshParser.prototype.parseMeshWeights = function (count) {
                        while (!this.parser_.stop && count > 0) {
                            if (this.parser_.expectNext(2, "weight")) {
                                var index = this.parser_.expectNext(4);
                                var jointIndex = this.parser_.expectNext(4);
                                var bias = this.parser_.expectNext(4);
                                if (index && jointIndex && bias && this.parser_.expectNext(7)) {
                                    var posX = this.parser_.expectNext(4);
                                    var posY = this.parser_.expectNext(4);
                                    var posZ = this.parser_.expectNext(4);
                                    if (posX && posY && posZ && this.parser_.expectNext(8)) {
                                        var pos = [posX.val, posY.val, posZ.val];
                                        this.delegate_.weight(index.val | 0, jointIndex.val | 0, bias.val, pos);
                                    }
                                }
                            }
                            --count;
                        }
                    };
                    MD5MeshParser.prototype.parseMesh = function () {
                        if (--this.meshCount_ < 0) {
                            this.delegate_.error("Too many meshes in file", this.parser_.offset);
                            return;
                        }
                        if (this.parser_.expectNext(5)) {
                            var cmdN = void 0;
                            do {
                                cmdN = this.parser_.nextToken();
                                if (cmdN.type == 2) {
                                    var cmd = cmdN && cmdN.val;
                                    if (cmd == "shader") {
                                        var shader = this.parser_.expectNext(3);
                                        if (shader) {
                                            this.delegate_.materialName(shader.val);
                                        }
                                    }
                                    else if (cmd == "numverts") {
                                        var vertCount = this.parser_.expectNext(4);
                                        if (vertCount) {
                                            var vc = vertCount.val | 0;
                                            this.delegate_.vertexCount(vc);
                                            this.parseMeshVertices(vc);
                                        }
                                    }
                                    else if (cmd == "numtris") {
                                        var triCount = this.parser_.expectNext(4);
                                        if (triCount) {
                                            var tc = triCount.val | 0;
                                            this.delegate_.triangleCount(tc);
                                            this.parseMeshTriangles(tc);
                                        }
                                    }
                                    else if (cmd == "numweights") {
                                        var weightCount = this.parser_.expectNext(4);
                                        if (weightCount) {
                                            var wc = weightCount.val | 0;
                                            this.delegate_.weightCount(wc);
                                            this.parseMeshWeights(wc);
                                        }
                                    }
                                    else {
                                        console.warn("Unknown command in mesh: '" + cmd + "'");
                                    }
                                }
                                else if (cmdN && cmdN.type != 6) {
                                    this.parser_.unexpected(cmdN);
                                }
                            } while (!this.parser_.stop && cmdN.type != 6);
                        }
                    };
                    MD5MeshParser.prototype.parseJoints = function () {
                        var maxParentIndex = this.jointCount_ - 2;
                        var index = 0;
                        if (this.parser_.expectNext(5)) {
                            while (this.jointCount_ > 0 && !this.parser_.stop) {
                                var name_1 = this.parser_.expectNext(3);
                                var parentIndex = this.parser_.expectNext(4);
                                if (name_1 && parentIndex && this.parser_.expectNext(7)) {
                                    var posX = this.parser_.expectNext(4);
                                    var posY = this.parser_.expectNext(4);
                                    var posZ = this.parser_.expectNext(4);
                                    if (posX && posY && posZ && this.parser_.expectNext(8) && this.parser_.expectNext(7)) {
                                        var quatX = this.parser_.expectNext(4);
                                        var quatY = this.parser_.expectNext(4);
                                        var quatZ = this.parser_.expectNext(4);
                                        if (quatX && quatY && quatZ && this.parser_.expectNext(8)) {
                                            var pos = [posX.val, posY.val, posZ.val];
                                            var rot = [quatX.val, quatY.val, quatZ.val, 0];
                                            computeQuatW(rot);
                                            var parent_1 = parentIndex.val;
                                            if (parent_1 < -1 || parent_1 > maxParentIndex) {
                                                this.parser_.unexpected(parentIndex, "Invalid parent index");
                                            }
                                            else {
                                                this.delegate_.joint(name_1.val, index, parent_1, pos, rot);
                                                --this.jointCount_;
                                                ++index;
                                            }
                                        }
                                    }
                                }
                            }
                            if (this.jointCount_ == 0) {
                                this.parser_.expectNext(6);
                            }
                        }
                    };
                    MD5MeshParser.prototype.parse = function () {
                        while (!this.parser_.stop) {
                            var key = this.parser_.nextToken();
                            if (key.type == 2) {
                                if (key.val == "mesh") {
                                    this.delegate_.beginMesh();
                                    this.parseMesh();
                                    if (!this.parser_.stop) {
                                        this.delegate_.endMesh();
                                    }
                                }
                                else if (key.val == "joints") {
                                    this.delegate_.beginJoints();
                                    this.parseJoints();
                                    if (!this.parser_.stop) {
                                        this.delegate_.endJoints();
                                    }
                                }
                                else if (key.val == "numjoints") {
                                    var count = this.parser_.expectNext(4);
                                    if (count) {
                                        this.jointCount_ = count.val | 0;
                                        this.delegate_.jointCount(this.jointCount_);
                                    }
                                }
                                else if (key.val == "nummeshes") {
                                    var count = this.parser_.expectNext(4);
                                    if (count) {
                                        this.meshCount_ = count.val | 0;
                                        this.delegate_.meshCount(this.meshCount_);
                                    }
                                }
                                else if (key.val == "md5version" || key.val == "commandline") {
                                    this.parser_.nextToken();
                                }
                            }
                            else if (key.type != 1) {
                                this.parser_.unexpected(key);
                            }
                        }
                        if (this.parser_.eof && (this.jointCount_ > 0 || this.meshCount_ > 0)) {
                            this.parser_.unexpected({ type: 1, offset: this.parser_.offset }, "Unexpected eof with more meshes and/or joints expected.");
                        }
                        else {
                            this.delegate_.completed();
                        }
                    };
                    return MD5MeshParser;
                }());
                parse.MD5MeshParser = MD5MeshParser;
                var MD5AnimParser = (function () {
                    function MD5AnimParser(source, delegate_) {
                        this.delegate_ = delegate_;
                        this.jointCount_ = -1;
                        this.baseJointCount_ = -1;
                        this.frameCount_ = -1;
                        this.boundsCount_ = -1;
                        this.frameComponentCount_ = -1;
                        this.parser_ = new MD5Parser(source, delegate_);
                    }
                    MD5AnimParser.prototype.parseHierarchy = function () {
                        var maxParentIndex = this.jointCount_ - 2;
                        var index = 0;
                        if (this.parser_.expectNext(5)) {
                            while (!this.parser_.stop && this.jointCount_ > 0) {
                                var nameTok = this.parser_.expectNext(3);
                                var parentTok = this.parser_.expectNext(4);
                                var maskTok = this.parser_.expectNext(4);
                                var offsetTok = this.parser_.expectNext(4);
                                if (nameTok && parentTok && maskTok && offsetTok) {
                                    var parent_2 = parentTok.val | 0;
                                    var mask = maskTok.val | 0;
                                    var offset = offsetTok.val | 0;
                                    if (parent_2 < -1 || parent_2 > maxParentIndex) {
                                        this.parser_.unexpected(parentTok, "Invalid parent index");
                                    }
                                    else if (mask < 0 || mask > 63) {
                                        this.parser_.unexpected(parentTok, "Invalid component mask");
                                    }
                                    else if (offset < 0 || offset >= this.frameComponentCount_) {
                                        this.parser_.unexpected(parentTok, "Invalid component offset");
                                    }
                                    else {
                                        this.delegate_.joint(nameTok.val, index, parent_2, mask, offset);
                                        --this.jointCount_;
                                        ++index;
                                    }
                                }
                            }
                            if (this.jointCount_ == 0) {
                                this.parser_.expectNext(6);
                            }
                        }
                    };
                    MD5AnimParser.prototype.parseVec3 = function () {
                        if (this.parser_.expectNext(7)) {
                            var a = this.parser_.expectNext(4);
                            var b = this.parser_.expectNext(4);
                            var c = this.parser_.expectNext(4);
                            if (a && b && c && this.parser_.expectNext(8)) {
                                return [a.val, b.val, c.val];
                            }
                        }
                        return null;
                    };
                    MD5AnimParser.prototype.parseBounds = function () {
                        var index = 0;
                        if (this.parser_.expectNext(5)) {
                            while (this.boundsCount_ > 0 && !this.parser_.stop) {
                                var min = this.parseVec3();
                                var max = this.parseVec3();
                                if (min && max) {
                                    this.delegate_.bounds(index, min, max);
                                    ++index;
                                    --this.boundsCount_;
                                }
                            }
                            if (this.boundsCount_ == 0) {
                                this.parser_.expectNext(6);
                            }
                        }
                    };
                    MD5AnimParser.prototype.parseBaseFrame = function () {
                        var index = 0;
                        if (this.parser_.expectNext(5)) {
                            while (this.baseJointCount_ > 0 && !this.parser_.stop) {
                                var pos = this.parseVec3();
                                var rot = this.parseVec3();
                                if (pos && rot) {
                                    computeQuatW(rot);
                                    this.delegate_.baseJoint(index, pos, rot);
                                    ++index;
                                    --this.baseJointCount_;
                                }
                            }
                            if (this.baseJointCount_ == 0) {
                                this.parser_.expectNext(6);
                            }
                        }
                    };
                    MD5AnimParser.prototype.parseFrame = function (frameIndex) {
                        var index = 0;
                        var data = new Float32Array(this.frameComponentCount_);
                        if (this.parser_.expectNext(5)) {
                            while (index < this.frameComponentCount_ && !this.parser_.stop) {
                                var c = this.parser_.expectNext(4);
                                if (c) {
                                    data[index] = c.val;
                                    ++index;
                                }
                            }
                            if (index == this.frameComponentCount_) {
                                if (this.parser_.expectNext(6)) {
                                    this.delegate_.frame(frameIndex, data);
                                    --this.frameCount_;
                                }
                            }
                        }
                    };
                    MD5AnimParser.prototype.parse = function () {
                        while (!this.parser_.stop) {
                            var key = this.parser_.nextToken();
                            if (key.type == 2) {
                                if (key.val == "frame") {
                                    var frameIndex = this.parser_.expectNext(4);
                                    if (frameIndex) {
                                        this.parseFrame(frameIndex.val);
                                    }
                                }
                                else if (key.val == "hierarchy") {
                                    this.delegate_.beginHierarchy();
                                    this.parseHierarchy();
                                    if (!this.parser_.stop) {
                                        this.delegate_.endHierarchy();
                                    }
                                }
                                else if (key.val == "bounds") {
                                    this.delegate_.beginBoundingBoxes();
                                    this.parseBounds();
                                    if (!this.parser_.stop) {
                                        this.delegate_.endBoundingBoxes();
                                    }
                                }
                                else if (key.val == "baseframe") {
                                    this.delegate_.beginBaseFrame();
                                    this.parseBaseFrame();
                                    if (!this.parser_.stop) {
                                        this.delegate_.endBaseFrame();
                                    }
                                }
                                else if (key.val == "numjoints") {
                                    var count = this.parser_.expectNext(4);
                                    if (count) {
                                        this.jointCount_ = count.val | 0;
                                        this.baseJointCount_ = this.jointCount_;
                                        this.delegate_.jointCount(this.jointCount_);
                                    }
                                }
                                else if (key.val == "numframes") {
                                    var count = this.parser_.expectNext(4);
                                    if (count) {
                                        this.frameCount_ = count.val | 0;
                                        this.boundsCount_ = this.frameCount_;
                                        this.delegate_.frameCount(this.frameCount_);
                                    }
                                }
                                else if (key.val == "framerate") {
                                    var fps = this.parser_.expectNext(4);
                                    if (fps) {
                                        this.delegate_.frameRate(fps.val);
                                    }
                                }
                                else if (key.val == "numanimatedcomponents") {
                                    var count = this.parser_.expectNext(4);
                                    if (count) {
                                        this.frameComponentCount_ = count.val | 0;
                                        this.delegate_.frameComponentCount(this.frameComponentCount_);
                                    }
                                }
                                else if (key.val == "md5version" || key.val == "commandline") {
                                    this.parser_.nextToken();
                                }
                            }
                            else if (key.type != 1) {
                                this.parser_.unexpected(key);
                            }
                        }
                        if (this.parser_.eof && (this.jointCount_ != 0 || this.frameCount_ != 0 || this.boundsCount_ != 0 || this.baseJointCount_ != 0)) {
                            this.parser_.unexpected({ type: 1, offset: this.parser_.offset }, "Unexpected eof or malformed file.");
                        }
                        else {
                            this.delegate_.completed();
                        }
                    };
                    return MD5AnimParser;
                }());
                parse.MD5AnimParser = MD5AnimParser;
            })(parse = md5.parse || (md5.parse = {}));
        })(md5 = asset.md5 || (asset.md5 = {}));
    })(asset = sd.asset || (sd.asset = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var asset;
    (function (asset) {
        var md5;
        (function (md5) {
            function constructBindPosePositions(vertexes, weights, joints) {
                var count = vertexes.uvs.length / 2;
                var positions = new Float32Array(count * 3);
                for (var vix = 0; vix < count; ++vix) {
                    var vpos = [0, 0, 0];
                    var vOff2 = vix * 2;
                    var weightStart = vertexes.weightOffsetsCounts[vOff2];
                    var weightEnd = weightStart + vertexes.weightOffsetsCounts[vOff2 + 1];
                    for (var wix = weightStart; wix < weightEnd; ++wix) {
                        var jix = weights.joints[wix];
                        var joint = joints[jix];
                        var bias = weights.biases[wix];
                        var weightPos = sd.container.copyIndexedVec3(weights.positions, wix);
                        var weightRelPos = sd.vec3.transformQuat([], weightPos, joint.rotation);
                        sd.vec3.add(weightRelPos, weightRelPos, joint.position);
                        sd.vec3.scaleAndAdd(vpos, vpos, weightRelPos, bias);
                    }
                    sd.container.setIndexedVec3(positions, vix, vpos);
                }
                return positions;
            }
            function constructSkinnedMeshStreams(vertexes, weights) {
                var count = vertexes.uvs.length / 2;
                var jointIndexes = new Float32Array(count * 4);
                var weightPos0 = new Float32Array(count * 4);
                var weightPos1 = new Float32Array(count * 4);
                var weightPos2 = new Float32Array(count * 4);
                var weightPos3 = new Float32Array(count * 4);
                var weightPosArray = [weightPos0, weightPos1, weightPos2, weightPos3];
                for (var vix = 0; vix < count; ++vix) {
                    var vOff2 = vix * 2;
                    var vji = [-1, -1, -1, -1];
                    var weightStart = vertexes.weightOffsetsCounts[vOff2];
                    var weightCount = vertexes.weightOffsetsCounts[vOff2 + 1];
                    for (var wi = 0; wi < 4; ++wi) {
                        if (wi < weightCount) {
                            var jix = weights.joints[wi + weightStart];
                            var weightPos = sd.container.copyIndexedVec3(weights.positions, wi + weightStart);
                            weightPos[3] = weights.biases[wi + weightStart];
                            vji[wi] = jix;
                            sd.container.setIndexedVec4(weightPosArray[wi], vix, weightPos);
                        }
                    }
                    sd.container.setIndexedVec4(jointIndexes, vix, vji);
                }
                var streams = [
                    {
                        name: "weightPos0",
                        attr: { field: 24, role: 10 },
                        mapping: 1,
                        includeInMesh: true,
                        values: weightPos0
                    },
                    {
                        name: "weightPos1",
                        attr: { field: 24, role: 11 },
                        mapping: 1,
                        includeInMesh: true,
                        values: weightPos1
                    },
                    {
                        name: "weightPos2",
                        attr: { field: 24, role: 12 },
                        mapping: 1,
                        includeInMesh: true,
                        values: weightPos2
                    },
                    {
                        name: "weightPos3",
                        attr: { field: 24, role: 13 },
                        mapping: 1,
                        includeInMesh: true,
                        values: weightPos3
                    },
                    {
                        name: "jointIndexes",
                        attr: { field: 24, role: 14 },
                        mapping: 1,
                        includeInMesh: true,
                        values: jointIndexes
                    }
                ];
                return streams;
            }
            var MD5MeshBuilder = (function () {
                function MD5MeshBuilder(filePath) {
                    this.filePath = filePath;
                    this.joints = [];
                    this.flatJointModels = new Map();
                    this.meshCount_ = 0;
                    this.textures_ = new Map();
                    this.assets_ = new asset.AssetGroup();
                }
                MD5MeshBuilder.prototype.jointCount = function (_count) { };
                MD5MeshBuilder.prototype.beginJoints = function () { };
                MD5MeshBuilder.prototype.joint = function (name, index, parentIndex, modelPos, modelRot) {
                    var jm = asset.makeModel(name, index);
                    jm.joint = { root: parentIndex == -1 };
                    this.joints.push({
                        position: modelPos,
                        rotation: modelRot,
                        scale: [1, 1, 1]
                    });
                    this.flatJointModels.set(index, jm);
                    sd.vec3.copy(jm.transform.position, modelPos);
                    sd.quat.copy(jm.transform.rotation, modelRot);
                    if (parentIndex > -1) {
                        var pj = this.joints[parentIndex];
                        var pjm = this.flatJointModels.get(parentIndex);
                        pjm.children.push(jm);
                        jm.parent = pjm;
                        var invParentQuat = sd.quat.invert([], pj.rotation);
                        sd.quat.mul(jm.transform.rotation, invParentQuat, jm.transform.rotation);
                        var parentMat = sd.mat4.fromRotationTranslation([], pj.rotation, pj.position);
                        var invParentMat = sd.mat4.invert([], parentMat);
                        sd.vec3.transformMat4(jm.transform.position, jm.transform.position, invParentMat);
                    }
                    else {
                        this.assets_.addModel(jm);
                    }
                };
                MD5MeshBuilder.prototype.endJoints = function () { };
                MD5MeshBuilder.prototype.meshCount = function (_count) { };
                MD5MeshBuilder.prototype.beginMesh = function () {
                    this.vertexes = null;
                    this.triangles = null;
                    this.weights = null;
                };
                MD5MeshBuilder.prototype.materialName = function (name) {
                    var m = asset.makeMaterial();
                    m.userRef = this.assets_.materials.length + 1;
                    sd.vec3.set(m.baseColour, 0.8, 0.8, 0.8);
                    if (name) {
                        if (!this.textures_.has(name)) {
                            this.textures_.set(name, {
                                name: name,
                                url: new URL(name, this.filePath),
                                useMipMaps: 0,
                                colourSpace: 0
                            });
                        }
                        m.albedoTexture = this.textures_.get(name);
                    }
                    m.flags |= 4096;
                    this.assets_.addMaterial(m);
                    this.curMaterial = m;
                };
                MD5MeshBuilder.prototype.vertexCount = function (count) {
                    if (count == 0) {
                        this.vertexes = null;
                    }
                    else {
                        this.vertexes = {
                            uvs: new Float32Array(count * 2),
                            weightOffsetsCounts: new Int32Array(count * 2)
                        };
                    }
                };
                MD5MeshBuilder.prototype.vertex = function (index, uv, weightOffset, weightCount) {
                    var io = index * 2;
                    this.vertexes.uvs[io] = uv[0];
                    this.vertexes.uvs[io + 1] = uv[1];
                    this.vertexes.weightOffsetsCounts[io] = weightOffset;
                    this.vertexes.weightOffsetsCounts[io + 1] = weightCount;
                };
                MD5MeshBuilder.prototype.triangleCount = function (count) {
                    if (count == 0) {
                        this.triangles = null;
                    }
                    else {
                        this.triangles = new Int32Array(count * 3);
                    }
                };
                MD5MeshBuilder.prototype.triangle = function (index, indexes) {
                    sd.container.setIndexedVec3(this.triangles, index, [indexes[0], indexes[2], indexes[1]]);
                };
                MD5MeshBuilder.prototype.weightCount = function (count) {
                    if (count == 0) {
                        this.weights = null;
                    }
                    else {
                        this.weights = {
                            joints: new Int32Array(count),
                            biases: new Float32Array(count),
                            positions: new Float32Array(count * 3)
                        };
                    }
                };
                MD5MeshBuilder.prototype.weight = function (index, jointIndex, bias, jointPos) {
                    this.weights.joints[index] = jointIndex;
                    this.weights.biases[index] = bias;
                    sd.container.setIndexedVec3(this.weights.positions, index, jointPos);
                };
                MD5MeshBuilder.prototype.endMesh = function () {
                    if (this.vertexes && this.triangles && this.weights) {
                        var positions = constructBindPosePositions(this.vertexes, this.weights, this.joints);
                        var streams = constructSkinnedMeshStreams(this.vertexes, this.weights);
                        streams.push({
                            name: "normals",
                            attr: { field: 23, role: 2 },
                            mapping: 1,
                            includeInMesh: true,
                            values: new Float32Array(positions.length)
                        });
                        streams.push({
                            name: "uvs",
                            attr: { field: 22, role: 6 },
                            mapping: 1,
                            includeInMesh: true,
                            values: this.vertexes.uvs
                        });
                        var mb = new sd.meshdata.MeshBuilder(positions, null, streams);
                        var triCount = this.triangles.length / 3;
                        var pvi = 0;
                        var pi = 0;
                        while (triCount--) {
                            mb.addPolygon([pvi, pvi + 1, pvi + 2], sd.container.copyIndexedVec3(this.triangles, pi));
                            pvi += 3;
                            pi += 1;
                        }
                        var md = mb.complete();
                        md.genVertexNormals();
                        this.transformNormalsIntoJointSpace(md);
                        var sdMesh = {
                            name: "",
                            userRef: this.meshCount_++,
                            meshData: md,
                            indexMap: mb.indexMap
                        };
                        this.assets_.addMesh(sdMesh);
                        var mm = asset.makeModel("mesh");
                        mm.mesh = sdMesh;
                        mm.materials = [this.curMaterial];
                        this.assets_.addModel(mm);
                    }
                };
                MD5MeshBuilder.prototype.error = function (msg, offset, token) {
                    console.warn("MD5 Mesh parse error @ offset " + offset + ": " + msg, token);
                };
                MD5MeshBuilder.prototype.completed = function () { };
                MD5MeshBuilder.prototype.transformNormalsIntoJointSpace = function (md) {
                    var normAttr = md.findFirstAttributeWithRole(2);
                    if (normAttr) {
                        var weights = this.weights;
                        var joints = this.joints;
                        var vertexes = this.vertexes;
                        var vertexCount = vertexes.uvs.length / 2;
                        var normView = new sd.meshdata.VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
                        for (var vix = 0; vix < vertexCount; ++vix) {
                            var normalRef = normView.refItem(vix);
                            var finalNormal = [0, 0, 0];
                            var woff = vertexes.weightOffsetsCounts[vix * 2];
                            var wcnt = vertexes.weightOffsetsCounts[(vix * 2) + 1];
                            for (var j = 0; j < wcnt; ++j) {
                                var bias = weights.biases[woff + j];
                                var joint = joints[weights.joints[woff + j]];
                                sd.vec3.scaleAndAdd(finalNormal, finalNormal, sd.vec3.transformQuat([], normalRef, sd.quat.invert([], joint.rotation)), bias);
                            }
                            sd.vec3.copy(normalRef, finalNormal);
                        }
                    }
                };
                MD5MeshBuilder.prototype.loadTextures = function () {
                    var _this = this;
                    var fileProms = [];
                    this.textures_.forEach(function (tex) {
                        if (!tex.url || tex.descriptor) {
                            return;
                        }
                        fileProms.push(asset.loadImageURL(tex.url).then(function (img) {
                            tex.descriptor = sd.render.makeTexDesc2DFromImageSource(img, 0, tex.useMipMaps);
                            return tex;
                        }).catch(function (error) {
                            console.warn(error);
                            return null;
                        }));
                    });
                    return Promise.all(fileProms).then(function (textures) {
                        for (var _i = 0, textures_2 = textures; _i < textures_2.length; _i++) {
                            var tex = textures_2[_i];
                            _this.assets_.addTexture(tex);
                        }
                        return _this.assets_;
                    }, function () { return null; });
                };
                MD5MeshBuilder.prototype.assets = function () {
                    return this.loadTextures();
                };
                return MD5MeshBuilder;
            }());
            md5.MD5MeshBuilder = MD5MeshBuilder;
            var MD5AnimBuilder = (function () {
                function MD5AnimBuilder(filePath) {
                    this.filePath = filePath;
                    this.frameCount_ = 0;
                    this.frameRate_ = 0;
                    this.compCount_ = 0;
                    this.baseFrame_ = [];
                    this.joints_ = [];
                }
                MD5AnimBuilder.prototype.frameCount = function (count) { this.frameCount_ = count; };
                MD5AnimBuilder.prototype.jointCount = function (_count) { };
                MD5AnimBuilder.prototype.frameRate = function (fps) { this.frameRate_ = fps; };
                MD5AnimBuilder.prototype.frameComponentCount = function (count) { this.compCount_ = count; };
                MD5AnimBuilder.prototype.animForJoint = function (j) {
                    if (j.mask == 0) {
                        return undefined;
                    }
                    var hasPos = (j.mask & 7) != 0;
                    var hasRot = (j.mask & 56) != 0;
                    var components = 0;
                    if (hasPos) {
                        components += 3;
                    }
                    if (hasRot) {
                        components += 4;
                    }
                    var buffer = new Float32Array(components * this.frameCount_);
                    var tracks = [];
                    var offset = 0;
                    if (hasPos) {
                        tracks.push({
                            field: 1,
                            key: buffer.subarray(0, 3 * this.frameCount_)
                        });
                        offset += 3 * this.frameCount_;
                    }
                    if (hasRot) {
                        tracks.push({
                            field: 2,
                            key: buffer.subarray(offset)
                        });
                    }
                    return {
                        jointIndex: j.index,
                        jointName: j.name,
                        tracks: tracks
                    };
                };
                MD5AnimBuilder.prototype.beginHierarchy = function () { };
                MD5AnimBuilder.prototype.joint = function (name, index, parentIndex, animMask, _componentOffset) {
                    var j = {
                        name: name,
                        index: index,
                        parentIndex: parentIndex,
                        mask: animMask
                    };
                    j.anim = this.animForJoint(j);
                    this.joints_.push(j);
                };
                MD5AnimBuilder.prototype.endHierarchy = function () { };
                MD5AnimBuilder.prototype.beginBoundingBoxes = function () { };
                MD5AnimBuilder.prototype.bounds = function (_frameIndex, _min, _max) { };
                MD5AnimBuilder.prototype.endBoundingBoxes = function () { };
                MD5AnimBuilder.prototype.beginBaseFrame = function () { };
                MD5AnimBuilder.prototype.baseJoint = function (index, jointPos, jointRot) {
                    this.joints_[index].basePos = jointPos;
                    this.joints_[index].baseRot = jointRot;
                    var xf = asset.makeTransform();
                    sd.vec3.copy(xf.position, jointPos);
                    sd.quat.copy(xf.rotation, jointRot);
                    this.baseFrame_.push(xf);
                };
                MD5AnimBuilder.prototype.endBaseFrame = function () { };
                MD5AnimBuilder.prototype.frame = function (index, components) {
                    var compIx = 0;
                    for (var jix = 0; jix < this.joints_.length; ++jix) {
                        var j = this.joints_[jix];
                        if (j.mask == 0) {
                            continue;
                        }
                        if (j.mask & 7) {
                            var finalPos = sd.vec3.copy([], j.basePos);
                            if (j.mask & 1) {
                                finalPos[0] = components[compIx++];
                            }
                            if (j.mask & 2) {
                                finalPos[1] = components[compIx++];
                            }
                            if (j.mask & 4) {
                                finalPos[2] = components[compIx++];
                            }
                            sd.container.setIndexedVec3(j.anim.tracks[0].key, index, finalPos);
                        }
                        if (j.mask & 56) {
                            var arrIx = ((j.mask & 7) != 0) ? 1 : 0;
                            var finalRot = sd.vec3.copy([], j.baseRot);
                            if (j.mask & 8) {
                                finalRot[0] = components[compIx++];
                            }
                            if (j.mask & 16) {
                                finalRot[1] = components[compIx++];
                            }
                            if (j.mask & 32) {
                                finalRot[2] = components[compIx++];
                            }
                            md5.parse.computeQuatW(finalRot);
                            sd.container.setIndexedVec4(j.anim.tracks[arrIx].key, index, finalRot);
                        }
                    }
                };
                MD5AnimBuilder.prototype.error = function (msg, offset, token) {
                    console.warn("MD5 Anim parse error @ offset " + offset + ": " + msg, token);
                };
                MD5AnimBuilder.prototype.completed = function () {
                    console.info("DONE", this);
                };
                MD5AnimBuilder.prototype.assets = function () {
                    var ag = new asset.AssetGroup();
                    var ja = this.joints_.map(function (j) { return j.anim; }).filter(function (a) { return a != null; });
                    var sa = {
                        frameCount: this.frameCount_,
                        frameTime: 1 / this.frameRate_,
                        name: this.filePath,
                        jointAnims: ja
                    };
                    ag.addSkeletonAnimation(sa);
                    return ag;
                };
                return MD5AnimBuilder;
            }());
            md5.MD5AnimBuilder = MD5AnimBuilder;
        })(md5 = asset.md5 || (asset.md5 = {}));
        function parseMD5MeshSource(filePath, source) {
            var del = new md5.MD5MeshBuilder(filePath);
            var parser = new md5.parse.MD5MeshParser(source, del);
            parser.parse();
            return del.assets();
        }
        function parseMD5AnimSource(filePath, source) {
            var del = new md5.MD5AnimBuilder(filePath);
            var parser = new md5.parse.MD5AnimParser(source, del);
            parser.parse();
            return del.assets();
        }
        function loadMD5Mesh(url) {
            return asset.loadFile(url).then(function (text) { return parseMD5MeshSource(url.href, text); });
        }
        asset.loadMD5Mesh = loadMD5Mesh;
        function loadMD5Anim(url) {
            return asset.loadFile(url).then(function (text) { return parseMD5AnimSource(url.href, text); });
        }
        asset.loadMD5Anim = loadMD5Anim;
        asset.registerFileExtension("md5mesh", "application/idsoftware-md5mesh");
        asset.registerFileExtension("md5anim", "application/idsoftware-md5anim");
        asset.registerURLLoaderForMIMEType("application/idsoftware-md5mesh", function (url, _) { return loadMD5Mesh(url); });
        asset.registerURLLoaderForMIMEType("application/idsoftware-md5anim", function (url, _) { return loadMD5Anim(url); });
    })(asset = sd.asset || (sd.asset = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var asset;
    (function (asset) {
        function parseMTLTextureSpec(line) {
            if (line.length < 2) {
                return null;
            }
            var tokens = line.slice(1);
            var spec = {
                relPath: tokens.pop()
            };
            var tix = 0;
            while (tix < tokens.length) {
                var opt = tokens[tix];
                switch (opt) {
                    case "-o":
                    case "-s":
                        if (tix < tokens.length - 2) {
                            var xy = [
                                parseFloat(tokens[++tix]),
                                parseFloat(tokens[++tix])
                            ];
                            if (isNaN(xy[0]) || isNaN(xy[1])) {
                            }
                            else {
                                if (opt == "-o") {
                                    spec.texOffset = xy;
                                }
                                else {
                                    spec.texScale = xy;
                                }
                            }
                        }
                        else {
                        }
                        break;
                    default:
                        break;
                }
                tix += 1;
            }
            return spec;
        }
        function parseMTLSource(group, filePath, text) {
            var lines = text.split("\n");
            var tokens;
            var curMat = null;
            var urlTexMap = new Map();
            var checkArgCount = function (c) {
                var ok = (c === tokens.length - 1);
                if (!ok) {
                }
                return ok;
            };
            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                var line = lines_1[_i];
                tokens = line.trim().split(/ +/);
                var directive = tokens[0];
                if (directive === "newmtl") {
                    if (checkArgCount(1)) {
                        if (curMat) {
                            group.addMaterial(curMat);
                        }
                        var matName = tokens[1];
                        curMat = asset.makeMaterial(matName);
                    }
                }
                else {
                    if (!curMat) {
                    }
                    else {
                        switch (directive) {
                            case "Kd":
                            case "Ks":
                            case "Ke":
                                if (checkArgCount(3)) {
                                    var colour = [parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3])];
                                    var nonBlack = sd.vec3.length(colour) > 0;
                                    if (directive === "Kd") {
                                        sd.vec3.copy(curMat.baseColour, colour);
                                    }
                                    else if (nonBlack) {
                                        if (directive === "Ks") {
                                            sd.vec3.copy(curMat.specularColour, colour);
                                            curMat.specularIntensity = 1;
                                            curMat.flags |= 1;
                                        }
                                        else if (directive === "Ke") {
                                            sd.vec3.copy(curMat.emissiveColour, colour);
                                            curMat.emissiveIntensity = 1;
                                            curMat.flags |= 2;
                                        }
                                    }
                                }
                                break;
                            case "Ns":
                            case "Pr":
                            case "Pm":
                            case "aniso":
                                if (checkArgCount(1)) {
                                    var value = parseFloat(tokens[1]);
                                    if (directive === "Ns") {
                                        curMat.specularExponent = value;
                                    }
                                    else if (directive === "Pr") {
                                        curMat.roughness = value;
                                    }
                                    else if (directive === "Pm") {
                                        curMat.metallic = value;
                                    }
                                    else if (directive === "aniso") {
                                        curMat.anisotropy = value;
                                    }
                                }
                                break;
                            case "d":
                            case "Tr":
                                if (checkArgCount(1)) {
                                    var opacity = parseFloat(tokens[1]);
                                    if (directive === "Tr") {
                                        opacity = 1.0 - opacity;
                                    }
                                    opacity = sd.math.clamp01(opacity);
                                    if (opacity < 1) {
                                        curMat.opacity = opacity;
                                        curMat.flags |= 4;
                                    }
                                }
                                break;
                            case "map_Kd":
                            case "map_Ks":
                            case "map_Ke":
                            case "map_Pr":
                            case "map_Pm":
                            case "map_d":
                            case "map_Tr":
                            case "norm":
                            case "bump":
                            case "disp": {
                                var texSpec = parseMTLTextureSpec(tokens);
                                if (texSpec) {
                                    var texURL = new URL(texSpec.relPath, filePath);
                                    var texAsset = (urlTexMap.has(texURL.href))
                                        ? urlTexMap.get(texURL.href)
                                        : {
                                            name: curMat.name + "_" + directive,
                                            url: texURL,
                                            useMipMaps: 1,
                                            colourSpace: (["map_Kd", "map_Ks", "map_Ke"].indexOf(directive) > -1 ? 0 : 1),
                                        };
                                    if (texSpec.texOffset) {
                                        curMat.textureOffset = texSpec.texOffset;
                                    }
                                    if (texSpec.texScale) {
                                        curMat.textureScale = texSpec.texScale;
                                    }
                                    if (directive === "map_Kd") {
                                        curMat.albedoTexture = texAsset;
                                    }
                                    else if (directive === "map_Ks") {
                                        curMat.specularTexture = texAsset;
                                    }
                                    else if (directive === "map_Ke") {
                                        curMat.emissiveTexture = texAsset;
                                        curMat.flags |= 2;
                                    }
                                    else if (directive === "map_Pr") {
                                        curMat.roughnessTexture = texAsset;
                                    }
                                    else if (directive === "map_Pm") {
                                        curMat.metallicTexture = texAsset;
                                    }
                                    else if (directive === "norm") {
                                        curMat.normalTexture = texAsset;
                                        if (curMat.normalTexture === curMat.heightTexture) {
                                            curMat.flags |= 2048;
                                        }
                                    }
                                    else if (directive === "map_d") {
                                        curMat.transparencyTexture = texAsset;
                                        curMat.flags |= 4;
                                    }
                                    else if (directive === "map_Tr") { }
                                    else if (directive === "bump" || directive === "disp") {
                                        curMat.heightTexture = texAsset;
                                        if (curMat.normalTexture === curMat.heightTexture) {
                                            curMat.flags |= 2048;
                                        }
                                    }
                                    if (!urlTexMap.has(texURL.href)) {
                                        urlTexMap.set(texURL.href, texAsset);
                                        group.addTexture(texAsset);
                                    }
                                }
                                else {
                                }
                                break;
                            }
                            default:
                                break;
                        }
                    }
                }
            }
            if (curMat) {
                group.addMaterial(curMat);
            }
            return group;
        }
        function loadMTLFile(url, intoAssetGroup) {
            var group = intoAssetGroup || new asset.AssetGroup();
            return asset.loadFile(url).then(function (text) {
                return parseMTLSource(group, url.href, text);
            });
        }
        asset.loadMTLFile = loadMTLFile;
        function preflightOBJSource(group, filePath, text) {
            var mtlFileRelPath = "";
            var preproc = {
                lines: [],
                positionCount: 0,
                normalCount: 0,
                uvCount: 0,
                polyCount: 0,
                vertexCount: 0
            };
            preproc.lines = text.split("\n").map(function (l) { return l.trim(); }).filter(function (l) { return l.length > 0; });
            for (var _i = 0, _a = preproc.lines; _i < _a.length; _i++) {
                var line = _a[_i];
                var tokens = line.split(/ +/);
                var directive = tokens[0];
                if (directive === "v") {
                    preproc.positionCount += 1;
                }
                else if (directive === "vn") {
                    preproc.normalCount += 1;
                }
                else if (directive === "vt") {
                    preproc.uvCount += 1;
                }
                else if (directive === "f") {
                    preproc.polyCount += 1;
                    preproc.vertexCount += tokens.length - 1;
                }
                else if (directive === "mtllib") {
                    mtlFileRelPath = tokens[1] || "";
                }
            }
            if (mtlFileRelPath.length) {
                return loadMTLFile(new URL(mtlFileRelPath, filePath), group).then(function (_) {
                    return preproc;
                });
            }
            else {
                return Promise.resolve(preproc);
            }
        }
        var objSequenceNumber = 0;
        function parseOBJSource(group, preproc, hasColourAttr) {
            var positions = new Float32Array(preproc.positionCount * 3);
            var positionIndexes = new Uint32Array(preproc.vertexCount);
            var streams = [];
            var normalValues;
            var uvValues;
            var colourValues;
            var normalIndexes;
            var uvIndexes;
            var colourIndexes;
            var posIx = 0, normIx = 0, uvIx = 0, vertexIx = 0, curMatIx = 0;
            var matNameIndexMap = new Map();
            for (var matIx = 0; matIx < group.materials.length; ++matIx) {
                matNameIndexMap.set(group.materials[matIx].name, matIx);
            }
            if (preproc.normalCount > 0) {
                normalValues = new Float32Array(preproc.normalCount * 3);
                normalIndexes = new Uint32Array(preproc.vertexCount);
                streams.push({
                    name: "normals",
                    includeInMesh: true,
                    mapping: 1,
                    attr: { field: 23, role: 2 },
                    values: normalValues,
                    indexes: normalIndexes
                });
            }
            if (preproc.uvCount > 0) {
                uvValues = new Float32Array(preproc.uvCount * 2);
                uvIndexes = new Uint32Array(preproc.vertexCount);
                streams.push({
                    name: "uvs",
                    includeInMesh: true,
                    mapping: 1,
                    attr: { field: 22, role: 6 },
                    values: uvValues,
                    indexes: uvIndexes
                });
            }
            if (hasColourAttr && group.materials.length > 0) {
                colourValues = new Float32Array(group.materials.length * 3);
                colourIndexes = new Uint32Array(preproc.polyCount);
                for (var matIx = 0; matIx < group.materials.length; ++matIx) {
                    sd.container.setIndexedVec3(colourValues, matIx, group.materials[matIx].baseColour);
                }
                streams.push({
                    name: "colours",
                    includeInMesh: true,
                    mapping: 3,
                    attr: { field: 23, role: 4 },
                    values: colourValues,
                    indexes: colourIndexes
                });
            }
            var builder = new sd.meshdata.MeshBuilder(positions, positionIndexes, streams);
            function fxtoi(fx) { return (+fx) - 1; }
            for (var _i = 0, _a = preproc.lines; _i < _a.length; _i++) {
                var line = _a[_i];
                var tokens = line.split(/ +/);
                switch (tokens[0]) {
                    case "v":
                        positions[posIx] = parseFloat(tokens[1]);
                        positions[posIx + 1] = parseFloat(tokens[2]);
                        positions[posIx + 2] = parseFloat(tokens[3]);
                        posIx += 3;
                        break;
                    case "vn":
                        normalValues[normIx] = parseFloat(tokens[1]);
                        normalValues[normIx + 1] = parseFloat(tokens[2]);
                        normalValues[normIx + 2] = parseFloat(tokens[3]);
                        normIx += 3;
                        break;
                    case "vt":
                        uvValues[uvIx] = parseFloat(tokens[1]);
                        uvValues[uvIx + 1] = -parseFloat(tokens[2]);
                        uvIx += 2;
                        break;
                    case "f": {
                        if (colourIndexes) {
                            colourIndexes[builder.curPolygonIndex] = curMatIx;
                        }
                        var vi = [];
                        for (var fvix = 1; fvix < tokens.length; ++fvix) {
                            var fix = tokens[fvix].split("/").map(fxtoi);
                            positionIndexes[vertexIx] = fix[0];
                            if (uvIndexes && fix[1] > -1) {
                                uvIndexes[vertexIx] = fix[1];
                            }
                            if (normalIndexes && fix[2] > -1) {
                                normalIndexes[vertexIx] = fix[2];
                            }
                            vi.push(vertexIx);
                            vertexIx += 1;
                        }
                        builder.addPolygon(vi, vi);
                        break;
                    }
                    case "usemtl":
                        var newMatIx = matNameIndexMap.get(tokens[1]);
                        if (newMatIx === undefined) {
                            console.warn("Tried to set material to non-existent name: " + tokens[1]);
                        }
                        else {
                            curMatIx = newMatIx;
                        }
                        builder.setGroup(curMatIx);
                        break;
                    default: break;
                }
            }
            group.addMesh({
                name: "obj_" + objSequenceNumber + "_mesh",
                meshData: builder.complete(),
                indexMap: builder.indexMap
            });
        }
        function loadOBJFile(url, materialsAsColours, intoAssetGroup) {
            if (materialsAsColours === void 0) { materialsAsColours = false; }
            var group = intoAssetGroup || new asset.AssetGroup();
            return asset.loadFile(url)
                .then(function (text) {
                return preflightOBJSource(group, url.href, text);
            })
                .then(function (preproc) {
                parseOBJSource(group, preproc, materialsAsColours);
                var model = asset.makeModel("obj_" + objSequenceNumber + "_model");
                model.mesh = group.meshes[0];
                model.materials = group.materials;
                model.transform = asset.makeTransform();
                group.addModel(model);
                objSequenceNumber += 1;
                return group;
            });
        }
        asset.loadOBJFile = loadOBJFile;
        asset.registerFileExtension("obj", "application/wavefront-obj");
        asset.registerFileExtension("mtl", "application/wavefront-mtl");
        asset.registerURLLoaderForMIMEType("application/wavefront-obj", function (url, _) { return loadOBJFile(url); });
        asset.registerURLLoaderForMIMEType("application/wavefront-mtl", function (url, _) { return loadMTLFile(url); });
    })(asset = sd.asset || (sd.asset = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var asset;
    (function (asset) {
        var TMXLayer = (function () {
            function TMXLayer(layerNode) {
                var layerText = (layerNode.textContent || "").trim();
                var byteView = new Uint8Array(atob(layerText).split("").map(function (c) { return c.charCodeAt(0); }));
                this.tileData = new Uint32Array(byteView.buffer);
                for (var _i = 0, _a = [].slice.call(layerNode.attributes, 0); _i < _a.length; _i++) {
                    var attr = _a[_i];
                    if (attr.nodeName == "width") {
                        this.width = parseInt(attr.textContent || "0");
                    }
                    if (attr.nodeName == "height") {
                        this.height = parseInt(attr.textContent || "0");
                    }
                }
            }
            TMXLayer.prototype.tileAt = function (col, row) {
                if (row < 0 || col < 0 || row >= this.height || col >= this.width) {
                    return -1;
                }
                return this.tileData[(row * this.width) + col];
            };
            TMXLayer.prototype.setTileAt = function (col, row, tile) {
                if (row < 0 || col < 0 || row >= this.height || col >= this.width) {
                    return;
                }
                this.tileData[(row * this.width) + col] = tile;
            };
            TMXLayer.prototype.eachTile = function (callback) {
                var off = 0;
                for (var row = 0; row < this.height; ++row) {
                    for (var col = 0; col < this.width; ++col) {
                        if (this.tileData[off]) {
                            callback(row, col, this.tileData[off]);
                        }
                        ++off;
                    }
                }
            };
            return TMXLayer;
        }());
        asset.TMXLayer = TMXLayer;
        var TMXObjectGroup = (function () {
            function TMXObjectGroup(_groupNode) {
            }
            return TMXObjectGroup;
        }());
        asset.TMXObjectGroup = TMXObjectGroup;
        var TMXData = (function () {
            function TMXData() {
                this.layers = {};
                this.objectGroups = {};
                this.width_ = 0;
                this.height_ = 0;
            }
            Object.defineProperty(TMXData.prototype, "width", {
                get: function () { return this.width_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TMXData.prototype, "height", {
                get: function () { return this.height_; },
                enumerable: true,
                configurable: true
            });
            TMXData.prototype.load = function (filePath) {
                var _this = this;
                return asset.loadFile(filePath, {
                    tryBreakCache: true,
                    mimeType: "application/xml",
                    responseType: 3
                }).then(function (dataXML) {
                    var tileDoc = dataXML.childNodes[0];
                    for (var _i = 0, _a = [].slice.call(tileDoc.attributes, 0); _i < _a.length; _i++) {
                        var attr = _a[_i];
                        if (attr.nodeName == "width") {
                            _this.width_ = parseInt(attr.textContent || "0");
                        }
                        if (attr.nodeName == "height") {
                            _this.height_ = parseInt(attr.textContent || "0");
                        }
                    }
                    for (var ix = 0; ix < tileDoc.childNodes.length; ++ix) {
                        var node = tileDoc.childNodes[ix];
                        var nameAttr = void 0;
                        var name_2 = void 0;
                        if (node.nodeName == "layer") {
                            nameAttr = node.attributes.getNamedItem("name");
                            name_2 = nameAttr && nameAttr.textContent;
                            if (name_2) {
                                _this.layers[name_2] = new TMXLayer(node);
                            }
                        }
                        else if (node.nodeName == "objectgroup") {
                            nameAttr = node.attributes.getNamedItem("name");
                            name_2 = nameAttr && nameAttr.textContent;
                            if (name_2) {
                                _this.objectGroups[name_2] = new TMXObjectGroup(node);
                            }
                        }
                    }
                    return _this;
                });
            };
            ;
            return TMXData;
        }());
        asset.TMXData = TMXData;
    })(asset = sd.asset || (sd.asset = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var audio;
    (function (audio) {
        function makeAudioBufferFromData(ac, data) {
            return new Promise(function (resolve, reject) {
                ac.ctx.decodeAudioData(data, function (audioData) {
                    resolve(audioData);
                }, function () {
                    reject("invalid audio data");
                });
            });
        }
        audio.makeAudioBufferFromData = makeAudioBufferFromData;
        function makeAudioContext() {
            var ac = window.AudioContext ? new (window.AudioContext)() : (window.webkitAudioContext ? new webkitAudioContext() : null);
            if (ac) {
                return {
                    ctx: ac
                };
            }
            else {
                return null;
            }
        }
        audio.makeAudioContext = makeAudioContext;
    })(audio = sd.audio || (sd.audio = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var container;
    (function (container) {
        function copyElementRange(src, srcOffset, srcCount, dest, destOffset) {
            for (var ix = 0; ix < srcCount; ++ix) {
                dest[destOffset++] = src[srcOffset++];
            }
        }
        container.copyElementRange = copyElementRange;
        function fill(dest, value, count, offset) {
            if (offset === void 0) { offset = 0; }
            for (var ix = 0; ix < count; ++ix) {
                dest[ix + offset] = value;
            }
        }
        container.fill = fill;
        function appendArrayInPlace(dest, source) {
            var MAX_BLOCK_SIZE = 65535;
            var offset = 0;
            var itemsLeft = source.length;
            if (itemsLeft <= MAX_BLOCK_SIZE) {
                dest.push.apply(dest, source);
            }
            else {
                while (itemsLeft > 0) {
                    var pushCount = Math.min(MAX_BLOCK_SIZE, itemsLeft);
                    var subSource = source.slice(offset, offset + pushCount);
                    dest.push.apply(dest, subSource);
                    itemsLeft -= pushCount;
                    offset += pushCount;
                }
            }
        }
        container.appendArrayInPlace = appendArrayInPlace;
        function refIndexedVec2(data, index) {
            return data.subarray(index * 2, (index + 1) * 2);
        }
        container.refIndexedVec2 = refIndexedVec2;
        function copyIndexedVec2(data, index) {
            var offset = (index * 2) | 0;
            return [data[offset], data[offset + 1]];
        }
        container.copyIndexedVec2 = copyIndexedVec2;
        function setIndexedVec2(data, index, v2) {
            var offset = (index * 2) | 0;
            data[offset] = v2[0];
            data[offset + 1] = v2[1];
        }
        container.setIndexedVec2 = setIndexedVec2;
        function copyVec2FromOffset(data, offset) {
            return [data[offset], data[offset + 1]];
        }
        container.copyVec2FromOffset = copyVec2FromOffset;
        function setVec2AtOffset(data, offset, v2) {
            data[offset] = v2[0];
            data[offset + 1] = v2[1];
        }
        container.setVec2AtOffset = setVec2AtOffset;
        function offsetOfIndexedVec2(index) { return (index * 2) | 0; }
        container.offsetOfIndexedVec2 = offsetOfIndexedVec2;
        function refIndexedVec3(data, index) {
            return data.subarray(index * 3, (index + 1) * 3);
        }
        container.refIndexedVec3 = refIndexedVec3;
        function copyIndexedVec3(data, index) {
            var offset = (index * 3) | 0;
            return [data[offset], data[offset + 1], data[offset + 2]];
        }
        container.copyIndexedVec3 = copyIndexedVec3;
        function setIndexedVec3(data, index, v3) {
            var offset = (index * 3) | 0;
            data[offset] = v3[0];
            data[offset + 1] = v3[1];
            data[offset + 2] = v3[2];
        }
        container.setIndexedVec3 = setIndexedVec3;
        function copyVec3FromOffset(data, offset) {
            return [data[offset], data[offset + 1], data[offset + 2]];
        }
        container.copyVec3FromOffset = copyVec3FromOffset;
        function setVec3AtOffset(data, offset, v3) {
            data[offset] = v3[0];
            data[offset + 1] = v3[1];
            data[offset + 2] = v3[2];
        }
        container.setVec3AtOffset = setVec3AtOffset;
        function offsetOfIndexedVec3(index) { return (index * 3) | 0; }
        container.offsetOfIndexedVec3 = offsetOfIndexedVec3;
        function refIndexedVec4(data, index) {
            return data.subarray(index * 4, (index + 1) * 4);
        }
        container.refIndexedVec4 = refIndexedVec4;
        function copyIndexedVec4(data, index) {
            var offset = (index * 4) | 0;
            return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
        }
        container.copyIndexedVec4 = copyIndexedVec4;
        function setIndexedVec4(data, index, v4) {
            var offset = (index * 4) | 0;
            data[offset] = v4[0];
            data[offset + 1] = v4[1];
            data[offset + 2] = v4[2];
            data[offset + 3] = v4[3];
        }
        container.setIndexedVec4 = setIndexedVec4;
        function copyVec4FromOffset(data, offset) {
            return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
        }
        container.copyVec4FromOffset = copyVec4FromOffset;
        function setVec4AtOffset(data, offset, v4) {
            data[offset] = v4[0];
            data[offset + 1] = v4[1];
            data[offset + 2] = v4[2];
            data[offset + 3] = v4[3];
        }
        container.setVec4AtOffset = setVec4AtOffset;
        function offsetOfIndexedVec4(index) { return (index * 4) | 0; }
        container.offsetOfIndexedVec4 = offsetOfIndexedVec4;
        function refIndexedMat3(data, index) {
            return data.subarray(index * 9, (index + 1) * 9);
        }
        container.refIndexedMat3 = refIndexedMat3;
        function copyIndexedMat3(data, index) {
            var offset = (index * 9) | 0;
            return [
                data[offset], data[offset + 1], data[offset + 2],
                data[offset + 3], data[offset + 4], data[offset + 5],
                data[offset + 6], data[offset + 7], data[offset + 8],
            ];
        }
        container.copyIndexedMat3 = copyIndexedMat3;
        function setIndexedMat3(data, index, m3) {
            var offset = (index * 9) | 0;
            data[offset] = m3[0];
            data[offset + 1] = m3[1];
            data[offset + 2] = m3[2];
            data[offset + 3] = m3[3];
            data[offset + 4] = m3[4];
            data[offset + 5] = m3[5];
            data[offset + 6] = m3[6];
            data[offset + 7] = m3[7];
            data[offset + 8] = m3[8];
        }
        container.setIndexedMat3 = setIndexedMat3;
        function offsetOfIndexedMat3(index) { return (index * 9) | 0; }
        container.offsetOfIndexedMat3 = offsetOfIndexedMat3;
        function refIndexedMat4(data, index) {
            return data.subarray(index * 16, (index + 1) * 16);
        }
        container.refIndexedMat4 = refIndexedMat4;
        function copyIndexedMat4(data, index) {
            var offset = (index * 16) | 0;
            return [
                data[offset], data[offset + 1], data[offset + 2], data[offset + 3],
                data[offset + 4], data[offset + 5], data[offset + 6], data[offset + 7],
                data[offset + 8], data[offset + 9], data[offset + 10], data[offset + 11],
                data[offset + 12], data[offset + 13], data[offset + 14], data[offset + 15]
            ];
        }
        container.copyIndexedMat4 = copyIndexedMat4;
        function setIndexedMat4(data, index, m4) {
            var offset = (index * 16) | 0;
            data[offset] = m4[0];
            data[offset + 1] = m4[1];
            data[offset + 2] = m4[2];
            data[offset + 3] = m4[3];
            data[offset + 4] = m4[4];
            data[offset + 5] = m4[5];
            data[offset + 6] = m4[6];
            data[offset + 7] = m4[7];
            data[offset + 8] = m4[8];
            data[offset + 9] = m4[9];
            data[offset + 10] = m4[10];
            data[offset + 11] = m4[11];
            data[offset + 12] = m4[12];
            data[offset + 13] = m4[13];
            data[offset + 14] = m4[14];
            data[offset + 15] = m4[15];
        }
        container.setIndexedMat4 = setIndexedMat4;
        function offsetOfIndexedMat4(index) { return (index * 16) | 0; }
        container.offsetOfIndexedMat4 = offsetOfIndexedMat4;
    })(container = sd.container || (sd.container = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var container;
    (function (container) {
        var Deque = (function () {
            function Deque() {
                this.blockCapacity = 512;
                this.blocks_ = [];
                this.blocks_.push(this.newBlock());
                this.headBlock_ = this.tailBlock_ = 0;
                this.headIndex_ = this.tailIndex_ = 0;
                this.count_ = 0;
            }
            Deque.prototype.newBlock = function () {
                return [];
            };
            Object.defineProperty(Deque.prototype, "headBlock", {
                get: function () { return this.blocks_[this.headBlock_]; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Deque.prototype, "tailBlock", {
                get: function () { return this.blocks_[this.tailBlock_]; },
                enumerable: true,
                configurable: true
            });
            Deque.prototype.append = function (t) {
                if (this.tailIndex_ == this.blockCapacity) {
                    if (this.tailBlock_ == this.blocks_.length - 1) {
                        this.blocks_.push(this.newBlock());
                    }
                    this.tailBlock_++;
                    this.tailIndex_ = 0;
                }
                this.tailBlock[this.tailIndex_] = t;
                ++this.tailIndex_;
                ++this.count_;
            };
            Deque.prototype.prepend = function (t) {
                if (this.headIndex_ == 0) {
                    if (this.headBlock_ == 0) {
                        this.blocks_.unshift(this.newBlock());
                        ++this.tailBlock_;
                    }
                    else {
                        --this.headBlock_;
                    }
                    this.headIndex_ = this.blockCapacity;
                }
                --this.headIndex_;
                this.headBlock[this.headIndex_] = t;
                ++this.count_;
            };
            Deque.prototype.popFront = function () {
                sd.assert(this.count_ > 0);
                delete this.headBlock[this.headIndex_];
                ++this.headIndex_;
                if (this.headIndex_ == this.blockCapacity) {
                    if (this.headBlock_ == 0) {
                        ++this.headBlock_;
                    }
                    else if (this.headBlock_ == 1) {
                        this.blocks_.shift();
                        this.tailBlock_--;
                    }
                    this.headIndex_ = 0;
                }
                --this.count_;
            };
            Deque.prototype.popBack = function () {
                sd.assert(this.count_ > 0);
                if (this.tailIndex_ == 0) {
                    var lastBlockIndex = this.blocks_.length - 1;
                    if (this.tailBlock_ == lastBlockIndex - 1) {
                        this.blocks_.pop();
                    }
                    --this.tailBlock_;
                    this.tailIndex_ = this.blockCapacity;
                }
                --this.tailIndex_;
                delete this.tailBlock[this.tailIndex_];
                --this.count_;
            };
            Deque.prototype.clear = function () {
                this.blocks_ = [];
                this.headBlock_ = this.tailBlock_ = 0;
                this.headIndex_ = this.tailIndex_ = 0;
                this.count_ = 0;
            };
            Object.defineProperty(Deque.prototype, "count", {
                get: function () { return this.count_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Deque.prototype, "empty", {
                get: function () { return this.count_ == 0; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Deque.prototype, "front", {
                get: function () {
                    sd.assert(this.count_ > 0);
                    return this.headBlock[this.headIndex_];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Deque.prototype, "back", {
                get: function () {
                    sd.assert(this.count_ > 0);
                    return (this.tailIndex_ > 0) ? this.tailBlock[this.tailIndex_ - 1] : this.blocks_[this.tailBlock_ - 1][this.blockCapacity - 1];
                },
                enumerable: true,
                configurable: true
            });
            return Deque;
        }());
        container.Deque = Deque;
    })(container = sd.container || (sd.container = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    sd.vec2 = veclib.vec2;
    sd.vec3 = veclib.vec3;
    sd.vec4 = veclib.vec4;
    sd.quat = veclib.quat;
    sd.mat2 = veclib.mat2;
    sd.mat2d = veclib.mat2d;
    sd.mat3 = veclib.mat3;
    sd.mat4 = veclib.mat4;
})(sd || (sd = {}));
(function (sd) {
    var math;
    (function (math) {
        math.clamp = veclib.clamp;
        math.clamp01 = veclib.clamp01;
        math.mix = veclib.mix;
        function intRandom(maximum) {
            return (Math.random() * (maximum + 1)) | 0;
        }
        math.intRandom = intRandom;
        function intRandomRange(minimum, maximum) {
            var diff = (maximum - minimum) | 0;
            return minimum + intRandom(diff);
        }
        math.intRandomRange = intRandomRange;
        function hertz(hz) {
            return 1 / hz;
        }
        math.hertz = hertz;
        function deg2rad(deg) {
            return deg * Math.PI / 180.0;
        }
        math.deg2rad = deg2rad;
        function rad2deg(rad) {
            return rad * 180.0 / Math.PI;
        }
        math.rad2deg = rad2deg;
        function isPowerOf2(n) {
            return (n & (n - 1)) == 0;
        }
        math.isPowerOf2 = isPowerOf2;
        function roundUpPowerOf2(n) {
            if (n <= 0) {
                return 1;
            }
            n = (n | 0) - 1;
            n |= n >> 1;
            n |= n >> 2;
            n |= n >> 4;
            n |= n >> 8;
            n |= n >> 16;
            return n + 1;
        }
        math.roundUpPowerOf2 = roundUpPowerOf2;
        function alignUp(val, alignmentPow2) {
            return (val + alignmentPow2 - 1) & (~(alignmentPow2 - 1));
        }
        math.alignUp = alignUp;
        function alignDown(val, alignmentPow2) {
            return val & (~(alignmentPow2 - 1));
        }
        math.alignDown = alignDown;
    })(math = sd.math || (sd.math = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var container;
    (function (container) {
        function positionFields(fields) {
            var totalOffset = 0;
            return fields.map(function (field) {
                var curOffset = totalOffset;
                var sizeBytes = field.type.byteSize * field.count;
                totalOffset += sizeBytes;
                return {
                    type: field.type,
                    count: field.count,
                    byteOffset: curOffset,
                    sizeBytes: sizeBytes
                };
            });
        }
        function clearBuffer(data) {
            var numDoubles = (data.byteLength / Float64Array.BYTES_PER_ELEMENT) | 0;
            var doublesByteSize = numDoubles * Float64Array.BYTES_PER_ELEMENT;
            var remainingBytes = data.byteLength - doublesByteSize;
            var doubleView = new Float64Array(data);
            var remainderView = new Uint8Array(data, doublesByteSize);
            for (var d = 0; d < numDoubles; ++d) {
                doubleView[d] = 0;
            }
            for (var b = 0; b < remainingBytes; ++b) {
                remainderView[b] = 0;
            }
        }
        var FixedMultiArray = (function () {
            function FixedMultiArray(capacity_, fields) {
                var _this = this;
                this.capacity_ = capacity_;
                var posFields = positionFields(fields);
                var lastField = posFields[posFields.length - 1];
                var elementSumSize = lastField.byteOffset + lastField.sizeBytes;
                this.data_ = new ArrayBuffer(elementSumSize * capacity_);
                this.basePointers_ = posFields.map(function (posField) {
                    var byteOffset = capacity_ * posField.byteOffset;
                    return new (posField.type.arrayType)(_this.data_, byteOffset, capacity_ * posField.count);
                });
            }
            Object.defineProperty(FixedMultiArray.prototype, "capacity", {
                get: function () { return this.capacity_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FixedMultiArray.prototype, "data", {
                get: function () { return this.data_; },
                enumerable: true,
                configurable: true
            });
            FixedMultiArray.prototype.clear = function () {
                clearBuffer(this.data_);
            };
            FixedMultiArray.prototype.indexedFieldView = function (index) {
                return this.basePointers_[index];
            };
            return FixedMultiArray;
        }());
        container.FixedMultiArray = FixedMultiArray;
        var MultiArrayBuffer = (function () {
            function MultiArrayBuffer(initialCapacity, fields) {
                this.capacity_ = 0;
                this.count_ = 0;
                this.elementSumSize_ = 0;
                this.data_ = null;
                var totalOffset = 0;
                this.fields_ = fields.map(function (field) {
                    var curOffset = totalOffset;
                    var sizeBytes = field.type.byteSize * field.count;
                    totalOffset += sizeBytes;
                    return {
                        type: field.type,
                        count: field.count,
                        byteOffset: curOffset,
                        sizeBytes: sizeBytes
                    };
                });
                this.elementSumSize_ = totalOffset;
                this.reserve(initialCapacity);
            }
            Object.defineProperty(MultiArrayBuffer.prototype, "capacity", {
                get: function () { return this.capacity_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MultiArrayBuffer.prototype, "count", {
                get: function () { return this.count_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MultiArrayBuffer.prototype, "backIndex", {
                get: function () {
                    sd.assert(this.count_ > 0);
                    return this.count_ - 1;
                },
                enumerable: true,
                configurable: true
            });
            MultiArrayBuffer.prototype.fieldArrayView = function (f, buffer, itemCount) {
                var byteOffset = f.byteOffset * itemCount;
                return new (f.type.arrayType)(buffer, byteOffset, itemCount * f.count);
            };
            MultiArrayBuffer.prototype.reserve = function (newCapacity) {
                var _this = this;
                sd.assert(newCapacity > 0);
                newCapacity = sd.math.alignUp(newCapacity, 32);
                if (newCapacity <= this.capacity_) {
                    return 0;
                }
                var newData = new ArrayBuffer(newCapacity * this.elementSumSize_);
                sd.assert(newData);
                var invalidation = 0;
                if (this.data_) {
                    this.fields_.forEach(function (field) {
                        var oldView = _this.fieldArrayView(field, _this.data_, _this.count_);
                        var newView = _this.fieldArrayView(field, newData, newCapacity);
                        newView.set(oldView);
                    });
                    invalidation = 1;
                }
                this.data_ = newData;
                this.capacity_ = newCapacity;
                return invalidation;
            };
            MultiArrayBuffer.prototype.clear = function () {
                this.count_ = 0;
                clearBuffer(this.data_);
            };
            MultiArrayBuffer.prototype.resize = function (newCount) {
                var _this = this;
                var invalidation = 0;
                if (newCount > this.capacity_) {
                    invalidation = this.reserve(sd.math.roundUpPowerOf2(newCount));
                }
                else if (newCount < this.count_) {
                    var elementsToClear_1 = this.count_ - newCount;
                    this.fields_.forEach(function (field) {
                        var array = _this.fieldArrayView(field, _this.data_, _this.count_);
                        var zeroes = new (field.type.arrayType)(elementsToClear_1 * field.count);
                        array.set(zeroes, newCount * field.count);
                    });
                }
                this.count_ = newCount;
                return invalidation;
            };
            MultiArrayBuffer.prototype.extend = function () {
                var invalidation = 0;
                if (this.count_ == this.capacity_) {
                    invalidation = this.reserve(this.capacity_ * 2);
                }
                ++this.count_;
                return invalidation;
            };
            MultiArrayBuffer.prototype.indexedFieldView = function (index) {
                return this.fieldArrayView(this.fields_[index], this.data_, this.capacity_);
            };
            return MultiArrayBuffer;
        }());
        container.MultiArrayBuffer = MultiArrayBuffer;
    })(container = sd.container || (sd.container = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var container;
    (function (container) {
        function lowerBound(array, value) {
            var count = array.length;
            var it;
            var first = 0;
            while (count > 0) {
                var step = count >> 1;
                it = first + step;
                if (array[it] < value) {
                    first = ++it;
                    count -= step + 1;
                }
                else {
                    count = step;
                }
            }
            return first;
        }
        container.lowerBound = lowerBound;
        function upperBound(array, value) {
            var count = array.length;
            var it;
            var first = 0;
            while (count > 0) {
                var step = count >> 1;
                it = first + step;
                if (array[it] <= value) {
                    first = ++it;
                    count -= step + 1;
                }
                else {
                    count = step;
                }
            }
            return first;
        }
        container.upperBound = upperBound;
        var SortedArray = (function () {
            function SortedArray(source, compareFn_) {
                this.compareFn_ = compareFn_;
                this.data_ = source ? source.slice(0) : [];
                if (source) {
                    this.sort();
                }
            }
            SortedArray.prototype.sort = function () {
                if (this.data_.length < 2) {
                    return;
                }
                var t0 = this.data_[0];
                var cmp = this.compareFn_;
                if (cmp === undefined && typeof t0 !== "string") {
                    cmp = function (a, b) {
                        return (a < b) ? -1 : ((a > b) ? 1 : 0);
                    };
                }
                this.data_.sort(cmp);
            };
            SortedArray.prototype.insert = function (value) {
                var successor = lowerBound(this.data_, value);
                this.data_.splice(successor, 0, value);
            };
            SortedArray.prototype.insertMultiple = function (values) {
                var sourceLength = values.length;
                if (sourceLength > Math.min(20, this.data_.length / 2)) {
                    container.appendArrayInPlace(this.data_, values);
                    this.sort();
                }
                else {
                    for (var ix = 0; ix < sourceLength; ++ix) {
                        this.insert(values[ix]);
                    }
                }
            };
            Object.defineProperty(SortedArray.prototype, "array", {
                get: function () {
                    return this.data_;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SortedArray.prototype, "length", {
                get: function () {
                    return this.data_.length;
                },
                enumerable: true,
                configurable: true
            });
            return SortedArray;
        }());
        container.SortedArray = SortedArray;
    })(container = sd.container || (sd.container = {}));
})(sd || (sd = {}));
if (!ArrayBuffer.transfer) {
    ArrayBuffer.transfer = function arrayTransferShim(oldBuffer, newByteLength) {
        var oldByteLength = oldBuffer.byteLength;
        newByteLength = newByteLength | 0;
        sd.assert(newByteLength > 0);
        if (newByteLength < oldByteLength) {
            return oldBuffer.slice(0, newByteLength);
        }
        var oldBufferView = new Uint8Array(oldBuffer);
        var newBufferView = new Uint8Array(newByteLength);
        newBufferView.set(oldBufferView);
        return newBufferView.buffer;
    };
}
/*! Copyright (c) 2015-2016 Arthur Langereis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var sd;
(function (sd) {
    sd.UInt8 = {
        min: 0,
        max: 255,
        signed: false,
        byteSize: 1,
        arrayType: Uint8Array
    };
    sd.UInt8Clamped = {
        min: 0,
        max: 255,
        signed: false,
        byteSize: 1,
        arrayType: Uint8ClampedArray
    };
    sd.SInt8 = {
        min: -128,
        max: 127,
        signed: true,
        byteSize: 1,
        arrayType: Int8Array
    };
    sd.UInt16 = {
        min: 0,
        max: 65535,
        signed: false,
        byteSize: 2,
        arrayType: Uint16Array
    };
    sd.SInt16 = {
        min: -32768,
        max: 32767,
        signed: true,
        byteSize: 2,
        arrayType: Int16Array
    };
    sd.UInt32 = {
        min: 0,
        max: 4294967295,
        signed: false,
        byteSize: 4,
        arrayType: Uint32Array
    };
    sd.SInt32 = {
        min: -2147483648,
        max: 2147483647,
        signed: true,
        byteSize: 4,
        arrayType: Int32Array
    };
    sd.Float = {
        min: -340282346638528859811704183484516925440.0,
        max: 340282346638528859811704183484516925440.0,
        signed: true,
        byteSize: 4,
        arrayType: Float32Array
    };
    sd.Double = {
        min: -179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
        max: 179769313486231570814527423731704356798070567525844996598917476803157260780028538760589558632766878171540458953514382464234321326889464182768467546703537516986049910576551282076245490090389328944075868508455133942304583236903222948165808559332123348274797826204144723168738177180919299881250404026184124858368.0,
        signed: true,
        byteSize: 8,
        arrayType: Float64Array
    };
})(sd || (sd = {}));
var mrdoob;
(function (mrdoob) {
    var GRAPH_WIDTH = 74;
    var GRAPH_HEIGHT = 30;
    var Stats = (function () {
        function Stats() {
            var _this = this;
            this.startTime = performance.now();
            this.prevTime = this.startTime;
            this.ms = 0;
            this.msMin = 1000;
            this.msMax = 0;
            this.fps = 0;
            this.fpsMin = 1000;
            this.fpsMax = 0;
            this.frames = 0;
            this.mode_ = 0;
            var container = this.container = document.createElement("div");
            container.id = "stats";
            container.addEventListener("mousedown", function (event) {
                event.preventDefault();
                _this.setMode(++_this.mode_ % 2);
            }, false);
            container.style.cssText = "width:80px;opacity:0.9;cursor:pointer";
            var fpsDiv = document.createElement("div");
            fpsDiv.id = "fps";
            fpsDiv.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#002";
            container.appendChild(fpsDiv);
            var fpsText = this.fpsText = document.createElement("div");
            fpsText.id = "fpsText";
            fpsText.style.cssText = "color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
            fpsText.innerHTML = "FPS";
            fpsDiv.appendChild(fpsText);
            var fpsGraph = this.fpsGraph = document.createElement("div");
            fpsGraph.id = "fpsGraph";
            fpsGraph.style.cssText = "position:relative;width:" + GRAPH_WIDTH + "px;height:" + GRAPH_HEIGHT + "px;background-color:#0ff";
            fpsDiv.appendChild(fpsGraph);
            while (fpsGraph.children.length < GRAPH_WIDTH) {
                var bar = document.createElement("span");
                bar.style.cssText = "width:1px;height:" + GRAPH_HEIGHT + "px;float:left;background-color:#113";
                fpsGraph.appendChild(bar);
            }
            var msDiv = this.msDiv = document.createElement("div");
            msDiv.id = "ms";
            msDiv.style.cssText = "padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";
            container.appendChild(msDiv);
            var msText = this.msText = document.createElement("div");
            msText.id = "msText";
            msText.style.cssText = "color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
            msText.innerHTML = "MS";
            msDiv.appendChild(msText);
            var msGraph = this.msGraph = document.createElement("div");
            msGraph.id = "msGraph";
            msGraph.style.cssText = "position:relative;width:" + GRAPH_WIDTH + "px;height:" + GRAPH_HEIGHT + "px;background-color:#0f0";
            msDiv.appendChild(msGraph);
            while (msGraph.children.length < GRAPH_WIDTH) {
                var bar = document.createElement("span");
                bar.style.cssText = "width:1px;height:" + GRAPH_HEIGHT + "px;float:left;background-color:#131";
                msGraph.appendChild(bar);
            }
        }
        Object.defineProperty(Stats.prototype, "mode", {
            get: function () {
                return this.mode_;
            },
            enumerable: true,
            configurable: true
        });
        Stats.prototype.setMode = function (value) {
            this.mode_ = value;
            switch (this.mode_) {
                case 0:
                    this.fpsDiv.style.display = "block";
                    this.msDiv.style.display = "none";
                    break;
                case 1:
                    this.fpsDiv.style.display = "none";
                    this.msDiv.style.display = "block";
                    break;
            }
        };
        Stats.prototype.updateGraph = function (elem, value) {
            var child = elem.appendChild(elem.firstChild);
            child.style.height = value + "px";
        };
        Object.defineProperty(Stats.prototype, "domElement", {
            get: function () {
                return this.container;
            },
            enumerable: true,
            configurable: true
        });
        Stats.prototype.begin = function () {
            this.startTime = performance.now();
        };
        Stats.prototype.end = function () {
            var time = performance.now();
            this.ms = Math.round(time - this.startTime);
            this.msMin = Math.min(this.msMin, this.ms);
            this.msMax = Math.max(this.msMax, this.ms);
            this.msText.textContent = this.ms + " MS (" + this.msMin + "-" + this.msMax + ")";
            this.updateGraph(this.msGraph, Math.min(GRAPH_HEIGHT, GRAPH_HEIGHT - (this.ms / 200) * GRAPH_HEIGHT));
            this.frames++;
            if (time > this.prevTime + 1000) {
                this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
                this.fpsMin = Math.min(this.fpsMin, this.fps);
                this.fpsMax = Math.max(this.fpsMax, this.fps);
                this.fpsText.textContent = this.fps + " FPS (" + this.fpsMin + "-" + this.fpsMax + ")";
                this.updateGraph(this.fpsGraph, Math.min(GRAPH_HEIGHT, GRAPH_HEIGHT - (this.fps / 100) * GRAPH_HEIGHT));
                this.prevTime = time;
                this.frames = 0;
            }
            return time;
        };
        Stats.prototype.update = function () {
            this.startTime = this.end();
        };
        return Stats;
    }());
    mrdoob.Stats = Stats;
})(mrdoob || (mrdoob = {}));
var sd;
(function (sd) {
    var io;
    (function (io) {
        var FlyCam = (function () {
            function FlyCam(initialPos) {
                this.pos_ = [0, 0, 0];
                this.angleX_ = 0;
                this.angleY_ = Math.PI;
                this.dir_ = [0, 0, -1];
                this.up_ = [0, 1, 0];
                this.speed_ = 0;
                this.sideSpeed_ = 0;
                sd.vec3.copy(this.pos_, initialPos);
                this.rotate([0, 0]);
            }
            FlyCam.prototype.update = function (timeStep, acceleration, sideAccel) {
                this.speed_ += timeStep * acceleration;
                this.sideSpeed_ += timeStep * sideAccel;
                sd.vec3.scaleAndAdd(this.pos_, this.pos_, this.dir_, this.speed_);
                var right = sd.vec3.cross([], this.dir_, this.up_);
                sd.vec3.scaleAndAdd(this.pos_, this.pos_, right, this.sideSpeed_);
                this.speed_ *= 0.9;
                if (Math.abs(this.speed_) < 0.001) {
                    this.speed_ = 0;
                }
                this.sideSpeed_ *= 0.9;
                if (Math.abs(this.sideSpeed_) < 0.001) {
                    this.sideSpeed_ = 0;
                }
            };
            FlyCam.prototype.rotate = function (localRelXY) {
                this.angleX_ -= Math.PI * 1.5 * localRelXY[1];
                this.angleY_ += Math.PI * 2 * localRelXY[0];
                this.rot_ = sd.quat.fromEuler(0, this.angleY_, this.angleX_);
                sd.vec3.transformQuat(this.dir_, [0, 0, 1], this.rot_);
                sd.vec3.normalize(this.dir_, this.dir_);
                sd.vec3.transformQuat(this.up_, [0, 1, 0], this.rot_);
                sd.vec3.normalize(this.up_, this.up_);
            };
            Object.defineProperty(FlyCam.prototype, "pos", {
                get: function () { return this.pos_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FlyCam.prototype, "dir", {
                get: function () { return this.dir_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FlyCam.prototype, "rotation", {
                get: function () { return this.rot_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FlyCam.prototype, "focusPos", {
                get: function () { return sd.vec3.add([], this.pos_, this.dir_); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FlyCam.prototype, "viewMatrix", {
                get: function () { return sd.mat4.lookAt([], this.pos_, this.focusPos, this.up_); },
                enumerable: true,
                configurable: true
            });
            return FlyCam;
        }());
        io.FlyCam = FlyCam;
        var FlyCamController = (function () {
            function FlyCamController(sensingElem, initialPos) {
                var _this = this;
                this.tracking_ = false;
                this.lastPos_ = [0, 0];
                this.deviceTilt_ = 0;
                this.deviceTouch_ = false;
                this.cam = new FlyCam(initialPos);
                this.vpWidth_ = sensingElem.offsetWidth;
                this.vpHeight_ = sensingElem.offsetHeight;
                sd.dom.on(sensingElem, "mousedown", function (evt) {
                    _this.tracking_ = true;
                    _this.lastPos_ = [evt.clientX, evt.clientY];
                });
                sd.dom.on(window, "mousemove", function (evt) {
                    if (!_this.tracking_) {
                        return;
                    }
                    var newPos = [evt.clientX, evt.clientY];
                    var delta = sd.vec2.sub([], newPos, _this.lastPos_);
                    sd.vec2.divide(delta, delta, [-_this.vpWidth_, -_this.vpHeight_]);
                    _this.lastPos_ = newPos;
                    _this.cam.rotate(delta);
                });
                sd.dom.on(window, "mouseup", function (_evt) {
                    _this.tracking_ = false;
                });
                sd.dom.on(window, "deviceorientation", function (evt) {
                    _this.deviceTilt_ = (evt.beta || 0) * Math.sign(evt.gamma || 0);
                });
                sd.dom.on(window, "touchstart", function (_evt) {
                    _this.deviceTouch_ = true;
                });
                sd.dom.on(window, "touchend", function (_evt) {
                    _this.deviceTouch_ = false;
                });
                sd.dom.on(window, "touchcancel", function (_evt) {
                    _this.deviceTouch_ = false;
                });
            }
            FlyCamController.prototype.step = function (timeStep) {
                var maxAccel = 0.8;
                var accel = 0, sideAccel = 0;
                if (io.keyboard.down(io.Key.UP) || io.keyboard.down(io.Key.W)) {
                    accel = maxAccel;
                }
                else if (io.keyboard.down(io.Key.DOWN) || io.keyboard.down(io.Key.S)) {
                    accel = -maxAccel;
                }
                if (io.keyboard.down(io.Key.LEFT) || io.keyboard.down(io.Key.A)) {
                    sideAccel = -maxAccel;
                }
                else if (io.keyboard.down(io.Key.RIGHT) || io.keyboard.down(io.Key.D)) {
                    sideAccel = maxAccel;
                }
                if (this.deviceTouch_) {
                    accel = maxAccel;
                }
                this.cam.update(timeStep, accel, sideAccel);
            };
            return FlyCamController;
        }());
        io.FlyCamController = FlyCamController;
    })(io = sd.io || (sd.io = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var dom;
    (function (dom) {
        function $n(sel, base) { return Array.prototype.slice.call((base || document).querySelectorAll(sel), 0); }
        dom.$n = $n;
        function $(sel, base) {
            if (typeof sel === "string") {
                return $n(sel, base);
            }
            else if (sel instanceof Node) {
                return [sel];
            }
            else {
                return sel;
            }
        }
        dom.$ = $;
        function $1(sel, base) { return $(sel, base)[0]; }
        dom.$1 = $1;
        function show(sel, disp) { $(sel).forEach(function (el) { el.style.display = (disp != null) ? disp : "block"; }); }
        dom.show = show;
        function hide(sel) { $(sel).forEach(function (el) { el.style.display = "none"; }); }
        dom.hide = hide;
        function setDisabled(sel, dis) { $(sel).forEach(function (el) { el.disabled = dis; }); }
        dom.setDisabled = setDisabled;
        function enable(sel) { setDisabled(sel, false); }
        dom.enable = enable;
        function disable(sel) { setDisabled(sel, true); }
        dom.disable = disable;
        function closest(sourceSel, sel) {
            var source = ($1(sourceSel));
            if (!source) {
                return undefined;
            }
            if (source.closest) {
                return source.closest(sel);
            }
            do {
                source = source.parentNode ? source.parentNode : undefined;
                if (!source || source.nodeType !== Node.ELEMENT_NODE) {
                    return undefined;
                }
                var elem = source;
                var matchFn = elem.matches || elem.webkitMatchesSelector || elem.msMatchesSelector;
                if (matchFn.call(elem, sel)) {
                    return elem;
                }
            } while (source);
            return undefined;
        }
        dom.closest = closest;
        function nextElementSibling(elem) {
            while (elem) {
                elem = (elem.nextSibling);
                if (elem && elem.nodeType == Node.ELEMENT_NODE) {
                    return elem;
                }
            }
            return undefined;
        }
        dom.nextElementSibling = nextElementSibling;
        function on(target, evt, handler) {
            var list = (target instanceof Window) ? [target] : $(target);
            list.forEach(function (tgt) { tgt.addEventListener(evt, handler); });
        }
        dom.on = on;
        function off(target, evt, handler) {
            var list = (target instanceof Window) ? [target] : $(target);
            list.forEach(function (tgt) { tgt.removeEventListener(evt, handler); });
        }
        dom.off = off;
    })(dom = sd.dom || (sd.dom = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var io;
    (function (io) {
        var Key;
        (function (Key) {
            Key[Key["UP"] = 38] = "UP";
            Key[Key["DOWN"] = 40] = "DOWN";
            Key[Key["LEFT"] = 37] = "LEFT";
            Key[Key["RIGHT"] = 39] = "RIGHT";
            Key[Key["SPACE"] = 32] = "SPACE";
            Key[Key["RETURN"] = 13] = "RETURN";
            Key[Key["ESC"] = 27] = "ESC";
            Key[Key["PAGEUP"] = 33] = "PAGEUP";
            Key[Key["PAGEDOWN"] = 34] = "PAGEDOWN";
            Key[Key["HOME"] = 36] = "HOME";
            Key[Key["END"] = 35] = "END";
            Key[Key["DELETE"] = 46] = "DELETE";
            Key[Key["A"] = "A".charCodeAt(0)] = "A";
            Key[Key["B"] = "B".charCodeAt(0)] = "B";
            Key[Key["C"] = "C".charCodeAt(0)] = "C";
            Key[Key["D"] = "D".charCodeAt(0)] = "D";
            Key[Key["E"] = "E".charCodeAt(0)] = "E";
            Key[Key["F"] = "F".charCodeAt(0)] = "F";
            Key[Key["G"] = "G".charCodeAt(0)] = "G";
            Key[Key["H"] = "H".charCodeAt(0)] = "H";
            Key[Key["I"] = "I".charCodeAt(0)] = "I";
            Key[Key["J"] = "J".charCodeAt(0)] = "J";
            Key[Key["K"] = "K".charCodeAt(0)] = "K";
            Key[Key["L"] = "L".charCodeAt(0)] = "L";
            Key[Key["M"] = "M".charCodeAt(0)] = "M";
            Key[Key["N"] = "N".charCodeAt(0)] = "N";
            Key[Key["O"] = "O".charCodeAt(0)] = "O";
            Key[Key["P"] = "P".charCodeAt(0)] = "P";
            Key[Key["Q"] = "Q".charCodeAt(0)] = "Q";
            Key[Key["R"] = "R".charCodeAt(0)] = "R";
            Key[Key["S"] = "S".charCodeAt(0)] = "S";
            Key[Key["T"] = "T".charCodeAt(0)] = "T";
            Key[Key["U"] = "U".charCodeAt(0)] = "U";
            Key[Key["V"] = "V".charCodeAt(0)] = "V";
            Key[Key["W"] = "W".charCodeAt(0)] = "W";
            Key[Key["X"] = "X".charCodeAt(0)] = "X";
            Key[Key["Y"] = "Y".charCodeAt(0)] = "Y";
            Key[Key["Z"] = "Z".charCodeAt(0)] = "Z";
        })(Key = io.Key || (io.Key = {}));
        ;
        var KeyboardImpl = (function () {
            function KeyboardImpl() {
                var _this = this;
                var fields = [
                    { type: sd.UInt8, count: 1 },
                    { type: sd.UInt8, count: 1 },
                    { type: sd.UInt32, count: 1 },
                ];
                this.keyData_ = new sd.container.MultiArrayBuffer(128, fields);
                this.downBase_ = this.keyData_.indexedFieldView(0);
                this.halfTransBase_ = this.keyData_.indexedFieldView(1);
                this.lastEventBase_ = this.keyData_.indexedFieldView(2);
                sd.dom.on(window, "keydown", function (evt) {
                    var lastEvent = _this.lastEventBase_[evt.keyCode];
                    var wasDown = _this.downBase_[evt.keyCode];
                    if (lastEvent < evt.timeStamp) {
                        if (!wasDown) {
                            _this.downBase_[evt.keyCode] = 1;
                            ++_this.halfTransBase_[evt.keyCode];
                        }
                        _this.lastEventBase_[evt.keyCode] = evt.timeStamp;
                    }
                    if (!evt.metaKey) {
                        evt.preventDefault();
                    }
                });
                sd.dom.on(window, "keyup", function (evt) {
                    _this.downBase_[evt.keyCode] = 0;
                    ++_this.halfTransBase_[evt.keyCode];
                    _this.lastEventBase_[evt.keyCode] = evt.timeStamp;
                    if (!evt.metaKey) {
                        evt.preventDefault();
                    }
                });
                sd.dom.on(window, "blur", function (_evt) {
                    _this.keyData_.clear();
                });
                sd.dom.on(window, "focus", function (_evt) {
                    _this.keyData_.clear();
                });
            }
            KeyboardImpl.prototype.keyState = function (kc) {
                return {
                    down: !!this.downBase_[kc],
                    halfTransitionCount: this.halfTransBase_[kc]
                };
            };
            KeyboardImpl.prototype.down = function (kc) {
                return !!this.downBase_[kc];
            };
            KeyboardImpl.prototype.halfTransitions = function (kc) {
                return this.halfTransBase_[kc];
            };
            KeyboardImpl.prototype.pressed = function (kc) {
                return this.downBase_[kc] ? (this.halfTransBase_[kc] > 0) : false;
            };
            KeyboardImpl.prototype.resetHalfTransitions = function () {
                sd.container.fill(this.halfTransBase_, 0, this.halfTransBase_.length);
            };
            return KeyboardImpl;
        }());
        io.keyboard = new KeyboardImpl();
    })(io = sd.io || (sd.io = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var math;
    (function (math) {
        var aabb;
        (function (aabb) {
            function setCenterAndSize(min, max, center, size) {
                sd.vec3.scaleAndAdd(min, center, size, -0.5);
                sd.vec3.scaleAndAdd(max, center, size, 0.5);
            }
            aabb.setCenterAndSize = setCenterAndSize;
            function calculateCenterAndSize(center, size, min, max) {
                sd.vec3.subtract(size, max, min);
                sd.vec3.scaleAndAdd(center, min, size, 0.5);
            }
            aabb.calculateCenterAndSize = calculateCenterAndSize;
            function encapsulatePoint(min, max, pt) {
                if (pt[0] < min[0]) {
                    min[0] = pt[0];
                }
                if (pt[0] > max[0]) {
                    max[0] = pt[0];
                }
                if (pt[1] < min[1]) {
                    min[1] = pt[1];
                }
                if (pt[1] > max[1]) {
                    max[1] = pt[1];
                }
                if (pt[2] < min[2]) {
                    min[2] = pt[2];
                }
                if (pt[2] > max[2]) {
                    max[2] = pt[2];
                }
            }
            aabb.encapsulatePoint = encapsulatePoint;
            function encapsulateAABB(min, max, otherMin, otherMax) {
                if (otherMin[0] < min[0]) {
                    min[0] = otherMin[0];
                }
                if (otherMax[0] > max[0]) {
                    max[0] = otherMax[0];
                }
                if (otherMin[1] < min[1]) {
                    min[1] = otherMin[1];
                }
                if (otherMax[1] > max[1]) {
                    max[1] = otherMax[1];
                }
                if (otherMin[2] < min[2]) {
                    min[2] = otherMin[2];
                }
                if (otherMax[2] > max[2]) {
                    max[2] = otherMax[2];
                }
            }
            aabb.encapsulateAABB = encapsulateAABB;
            function containsPoint(min, max, pt) {
                return pt[0] >= min[0] && pt[1] >= min[1] && pt[2] >= min[2] &&
                    pt[0] <= max[0] && pt[1] <= max[1] && pt[2] <= max[2];
            }
            aabb.containsPoint = containsPoint;
            function containsAABB(min, max, otherMin, otherMax) {
                return otherMin[0] >= min[0] && otherMin[1] >= min[1] && otherMin[2] >= min[2] &&
                    otherMax[0] <= max[0] && otherMax[1] <= max[1] && otherMax[2] <= max[2];
            }
            aabb.containsAABB = containsAABB;
            function intersectsAABB(min, max, otherMin, otherMax) {
                return otherMin[0] <= max[0] && otherMax[0] >= min[0] &&
                    otherMin[1] <= max[1] && otherMax[1] >= min[1] &&
                    otherMin[2] <= max[2] && otherMax[2] >= min[2];
            }
            aabb.intersectsAABB = intersectsAABB;
            function closestPoint(min, max, pt) {
                return [
                    math.clamp(pt[0], min[0], max[0]),
                    math.clamp(pt[1], min[1], max[1]),
                    math.clamp(pt[2], min[2], max[2])
                ];
            }
            aabb.closestPoint = closestPoint;
            function size(min, max) {
                return sd.vec3.subtract([0, 0, 0], max, min);
            }
            aabb.size = size;
            function extents(min, max) {
                return sd.vec3.scale([], size(min, max), 0.5);
            }
            aabb.extents = extents;
            function center(min, max) {
                return sd.vec3.add([], min, extents(min, max));
            }
            aabb.center = center;
            function transformMat3(destMin, destMax, sourceMin, sourceMax, mat) {
                var destA = sd.vec3.transformMat3([], sourceMin, mat);
                var destB = sd.vec3.transformMat3([], sourceMax, mat);
                sd.vec3.min(destMin, destA, destB);
                sd.vec3.max(destMax, destA, destB);
            }
            aabb.transformMat3 = transformMat3;
            function transformMat4(destMin, destMax, sourceMin, sourceMax, mat) {
                var destA = sd.vec3.transformMat4([], sourceMin, mat);
                var destB = sd.vec3.transformMat4([], sourceMax, mat);
                sd.vec3.min(destMin, destA, destB);
                sd.vec3.max(destMax, destA, destB);
            }
            aabb.transformMat4 = transformMat4;
        })(aabb = math.aabb || (math.aabb = {}));
        var AABB = (function () {
            function AABB(min, max) {
                var data = new Float32Array(6);
                this.min = data.subarray(0, 3);
                this.max = data.subarray(3, 6);
                if (min && max) {
                    this.min[0] = min[0];
                    this.min[1] = min[1];
                    this.min[2] = min[2];
                    this.max[0] = max[0];
                    this.max[1] = max[1];
                    this.max[2] = max[2];
                }
                else {
                    this.min[0] = sd.Float.max;
                    this.min[1] = sd.Float.max;
                    this.min[2] = sd.Float.max;
                    this.max[0] = sd.Float.min;
                    this.max[1] = sd.Float.min;
                    this.max[2] = sd.Float.min;
                }
            }
            AABB.fromCenterAndSize = function (center, size) {
                var min = [];
                var max = [];
                aabb.setCenterAndSize(min, max, center, size);
                return new AABB(min, max);
            };
            AABB.prototype.setCenterAndSize = function (center, size) {
                aabb.setCenterAndSize(this.min, this.max, center, size);
            };
            AABB.prototype.setMinAndMax = function (min, max) {
                this.min[0] = min[0];
                this.min[1] = min[1];
                this.min[2] = min[2];
                this.max[0] = max[0];
                this.max[1] = max[1];
                this.max[2] = max[2];
            };
            AABB.prototype.encapsulatePoint = function (pt) {
                aabb.encapsulatePoint(this.min, this.max, pt);
            };
            AABB.prototype.encapsulateAABB = function (bounds) {
                aabb.encapsulateAABB(this.min, this.max, bounds.min, bounds.max);
            };
            Object.defineProperty(AABB.prototype, "size", {
                get: function () { return aabb.size(this.min, this.max); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AABB.prototype, "extents", {
                get: function () { return aabb.extents(this.min, this.max); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(AABB.prototype, "center", {
                get: function () { return aabb.center(this.min, this.max); },
                enumerable: true,
                configurable: true
            });
            AABB.prototype.containsPoint = function (pt) {
                return aabb.containsPoint(this.min, this.max, pt);
            };
            AABB.prototype.containsAABB = function (bounds) {
                return aabb.containsAABB(this.min, this.max, bounds.min, bounds.max);
            };
            AABB.prototype.intersectsAABB = function (bounds) {
                return aabb.intersectsAABB(this.min, this.max, bounds.min, bounds.max);
            };
            AABB.prototype.closestPoint = function (pt) {
                return aabb.closestPoint(this.min, this.max, pt);
            };
            return AABB;
        }());
        math.AABB = AABB;
    })(math = sd.math || (sd.math = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var math;
    (function (math) {
        function viewportMatrix(x, y, w, h, n, f) {
            return [
                w / 2, 0, 0, 0,
                0, h / 2, 0, 0,
                0, 0, (f - n) / 2, 0,
                w / 2 + x, h / 2 + y, (f + n) / 2, 1
            ];
        }
        math.viewportMatrix = viewportMatrix;
        function screenSpaceBoundsForWorldCube(outBounds, position, halfDim, cameraDir, viewMatrix, projectionViewMatrix, viewportMatrix) {
            var lx = position[0];
            var ly = position[1];
            var lz = position[2];
            var camUp = sd.vec3.normalize([], [viewMatrix[4], viewMatrix[5], viewMatrix[6]]);
            var camLeft = sd.vec3.cross([], camUp, cameraDir);
            sd.vec3.normalize(camLeft, camLeft);
            var leftLight = sd.vec4.transformMat4([], [
                lx + halfDim * camLeft[0],
                ly + halfDim * camLeft[1],
                lz + halfDim * camLeft[2],
                1.0
            ], projectionViewMatrix);
            var upLight = sd.vec4.transformMat4([], [
                lx + halfDim * camUp[0],
                ly + halfDim * camUp[1],
                lz + halfDim * camUp[2],
                1.0
            ], projectionViewMatrix);
            var centerLight = sd.vec4.transformMat4([], [lx, ly, lz, 1.0], projectionViewMatrix);
            sd.vec4.scale(leftLight, leftLight, 1.0 / leftLight[3]);
            sd.vec4.scale(upLight, upLight, 1.0 / upLight[3]);
            sd.vec4.scale(centerLight, centerLight, 1.0 / centerLight[3]);
            sd.vec4.transformMat4(leftLight, leftLight, viewportMatrix);
            sd.vec4.transformMat4(upLight, upLight, viewportMatrix);
            sd.vec4.transformMat4(centerLight, centerLight, viewportMatrix);
            var dw = sd.vec4.subtract([], leftLight, centerLight);
            var lenw = sd.vec4.length(dw);
            var dh = sd.vec4.subtract([], upLight, centerLight);
            var lenh = sd.vec4.length(dh);
            var leftx = centerLight[0] - lenw;
            var bottomy = centerLight[1] - lenh;
            var rightx = centerLight[0] + lenw;
            var topy = centerLight[1] + lenh;
            outBounds.left = leftx;
            outBounds.right = rightx;
            outBounds.bottom = bottomy;
            outBounds.top = topy;
        }
        math.screenSpaceBoundsForWorldCube = screenSpaceBoundsForWorldCube;
        function makePlaneFromPoints(a, b, c) {
            var normal = sd.vec3.normalize([], sd.vec3.cross([], sd.vec3.sub([], b, a), sd.vec3.sub([], c, a)));
            return {
                normal: normal,
                d: sd.vec3.dot(normal, a)
            };
        }
        math.makePlaneFromPoints = makePlaneFromPoints;
        function makePlaneFromPointAndNormal(p, normal) {
            var orthoNormal = sd.vec3.arbitraryOrthogonalVec(normal);
            var b = sd.vec3.add([], p, orthoNormal);
            var c = sd.vec3.add([], p, sd.vec3.cross([], normal, orthoNormal));
            return makePlaneFromPoints(p, b, c);
        }
        math.makePlaneFromPointAndNormal = makePlaneFromPointAndNormal;
        function pointDistanceToPlane(point, plane) {
            return sd.vec3.dot(plane.normal, point) + plane.d;
        }
        math.pointDistanceToPlane = pointDistanceToPlane;
        function makeBoundedPlane(center, normal, size) {
            var bp = makePlaneFromPointAndNormal(center, normal);
            bp.center = sd.vec3.clone(center);
            bp.size = sd.vec2.clone(size);
            return bp;
        }
        math.makeBoundedPlane = makeBoundedPlane;
        function boundingSizeOfBoundedPlane(bp) {
            var wx = Math.abs(Math.sin(Math.acos(bp.normal[0])));
            var wz = Math.abs(Math.sin(Math.acos(bp.normal[2])));
            return [
                Math.max(0.001, bp.size[0] * wx),
                Math.max(0.001, (bp.normal[0] * bp.size[0]) + (bp.normal[2] * bp.size[1])),
                Math.max(0.001, bp.size[1] * wz)
            ];
        }
        math.boundingSizeOfBoundedPlane = boundingSizeOfBoundedPlane;
        function transformBoundedPlaneMat4(bp, mat) {
            var newCenter = sd.vec3.transformMat4([], bp.center, mat);
            var normMat = sd.mat3.normalFromMat4([], mat);
            var newNormal = sd.vec3.transformMat3([], bp.normal, normMat);
            return makeBoundedPlane(newCenter, newNormal, bp.size);
        }
        math.transformBoundedPlaneMat4 = transformBoundedPlaneMat4;
        function planesOfTransformedBox(center, size, _transMat4) {
            var planes = [];
            var extents = sd.vec3.scale([], size, 0.5);
            var cx = center[0], cy = center[1], cz = center[2];
            var ex = extents[0], ey = extents[1], ez = extents[2];
            var corners = [
                sd.vec3.fromValues(cx - ex, cy - ey, cz - ez),
                sd.vec3.fromValues(cx - ex, cy - ey, cz + ez),
                sd.vec3.fromValues(cx + ex, cy - ey, cz - ez),
                sd.vec3.fromValues(cx + ex, cy - ey, cz + ez),
                sd.vec3.fromValues(cx - ex, cy + ey, cz - ez),
                sd.vec3.fromValues(cx - ex, cy + ey, cz + ez),
                sd.vec3.fromValues(cx + ex, cy + ey, cz - ez),
                sd.vec3.fromValues(cx + ex, cy + ey, cz + ez)
            ];
            planes.push(makePlaneFromPoints(corners[2], corners[1], corners[0]));
            return planes;
        }
        math.planesOfTransformedBox = planesOfTransformedBox;
        function intersectMovingSpherePlane(sphere, direction, plane) {
            var result = { intersected: false };
            var dist = sd.vec3.dot(plane.normal, sphere.center) - plane.d;
            if (Math.abs(dist) < sphere.radius) {
                result.intersected = true;
                result.t = 0;
                result.point = sd.vec3.clone(sphere.center);
            }
            else {
                var denom = sd.vec3.dot(plane.normal, direction);
                if (denom * dist < 0) {
                    var radius = dist > 0 ? sphere.radius : -sphere.radius;
                    result.intersected = true;
                    result.t = (radius - dist) / denom;
                    result.point = sd.vec3.scaleAndAdd([], sphere.center, direction, result.t);
                    sd.vec3.scaleAndAdd(result.point, result.point, plane.normal, -radius);
                }
            }
            return result;
        }
        math.intersectMovingSpherePlane = intersectMovingSpherePlane;
    })(math = sd.math || (sd.math = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var math;
    (function (math) {
        var RectStorage = (function () {
            function RectStorage(elementType, capacity) {
                var fields = [
                    { type: elementType, count: 1 },
                    { type: elementType, count: 1 },
                    { type: elementType, count: 1 },
                    { type: elementType, count: 1 },
                ];
                this.data_ = new sd.container.FixedMultiArray(capacity, fields);
                this.leftBase = this.data_.indexedFieldView(0);
                this.topBase = this.data_.indexedFieldView(1);
                this.rightBase = this.data_.indexedFieldView(2);
                this.bottomBase = this.data_.indexedFieldView(3);
            }
            Object.defineProperty(RectStorage.prototype, "capacity", {
                get: function () { return this.data_.capacity; },
                enumerable: true,
                configurable: true
            });
            return RectStorage;
        }());
        math.RectStorage = RectStorage;
        var RectStorageProxy = (function () {
            function RectStorageProxy(storage_, index) {
                this.storage_ = storage_;
                this.index = index;
            }
            Object.defineProperty(RectStorageProxy.prototype, "left", {
                get: function () { return this.storage_.leftBase[this.index]; },
                set: function (newLeft) { this.storage_.leftBase[this.index] = newLeft; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RectStorageProxy.prototype, "top", {
                get: function () { return this.storage_.topBase[this.index]; },
                set: function (newTop) { this.storage_.topBase[this.index] = newTop; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RectStorageProxy.prototype, "right", {
                get: function () { return this.storage_.rightBase[this.index]; },
                set: function (newRight) { this.storage_.rightBase[this.index] = newRight; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RectStorageProxy.prototype, "bottom", {
                get: function () { return this.storage_.bottomBase[this.index]; },
                set: function (newBottom) { this.storage_.bottomBase[this.index] = newBottom; },
                enumerable: true,
                configurable: true
            });
            return RectStorageProxy;
        }());
        math.RectStorageProxy = RectStorageProxy;
        function setRectLTRB(r, left, top, right, bottom) {
            r.left = left;
            r.top = top;
            r.right = right;
            r.bottom = bottom;
        }
        math.setRectLTRB = setRectLTRB;
        function setRectLTWH(r, left, top, width, height) {
            r.left = left;
            r.top = top;
            r.right = left + width;
            r.bottom = top + height;
        }
        math.setRectLTWH = setRectLTWH;
        var RectEx = (function () {
            function RectEx(left, top, right, bottom) {
                this.left = left;
                this.top = top;
                this.right = right;
                this.bottom = bottom;
                this.topLeft = sd.vec2.fromValues(left, top);
                this.topRight = sd.vec2.fromValues(right, top);
                this.bottomLeft = sd.vec2.fromValues(left, bottom);
                this.bottomRight = sd.vec2.fromValues(right, bottom);
            }
            RectEx.prototype.intersectsLineSegment = function (ptA, ptB) {
                var d = [ptB[0] - ptA[0], ptB[1] - ptA[1]];
                var tmin = 0;
                var tmax = 9999;
                for (var i = 0; i < 2; ++i) {
                    if (Math.abs(d[i]) < 0.00001) {
                        if (ptA[i] < this.topLeft[i] || ptA[i] > this.bottomRight[i]) {
                            return false;
                        }
                    }
                    else {
                        var ood = 1 / d[i];
                        var t1 = (this.topLeft[i] - ptA[i]) * ood;
                        var t2 = (this.bottomRight[i] - ptA[i]) * ood;
                        if (t1 > t2) {
                            var tt = t2;
                            t2 = t1;
                            t1 = tt;
                        }
                        if (t1 > tmin) {
                            tmin = t1;
                        }
                        if (t2 < tmax) {
                            tmax = t2;
                        }
                        if (tmin > tmax) {
                            return false;
                        }
                    }
                }
                return tmin < 1.0;
            };
            return RectEx;
        }());
        math.RectEx = RectEx;
    })(math = sd.math || (sd.math = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var meshdata;
    (function (meshdata) {
        var VertexIndexMappingB = (function () {
            function VertexIndexMappingB() {
                this.data_ = new Map();
            }
            Object.defineProperty(VertexIndexMappingB.prototype, "indexCount", {
                get: function () { return this.data_.size; },
                enumerable: true,
                configurable: true
            });
            VertexIndexMappingB.prototype.add = function (from, to) {
                if (!this.data_.has(from)) {
                    this.data_.set(from, [to]);
                }
                else {
                    var mapped = this.data_.get(from);
                    if (mapped.indexOf(to) == -1) {
                        mapped.push(to);
                    }
                    this.data_.set(from, mapped);
                }
            };
            VertexIndexMappingB.prototype.mappedValues = function (forIndex) {
                return this.data_.get(forIndex);
            };
            return VertexIndexMappingB;
        }());
        var MeshBuilder = (function () {
            function MeshBuilder(positions, positionIndexes, streams) {
                this.sourcePolygonIndex_ = 0;
                this.streamCount_ = 0;
                this.vertexCount_ = 0;
                this.triangleCount_ = 0;
                this.streams_ = streams.slice(0);
                var positionStream = {
                    attr: { role: 1, field: 23 },
                    mapping: 1,
                    includeInMesh: true,
                    values: positions,
                    indexes: positionIndexes === null ? undefined : positionIndexes
                };
                if (this.streams_.find(function (s) { return s.attr.role == 14; })) {
                    this.streams_.push(positionStream);
                }
                else {
                    this.streams_.unshift(positionStream);
                }
                this.streams_.sort(function (sA, sB) {
                    if (sA.includeInMesh == sB.includeInMesh) {
                        return 0;
                    }
                    return sA.includeInMesh ? -1 : 1;
                });
                var groupers = 0;
                for (var _i = 0, _a = this.streams_; _i < _a.length; _i++) {
                    var s = _a[_i];
                    s.elementCount = meshdata.vertexFieldElementCount(s.attr.field);
                    if (s.controlsGrouping === true) {
                        sd.assert(s.elementCount == 1, "A grouping stream must use a single element field");
                        var groupNumType = meshdata.vertexFieldNumericType(s.attr.field);
                        sd.assert(groupNumType != sd.Float && groupNumType != sd.Double, "A grouping stream must use an integer element");
                        groupers++;
                    }
                }
                sd.assert(groupers < 2, "More than 1 attr stream indicates it's the grouping stream");
                this.groupIndexStreams_ = new Map();
                this.groupIndexStreams_.set(0, []);
                this.groupIndex_ = 0;
                this.groupIndexesRef_ = this.groupIndexStreams_.get(0);
                this.vertexData_ = this.streams_.map(function (_) { return []; });
                this.vertexMapping_ = new Map();
                this.indexMap_ = new VertexIndexMappingB();
                this.streamCount_ = this.streams_.length;
            }
            MeshBuilder.prototype.streamIndexesForPVI = function (polygonVertexIndex, vertexIndex, polygonIndex) {
                var res = [];
                for (var _i = 0, _a = this.streams_; _i < _a.length; _i++) {
                    var stream = _a[_i];
                    var index = void 0;
                    if (stream.mapping == 1) {
                        index = vertexIndex;
                    }
                    else if (stream.mapping == 2) {
                        index = polygonVertexIndex;
                    }
                    else if (stream.mapping == 3) {
                        index = polygonIndex;
                    }
                    else {
                        index = 0;
                    }
                    if (stream.indexes) {
                        index = stream.indexes[index];
                    }
                    res.push(index);
                }
                return res;
            };
            MeshBuilder.prototype.setGroup = function (newGroupIndex) {
                sd.assert(newGroupIndex >= 0, "group index must be >= 0");
                this.groupIndex_ = newGroupIndex;
                if (!this.groupIndexStreams_.has(newGroupIndex)) {
                    this.groupIndexStreams_.set(newGroupIndex, []);
                }
                this.groupIndexesRef_ = this.groupIndexStreams_.get(newGroupIndex);
            };
            MeshBuilder.prototype.getVertexIndex = function (streamIndexes) {
                var key = streamIndexes.join("|");
                if (this.vertexMapping_.has(key)) {
                    return this.vertexMapping_.get(key);
                }
                else {
                    for (var streamIx = 0; streamIx < this.streamCount_; ++streamIx) {
                        var stream = this.streams_[streamIx];
                        var elemCount = stream.elementCount | 0;
                        var array = this.vertexData_[streamIx];
                        var fieldIndex = streamIndexes[streamIx];
                        var values = stream.values;
                        var fieldOffset = elemCount * fieldIndex;
                        if (fieldOffset < 0) {
                            values = [0, 0, 0, 0];
                            fieldOffset = 0;
                        }
                        if (elemCount == 3) {
                            array.push(values[fieldOffset], values[fieldOffset + 1], values[fieldOffset + 2]);
                        }
                        else if (elemCount == 2) {
                            array.push(values[fieldOffset], values[fieldOffset + 1]);
                        }
                        else if (elemCount == 4) {
                            array.push(values[fieldOffset], values[fieldOffset + 1], values[fieldOffset + 2], values[fieldOffset + 3]);
                        }
                        else if (elemCount == 1) {
                            array.push(values[fieldOffset]);
                            if (stream.controlsGrouping) {
                                var gi = values[fieldOffset];
                                if (gi != this.groupIndex_) {
                                    this.setGroup(gi);
                                }
                            }
                        }
                    }
                    var vertexIndex = this.vertexCount_;
                    this.vertexCount_++;
                    this.vertexMapping_.set(key, vertexIndex);
                    return vertexIndex;
                }
            };
            MeshBuilder.prototype.addTriangle = function (polygonVertexIndexes, vertexIndexes) {
                var indexesA = this.streamIndexesForPVI(polygonVertexIndexes[0], vertexIndexes[0], this.sourcePolygonIndex_);
                var indexesB = this.streamIndexesForPVI(polygonVertexIndexes[1], vertexIndexes[1], this.sourcePolygonIndex_);
                var indexesC = this.streamIndexesForPVI(polygonVertexIndexes[2], vertexIndexes[2], this.sourcePolygonIndex_);
                var dstVIxA = this.getVertexIndex(indexesA);
                var dstVIxB = this.getVertexIndex(indexesB);
                var dstVIxC = this.getVertexIndex(indexesC);
                this.indexMap_.add(vertexIndexes[0], dstVIxA);
                this.indexMap_.add(vertexIndexes[1], dstVIxB);
                this.indexMap_.add(vertexIndexes[2], dstVIxC);
                this.groupIndexesRef_.push(dstVIxA, dstVIxB, dstVIxC);
                this.triangleCount_++;
            };
            MeshBuilder.prototype.addPolygon = function (polygonVertexIndexes, vertexIndexes) {
                if (polygonVertexIndexes.length == 3) {
                    this.addTriangle(polygonVertexIndexes, vertexIndexes);
                }
                else {
                    var polyPoints = vertexIndexes.length;
                    var pv0 = polygonVertexIndexes[0];
                    var v0 = vertexIndexes[0];
                    var polyNext = 2;
                    while (polyNext < polyPoints) {
                        this.addTriangle([pv0, polygonVertexIndexes[polyNext - 1], polygonVertexIndexes[polyNext]], [v0, vertexIndexes[polyNext - 1], vertexIndexes[polyNext]]);
                        polyNext++;
                    }
                }
                this.sourcePolygonIndex_++;
            };
            Object.defineProperty(MeshBuilder.prototype, "curPolygonIndex", {
                get: function () { return this.sourcePolygonIndex_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(MeshBuilder.prototype, "indexMap", {
                get: function () { return this.indexMap_; },
                enumerable: true,
                configurable: true
            });
            MeshBuilder.prototype.complete = function () {
                var meshAttributeStreams = this.streams_.filter(function (s) { return s.includeInMesh; });
                var attrs = meshAttributeStreams.map(function (s) { return s.attr; });
                var meshData = new meshdata.MeshData();
                var vb = new meshdata.VertexBuffer(attrs);
                meshData.vertexBuffers.push(vb);
                var indexElemType = meshdata.minimumIndexElementTypeForVertexCount(this.vertexCount_);
                meshData.indexBuffer = new meshdata.IndexBuffer();
                meshData.allocateSingleStorage([this.vertexMapping_.size], indexElemType, this.triangleCount_ * 3);
                for (var six = 0; six < meshAttributeStreams.length; ++six) {
                    var streamData = this.vertexData_[six];
                    var attribute = vb.attrByIndex(six);
                    if (attribute) {
                        var view = new meshdata.VertexBufferAttributeView(vb, attribute);
                        view.copyValuesFrom(streamData, this.vertexCount_);
                    }
                }
                var mergedIndexes = [];
                var nextElementIndex = 0;
                this.groupIndexStreams_.forEach(function (indexes, group) {
                    if (indexes.length) {
                        sd.container.appendArrayInPlace(mergedIndexes, indexes);
                        var groupElementCount = indexes.length;
                        meshData.primitiveGroups.push({
                            type: 4,
                            fromElement: nextElementIndex,
                            elementCount: groupElementCount,
                            materialIx: group
                        });
                        nextElementIndex += groupElementCount;
                    }
                });
                meshData.indexBuffer.setIndexes(0, mergedIndexes.length, mergedIndexes);
                return meshData;
            };
            return MeshBuilder;
        }());
        meshdata.MeshBuilder = MeshBuilder;
    })(meshdata = sd.meshdata || (sd.meshdata = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var meshdata;
    (function (meshdata) {
        var gen;
        (function (gen) {
            function generate(gens, attrList) {
                if (!attrList) {
                    attrList = meshdata.AttrList.Pos3Norm3UV2();
                }
                var genList = Array.isArray(gens) ? gens : [gens];
                var totalVertexCount = 0;
                var totalFaceCount = 0;
                for (var _i = 0, genList_1 = genList; _i < genList_1.length; _i++) {
                    var genSource = genList_1[_i];
                    var generator = ("generator" in genSource) ? genSource.generator : genSource;
                    totalVertexCount += generator.vertexCount;
                    totalFaceCount += generator.faceCount;
                }
                var mesh = new meshdata.MeshData();
                var vertexBuffer = new meshdata.VertexBuffer(attrList);
                mesh.vertexBuffers.push(vertexBuffer);
                mesh.indexBuffer = new meshdata.IndexBuffer();
                var indexElementType = meshdata.minimumIndexElementTypeForVertexCount(totalVertexCount);
                mesh.allocateSingleStorage([totalVertexCount], indexElementType, totalFaceCount * 3);
                var normalAttr = vertexBuffer.attrByRole(2);
                var texAttr = vertexBuffer.attrByRole(6);
                var posView = new meshdata.VertexBufferAttributeView(vertexBuffer, vertexBuffer.attrByRole(1));
                var normalView = normalAttr ? new meshdata.VertexBufferAttributeView(vertexBuffer, normalAttr) : null;
                var texView = texAttr ? new meshdata.VertexBufferAttributeView(vertexBuffer, texAttr) : null;
                var triView = new meshdata.IndexBufferTriangleView(mesh.indexBuffer);
                var posIx = 0, faceIx = 0, normalIx = 0, uvIx = 0, baseVertex = 0;
                var pos2 = function (x, y, _z) {
                    var v2 = posView.refItem(posIx);
                    v2[0] = x;
                    v2[1] = y;
                    posIx++;
                };
                var pos3 = function (x, y, z) {
                    var v3 = posView.refItem(posIx);
                    v3[0] = x;
                    v3[1] = y;
                    v3[2] = z;
                    posIx++;
                };
                var pos = posView.elementCount == 2 ? pos2 : pos3;
                var face = function (a, b, c) {
                    var i3 = triView.refItem(faceIx);
                    i3[0] = a + baseVertex;
                    i3[1] = b + baseVertex;
                    i3[2] = c + baseVertex;
                    faceIx++;
                };
                var normal = normalView ?
                    function (x, y, z) {
                        var v3 = normalView.refItem(normalIx);
                        v3[0] = x;
                        v3[1] = y;
                        v3[2] = z;
                        normalIx++;
                    }
                    : function (_x, _y, _z) { };
                var uv = texView ?
                    function (u, v) {
                        var v2 = texView.refItem(uvIx);
                        v2[0] = u;
                        v2[1] = v;
                        uvIx++;
                    }
                    : function (_u, _v) { };
                var posTransMatrix = sd.mat4.create();
                var normTransMatrix = sd.mat3.create();
                for (var _a = 0, genList_2 = genList; _a < genList_2.length; _a++) {
                    var genSource = genList_2[_a];
                    var generator = ("generator" in genSource) ? genSource.generator : genSource;
                    generator.generate(pos, face, normal, uv);
                    var subVtxCount = generator.vertexCount;
                    var subFaceCount = generator.faceCount;
                    var subPosView = posView.subView(baseVertex, subVtxCount);
                    var subNormalView = normalView ? normalView.subView(baseVertex, subVtxCount) : null;
                    if (subNormalView && !generator.explicitNormals) {
                        var subFaceView = triView.subView(faceIx - subFaceCount, subFaceCount);
                        meshdata.calcVertexNormalsViews(subPosView, subNormalView, subFaceView);
                        normalIx += subVtxCount;
                    }
                    if ("generator" in genSource) {
                        var xformGen = genSource;
                        var rotation = xformGen.rotation || sd.quat.create();
                        var translation = xformGen.translation || sd.vec3.create();
                        var scale_1 = xformGen.scale || sd.vec3.fromValues(1, 1, 1);
                        sd.mat4.fromRotationTranslationScale(posTransMatrix, rotation, translation, scale_1);
                        subPosView.forEach(function (vtxPos) { sd.vec3.transformMat4(vtxPos, vtxPos, posTransMatrix); });
                        if (subNormalView) {
                            sd.mat3.normalFromMat4(normTransMatrix, posTransMatrix);
                            subNormalView.forEach(function (norm) { sd.vec3.transformMat3(norm, norm, normTransMatrix); });
                        }
                    }
                    baseVertex += generator.vertexCount;
                }
                mesh.primitiveGroups.push({
                    type: 4,
                    fromElement: 0,
                    elementCount: totalFaceCount * 3,
                    materialIx: 0
                });
                return mesh;
            }
            gen.generate = generate;
            var Quad = (function () {
                function Quad(width_, height_) {
                    if (width_ === void 0) { width_ = 1; }
                    if (height_ === void 0) { height_ = 1; }
                    this.width_ = width_;
                    this.height_ = height_;
                    sd.assert(width_ > 0);
                    sd.assert(height_ > 0);
                }
                Object.defineProperty(Quad.prototype, "vertexCount", {
                    get: function () {
                        return 4;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Quad.prototype, "faceCount", {
                    get: function () {
                        return 2;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Quad.prototype, "explicitNormals", {
                    get: function () {
                        return true;
                    },
                    enumerable: true,
                    configurable: true
                });
                Quad.prototype.generate = function (position, face, normal, uv) {
                    var xh = this.width_ / 2;
                    var yh = this.height_ / 2;
                    position(-xh, yh, 0);
                    position(xh, yh, 0);
                    position(-xh, -yh, 0);
                    position(xh, -yh, 0);
                    normal(0, 0, -1);
                    normal(0, 0, -1);
                    normal(0, 0, -1);
                    normal(0, 0, -1);
                    uv(0, 0);
                    uv(1, 0);
                    uv(0, 1);
                    uv(1, 1);
                    face(0, 3, 1);
                    face(0, 2, 3);
                };
                return Quad;
            }());
            gen.Quad = Quad;
            var Plane = (function () {
                function Plane(desc) {
                    this.width_ = desc.width;
                    this.depth_ = desc.depth;
                    this.rows_ = desc.rows | 0;
                    this.segs_ = desc.segs | 0;
                    this.yGen_ = desc.yGen || (function (_x, _z) { return 0; });
                    sd.assert(this.width_ > 0);
                    sd.assert(this.depth_ > 0);
                    sd.assert(this.rows_ > 0);
                    sd.assert(this.segs_ > 0);
                }
                Object.defineProperty(Plane.prototype, "vertexCount", {
                    get: function () {
                        return (this.rows_ + 1) * (this.segs_ + 1);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Plane.prototype, "faceCount", {
                    get: function () {
                        return 2 * this.rows_ * this.segs_;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Plane.prototype, "explicitNormals", {
                    get: function () {
                        return false;
                    },
                    enumerable: true,
                    configurable: true
                });
                Plane.prototype.generate = function (position, face, _normal, uv) {
                    var halfWidth = this.width_ / 2;
                    var halfDepth = this.depth_ / 2;
                    var tileDimX = this.width_ / this.segs_;
                    var tileDimZ = this.depth_ / this.rows_;
                    for (var z = 0; z <= this.rows_; ++z) {
                        var posZ = -halfDepth + (z * tileDimZ);
                        for (var x = 0; x <= this.segs_; ++x) {
                            var posX = -halfWidth + (x * tileDimX);
                            position(posX, this.yGen_(posX, posZ), posZ);
                            uv(x / this.segs_, z / this.rows_);
                        }
                    }
                    var baseIndex = 0;
                    var vertexRowCount = this.segs_ + 1;
                    for (var z = 0; z < this.rows_; ++z) {
                        for (var x = 0; x < this.segs_; ++x) {
                            face(baseIndex + x + 1, baseIndex + x + vertexRowCount, baseIndex + x + vertexRowCount + 1);
                            face(baseIndex + x, baseIndex + x + vertexRowCount, baseIndex + x + 1);
                        }
                        baseIndex += vertexRowCount;
                    }
                };
                return Plane;
            }());
            gen.Plane = Plane;
            function cubeDescriptor(diam, inward) {
                if (inward === void 0) { inward = false; }
                return { width: diam, height: diam, depth: diam, inward: inward };
            }
            gen.cubeDescriptor = cubeDescriptor;
            var Box = (function () {
                function Box(desc) {
                    this.xDiam_ = desc.width;
                    this.yDiam_ = desc.height;
                    this.zDiam_ = desc.depth;
                    this.inward_ = desc.inward || false;
                    sd.assert(this.xDiam_ > 0);
                    sd.assert(this.yDiam_ > 0);
                    sd.assert(this.zDiam_ > 0);
                    this.uvRange_ = desc.uvRange ? [desc.uvRange[0], desc.uvRange[1]] : [1, 1];
                    this.uvOffset_ = desc.uvOffset ? [desc.uvOffset[0], desc.uvOffset[1]] : [0, 0];
                }
                Object.defineProperty(Box.prototype, "vertexCount", {
                    get: function () {
                        return 24;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Box.prototype, "faceCount", {
                    get: function () {
                        return 12;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Box.prototype, "explicitNormals", {
                    get: function () {
                        return true;
                    },
                    enumerable: true,
                    configurable: true
                });
                Box.prototype.generate = function (position, face, normal, uv) {
                    var _this = this;
                    var xh = this.xDiam_ / 2;
                    var yh = this.yDiam_ / 2;
                    var zh = this.zDiam_ / 2;
                    var uA = this.uvOffset_[0];
                    var uB = this.uvOffset_[0] + this.uvRange_[0];
                    var vA = this.uvOffset_[1];
                    var vB = this.uvOffset_[1] + this.uvRange_[1];
                    var curVtx = 0;
                    var p = [
                        [-xh, -yh, -zh],
                        [xh, -yh, -zh],
                        [xh, yh, -zh],
                        [-xh, yh, -zh],
                        [-xh, -yh, zh],
                        [xh, -yh, zh],
                        [xh, yh, zh],
                        [-xh, yh, zh]
                    ];
                    var quad = function (a, b, c, d, norm) {
                        if (_this.inward_) {
                            sd.vec3.negate(norm, norm);
                        }
                        position(p[a][0], p[a][1], p[a][2]);
                        position(p[b][0], p[b][1], p[b][2]);
                        position(p[c][0], p[c][1], p[c][2]);
                        position(p[d][0], p[d][1], p[d][2]);
                        normal(norm[0], norm[1], norm[2]);
                        normal(norm[0], norm[1], norm[2]);
                        normal(norm[0], norm[1], norm[2]);
                        normal(norm[0], norm[1], norm[2]);
                        uv(uB, vA);
                        uv(uA, vA);
                        uv(uA, vB);
                        uv(uB, vB);
                        if (_this.inward_) {
                            face(curVtx, curVtx + 2, curVtx + 1);
                            face(curVtx + 2, curVtx, curVtx + 3);
                        }
                        else {
                            face(curVtx, curVtx + 1, curVtx + 2);
                            face(curVtx + 2, curVtx + 3, curVtx);
                        }
                        curVtx += 4;
                    };
                    quad(3, 2, 1, 0, [0, 0, -1]);
                    quad(7, 3, 0, 4, [-1, 0, 0]);
                    quad(6, 7, 4, 5, [0, 0, 1]);
                    quad(2, 6, 5, 1, [1, 0, 0]);
                    quad(7, 6, 2, 3, [0, 1, 0]);
                    quad(5, 4, 0, 1, [0, -1, 0]);
                };
                return Box;
            }());
            gen.Box = Box;
            var Cone = (function () {
                function Cone(desc) {
                    this.radiusA_ = desc.radiusA;
                    this.radiusB_ = desc.radiusB;
                    this.height_ = desc.height;
                    this.rows_ = desc.rows | 0;
                    this.segs_ = desc.segs | 0;
                    sd.assert(this.radiusA_ >= 0);
                    sd.assert(this.radiusB_ >= 0);
                    sd.assert(!((this.radiusA_ == 0) && (this.radiusB_ == 0)));
                    sd.assert(this.rows_ >= 1);
                    sd.assert(this.segs_ >= 3);
                }
                Object.defineProperty(Cone.prototype, "vertexCount", {
                    get: function () {
                        return (this.segs_ + 1) * (this.rows_ + 1);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Cone.prototype, "faceCount", {
                    get: function () {
                        var fc = (2 * this.segs_ * this.rows_);
                        if ((this.radiusA_ == 0) || (this.radiusB_ == 0)) {
                            fc -= this.segs_;
                        }
                        return fc;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Cone.prototype, "explicitNormals", {
                    get: function () {
                        return true;
                    },
                    enumerable: true,
                    configurable: true
                });
                Cone.prototype.generate = function (position, face, normal, uv) {
                    var vix = 0;
                    var radiusDiff = this.radiusB_ - this.radiusA_;
                    var tau = Math.PI * 2;
                    var yNorm = radiusDiff / this.height_;
                    for (var row = 0; row <= this.rows_; ++row) {
                        var relPos = row / this.rows_;
                        var y = (relPos * -this.height_) + (this.height_ / 2);
                        var segRad = this.radiusA_ + (relPos * radiusDiff);
                        var texV = relPos;
                        for (var seg = 0; seg <= this.segs_; ++seg) {
                            var x = Math.sin((tau / this.segs_) * seg) * segRad;
                            var z = Math.cos((tau / this.segs_) * seg) * segRad;
                            var texU = seg / this.segs_;
                            position(x, y, z);
                            var norm = sd.vec3.normalize([], [x, yNorm, z]);
                            normal(norm[0], norm[1], norm[2]);
                            uv(texU, texV);
                            ++vix;
                        }
                        if (row > 0) {
                            var raix = vix - ((this.segs_ + 1) * 2);
                            var rbix = vix - (this.segs_ + 1);
                            for (var seg = 0; seg < this.segs_; ++seg) {
                                var rl = seg;
                                var rr = seg + 1;
                                if (row > 1 || this.radiusA_ > 0) {
                                    face(raix + rl, rbix + rl, raix + rr);
                                }
                                if (row < this.rows_ || this.radiusB_ > 0) {
                                    face(raix + rr, rbix + rl, rbix + rr);
                                }
                            }
                        }
                    }
                };
                return Cone;
            }());
            gen.Cone = Cone;
            var Sphere = (function () {
                function Sphere(desc) {
                    this.radius_ = desc.radius;
                    this.rows_ = desc.rows | 0;
                    this.segs_ = desc.segs | 0;
                    this.sliceFrom_ = sd.math.clamp01(desc.sliceFrom || 0.0);
                    this.sliceTo_ = sd.math.clamp01(desc.sliceTo || 1.0);
                    sd.assert(this.radius_ > 0);
                    sd.assert(this.rows_ >= 2);
                    sd.assert(this.segs_ >= 3);
                    sd.assert(this.sliceTo_ > this.sliceFrom_);
                }
                Object.defineProperty(Sphere.prototype, "vertexCount", {
                    get: function () {
                        return (this.segs_ + 1) * (this.rows_ + 1);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Sphere.prototype, "faceCount", {
                    get: function () {
                        var fc = 2 * this.segs_ * this.rows_;
                        if (this.sliceFrom_ == 0.0) {
                            fc -= this.segs_;
                        }
                        if (this.sliceTo_ == 1.0) {
                            fc -= this.segs_;
                        }
                        return fc;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Sphere.prototype, "explicitNormals", {
                    get: function () {
                        return true;
                    },
                    enumerable: true,
                    configurable: true
                });
                Sphere.prototype.generate = function (position, face, normal, uv) {
                    var pi = Math.PI;
                    var tau = Math.PI * 2;
                    var slice = this.sliceTo_ - this.sliceFrom_;
                    var piFrom = this.sliceFrom_ * pi;
                    var piSlice = slice * pi;
                    var vix = 0;
                    var openTop = this.sliceFrom_ > 0.0;
                    var openBottom = this.sliceTo_ < 1.0;
                    for (var row = 0; row <= this.rows_; ++row) {
                        var y = Math.cos(piFrom + (piSlice / this.rows_) * row) * this.radius_;
                        var segRad = Math.sin(piFrom + (piSlice / this.rows_) * row) * this.radius_;
                        var texV = this.sliceFrom_ + ((row / this.rows_) * slice);
                        for (var seg = 0; seg <= this.segs_; ++seg) {
                            var tauSeg = (tau / this.segs_);
                            var x = Math.sin(tauSeg * seg) * segRad;
                            var z = Math.cos(tauSeg * seg) * segRad;
                            var texU = seg / this.segs_;
                            position(x, y, z);
                            var norm = sd.vec3.normalize([], [x, y, z]);
                            normal(norm[0], norm[1], norm[2]);
                            uv(texU, texV);
                            ++vix;
                        }
                        if (row > 0) {
                            var raix = vix - ((this.segs_ + 1) * 2);
                            var rbix = vix - (this.segs_ + 1);
                            for (var seg = 0; seg < this.segs_; ++seg) {
                                var rl = seg;
                                var rr = seg + 1;
                                if (row > 1 || openTop) {
                                    face(raix + rl, rbix + rl, raix + rr);
                                }
                                if (row < this.rows_ || openBottom) {
                                    face(raix + rr, rbix + rl, rbix + rr);
                                }
                            }
                        }
                    }
                };
                return Sphere;
            }());
            gen.Sphere = Sphere;
            var Torus = (function () {
                function Torus(desc) {
                    this.minorRadius_ = desc.minorRadius;
                    this.majorRadius_ = desc.majorRadius;
                    this.rows_ = desc.rows | 0;
                    this.segs_ = desc.segs | 0;
                    this.sliceFrom_ = sd.math.clamp01(desc.sliceFrom || 0.0);
                    this.sliceTo_ = sd.math.clamp01(desc.sliceTo || 1.0);
                    sd.assert(this.minorRadius_ >= 0);
                    sd.assert(this.majorRadius_ >= this.minorRadius_);
                    sd.assert(this.minorRadius_ > 0 || this.majorRadius_ > 0);
                    sd.assert(this.rows_ >= 4);
                    sd.assert(this.segs_ >= 3);
                    sd.assert(this.sliceTo_ > this.sliceFrom_);
                }
                Object.defineProperty(Torus.prototype, "vertexCount", {
                    get: function () {
                        return (this.segs_ + 1) * (this.rows_ + 1);
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Torus.prototype, "faceCount", {
                    get: function () {
                        return 2 * this.segs_ * this.rows_;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Torus.prototype, "explicitNormals", {
                    get: function () {
                        return true;
                    },
                    enumerable: true,
                    configurable: true
                });
                Torus.prototype.generate = function (position, face, normal, uv) {
                    var tau = Math.PI * 2;
                    var slice = this.sliceTo_ - this.sliceFrom_;
                    var piFrom = this.sliceFrom_ * tau;
                    var piSlice = slice * tau;
                    var vix = 0;
                    var innerRadius = this.majorRadius_ - this.minorRadius_;
                    for (var row = 0; row <= this.rows_; ++row) {
                        var majorAngle = piFrom + ((piSlice * row) / this.rows_);
                        var texV = this.sliceFrom_ + ((row / this.rows_) * slice);
                        for (var seg = 0; seg <= this.segs_; ++seg) {
                            var innerAngle = (tau * seg) / this.segs_;
                            var cx = Math.cos(majorAngle) * this.majorRadius_;
                            var cy = Math.sin(majorAngle) * this.majorRadius_;
                            var x = Math.cos(majorAngle) * (this.majorRadius_ + Math.cos(innerAngle) * innerRadius);
                            var y = Math.sin(majorAngle) * (this.majorRadius_ + Math.cos(innerAngle) * innerRadius);
                            var z = Math.sin(innerAngle) * innerRadius;
                            var texU = seg / this.segs_;
                            var vNorm = sd.vec3.normalize([], [x - cx, y - cy, z]);
                            position(x, y, z);
                            normal(vNorm[0], vNorm[1], vNorm[2]);
                            uv(texU, texV);
                            ++vix;
                        }
                        if (row > 0) {
                            var raix = vix - ((this.segs_ + 1) * 2);
                            var rbix = vix - (this.segs_ + 1);
                            for (var seg = 0; seg < this.segs_; ++seg) {
                                var rl = seg;
                                var rr = seg + 1;
                                face(raix + rl, rbix + rl, raix + rr);
                                face(raix + rr, rbix + rl, rbix + rr);
                            }
                        }
                    }
                };
                return Torus;
            }());
            gen.Torus = Torus;
        })(gen = meshdata.gen || (meshdata.gen = {}));
    })(meshdata = sd.meshdata || (sd.meshdata = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var meshdata;
    (function (meshdata) {
        function scale(mesh, scale) {
            var posAttr = mesh.findFirstAttributeWithRole(1);
            if (posAttr) {
                var posView = new meshdata.VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
                posView.forEach(function (pos) { sd.vec3.multiply(pos, pos, scale); });
            }
        }
        meshdata.scale = scale;
        function translate(mesh, globalDelta) {
            var posAttr = mesh.findFirstAttributeWithRole(1);
            if (posAttr) {
                var posView = new meshdata.VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
                posView.forEach(function (pos) { sd.vec3.add(pos, pos, globalDelta); });
            }
        }
        meshdata.translate = translate;
        function rotate(mesh, rotation) {
            var posAttr = mesh.findFirstAttributeWithRole(1);
            if (posAttr) {
                var posView = new meshdata.VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
                posView.forEach(function (pos) { sd.vec3.transformQuat(pos, pos, rotation); });
            }
            var normAttr = mesh.findFirstAttributeWithRole(2);
            if (normAttr) {
                var normView = new meshdata.VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
                normView.forEach(function (norm) { sd.vec3.transformQuat(norm, norm, rotation); });
            }
        }
        meshdata.rotate = rotate;
        function transform(mesh, actions) {
            var rotation = actions.rotate || sd.quat.create();
            var translation = actions.translate || sd.vec3.zero();
            var scale = actions.scale || sd.vec3.one();
            var posMatrix = sd.mat4.fromRotationTranslationScale([], rotation, translation, scale);
            var posAttr = mesh.findFirstAttributeWithRole(1);
            if (posAttr) {
                var posView = new meshdata.VertexBufferAttributeView(posAttr.vertexBuffer, posAttr.attr);
                posView.forEach(function (pos) { sd.vec3.transformMat4(pos, pos, posMatrix); });
            }
            var normAttr = mesh.findFirstAttributeWithRole(2);
            if (normAttr) {
                var normView = new meshdata.VertexBufferAttributeView(normAttr.vertexBuffer, normAttr.attr);
                var normalMatrix_1 = sd.mat3.normalFromMat4([], posMatrix);
                normView.forEach(function (norm) { sd.vec3.transformMat3(norm, norm, normalMatrix_1); });
            }
        }
        meshdata.transform = transform;
    })(meshdata = sd.meshdata || (sd.meshdata = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var meshdata;
    (function (meshdata) {
        ;
        function vertexFieldElementCount(vf) {
            switch (vf) {
                case 13:
                case 17:
                case 21:
                    return 1;
                case 1:
                case 129:
                case 4:
                case 132:
                case 7:
                case 135:
                case 10:
                case 138:
                case 14:
                case 18:
                case 22:
                    return 2;
                case 2:
                case 130:
                case 5:
                case 133:
                case 8:
                case 136:
                case 11:
                case 139:
                case 15:
                case 19:
                case 23:
                    return 3;
                case 3:
                case 131:
                case 6:
                case 134:
                case 9:
                case 137:
                case 12:
                case 140:
                case 16:
                case 20:
                case 24:
                    return 4;
                case 0:
                default:
                    return 0;
            }
        }
        meshdata.vertexFieldElementCount = vertexFieldElementCount;
        function vertexFieldNumericType(vf) {
            switch (vf) {
                case 21:
                case 22:
                case 23:
                case 24:
                    return sd.Float;
                case 13:
                case 14:
                case 15:
                case 16:
                    return sd.UInt32;
                case 17:
                case 18:
                case 19:
                case 20:
                    return sd.SInt32;
                case 7:
                case 135:
                case 8:
                case 136:
                case 9:
                case 137:
                    return sd.UInt16;
                case 10:
                case 138:
                case 11:
                case 139:
                case 12:
                case 140:
                    return sd.SInt16;
                case 1:
                case 129:
                case 2:
                case 130:
                case 3:
                case 131:
                    return sd.UInt8;
                case 4:
                case 132:
                case 5:
                case 133:
                case 6:
                case 134:
                    return sd.SInt8;
                case 0:
                default:
                    return null;
            }
        }
        meshdata.vertexFieldNumericType = vertexFieldNumericType;
        function vertexFieldElementSizeBytes(vf) {
            var nt = vertexFieldNumericType(vf);
            return nt ? nt.byteSize : 0;
        }
        meshdata.vertexFieldElementSizeBytes = vertexFieldElementSizeBytes;
        function vertexFieldSizeBytes(vf) {
            return vertexFieldElementSizeBytes(vf) * vertexFieldElementCount(vf);
        }
        meshdata.vertexFieldSizeBytes = vertexFieldSizeBytes;
        function vertexFieldIsNormalized(vf) {
            return (vf & 0x80) != 0;
        }
        meshdata.vertexFieldIsNormalized = vertexFieldIsNormalized;
        function attrPosition2() { return { field: 22, role: 1 }; }
        meshdata.attrPosition2 = attrPosition2;
        function attrPosition3() { return { field: 23, role: 1 }; }
        meshdata.attrPosition3 = attrPosition3;
        function attrNormal3() { return { field: 23, role: 2 }; }
        meshdata.attrNormal3 = attrNormal3;
        function attrColour3() { return { field: 23, role: 4 }; }
        meshdata.attrColour3 = attrColour3;
        function attrUV2() { return { field: 22, role: 6 }; }
        meshdata.attrUV2 = attrUV2;
        function attrTangent3() { return { field: 23, role: 3 }; }
        meshdata.attrTangent3 = attrTangent3;
        function attrJointIndexes() { return { field: 20, role: 14 }; }
        meshdata.attrJointIndexes = attrJointIndexes;
        function attrWeightedPos(index) {
            sd.assert(index >= 0 && index < 4);
            return { field: 24, role: 10 + index };
        }
        meshdata.attrWeightedPos = attrWeightedPos;
        var AttrList;
        (function (AttrList) {
            function Pos3Norm3() {
                return [attrPosition3(), attrNormal3()];
            }
            AttrList.Pos3Norm3 = Pos3Norm3;
            function Pos3Norm3Colour3() {
                return [attrPosition3(), attrNormal3(), attrColour3()];
            }
            AttrList.Pos3Norm3Colour3 = Pos3Norm3Colour3;
            function Pos3Norm3UV2() {
                return [attrPosition3(), attrNormal3(), attrUV2()];
            }
            AttrList.Pos3Norm3UV2 = Pos3Norm3UV2;
            function Pos3Norm3Colour3UV2() {
                return [attrPosition3(), attrNormal3(), attrColour3(), attrUV2()];
            }
            AttrList.Pos3Norm3Colour3UV2 = Pos3Norm3Colour3UV2;
            function Pos3Norm3UV2Tan3() {
                return [attrPosition3(), attrNormal3(), attrUV2(), attrTangent3()];
            }
            AttrList.Pos3Norm3UV2Tan3 = Pos3Norm3UV2Tan3;
        })(AttrList = meshdata.AttrList || (meshdata.AttrList = {}));
        function makePositionedAttr(fieldOrAttr, roleOrOffset, offset) {
            if (typeof fieldOrAttr === "number") {
                return {
                    field: fieldOrAttr,
                    role: roleOrOffset,
                    offset: offset | 0
                };
            }
            else {
                return {
                    field: fieldOrAttr.field,
                    role: fieldOrAttr.role,
                    offset: roleOrOffset | 0
                };
            }
        }
        meshdata.makePositionedAttr = makePositionedAttr;
        function alignFieldOnSize(size, offset) {
            var mask = sd.math.roundUpPowerOf2(size) - 1;
            return (offset + mask) & ~mask;
        }
        function alignVertexField(field, offset) {
            return alignFieldOnSize(vertexFieldElementSizeBytes(field), offset);
        }
        var VertexLayout = (function () {
            function VertexLayout(attrList) {
                this.attributeCount_ = 0;
                this.vertexSizeBytes_ = 0;
                this.attributeCount_ = attrList.length;
                var offset = 0, maxElemSize = 0;
                this.attrs_ = attrList.map(function (attr) {
                    var size = vertexFieldSizeBytes(attr.field);
                    maxElemSize = Math.max(maxElemSize, vertexFieldElementSizeBytes(attr.field));
                    var alignedOffset = alignVertexField(attr.field, offset);
                    offset = alignedOffset + size;
                    return makePositionedAttr(attr, alignedOffset);
                });
                maxElemSize = Math.max(Float32Array.BYTES_PER_ELEMENT, maxElemSize);
                this.vertexSizeBytes_ = alignFieldOnSize(maxElemSize, offset);
            }
            Object.defineProperty(VertexLayout.prototype, "attributeCount", {
                get: function () { return this.attributeCount_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(VertexLayout.prototype, "vertexSizeBytes", {
                get: function () { return this.vertexSizeBytes_; },
                enumerable: true,
                configurable: true
            });
            VertexLayout.prototype.bytesRequiredForVertexCount = function (vertexCount) {
                return vertexCount * this.vertexSizeBytes_;
            };
            VertexLayout.prototype.attrByRole = function (role) {
                var attr = this.attrs_.find(function (pa) { return pa.role == role; });
                return attr || null;
            };
            VertexLayout.prototype.attrByIndex = function (index) {
                return this.attrs_[index] || null;
            };
            VertexLayout.prototype.hasAttributeWithRole = function (role) {
                return this.attrByRole(role) != null;
            };
            return VertexLayout;
        }());
        meshdata.VertexLayout = VertexLayout;
        var VertexBuffer = (function () {
            function VertexBuffer(attrs) {
                this.itemCount_ = 0;
                this.storageOffsetBytes_ = 0;
                this.storage_ = null;
                if (attrs instanceof VertexLayout) {
                    this.layout_ = attrs;
                }
                else {
                    this.layout_ = new VertexLayout(attrs);
                }
            }
            Object.defineProperty(VertexBuffer.prototype, "layout", {
                get: function () { return this.layout_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(VertexBuffer.prototype, "strideBytes", {
                get: function () { return this.layout_.vertexSizeBytes; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(VertexBuffer.prototype, "attributeCount", {
                get: function () { return this.layout_.attributeCount; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(VertexBuffer.prototype, "itemCount", {
                get: function () { return this.itemCount_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(VertexBuffer.prototype, "bufferSizeBytes", {
                get: function () { return this.strideBytes * this.itemCount_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(VertexBuffer.prototype, "bufferLocalOffsetBytes", {
                get: function () { return this.storageOffsetBytes_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(VertexBuffer.prototype, "buffer", {
                get: function () { return this.storage_; },
                enumerable: true,
                configurable: true
            });
            VertexBuffer.prototype.bufferView = function () {
                if (this.storage_) {
                    return new Uint8Array(this.storage_, this.storageOffsetBytes_, this.bufferSizeBytes);
                }
                return null;
            };
            VertexBuffer.prototype.allocate = function (itemCount) {
                this.itemCount_ = itemCount;
                this.storage_ = new ArrayBuffer(this.layout_.bytesRequiredForVertexCount(itemCount));
                this.storageOffsetBytes_ = 0;
            };
            VertexBuffer.prototype.suballocate = function (itemCount, insideBuffer, atByteOffset) {
                this.itemCount_ = itemCount;
                this.storage_ = insideBuffer;
                this.storageOffsetBytes_ = atByteOffset;
            };
            VertexBuffer.prototype.hasAttributeWithRole = function (role) {
                return this.layout_.hasAttributeWithRole(role);
            };
            VertexBuffer.prototype.attrByRole = function (role) {
                return this.layout_.attrByRole(role);
            };
            VertexBuffer.prototype.attrByIndex = function (index) {
                return this.layout_.attrByIndex(index);
            };
            return VertexBuffer;
        }());
        meshdata.VertexBuffer = VertexBuffer;
        var VertexBufferAttributeView = (function () {
            function VertexBufferAttributeView(vertexBuffer_, attr_, firstItem_, itemCount) {
                if (firstItem_ === void 0) { firstItem_ = 0; }
                if (itemCount === void 0) { itemCount = -1; }
                this.vertexBuffer_ = vertexBuffer_;
                this.attr_ = attr_;
                this.firstItem_ = firstItem_;
                this.stride_ = this.vertexBuffer_.layout.vertexSizeBytes;
                this.attrOffset_ = attr_.offset;
                this.attrElementCount_ = vertexFieldElementCount(attr_.field);
                this.fieldNumType_ = vertexFieldNumericType(attr_.field);
                sd.assert(this.fieldNumType_, "Unknown attribute field type");
                this.typedViewCtor_ = this.fieldNumType_.arrayType;
                this.buffer_ = this.vertexBuffer_.buffer;
                sd.assert(this.buffer_, "Tried to create a view on an unallocated buffer");
                this.dataView_ = new DataView(this.buffer_);
                this.viewItemCount_ = itemCount < 0 ? (this.vertexBuffer_.itemCount - this.firstItem_) : itemCount;
                sd.assert(this.firstItem_ + this.viewItemCount_ <= this.vertexBuffer_.itemCount, "view item range is bigger than buffer");
            }
            VertexBufferAttributeView.prototype.forEach = function (callback) {
                var max = this.count;
                for (var ix = 0; ix < max; ++ix) {
                    callback(this.refItem(ix));
                }
            };
            VertexBufferAttributeView.prototype.copyValuesFrom = function (source, valueCount, offset) {
                if (offset === void 0) { offset = 0; }
                sd.assert(this.firstItem_ + offset + valueCount <= this.viewItemCount_, "buffer overflow");
                sd.assert(source.length >= valueCount * this.attrElementCount_, "not enough elements in source");
                var buffer = this.buffer_;
                var stride = this.stride_;
                var elementSize = this.fieldNumType_.byteSize;
                var firstIndex = this.firstItem_ + offset;
                var offsetBytes = this.vertexBuffer_.bufferLocalOffsetBytes + (this.stride_ * firstIndex) + this.attrOffset_;
                var sourceIndex = 0;
                var arrView;
                if (this.attrElementCount_ == 1) {
                    if (stride % elementSize == 0) {
                        var strideInElements = (stride / elementSize) | 0;
                        var offsetInElements = (offsetBytes / elementSize) | 0;
                        arrView = new (this.typedViewCtor_)(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
                        var vertexOffset = 0;
                        for (var n = 0; n < valueCount; ++n) {
                            arrView[vertexOffset] = source[sourceIndex];
                            sourceIndex += 1;
                            vertexOffset += strideInElements;
                        }
                    }
                    else {
                        for (var n = 0; n < valueCount; ++n) {
                            arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 1);
                            arrView[0] = source[sourceIndex];
                            sourceIndex += 1;
                            offsetBytes += stride;
                        }
                    }
                }
                else if (this.attrElementCount_ == 2) {
                    if (stride % elementSize == 0) {
                        var strideInElements = (stride / elementSize) | 0;
                        var offsetInElements = (offsetBytes / elementSize) | 0;
                        arrView = new (this.typedViewCtor_)(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
                        var vertexOffset = 0;
                        for (var n = 0; n < valueCount; ++n) {
                            arrView[0 + vertexOffset] = source[sourceIndex];
                            arrView[1 + vertexOffset] = source[sourceIndex + 1];
                            sourceIndex += 2;
                            vertexOffset += strideInElements;
                        }
                    }
                    else {
                        for (var n = 0; n < valueCount; ++n) {
                            arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 2);
                            arrView[0] = source[sourceIndex];
                            arrView[1] = source[sourceIndex + 1];
                            sourceIndex += 2;
                            offsetBytes += stride;
                        }
                    }
                }
                else if (this.attrElementCount_ == 3) {
                    if (stride % elementSize == 0) {
                        var strideInElements = (stride / elementSize) | 0;
                        var offsetInElements = (offsetBytes / elementSize) | 0;
                        arrView = new (this.typedViewCtor_)(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
                        var vertexOffset = 0;
                        for (var n = 0; n < valueCount; ++n) {
                            arrView[0 + vertexOffset] = source[sourceIndex];
                            arrView[1 + vertexOffset] = source[sourceIndex + 1];
                            arrView[2 + vertexOffset] = source[sourceIndex + 2];
                            sourceIndex += 3;
                            vertexOffset += strideInElements;
                        }
                    }
                    else {
                        for (var n = 0; n < valueCount; ++n) {
                            arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 3);
                            arrView[0] = source[sourceIndex];
                            arrView[1] = source[sourceIndex + 1];
                            arrView[2] = source[sourceIndex + 2];
                            sourceIndex += 3;
                            offsetBytes += stride;
                        }
                    }
                }
                else if (this.attrElementCount_ == 4) {
                    if (stride % elementSize == 0) {
                        var strideInElements = (stride / elementSize) | 0;
                        var offsetInElements = (offsetBytes / elementSize) | 0;
                        arrView = new (this.typedViewCtor_)(buffer, offsetBytes, (valueCount * strideInElements) - offsetInElements);
                        var vertexOffset = 0;
                        for (var n = 0; n < valueCount; ++n) {
                            arrView[0 + vertexOffset] = source[sourceIndex];
                            arrView[1 + vertexOffset] = source[sourceIndex + 1];
                            arrView[2 + vertexOffset] = source[sourceIndex + 2];
                            arrView[3 + vertexOffset] = source[sourceIndex + 3];
                            sourceIndex += 4;
                            vertexOffset += strideInElements;
                        }
                    }
                    else {
                        for (var n = 0; n < valueCount; ++n) {
                            arrView = new (this.typedViewCtor_)(buffer, offsetBytes, 4);
                            arrView[0] = source[sourceIndex];
                            arrView[1] = source[sourceIndex + 1];
                            arrView[2] = source[sourceIndex + 2];
                            arrView[3] = source[sourceIndex + 3];
                            sourceIndex += 4;
                            offsetBytes += stride;
                        }
                    }
                }
            };
            VertexBufferAttributeView.prototype.refItem = function (index) {
                index += this.firstItem_;
                var offsetBytes = this.vertexBuffer_.bufferLocalOffsetBytes + (this.stride_ * index) + this.attrOffset_;
                return new (this.typedViewCtor_)(this.buffer_, offsetBytes, this.attrElementCount_);
            };
            VertexBufferAttributeView.prototype.copyItem = function (index) {
                index += this.firstItem_;
                var offsetBytes = this.vertexBuffer_.bufferLocalOffsetBytes + (this.stride_ * index) + this.attrOffset_;
                var result = [];
                switch (this.attr_.field) {
                    case 24:
                        result.push(this.dataView_.getFloat32(offsetBytes, true));
                        offsetBytes += 4;
                    case 23:
                        result.push(this.dataView_.getFloat32(offsetBytes, true));
                        offsetBytes += 4;
                    case 22:
                        result.push(this.dataView_.getFloat32(offsetBytes, true));
                        offsetBytes += 4;
                    case 21:
                        result.push(this.dataView_.getFloat32(offsetBytes, true));
                        break;
                    default:
                        sd.assert(false, "copyItem not implemented for this fieldtype");
                        break;
                }
                return result;
            };
            Object.defineProperty(VertexBufferAttributeView.prototype, "count", {
                get: function () {
                    return this.viewItemCount_;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(VertexBufferAttributeView.prototype, "elementCount", {
                get: function () {
                    return this.attrElementCount_;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(VertexBufferAttributeView.prototype, "baseVertex", {
                get: function () {
                    return this.firstItem_;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(VertexBufferAttributeView.prototype, "vertexBuffer", {
                get: function () {
                    return this.vertexBuffer_;
                },
                enumerable: true,
                configurable: true
            });
            VertexBufferAttributeView.prototype.subView = function (fromItem, subItemCount) {
                return new VertexBufferAttributeView(this.vertexBuffer_, this.attr_, this.firstItem_ + fromItem, subItemCount);
            };
            return VertexBufferAttributeView;
        }());
        meshdata.VertexBufferAttributeView = VertexBufferAttributeView;
        function indexElementTypeSizeBytes(iet) {
            switch (iet) {
                case 1:
                    return Uint8Array.BYTES_PER_ELEMENT;
                case 2:
                    return Uint16Array.BYTES_PER_ELEMENT;
                case 3:
                    return Uint32Array.BYTES_PER_ELEMENT;
                default:
                    sd.assert(false, "Invalid IndexElementType");
                    return 0;
            }
        }
        meshdata.indexElementTypeSizeBytes = indexElementTypeSizeBytes;
        function minimumIndexElementTypeForVertexCount(vertexCount) {
            if (vertexCount <= sd.UInt8.max) {
                return 1;
            }
            if (vertexCount <= sd.UInt16.max) {
                return 2;
            }
            return 3;
        }
        meshdata.minimumIndexElementTypeForVertexCount = minimumIndexElementTypeForVertexCount;
        function bytesRequiredForIndexCount(elementType, indexCount) {
            return indexElementTypeSizeBytes(elementType) * indexCount;
        }
        meshdata.bytesRequiredForIndexCount = bytesRequiredForIndexCount;
        function elementOffsetForPrimitiveCount(primitiveType, primitiveCount) {
            switch (primitiveType) {
                case 1:
                    return primitiveCount;
                case 2:
                    return primitiveCount * 2;
                case 3:
                    return primitiveCount;
                case 4:
                    return primitiveCount * 3;
                case 5:
                    return primitiveCount;
                default:
                    sd.assert(false, "Unknown primitive type");
                    return 0;
            }
        }
        meshdata.elementOffsetForPrimitiveCount = elementOffsetForPrimitiveCount;
        function elementCountForPrimitiveCount(primitiveType, primitiveCount) {
            switch (primitiveType) {
                case 1:
                    return primitiveCount;
                case 2:
                    return primitiveCount * 2;
                case 3:
                    return primitiveCount + 1;
                case 4:
                    return primitiveCount * 3;
                case 5:
                    return primitiveCount + 2;
                default:
                    sd.assert(false, "Unknown primitive type");
                    return 0;
            }
        }
        meshdata.elementCountForPrimitiveCount = elementCountForPrimitiveCount;
        function primitiveCountForElementCount(primitiveType, elementCount) {
            switch (primitiveType) {
                case 1:
                    return elementCount;
                case 2:
                    return (elementCount / 2) | 0;
                case 3:
                    return elementCount - 1;
                case 4:
                    return (elementCount / 3) | 0;
                case 5:
                    return elementCount - 2;
                default:
                    sd.assert(false, "Unknown primitive type");
                    return 0;
            }
        }
        meshdata.primitiveCountForElementCount = primitiveCountForElementCount;
        var IndexBuffer = (function () {
            function IndexBuffer() {
                this.indexElementType_ = 0;
                this.indexCount_ = 0;
                this.indexElementSizeBytes_ = 0;
                this.storage_ = null;
                this.storageOffsetBytes_ = 0;
            }
            IndexBuffer.prototype.allocate = function (elementType, elementCount) {
                this.indexElementType_ = elementType;
                this.indexElementSizeBytes_ = indexElementTypeSizeBytes(this.indexElementType_);
                this.indexCount_ = elementCount;
                this.storage_ = new ArrayBuffer(this.bufferSizeBytes);
                this.storageOffsetBytes_ = 0;
            };
            IndexBuffer.prototype.suballocate = function (elementType, indexCount, insideBuffer, atByteOffset) {
                this.indexElementType_ = elementType;
                this.indexElementSizeBytes_ = indexElementTypeSizeBytes(this.indexElementType_);
                this.indexCount_ = indexCount;
                this.storage_ = insideBuffer;
                this.storageOffsetBytes_ = atByteOffset;
            };
            Object.defineProperty(IndexBuffer.prototype, "indexElementType", {
                get: function () { return this.indexElementType_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(IndexBuffer.prototype, "indexCount", {
                get: function () { return this.indexCount_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(IndexBuffer.prototype, "indexElementSizeBytes", {
                get: function () { return this.indexElementSizeBytes_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(IndexBuffer.prototype, "bufferSizeBytes", {
                get: function () { return this.indexCount_ * this.indexElementSizeBytes_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(IndexBuffer.prototype, "bufferLocalOffsetBytes", {
                get: function () { return this.storageOffsetBytes_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(IndexBuffer.prototype, "buffer", {
                get: function () { return this.storage_; },
                enumerable: true,
                configurable: true
            });
            IndexBuffer.prototype.bufferView = function () {
                if (this.storage_) {
                    return new Uint8Array(this.storage_, this.storageOffsetBytes_, this.bufferSizeBytes);
                }
                return null;
            };
            IndexBuffer.prototype.typedBasePtr = function (baseIndexNr, elementCount) {
                sd.assert(this.storage_, "No storage allocated yet!");
                var offsetBytes = this.storageOffsetBytes_ + this.indexElementSizeBytes_ * baseIndexNr;
                if (this.indexElementType_ === 3) {
                    return new Uint32Array(this.storage_, offsetBytes, elementCount);
                }
                else if (this.indexElementType_ === 2) {
                    return new Uint16Array(this.storage_, offsetBytes, elementCount);
                }
                else {
                    return new Uint8Array(this.storage_, offsetBytes, elementCount);
                }
            };
            IndexBuffer.prototype.copyIndexes = function (baseIndexNr, outputCount, outputPtr) {
                sd.assert(baseIndexNr < this.indexCount_);
                sd.assert(baseIndexNr + outputCount <= this.indexCount_);
                sd.assert(outputPtr.length >= outputCount);
                var typedBasePtr = this.typedBasePtr(baseIndexNr, outputCount);
                for (var ix = 0; ix < outputCount; ++ix) {
                    outputPtr[ix] = typedBasePtr[ix];
                }
            };
            IndexBuffer.prototype.index = function (indexNr) {
                var typedBasePtr = this.typedBasePtr(indexNr, 1);
                return typedBasePtr[0];
            };
            IndexBuffer.prototype.setIndexes = function (baseIndexNr, sourceCount, sourcePtr) {
                sd.assert(baseIndexNr < this.indexCount_);
                sd.assert(baseIndexNr + sourceCount <= this.indexCount_);
                sd.assert(sourcePtr.length >= sourceCount);
                var typedBasePtr = this.typedBasePtr(baseIndexNr, sourceCount);
                for (var ix = 0; ix < sourceCount; ++ix) {
                    typedBasePtr[ix] = sourcePtr[ix];
                }
            };
            IndexBuffer.prototype.setIndex = function (indexNr, newValue) {
                var typedBasePtr = this.typedBasePtr(indexNr, 1);
                typedBasePtr[0] = newValue;
            };
            return IndexBuffer;
        }());
        meshdata.IndexBuffer = IndexBuffer;
        var TriangleProxy = (function () {
            function TriangleProxy(data, triangleIndex) {
                this.data_ = data.subarray(triangleIndex * 3, (triangleIndex + 1) * 3);
            }
            TriangleProxy.prototype.index = function (index) { return this.data_[index]; };
            TriangleProxy.prototype.a = function () { return this.data_[0]; };
            TriangleProxy.prototype.b = function () { return this.data_[1]; };
            TriangleProxy.prototype.c = function () { return this.data_[2]; };
            TriangleProxy.prototype.setIndex = function (index, newValue) {
                this.data_[index] = newValue;
            };
            TriangleProxy.prototype.setA = function (newValue) { this.data_[0] = newValue; };
            TriangleProxy.prototype.setB = function (newValue) { this.data_[1] = newValue; };
            TriangleProxy.prototype.setC = function (newValue) { this.data_[2] = newValue; };
            return TriangleProxy;
        }());
        meshdata.TriangleProxy = TriangleProxy;
        var IndexBufferTriangleView = (function () {
            function IndexBufferTriangleView(indexBuffer_, fromTriangle_, toTriangle_) {
                if (fromTriangle_ === void 0) { fromTriangle_ = -1; }
                if (toTriangle_ === void 0) { toTriangle_ = -1; }
                this.indexBuffer_ = indexBuffer_;
                this.fromTriangle_ = fromTriangle_;
                this.toTriangle_ = toTriangle_;
                var primitiveCount = primitiveCountForElementCount(4, this.indexBuffer_.indexCount);
                if (this.fromTriangle_ < 0) {
                    this.fromTriangle_ = 0;
                }
                if (this.fromTriangle_ >= primitiveCount) {
                    this.fromTriangle_ = primitiveCount - 1;
                }
                if ((this.toTriangle_ < 0) || (this.toTriangle_ > primitiveCount)) {
                    this.toTriangle_ = primitiveCount;
                }
            }
            IndexBufferTriangleView.prototype.forEach = function (callback) {
                var primCount = this.toTriangle_ - this.fromTriangle_;
                var basePtr = this.indexBuffer_.typedBasePtr(this.fromTriangle_ * 3, primCount * 3);
                for (var tix = 0; tix < primCount; ++tix) {
                    callback(new TriangleProxy(basePtr, tix));
                }
            };
            IndexBufferTriangleView.prototype.refItem = function (triangleIndex) {
                return this.indexBuffer_.typedBasePtr((triangleIndex + this.fromTriangle_) * 3, 3);
            };
            IndexBufferTriangleView.prototype.subView = function (fromTriangle, triangleCount) {
                return new IndexBufferTriangleView(this.indexBuffer_, this.fromTriangle_ + fromTriangle, this.fromTriangle_ + fromTriangle + triangleCount);
            };
            Object.defineProperty(IndexBufferTriangleView.prototype, "count", {
                get: function () {
                    return this.toTriangle_ - this.fromTriangle_;
                },
                enumerable: true,
                configurable: true
            });
            return IndexBufferTriangleView;
        }());
        meshdata.IndexBufferTriangleView = IndexBufferTriangleView;
        function calcVertexNormals(vertexBuffer, indexBuffer) {
            var posAttr = vertexBuffer.attrByRole(1);
            var normAttr = vertexBuffer.attrByRole(2);
            if (posAttr && normAttr) {
                var posView = new VertexBufferAttributeView(vertexBuffer, posAttr);
                var normView = new VertexBufferAttributeView(vertexBuffer, normAttr);
                var triView = new IndexBufferTriangleView(indexBuffer);
                calcVertexNormalsViews(posView, normView, triView);
            }
        }
        meshdata.calcVertexNormals = calcVertexNormals;
        function calcVertexNormalsViews(posView, normView, triView) {
            var vertexCount = posView.count;
            var normalCount = normView.count;
            sd.assert(vertexCount <= normalCount);
            var baseVertex = normView.baseVertex;
            normView.forEach(function (norm) {
                sd.vec3.set(norm, 0, 0, 1);
            });
            var usages = new Float32Array(vertexCount);
            var lineA = sd.vec3.create(), lineB = sd.vec3.create();
            var faceNormal = sd.vec3.create(), temp = sd.vec3.create();
            triView.forEach(function (face) {
                var posA = posView.copyItem(face.a() - baseVertex);
                var posB = posView.copyItem(face.b() - baseVertex);
                var posC = posView.copyItem(face.c() - baseVertex);
                sd.vec3.subtract(lineA, posB, posA);
                sd.vec3.subtract(lineB, posC, posB);
                if (sd.vec3.length(lineA) < 0.00001 || sd.vec3.length(lineB) < 0.00001) {
                    return;
                }
                sd.vec3.cross(faceNormal, lineA, lineB);
                sd.vec3.normalize(faceNormal, faceNormal);
                for (var fi = 0; fi < 3; ++fi) {
                    var fvi = face.index(fi) - baseVertex;
                    var norm = normView.refItem(fvi);
                    sd.vec3.scaleAndAdd(temp, faceNormal, norm, usages[fvi]);
                    sd.vec3.scale(norm, temp, 1 / (usages[fvi] + 1));
                    usages[fvi] += 1;
                }
            });
            normView.forEach(function (norm) {
                sd.vec3.normalize(norm, norm);
            });
        }
        meshdata.calcVertexNormalsViews = calcVertexNormalsViews;
        function calcVertexTangents(vertexBuffer, indexBuffer, uvSet) {
            if (uvSet === void 0) { uvSet = 6; }
            var posAttr = vertexBuffer.attrByRole(1);
            var normAttr = vertexBuffer.attrByRole(2);
            var uvAttr = vertexBuffer.attrByRole(uvSet);
            var tanAttr = vertexBuffer.attrByRole(3);
            if (posAttr && normAttr && uvAttr && tanAttr) {
                var posView = new VertexBufferAttributeView(vertexBuffer, posAttr);
                var normView = new VertexBufferAttributeView(vertexBuffer, normAttr);
                var uvView = new VertexBufferAttributeView(vertexBuffer, uvAttr);
                var tanView = new VertexBufferAttributeView(vertexBuffer, tanAttr);
                var triView = new IndexBufferTriangleView(indexBuffer);
                calcVertexTangentsViews(posView, normView, uvView, tanView, triView);
            }
        }
        meshdata.calcVertexTangents = calcVertexTangents;
        function calcVertexTangentsViews(posView, normView, uvView, tanView, triView) {
            var vertexCount = posView.count;
            sd.assert(vertexCount <= normView.count);
            sd.assert(vertexCount <= uvView.count);
            sd.assert(vertexCount <= tanView.count);
            var tanBuf = new Float32Array(vertexCount * 3 * 2);
            var tan1 = tanBuf.subarray(0, vertexCount);
            var tan2 = tanBuf.subarray(vertexCount);
            triView.forEach(function (face) {
                var a = face.a(), b = face.b(), c = face.c();
                var v1 = posView.copyItem(a), v2 = posView.copyItem(b), v3 = posView.copyItem(c);
                var w1 = uvView.copyItem(a), w2 = uvView.copyItem(b), w3 = uvView.copyItem(c);
                var x1 = v2[0] - v1[0];
                var x2 = v3[0] - v1[0];
                var y1 = v2[1] - v1[1];
                var y2 = v3[1] - v1[1];
                var z1 = v2[2] - v1[2];
                var z2 = v3[2] - v1[2];
                var s1 = w2[0] - w1[0];
                var s2 = w3[0] - w1[0];
                var t1 = w2[1] - w1[1];
                var t2 = w3[1] - w1[1];
                var rd = (s1 * t2 - s2 * t1);
                var r = rd == 0 ? 0.0 : 1.0 / rd;
                var sdir = [
                    (t2 * x1 - t1 * x2) * r,
                    (t2 * y1 - t1 * y2) * r,
                    (t2 * z1 - t1 * z2) * r
                ];
                var tdir = [
                    (s1 * x2 - s2 * x1) * r,
                    (s1 * y2 - s2 * y1) * r,
                    (s1 * z2 - s2 * z1) * r
                ];
                var tan1a = sd.container.copyIndexedVec3(tan1, a);
                var tan1b = sd.container.copyIndexedVec3(tan1, b);
                var tan1c = sd.container.copyIndexedVec3(tan1, c);
                sd.container.setIndexedVec3(tan1, a, sd.vec3.add(tan1a, tan1a, sdir));
                sd.container.setIndexedVec3(tan1, b, sd.vec3.add(tan1b, tan1b, sdir));
                sd.container.setIndexedVec3(tan1, c, sd.vec3.add(tan1c, tan1c, sdir));
                var tan2a = sd.container.copyIndexedVec3(tan2, a);
                var tan2b = sd.container.copyIndexedVec3(tan2, b);
                var tan2c = sd.container.copyIndexedVec3(tan2, c);
                sd.container.setIndexedVec3(tan2, a, sd.vec3.add(tan2a, tan2a, tdir));
                sd.container.setIndexedVec3(tan2, b, sd.vec3.add(tan2b, tan2b, tdir));
                sd.container.setIndexedVec3(tan2, c, sd.vec3.add(tan2c, tan2c, tdir));
            });
            for (var ix = 0; ix < vertexCount; ++ix) {
                var n = normView.copyItem(ix);
                var t = sd.container.copyIndexedVec3(tan1, ix);
                var t2 = sd.container.copyIndexedVec3(tan2, ix);
                var tangent = sd.vec3.normalize([0, 0, 1], sd.vec3.sub([], t, sd.vec3.scale([], n, sd.vec3.dot(n, t))));
                if (sd.vec3.dot(sd.vec3.cross([], n, t), t2) < 0) {
                    sd.vec3.scale(tangent, tangent, -1);
                }
                if (isNaN(tangent[0]) || isNaN(tangent[1]) || isNaN(tangent[2])) {
                    sd.assert(false, "Failure during tangent calculation");
                }
                sd.vec3.copy(tanView.refItem(ix), tangent);
            }
        }
        meshdata.calcVertexTangentsViews = calcVertexTangentsViews;
        var MeshData = (function () {
            function MeshData() {
                this.vertexBuffers = [];
                this.indexBuffer = null;
                this.primitiveGroups = [];
            }
            MeshData.prototype.allocateSingleStorage = function (vertexBufferItemCounts, elementType, indexCount) {
                sd.assert(vertexBufferItemCounts.length === this.vertexBuffers.length, "Did not specify exactly 1 item count per VertexBuffer");
                var totalBytes = 0;
                for (var vbix = 0; vbix < this.vertexBuffers.length; ++vbix) {
                    totalBytes += this.vertexBuffers[vbix].layout.bytesRequiredForVertexCount(vertexBufferItemCounts[vbix]);
                    totalBytes = sd.math.alignUp(totalBytes, 8);
                }
                if (this.indexBuffer) {
                    totalBytes += bytesRequiredForIndexCount(elementType, indexCount);
                    totalBytes = sd.math.alignUp(totalBytes, 8);
                }
                sd.assert(totalBytes > 0, "Nothing to allocate!");
                var storage = new ArrayBuffer(totalBytes);
                var byteOffset = 0;
                for (var vbix = 0; vbix < this.vertexBuffers.length; ++vbix) {
                    this.vertexBuffers[vbix].suballocate(vertexBufferItemCounts[vbix], storage, byteOffset);
                    byteOffset += this.vertexBuffers[vbix].bufferSizeBytes;
                    byteOffset = sd.math.alignUp(byteOffset, 8);
                }
                if (this.indexBuffer) {
                    this.indexBuffer.suballocate(elementType, indexCount, storage, byteOffset);
                    byteOffset += this.indexBuffer.bufferSizeBytes;
                    byteOffset = sd.math.alignUp(byteOffset, 8);
                }
                sd.assert(totalBytes === byteOffset, "Mismatch of precalculated and actual buffer sizes");
            };
            MeshData.prototype.findFirstAttributeWithRole = function (role) {
                var pa = null;
                var avb = null;
                this.vertexBuffers.forEach(function (vb) {
                    if (!pa) {
                        pa = vb.attrByRole(role);
                        if (pa) {
                            avb = vb;
                        }
                    }
                });
                if (pa && avb) {
                    return { vertexBuffer: avb, attr: pa };
                }
                return null;
            };
            MeshData.prototype.genVertexNormals = function () {
                var _this = this;
                this.vertexBuffers.forEach(function (vertexBuffer) {
                    if (_this.indexBuffer) {
                        calcVertexNormals(vertexBuffer, _this.indexBuffer);
                    }
                });
            };
            return MeshData;
        }());
        meshdata.MeshData = MeshData;
    })(meshdata = sd.meshdata || (sd.meshdata = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function makeAttachmentDescriptor(texture, level, layer) {
            return {
                texture: texture || null,
                level: level | 0,
                layer: layer | 0
            };
        }
        render.makeAttachmentDescriptor = makeAttachmentDescriptor;
        function makeFrameBufferDescriptor() {
            var cad = [];
            for (var k = 0; k < 8; ++k) {
                cad.push(makeAttachmentDescriptor());
            }
            Object.seal(cad);
            return {
                colourAttachments: cad,
                depthAttachment: makeAttachmentDescriptor(),
                stencilAttachment: makeAttachmentDescriptor()
            };
        }
        render.makeFrameBufferDescriptor = makeFrameBufferDescriptor;
        function makeFrameBufferAllocationDescriptor(numColourAttachments) {
            var apf = [];
            for (var k = 0; k < 8; ++k) {
                apf.push((k < numColourAttachments) ? 3 : 0);
            }
            Object.seal(apf);
            return {
                width: 0,
                height: 0,
                colourPixelFormats: apf,
                depthPixelFormat: 0,
                stencilPixelFormat: 0
            };
        }
        render.makeFrameBufferAllocationDescriptor = makeFrameBufferAllocationDescriptor;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function pixelFormatForFBOPixelComponent(fbopc) {
            if (fbopc == 0) {
                return 2;
            }
            if (fbopc == 2) {
                return 7;
            }
            if (fbopc == 1) {
                return 6;
            }
            sd.assert(false, "Unknown FBO pixel component: " + fbopc);
            return 0;
        }
        render.pixelFormatForFBOPixelComponent = pixelFormatForFBOPixelComponent;
        function makeDefaultFrameBuffer(rc, width, height, desc) {
            var fbad = render.makeFrameBufferAllocationDescriptor(desc.colourCount);
            fbad.width = width;
            fbad.height = height;
            var pixFmt = pixelFormatForFBOPixelComponent(desc.pixelComponent || 0);
            sd.container.fill(fbad.colourPixelFormats, pixFmt, desc.colourCount);
            if (desc.useDepth) {
                if (rc.extDepthTexture) {
                    fbad.depthPixelFormat = 12;
                }
                else {
                    sd.assert(!desc.depthReadback, "depth textures not supported on this device");
                    fbad.depthPixelFormat = 11;
                }
            }
            if (desc.useStencil) {
                fbad.stencilPixelFormat = 13;
            }
            var fbd = render.allocateTexturesForFrameBuffer(rc, fbad);
            return new render.FrameBuffer(rc, fbd);
        }
        render.makeDefaultFrameBuffer = makeDefaultFrameBuffer;
        function makeSquareFrameBuffer(rc, dimension, desc) {
            return makeDefaultFrameBuffer(rc, dimension, dimension, desc);
        }
        render.makeSquareFrameBuffer = makeSquareFrameBuffer;
        function makeScreenFrameBuffer(rc, desc) {
            return makeDefaultFrameBuffer(rc, 0, 0, desc);
        }
        render.makeScreenFrameBuffer = makeScreenFrameBuffer;
        function canUseShadowMaps(rc) {
            return (rc.extTextureFloat && rc.extDerivatives);
        }
        render.canUseShadowMaps = canUseShadowMaps;
        function makeShadowMapFrameBuffer(rc, dimension) {
            return makeSquareFrameBuffer(rc, dimension, {
                colourCount: 1,
                useDepth: true,
                depthReadback: false
            });
        }
        render.makeShadowMapFrameBuffer = makeShadowMapFrameBuffer;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        var fboBugs = {
            mustHaveAColourAtt: undefined
        };
        function fboMustHaveAColourAttachment(rc) {
            if (fboBugs.mustHaveAColourAtt === undefined) {
                var gl = rc.gl;
                var fboBinding = gl.getParameter(gl.FRAMEBUFFER_BINDING);
                var fbo = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                var depthBuf = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuf);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 160, 120);
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuf);
                if (rc.extDrawBuffers) {
                    rc.extDrawBuffers.drawBuffersWEBGL([gl.NONE]);
                }
                var fbStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                fboBugs.mustHaveAColourAtt = (fbStatus != gl.FRAMEBUFFER_COMPLETE);
                gl.bindFramebuffer(gl.FRAMEBUFFER, fboBinding);
                gl.bindRenderbuffer(gl.RENDERBUFFER, null);
                gl.deleteFramebuffer(fbo);
                gl.deleteRenderbuffer(depthBuf);
            }
            return fboBugs.mustHaveAColourAtt;
        }
        function allocateTexturesForFrameBuffer(rc, desc) {
            var fbDesc = render.makeFrameBufferDescriptor();
            var width = desc.width || rc.gl.drawingBufferWidth;
            var height = desc.height || rc.gl.drawingBufferHeight;
            if ((desc.colourPixelFormats[0] == 0) && fboMustHaveAColourAttachment(rc)) {
                desc.colourPixelFormats[0] = 2;
            }
            for (var colourAttIndex = 0; colourAttIndex < desc.colourPixelFormats.length; ++colourAttIndex) {
                if (desc.colourPixelFormats[colourAttIndex] != 0) {
                    var texDesc = render.makeTextureDescriptor();
                    texDesc.textureClass = 1;
                    texDesc.dim.width = width;
                    texDesc.dim.height = height;
                    texDesc.sampling.repeatS = texDesc.sampling.repeatT = 2;
                    texDesc.sampling.mipFilter = 0;
                    texDesc.pixelFormat = desc.colourPixelFormats[colourAttIndex];
                    var attachment = fbDesc.colourAttachments[colourAttIndex];
                    attachment.texture = new render.Texture(rc, texDesc);
                }
            }
            var combinedFormat = 0;
            sd.assert(desc.depthPixelFormat == 0 ||
                render.pixelFormatIsDepthFormat(desc.depthPixelFormat) ||
                render.pixelFormatIsDepthStencilFormat(desc.depthPixelFormat));
            sd.assert(desc.stencilPixelFormat == 0 ||
                render.pixelFormatIsStencilFormat(desc.stencilPixelFormat) ||
                render.pixelFormatIsDepthStencilFormat(desc.stencilPixelFormat));
            if (render.pixelFormatIsDepthStencilFormat(desc.depthPixelFormat)) {
                sd.assert(desc.depthPixelFormat == desc.stencilPixelFormat);
                combinedFormat = desc.depthPixelFormat;
            }
            else {
                sd.assert(!render.pixelFormatIsDepthStencilFormat(desc.stencilPixelFormat));
                if (desc.stencilPixelFormat == 13) {
                    if (desc.depthPixelFormat == 12) {
                        combinedFormat = 14;
                    }
                }
            }
            var dsTex = render.makeTextureDescriptor();
            dsTex.textureClass = 1;
            dsTex.dim.width = width;
            dsTex.dim.height = height;
            dsTex.sampling.repeatS = dsTex.sampling.repeatT = 2;
            dsTex.sampling.mipFilter = 0;
            if (combinedFormat != 0) {
                dsTex.pixelFormat = combinedFormat;
                var depthStencil = new render.Texture(rc, dsTex);
                fbDesc.depthAttachment.texture = depthStencil;
                fbDesc.stencilAttachment.texture = depthStencil;
            }
            else {
                if (desc.depthPixelFormat != 0) {
                    dsTex.pixelFormat = desc.depthPixelFormat;
                    fbDesc.depthAttachment.texture = new render.Texture(rc, dsTex);
                }
                if (desc.stencilPixelFormat != 0) {
                    dsTex.pixelFormat = desc.stencilPixelFormat;
                    fbDesc.stencilAttachment.texture = new render.Texture(rc, dsTex);
                }
            }
            return fbDesc;
        }
        render.allocateTexturesForFrameBuffer = allocateTexturesForFrameBuffer;
        var FrameBuffer = (function () {
            function FrameBuffer(rc, desc) {
                var _this = this;
                this.rc = rc;
                this.width_ = 0;
                this.height_ = 0;
                var gl = rc.gl;
                var fbo = this.fbo_ = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                this.attachmentDesc_ = {
                    colourAttachments: desc.colourAttachments.map(function (att) { return sd.cloneStruct(att); }),
                    depthAttachment: sd.cloneStruct(desc.depthAttachment),
                    stencilAttachment: sd.cloneStruct(desc.stencilAttachment)
                };
                var anyTexture = null;
                var drawBuffers = desc.colourAttachments.map(function (attachment, attIndex) {
                    if (attachment.texture) {
                        anyTexture = attachment.texture;
                        var glAttachment = rc.extDrawBuffers ? (rc.extDrawBuffers.COLOR_ATTACHMENT0_WEBGL + attIndex) : rc.gl.COLOR_ATTACHMENT0;
                        _this.attachTexture(glAttachment, attachment);
                        return glAttachment;
                    }
                    else {
                        return gl.NONE;
                    }
                });
                if (rc.extDrawBuffers) {
                    rc.extDrawBuffers.drawBuffersWEBGL(drawBuffers);
                }
                var depthTex = desc.depthAttachment.texture;
                var stencilTex = desc.stencilAttachment.texture;
                if (depthTex) {
                    anyTexture = depthTex;
                    sd.assert(desc.depthAttachment.level == 0);
                    sd.assert(desc.depthAttachment.layer == 0);
                }
                if (stencilTex) {
                    anyTexture = stencilTex;
                    sd.assert(desc.stencilAttachment.level == 0);
                    sd.assert(desc.stencilAttachment.layer == 0);
                }
                if (depthTex && stencilTex && (depthTex == stencilTex)) {
                    sd.assert(render.pixelFormatIsDepthStencilFormat(depthTex.pixelFormat));
                    this.attachTexture(gl.DEPTH_STENCIL_ATTACHMENT, desc.depthAttachment);
                }
                else {
                    if (depthTex) {
                        sd.assert(render.pixelFormatIsDepthFormat(depthTex.pixelFormat));
                        this.attachTexture(gl.DEPTH_ATTACHMENT, desc.depthAttachment);
                    }
                    if (stencilTex) {
                        sd.assert(render.pixelFormatIsStencilFormat(stencilTex.pixelFormat));
                        this.attachTexture(gl.STENCIL_ATTACHMENT, desc.stencilAttachment);
                    }
                }
                var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                if (status != gl.FRAMEBUFFER_COMPLETE) {
                    sd.assert(false, "FrameBuffer not complete");
                }
                if (anyTexture) {
                    this.width_ = anyTexture.width;
                    this.height_ = anyTexture.height;
                }
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            }
            FrameBuffer.prototype.attachTexture = function (glAttachment, attachment) {
                var gl = this.rc.gl;
                var texture = attachment.texture;
                sd.assert(texture, "Tried to attach a null texture");
                var tex = texture.resource;
                sd.assert(attachment.level == 0, "WebGL 1 does not allow mapping of texture level > 0");
                sd.assert(attachment.level < texture.mipmaps);
                var glTarget = gl.TEXTURE_2D;
                if (texture.textureClass == 2) {
                    sd.assert(attachment.layer >= 0 && attachment.layer <= 5, "layer is not a valid CubeMapFace index");
                    glTarget = gl.TEXTURE_CUBE_MAP_POSITIVE_X + attachment.layer;
                }
                gl.framebufferTexture2D(gl.FRAMEBUFFER, glAttachment, glTarget, tex, attachment.level);
            };
            FrameBuffer.prototype.bind = function () {
                this.rc.gl.bindFramebuffer(this.rc.gl.FRAMEBUFFER, this.fbo_);
            };
            FrameBuffer.prototype.unbind = function () {
                this.rc.gl.bindFramebuffer(this.rc.gl.FRAMEBUFFER, null);
            };
            Object.defineProperty(FrameBuffer.prototype, "width", {
                get: function () { return this.width_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FrameBuffer.prototype, "height", {
                get: function () { return this.height_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(FrameBuffer.prototype, "resource", {
                get: function () { return this.fbo_; },
                enumerable: true,
                configurable: true
            });
            FrameBuffer.prototype.hasColourAttachment = function (atIndex) {
                sd.assert(atIndex < render.maxColourAttachments(this.rc));
                return this.attachmentDesc_.colourAttachments[atIndex].texture != null;
            };
            FrameBuffer.prototype.hasDepthAttachment = function () {
                return this.attachmentDesc_.depthAttachment.texture != null;
            };
            FrameBuffer.prototype.hasStencilAttachment = function () {
                return this.attachmentDesc_.stencilAttachment.texture != null;
            };
            FrameBuffer.prototype.colourAttachmentTexture = function (atIndex) {
                sd.assert(atIndex < render.maxColourAttachments(this.rc));
                return this.attachmentDesc_.colourAttachments[atIndex].texture;
            };
            FrameBuffer.prototype.depthAttachmentTexture = function () {
                return this.attachmentDesc_.depthAttachment.texture;
            };
            FrameBuffer.prototype.stencilAttachmentTexture = function () {
                return this.attachmentDesc_.stencilAttachment.texture;
            };
            return FrameBuffer;
        }());
        render.FrameBuffer = FrameBuffer;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        var FXAAPass = (function () {
            function FXAAPass(rc, meshMgr) {
                var quad = sd.meshdata.gen.generate(new sd.meshdata.gen.Quad(2, 2), [sd.meshdata.attrPosition2(), sd.meshdata.attrUV2()]);
                this.quad_ = meshMgr.create({ name: "fxaaQuad", meshData: quad });
                var pld = render.makePipelineDescriptor();
                pld.vertexShader = render.makeShader(rc, rc.gl.VERTEX_SHADER, "\n\t\t\t\tattribute vec2 vertexPos_device;\n\t\t\t\tvoid main(){\n\t\t\t\t\tgl_Position = vec4(vertexPos_device, 1.0, 1.0);\n\t\t\t\t}\n\t\t\t");
                pld.fragmentShader = render.makeShader(rc, rc.gl.FRAGMENT_SHADER, "\n\t\t\t\tprecision mediump float;\n\n\t\t\t\tuniform vec2 viewportSize;\n\t\t\t\tuniform sampler2D sourceSampler;\n\n\t\t\t\t/**\n\t\t\t\tBasic FXAA implementation based on the code on geeks3d.com with the\n\t\t\t\tmodification that the texture2DLod stuff was removed since it's\n\t\t\t\tunsupported by WebGL.\n\n\t\t\t\t--\n\n\t\t\t\tFrom:\n\t\t\t\thttps://github.com/mitsuhiko/webgl-meincraft\n\n\t\t\t\tCopyright (c) 2011 by Armin Ronacher.\n\n\t\t\t\tSome rights reserved.\n\n\t\t\t\tRedistribution and use in source and binary forms, with or without\n\t\t\t\tmodification, are permitted provided that the following conditions are\n\t\t\t\tmet:\n\n\t\t\t\t\t* Redistributions of source code must retain the above copyright\n\t\t\t\t\t  notice, this list of conditions and the following disclaimer.\n\n\t\t\t\t\t* Redistributions in binary form must reproduce the above\n\t\t\t\t\t  copyright notice, this list of conditions and the following\n\t\t\t\t\t  disclaimer in the documentation and/or other materials provided\n\t\t\t\t\t  with the distribution.\n\n\t\t\t\t\t* The names of the contributors may not be used to endorse or\n\t\t\t\t\t  promote products derived from this software without specific\n\t\t\t\t\t  prior written permission.\n\n\t\t\t\tTHIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n\t\t\t\t\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT\n\t\t\t\tLIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\n\t\t\t\tA PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\n\t\t\t\tOWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,\n\t\t\t\tSPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT\n\t\t\t\tLIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\n\t\t\t\tDATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\n\t\t\t\tTHEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT\n\t\t\t\t(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\n\t\t\t\tOF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\t\t\t\t*/\n\n\t\t\t\t#define FXAA_REDUCE_MIN   (1.0/ 128.0)\n\t\t\t\t#define FXAA_REDUCE_MUL   (1.0 / 8.0)\n\t\t\t\t#define FXAA_SPAN_MAX     8.0\n\n\t\t\t\t//optimized version for mobile, where dependent \n\t\t\t\t//texture reads can be a bottleneck\n\t\t\t\tvec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,\n\t\t\t\t\t\t\tvec2 v_rgbNW, vec2 v_rgbNE, \n\t\t\t\t\t\t\tvec2 v_rgbSW, vec2 v_rgbSE, \n\t\t\t\t\t\t\tvec2 v_rgbM) {\n\t\t\t\t\tvec4 color;\n\t\t\t\t\tmediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);\n\t\t\t\t\tvec3 rgbNW = texture2D(tex, v_rgbNW).xyz;\n\t\t\t\t\tvec3 rgbNE = texture2D(tex, v_rgbNE).xyz;\n\t\t\t\t\tvec3 rgbSW = texture2D(tex, v_rgbSW).xyz;\n\t\t\t\t\tvec3 rgbSE = texture2D(tex, v_rgbSE).xyz;\n\t\t\t\t\tvec4 texColor = texture2D(tex, v_rgbM);\n\t\t\t\t\tvec3 rgbM  = texColor.xyz;\n\t\t\t\t\tvec3 luma = vec3(0.299, 0.587, 0.114);\n\t\t\t\t\tfloat lumaNW = dot(rgbNW, luma);\n\t\t\t\t\tfloat lumaNE = dot(rgbNE, luma);\n\t\t\t\t\tfloat lumaSW = dot(rgbSW, luma);\n\t\t\t\t\tfloat lumaSE = dot(rgbSE, luma);\n\t\t\t\t\tfloat lumaM  = dot(rgbM,  luma);\n\t\t\t\t\tfloat lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));\n\t\t\t\t\tfloat lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));\n\t\t\t\t\t\n\t\t\t\t\tmediump vec2 dir;\n\t\t\t\t\tdir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));\n\t\t\t\t\tdir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));\n\t\t\t\t\t\n\t\t\t\t\tfloat dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *\n\t\t\t\t\t\t\t\t\t\t  (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);\n\t\t\t\t\t\n\t\t\t\t\tfloat rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);\n\t\t\t\t\tdir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),\n\t\t\t\t\t\t\t  max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),\n\t\t\t\t\t\t\t  dir * rcpDirMin)) * inverseVP;\n\t\t\t\t\t\n\t\t\t\t\tvec3 rgbA = 0.5 * (\n\t\t\t\t\t\ttexture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +\n\t\t\t\t\t\ttexture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);\n\t\t\t\t\tvec3 rgbB = rgbA * 0.5 + 0.25 * (\n\t\t\t\t\t\ttexture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +\n\t\t\t\t\t\ttexture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);\n\n\t\t\t\t\tfloat lumaB = dot(rgbB, luma);\n\t\t\t\t\tif ((lumaB < lumaMin) || (lumaB > lumaMax))\n\t\t\t\t\t\tcolor = vec4(rgbA, texColor.a);\n\t\t\t\t\telse\n\t\t\t\t\t\tcolor = vec4(rgbB, texColor.a);\n\t\t\t\t\treturn color;\n\t\t\t\t}\n\n\t\t\t\tvoid texcoords(vec2 fragCoord, vec2 resolution,\n\t\t\t\t\t\t\tout vec2 v_rgbNW, out vec2 v_rgbNE,\n\t\t\t\t\t\t\tout vec2 v_rgbSW, out vec2 v_rgbSE,\n\t\t\t\t\t\t\tout vec2 v_rgbM) {\n\t\t\t\t\tvec2 inverseVP = 1.0 / resolution.xy;\n\t\t\t\t\tv_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;\n\t\t\t\t\tv_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;\n\t\t\t\t\tv_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;\n\t\t\t\t\tv_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;\n\t\t\t\t\tv_rgbM = vec2(fragCoord * inverseVP);\n\t\t\t\t}\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tmediump vec2 v_rgbNW;\n\t\t\t\t\tmediump vec2 v_rgbNE;\n\t\t\t\t\tmediump vec2 v_rgbSW;\n\t\t\t\t\tmediump vec2 v_rgbSE;\n\t\t\t\t\tmediump vec2 v_rgbM;\n\n\t\t\t\t\tvec2 fragCoord = gl_FragCoord.xy;\n\t\t\t\t\tvec2 uv = vec2(fragCoord / viewportSize);\n\n\t\t\t\t\ttexcoords(fragCoord, viewportSize, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n\t\t\t\t\tgl_FragColor = fxaa(sourceSampler, fragCoord, viewportSize, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);\n\t\t\t\t}\n\t\t\t");
                pld.attributeNames.set(1, "vertexPos_device");
                this.pipeline_ = new render.Pipeline(rc, pld);
                this.texUniform_ = rc.gl.getUniformLocation(this.pipeline_.program, "sourceSampler");
                this.viewportUniform_ = rc.gl.getUniformLocation(this.pipeline_.program, "viewportSize");
                this.pipeline_.bind();
                rc.gl.uniform1i(this.texUniform_, 0);
                this.pipeline_.unbind();
            }
            FXAAPass.prototype.apply = function (rc, meshMgr, source) {
                var _this = this;
                var rpd = render.makeRenderPassDescriptor();
                rpd.clearMask = 0;
                render.runRenderPass(rc, meshMgr, rpd, null, function (rp) {
                    rp.setPipeline(_this.pipeline_);
                    rp.setTexture(source, 0);
                    rp.setMesh(_this.quad_);
                    rc.gl.uniform2f(_this.viewportUniform_, rc.gl.drawingBufferWidth, rc.gl.drawingBufferHeight);
                    var primGroup0 = meshMgr.primitiveGroups(_this.quad_)[0];
                    rp.drawIndexedPrimitives(primGroup0.type, meshMgr.indexBufferElementType(_this.quad_), 0, primGroup0.elementCount);
                });
            };
            return FXAAPass;
        }());
        render.FXAAPass = FXAAPass;
        var FilterPass = (function () {
            function FilterPass(rc, meshMgr, width, height, pixelComponent, filter) {
                var quad = sd.meshdata.gen.generate(new sd.meshdata.gen.Quad(2, 2), [sd.meshdata.attrPosition2(), sd.meshdata.attrUV2()]);
                this.quad_ = meshMgr.create({ name: "filterpassQuad", meshData: quad });
                var pld = render.makePipelineDescriptor();
                pld.vertexShader = render.makeShader(rc, rc.gl.VERTEX_SHADER, "\n\t\t\t\tattribute vec2 vertexPos_device;\n\t\t\t\tvarying vec2 vertexUV_intp;\n\t\t\t\tvoid main(){\n\t\t\t\t\tvertexUV_intp = vertexPos_device * 0.5 + 0.5;\n\t\t\t\t\tgl_Position = vec4(vertexPos_device, 0.0, 1.0);\n\t\t\t\t}\n\t\t\t");
                pld.fragmentShader = render.makeShader(rc, rc.gl.FRAGMENT_SHADER, "\n\t\t\t\tprecision highp float;\n\t\t \t\tvarying vec2 vertexUV_intp;\n\t\t\t\tuniform vec2 viewport;\n\t\t\t\tuniform sampler2D texSampler;\n\t\t\t\tvec3 get(float x, float y) {\n\t\t\t\t\tvec2 off = vec2(x, y);\n\t\t\t\t\treturn texture2D(texSampler, vertexUV_intp + off / viewport).rgb;\n\t\t\t\t}\n\t\t\t\tvec3 get(int x, int y) {\n\t\t\t\t\tvec2 off = vec2(x, y);\n\t\t\t\t\treturn texture2D(texSampler, vertexUV_intp + off / viewport).rgb;\n\t\t\t\t}\n\t\t\t\tvec3 filter() {\n\t\t\t\t\t" + filter + "\n\t\t\t\t}\n\t\t\t\tvoid main() {\n\t\t\t\t\tgl_FragColor = vec4(filter(), 1.0);\n\t\t\t\t}\n\t\t\t");
                pld.attributeNames.set(1, "vertexPos_device");
                this.pipeline_ = new render.Pipeline(rc, pld);
                this.texUniform_ = rc.gl.getUniformLocation(this.pipeline_.program, "texSampler");
                this.viewportUniform_ = rc.gl.getUniformLocation(this.pipeline_.program, "viewport");
                this.pipeline_.bind();
                rc.gl.uniform1i(this.texUniform_, 0);
                rc.gl.uniform2f(this.viewportUniform_, width, height);
                this.pipeline_.unbind();
                this.fbo_ = render.makeDefaultFrameBuffer(rc, width, height, {
                    colourCount: 1,
                    pixelComponent: pixelComponent
                });
            }
            FilterPass.prototype.apply = function (rc, meshMgr, source) {
                var _this = this;
                var rpd = render.makeRenderPassDescriptor();
                rpd.clearMask = 0;
                render.runRenderPass(rc, meshMgr, rpd, this.fbo_, function (rp) {
                    rp.setPipeline(_this.pipeline_);
                    rp.setTexture(source, 0);
                    rp.setMesh(_this.quad_);
                    var primGroup0 = meshMgr.primitiveGroups(_this.quad_)[0];
                    rp.drawIndexedPrimitives(primGroup0.type, meshMgr.indexBufferElementType(_this.quad_), 0, primGroup0.elementCount);
                });
            };
            Object.defineProperty(FilterPass.prototype, "output", {
                get: function () {
                    return this.fbo_.colourAttachmentTexture(0);
                },
                enumerable: true,
                configurable: true
            });
            return FilterPass;
        }());
        render.FilterPass = FilterPass;
        function resamplePass(rc, meshMgr, dim) {
            return new FilterPass(rc, meshMgr, dim, dim, 2, "return get(0.0, 0.0);");
        }
        render.resamplePass = resamplePass;
        function boxFilterPass(rc, meshMgr, dim) {
            return new FilterPass(rc, meshMgr, dim, dim, 2, "\n\t\t\tvec3 result = vec3(0.0);\n\t\t\tfor (int x = -1; x <= 1; x++) {\n\t\t\t\tfor (int y = -1; y <= 1; y++) {\n\t\t\t\t\tresult += get(x, y);\n\t\t\t\t}\n\t\t\t}\n\t\t\treturn result / 9.0;\n\t\t");
        }
        render.boxFilterPass = boxFilterPass;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        var vertexSource = [
            "attribute vec2 vertexPos_model;",
            "varying vec2 vertexUV_intp;",
            "void main() {",
            "	gl_Position = vec4(vertexPos_model, 0.5, 1.0);",
            "	vertexUV_intp = vertexPos_model * 0.5 + 0.5;",
            "}"
        ].join("\n");
        function fragmentSource(rc, numSamples) {
            return [
                rc.extFragmentLOD ? "#extension GL_EXT_shader_texture_lod : require" : "",
                "precision highp float;",
                "varying vec2 vertexUV_intp;",
                "uniform vec4 params;",
                "uniform samplerCube envMapSampler;",
                "const int numSamples = " + numSamples + ";",
                "const float PI = 3.141592654;",
                "float rnd(vec2 uv) {",
                "	return fract(sin(dot(uv, vec2(12.9898, 78.233) * 2.0)) * 43758.5453);",
                "}",
                "vec3 importanceSampleGGX(vec2 Xi, float roughness, vec3 N) {",
                "	float a = roughness * roughness;",
                "	float phi = 2.0 * PI * Xi.x;",
                "	float cosTheta = sqrt((1.0 - Xi.y) / (1.0 + (a*a - 1.0) * Xi.y));",
                "	float sinTheta = sqrt(1.0 - cosTheta * cosTheta);",
                "	vec3 H = vec3(",
                "		sinTheta * cos(phi),",
                "		sinTheta * sin(phi),",
                "		cosTheta",
                "	);",
                "	vec3 upVector = abs(N.z) < 0.999 ? vec3(0.0,0.0,1.0) : vec3(1.0,0.0,0.0);",
                "	vec3 tangentX = normalize(cross(upVector, N));",
                "	vec3 tangentY = cross(N, tangentX);",
                "	// Tangent to world space",
                "	return tangentX * H.x + tangentY * H.y + N * H.z;",
                "}",
                "vec3 prefilterEnvMap(float roughness, vec3 R) {",
                "	vec3 N = R;",
                "	vec3 V = R;",
                "	vec3 prefilteredColor = vec3(0.0);",
                "	float totalWeight = 0.0;",
                "	for (int i = 0; i < numSamples; i++) {",
                "		//vec2 Xi = hammersley(i, numSamples);",
                "		float sini = sin(float(i));",
                "		float cosi = cos(float(i));",
                "		float rand = rnd(vec2(sini, cosi));",
                "		vec2 Xi = vec2(float(i) / float(numSamples), rand);",
                "		vec3 H = importanceSampleGGX(Xi, roughness, N);",
                "		vec3 L = 2.0 * dot(V, H) * H - V;",
                "		float NoL = clamp(dot(N, L), 0.0, 1.0);",
                "		if (NoL > 0.0) {",
                rc.extFragmentLOD
                    ? "			prefilteredColor += textureCubeLodEXT(envMapSampler, L, 0.0).rgb * NoL;"
                    : "			prefilteredColor += textureCube(envMapSampler, L).rgb * NoL;",
                "			totalWeight += NoL;",
                "		}",
                "	}",
                "	return prefilteredColor / totalWeight;",
                "}",
                "void main() {",
                "	float face = params.x;",
                "	float roughness = params.y;",
                "	float dim = params.z;",
                "	vec2 st = vertexUV_intp * 2.0 - 1.0;",
                "	vec3 R;",
                "	if (face == 0.0) {",
                "		R = vec3(1, -st.y, -st.x);",
                "	} else if (face == 1.0) {",
                "		R = vec3(-1, -st.y, st.x);",
                "	} else if (face == 2.0) {",
                "		R = vec3(st.x, 1, st.y);",
                "	} else if (face == 3.0) {",
                "		R = vec3(st.x, -1, -st.y);",
                "	} else if (face == 4.0) {",
                "		R = vec3(st.x, -st.y, 1);",
                "	} else {",
                "		R = vec3(-st.x, -st.y, -1);",
                "	}",
                "	gl_FragColor = vec4(prefilterEnvMap(roughness, R), 1.0);",
                "}",
            ].join("\n");
        }
        var preFilterPipelines = new Map();
        function getPipeline(rc, numSamples) {
            var pfp = preFilterPipelines.get(numSamples);
            if (!pfp) {
                pfp = {};
                var pld = render.makePipelineDescriptor();
                pld.vertexShader = render.makeShader(rc, rc.gl.VERTEX_SHADER, vertexSource);
                pld.fragmentShader = render.makeShader(rc, rc.gl.FRAGMENT_SHADER, fragmentSource(rc, numSamples));
                pld.attributeNames.set(1, "vertexPos_model");
                pfp.pipeline = new render.Pipeline(rc, pld);
                pfp.paramsUniform = rc.gl.getUniformLocation(pfp.pipeline.program, "params");
                pfp.envMapSamplerUniform = rc.gl.getUniformLocation(pfp.pipeline.program, "envMapSampler");
                sd.assert(pfp.paramsUniform && pfp.envMapSamplerUniform, "invalid prefilter pipeline");
                pfp.pipeline.bind();
                rc.gl.uniform1i(pfp.envMapSamplerUniform, 0);
                pfp.pipeline.unbind();
                preFilterPipelines.set(numSamples, pfp);
            }
            return pfp;
        }
        function prefilteredEnvMap(rc, meshMgr, sourceEnvMap, numSamples) {
            var pipeline = getPipeline(rc, numSamples);
            var rpd = render.makeRenderPassDescriptor();
            rpd.clearMask = 0;
            var baseWidth = 128;
            var resultMapDesc = render.makeTexDescCube(3, baseWidth, 1);
            var resultEnvMap = new render.Texture(rc, resultMapDesc);
            var mipCount = resultEnvMap.mipmaps;
            var resultGLPixelFormat = render.glImageFormatForPixelFormat(rc, resultEnvMap.pixelFormat);
            var levelWidths = [];
            for (var lmip = 0; lmip < mipCount; ++lmip) {
                levelWidths[lmip] = baseWidth >> lmip;
            }
            var roughnessTable = [];
            for (var ml = 0; ml < mipCount; ++ml) {
                var roughAtLevel = (1.0 / (mipCount - 1)) * ml;
                roughnessTable.push(roughAtLevel);
            }
            var quad = sd.meshdata.gen.generate(new sd.meshdata.gen.Quad(2, 2), [sd.meshdata.attrPosition2(), sd.meshdata.attrUV2()]);
            var quadMesh = meshMgr.create({ name: "squareQuad", meshData: quad });
            var levelPixels = [];
            var levelTextures = [];
            for (var mip = 0; mip < mipCount; ++mip) {
                var levelWidth = levelWidths[mip];
                var levelMapDesc = render.makeTexDesc2D(3, levelWidth, levelWidth, 0);
                levelTextures[mip] = new render.Texture(rc, levelMapDesc);
                levelPixels[mip] = new Uint8Array(levelWidth * levelWidth * 4);
            }
            var _loop_3 = function (mip) {
                var levelWidth = levelWidths[mip];
                var _loop_4 = function (face) {
                    var fbd = render.makeFrameBufferDescriptor();
                    fbd.colourAttachments[0].texture = levelTextures[mip];
                    var fb = new render.FrameBuffer(rc, fbd);
                    render.runRenderPass(rc, meshMgr, rpd, fb, function (rp) {
                        rp.setPipeline(pipeline.pipeline);
                        rp.setTexture(sourceEnvMap, 0);
                        rp.setMesh(quadMesh);
                        rp.setDepthTest(4);
                        rc.gl.uniform4fv(pipeline.paramsUniform, new Float32Array([face, roughnessTable[mip], levelWidth, 0]));
                        var primGroup0 = quad.primitiveGroups[0];
                        rp.drawIndexedPrimitives(primGroup0.type, quad.indexBuffer.indexElementType, 0, primGroup0.elementCount);
                        rc.gl.readPixels(0, 0, levelWidth, levelWidth, rc.gl.RGBA, rc.gl.UNSIGNED_BYTE, levelPixels[mip]);
                        var err = rc.gl.getError();
                        if (err) {
                            sd.assert(false, "Cannot read pixels, gl error: " + err);
                        }
                        else {
                            resultEnvMap.bind();
                            rc.gl.texImage2D(rc.gl.TEXTURE_CUBE_MAP_POSITIVE_X + face, mip, resultGLPixelFormat, levelWidth, levelWidth, 0, rc.gl.RGBA, rc.gl.UNSIGNED_BYTE, levelPixels[mip]);
                            err = rc.gl.getError();
                            if (err) {
                                sd.assert(false, "Cannot write pixels, gl error: " + err);
                            }
                            resultEnvMap.unbind();
                        }
                    });
                };
                for (var face = 0; face < 6; ++face) {
                    _loop_4(face);
                }
            };
            for (var mip = 0; mip < mipCount; ++mip) {
                _loop_3(mip);
            }
            return resultEnvMap;
        }
        render.prefilteredEnvMap = prefilteredEnvMap;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function makeColourBlendingDescriptor() {
            return {
                rgbBlendOp: 0,
                alphaBlendOp: 0,
                sourceRGBFactor: 1,
                sourceAlphaFactor: 1,
                destRGBFactor: 0,
                destAlphaFactor: 0,
                constantColour: [0, 0, 0, 1]
            };
        }
        render.makeColourBlendingDescriptor = makeColourBlendingDescriptor;
        function makeColourWriteMask() {
            return {
                red: true,
                green: true,
                blue: true,
                alpha: true
            };
        }
        render.makeColourWriteMask = makeColourWriteMask;
        function makePipelineDescriptor() {
            return {
                colourMask: undefined,
                depthMask: true,
                blending: undefined,
                attributeNames: new Map()
            };
        }
        render.makePipelineDescriptor = makePipelineDescriptor;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function glBlendEqForBlendOperation(rc, op) {
            switch (op) {
                case 0: return rc.gl.FUNC_ADD;
                case 1: return rc.gl.FUNC_SUBTRACT;
                case 2: return rc.gl.FUNC_REVERSE_SUBTRACT;
                case 3: return rc.extMinMax ? rc.extMinMax.MIN_EXT : rc.gl.FUNC_SUBTRACT;
                case 4: return rc.extMinMax ? rc.extMinMax.MAX_EXT : rc.gl.FUNC_ADD;
                default:
                    sd.assert(false, "Invalid BlendOperation");
                    return rc.gl.NONE;
            }
        }
        function glBlendFuncForBlendFactor(rc, factor) {
            switch (factor) {
                case 0: return rc.gl.ZERO;
                case 1: return rc.gl.ONE;
                case 2: return rc.gl.SRC_COLOR;
                case 3: return rc.gl.ONE_MINUS_SRC_COLOR;
                case 4: return rc.gl.DST_COLOR;
                case 5: return rc.gl.ONE_MINUS_DST_COLOR;
                case 6: return rc.gl.SRC_ALPHA;
                case 7: return rc.gl.ONE_MINUS_SRC_ALPHA;
                case 8: return rc.gl.SRC_ALPHA_SATURATE;
                case 9: return rc.gl.DST_ALPHA;
                case 10: return rc.gl.ONE_MINUS_DST_ALPHA;
                case 11: return rc.gl.CONSTANT_COLOR;
                case 12: return rc.gl.ONE_MINUS_CONSTANT_COLOR;
                case 13: return rc.gl.CONSTANT_ALPHA;
                case 14: return rc.gl.ONE_MINUS_CONSTANT_ALPHA;
                default:
                    sd.assert(false, "Invalid BlendFactor");
                    return rc.gl.NONE;
            }
        }
        var Pipeline = (function () {
            function Pipeline(rc, desc) {
                var _this = this;
                this.rc = rc;
                this.writeMask_ = desc.colourMask ? sd.cloneStruct(desc.colourMask) : undefined;
                this.depthMask_ = desc.depthMask;
                this.blending_ = desc.blending ? sd.cloneStruct(desc.blending) : undefined;
                this.program_ = render.makeProgram(rc, desc.vertexShader, desc.fragmentShader);
                this.attrRoleIndexMap_ = new Map();
                desc.attributeNames.forEach(function (name, role) {
                    var attrIx = rc.gl.getAttribLocation(_this.program_, name);
                    sd.assert(attrIx >= 0, "cannot find vertex attribute " + name);
                    _this.attrRoleIndexMap_.set(role, attrIx);
                });
            }
            Pipeline.prototype.bind = function () {
                var gl = this.rc.gl;
                gl.useProgram(this.program_);
                if (this.writeMask_) {
                    gl.colorMask(this.writeMask_.red, this.writeMask_.green, this.writeMask_.blue, this.writeMask_.alpha);
                }
                if (!this.depthMask_) {
                    gl.depthMask(this.depthMask_);
                }
                if (this.blending_) {
                    gl.enable(gl.BLEND);
                    var rgbEq = glBlendEqForBlendOperation(this.rc, this.blending_.rgbBlendOp);
                    var alphaEq = glBlendEqForBlendOperation(this.rc, this.blending_.alphaBlendOp);
                    gl.blendEquationSeparate(rgbEq, alphaEq);
                    var rgbSrcFn = glBlendFuncForBlendFactor(this.rc, this.blending_.sourceRGBFactor);
                    var alphaSrcFn = glBlendFuncForBlendFactor(this.rc, this.blending_.sourceAlphaFactor);
                    var rgbDestFn = glBlendFuncForBlendFactor(this.rc, this.blending_.destRGBFactor);
                    var alphaDestFn = glBlendFuncForBlendFactor(this.rc, this.blending_.destAlphaFactor);
                    gl.blendFuncSeparate(rgbSrcFn, rgbDestFn, alphaSrcFn, alphaDestFn);
                    gl.blendColor(this.blending_.constantColour[0], this.blending_.constantColour[1], this.blending_.constantColour[2], this.blending_.constantColour[3]);
                }
            };
            Pipeline.prototype.unbind = function () {
                var gl = this.rc.gl;
                gl.useProgram(null);
                if (this.writeMask_) {
                    gl.colorMask(true, true, true, true);
                }
                if (!this.depthMask_) {
                    gl.depthMask(true);
                }
                if (this.blending_) {
                    gl.disable(gl.BLEND);
                    gl.blendEquation(gl.FUNC_ADD);
                    gl.blendFunc(gl.ONE, gl.ZERO);
                }
            };
            Object.defineProperty(Pipeline.prototype, "program", {
                get: function () { return this.program_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Pipeline.prototype, "attributeCount", {
                get: function () { return this.attrRoleIndexMap_.size; },
                enumerable: true,
                configurable: true
            });
            Pipeline.prototype.attributePairs = function () { return this.attrRoleIndexMap_.entries(); };
            Pipeline.prototype.attributeIndexForRole = function (role) {
                if (this.attrRoleIndexMap_.has(role)) {
                    return this.attrRoleIndexMap_.get(role);
                }
                return -1;
            };
            return Pipeline;
        }());
        render.Pipeline = Pipeline;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function pixelFormatIsCompressed(format) {
            return format >= 0x100;
        }
        render.pixelFormatIsCompressed = pixelFormatIsCompressed;
        function pixelFormatIsDepthFormat(format) {
            return format == 11 ||
                format == 12;
        }
        render.pixelFormatIsDepthFormat = pixelFormatIsDepthFormat;
        function pixelFormatIsStencilFormat(format) {
            return format == 13;
        }
        render.pixelFormatIsStencilFormat = pixelFormatIsStencilFormat;
        function pixelFormatIsDepthStencilFormat(format) {
            return format == 14;
        }
        render.pixelFormatIsDepthStencilFormat = pixelFormatIsDepthStencilFormat;
        function pixelFormatBytesPerElement(format) {
            switch (format) {
                case 1:
                case 13:
                    return 1;
                case 8:
                case 9:
                case 10:
                case 11:
                    return 2;
                case 2:
                case 4:
                    return 3;
                case 3:
                case 5:
                case 12:
                case 14:
                    return 4;
                case 6:
                    return 8;
                case 7:
                    return 16;
                case 256:
                case 257:
                    return 8;
                case 258:
                case 259:
                    return 16;
                default:
                    sd.assert(false, "unhandled pixel buffer format");
                    return 0;
            }
        }
        render.pixelFormatBytesPerElement = pixelFormatBytesPerElement;
        function glImageFormatForPixelFormat(rc, format) {
            var gl = rc.gl;
            switch (format) {
                case 1:
                    return gl.ALPHA;
                case 2:
                    return gl.RGB;
                case 3:
                    return gl.RGBA;
                case 4:
                    return rc.extSRGB ? rc.extSRGB.SRGB_EXT : gl.RGB;
                case 5:
                    return rc.extSRGB ? rc.extSRGB.SRGB_ALPHA_EXT : gl.RGB;
                case 6:
                    return rc.extTextureHalfFloat ? gl.RGBA : gl.NONE;
                case 7:
                    return gl.RGBA;
                case 8:
                    return gl.RGB;
                case 9:
                case 10:
                    return gl.RGBA;
                case 11:
                case 12:
                    return gl.DEPTH_COMPONENT;
                case 13:
                    return gl.STENCIL_INDEX;
                case 14:
                    return gl.DEPTH_STENCIL;
                case 256:
                    return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGB_S3TC_DXT1_EXT : gl.NONE;
                case 257:
                    return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGBA_S3TC_DXT1_EXT : gl.NONE;
                case 258:
                    return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGBA_S3TC_DXT3_EXT : gl.NONE;
                case 259:
                    return rc.extS3TC ? rc.extS3TC.COMPRESSED_RGBA_S3TC_DXT5_EXT : gl.NONE;
                default:
                    sd.assert(false, "unhandled pixel format");
                    return gl.NONE;
            }
        }
        render.glImageFormatForPixelFormat = glImageFormatForPixelFormat;
        function glPixelDataTypeForPixelFormat(rc, format) {
            var gl = rc.gl;
            if (pixelFormatIsCompressed(format)) {
                return gl.NONE;
            }
            switch (format) {
                case 1:
                case 2:
                case 13:
                case 3:
                    return gl.UNSIGNED_BYTE;
                case 4:
                case 5:
                    return gl.UNSIGNED_BYTE;
                case 8:
                    return gl.UNSIGNED_SHORT_5_6_5;
                case 9:
                    return gl.UNSIGNED_SHORT_4_4_4_4;
                case 10:
                    return gl.UNSIGNED_SHORT_5_5_5_1;
                case 6:
                    return rc.extTextureHalfFloat ? rc.extTextureHalfFloat.HALF_FLOAT_OES : gl.NONE;
                case 7:
                    return gl.FLOAT;
                case 11:
                    return gl.UNSIGNED_SHORT;
                case 12:
                    return gl.UNSIGNED_INT;
                case 14:
                    return rc.extDepthTexture ? rc.extDepthTexture.UNSIGNED_INT_24_8_WEBGL : gl.NONE;
                default:
                    sd.assert(false, "unhandled pixel format");
                    return gl.NONE;
            }
        }
        render.glPixelDataTypeForPixelFormat = glPixelDataTypeForPixelFormat;
        function makePixelCoordinate(x, y) {
            return { x: x, y: y };
        }
        render.makePixelCoordinate = makePixelCoordinate;
        function makePixelDimensions(width, height) {
            return { width: width, height: height };
        }
        render.makePixelDimensions = makePixelDimensions;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        var contextLimits = {
            maxColourAttachments: 0,
            maxDrawBuffers: 0
        };
        function maxColourAttachments(rc) {
            if (contextLimits.maxColourAttachments == 0) {
                contextLimits.maxColourAttachments = rc.extDrawBuffers ? rc.gl.getParameter(rc.extDrawBuffers.MAX_COLOR_ATTACHMENTS_WEBGL) : 1;
            }
            return contextLimits.maxColourAttachments;
        }
        render.maxColourAttachments = maxColourAttachments;
        function maxDrawBuffers(rc) {
            if (contextLimits.maxDrawBuffers == 0) {
                contextLimits.maxDrawBuffers = rc.extDrawBuffers ? rc.gl.getParameter(rc.extDrawBuffers.MAX_DRAW_BUFFERS_WEBGL) : 1;
            }
            return contextLimits.maxDrawBuffers;
        }
        render.maxDrawBuffers = maxDrawBuffers;
        function makeShader(rc, type, sourceText) {
            var shader = rc.gl.createShader(type);
            rc.gl.shaderSource(shader, sourceText);
            rc.gl.compileShader(shader);
            if (!rc.gl.getShaderParameter(shader, rc.gl.COMPILE_STATUS)) {
                var errorLog = rc.gl.getShaderInfoLog(shader);
                console.error("Shader compilation failed:", errorLog);
                console.error("Source", sourceText);
                sd.assert(false, "bad shader");
            }
            return shader;
        }
        render.makeShader = makeShader;
        function makeProgram(rc, vertexShader, fragmentShader) {
            var program = rc.gl.createProgram();
            if (vertexShader) {
                rc.gl.attachShader(program, vertexShader);
            }
            if (fragmentShader) {
                rc.gl.attachShader(program, fragmentShader);
            }
            rc.gl.linkProgram(program);
            if (!rc.gl.getProgramParameter(program, rc.gl.LINK_STATUS)) {
                var errorLog = rc.gl.getProgramInfoLog(program);
                console.error("Program link failed:", errorLog);
                sd.assert(false, "bad program");
            }
            return program;
        }
        render.makeProgram = makeProgram;
        function makeRenderContext(canvas) {
            var gl;
            var contextAttrs = {
                antialias: false,
                depth: true,
                alpha: false,
                premultipliedAlpha: false
            };
            try {
                gl = canvas.getContext("webgl", contextAttrs);
                if (!gl) {
                    gl = canvas.getContext("experimental-webgl", contextAttrs);
                }
            }
            catch (e) {
                gl = null;
            }
            if (!gl) {
                return null;
            }
            gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, gl.ZERO);
            var eiu = gl.getExtension("OES_element_index_uint");
            var mdb = gl.getExtension("WEBGL_draw_buffers");
            var dte = gl.getExtension("WEBGL_depth_texture") ||
                gl.getExtension("WEBKIT_WEBGL_depth_texture") ||
                gl.getExtension("MOZ_WEBGL_depth_texture");
            var ftx = gl.getExtension("OES_texture_float");
            var ftl = gl.getExtension("OES_texture_float_linear");
            var htx = gl.getExtension("OES_texture_half_float");
            var htl = gl.getExtension("OES_texture_half_float_linear");
            var s3tc = gl.getExtension("WEBGL_compressed_texture_s3tc") ||
                gl.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc") ||
                gl.getExtension("MOZ_WEBGL_compressed_texture_s3tc");
            var bmm = gl.getExtension("EXT_blend_minmax");
            var txa = gl.getExtension("EXT_texture_filter_anisotropic") ||
                gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
            var vao = gl.getExtension("OES_vertex_array_object");
            var aia = gl.getExtension("ANGLE_instanced_arrays");
            var drv = gl.getExtension("OES_standard_derivatives");
            var fsl = gl.getExtension("EXT_shader_texture_lod");
            var fgz = gl.getExtension("EXT_frag_depth");
            var srgb = gl.getExtension("EXT_sRGB");
            return {
                gl: gl,
                ext32bitIndexes: eiu,
                extDrawBuffers: mdb,
                extDepthTexture: dte,
                extTextureFloat: ftx,
                extTextureFloatLinear: ftl,
                extTextureHalfFloat: htx,
                extTextureHalfFloatLinear: htl,
                extS3TC: s3tc,
                extMinMax: bmm,
                extTexAnisotropy: txa,
                extVAO: vao,
                extInstancedArrays: aia,
                extDerivatives: drv,
                extFragmentLOD: fsl,
                extFragDepth: fgz,
                extSRGB: srgb
            };
        }
        render.makeRenderContext = makeRenderContext;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function makeScissorRect() {
            return {
                originX: 0,
                originY: 0,
                width: 32768,
                height: 32768
            };
        }
        render.makeScissorRect = makeScissorRect;
        function makeViewport() {
            return {
                originX: 0,
                originY: 0,
                width: 0,
                height: 0,
                nearZ: 0,
                farZ: 1
            };
        }
        render.makeViewport = makeViewport;
        function makeRenderPassDescriptor() {
            return {
                clearMask: 7,
                clearColour: [0, 0, 0, 1],
                clearDepth: 1.0,
                clearStencil: 0
            };
        }
        render.makeRenderPassDescriptor = makeRenderPassDescriptor;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function runRenderPass(rc, meshMgr, rpDesc, frameBuffer, passFunc) {
            var rp = new RenderPass(rc, meshMgr, rpDesc, frameBuffer);
            rp.setup();
            passFunc(rp);
            rp.teardown();
        }
        render.runRenderPass = runRenderPass;
        function glTypeForIndexElementType(rc, iet) {
            switch (iet) {
                case 1: return rc.gl.UNSIGNED_BYTE;
                case 2: return rc.gl.UNSIGNED_SHORT;
                case 3:
                    return rc.ext32bitIndexes ? rc.gl.UNSIGNED_INT : rc.gl.NONE;
                default:
                    sd.assert(false, "Invalid IndexElementType");
                    return rc.gl.NONE;
            }
        }
        function glTypeForPrimitiveType(rc, pt) {
            switch (pt) {
                case 1: return rc.gl.POINTS;
                case 2: return rc.gl.LINES;
                case 3: return rc.gl.LINE_STRIP;
                case 4: return rc.gl.TRIANGLES;
                case 5: return rc.gl.TRIANGLE_STRIP;
                default:
                    sd.assert(false, "Invalid PrimitiveType");
                    return rc.gl.NONE;
            }
        }
        function glDepthFuncForDepthTest(rc, depthTest) {
            switch (depthTest) {
                case 1:
                    return rc.gl.ALWAYS;
                case 2:
                    return rc.gl.NEVER;
                case 3:
                    return rc.gl.LESS;
                case 4:
                    return rc.gl.LEQUAL;
                case 5:
                    return rc.gl.EQUAL;
                case 6:
                    return rc.gl.NOTEQUAL;
                case 7:
                    return rc.gl.GEQUAL;
                case 8:
                    return rc.gl.GREATER;
                default:
                    return rc.gl.NONE;
            }
        }
        var RenderPass = (function () {
            function RenderPass(rc, meshMgr_, desc_, frameBuffer_) {
                if (frameBuffer_ === void 0) { frameBuffer_ = null; }
                this.rc = rc;
                this.meshMgr_ = meshMgr_;
                this.desc_ = desc_;
                this.frameBuffer_ = frameBuffer_;
                this.pipeline_ = null;
                this.mesh_ = 0;
                this.viewport_ = null;
                sd.assert(desc_.clearColour.length >= 4);
            }
            RenderPass.prototype.setup = function () {
                var gl = this.rc.gl;
                if (this.frameBuffer_) {
                    this.frameBuffer_.bind();
                    var port = render.makeViewport();
                    port.width = this.frameBuffer_.width;
                    port.height = this.frameBuffer_.height;
                    this.setViewPort(port);
                }
                else {
                    this.setViewPort(render.makeViewport());
                }
                var glClearMask = 0;
                if (this.desc_.clearMask & 1) {
                    gl.clearColor(this.desc_.clearColour[0], this.desc_.clearColour[1], this.desc_.clearColour[2], this.desc_.clearColour[3]);
                    glClearMask |= gl.COLOR_BUFFER_BIT;
                }
                if (this.desc_.clearMask & 2) {
                    gl.clearDepth(this.desc_.clearDepth);
                    glClearMask |= gl.DEPTH_BUFFER_BIT;
                }
                if (this.desc_.clearMask & 4) {
                    gl.clearStencil(this.desc_.clearStencil);
                    glClearMask |= gl.STENCIL_BUFFER_BIT;
                }
                if (glClearMask) {
                    gl.clear(glClearMask);
                }
            };
            RenderPass.prototype.teardown = function () {
                this.setPipeline(null);
                if (this.frameBuffer_) {
                    this.frameBuffer_.unbind();
                }
            };
            Object.defineProperty(RenderPass.prototype, "frameBuffer", {
                get: function () { return this.frameBuffer_; },
                enumerable: true,
                configurable: true
            });
            RenderPass.prototype.setPipeline = function (pipeline) {
                if (pipeline === this.pipeline_) {
                    return;
                }
                if (this.mesh_) {
                    if (this.pipeline_) {
                        this.meshMgr_.unbind(this.mesh_, this.pipeline_);
                    }
                    this.mesh_ = 0;
                }
                if (this.pipeline_) {
                    this.pipeline_.unbind();
                }
                this.pipeline_ = pipeline;
                if (this.pipeline_) {
                    this.pipeline_.bind();
                }
            };
            RenderPass.prototype.setMesh = function (mesh) {
                if (!this.pipeline_) {
                    sd.assert(false, "You must set the Pipeline before setting the Mesh");
                    return;
                }
                if (this.mesh_ === mesh) {
                    return;
                }
                if (this.mesh_ && !mesh) {
                    this.meshMgr_.unbind(this.mesh_, this.pipeline_);
                }
                this.mesh_ = mesh;
                if (this.mesh_) {
                    this.meshMgr_.bind(this.mesh_, this.pipeline_);
                }
            };
            RenderPass.prototype.setDepthTest = function (depthTest) {
                if (depthTest == 0) {
                    this.rc.gl.disable(this.rc.gl.DEPTH_TEST);
                }
                else {
                    this.rc.gl.enable(this.rc.gl.DEPTH_TEST);
                    this.rc.gl.depthFunc(glDepthFuncForDepthTest(this.rc, depthTest));
                }
            };
            RenderPass.prototype.setFaceCulling = function (faceCulling) {
                if (faceCulling == 0) {
                    this.rc.gl.disable(this.rc.gl.CULL_FACE);
                }
                else {
                    this.rc.gl.enable(this.rc.gl.CULL_FACE);
                    var mode = (faceCulling == 2) ? this.rc.gl.BACK : this.rc.gl.FRONT;
                    this.rc.gl.cullFace(mode);
                }
            };
            RenderPass.prototype.setFrontFaceWinding = function (winding) {
                var mode = (winding == 0) ? this.rc.gl.CW : this.rc.gl.CCW;
                this.rc.gl.frontFace(mode);
            };
            RenderPass.prototype.setViewPort = function (viewport) {
                if (viewport.width == 0 && viewport.height == 0) {
                    viewport.width = this.rc.gl.drawingBufferWidth;
                    viewport.height = this.rc.gl.drawingBufferHeight;
                }
                this.rc.gl.viewport(viewport.originX, viewport.originY, viewport.width, viewport.height);
                this.rc.gl.depthRange(viewport.nearZ, viewport.farZ);
                this.viewport_ = viewport;
            };
            RenderPass.prototype.viewport = function () {
                return this.viewport_;
            };
            RenderPass.prototype.setScissorRect = function (rect) {
                this.rc.gl.scissor(rect.originX, rect.originY, rect.width, rect.height);
                var renderWidth;
                var renderHeight;
                if (this.frameBuffer_) {
                    renderWidth = this.frameBuffer_.width;
                    renderHeight = this.frameBuffer_.height;
                }
                else {
                    renderWidth = this.rc.gl.drawingBufferWidth;
                    renderHeight = this.rc.gl.drawingBufferHeight;
                }
                if (rect.originX > 0 || rect.originY > 0 || rect.width < renderWidth || rect.height < renderHeight) {
                    this.rc.gl.enable(this.rc.gl.SCISSOR_TEST);
                }
                else {
                    this.rc.gl.disable(this.rc.gl.SCISSOR_TEST);
                }
            };
            RenderPass.prototype.setConstantBlendColour = function (colour4) {
                sd.assert(colour4.length >= 4);
                this.rc.gl.blendColor(colour4[0], colour4[1], colour4[2], colour4[3]);
            };
            RenderPass.prototype.setTexture = function (texture, bindPoint) {
                var gl = this.rc.gl;
                gl.activeTexture(gl.TEXTURE0 + bindPoint);
                if (texture) {
                    texture.bind();
                }
                else {
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
            };
            RenderPass.prototype.drawPrimitives = function (primitiveType, startElement, elementCount, instanceCount) {
                if (instanceCount === void 0) { instanceCount = 1; }
                var glPrimitiveType = glTypeForPrimitiveType(this.rc, primitiveType);
                if (instanceCount == 1) {
                    this.rc.gl.drawArrays(glPrimitiveType, startElement, elementCount);
                }
                else {
                    this.rc.extInstancedArrays.drawArraysInstancedANGLE(glPrimitiveType, startElement, elementCount, instanceCount);
                }
            };
            RenderPass.prototype.drawIndexedPrimitives = function (primitiveType, indexElementType, startElement, elementCount, instanceCount) {
                if (instanceCount === void 0) { instanceCount = 1; }
                var glPrimitiveType = glTypeForPrimitiveType(this.rc, primitiveType);
                var glIndexElementType = glTypeForIndexElementType(this.rc, indexElementType);
                var offsetBytes = startElement * sd.meshdata.indexElementTypeSizeBytes(indexElementType);
                if (instanceCount == 1) {
                    this.rc.gl.drawElements(glPrimitiveType, elementCount, glIndexElementType, offsetBytes);
                }
                else {
                    this.rc.extInstancedArrays.drawElementsInstancedANGLE(glPrimitiveType, elementCount, glIndexElementType, offsetBytes, instanceCount);
                }
            };
            return RenderPass;
        }());
        render.RenderPass = RenderPass;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function useMipMaps(use) {
            return use ? 1 : 0;
        }
        render.useMipMaps = useMipMaps;
        function makeMipMapRange(baseLevel, numLevels) {
            return { baseLevel: baseLevel, numLevels: numLevels };
        }
        render.makeMipMapRange = makeMipMapRange;
        function makeSamplerDescriptor() {
            return {
                repeatS: 0,
                repeatT: 0,
                minFilter: 1,
                magFilter: 1,
                mipFilter: 1,
                maxAnisotropy: 1
            };
        }
        render.makeSamplerDescriptor = makeSamplerDescriptor;
        function maxMipLevelsForDimension(dim) {
            return 1 + Math.floor(Math.log(dim | 0) / Math.LN2);
        }
        render.maxMipLevelsForDimension = maxMipLevelsForDimension;
        function makeTextureDescriptor() {
            return {
                textureClass: 1,
                pixelFormat: 0,
                sampling: makeSamplerDescriptor(),
                dim: render.makePixelDimensions(0, 0),
                mipmaps: 1
            };
        }
        render.makeTextureDescriptor = makeTextureDescriptor;
        function makeTexDesc2D(pixelFormat, width, height, mipmapped) {
            if (mipmapped === void 0) { mipmapped = 0; }
            var maxDim = Math.max(width, height);
            return {
                textureClass: 1,
                pixelFormat: pixelFormat,
                sampling: makeSamplerDescriptor(),
                dim: render.makePixelDimensions(width, height),
                mipmaps: (mipmapped == 1) ? maxMipLevelsForDimension(maxDim) : 1
            };
        }
        render.makeTexDesc2D = makeTexDesc2D;
        function makeTexDesc2DFromImageSource(source, colourSpace, mipmapped) {
            if (mipmapped === void 0) { mipmapped = 0; }
            var maxDim = Math.max(source.width, source.height);
            return {
                textureClass: 1,
                pixelFormat: colourSpace === 0 ? 5 : 3,
                sampling: makeSamplerDescriptor(),
                dim: render.makePixelDimensions(source.width, source.height),
                mipmaps: (mipmapped == 1) ? maxMipLevelsForDimension(maxDim) : 1,
                pixelData: [source]
            };
        }
        render.makeTexDesc2DFromImageSource = makeTexDesc2DFromImageSource;
        function makeTexDesc2DFloatLUT(sourceData, width, height) {
            return {
                textureClass: 1,
                pixelFormat: 7,
                sampling: {
                    repeatS: 2,
                    repeatT: 2,
                    maxAnisotropy: 1,
                    minFilter: 0,
                    magFilter: 0,
                    mipFilter: 0
                },
                dim: render.makePixelDimensions(width, height),
                mipmaps: 1,
                pixelData: [sourceData]
            };
        }
        render.makeTexDesc2DFloatLUT = makeTexDesc2DFloatLUT;
        function makeTexDescCube(pixelFormat, dimension, mipmapped) {
            if (mipmapped === void 0) { mipmapped = 0; }
            var sampler = makeSamplerDescriptor();
            sampler.mipFilter = mipmapped == 1 ? 2 : 0;
            sampler.repeatS = 2;
            sampler.repeatT = 2;
            return {
                textureClass: 2,
                pixelFormat: pixelFormat,
                sampling: sampler,
                dim: render.makePixelDimensions(dimension, dimension),
                mipmaps: (mipmapped == 1) ? maxMipLevelsForDimension(dimension) : 1
            };
        }
        render.makeTexDescCube = makeTexDescCube;
        function makeTexDescCubeFromImageSources(sources, colourSpace, mipmapped) {
            if (mipmapped === void 0) { mipmapped = 0; }
            var sampler = makeSamplerDescriptor();
            sampler.mipFilter = mipmapped == 1 ? 2 : 0;
            sampler.repeatS = 2;
            sampler.repeatT = 2;
            return {
                textureClass: 2,
                pixelFormat: colourSpace === 0 ? 5 : 3,
                sampling: sampler,
                dim: render.makePixelDimensions(sources[0].width, sources[0].height),
                mipmaps: (mipmapped == 1) ? maxMipLevelsForDimension(sources[0].width) : 1,
                pixelData: sources
            };
        }
        render.makeTexDescCubeFromImageSources = makeTexDescCubeFromImageSources;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function loadSimpleTexture(rc, filePath, mipmaps, colourSpace) {
            if (mipmaps === void 0) { mipmaps = false; }
            if (colourSpace === void 0) { colourSpace = 0; }
            return new Promise(function (resolve, reject) {
                var image = new Image();
                image.onload = function () {
                    var td = render.makeTexDesc2DFromImageSource(image, colourSpace, render.useMipMaps(mipmaps));
                    var texture = new render.Texture(rc, td);
                    resolve(texture);
                };
                image.onerror = function () {
                    sd.assert(false, "Image " + filePath + " does not exist");
                    reject();
                };
                image.src = filePath;
            });
        }
        render.loadSimpleTexture = loadSimpleTexture;
        function loadCubeTexture(rc, filePaths) {
            sd.assert(filePaths.length == 6, "must have 6 paths for cube tex");
            return new Promise(function (resolve, reject) {
                var images = [];
                var loaded = 0;
                for (var k = 0; k < 6; ++k) {
                    (function (face) {
                        var image = new Image();
                        image.onload = function () {
                            images[face] = image;
                            ++loaded;
                            if (loaded == 6) {
                                var td = render.makeTexDescCubeFromImageSources(images, 0);
                                var texture = new render.Texture(rc, td);
                                resolve(texture);
                            }
                        };
                        image.onerror = function () {
                            sd.assert(false, "Image " + filePaths[face] + " does not exist");
                            reject();
                        };
                        image.src = filePaths[face];
                    }(k));
                }
            });
        }
        render.loadCubeTexture = loadCubeTexture;
        function makeCubeMapPaths(basePath, extension) {
            return [
                basePath + ("posx" + extension),
                basePath + ("negx" + extension),
                basePath + ("posy" + extension),
                basePath + ("negy" + extension),
                basePath + ("posz" + extension),
                basePath + ("negz" + extension)
            ];
        }
        render.makeCubeMapPaths = makeCubeMapPaths;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var render;
    (function (render) {
        function glTextureRepeatMode(rc, repeat) {
            switch (repeat) {
                case 0: return rc.gl.REPEAT;
                case 1: return rc.gl.MIRRORED_REPEAT;
                case 2: return rc.gl.CLAMP_TO_EDGE;
                default:
                    sd.assert(false, "Invalid TextureRepeatMode");
                    return rc.gl.NONE;
            }
        }
        function glTextureMinificationFilter(rc, minFilter, mipFilter) {
            var glSizingFilter;
            if (mipFilter == 0) {
                if (minFilter == 0) {
                    glSizingFilter = rc.gl.NEAREST;
                }
                else {
                    glSizingFilter = rc.gl.LINEAR;
                }
            }
            else if (mipFilter == 1) {
                if (minFilter == 0) {
                    glSizingFilter = rc.gl.NEAREST_MIPMAP_NEAREST;
                }
                else {
                    glSizingFilter = rc.gl.LINEAR_MIPMAP_NEAREST;
                }
            }
            else {
                if (minFilter == 0) {
                    glSizingFilter = rc.gl.NEAREST_MIPMAP_LINEAR;
                }
                else {
                    glSizingFilter = rc.gl.LINEAR_MIPMAP_LINEAR;
                }
            }
            return glSizingFilter;
        }
        function glTextureMagnificationFilter(rc, magFilter) {
            if (magFilter == 0) {
                return rc.gl.NEAREST;
            }
            else {
                return rc.gl.LINEAR;
            }
        }
        var textureLimits = {
            maxDimension: 0,
            maxDimensionCube: 0,
            maxAnisotropy: 0
        };
        function maxTextureDimension(rc, texClass) {
            if (textureLimits.maxDimension == 0) {
                textureLimits.maxDimension = rc.gl.getParameter(rc.gl.MAX_TEXTURE_SIZE);
                textureLimits.maxDimensionCube = rc.gl.getParameter(rc.gl.MAX_CUBE_MAP_TEXTURE_SIZE);
            }
            if (texClass == 2) {
                return textureLimits.maxDimensionCube;
            }
            return textureLimits.maxDimension;
        }
        function maxAllowedAnisotropy(rc) {
            if (textureLimits.maxAnisotropy == 0) {
                textureLimits.maxAnisotropy =
                    rc.extTexAnisotropy ?
                        rc.gl.getParameter(rc.extTexAnisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT) :
                        1;
            }
            return textureLimits.maxAnisotropy;
        }
        var Texture = (function () {
            function Texture(rc, desc) {
                this.rc = rc;
                this.textureClass_ = desc.textureClass;
                this.dim_ = sd.cloneStruct(desc.dim);
                this.mipmaps_ = desc.mipmaps;
                this.pixelFormat_ = desc.pixelFormat;
                this.sampler_ = sd.cloneStruct(desc.sampling);
                sd.assert(this.mipmaps_ > 0);
                sd.assert(this.width > 0);
                sd.assert(this.height > 0);
                sd.assert(this.width <= maxTextureDimension(rc, this.textureClass_));
                sd.assert(this.height <= maxTextureDimension(rc, this.textureClass_));
                var npot = !(sd.math.isPowerOf2(this.width) && sd.math.isPowerOf2(this.height));
                if (npot) {
                    if (this.sampler_.repeatS != 2 || this.sampler_.repeatT != 2) {
                        console.warn("NPOT textures cannot repeat, overriding with ClampToEdge", desc);
                        this.sampler_.repeatS = 2;
                        this.sampler_.repeatT = 2;
                    }
                    if (this.mipmaps_ > 1) {
                        console.warn("NPOT textures cannot have mipmaps, setting levels to 1", desc);
                        this.mipmaps_ = 1;
                    }
                    if (this.sampler_.mipFilter != 0) {
                        console.warn("NPOT textures cannot have mipmaps, overriding with MipFilter.None", desc);
                        this.sampler_.mipFilter = 0;
                    }
                }
                var gl = rc.gl;
                if (desc.textureClass == 1) {
                    this.createTex2D(desc.pixelData);
                }
                else {
                    this.createTexCube(desc.pixelData);
                }
                gl.bindTexture(this.glTarget_, this.resource_);
                gl.texParameteri(this.glTarget_, gl.TEXTURE_WRAP_S, glTextureRepeatMode(rc, this.sampler_.repeatS));
                gl.texParameteri(this.glTarget_, gl.TEXTURE_WRAP_T, glTextureRepeatMode(rc, this.sampler_.repeatS));
                if (this.mipmaps_ == 1) {
                    this.sampler_.mipFilter = 0;
                }
                gl.texParameteri(this.glTarget_, gl.TEXTURE_MIN_FILTER, glTextureMinificationFilter(rc, this.sampler_.minFilter, this.sampler_.mipFilter));
                gl.texParameteri(this.glTarget_, gl.TEXTURE_MAG_FILTER, glTextureMagnificationFilter(rc, this.sampler_.magFilter));
                if (rc.extTexAnisotropy) {
                    var anisotropy = sd.math.clamp(this.sampler_.maxAnisotropy, 1, maxAllowedAnisotropy(rc));
                    gl.texParameterf(this.glTarget_, rc.extTexAnisotropy.TEXTURE_MAX_ANISOTROPY_EXT, anisotropy);
                }
                rc.gl.bindTexture(this.glTarget_, null);
            }
            Texture.prototype.createTex2D = function (pixelData) {
                var gl = this.rc.gl;
                sd.assert((pixelData == null) || (pixelData.length == 1), "Tex2D pixelData array must contain 1 item or be omitted completely.");
                var texPixelData = (pixelData && pixelData[0]) || null;
                var glPixelFormat = render.glImageFormatForPixelFormat(this.rc, this.pixelFormat_);
                var glPixelType = render.glPixelDataTypeForPixelFormat(this.rc, this.pixelFormat_);
                if (render.pixelFormatIsCompressed(this.pixelFormat_)) {
                    sd.assert(texPixelData && ("byteLength" in texPixelData), "Compressed textures MUST provide pixelData");
                }
                var tex = this.resource_ = gl.createTexture();
                this.glTarget_ = gl.TEXTURE_2D;
                gl.bindTexture(this.glTarget_, tex);
                var w = this.width;
                var h = this.height;
                if (render.pixelFormatIsCompressed(this.pixelFormat_)) {
                    gl.compressedTexImage2D(this.glTarget_, 0, glPixelFormat, w, h, 0, texPixelData);
                }
                else {
                    if ((texPixelData == null) || ("byteLength" in texPixelData)) {
                        gl.texImage2D(this.glTarget_, 0, glPixelFormat, w, h, 0, glPixelFormat, glPixelType, texPixelData);
                    }
                    else {
                        var tis = texPixelData;
                        sd.assert((tis.width == w) && (tis.height == h), "Tex2D imageSource's size does not match descriptor");
                        gl.texImage2D(this.glTarget_, 0, glPixelFormat, glPixelFormat, glPixelType, tis);
                    }
                }
                if (this.mipmaps_ > 1) {
                    gl.generateMipmap(this.glTarget_);
                }
                gl.bindTexture(this.glTarget_, null);
            };
            Texture.prototype.createTexCube = function (pixelData) {
                var gl = this.rc.gl;
                sd.assert((pixelData == null) || (pixelData.length == 6), "TexCube pixelData array must contain 6 items or be omitted completely.");
                var glPixelFormat = render.glImageFormatForPixelFormat(this.rc, this.pixelFormat_);
                var glPixelType = render.glPixelDataTypeForPixelFormat(this.rc, this.pixelFormat_);
                var tex = this.resource_ = gl.createTexture();
                this.glTarget_ = gl.TEXTURE_CUBE_MAP;
                gl.bindTexture(this.glTarget_, tex);
                var w = this.width;
                var h = this.height;
                sd.assert(w == h, "TexCube textures MUST have the same width and height");
                if (render.pixelFormatIsCompressed(this.pixelFormat_)) {
                    sd.assert(pixelData && (pixelData.length == 6), "Compressed textures MUST provide pixelData");
                    for (var layer = 0; layer < 6; ++layer) {
                        var layerPixels = pixelData[layer];
                        sd.assert(layerPixels && ("byteLength" in layerPixels), "pixelData source " + layer + " for compressed TexCube is not an ArrayBufferView");
                        gl.compressedTexImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + layer, 0, glPixelFormat, w, h, 0, layerPixels);
                    }
                }
                else {
                    for (var layer = 0; layer < 6; ++layer) {
                        var texPixelData = (pixelData && pixelData[layer]) || null;
                        if ((texPixelData == null) || ("byteLength" in texPixelData)) {
                            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + layer, 0, glPixelFormat, w, h, 0, glPixelFormat, glPixelType, texPixelData);
                        }
                        else {
                            var tis = texPixelData;
                            sd.assert((tis.width == w) && (tis.height == h), "TexCube pixelData " + layer + "'s size does not match descriptor");
                            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + layer, 0, glPixelFormat, glPixelFormat, glPixelType, texPixelData);
                        }
                    }
                }
                if (this.mipmaps_ > 1) {
                    gl.generateMipmap(this.glTarget_);
                }
                gl.bindTexture(this.glTarget_, null);
            };
            Texture.prototype.bind = function () {
                this.rc.gl.bindTexture(this.glTarget_, this.resource_);
            };
            Texture.prototype.unbind = function () {
                this.rc.gl.bindTexture(this.glTarget_, null);
            };
            Object.defineProperty(Texture.prototype, "dim", {
                get: function () { return __assign({}, this.dim_); },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Texture.prototype, "width", {
                get: function () { return this.dim_.width; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Texture.prototype, "height", {
                get: function () { return this.dim_.height; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Texture.prototype, "mipmaps", {
                get: function () { return this.mipmaps_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Texture.prototype, "isMipMapped", {
                get: function () { return this.mipmaps_ > 1; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Texture.prototype, "pixelFormat", {
                get: function () { return this.pixelFormat_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Texture.prototype, "textureClass", {
                get: function () { return this.textureClass_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Texture.prototype, "resource", {
                get: function () { return this.resource_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Texture.prototype, "target", {
                get: function () { return this.glTarget_; },
                enumerable: true,
                configurable: true
            });
            return Texture;
        }());
        render.Texture = Texture;
    })(render = sd.render || (sd.render = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var PerfTimer = (function () {
        function PerfTimer(name_) {
            this.name_ = name_;
            this.stepSums_ = new Map();
            this.t0_ = this.lastT_ = performance.now();
        }
        PerfTimer.prototype.step = function (stepName) {
            var curT = performance.now();
            var diffT = curT - this.lastT_;
            this.lastT_ = curT;
            this.stepSums_.set(name, diffT + (this.stepSums_.get(stepName) || 0));
            console.info("Perf [" + this.name_ + "] " + stepName + ": " + diffT.toFixed(1));
        };
        PerfTimer.prototype.end = function () {
            var _this = this;
            var curT = performance.now();
            var diffT = curT - this.t0_;
            this.stepSums_.forEach(function (totalStepT, stepName) {
                console.info("Perf TOTAL [" + _this.name_ + "] " + stepName + ": " + totalStepT.toFixed(1));
            });
            console.info("Perf TOTAL: " + diffT.toFixed(1));
        };
        return PerfTimer;
    }());
    sd.PerfTimer = PerfTimer;
})(sd || (sd = {}));
var sd;
(function (sd) {
    var RunLoop = (function () {
        function RunLoop() {
            this.tickDuration_ = sd.math.hertz(60);
            this.maxFrameDuration_ = this.tickDuration_ * 2;
            this.globalTime_ = 0;
            this.lastFrameTime_ = 0;
            this.runState_ = 0;
            this.rafID_ = 0;
            this.sceneCtrl_ = null;
            this.nextFrameFn_ = this.nextFrame.bind(this);
        }
        RunLoop.prototype.nextFrame = function (now) {
            var dt = (now - this.lastFrameTime_) / 1000.0;
            if (dt > this.maxFrameDuration_) {
                dt = this.maxFrameDuration_;
            }
            this.lastFrameTime_ = now;
            this.globalTime_ += dt;
            if (this.sceneCtrl_) {
                this.sceneCtrl_.simulationStep(dt);
                this.sceneCtrl_.renderFrame(dt);
            }
            sd.io.keyboard.resetHalfTransitions();
            if (this.runState_ == 1) {
                this.rafID_ = requestAnimationFrame(this.nextFrameFn_);
            }
        };
        RunLoop.prototype.start = function () {
            if (this.runState_ != 0) {
                return;
            }
            this.runState_ = 1;
            if (this.sceneCtrl_) {
                if (this.sceneCtrl_.resume) {
                    this.sceneCtrl_.resume();
                }
            }
            this.lastFrameTime_ = performance.now();
            this.rafID_ = requestAnimationFrame(this.nextFrameFn_);
        };
        RunLoop.prototype.stop = function () {
            if (this.runState_ != 1) {
                return;
            }
            this.runState_ = 0;
            if (this.sceneCtrl_) {
                if (this.sceneCtrl_.suspend) {
                    this.sceneCtrl_.suspend();
                }
            }
            if (this.rafID_) {
                cancelAnimationFrame(this.rafID_);
                this.rafID_ = 0;
            }
        };
        Object.defineProperty(RunLoop.prototype, "globalTime", {
            get: function () {
                return this.globalTime_;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RunLoop.prototype, "sceneController", {
            get: function () {
                return this.sceneCtrl_;
            },
            set: function (newCtrl) {
                if (this.sceneCtrl_) {
                    if (this.runState_ == 1) {
                        if (this.sceneCtrl_.suspend) {
                            this.sceneCtrl_.suspend();
                        }
                    }
                    if (this.sceneCtrl_.blur) {
                        this.sceneCtrl_.blur();
                    }
                }
                this.sceneCtrl_ = newCtrl;
                if (this.sceneCtrl_) {
                    if (this.sceneCtrl_.focus) {
                        this.sceneCtrl_.focus();
                    }
                    if (this.runState_ == 1) {
                        if (this.sceneCtrl_.resume) {
                            this.sceneCtrl_.resume();
                        }
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        return RunLoop;
    }());
    sd.RunLoop = RunLoop;
    sd.defaultRunLoop = new RunLoop();
    sd.dom.on(window, "blur", function () {
        sd.defaultRunLoop.stop();
    });
    sd.dom.on(window, "focus", function () {
        sd.defaultRunLoop.start();
    });
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var ColliderManager = (function () {
            function ColliderManager(physMatMgr_) {
                this.physMatMgr_ = physMatMgr_;
                var fields = [
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                ];
                this.instanceData_ = new sd.container.MultiArrayBuffer(128, fields);
                this.rebase();
                this.entityMap_ = new Map();
                this.sphereData_ = new Map();
            }
            ColliderManager.prototype.rebase = function () {
                this.typeBase_ = this.instanceData_.indexedFieldView(0);
                this.entityBase_ = this.instanceData_.indexedFieldView(1);
                this.physMatBase_ = this.instanceData_.indexedFieldView(2);
            };
            ColliderManager.prototype.create = function (ent, desc) {
                if (this.instanceData_.extend() == 1) {
                    this.rebase();
                }
                var instance = this.instanceData_.count;
                this.typeBase_[instance] = desc.type;
                this.entityBase_[instance] = ent;
                this.physMatBase_[instance] = desc.physicsMaterial;
                this.entityMap_.set(ent, instance);
                if (desc.type == 1) {
                    sd.assert(desc.sphere);
                    this.sphereData_.set(instance, sd.cloneStruct(desc.sphere));
                }
                return instance;
            };
            ColliderManager.prototype.forEntity = function (ent) {
                return this.entityMap_.get(ent) || 0;
            };
            ColliderManager.prototype.destroy = function (_inst) {
            };
            ColliderManager.prototype.destroyRange = function (range) {
                var iter = range.makeIterator();
                while (iter.next()) {
                    this.destroy(iter.current);
                }
            };
            Object.defineProperty(ColliderManager.prototype, "count", {
                get: function () { return this.instanceData_.count; },
                enumerable: true,
                configurable: true
            });
            ColliderManager.prototype.valid = function (inst) {
                return inst <= this.count;
            };
            ColliderManager.prototype.all = function () {
                return new world.InstanceLinearRange(1, this.count);
            };
            ColliderManager.prototype.type = function (inst) {
                return this.typeBase_[inst];
            };
            ColliderManager.prototype.entity = function (inst) {
                return this.entityBase_[inst];
            };
            ColliderManager.prototype.physicsMaterial = function (inst) {
                var ref = this.physMatBase_[inst];
                return this.physMatMgr_.item(ref);
            };
            ColliderManager.prototype.sphereData = function (inst) {
                return this.sphereData_.get(inst);
            };
            return ColliderManager;
        }());
        world.ColliderManager = ColliderManager;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var entityIndexBits = 23;
        var entityGenerationBits = 8;
        var entityIndexMask = (1 << entityIndexBits) - 1;
        var entityGenerationMask = (1 << entityGenerationBits) - 1;
        function entityGeneration(ent) {
            return (ent >> entityIndexBits) & entityGenerationMask;
        }
        world.entityGeneration = entityGeneration;
        function entityIndex(ent) {
            return ent & entityIndexMask;
        }
        world.entityIndex = entityIndex;
        function makeEntity(index, generation) {
            return ((generation & entityGenerationMask) << entityIndexBits) | (index & entityIndexMask);
        }
        var EntityManager = (function () {
            function EntityManager() {
                this.minFreedBuildup = 1024;
                this.generation_ = new Uint8Array(8192);
                this.freedIndices_ = new sd.container.Deque();
                this.genCount_ = -1;
                this.appendGeneration();
            }
            EntityManager.prototype.appendGeneration = function () {
                if (this.genCount_ == this.generation_.length) {
                    var newBuffer = ArrayBuffer.transfer(this.generation_.buffer, this.generation_.length * 2);
                    this.generation_ = new Uint8Array(newBuffer);
                }
                ++this.genCount_;
                this.generation_[this.genCount_] = 0;
                return this.genCount_;
            };
            EntityManager.prototype.create = function () {
                var index;
                if (this.freedIndices_.count >= this.minFreedBuildup) {
                    index = this.freedIndices_.front;
                    this.freedIndices_.popFront();
                }
                else {
                    index = this.appendGeneration();
                }
                return makeEntity(index, this.generation_[index]);
            };
            EntityManager.prototype.alive = function (ent) {
                var index = ent & entityIndexMask;
                var generation = (ent >> entityIndexBits) & entityGenerationMask;
                return index <= this.genCount_ && (generation == this.generation_[index]);
            };
            EntityManager.prototype.destroy = function (ent) {
                var index = entityIndex(ent);
                this.generation_[index]++;
                this.freedIndices_.append(index);
            };
            return EntityManager;
        }());
        world.EntityManager = EntityManager;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var InstanceLinearIterator = (function () {
            function InstanceLinearIterator(first, last_) {
                this.last_ = last_;
                this.current = first - 1;
            }
            InstanceLinearIterator.prototype.next = function () {
                this.current = (this.current + 1);
                return this.current > 0 && this.current <= this.last_;
            };
            return InstanceLinearIterator;
        }());
        var InstanceLinearRange = (function () {
            function InstanceLinearRange(first_, last_) {
                this.first_ = first_;
                this.last_ = last_;
            }
            Object.defineProperty(InstanceLinearRange.prototype, "empty", {
                get: function () {
                    return this.first_ < 1 || this.last_ < this.first_;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(InstanceLinearRange.prototype, "front", {
                get: function () { return this.first_; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(InstanceLinearRange.prototype, "back", {
                get: function () { return this.last_; },
                enumerable: true,
                configurable: true
            });
            InstanceLinearRange.prototype.has = function (inst) {
                return inst >= this.first_ && inst <= this.last_;
            };
            InstanceLinearRange.prototype.makeIterator = function () {
                return new InstanceLinearIterator(this.first_, this.last_);
            };
            InstanceLinearRange.prototype.forEach = function (fn, thisObj) {
                var index = this.first_;
                var end = this.last_;
                if (index > 0) {
                    while (index <= end) {
                        fn.call(thisObj, index);
                        ++index;
                    }
                }
            };
            return InstanceLinearRange;
        }());
        world.InstanceLinearRange = InstanceLinearRange;
        var InstanceArrayIterator = (function () {
            function InstanceArrayIterator(array_) {
                this.array_ = array_;
                this.index_ = -1;
            }
            Object.defineProperty(InstanceArrayIterator.prototype, "current", {
                get: function () {
                    return this.array_[this.index_];
                },
                enumerable: true,
                configurable: true
            });
            InstanceArrayIterator.prototype.next = function () {
                this.index_ += 1;
                return this.index_ < this.array_.length;
            };
            return InstanceArrayIterator;
        }());
        var InstanceArrayRange = (function () {
            function InstanceArrayRange(array) {
                this.data_ = new sd.container.SortedArray(array);
            }
            Object.defineProperty(InstanceArrayRange.prototype, "empty", {
                get: function () {
                    return this.data_.length === 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(InstanceArrayRange.prototype, "front", {
                get: function () { return this.data_.array[0]; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(InstanceArrayRange.prototype, "back", {
                get: function () { return this.data_.array[this.data_.length - 1]; },
                enumerable: true,
                configurable: true
            });
            InstanceArrayRange.prototype.has = function (inst) {
                return this.data_.array.indexOf(inst) > -1;
            };
            InstanceArrayRange.prototype.makeIterator = function () {
                return new InstanceArrayIterator(this.data_.array);
            };
            InstanceArrayRange.prototype.forEach = function (fn, thisObj) {
                var index = 0;
                var end = this.data_.length;
                while (index < end) {
                    fn.call(thisObj, this.data_.array[index]);
                    ++index;
                }
            };
            return InstanceArrayRange;
        }());
        world.InstanceArrayRange = InstanceArrayRange;
        var InstanceSetIterator = (function () {
            function InstanceSetIterator(es6Iter) {
                this.es6Iter = es6Iter;
                this.current = 0;
            }
            InstanceSetIterator.prototype.next = function () {
                var res = this.es6Iter.next();
                this.current = res.value || 0;
                return !res.done;
            };
            return InstanceSetIterator;
        }());
        var InstanceSet = (function () {
            function InstanceSet() {
                this.data_ = new Set();
            }
            Object.defineProperty(InstanceSet.prototype, "count", {
                get: function () { return this.data_.size; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(InstanceSet.prototype, "empty", {
                get: function () { return this.data_.size == 0; },
                enumerable: true,
                configurable: true
            });
            InstanceSet.prototype.add = function (inst) {
                this.data_.add(inst);
            };
            InstanceSet.prototype.addRange = function (inst, count) {
                var index = inst;
                var upto = index + count;
                while (index < upto) {
                    this.data_.add(index);
                    ++index;
                }
            };
            InstanceSet.prototype.addArray = function (arr) {
                for (var ix = 0, end = arr.length; ix < end; ++ix) {
                    this.data_.add(arr[ix]);
                }
            };
            InstanceSet.prototype.remove = function (inst) {
                this.data_.delete(inst);
            };
            InstanceSet.prototype.removeRange = function (inst, count) {
                var index = inst;
                var upto = index + count;
                while (index < upto) {
                    this.data_.delete(index);
                    ++index;
                }
            };
            InstanceSet.prototype.removeArray = function (arr) {
                for (var ix = 0, end = arr.length; ix < end; ++ix) {
                    this.data_.delete(arr[ix]);
                }
            };
            InstanceSet.prototype.clear = function () {
                this.data_.clear();
            };
            InstanceSet.prototype.has = function (inst) {
                return this.data_.has(inst);
            };
            InstanceSet.prototype.makeIterator = function () {
                return new InstanceSetIterator(this.data_.values());
            };
            InstanceSet.prototype.forEach = function (fn, thisObj) {
                this.data_.forEach(fn, thisObj || this);
            };
            return InstanceSet;
        }());
        world.InstanceSet = InstanceSet;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var LUT_WIDTH = 640;
        var LUT_LIGHTDATA_ROWS = 256;
        var LUT_INDEXLIST_ROWS = 240;
        var LUT_GRID_ROWS = 16;
        var LUT_HEIGHT = LUT_LIGHTDATA_ROWS + LUT_INDEXLIST_ROWS + LUT_GRID_ROWS;
        var TILE_DIMENSION = 32;
        var MAX_LIGHTS = ((LUT_WIDTH * LUT_LIGHTDATA_ROWS) / 5) | 0;
        var LightManager = (function () {
            function LightManager(rc, transformMgr_) {
                this.rc = rc;
                this.transformMgr_ = transformMgr_;
                this.nullVec3_ = new Float32Array(3);
                this.shadowFBO_ = null;
                this.count_ = 0;
                var instFields = [
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.UInt8, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                ];
                this.instanceData_ = new sd.container.FixedMultiArray(MAX_LIGHTS, instFields);
                this.entityBase_ = this.instanceData_.indexedFieldView(0);
                this.transformBase_ = this.instanceData_.indexedFieldView(1);
                this.enabledBase_ = this.instanceData_.indexedFieldView(2);
                this.shadowTypeBase_ = this.instanceData_.indexedFieldView(3);
                this.shadowQualityBase_ = this.instanceData_.indexedFieldView(4);
                this.gridRowSpans_ = [];
                var lutFields = [
                    { type: sd.Float, count: 4 * LUT_LIGHTDATA_ROWS },
                    { type: sd.Float, count: 4 * LUT_INDEXLIST_ROWS },
                    { type: sd.Float, count: 4 * LUT_GRID_ROWS },
                ];
                this.lightData_ = new sd.container.FixedMultiArray(LUT_WIDTH, lutFields);
                this.globalLightData_ = this.lightData_.indexedFieldView(0);
                this.tileLightIndexes_ = this.lightData_.indexedFieldView(1);
                this.lightGrid_ = this.lightData_.indexedFieldView(2);
                var lutDesc = sd.render.makeTexDesc2DFloatLUT(new Float32Array(this.lightData_.data), LUT_WIDTH, LUT_HEIGHT);
                this.lutTexture_ = new sd.render.Texture(rc, lutDesc);
                sd.vec3.set(this.nullVec3_, 1, 0, 0);
            }
            LightManager.prototype.create = function (entity, desc) {
                sd.assert(this.count_ < MAX_LIGHTS, "light storage exhausted");
                this.count_ += 1;
                var instance = this.count_;
                sd.assert(desc.type != 0);
                this.entityBase_[instance] = entity;
                this.transformBase_[instance] = this.transformMgr_.forEntity(entity);
                this.enabledBase_[instance] = 1;
                this.shadowTypeBase_[instance] = desc.shadowType || 0;
                this.shadowQualityBase_[instance] = desc.shadowQuality || 0;
                var gldV4Index = instance * 5;
                sd.container.setIndexedVec4(this.globalLightData_, gldV4Index + 0, [desc.colour[0], desc.colour[1], desc.colour[2], desc.type]);
                sd.container.setIndexedVec4(this.globalLightData_, gldV4Index + 1, [0, 0, 0, Math.max(0, desc.intensity)]);
                sd.container.setIndexedVec4(this.globalLightData_, gldV4Index + 2, [0, 0, 0, desc.range || 0]);
                sd.container.setIndexedVec4(this.globalLightData_, gldV4Index + 3, [0, 0, 0, Math.cos(desc.cutoff || 0)]);
                sd.container.setIndexedVec4(this.globalLightData_, gldV4Index + 4, [desc.shadowStrength || 1.0, desc.shadowBias || 0.002, 0, 0]);
                return instance;
            };
            LightManager.prototype.destroy = function (_inst) {
            };
            LightManager.prototype.destroyRange = function (range) {
                var iter = range.makeIterator();
                while (iter.next()) {
                    this.destroy(iter.current);
                }
            };
            Object.defineProperty(LightManager.prototype, "count", {
                get: function () { return this.count_; },
                enumerable: true,
                configurable: true
            });
            LightManager.prototype.valid = function (inst) {
                return inst > 0 && inst <= this.count_;
            };
            LightManager.prototype.all = function () {
                return new world.InstanceLinearRange(1, this.count);
            };
            LightManager.prototype.allEnabled = function () {
                var on = [];
                var all = this.all().makeIterator();
                while (all.next()) {
                    var l = all.current;
                    if (this.enabledBase_[l]) {
                        on.push(all.current);
                    }
                }
                return new world.InstanceArrayRange(on);
            };
            LightManager.prototype.projectPointLight = function (outBounds, center, range, projectionViewportMatrix) {
                if (sd.vec3.length(center) <= range * 1.3) {
                    outBounds.left = 0;
                    outBounds.top = 5000;
                    outBounds.right = 5000;
                    outBounds.bottom = 0;
                    return;
                }
                var cx = center[0];
                var cy = center[1];
                var cz = center[2];
                var vertices = [
                    [cx - range, cy - range, cz - range, 1.0],
                    [cx - range, cy - range, cz + range, 1.0],
                    [cx - range, cy + range, cz - range, 1.0],
                    [cx - range, cy + range, cz + range, 1.0],
                    [cx + range, cy - range, cz - range, 1.0],
                    [cx + range, cy - range, cz + range, 1.0],
                    [cx + range, cy + range, cz - range, 1.0],
                    [cx + range, cy + range, cz + range, 1.0]
                ];
                var min = [100000, 100000];
                var max = [-100000, -100000];
                var sp = [0, 0, 0, 0];
                for (var vix = 0; vix < 8; ++vix) {
                    if (vertices[vix][2] <= 0.2) {
                        sd.vec4.transformMat4(sp, vertices[vix], projectionViewportMatrix);
                        sd.vec4.scale(sp, sp, 1.0 / sp[3]);
                        sd.vec2.min(min, min, sp);
                        sd.vec2.max(max, max, sp);
                    }
                }
                outBounds.left = min[0];
                outBounds.top = max[1];
                outBounds.right = max[0];
                outBounds.bottom = min[1];
            };
            LightManager.prototype.updateLightGrid = function (range, projection, viewport) {
                var vpHeight = this.rc.gl.drawingBufferHeight;
                var tilesWide = this.lutTilesWide;
                var tilesHigh = this.lutTilesHigh;
                for (var row = 0; row < tilesHigh; ++row) {
                    this.gridRowSpans_[row] = [];
                }
                var fullscreenLights = [];
                var ssb = { left: 0, top: 0, right: 0, bottom: 0 };
                var viewportMatrix = sd.math.viewportMatrix(viewport.originX, viewport.originY, viewport.width, viewport.height, viewport.nearZ, viewport.farZ);
                var VPP = sd.mat4.multiply([], viewportMatrix, projection.projectionMatrix);
                var iter = range.makeIterator();
                while (iter.next()) {
                    var lix = iter.current;
                    var lightType = this.type(lix);
                    if (lightType === 2) {
                        var lcpos = this.positionCameraSpace(lix);
                        var radius = this.range(lix);
                        this.projectPointLight(ssb, lcpos, radius, VPP);
                        var rowTop = Math.floor((vpHeight - ssb.top) / TILE_DIMENSION);
                        var rowBottom = Math.floor((vpHeight - ssb.bottom) / TILE_DIMENSION);
                        var colLeft = Math.floor(ssb.left / TILE_DIMENSION);
                        var colRight = Math.floor(ssb.right / TILE_DIMENSION);
                        if (rowTop < tilesHigh && rowBottom >= 0 && colLeft < tilesWide && colRight > 0) {
                            var rowFrom = sd.math.clamp(rowTop, 0, tilesHigh - 1);
                            var rowTo = sd.math.clamp(rowBottom, 0, tilesHigh - 1);
                            var colFrom = sd.math.clamp(colLeft, 0, tilesWide - 1);
                            var colTo = sd.math.clamp(colRight, 0, tilesWide - 1);
                            for (var row = rowFrom; row <= rowTo; ++row) {
                                this.gridRowSpans_[row].push({ lightIndex: lix, fromCol: colFrom, toCol: colTo });
                            }
                        }
                    }
                    else {
                        fullscreenLights.push(lix);
                    }
                }
                var cellLightIndexOffset = 0;
                var nextLightIndexOffset = 0;
                var cellGridOffset = 0;
                for (var row = 0; row < tilesHigh; ++row) {
                    var spans = this.gridRowSpans_[row];
                    for (var col = 0; col < tilesWide; ++col) {
                        for (var _i = 0, fullscreenLights_1 = fullscreenLights; _i < fullscreenLights_1.length; _i++) {
                            var fsLight = fullscreenLights_1[_i];
                            this.tileLightIndexes_[nextLightIndexOffset] = fsLight;
                            nextLightIndexOffset += 1;
                        }
                        for (var _a = 0, spans_1 = spans; _a < spans_1.length; _a++) {
                            var span = spans_1[_a];
                            if (span.fromCol <= col && span.toCol >= col) {
                                this.tileLightIndexes_[nextLightIndexOffset] = span.lightIndex;
                                nextLightIndexOffset += 1;
                            }
                        }
                        this.lightGrid_[cellGridOffset] = cellLightIndexOffset;
                        this.lightGrid_[cellGridOffset + 1] = nextLightIndexOffset - cellLightIndexOffset;
                        cellGridOffset += 2;
                        cellLightIndexOffset = nextLightIndexOffset;
                    }
                }
                return {
                    indexPixelsUsed: Math.ceil(nextLightIndexOffset / 4),
                    gridRowsUsed: Math.ceil((tilesWide * tilesHigh) / 2 / LUT_WIDTH)
                };
            };
            LightManager.prototype.prepareLightsForRender = function (range, proj, viewport) {
                var viewNormalMatrix = sd.mat3.normalFromMat4([], proj.viewMatrix);
                var highestLightIndex = 0;
                var iter = range.makeIterator();
                while (iter.next()) {
                    var lix = iter.current;
                    if (lix > highestLightIndex) {
                        highestLightIndex = lix;
                    }
                    var type = this.type(lix);
                    var transform = this.transformBase_[lix];
                    if (type != 1) {
                        var lightPos_world = this.transformMgr_.worldPosition(transform);
                        var lightPos_cam = sd.vec3.transformMat4([], lightPos_world, proj.viewMatrix);
                        var posCamOffset = (lix * 20) + 4;
                        this.globalLightData_[posCamOffset] = lightPos_cam[0];
                        this.globalLightData_[posCamOffset + 1] = lightPos_cam[1];
                        this.globalLightData_[posCamOffset + 2] = lightPos_cam[2];
                        var posWorldOffset = (lix * 20) + 8;
                        this.globalLightData_[posWorldOffset] = lightPos_world[0];
                        this.globalLightData_[posWorldOffset + 1] = lightPos_world[1];
                        this.globalLightData_[posWorldOffset + 2] = lightPos_world[2];
                    }
                    if (type != 2) {
                        var rotMat = sd.mat3.normalFromMat4([], this.transformMgr_.worldMatrix(transform));
                        var lightDir_world = sd.vec3.transformMat3([], this.nullVec3_, rotMat);
                        var lightDir_cam = sd.vec3.transformMat3([], lightDir_world, viewNormalMatrix);
                        var dirOffset = (lix * 20) + 12;
                        this.globalLightData_[dirOffset] = lightDir_cam[0];
                        this.globalLightData_[dirOffset + 1] = lightDir_cam[1];
                        this.globalLightData_[dirOffset + 2] = lightDir_cam[2];
                    }
                }
                var _a = this.updateLightGrid(range, proj, viewport), indexPixelsUsed = _a.indexPixelsUsed, gridRowsUsed = _a.gridRowsUsed;
                var gllRowsUsed = Math.ceil(highestLightIndex / LUT_WIDTH);
                var indexRowsUsed = Math.ceil(indexPixelsUsed / LUT_WIDTH);
                this.lutTexture_.bind();
                this.rc.gl.texSubImage2D(this.lutTexture_.target, 0, 0, 0, LUT_WIDTH, gllRowsUsed, this.rc.gl.RGBA, this.rc.gl.FLOAT, this.globalLightData_);
                this.rc.gl.texSubImage2D(this.lutTexture_.target, 0, 0, LUT_LIGHTDATA_ROWS, LUT_WIDTH, indexRowsUsed, this.rc.gl.RGBA, this.rc.gl.FLOAT, this.tileLightIndexes_);
                this.rc.gl.texSubImage2D(this.lutTexture_.target, 0, 0, LUT_LIGHTDATA_ROWS + LUT_INDEXLIST_ROWS, LUT_WIDTH, gridRowsUsed, this.rc.gl.RGBA, this.rc.gl.FLOAT, this.lightGrid_);
                this.lutTexture_.unbind();
            };
            Object.defineProperty(LightManager.prototype, "lutTexture", {
                get: function () {
                    return this.lutTexture_;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(LightManager.prototype, "lutTilesWide", {
                get: function () {
                    return Math.ceil(this.rc.gl.drawingBufferWidth / TILE_DIMENSION);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(LightManager.prototype, "lutTilesHigh", {
                get: function () {
                    return Math.ceil(this.rc.gl.drawingBufferHeight / TILE_DIMENSION);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(LightManager.prototype, "lutParam", {
                get: function () {
                    return new Float32Array([
                        this.lutTilesWide, this.rc.gl.drawingBufferHeight
                    ]);
                },
                enumerable: true,
                configurable: true
            });
            LightManager.prototype.entity = function (inst) {
                return this.entityBase_[inst];
            };
            LightManager.prototype.transform = function (inst) {
                return this.transformBase_[inst];
            };
            LightManager.prototype.enabled = function (inst) {
                return this.enabledBase_[inst] === 1;
            };
            LightManager.prototype.setEnabled = function (inst, newEnabled) {
                var newVal = +newEnabled;
                if (this.enabledBase_[inst] !== newVal) {
                    this.enabledBase_[inst] = newVal;
                }
            };
            LightManager.prototype.localPosition = function (inst) {
                return this.transformMgr_.localPosition(this.transformBase_[inst]);
            };
            LightManager.prototype.setLocalPosition = function (inst, newPosition) {
                this.transformMgr_.setPosition(this.transformBase_[inst], newPosition);
            };
            LightManager.prototype.worldPosition = function (inst) {
                return this.transformMgr_.worldPosition(this.transformBase_[inst]);
            };
            LightManager.prototype.direction = function (inst) {
                var rotMat = sd.mat3.normalFromMat4([], this.transformMgr_.worldMatrix(this.transformBase_[inst]));
                return sd.vec3.normalize([], sd.vec3.transformMat3([], this.nullVec3_, rotMat));
            };
            LightManager.prototype.setDirection = function (inst, newDirection) {
                var normalizedDir = sd.vec3.normalize([], newDirection);
                this.transformMgr_.setRotation(this.transformBase_[inst], sd.quat.rotationTo([], this.nullVec3_, normalizedDir));
            };
            LightManager.prototype.positionCameraSpace = function (inst) {
                var posCamOffset = (inst * 20) + 4;
                return this.globalLightData_.slice(posCamOffset, posCamOffset + 3);
            };
            LightManager.prototype.projectionSetupForLight = function (inst, viewportWidth, viewportHeight, nearZ) {
                var transform = this.transformBase_[inst];
                var worldPos = this.transformMgr_.worldPosition(transform);
                var worldDirection = this.direction(inst);
                var worldTarget = sd.vec3.add([], worldPos, worldDirection);
                var viewMatrix;
                var projectionMatrix;
                var type = this.type(inst);
                if (type == 3) {
                    var farZ = this.range(inst);
                    var fov = this.cutoff(inst) * 2;
                    viewMatrix = sd.mat4.lookAt(new Float32Array(16), worldPos, worldTarget, [0, 1, 0]);
                    projectionMatrix = sd.mat4.perspective(new Float32Array(16), fov, viewportWidth / viewportHeight, nearZ, farZ);
                }
                else if (type == 1) {
                    viewMatrix = sd.mat4.lookAt(new Float32Array(16), [0, 0, 0], worldDirection, [0, 1, 0]);
                    projectionMatrix = sd.mat4.ortho(new Float32Array(16), -40, 40, -40, 40, -40, 40);
                }
                else {
                    return null;
                }
                return {
                    projectionMatrix: projectionMatrix,
                    viewMatrix: viewMatrix
                };
            };
            LightManager.prototype.shadowFrameBufferOfQuality = function (rc, _quality) {
                if (!this.shadowFBO_) {
                    this.shadowFBO_ = sd.render.makeShadowMapFrameBuffer(rc, 1024);
                }
                return this.shadowFBO_;
            };
            LightManager.prototype.shadowViewForLight = function (rc, inst, nearZ) {
                var fbo = this.shadowFrameBufferOfQuality(rc, this.shadowQualityBase_[inst]);
                var projection = this.projectionSetupForLight(inst, fbo.width, fbo.height, nearZ);
                return projection && {
                    light: inst,
                    lightProjection: projection,
                    shadowFBO: fbo
                };
            };
            LightManager.prototype.type = function (inst) {
                var offset = (inst * 20) + 3;
                return this.globalLightData_[offset];
            };
            LightManager.prototype.colour = function (inst) {
                var v4Index = (inst * 5) + 0;
                return sd.container.copyIndexedVec4(this.globalLightData_, v4Index).slice(0, 3);
            };
            LightManager.prototype.setColour = function (inst, newColour) {
                var offset = inst * 20;
                this.globalLightData_[offset] = newColour[0];
                this.globalLightData_[offset + 1] = newColour[1];
                this.globalLightData_[offset + 2] = newColour[2];
            };
            LightManager.prototype.intensity = function (inst) {
                var offset = (inst * 20) + 7;
                return this.globalLightData_[offset];
            };
            LightManager.prototype.setIntensity = function (inst, newIntensity) {
                var offset = (inst * 20) + 7;
                this.globalLightData_[offset] = newIntensity;
            };
            LightManager.prototype.range = function (inst) {
                var offset = (inst * 20) + 11;
                return this.globalLightData_[offset];
            };
            LightManager.prototype.setRange = function (inst, newRange) {
                var offset = (inst * 20) + 11;
                this.globalLightData_[offset] = newRange;
            };
            LightManager.prototype.cutoff = function (inst) {
                var offset = (inst * 20) + 15;
                return Math.acos(this.globalLightData_[offset]);
            };
            LightManager.prototype.setCutoff = function (inst, newCutoff) {
                var offset = (inst * 20) + 15;
                this.globalLightData_[offset] = Math.cos(newCutoff);
            };
            LightManager.prototype.shadowType = function (inst) {
                return this.shadowTypeBase_[inst];
            };
            LightManager.prototype.setShadowType = function (inst, newType) {
                this.shadowTypeBase_[inst] = newType;
            };
            LightManager.prototype.shadowQuality = function (inst) {
                return this.shadowQualityBase_[inst];
            };
            LightManager.prototype.setShadowQuality = function (inst, newQuality) {
                this.shadowQualityBase_[inst] = newQuality;
            };
            LightManager.prototype.shadowStrength = function (inst) {
                var offset = (inst * 20) + 16;
                return this.globalLightData_[offset];
            };
            LightManager.prototype.setShadowStrength = function (inst, newStrength) {
                var offset = (inst * 20) + 16;
                this.globalLightData_[offset] = newStrength;
            };
            LightManager.prototype.shadowBias = function (inst) {
                var offset = (inst * 20) + 17;
                return this.globalLightData_[offset];
            };
            LightManager.prototype.setShadowBias = function (inst, newBias) {
                var offset = (inst * 20) + 17;
                this.globalLightData_[offset] = newBias;
            };
            return LightManager;
        }());
        world.LightManager = LightManager;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        function glTypeForVertexField(rc, vf) {
            switch (vf) {
                case 21:
                case 22:
                case 23:
                case 24:
                    return rc.gl.FLOAT;
                case 13:
                case 14:
                case 15:
                case 16:
                    return rc.gl.UNSIGNED_INT;
                case 17:
                case 18:
                case 19:
                case 20:
                    return rc.gl.INT;
                case 7:
                case 135:
                case 8:
                case 136:
                case 9:
                case 137:
                    return rc.gl.UNSIGNED_SHORT;
                case 10:
                case 138:
                case 11:
                case 139:
                case 12:
                case 140:
                    return rc.gl.SHORT;
                case 1:
                case 129:
                case 2:
                case 130:
                case 3:
                case 131:
                    return rc.gl.UNSIGNED_BYTE;
                case 4:
                case 132:
                case 5:
                case 133:
                case 6:
                case 134:
                    return rc.gl.BYTE;
                default:
                    sd.assert(false, "Invalid mesh.VertexField");
                    return rc.gl.NONE;
            }
        }
        var MeshManager = (function () {
            function MeshManager(rctx_) {
                this.rctx_ = rctx_;
                this.pipelineVAOMaps_ = null;
                var instanceFields = [
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 2 },
                    { type: sd.SInt32, count: 2 },
                    { type: sd.SInt32, count: 2 },
                ];
                this.instanceData_ = new sd.container.MultiArrayBuffer(1024, instanceFields);
                this.rebaseInstances();
                var attrFields = [
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                ];
                this.attributeData_ = new sd.container.MultiArrayBuffer(4096, attrFields);
                this.rebaseAttributes();
                var pgFields = [
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                ];
                this.primGroupData_ = new sd.container.MultiArrayBuffer(4096, pgFields);
                this.rebasePrimGroups();
                this.bufGLBuffers_ = [];
                this.entityMap_ = new Map();
                this.assetMeshMap_ = new WeakMap();
                if (rctx_.extVAO) {
                    this.pipelineVAOMaps_ = [];
                }
            }
            MeshManager.prototype.rebaseInstances = function () {
                this.featuresBase_ = this.instanceData_.indexedFieldView(0);
                this.indexElementTypeBase_ = this.instanceData_.indexedFieldView(1);
                this.uniformPrimTypeBase_ = this.instanceData_.indexedFieldView(2);
                this.totalElementCountBase_ = this.instanceData_.indexedFieldView(3);
                this.buffersOffsetCountBase_ = this.instanceData_.indexedFieldView(4);
                this.attrsOffsetCountBase_ = this.instanceData_.indexedFieldView(5);
                this.primGroupsOffsetCountBase_ = this.instanceData_.indexedFieldView(6);
            };
            MeshManager.prototype.rebaseAttributes = function () {
                this.attrRoleBase_ = this.attributeData_.indexedFieldView(0);
                this.attrBufferIndexBase_ = this.attributeData_.indexedFieldView(1);
                this.attrVertexFieldBase_ = this.attributeData_.indexedFieldView(2);
                this.attrFieldOffsetBase_ = this.attributeData_.indexedFieldView(3);
                this.attrStrideBase_ = this.attributeData_.indexedFieldView(4);
            };
            MeshManager.prototype.rebasePrimGroups = function () {
                this.pgPrimTypeBase_ = this.primGroupData_.indexedFieldView(0);
                this.pgFromElementBase_ = this.primGroupData_.indexedFieldView(1);
                this.pgElementCountBase_ = this.primGroupData_.indexedFieldView(2);
                this.pgMaterialBase_ = this.primGroupData_.indexedFieldView(3);
            };
            MeshManager.prototype.create = function (mesh) {
                if (this.assetMeshMap_.has(mesh)) {
                    return this.assetMeshMap_.get(mesh);
                }
                var meshData = mesh.meshData;
                var gl = this.rctx_.gl;
                if (this.instanceData_.extend() == 1) {
                    this.rebaseInstances();
                }
                var instance = this.instanceData_.count;
                var meshFeatures = 0;
                var bufferCount = meshData.vertexBuffers.length + (meshData.indexBuffer !== null ? 1 : 0);
                var bufferIndex = this.bufGLBuffers_.length;
                sd.container.setIndexedVec2(this.buffersOffsetCountBase_, instance, [bufferIndex, bufferCount]);
                var attrCount = meshData.vertexBuffers.map(function (vb) { return vb.attributeCount; }).reduce(function (sum, vbac) { return sum + vbac; }, 0);
                var attrIndex = this.attributeData_.count;
                if (this.attributeData_.resize(attrIndex + attrCount) === 1) {
                    this.rebaseAttributes();
                }
                sd.container.setIndexedVec2(this.attrsOffsetCountBase_, instance, [attrIndex, attrCount]);
                for (var _i = 0, _a = meshData.vertexBuffers; _i < _a.length; _i++) {
                    var vertexBuffer = _a[_i];
                    var glBuf = gl.createBuffer();
                    gl.bindBuffer(gl.ARRAY_BUFFER, glBuf);
                    gl.bufferData(gl.ARRAY_BUFFER, vertexBuffer.bufferView(), gl.STATIC_DRAW);
                    this.bufGLBuffers_[bufferIndex] = glBuf;
                    for (var aix = 0; aix < vertexBuffer.attributeCount; ++aix) {
                        var attr = vertexBuffer.attrByIndex(aix);
                        this.attrRoleBase_[attrIndex] = attr.role;
                        this.attrBufferIndexBase_[attrIndex] = bufferIndex;
                        this.attrVertexFieldBase_[attrIndex] = attr.field;
                        this.attrFieldOffsetBase_[attrIndex] = attr.offset;
                        this.attrStrideBase_[attrIndex] = vertexBuffer.strideBytes;
                        switch (attr.role) {
                            case 1:
                                meshFeatures |= 1;
                                break;
                            case 2:
                                meshFeatures |= 2;
                                break;
                            case 3:
                                meshFeatures |= 4;
                                break;
                            case 6:
                                meshFeatures |= 8;
                                break;
                            case 4:
                                meshFeatures |= 16;
                                break;
                            case 10:
                                meshFeatures |= 32;
                                break;
                            default: break;
                        }
                        attrIndex += 1;
                    }
                    bufferIndex += 1;
                }
                if (meshData.indexBuffer) {
                    var glBuf = gl.createBuffer();
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glBuf);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, meshData.indexBuffer.bufferView(), gl.STATIC_DRAW);
                    this.bufGLBuffers_[bufferIndex] = glBuf;
                    meshFeatures |= 64;
                    this.indexElementTypeBase_[instance] = meshData.indexBuffer.indexElementType;
                    bufferIndex += 1;
                }
                else {
                    this.indexElementTypeBase_[instance] = 0;
                }
                var primGroupCount = meshData.primitiveGroups.length;
                sd.assert(primGroupCount > 0, "No primitive groups present in meshData");
                var primGroupIndex = this.primGroupData_.count;
                if (this.primGroupData_.resize(primGroupIndex + primGroupCount) === 1) {
                    this.rebasePrimGroups();
                }
                sd.container.setIndexedVec2(this.primGroupsOffsetCountBase_, instance, [primGroupIndex, primGroupCount]);
                var totalElementCount = 0;
                var sharedPrimType = meshData.primitiveGroups[0].type;
                for (var _b = 0, _c = meshData.primitiveGroups; _b < _c.length; _b++) {
                    var pg = _c[_b];
                    this.pgPrimTypeBase_[primGroupIndex] = pg.type;
                    this.pgFromElementBase_[primGroupIndex] = pg.fromElement;
                    this.pgElementCountBase_[primGroupIndex] = pg.elementCount;
                    this.pgMaterialBase_[primGroupIndex] = pg.materialIx;
                    totalElementCount += pg.elementCount;
                    if (pg.type !== sharedPrimType) {
                        sharedPrimType = 0;
                    }
                    primGroupIndex += 1;
                }
                this.featuresBase_[instance] = meshFeatures;
                this.uniformPrimTypeBase_[instance] = sharedPrimType;
                this.totalElementCountBase_[instance] = totalElementCount;
                if (this.pipelineVAOMaps_) {
                    this.pipelineVAOMaps_[instance] = new WeakMap();
                }
                this.assetMeshMap_.set(mesh, instance);
                return instance;
            };
            MeshManager.prototype.linkToEntity = function (inst, ent) {
                this.entityMap_.set(ent, inst);
            };
            MeshManager.prototype.removeFromEntity = function (_inst, ent) {
                this.entityMap_.delete(ent);
            };
            MeshManager.prototype.forEntity = function (ent) {
                return this.entityMap_.get(ent) || 0;
            };
            MeshManager.prototype.destroy = function (_inst) {
            };
            MeshManager.prototype.destroyRange = function (range) {
                var iter = range.makeIterator();
                while (iter.next()) {
                    this.destroy(iter.current);
                }
            };
            Object.defineProperty(MeshManager.prototype, "count", {
                get: function () { return this.instanceData_.count; },
                enumerable: true,
                configurable: true
            });
            MeshManager.prototype.valid = function (inst) {
                return inst <= this.count;
            };
            MeshManager.prototype.all = function () {
                return new world.InstanceLinearRange(1, this.count);
            };
            MeshManager.prototype.bindSingleAttribute = function (attr, toVAIndex) {
                var elementCount = sd.meshdata.vertexFieldElementCount(attr.vertexField);
                var normalized = sd.meshdata.vertexFieldIsNormalized(attr.vertexField);
                var glElementType = glTypeForVertexField(this.rctx_, attr.vertexField);
                this.rctx_.gl.enableVertexAttribArray(toVAIndex);
                this.rctx_.gl.vertexAttribPointer(toVAIndex, elementCount, glElementType, normalized, attr.stride, attr.offset);
            };
            MeshManager.prototype.bind = function (inst, toPipeline) {
                var meshIx = inst;
                var gl = this.rctx_.gl;
                var plVAO;
                var needBinding = true;
                if (this.pipelineVAOMaps_) {
                    plVAO = this.pipelineVAOMaps_[meshIx].get(toPipeline);
                    if (plVAO) {
                        needBinding = false;
                    }
                    else {
                        plVAO = this.rctx_.extVAO.createVertexArrayOES();
                        this.pipelineVAOMaps_[meshIx].set(toPipeline, plVAO);
                    }
                    this.rctx_.extVAO.bindVertexArrayOES(plVAO || null);
                }
                if (needBinding) {
                    var roleIndexes = toPipeline.attributePairs();
                    var attributes = this.attributes(inst);
                    var pair = roleIndexes.next();
                    while (!pair.done) {
                        var _a = pair.value, attrRole = _a[0], attrIndex = _a[1];
                        var meshAttr = attributes.get(attrRole);
                        if (meshAttr) {
                            gl.bindBuffer(gl.ARRAY_BUFFER, meshAttr.buffer);
                            this.bindSingleAttribute(meshAttr, attrIndex);
                        }
                        else {
                            console.warn("Mesh does not have Pipeline attr for index " + attrIndex + " of role " + attrRole);
                            gl.disableVertexAttribArray(attrIndex);
                        }
                        pair = roleIndexes.next();
                    }
                    if (this.featuresBase_[meshIx] & 64) {
                        var bufOC = sd.container.copyIndexedVec2(this.buffersOffsetCountBase_, meshIx);
                        var indexBuffer = this.bufGLBuffers_[bufOC[0] + bufOC[1] - 1];
                        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                    }
                }
            };
            MeshManager.prototype.unbind = function (_inst, fromPipeline) {
                if (this.pipelineVAOMaps_) {
                    this.rctx_.extVAO.bindVertexArrayOES(null);
                }
                else {
                    var gl = this.rctx_.gl;
                    var roleIndexes = fromPipeline.attributePairs();
                    var pair = roleIndexes.next();
                    while (!pair.done) {
                        var attrIndex = pair.value[1];
                        gl.disableVertexAttribArray(attrIndex);
                        pair = roleIndexes.next();
                    }
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
                }
            };
            MeshManager.prototype.attributes = function (inst) {
                var attrs = new Map();
                var meshIx = inst;
                var offsetCount = sd.container.copyIndexedVec2(this.attrsOffsetCountBase_, meshIx);
                for (var aix = 0; aix < offsetCount[1]; ++aix) {
                    var attrOffset = aix + offsetCount[0];
                    attrs.set(this.attrRoleBase_[attrOffset], {
                        buffer: this.bufGLBuffers_[this.attrBufferIndexBase_[attrOffset]],
                        vertexField: this.attrVertexFieldBase_[attrOffset],
                        offset: this.attrFieldOffsetBase_[attrOffset],
                        stride: this.attrStrideBase_[attrOffset]
                    });
                }
                return attrs;
            };
            MeshManager.prototype.primitiveGroups = function (inst) {
                var primGroups = [];
                var meshIx = inst;
                var offsetCount = sd.container.copyIndexedVec2(this.primGroupsOffsetCountBase_, meshIx);
                for (var pgix = 0; pgix < offsetCount[1]; ++pgix) {
                    var pgOffset = pgix + offsetCount[0];
                    primGroups.push({
                        type: this.pgPrimTypeBase_[pgOffset],
                        fromElement: this.pgFromElementBase_[pgOffset],
                        elementCount: this.pgElementCountBase_[pgOffset],
                        materialIx: this.pgMaterialBase_[pgOffset]
                    });
                }
                return primGroups;
            };
            MeshManager.prototype.features = function (inst) { return this.featuresBase_[inst]; };
            MeshManager.prototype.indexBufferElementType = function (inst) { return this.indexElementTypeBase_[inst]; };
            MeshManager.prototype.uniformPrimitiveType = function (inst) { return this.uniformPrimTypeBase_[inst]; };
            MeshManager.prototype.totalElementCount = function (inst) { return this.totalElementCountBase_[inst]; };
            return MeshManager;
        }());
        world.MeshManager = MeshManager;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var PBRMaterialManager = (function () {
            function PBRMaterialManager() {
                this.albedoMaps_ = [];
                this.materialMaps_ = [];
                this.normalHeightMaps_ = [];
                this.alphaMaps_ = [];
                this.tempVec4 = new Float32Array(4);
                var initialCapacity = 256;
                var fields = [
                    { type: sd.Float, count: 4 },
                    { type: sd.Float, count: 4 },
                    { type: sd.Float, count: 4 },
                    { type: sd.Float, count: 4 },
                    { type: sd.Float, count: 1 },
                    { type: sd.SInt32, count: 1 },
                ];
                this.instanceData_ = new sd.container.MultiArrayBuffer(initialCapacity, fields);
                this.rebase();
            }
            PBRMaterialManager.prototype.rebase = function () {
                this.baseColourBase_ = this.instanceData_.indexedFieldView(0);
                this.materialBase_ = this.instanceData_.indexedFieldView(1);
                this.emissiveBase_ = this.instanceData_.indexedFieldView(2);
                this.texScaleOffsetBase_ = this.instanceData_.indexedFieldView(3);
                this.opacityBase_ = this.instanceData_.indexedFieldView(4);
                this.flagsBase_ = this.instanceData_.indexedFieldView(5);
            };
            PBRMaterialManager.prototype.create = function (desc) {
                if (this.instanceData_.extend() == 1) {
                    this.rebase();
                }
                var matIndex = this.instanceData_.count;
                sd.vec4.set(this.tempVec4, desc.baseColour[0], desc.baseColour[1], desc.baseColour[2], 0);
                sd.container.setIndexedVec4(this.baseColourBase_, matIndex, this.tempVec4);
                sd.vec4.set(this.tempVec4, sd.math.clamp01(desc.roughness), sd.math.clamp01(desc.metallic), 0, 0);
                sd.container.setIndexedVec4(this.materialBase_, matIndex, this.tempVec4);
                sd.vec4.set(this.tempVec4, desc.emissiveColour[0], desc.emissiveColour[1], desc.emissiveColour[2], desc.emissiveIntensity);
                sd.container.setIndexedVec4(this.emissiveBase_, matIndex, this.tempVec4);
                sd.vec4.set(this.tempVec4, desc.textureScale[0], desc.textureScale[1], desc.textureOffset[0], desc.textureOffset[1]);
                sd.container.setIndexedVec4(this.texScaleOffsetBase_, matIndex, this.tempVec4);
                var flags = 0;
                if (desc.flags & 2) {
                    flags |= 2;
                }
                if (desc.roughnessTexture) {
                    flags |= 4;
                }
                if (desc.metallicTexture) {
                    flags |= 8;
                }
                if (desc.ambientOcclusionTexture) {
                    flags |= 16;
                }
                if (desc.normalTexture) {
                    flags |= 64;
                }
                if (desc.heightTexture) {
                    flags |= 128;
                }
                this.flagsBase_[matIndex] = flags;
                this.albedoMaps_[matIndex] = desc.albedoTexture ? desc.albedoTexture.texture : null;
                this.materialMaps_[matIndex] = desc.roughnessTexture ? desc.roughnessTexture.texture : null;
                this.normalHeightMaps_[matIndex] = desc.normalTexture ? desc.normalTexture.texture : null;
                this.alphaMaps_[matIndex] = desc.transparencyTexture ? desc.transparencyTexture.texture : null;
                this.opacityBase_[matIndex] = 1.0;
                return matIndex;
            };
            PBRMaterialManager.prototype.destroy = function (inst) {
                var matIndex = inst;
                var zero4 = sd.vec4.zero();
                sd.container.setIndexedVec4(this.baseColourBase_, matIndex, zero4);
                sd.container.setIndexedVec4(this.materialBase_, matIndex, zero4);
                sd.container.setIndexedVec4(this.texScaleOffsetBase_, matIndex, zero4);
                this.flagsBase_[matIndex] = 0;
                this.opacityBase_[matIndex] = 0;
                this.albedoMaps_[matIndex] = null;
                this.materialMaps_[matIndex] = null;
                this.normalHeightMaps_[matIndex] = null;
            };
            PBRMaterialManager.prototype.destroyRange = function (range) {
                var iter = range.makeIterator();
                while (iter.next()) {
                    this.destroy(iter.current);
                }
            };
            Object.defineProperty(PBRMaterialManager.prototype, "count", {
                get: function () { return this.instanceData_.count; },
                enumerable: true,
                configurable: true
            });
            PBRMaterialManager.prototype.valid = function (inst) {
                return inst <= this.count;
            };
            PBRMaterialManager.prototype.all = function () {
                return new world.InstanceLinearRange(1, this.count);
            };
            PBRMaterialManager.prototype.baseColour = function (inst) {
                var offset = inst * 4;
                return [
                    this.baseColourBase_[offset],
                    this.baseColourBase_[offset + 1],
                    this.baseColourBase_[offset + 2]
                ];
            };
            PBRMaterialManager.prototype.setBaseColour = function (inst, newColour) {
                var offset = inst * 4;
                this.baseColourBase_[offset] = newColour[0];
                this.baseColourBase_[offset + 1] = newColour[1];
                this.baseColourBase_[offset + 2] = newColour[2];
            };
            PBRMaterialManager.prototype.emissiveColour = function (inst) {
                var offset = inst * 4;
                return [
                    this.emissiveBase_[offset],
                    this.emissiveBase_[offset + 1],
                    this.emissiveBase_[offset + 2]
                ];
            };
            PBRMaterialManager.prototype.setEmissiveColour = function (inst, newColour) {
                var offset = inst * 4;
                this.emissiveBase_[offset] = newColour[0];
                this.emissiveBase_[offset + 1] = newColour[1];
                this.emissiveBase_[offset + 2] = newColour[2];
            };
            PBRMaterialManager.prototype.emissiveIntensity = function (inst) {
                var offset = (inst * 4) + 3;
                return this.emissiveBase_[offset];
            };
            PBRMaterialManager.prototype.setEmissiveIntensity = function (inst, newIntensity) {
                var offset = (inst * 4) + 3;
                this.emissiveBase_[offset] = newIntensity;
            };
            PBRMaterialManager.prototype.metallic = function (inst) {
                sd.assert(0 === (this.flagsBase_[inst] & 1), "Material must be in metallic setup");
                return this.materialBase_[(inst * 4) + 1];
            };
            PBRMaterialManager.prototype.setMetallic = function (inst, newMetallic) {
                sd.assert(0 === (this.flagsBase_[inst] & 1), "Material must be in metallic setup");
                this.materialBase_[(inst * 4) + 1] = sd.math.clamp01(newMetallic);
            };
            PBRMaterialManager.prototype.roughness = function (inst) {
                return this.materialBase_[(inst * 4) + 0];
            };
            PBRMaterialManager.prototype.setRoughness = function (inst, newRoughness) {
                this.materialBase_[(inst * 4) + 0] = sd.math.clamp01(newRoughness);
            };
            PBRMaterialManager.prototype.smoothness = function (inst) {
                return 1.0 - this.materialBase_[(inst * 4) + 0];
            };
            PBRMaterialManager.prototype.setSmoothness = function (inst, newSmoothness) {
                this.materialBase_[(inst * 4) + 0] = 1.0 - sd.math.clamp01(newSmoothness);
            };
            PBRMaterialManager.prototype.opacity = function (inst) {
                return this.opacityBase_[inst];
            };
            PBRMaterialManager.prototype.setOpacity = function (inst, newOpacity) {
                this.opacityBase_[inst] = newOpacity;
            };
            PBRMaterialManager.prototype.textureScale = function (inst) {
                var offset = inst * 4;
                return [this.texScaleOffsetBase_[offset], this.texScaleOffsetBase_[offset + 1]];
            };
            PBRMaterialManager.prototype.setTextureScale = function (inst, newScale) {
                var offset = inst * 4;
                this.texScaleOffsetBase_[offset] = newScale[0];
                this.texScaleOffsetBase_[offset + 1] = newScale[1];
            };
            PBRMaterialManager.prototype.textureOffset = function (inst) {
                var offset = inst * 4;
                return [this.texScaleOffsetBase_[offset + 2], this.texScaleOffsetBase_[offset + 3]];
            };
            PBRMaterialManager.prototype.setTextureOffset = function (inst, newOffset) {
                var offset = inst * 4;
                this.texScaleOffsetBase_[offset + 2] = newOffset[0];
                this.texScaleOffsetBase_[offset + 3] = newOffset[1];
            };
            PBRMaterialManager.prototype.albedoMap = function (inst) {
                return this.albedoMaps_[inst];
            };
            PBRMaterialManager.prototype.setAlbedoMap = function (inst, newTex) {
                this.albedoMaps_[inst] = newTex;
            };
            PBRMaterialManager.prototype.materialMap = function (inst) {
                return this.materialMaps_[inst];
            };
            PBRMaterialManager.prototype.normalHeightMap = function (inst) {
                return this.normalHeightMaps_[inst];
            };
            PBRMaterialManager.prototype.alphaMap = function (inst) {
                return this.alphaMaps_[inst];
            };
            PBRMaterialManager.prototype.flags = function (inst) {
                return this.flagsBase_[inst];
            };
            PBRMaterialManager.prototype.getData = function (inst) {
                var matIndex = inst;
                var colourOpacity = new Float32Array(sd.container.copyIndexedVec4(this.baseColourBase_, matIndex));
                colourOpacity[3] = this.opacityBase_[matIndex];
                return {
                    colourData: colourOpacity,
                    materialParam: sd.container.refIndexedVec4(this.materialBase_, matIndex),
                    emissiveData: sd.container.refIndexedVec4(this.emissiveBase_, matIndex),
                    texScaleOffsetData: sd.container.refIndexedVec4(this.texScaleOffsetBase_, matIndex),
                    albedoMap: this.albedoMaps_[matIndex],
                    materialMap: this.materialMaps_[matIndex],
                    normalHeightMap: this.normalHeightMaps_[matIndex],
                    alphaMap: this.alphaMaps_[matIndex],
                    flags: this.flagsBase_[matIndex]
                };
            };
            return PBRMaterialManager;
        }());
        world.PBRMaterialManager = PBRMaterialManager;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var LightingQualityBitShift = 2;
        var PBRPipeline = (function () {
            function PBRPipeline(rc) {
                this.rc = rc;
                this.cachedPipelines_ = new Map();
                this.shadowPipeline_ = null;
                this.featureMask_ = 0x7fffffff;
                this.shadowVertexSource = "\n\t\t\tattribute vec3 vertexPos_model;\n\n\t\t\tvarying vec4 vertexPos_world;\n\n\t\t\tuniform mat4 modelMatrix;\n\t\t\tuniform mat4 lightViewProjectionMatrix;\n\n\t\t\tvoid main() {\n\t\t\t\tvertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);\n\t\t\t\tgl_Position = lightViewProjectionMatrix * vertexPos_world;\n\t\t\t}\n\t\t".trim();
                this.shadowFragmentSource = "\n\t\t\t#extension GL_OES_standard_derivatives : enable\n\t\t\tprecision highp float;\n\n\t\t\tvarying vec4 vertexPos_world;\n\n\t\t\tuniform mat4 lightViewMatrix;\n\n\t\t\tvoid main() {\n\t\t\t\tvec3 lightPos = (lightViewMatrix * vertexPos_world).xyz;\n\t\t\t\tfloat depth = clamp(length(lightPos) / 12.0, 0.0, 1.0);\n\t\t\t\tfloat dx = dFdx(depth);\n\t\t\t\tfloat dy = dFdy(depth);\n\t\t\t\tgl_FragColor = vec4(depth, depth * depth + 0.25 * (dx * dy + dy * dy), 0.0, 1.0);\n\t\t\t}\n\t\t".trim();
            }
            PBRPipeline.prototype.disableFeatures = function (disableMask) {
                this.featureMask_ &= ~disableMask;
            };
            PBRPipeline.prototype.enableFeatures = function (enableMask) {
                this.featureMask_ |= enableMask;
            };
            PBRPipeline.prototype.enableAllFeatures = function () {
                this.featureMask_ = 0x7fffffff;
            };
            PBRPipeline.prototype.pipelineForFeatures = function (feat) {
                feat &= this.featureMask_;
                var cached = this.cachedPipelines_.get(feat);
                if (cached) {
                    return cached;
                }
                var gl = this.rc.gl;
                var vertexSource = this.vertexShaderSource(feat);
                var fragmentSource = this.fragmentShaderSource(feat);
                var pld = sd.render.makePipelineDescriptor();
                pld.vertexShader = sd.render.makeShader(this.rc, gl.VERTEX_SHADER, vertexSource);
                pld.fragmentShader = sd.render.makeShader(this.rc, gl.FRAGMENT_SHADER, fragmentSource);
                pld.attributeNames.set(2, "vertexNormal");
                pld.attributeNames.set(1, "vertexPos_model");
                if (feat & 2) {
                    pld.attributeNames.set(4, "vertexColour");
                }
                if (feat & 1) {
                    pld.attributeNames.set(6, "vertexUV");
                }
                var pipeline = new sd.render.Pipeline(this.rc, pld);
                var program = pipeline.program;
                gl.useProgram(program);
                program.modelMatrixUniform = gl.getUniformLocation(program, "modelMatrix");
                program.mvMatrixUniform = gl.getUniformLocation(program, "modelViewMatrix");
                program.mvpMatrixUniform = gl.getUniformLocation(program, "modelViewProjectionMatrix");
                program.normalMatrixUniform = gl.getUniformLocation(program, "normalMatrix");
                program.baseColourUniform = gl.getUniformLocation(program, "baseColour");
                program.emissiveDataUniform = gl.getUniformLocation(program, "emissiveData");
                program.materialUniform = gl.getUniformLocation(program, "materialParam");
                program.texScaleOffsetUniform = gl.getUniformLocation(program, "texScaleOffset");
                if (feat & 32) {
                    var albedo = gl.getUniformLocation(program, "albedoMap");
                    if (albedo) {
                        program.albedoMapUniform = albedo;
                        gl.uniform1i(program.albedoMapUniform, 0);
                    }
                }
                if (feat & (128 | 64 | 256)) {
                    var material = gl.getUniformLocation(program, "materialMap");
                    if (material) {
                        program.materialMapUniform = material;
                        gl.uniform1i(program.materialMapUniform, 1);
                    }
                }
                if (feat & (1024 | 2048)) {
                    var normalHeight = gl.getUniformLocation(program, "normalHeightMap");
                    if (normalHeight) {
                        program.normalHeightMapUniform = normalHeight;
                        gl.uniform1i(program.normalHeightMapUniform, 2);
                    }
                }
                if (feat & 512) {
                    var alpha = gl.getUniformLocation(program, "alphaMap");
                    if (alpha) {
                        program.alphaMapUniform = alpha;
                        gl.uniform1i(program.alphaMapUniform, 3);
                    }
                }
                var environment = gl.getUniformLocation(program, "environmentMap");
                if (environment) {
                    program.environmentMapUniform = environment;
                    gl.uniform1i(program.environmentMapUniform, 4);
                }
                var brdfLookup = gl.getUniformLocation(program, "brdfLookupMap");
                if (brdfLookup) {
                    program.brdfLookupMapUniform = brdfLookup;
                    gl.uniform1i(program.brdfLookupMapUniform, 5);
                }
                program.lightLUTUniform = gl.getUniformLocation(program, "lightLUTSampler");
                if (program.lightLUTUniform) {
                    gl.uniform1i(program.lightLUTUniform, 6);
                }
                program.lightLUTParamUniform = gl.getUniformLocation(program, "lightLUTParam");
                program.shadowCastingLightIndexUniform = gl.getUniformLocation(program, "shadowCastingLightIndex");
                if (program.shadowCastingLightIndexUniform) {
                    gl.uniform1i(program.shadowCastingLightIndexUniform, -1);
                }
                program.shadowMapUniform = gl.getUniformLocation(program, "shadowSampler");
                if (program.shadowMapUniform) {
                    gl.uniform1i(program.shadowMapUniform, 7);
                }
                program.lightProjMatrixUniform = gl.getUniformLocation(program, "lightProjMatrix");
                program.lightViewMatrixUniform = gl.getUniformLocation(program, "lightViewMatrix");
                gl.useProgram(null);
                this.cachedPipelines_.set(feat, pipeline);
                return pipeline;
            };
            PBRPipeline.prototype.shadowPipeline = function () {
                if (this.shadowPipeline_ == null) {
                    var pld = sd.render.makePipelineDescriptor();
                    pld.vertexShader = sd.render.makeShader(this.rc, this.rc.gl.VERTEX_SHADER, this.shadowVertexSource);
                    pld.fragmentShader = sd.render.makeShader(this.rc, this.rc.gl.FRAGMENT_SHADER, this.shadowFragmentSource);
                    pld.attributeNames.set(1, "vertexPos_model");
                    this.shadowPipeline_ = new sd.render.Pipeline(this.rc, pld);
                    var program = this.shadowPipeline_.program;
                    program.modelMatrixUniform = this.rc.gl.getUniformLocation(program, "modelMatrix");
                    program.lightViewProjectionMatrixUniform = this.rc.gl.getUniformLocation(program, "lightViewProjectionMatrix");
                    program.lightViewMatrixUniform = this.rc.gl.getUniformLocation(program, "lightViewMatrix");
                }
                return this.shadowPipeline_;
            };
            PBRPipeline.prototype.vertexShaderSource = function (feat) {
                var source = [];
                var line = function (s) { return source.push(s); };
                var if_all = function (s, f) { if ((feat & f) == f) {
                    source.push(s);
                } };
                line("attribute vec3 vertexPos_model;");
                line("attribute vec3 vertexNormal;");
                if_all("attribute vec2 vertexUV;", 1);
                if_all("attribute vec3 vertexColour;", 2);
                line("varying vec3 vertexNormal_cam;");
                line("varying vec4 vertexPos_world;");
                line("varying vec3 vertexPos_cam;");
                if_all("varying vec2 vertexUV_intp;", 1);
                if_all("varying vec3 vertexColour_intp;", 2);
                line("uniform mat4 modelMatrix;");
                line("uniform mat4 modelViewMatrix;");
                line("uniform mat4 modelViewProjectionMatrix;");
                line("uniform mat3 normalMatrix;");
                if_all("uniform vec4 texScaleOffset;", 1);
                line("void main() {");
                line("	gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);");
                line("	vertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);");
                line("	vertexNormal_cam = normalMatrix * vertexNormal;");
                line("	vertexPos_cam = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;");
                if_all("	vertexUV_intp = (vertexUV * texScaleOffset.xy) + texScaleOffset.zw;", 1);
                if_all("	vertexColour_intp = vertexColour;", 2);
                line("}");
                return source.join("\n") + "\n";
            };
            PBRPipeline.prototype.fragmentShaderSource = function (feat) {
                var source = [];
                var line = function (s) { return source.push(s); };
                var if_all = function (s, f) { if ((feat & f) == f) {
                    source.push(s);
                } };
                var if_any = function (s, f) { if ((feat & f) != 0) {
                    source.push(s);
                } };
                var if_not = function (s, f) { if ((feat & f) == 0) {
                    source.push(s);
                } };
                var lightingQuality = (feat & 12) >> LightingQualityBitShift;
                line("#extension GL_EXT_shader_texture_lod : require");
                if_any("#extension GL_OES_standard_derivatives : require", 1024 | 2048);
                line("precision highp float;");
                line("varying vec4 vertexPos_world;");
                line("varying vec3 vertexNormal_cam;");
                line("varying vec3 vertexPos_cam;");
                if_all("varying vec2 vertexUV_intp;", 1);
                if_all("varying vec3 vertexColour_intp;", 2);
                line("uniform mat3 normalMatrix;");
                line("uniform vec4 baseColour;");
                if_all("uniform vec4 emissiveData;", 16);
                line("uniform vec4 materialParam;");
                if_all("uniform sampler2D albedoMap;", 32);
                if_any("uniform sampler2D materialMap;", 128 | 64 | 256);
                if_any("uniform sampler2D normalHeightMap;", 1024 | 2048);
                if_all("uniform sampler2D alphaMap;", 512);
                line("uniform sampler2D brdfLookupMap;");
                line("uniform samplerCube environmentMap;");
                line("const int MAT_ROUGHNESS = 0;");
                line("const int MAT_METALLIC = 1;");
                line("const int MAT_AMBIENT_OCCLUSION = 2;");
                line("const float PI = 3.141592654;");
                line("const float PHONG_DIFFUSE = 1.0 / PI;");
                if_all("uniform mat4 lightViewMatrix;", 4096);
                if_all("uniform mat4 lightProjMatrix;", 4096);
                if_all("uniform sampler2D shadowSampler;", 4096);
                if_all("uniform int shadowCastingLightIndex;", 4096);
                line("uniform sampler2D lightLUTSampler;");
                line("uniform vec2 lightLUTParam;");
                line("struct LightEntry {");
                line("	vec4 colourAndType;");
                line("	vec4 positionCamAndIntensity;");
                line("	vec4 positionWorldAndRange;");
                line("	vec4 directionAndCutoff;");
                line("	vec4 shadowStrengthBias;");
                line("};");
                line("LightEntry getLightEntry(float lightIx) {");
                line("\tfloat row = (floor(lightIx / 128.0) + 0.5) / 512.0;");
                line("\tfloat col = (mod(lightIx, 128.0) * 5.0) + 0.5;");
                line("	LightEntry le;");
                line("	le.colourAndType = texture2D(lightLUTSampler, vec2(col / 640.0, row));");
                line("	le.positionCamAndIntensity = texture2D(lightLUTSampler, vec2((col + 1.0) / 640.0, row));");
                line("	le.positionWorldAndRange = texture2D(lightLUTSampler, vec2((col + 2.0) / 640.0, row));");
                line("	le.directionAndCutoff = texture2D(lightLUTSampler, vec2((col + 3.0) / 640.0, row));");
                line("	le.shadowStrengthBias = texture2D(lightLUTSampler, vec2((col + 4.0) / 640.0, row));");
                line("	return le;");
                line("}");
                line("float getLightIndex(float listIndex) {");
                line("\tfloat liRow = (floor(listIndex / 2560.0) + 256.0 + 0.5) / 512.0;");
                line("\tfloat rowElementIndex = mod(listIndex, 2560.0);");
                line("\tfloat liCol = (floor(rowElementIndex / 4.0) + 0.5) / 640.0;");
                line("\tfloat element = floor(mod(rowElementIndex, 4.0));");
                line("	vec4 packedIndices = texture2D(lightLUTSampler, vec2(liCol, liRow));");
                line("	if (element < 1.0) return packedIndices[0];");
                line("	if (element < 2.0) return packedIndices[1];");
                line("	if (element < 3.0) return packedIndices[2];");
                line("	return packedIndices[3];");
                line("}");
                line("vec2 getLightGridCell(vec2 fragCoord) {");
                line("	vec2 lightGridPos = vec2(floor(fragCoord.x / 32.0), floor(fragCoord.y / 32.0));");
                line("	float lightGridIndex = (lightGridPos.y * lightLUTParam.x) + lightGridPos.x;");
                line("\tfloat lgRow = (floor(lightGridIndex / 1280.0) + 256.0 + 240.0 + 0.5) / 512.0;");
                line("\tfloat rowPairIndex = mod(lightGridIndex, 1280.0);");
                line("\tfloat lgCol = (floor(rowPairIndex / 2.0) + 0.5) / 640.0;");
                line("\tfloat pair = floor(mod(rowPairIndex, 2.0));");
                line("	vec4 cellPair = texture2D(lightLUTSampler, vec2(lgCol, lgRow));");
                line("	if (pair < 1.0) return cellPair.xy;");
                line("	return cellPair.zw;");
                line("}");
                line("mat3 transpose(mat3 m) {");
                line("	vec3 c0 = m[0];");
                line("	vec3 c1 = m[1];");
                line("	vec3 c2 = m[2];");
                line("	return mat3(vec3(c0.x, c1.x, c2.x), vec3(c0.y, c1.y, c2.y), vec3(c0.z, c1.z, c2.z));");
                line("}");
                line("mat3 inverse(mat3 m) {");
                line("	float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];");
                line("	float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];");
                line("	float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];");
                line("	float b01 = a22 * a11 - a12 * a21;");
                line("	float b11 = -a22 * a10 + a12 * a20;");
                line("	float b21 = a21 * a10 - a11 * a20;");
                line("	float det = a00 * b01 + a01 * b11 + a02 * b21;");
                line("	return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),");
                line("	            b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),");
                line("	            b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;");
                line("}");
                line("struct SurfaceInfo {");
                line("	vec3 V;");
                line("	vec3 N;");
                line("	mat3 transNormalMatrix;");
                line("	vec3 reflectedV;");
                line("	vec2 UV;");
                line("	float NdV;");
                line("};");
                if (feat & (1024 | 2048)) {
                    line("mat3 cotangentFrame(vec3 N, vec3 p, vec2 uv) {");
                    line("	// get edge vectors of the pixel triangle");
                    line("	vec3 dp1 = dFdx(p);");
                    line("	vec3 dp2 = dFdy(p);");
                    line("	vec2 duv1 = dFdx(uv);");
                    line("	vec2 duv2 = dFdy(uv);");
                    line("	// solve the linear system");
                    line("	vec3 dp2perp = cross(dp2, N);");
                    line("	vec3 dp1perp = cross(N, dp1);");
                    line("	vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;");
                    line("	vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;");
                    line("	// construct a scale-invariant frame ");
                    line("	float invmax = inversesqrt(max(dot(T, T), dot(B, B)));");
                    line("	return mat3(T * invmax, B * invmax, N);");
                    line("}");
                    line("vec3 perturbNormal(vec3 N, vec3 V, vec2 uv) {");
                    line("	// assume N, the interpolated vertex normal and ");
                    line("	// V, the view vector (vertex to eye)");
                    line("	vec3 map = texture2D(normalHeightMap, uv).xyz * 2.0 - 1.0;");
                    line("	map.y = -map.y;");
                    line("	mat3 TBN = cotangentFrame(N, -V, uv);");
                    line("	return normalize(TBN * map);");
                    line("}");
                }
                if (feat & 2048) {
                    line("vec2 parallaxMapping(in vec3 V, in vec2 T, out float parallaxHeight) {");
                    line("	// determine optimal number of layers");
                    line("	const float minLayers = 20.0;");
                    line("	const float maxLayers = 25.0;");
                    line("	float numLayers = mix(maxLayers, minLayers, abs(dot(vec3(0, 0, 1), V)));");
                    line("	// height of each layer");
                    line("	float layerHeight = 1.0 / numLayers;");
                    line("	// current depth of the layer");
                    line("	float curLayerHeight = 0.0;");
                    line("	// shift of texture coordinates for each layer");
                    line("	vec2 dtex = -0.01 * V.xy / V.z / numLayers;");
                    line("	// current texture coordinates");
                    line("	vec2 currentTextureCoords = T + (0.005 * V.xy / V.z / numLayers);");
                    line("	// depth from heightmap");
                    line("	float heightFromTexture = texture2D(normalHeightMap, currentTextureCoords).a;");
                    line("	// while point is above the surface");
                    line("	for (int layerIx = 0; layerIx < 25; ++layerIx) {");
                    line("		// to the next layer");
                    line("		curLayerHeight += layerHeight;");
                    line("		// shift of texture coordinates");
                    line("		currentTextureCoords -= dtex;");
                    line("		// new depth from heightmap");
                    line("		heightFromTexture = texture2D(normalHeightMap, currentTextureCoords).a;");
                    line("		if (heightFromTexture <= curLayerHeight) break;");
                    line("	}");
                    line("	///////////////////////////////////////////////////////////");
                    line("	// previous texture coordinates");
                    line("	vec2 prevTCoords = currentTextureCoords + dtex;");
                    line("	// heights for linear interpolation");
                    line("	float nextH = heightFromTexture - curLayerHeight;");
                    line("	float prevH = texture2D(normalHeightMap, prevTCoords).a - curLayerHeight + layerHeight;");
                    line("	// proportions for linear interpolation");
                    line("	float weight = nextH / (nextH - prevH);");
                    line("	// interpolation of texture coordinates");
                    line("	vec2 finalTexCoords = prevTCoords * weight + currentTextureCoords * (1.0-weight);");
                    line("	// interpolation of depth values");
                    line("	parallaxHeight = curLayerHeight + prevH * weight + nextH * (1.0 - weight);");
                    line("	// return result");
                    line("	return finalTexCoords;");
                    line("}");
                }
                line("SurfaceInfo calcSurfaceInfo() {");
                line("	SurfaceInfo si;");
                line("	si.V = normalize(-vertexPos_cam);");
                line("	si.N = normalize(vertexNormal_cam);");
                if_not("	si.UV = vertexUV_intp;", 2048);
                if_any("	mat3 TBN = cotangentFrame(si.N, vertexPos_cam, vertexUV_intp);", 1024 | 2048);
                if (feat & 2048) {
                    line("	vec3 eyeTan = normalize(inverse(TBN) * si.V);");
                    line("	float finalH = 0.0;");
                    line("	si.UV = parallaxMapping(eyeTan, vertexUV_intp, finalH);");
                }
                if (feat & 1024) {
                    line("	vec3 map = texture2D(normalHeightMap, si.UV).xyz * 2.0 - 1.0;");
                    line("	si.N = normalize(TBN * map);");
                }
                line("	si.NdV = max(0.001, dot(si.N, si.V));");
                line("	si.transNormalMatrix = transpose(normalMatrix);");
                line("	si.reflectedV = si.transNormalMatrix * reflect(-si.V, si.N);");
                line("	return si;");
                line("}");
                line("vec3 fresnel_factor(vec3 f0, float product) {");
                line("	return f0 + (vec3(1.0) - f0) * pow(2.0, (-5.55473 * product - 6.98316) * product);");
                line("}");
                line("vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {");
                line("	return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);");
                line("}");
                if (lightingQuality >= 2) {
                    line("float D_blinn(float roughness, float NdH) {");
                    line("	float m = roughness * roughness;");
                    line("	float m2 = m * m;");
                    line("	float n = 2.0 / m2 - 2.0;");
                    line("	return (n + 2.0) / (2.0 * PI) * pow(NdH, n);");
                    line("}");
                    line("float D_GGX(float roughness, float NdH) {");
                    line("	float m = roughness * roughness;");
                    line("	float m2 = m * m;");
                    line("	float d = (NdH * m2 - NdH) * NdH + 1.0;");
                    line("	return m2 / (PI * d * d);");
                    line("}");
                    line("float G_schlick(float roughness, float NdV, float NdL) {");
                    line("	float k = roughness * roughness * 0.5;");
                    line("	float V = NdV * (1.0 - k) + k;");
                    line("	float L = NdL * (1.0 - k) + k;");
                    line("	return 0.25 / max(0.0001, V * L);");
                    line("}");
                }
                if (lightingQuality == 0) {
                    line("vec3 phong_specular(vec3 V, vec3 L, vec3 N, vec3 specular, float roughness) {");
                    line("	vec3 R = reflect(-L, N);");
                    line("	float spec = max(0.0, dot(V, R));");
                    line("	float k = 1.999 / max(0.0001, roughness * roughness);");
                    line("	return min(1.0, 3.0 * 0.0398 * k) * pow(spec, min(10000.0, k)) * specular;");
                    line("}");
                }
                else if (lightingQuality == 1) {
                    line("vec3 blinn_specular(float NdH, vec3 specular, float roughness) {");
                    line("	float k = 1.999 / max(0.0001, roughness * roughness);");
                    line("	return min(1.0, 3.0 * 0.0398 * k) * pow(NdH, min(10000.0, k)) * specular;");
                    line("}");
                }
                else {
                    line("vec3 cooktorrance_specular(float NdL, float NdV, float NdH, vec3 specular, float roughness) {");
                    line("	float D = D_GGX(roughness, NdH);");
                    line("	float G = G_schlick(roughness, NdV, NdL);");
                    line("	float rim = mix(1.0 - roughness * 0.9, 1.0, NdV);");
                    line("	return (1.0 / rim) * specular * G * D;");
                    line("}");
                }
                line("vec3 calcLightIBL(vec3 baseColour, vec4 matParam, SurfaceInfo si) {");
                line("	float metallic = matParam[MAT_METALLIC];");
                line("	float roughness = matParam[MAT_ROUGHNESS];");
                line("	float ao = matParam[MAT_AMBIENT_OCCLUSION];");
                line("	vec3 F0 = mix(vec3(0.04), baseColour, metallic);");
                line("	vec3 F = fresnelSchlickRoughness(max(si.NdV, 0.0), F0, roughness);");
                line("	vec3 kS = F;");
                line("	vec3 kD = 1.0 - kS;");
                line("	kD *= 1.0 - metallic;");
                line("	vec2 brdf = texture2D(brdfLookupMap, vec2(max(si.NdV, 0.0), roughness)).xy;");
                line("	vec3 irradiance = textureCubeLodEXT(environmentMap, si.N, 4.0).rgb;");
                line("	vec3 prefilteredColor = textureCubeLodEXT(environmentMap, si.reflectedV, roughness * 5.0).rgb;");
                if (!this.rc.extSRGB) {
                    line("	irradiance = pow(irradiance, vec3(2.2));");
                    line("	prefilteredColor = pow(prefilteredColor, vec3(2.2));");
                }
                line("	vec3 diffuse = irradiance * baseColour;");
                line("	vec3 specular = prefilteredColor * (F * brdf.x + brdf.y);");
                line("	vec3 ambient = (kD * diffuse + specular) * ao;");
                line("	return ambient;");
                line("}");
                line("vec3 calcLightShared(vec3 baseColour, vec4 matParam, vec3 lightColour, float diffuseStrength, vec3 lightDirection_cam, SurfaceInfo si) {");
                line("	vec3 V = si.V;");
                line("	vec3 N = si.N;");
                line("	vec3 L = -lightDirection_cam;");
                if (lightingQuality > 0) {
                    line("	vec3 H = normalize(L + V);");
                }
                line("	float metallic = matParam[MAT_METALLIC];");
                line("	float roughness = matParam[MAT_ROUGHNESS];");
                line("	vec3 specularColour = mix(vec3(0.04), baseColour, metallic);");
                line("	float NdL = max(0.0, dot(N, L));");
                if (lightingQuality > 0) {
                    line("	float NdH = max(0.001, dot(N, H));");
                    line("	float HdV = max(0.001, dot(H, V));");
                }
                if (lightingQuality == 0) {
                    line("	vec3 specfresnel = fresnel_factor(specularColour, si.NdV);");
                    line("	vec3 specref = phong_specular(V, L, N, specfresnel, roughness);");
                }
                else {
                    line("	vec3 specfresnel = fresnel_factor(specularColour, HdV);");
                    if (lightingQuality == 1) {
                        line("	vec3 specref = blinn_specular(NdH, specfresnel, roughness);");
                    }
                    else {
                        line("	vec3 specref = cooktorrance_specular(NdL, si.NdV, NdH, specfresnel, roughness);");
                    }
                }
                line("	specref *= vec3(NdL);");
                line("	vec3 diffref = (vec3(1.0) - specfresnel) * NdL * NdL;");
                line("	vec3 light_color = lightColour * diffuseStrength;");
                line("	vec3 reflected_light = specref * light_color;");
                line("	vec3 diffuse_light = diffref * light_color;");
                line("	return diffuse_light * mix(baseColour, vec3(0.0), metallic) + reflected_light;");
                line("}");
                line("vec3 calcPointLight(vec3 baseColour, vec4 matParam, vec3 lightColour, float intensity, float range, vec3 lightPos_cam, vec3 lightPos_world, SurfaceInfo si) {");
                line("	float distance = length(vertexPos_world.xyz - lightPos_world);");
                line("	vec3 lightDirection_cam = normalize(vertexPos_cam - lightPos_cam);");
                line("	float attenuation = clamp(1.0 - distance / range, 0.0, 1.0);");
                line("	attenuation *= attenuation;");
                line("    float diffuseStrength = intensity * attenuation;");
                line("	return calcLightShared(baseColour, matParam, lightColour, diffuseStrength, lightDirection_cam, si);");
                line("}");
                line("vec3 calcSpotLight(vec3 baseColour, vec4 matParam, vec3 lightColour, float intensity, float range, float cutoff, vec3 lightPos_cam, vec3 lightPos_world, vec3 lightDirection, SurfaceInfo si) {");
                line("	vec3 lightToPoint = normalize(vertexPos_cam - lightPos_cam);");
                line("	float spotCosAngle = dot(lightToPoint, lightDirection);");
                line("	if (spotCosAngle > cutoff) {");
                line("		vec3 light = calcPointLight(baseColour, matParam, lightColour, intensity, range, lightPos_cam, lightPos_world, si);");
                line("		return light * smoothstep(cutoff, cutoff + 0.01, spotCosAngle);");
                line("	}");
                line("	return vec3(0.0);");
                line("}");
                line("vec3 getLightContribution(LightEntry light, vec3 baseColour, vec4 matParam, SurfaceInfo si) {");
                line("	vec3 colour = light.colourAndType.xyz;");
                line("	float type = light.colourAndType.w;");
                line("	vec3 lightPos_cam = light.positionCamAndIntensity.xyz;");
                line("	float intensity = light.positionCamAndIntensity.w;");
                line("\tif (type == " + 1 + ".0) {");
                line("		return calcLightShared(baseColour, matParam, colour, intensity, light.directionAndCutoff.xyz, si);");
                line("	}");
                line("	vec3 lightPos_world = light.positionWorldAndRange.xyz;");
                line("	float range = light.positionWorldAndRange.w;");
                line("\tif (type == " + 2 + ".0) {");
                line("		return calcPointLight(baseColour, matParam, colour, intensity, range, lightPos_cam, lightPos_world, si);");
                line("	}");
                line("	float cutoff = light.directionAndCutoff.w;");
                line("\tif (type == " + 3 + ".0) {");
                line("		return calcSpotLight(baseColour, matParam, colour, intensity, range, cutoff, lightPos_cam, lightPos_world, light.directionAndCutoff.xyz, si);");
                line("	}");
                line("	return vec3(0.0);");
                line("}");
                if (feat & 4096) {
                    line("\n\t\t\t\t\tfloat linstep(float low, float high, float v) {\n\t\t\t\t\t\treturn clamp((v-low) / (high-low), 0.0, 1.0);\n\t\t\t\t\t}\n\n\t\t\t\t\tfloat VSM(vec2 uv, float compare, float strength, float bias) {\n\t\t\t\t\t\tvec2 moments = texture2D(shadowSampler, uv).xy;\n\t\t\t\t\t\tfloat p = smoothstep(compare - bias, compare, moments.x);\n\t\t\t\t\t\tfloat variance = max(moments.y - moments.x*moments.x, -0.001);\n\t\t\t\t\t\tfloat d = compare - moments.x;\n\t\t\t\t\t\tfloat p_max = linstep(0.2, 1.0, variance / (variance + d*d));\n\t\t\t\t\t\treturn clamp(max(p, p_max), 0.0, 1.0);\n\t\t\t\t\t}\n\t\t\t\t");
                }
                line("void main() {");
                line("	SurfaceInfo si = calcSurfaceInfo();");
                if (feat & 512) {
                    line("	float alpha = texture2D(alphaMap, si.UV).r;");
                    line("	if (alpha < 0.7) { discard; }");
                }
                if (feat & 32) {
                    line("	vec3 baseColour = texture2D(albedoMap, si.UV).rgb * baseColour.rgb;");
                    if (!this.rc.extSRGB) {
                        line("	baseColour = pow(baseColour, vec3(2.2));");
                    }
                }
                else {
                    line("	vec3 baseColour = baseColour.rgb;");
                }
                if_all("	baseColour *= vertexColour_intp;", 2);
                var hasRMAMap = false;
                if (feat & (128 | 64 | 256)) {
                    line("	vec4 matParam = texture2D(materialMap, si.UV);");
                    hasRMAMap = true;
                }
                else {
                    line("	vec4 matParam = vec4(materialParam.xy, 1.0, 0);");
                }
                if (hasRMAMap && (feat & 128) === 0) {
                    line("	matParam[MAT_METALLIC] = materialParam[MAT_METALLIC];");
                }
                if (hasRMAMap && (feat & 64) === 0) {
                    line("	matParam[MAT_ROUGHNESS] = materialParam[MAT_ROUGHNESS];");
                }
                if (hasRMAMap && (feat & 64) === 0) {
                    line("	matParam[MAT_AMBIENT_OCCLUSION] = 1.0;");
                }
                line("	vec3 totalLight = calcLightIBL(baseColour, matParam, si);");
                if (feat & 16) {
                    line("	totalLight += (emissiveData.rgb * emissiveData.w);");
                }
                line("	vec2 fragCoord = vec2(gl_FragCoord.x, lightLUTParam.y - gl_FragCoord.y);");
                line("	vec2 lightOffsetCount = getLightGridCell(fragCoord);");
                line("	int lightListOffset = int(lightOffsetCount.x);");
                line("	int lightListCount = int(lightOffsetCount.y);");
                line("	for (int llix = 0; llix < 128; ++llix) {");
                line("		if (llix == lightListCount) break;");
                line("		float lightIx = getLightIndex(float(lightListOffset + llix));");
                line("		LightEntry lightData = getLightEntry(lightIx);");
                line("		if (lightData.colourAndType.w <= 0.0) break;");
                line("		float shadowFactor = 1.0;");
                if (feat & 4096) {
                    line("		if (int(lightIx) == shadowCastingLightIndex) {");
                    line("			float shadowStrength = lightData.shadowStrengthBias.x;");
                    line("			float shadowBias = lightData.shadowStrengthBias.y;");
                    line("			vec3 lightPos = (lightViewMatrix * vertexPos_world).xyz;");
                    line("			vec4 lightDevice = lightProjMatrix * vec4(lightPos, 1.0);");
                    line("			vec2 lightDeviceNormal = lightDevice.xy / lightDevice.w;");
                    line("			vec2 lightUV = lightDeviceNormal * 0.5 + 0.5;");
                    line("			float lightTest = clamp(length(lightPos) / 12.0, 0.0, 1.0);");
                    line("			shadowFactor = VSM(lightUV, lightTest, shadowStrength, shadowBias);");
                    line("		}");
                }
                line("		totalLight += getLightContribution(lightData, baseColour, matParam, si) * shadowFactor;");
                line("	}");
                if_all("	totalLight *= matParam[MAT_AMBIENT_OCCLUSION];", 256);
                line("	gl_FragColor = vec4(pow(totalLight, vec3(1.0 / 2.2)), 1.0);");
                line("}");
                return source.join("\n") + "\n";
            };
            return PBRPipeline;
        }());
        var PBRModelManager = (function () {
            function PBRModelManager(rc, transformMgr_, meshMgr_, lightMgr_) {
                this.rc = rc;
                this.transformMgr_ = transformMgr_;
                this.meshMgr_ = meshMgr_;
                this.lightMgr_ = lightMgr_;
                this.brdfLookupTex_ = null;
                this.shadowCastingLightIndex_ = 0;
                this.modelViewMatrix_ = sd.mat4.create();
                this.modelViewProjectionMatrix_ = sd.mat4.create();
                this.normalMatrix_ = sd.mat3.create();
                this.pbrPipeline_ = new PBRPipeline(rc);
                this.materialMgr_ = new world.PBRMaterialManager();
                var instFields = [
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.UInt8, count: 1 },
                    { type: sd.UInt8, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                ];
                this.instanceData_ = new sd.container.MultiArrayBuffer(1024, instFields);
                var groupFields = [
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                ];
                this.primGroupData_ = new sd.container.MultiArrayBuffer(2048, groupFields);
                this.rebase();
                this.groupRebase();
                this.materials_ = [];
                this.loadBRDFLUTTexture();
            }
            PBRModelManager.prototype.loadBRDFLUTTexture = function () {
                var _this = this;
                var img = new Image();
                img.onload = function () {
                    var td = sd.render.makeTexDesc2DFromImageSource(img, 1, 0);
                    td.sampling.repeatS = 2;
                    td.sampling.repeatT = 2;
                    _this.brdfLookupTex_ = new sd.render.Texture(_this.rc, td);
                };
                img.onerror = function (ev) {
                    console.error("Could not load embedded BRDF LUT texture.", ev);
                };
                img.src = brdfPNGString;
            };
            PBRModelManager.prototype.rebase = function () {
                this.entityBase_ = this.instanceData_.indexedFieldView(0);
                this.transformBase_ = this.instanceData_.indexedFieldView(1);
                this.enabledBase_ = this.instanceData_.indexedFieldView(2);
                this.shadowCastFlagsBase_ = this.instanceData_.indexedFieldView(3);
                this.materialOffsetCountBase_ = this.instanceData_.indexedFieldView(4);
                this.primGroupOffsetBase_ = this.instanceData_.indexedFieldView(5);
            };
            PBRModelManager.prototype.groupRebase = function () {
                this.primGroupMaterialBase_ = this.primGroupData_.indexedFieldView(0);
                this.primGroupFeatureBase_ = this.primGroupData_.indexedFieldView(1);
            };
            PBRModelManager.prototype.featuresForMeshAndMaterial = function (mesh, material) {
                var features = 0;
                var meshFeatures = this.meshMgr_.features(mesh);
                if (meshFeatures & 16) {
                    features |= 2;
                }
                if (meshFeatures & 8) {
                    features |= 1;
                }
                var matFlags = this.materialMgr_.flags(material);
                if (matFlags & 2) {
                    features |= 16;
                }
                if (this.materialMgr_.albedoMap(material)) {
                    features |= 32;
                }
                if (this.materialMgr_.normalHeightMap(material)) {
                    if (matFlags & 64) {
                        features |= 1024;
                    }
                    if (matFlags & 128) {
                        features |= 2048;
                    }
                }
                if (this.materialMgr_.materialMap(material)) {
                    if (matFlags & 4) {
                        features |= 64;
                    }
                    if (matFlags & 8) {
                        features |= 128;
                    }
                    if (matFlags & 16) {
                        features |= 256;
                    }
                }
                if (this.materialMgr_.alphaMap(material)) {
                    features |= 512;
                }
                return features;
            };
            PBRModelManager.prototype.updatePrimGroups = function (modelIx) {
                var _this = this;
                var mesh = this.meshMgr_.forEntity(this.entityBase_[modelIx]);
                if (!mesh) {
                    return;
                }
                var groups = this.meshMgr_.primitiveGroups(mesh);
                var materialsOffsetCount = sd.container.copyIndexedVec2(this.materialOffsetCountBase_, modelIx);
                var materialsOffset = materialsOffsetCount[0];
                var materialCount = materialsOffsetCount[1];
                var maxLocalMatIndex = groups.reduce(function (cur, group) { return Math.max(cur, group.materialIx); }, 0);
                sd.assert(materialCount >= maxLocalMatIndex - 1, "not enough PBRMaterialIndexes for this mesh");
                var primGroupCount = this.primGroupData_.count;
                this.primGroupOffsetBase_[modelIx] = this.primGroupData_.count;
                if (this.primGroupData_.resize(primGroupCount + groups.length) == 1) {
                    this.groupRebase();
                }
                groups.forEach(function (group) {
                    _this.primGroupFeatureBase_[primGroupCount] = _this.featuresForMeshAndMaterial(mesh, _this.materials_[materialsOffset + group.materialIx]);
                    _this.primGroupMaterialBase_[primGroupCount] = _this.materials_[materialsOffset + group.materialIx];
                    primGroupCount += 1;
                });
            };
            PBRModelManager.prototype.setRenderFeatureEnabled = function (feature, enable) {
                var mask = 0;
                if (feature == 0) {
                    mask |= 32;
                }
                else if (feature == 1) {
                    mask |= 1024;
                }
                else if (feature == 2) {
                    mask |= 2048;
                }
                else if (feature == 3) {
                    mask |= 16;
                }
                if (enable) {
                    this.pbrPipeline_.enableFeatures(mask);
                }
                else {
                    this.pbrPipeline_.disableFeatures(mask);
                }
            };
            PBRModelManager.prototype.create = function (entity, desc) {
                if (this.instanceData_.extend() == 1) {
                    this.rebase();
                }
                var ix = this.instanceData_.count;
                this.entityBase_[ix] = entity;
                this.transformBase_[ix] = this.transformMgr_.forEntity(entity);
                this.enabledBase_[ix] = +true;
                this.shadowCastFlagsBase_[ix] = +(desc.castsShadows === undefined ? true : desc.castsShadows);
                sd.container.setIndexedVec2(this.materialOffsetCountBase_, ix, [this.materials_.length, desc.materials.length]);
                for (var _i = 0, _a = desc.materials; _i < _a.length; _i++) {
                    var mat = _a[_i];
                    this.materials_.push(this.materialMgr_.create(mat));
                }
                this.updatePrimGroups(ix);
                return ix;
            };
            PBRModelManager.prototype.destroy = function (_inst) {
            };
            PBRModelManager.prototype.destroyRange = function (range) {
                var iter = range.makeIterator();
                while (iter.next()) {
                    this.destroy(iter.current);
                }
            };
            Object.defineProperty(PBRModelManager.prototype, "count", {
                get: function () {
                    return this.instanceData_.count;
                },
                enumerable: true,
                configurable: true
            });
            PBRModelManager.prototype.valid = function (inst) {
                return inst <= this.count;
            };
            PBRModelManager.prototype.all = function () {
                return new world.InstanceLinearRange(1, this.count);
            };
            PBRModelManager.prototype.entity = function (inst) {
                return this.entityBase_[inst];
            };
            PBRModelManager.prototype.transform = function (inst) {
                return this.transformBase_[inst];
            };
            PBRModelManager.prototype.enabled = function (inst) {
                return this.enabledBase_[inst] != 0;
            };
            PBRModelManager.prototype.setEnabled = function (inst, newEnabled) {
                this.enabledBase_[inst] = +newEnabled;
            };
            PBRModelManager.prototype.materialRange = function (inst) {
                var offsetCount = sd.container.copyIndexedVec2(this.materialOffsetCountBase_, inst);
                var matFromIndex = this.materials_[offsetCount[0]];
                return new world.InstanceLinearRange(matFromIndex, matFromIndex + offsetCount[1] - 1);
            };
            Object.defineProperty(PBRModelManager.prototype, "materialManager", {
                get: function () { return this.materialMgr_; },
                enumerable: true,
                configurable: true
            });
            PBRModelManager.prototype.shadowCaster = function () {
                return this.shadowCastingLightIndex_;
            };
            PBRModelManager.prototype.setShadowCaster = function (inst) {
                this.shadowCastingLightIndex_ = inst;
            };
            PBRModelManager.prototype.disableRenderFeature = function (f) {
                if (f == 1) {
                    this.pbrPipeline_.disableFeatures(1024);
                }
            };
            PBRModelManager.prototype.enableRenderFeature = function (f) {
                if (f == 1) {
                    this.pbrPipeline_.enableFeatures(1024);
                }
            };
            PBRModelManager.prototype.drawSingleShadow = function (rp, proj, shadowPipeline, modelIx) {
                var gl = this.rc.gl;
                var program = shadowPipeline.program;
                var mesh = this.meshMgr_.forEntity(this.entityBase_[modelIx]);
                rp.setMesh(mesh);
                var modelMatrix = this.transformMgr_.worldMatrix(this.transformBase_[modelIx]);
                sd.mat4.multiply(this.modelViewMatrix_, proj.viewMatrix, modelMatrix);
                sd.mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, proj.viewMatrix);
                gl.uniformMatrix4fv(program.modelMatrixUniform, false, modelMatrix);
                gl.uniformMatrix4fv(program.lightViewMatrixUniform, false, proj.viewMatrix);
                gl.uniformMatrix4fv(program.lightViewProjectionMatrixUniform, false, this.modelViewProjectionMatrix_);
                var uniformPrimType = this.meshMgr_.uniformPrimitiveType(mesh);
                if (uniformPrimType !== 0) {
                    var totalElementCount = this.meshMgr_.totalElementCount(mesh);
                    var indexElementType = this.meshMgr_.indexBufferElementType(mesh);
                    if (indexElementType !== 0) {
                        rp.drawIndexedPrimitives(uniformPrimType, indexElementType, 0, totalElementCount);
                    }
                    else {
                        rp.drawPrimitives(uniformPrimType, 0, totalElementCount);
                    }
                }
                return 1;
            };
            PBRModelManager.prototype.drawSingleForward = function (rp, proj, shadow, lightingQuality, modelIx) {
                var gl = this.rc.gl;
                var drawCalls = 0;
                var mesh = this.meshMgr_.forEntity(this.entityBase_[modelIx]);
                var modelMatrix = this.transformMgr_.worldMatrix(this.transformBase_[modelIx]);
                sd.mat4.multiply(this.modelViewMatrix_, proj.viewMatrix, modelMatrix);
                sd.mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, this.modelViewMatrix_);
                var meshPrimitiveGroups = this.meshMgr_.primitiveGroups(mesh);
                var primGroupBase = this.primGroupOffsetBase_[modelIx];
                var primGroupCount = meshPrimitiveGroups.length;
                for (var pgIx = 0; pgIx < primGroupCount; ++pgIx) {
                    var primGroup = meshPrimitiveGroups[pgIx];
                    var matInst = this.primGroupMaterialBase_[primGroupBase + pgIx];
                    var materialData = this.materialMgr_.getData(matInst);
                    var features = this.primGroupFeatureBase_[primGroupBase + pgIx];
                    features |= lightingQuality << LightingQualityBitShift;
                    if (shadow) {
                        features |= 4096;
                    }
                    var pipeline = this.pbrPipeline_.pipelineForFeatures(features);
                    rp.setPipeline(pipeline);
                    rp.setMesh(mesh);
                    var program = (pipeline.program);
                    gl.uniformMatrix4fv(program.modelMatrixUniform, false, modelMatrix);
                    gl.uniformMatrix4fv(program.mvpMatrixUniform, false, this.modelViewProjectionMatrix_);
                    sd.mat3.normalFromMat4(this.normalMatrix_, this.modelViewMatrix_);
                    gl.uniformMatrix3fv(program.normalMatrixUniform, false, this.normalMatrix_);
                    if (program.mvMatrixUniform) {
                        gl.uniformMatrix4fv(program.mvMatrixUniform, false, this.modelViewMatrix_);
                    }
                    gl.uniform4fv(program.baseColourUniform, materialData.colourData);
                    gl.uniform4fv(program.materialUniform, materialData.materialParam);
                    if (features & 16) {
                        gl.uniform4fv(program.emissiveDataUniform, materialData.emissiveData);
                    }
                    if (features & 1) {
                        gl.uniform4fv(program.texScaleOffsetUniform, materialData.texScaleOffsetData);
                    }
                    if (features & 32) {
                        rp.setTexture(materialData.albedoMap, 0);
                    }
                    if (features & (64 | 128 | 256)) {
                        rp.setTexture(materialData.materialMap, 1);
                    }
                    if (features & 1024) {
                        rp.setTexture(materialData.normalHeightMap, 2);
                    }
                    if (features & 512) {
                        rp.setTexture(materialData.alphaMap, 3);
                    }
                    rp.setTexture(this.lightMgr_.lutTexture, 6);
                    gl.uniform2fv(program.lightLUTParamUniform, this.lightMgr_.lutParam);
                    if (shadow) {
                        gl.uniform1i(program.shadowCastingLightIndexUniform, this.shadowCastingLightIndex_);
                        rp.setTexture(shadow.filteredTexture || shadow.shadowFBO.colourAttachmentTexture(0), 7);
                        gl.uniformMatrix4fv(program.lightViewMatrixUniform, false, shadow.lightProjection.viewMatrix);
                        gl.uniformMatrix4fv(program.lightProjMatrixUniform, false, shadow.lightProjection.projectionMatrix);
                    }
                    var indexElementType = this.meshMgr_.indexBufferElementType(mesh);
                    if (indexElementType !== 0) {
                        rp.drawIndexedPrimitives(primGroup.type, indexElementType, primGroup.fromElement, primGroup.elementCount);
                    }
                    else {
                        rp.drawPrimitives(primGroup.type, primGroup.fromElement, primGroup.elementCount);
                    }
                    drawCalls += 1;
                }
                return drawCalls;
            };
            PBRModelManager.prototype.drawShadows = function (range, rp, proj) {
                var shadowPipeline = this.pbrPipeline_.shadowPipeline();
                rp.setPipeline(shadowPipeline);
                var iter = range.makeIterator();
                while (iter.next()) {
                    var index = iter.current;
                    if (this.enabledBase_[index] && this.shadowCastFlagsBase_[index]) {
                        this.drawSingleShadow(rp, proj, shadowPipeline, index);
                    }
                }
            };
            PBRModelManager.prototype.draw = function (range, rp, proj, shadow, lightingQuality, environmentMap) {
                if (!this.brdfLookupTex_) {
                    return 0;
                }
                var drawCalls = 0;
                rp.setTexture(environmentMap, 4);
                rp.setTexture(this.brdfLookupTex_, 5);
                var iter = range.makeIterator();
                while (iter.next()) {
                    drawCalls += this.drawSingleForward(rp, proj, shadow, lightingQuality, iter.current);
                }
                return drawCalls;
            };
            return PBRModelManager;
        }());
        world.PBRModelManager = PBRModelManager;
        var brdfPNGString = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAAyTElEQVR4AayVBwrDUAxDlcHs/Y/Ya0TdNTy+wBmmuNKz0ulPpv" +
            "tNm2S9u7VB6C0sS0X8EwxU9w/yUe814AJxHClpA0J0uTwaFQkdthsOFsLk14s+7AeC7etooQ/ZVZNkDn6wUxWvXjTmh+UcdrYmr08iigogydikybikpqnnAG" +
            "NCOFp8JPBrBbUaMAZCvqfD5bQX1ErQ3/jgM8vjnJnM1afFQr9V3PVwPJjnGeAbpa7+3je3H3ySff3S5x1tH49jOlSO5eRRu/5oWMri9Qx77CYQCx83vFe6CT" +
            "zIOxNVV5IYiVaC//+XNavBycEHdaCxLj3m8cjKpdxLhBRaqlw3bRz0j8KXHMg8AHAfoP8HoFf0TzEBn13zLx6A2E02cokGXoSQw51OwAZChqaAydCfCSHOww" +
            "lMgn4e3PiMm/9JAihOuX7ehlk2fWqSuuYF6/jgu+hzWk7AyeAC5jxVLQ48gUMIbP8l83roj7jhG/LxiPmfcw6vcrBznhNUQSJp9LY8UpevQLyLcV20CdAfcE" +
            "BQG1CioXwQEGc655kXPAs2Pv8WkUCm4AX0cAJ6H+4D7rmFY6eBX07qn9wh+OW8zvHVHNzbEj+XQFm0qlnO8i3qH7j6ZpfKni9mUtHvk4yGc/3z9AIArvadQC" +
            "6HHLXT4+EMzwABGsimmseHe5g4Au6xGqT/fZCjP+ZAA/25BGJAnKl8Tk4gex/TIQGAwJb0Z3jqooVQ9soXF0rUjkTDOfr7HHgCMoxIoGB1Ihp+JtOg84q/T4" +
            "BLqVdP9hAB5igQyMqqpUGvmzfQf6E2QH8WAwyQ4elLGs8ITVR852PfdeeAVoi8CNB3Ag+Tp7IqsufHyqeXEepUG575+pdnhGyyv2HBri9IIPkIrj0S8L2EuM" +
            "6fOyXaRj+EEPYMcEBQ66zIA4D5kta8kplP/vD4EAHyXBAR2egawpAyCWSAr+g4gQdCSBr4hnOgAvoBCfTPMkLPYKbflwIyyObNSrCEsdjl6SC/PYHu2zIJ9L" +
            "4ewr3G1jT8nAmU0mDUm0v5P5zRz7L3r4F7OMa5DmOMqpmkQVHoTQOAQQ50xH3TFXScgBQ9eORfltGf9wCVPQmAjS0d4vQhQ7iBXUYt9BO1A39nEfAzQoN+Rm" +
            "hk/HNM52cdWl4JrpYKEhSbEGJZt1klGE7+9BjejoYbOVAMAhrgs6B8mq5gQcwEB0UCVf98tgGK/JsQkuqvOwFe9sPf7mY0ZrYVfM4HGaBRNLf3T0ySYW+AG8" +
            "bIDFohqiV6AEdxAp37qfeofg5qTgg9Qf6HqwL0jAbb6fxU/Cy4C49PX42NwZeZevJGf7/sxhhKhikOPCwLEPRu+GU1Rv/7Ftiwldzch7tMvp7z1LdFHutGAi" +
            "xdmbhyIeToJ5EcuEg35Rx42sFAIIT8rHsPNsnNoR+XOdz3U0AnqQR3VryPjSiUBgrUEyQYEKtv6ih+3BEBMU1+IIQCUbSfzfT9PtNH0PQkukG5qx/LRiWwxv" +
            "4G+gPcS3k48ACt/E8D3KREjP5ONBxcrqYv5+/JSnC57s6jgvyghLlwAoL7rKbbgDu68zPpwskfPL8yf+l8WBX9nOczwbET0MyPHxWtz7qvaphrR97XECZ8GA" +
            "zkNAgowbFHw/OuYF3u9zkACVT3dHVC4aBNmgddCHlaCZdEc5/Oh/sjwdN/M5eiPKeER8ODcM/VPydDTOfzD9OgqSjz5gXhQK+ghguT/kFZFx4meJEEyBAKIU" +
            "d5Pt6B+/6ngYqbAG74cyfgbwSiEMLpzivfzAmkHHiyx75yIcSxOoQgGnb0Bxv+PtDltbNXHSBvitaEpiSO5CZRF13e8BO8SkgsvTTqpalMHuwzYQX93LPf/9" +
            "NshajIwOfRsGPdyTPW8IPJSPYgGBgIfJ8+QzwaztG/F9pmyl4OBnUADz9PcTF/VIDX2gDHG+fNDg8LaoNav0+DDOK+zYWQziyncYaWhCQv4L7zGwpTQkgy+m" +
            "Hzc+u7hQlIZbbI0ORqhwbiBEIm5MLGZ3IvMQj0zBW8B0UJVJ53zJ+RHzcOGgPoA+x6RNgVPO8LISQ0MHznTHjuX05YQv/AJzf2tid4NaJs1EAWB9/gkJtEDX" +
            "Bu8o0JSDcFPzYjDysC8aGsz/vYPjzSOPp93iGWo7wBcQft61pGPrS+OoEkYiaMaMv16QJu6DoB50MJBwLDj8159rN5mSd8Aj4s2PLKIa4O4UqDSj60X08VSg" +
            "DreV6o3wDXahPKOdAFOp1AFNE+kcpnWSDnQz4/wZAI4s6Wl+zOIgFyYCza77+GkWQIar0B0FUIPTXvBIZD3gWUB20BAQ2wTV6MVZ+DcZJWH+ia+EcqdjTxz9" +
            "IY0Bk84YVxnszJyAAqBujn/fXIvKDv06Cz+eVwZyRQlXI2qPVyWxxUNWIG5UAD+sIHRMNPkALCaiDfKYTy9I4eWZA6eRA8YNGlNpyHDVzCVaPmJUKox4EnSu" +
            "cT2e9bpfUsrqaugHvmlU96/MzaeGlFQzv0PWCFGHCsnOb6awPcLhpJz1qbUJcDgH4wiXz8iPrPXQGomKPfV0dJkjPBY4AFJ0Bl7yca2Uzwqp/2ETGGjFAM/d" +
            "Gy1wQfFtAfACqTT8nvAyAfapGAxwxHVoPGIV8nspsZob75Ryozhz5alLN0/hPzAZHAQs4nVvnx780JAXxrjXAWIp53tp+h7/8+jZeHNb1TjcTOdSqDPisDWd" +
            "kr4EOQ29n85DR4PE9lWSAOGAkQvtcSV4HdIETmtTeB+n16HPCfH35i6LMyMKD+o3n4osFnwXKhkhj1nBiv2X/kSgmtxOjTBmTD9m5nm2+OoT9R4nU+OPQdvv" +
            "tuIY93s49kgb6/K6X6bzOExc2fZ/YsZxD4girdwe0enRKy5E6gOeO4dxDzcZmxJufcoubypuZ/I4ziRwWJ/NQAZhA0BwFv2i/ttHQOPB4QB2YeWdGcDG1W+N" +
            "kc/dvvvQo+bIazrjh5eiZ/kFLWg31oAvWyF4OBfvqf48cvnQmyQfYEuOcGFoa3u/k3figbg+aL4qohhIZf+KL9bTjOq0ZoK3BHebgNdOyHEwgC3xz3uegnT0" +
            "YTNb8kQH31+q26bwXgJi6lNObBQK/uS+gbyuOabuABoKn6Qr+vghzTLAyvv+BNPNs4317+4C/J0IyG8Qmyos0n6I0Vfejbb9DL+A1cx306IxDPVdDI/rOT/5" +
            "n/4JHIRhboLfrbyoel5dxteAztDdUhBx4Z57gXJzCf63Tn0Ldcf/8n4PMg2MIAeXNojOg4Kxq0i1rrkXNAx3cwQBoo7jHJYGDO5Jcb1B4H/mXoP5cHQAUAlv" +
            "tt+MO3RQQcIMqTn9wTHRU2NdDeaxTrk4LjYD6PAVZF/6Jwegm26mnLmAYHyo7QDHc3dy91AKa1zf8VDAg0ZVKcQCh1cpm+JfoXYgMGwVIKEMWfCKF8e0vHqB" +
            "OIOaDq32caZACXAnNeE7AoeuB/BdD5OQyCy20/s0BvUVTvcVMIEW0RVbDRfzIVsx0OPB3zTyFEJggZnA/TOqf6UPsXQf94EExQiO0vZoEYJPSh3OeACySeaj" +
            "3a4hxolHthvCNkM8EwBnrS7y8Xac9PbyJB8CfKMQNcNOQ+7gZYp0mhzttzhQNZlpNABG0cgv2kpB/PSbL9Odt3O+8gmJlQloEJXy8rgir0JPE7tmS+txcc4B" +
            "i07Kt/kPm4SV4x8/NOYFvV5JVgBkDXIHxz+kMOBL2i+fORnbSPj0XZd2YITaz6noMF37//WdY2vlliACBe++EYAQsiazwYwLS/PVd9Sz/F2a1wMZfi5h976E" +
            "tl/0q75gL6z/TOYzHALWOo7+t5ipNBhnQ+GOBqkPK3fgqtcNF+98SJc2MOiLWRcDzLoPedjAHgBAT30iAkQqiC348Z6JIIUv6Mbvu1XtAGqyNYqXlIkcOrMt" +
            "0359skBgDmBPccF/OqlUv/AT+gbsnbKETlOxMGxDqIlINgy4Tvbe5veNG81Q39akaRVK6KR98vlrsZ9dphUTiNUleDCTgS2eyzn5unE1sVMNEG3/O6pepT+g" +
            "QMS7/1/XlIUT6FQbeklWU/Nen5dGw/AdHP8YPMf/+zj+nZPdjAGADB7t0T2goA2Csx8AbFsYCYHAC1jBUOaBc8Zh3ytMx+scm3rSFbVrHEGODNB49ZOwEAOF" +
            "ANDlTAgU5Wp/3YgOv+089OKtDPdmrypF96ps1/Dv14CXWAr4mgIsQhhPDpiZ+FgBiVXXCAyJbwt5/YkSJJDqDFeuqC5Z6HPrNAmgj6UhZw8ZOHvznW3dI7B7" +
            "jBU5ztVk0cybHOm6zQYAH9w6cOY4DyRJAIIRE/KoRy1x/vx6I3Npvhb6Rftxotz9zZgHXnd+jPoX+lQS/l03zynZNYL+8LwuVUQMygtr4GxLKnoeNF2MzGsr" +
            "N3yDeP6xCszkMfk0yDEpRVz8NEEAZfnhb4gvIoKZS/YrrDgaDaJYDeaNTJke07eV0TBFiYt8nXp/mvgrX+HukyPLgmyQEOgoC4P+kfckB7HzzwzeH794tK+y" +
            "gf30wJxOchCX3C3W0/x0FfUBsopYlRfyrA8/dVs5okOCK1hd9CnPnQffTnk5RA6gTQFnHN0N57GiR4mS5m8hfLYfU0mjFrP0O/b8j3zfk0H17FN5tfFTFB6k" +
            "0P2GPpsr6OoxGjsi6JgAMILVqlK6c35kaFUB4JnF8tnQX0B9soge4ycAFSCIJFh1wbyIFufBy8NiLiQD/l30Dkr2LZPEG5IOjP+PGhgy8C7k4B4UkA6RGCKA" +
            "IHgkQhZubQVn3jTcJneM1PrQLaGZsDcf/g60N7IBq+mGAD4p4feaF0pQFxf1LCuGrGlPlvHeS37b/Qc1+Rc34H/T4jEohC6GZCPfzDYICpJPmdye5T8zVdHL" +
            "gmIOFCcAeSKZAxg0hdmlxFPyUQguBroK/NwgZmPMEBgSkQ/+PiwKFrijjA+8xnaSQlOg9iRh2ybW0mO/KqOw36dgJIen5JhuLxeefANV/MAjn+JjtGxwPTAR" +
            "mTafcci1taPNvge6INlEA3EDtN0TesyznArE7/cr5jdL6Oyypb3uHj0sW/Lsfo/sz5rSt4fTPJ8mrESwihCCAceKpn+IUDA8WB2Z9hbW3bTzimp5yr5+dwH9" +
            "/w+rDQ199118LqLhIXZQ+Yw6DC8zz18BJECt4plHLghAFxinjnVa7Og5mFI8HlwP63BPpAPyNg2mM2RDAYuNSUGP5OdcxnBl4ncXI/MNVJPx/ObhnXfP8Cef" +
            "BWCKZB3xDXXuhLHX3hgKAKWsWtfgUcIBBDLYTjeTAwH5U6f/4FCA6+yze/Co/CfDoEkeM0+aJbSseq/ucTo4pdOyWrWdOOKOwODRYwqv+Qq5eY6dcB0ARKIY" +
            "RaGDtD+fMCzgFUjnlZQ1ro4KdIZbPLkjzb05/M1Tz/eXJ8+Oa/f9ntBbrs/fNp+L9UwdgLhDi4mPQkkrCn1M84Xr0eLGjOX/6RBgN78eg8rNcwPXf54m/jPe" +
            "iJgPmn8vnM9wPf3/7ud03Pa6EwID6RH2gGuCcz5KJPAhgt7Nyk3OuWLldLT9GaMgWE9wgRxBQ/TI+K+MnzQkG7zrf5oaT+cV+xrrNlyf/x/j5VrBnuA5d4KB" +
            "7m/7pkDHDfihz43OmKX8MDV+QVFQHcTjOucCcwH7z6kkcRvjlfWiDA7E1e+B0kZoFg/j8uGQNQz3jg66D3pyhrrlGCQO+j/PgN+wTjJW74MwwNbdsnw+kEwf" +
            "Xf0wx/b8NPb4AyMDlgHUE98dPrIc1/YbsPdEM5IRvsGYWOk8fH80f+pOe5PAAFOl4ZVCgPswxMDqALSLuGbkpIFqjyxGjWQxZo9zxRw7stAOsHzmH7i16F/g" +
            "VkQtETgVwQHoVByEvb//3xec+fesnM+4KyxKiY8Fyc9M3zIDqnxjAfC/5kiOcv1HQRAFACsQr2MAZA0pO9RvoiUVE+3Te04W7ELs96LlIMs6/2WSRiJgdo/+" +
            "wCTBf4c8cAz9vAvwdXAABbe3WJkj9ltr/KRT+LA5HyIQJ8mwAa4OvicjoPsz/eg+k8/cwDoCxg3RBfFJTrn2oY+/Is0GjTKAHt5tyX+mEoj8/b8nknMI/gDW" +
            "LAAxS6G4rVAHTIXTWEBgeQIJJWUDH8wxw4vQLZ/P9XcRTOFkFkjOn98QIZXh/TbAfi2x/IB6h/kAEc6GV7SI9RDohAIs76uDwNfHM8b5X9n7Ax/kGYsR9L0A" +
            "M8D3vjtAhA7cQuIJDhS+Arda4JDlj2PRchhnL3Hn5np1NGhmDDwsEUzdGtXp8ThLJLoHqofJj2IRkkASqV4EkOnHZiVPBHEO/jb5wMnF+i2fzxKwZ4vqRx2B" +
            "DBebQSQfojBrgm1Q808kI3cDu5UdE8mEyBzmjYjmBDK7DucqAfP8zjez8YcAJchvxNg0IYgD8XQ/BDY8qBa5JCH/MNP1BAkgW7zgpv/+xzQ4WQcyBHnq/muJ" +
            "+f/COe4VXv4Tt4ZRigEkjedSXSH5NdP6BLpRw4PVZIIYxoPs6N/sAncy80r47+aBoqJsCV13+YxxQJhJxPA/ow+YL7gAP/TPkcmaFhTtXO6SxNIlu+fRrW05" +
            "heIMD1Pvw3DQqw5t89CUToM+QluHMOFHVO/4Gshh84wrHxwU9i3/P/mQzwAB/wfYjy68/lHxoSyMPfvh84E3mhjuwheUTwHBdCcqR/1rdhPIb74B9mTxoFHg" +
            "BZIIbC9yV7gYrm3weihcwPXPtPwAHguyl7PMfveqMPcV7OK/ulr/ANqx7gc/qmwa1wGACwZNbggIS//1ALVcSBk8qexiOwfUy3IoEzkdnEkQXc/+WC2gvJTc" +
            "QA7IXmY5POASofkME5cJ6cA+fLalKL5UE6AUEbIR6QZxq++yHBeKNeKIEexAAt9N+gl3a3L9nPjh+ouiEY+gFBfIMVmHTBYwIJ9+mHCrh/DPd5VuyTIUqDfn" +
            "wYAzxIBH30NVyvfnDz75a+rYUKuCQH6ulTwhHvMoOD0Uufj+HrnPHBfJFuv0RAD/BFCB1efumA+Kb+2dHQ4wDRXBdSg/oA7imIJ2KYYO0JIfcPvqrQX3AC/x" +
            "oV9LpSnOeN5isjdOMVQoiG/4v6F5QDjggbjnDgfZmA3vBN2ZMLIcI09xIipebgnt9hcOf8mAR4njsTynLYe2BBMCpf35I/bQ6ce7KuyTfon27KyEAv+O4n7H" +
            "FngTvgG8TKNp9rpOXa2UIu6FWHL3T4UDtPF/1VaAr6lvs/7x3CgSvff01+cOC6rLxGhksPNx2FDvRBP+Dzv8X9fjI0fyaYoS2h/3zpg/gWBDPVgwSoDA5TQA" +
            "Q64TvpB3DpMyr63dibQMJXBNECByTzDiv2n6ukBHoYCrMU8EEVBsHCgcbgPoXczv9cFww/cV+OcuykqsElwO0cEDPfW/LLAW+wHRzvPzNwPxDDUBgeAIkgBs" +
            "EfZjsw/0fD3/ocS02gERNT2zSMZZDRx93cOfg/w28F0vz+H6V6+oHBhwR6btw/qApLGhR/kwOMBwTxb0AQ9xy/pdrJtRB7PCUSxWUPtYkfkMmJcHk/Jh7aPJ" +
            "AFKkoghsL1P9sQ/lL6Owc0MDg3Tw5TQOWax8cEOvOk9AkNNd/MCOEsVNOsTPL80oL4GSNDsKRZoA+tf8fB8ADsgKD0R+pTOXCg/s9ND0r/NwfM9svYXv9GmB" +
            "LKBJBUtVJMOz1y6M8PlpzA0LbX1fGGTOgVCn+6AtE/BL36gQIZaP5Po0XifMf9sfiYVtwpEaT5Bc1CM7lzUG4bpUQ+uR8Bsxnuhv5FBu8MxTsP4Q2UA6J8bv" +
            "NPky/xbn9MMSOU6LuFIM3vO3v4nk8QLTRIL/DhHQPggRhkhD628UkAiP6LDyyBUeIT+ox0bw4Q084H5wlB7H87B9TeN2oFAVUWKmjTk//HzT8aA9QH1r03Tp" +
            "4BIAeupQv0zPkQ+u8BoZ/bfhpUGle3+kekv9wkQOp4DSGe/wEZfF72ZBzA7wRfiG8UBD6eGmPzDzjwPCTDLfoJfXKA0P9YdT7Yx/erLsoD1v/g7gx4LLdxGG" +
            "wN9v//5Lh3l1eB6TesPbq1EOxgENhO3lzbIyVSsvPIHFLO31o/0OWSe/ZB1J/3UyFAAOXwwVBBzADmbVZUQYr1DzeAeCOBCH16Xz/mItHjA//aG9Qdav1WBd" +
            "xehr14/09d/3CKPgAkEITQNVL0+wygsmfkFEVPp/tjhFRCFfoM/wp97q7beCM0jMQmBypKaZ0E6nBv31T3/s7XPiXkQMx3EujSMugiA4AD0EIhi9byxoiRAz" +
            "W+DP9bYZ7SZVEI2rSk/tbaLVSr/vwjDUwocOD9uEcfQJB9xbi+88FXxntmADG1XvZgE4SaYAb+ewDjKwOwYuuQjeUDDavXRT+J+g6j+x66ttjeIHvDzp+SBA" +
            "pIfPxeLJL6DOA5QM2TaUEGhgNyC6zIlY3N1eGKQuTAYnOyuZ5JAnIt+ODGUwQnxsdooARQK4wkIAIpOeAzgOVAPO1BfEzw3wMFuuUAUc7j8GvvSw9AnhgsGo" +
            "hjunu1rDi42AP913CAt0iAaa3wZY4H6OaIscGBmCh3JuiFGzFpcxns/TPeGITDOnSRrAPZRvnEZoGIK6vr/o6JOhNKD3Ts8j+bCpQAcQt9wb2piiroNQ9YFZ" +
            "S+NqdaAhJAKxkoeHz4t4PYq4Hub+g3DniNY3+rYIVXi286NtCL+wINlABzsCFwTauCeBCeHAh9QGWPlnc+fw1yPwtBDP/sBuycr9eB4UAO3ANEsxdC65Dvn6" +
            "lD3xvrYxyYv5cDDZRABriWVpgqyJb8RdKkKlf0E/RKBkLciaL9ARcJ8eHFjxdLP4v0B1XQ7rQ//L8Q98gAQ5OANr9WKkicADhgPUBI7X+aKcv/SaTPdF8UEe" +
            "7UQktRhAEKRz6iV5KA0KxB4TRKoP5K//pQ/JUGIJsAhgnDqCD58/AAWeeBMZiYJgeGTrkTDqKIiN+HuzkU7wK/YQXBejQJcLFOif49of2pwD6gVaDU/U83/A" +
            "z/A+djCHePfjW4/5gK+s1UB3VPTLj7LBEM8BBIRqW4JFC7Ngmefug30MCvsAokKugyKijbxsYA4H9N1oUJtuYzvp0OgJ5kUyibI5f27bBcXL972cf1QhLAyh" +
            "8F/daKZyEDIAlQBfHNoTAAuKrihwcIrfoD5Qb0vuzjyeBFkUJcxtA8LvC73nA5CcSoHqIvIJsM3x/0FEOPTE0jDP3g9APGAdMAePTrCtEPUQSb+1Pxg/XY4I" +
            "D/HlLnjBegX/uBLv3DB16hfHqrPesy6K1/rhAPkCoIh4YHDcBGHggURk0GUHcri4C4JQPW1xxQra8AhdD3rsDulVjvpCgciXzJCyCmh3h/+C+UQa8vET/xzx" +
            "bYpa0xhv9h7C80jyn4mJAvtaAxkQec5tnnAD3xnlWgZAqfBCqVIlwbmPAW41uwtqUpPEB2wUJNMCUQv0CJoPfFUDR3P1fuikMLObS/RtBzOv61+UXc59TBnY" +
            "qIzVerfMz6wXIQ1Zof9B+D7DUA27tBhQPXHf5DyqCpfxj+nfgxPxRF7G0B7lRBpjOAaWA9ngGeK2ENgCmPkhgUS1yXuwe2i9rp0cMu/Tt/1iscGwJkHpDwr3" +
            "uBhjQBGP7HovjD6zAZYOQitkIsAj8YQkDnXQ3wXCHcqWQGFz0xvMr/TeH//HbORrVTn9arQJdcUwVJHsBOOPYB7ktOzZUcSBBmXBeVL2SQRVDCc0ABnVNygy" +
            "oIcCes3WLsJwHfQSu+KusFpf0eGtRzwlICiQqiBEppvmUDIqD4cTgmcazq/3lW2BR/fB6wLzWB4LmHMMEUQmycyeJWEsD0fBKoHHJ/2V7/OhP2PvXryvB/Yz" +
            "2MCVYOlG0AMCm9YTCBfxac8Ryg+ofg4YkZK4TYDmPZh7G/sH26dC3X/uehr2tvUD71FS+BkgYh4meCAFkJpQ3wEohln/EcDzABf8oYX2+CQzBteeKFULgpko" +
            "BZlIFb53Xtg/sPuPjpfF1n1634rRBfY14wAHf4f+yKQwfAhf/P0Oz/gdoB7kGk1E6I67gi0YhhBdYXQoiSKeiAGe+9mufAl4ZaesPCq57vpOhnwtZmuOtrXF" +
            "OssG6QpgRS3D/HT3FiivIco046mUBssPfXYRfDJYe8SzfMhADVxEposSGAadsLf7pfzfCCJPDrE/jRC7vuq0BfruSAlnS2WsLB0zMwAwWI+2zARSSHDId0w4" +
            "A7WeF3RnhFxKm9HpBALvy/OKjX/O6qEyy/n6ma4KkckHj/CfPy4x1wsMizQHyJAzdGeRWUy6KpFAHozgas1b/fMtRfBWor8HPlndB3ZVA5G4AjwgMeQPq1gn" +
            "zuBmX8BW0qVyr4/ZwAelg37CpFpi60Hrhpw+mwrn38LeX8+opIoDTBmgFEBVECJdLBAfjge0AHvFUtNQdrWOfBy0Ar6kghTqAzCfixr/m46qc5IsyVAz3gBh" +
            "VUTxHnoE8JxHroDNMEGAa7BqmE3DrwQzLxI+E/TtTGSh3plA7BNAdMQwCLjhj1U8L9zWCOZ3/wPtAHyKivv6wCqfKZ0uhFEsAWzEfh35uE4Qv/psfsd1tQDv" +
            "n8wAeUGGQCbQBgXdBCSyH0RgNQmJ6p5NT/R+8+wK2Cshg6Q/QPviRP/8aNzkUvbE/3T24oIgfWB9C8DXCBf2GO5ZkFE1gh/SH6D3wbQEcZ9IxPPfdZeABIoJ" +
            "xeYoJRAOUP7iZWzS4JD/e19GelNWw2MHd9fgjTDVC2uDYZSz3eEmBa5gAGL4D+AYgfrAJ9/X0SMuSqNgAot0kAT3J5DAZ+JBYX7HErHO6JbP/LJLBXGDU5wQ" +
            "3whQOnjgWftryzp2NVX8QtfyTyYisABBgwwfHv2908H8YG6Cn9B+E+gH7gvpwEoJeYBAwTiPVj+0Ab7G/dBvTjvsSHX5/wfz1PhIkNyINgTuxAtKQVzilSAT" +
            "bD5YPeTnAK9AsxvCWgDbDVITpjXfd94t9jf3s44Mftuzjb1ukBpBiaJSCjfwY6AN4AkDMM/88jATgZQwrRCWD/M+M94evDP7MHaz5eAnnl81b72wD9/tDORd" +
            "zNKhA4kH5ADkAmTqBe1oaYfiCxqi1k31bjNKiCxJgC99gFvbwC5bYohIJPsfjj36t+pO45++qe0Yt7ru/0AWQrKB1wLLC9ug3cY/eENdME/fOx8PkhIIdy0Z" +
            "ljmwqW9VAaA9pcIviE9G843DiPQZ+LJ26hD3DbANRA5evA0P+SV7sBtawYzMB0G/o8HxPjWxUE/cOpUfyL5AB6eAkEhpimrz/p8kdLfy4eCOoVD8BuQBJg3N" +
            "dF+De7/LGSn4V7xl46M4gcUPYMK4dCp/rM6ld/vB+A+t88EnB+CzRv/THQx60CMe7NcE8PcOENWQAo7K/HvUAfr4FwHWUMmAcCA/SkuG7EDK+D2ol2gn3f6m" +
            "5QGZ+1vw3vam5Q/1Xc4xk9EQYOqP6ZUPBbTgCIz48khSz0zQAPiw8eoIGuO1fgm2IuG3CF4/rLUerbftr1T4P6PwV9NMIme2HUP/u4hyiifV1/1iE+5Di2Jg" +
            "cdUCBBxvijw9Q/8A8gg97dLIA2SX+M3wb9Bg+Ax+gB7jygW+KkEOREzpKp+68P5dP6kJBBgrosijOWAYqVnDpFBP0DIhm/W9//U+dAr/6Z9Ur/O6DPAzFfN/" +
            "pxKsAUQAFlH/jz/VbuvUGoh8oixqKlwqSCHHg/YIpCe1bYF0M5dnB/gfF9WZOLi01yiGeCVQVRAsWPZY9BP0pAFveqhXSsBoAZgDSAT8iVdWN4xwxQGmHw/x" +
            "x/+Yu9s9FxHOeVKOn5ue//wB1ewE0YB6mkoHxCiA16DMOgtO7emd1DqkjTsoVejBro9R+R+29fE9gMJzlAyArQhFzoKPWe/hefHyfsoM2oDzsKLNINzBYP5u" +
            "0wXkNXErcrxOuxnw68p3/gYPPoj8n9ffSRBF8+gKZolUCkmWO9IUT5EG8d6mxqDkDWg1H/siVJEH8QN1jRQrhT5oX4pa2B/OREBlwLuA+gPxv40z0IOy71Tw" +
            "dY9imv+DkUN7CegQfvqdw/XwEwn+5dXviD9er06Ju6p8w4OTSUAW8E/jKgfwj6i+8DlEigjPvv9WbFAWKY+GbI105fq9GipqlDXQ1UFIUqHxPUjQoyqbAMTS" +
            "voohxanHxDsjureebRN60Qx1MH6PqMqVJK+Jd8V39EJ2X8HHpdDRoyDrU2ykni/mxXrPBtpOpRGvI96O/88kWtB/4Pk/tvqAIJ/SKBkM7KjuH1KPxXGwI6Js" +
            "2uELwBpR7xBMkHnqQEUqOUTmazV1z6kqixF7LebR8Y3tvwA9Bfv0eSYDSEag7wrIxTJPsK/KQfCturINwkMPE9Wg118IQsDGV9aLsEZaOClHv/AFgp3N/+dv" +
            "271lOBfwD9AfqTSbD2hOI3ycfZ28BHvno1oMIB/bT9HxqkPk4Mglh7LQSRA9u86q7/+XyXhN8Ma/8dAA5fo/8dgb+GNP0A+vocwDsAKSEZPUfNE1BBUeIJ9k" +
            "h5ZalnPRDiCZoJsCyjLRKSFTxsj5N1YK2pc59+r/Xn6/2c/Ez0RQKpA/Qz4OME9zwrGoWjUUapJ5v+NuAeS7LH1iUQYuGNhEm30XyUGOTz2J++IdTsMaFusE" +
            "///h63/oaaRn/dMYbpZzOcOoA2/7R1izhOo3BFmG83wI/I6nHBtLIUaHwtgSlh237MVOjlwfWq/lFbDRmad8EG+z3fIPc/QPEvPgfoU9Jfkf6oe/aQbhDKky" +
            "+zWDew+SVhMutAuwegX2uG8/Uf0/yM4UTj57r6/zno+zspgb7uEoAj6vaYfkb9rntS+Rj6M9xGK3eo1WKgXV8H2tYhJ/1O0Y/RX/oy5HjbM+39Tclrus4zQD" +
            "9bIR5nwOx+YwJwXpr7ROyHgS9MEn1/EPo0QReGWQe0BqoqiKxbn3RfDpYa5eiLL/OBfwD9iTtFAqkDXPSz7EMJVNi92cjoWkQ/7ZoQttGSZ9Ir9NvuooLoCW" +
            "roKuHfAlNkx/TPOv0f0Ls/4Se/v64qkJSA8ogq0I9Hvyj+aOBfUTuCeFrZDWSXomw9whG1IPLtchVtnqPnmK7jgdx34GnXAPpyz5CfcAX40hLQEXFD/ec8D4" +
            "n9qT2fVza8XPU3j4gRnk0VyPH0WAU9Le88Dv++Gc4bMR/7y9M/p3lG0N9vhUhmwGyDu8elruv11Yy6XwEY8nvI8ybo91jYKplnCpvrCltVkN/jhKe7Jzz0+/" +
            "UfN78hgWq8p3/gto1DH4R1/SfyKm6eiW/GreLI63NJQB8rQFH86H/r48QInkCguSAEZvB6F+9ZZsts22aEkHK/XpZ9QwY8/6z387j3P7WeBF+Kp6rhuGX7QA" +
            "VSXlyr1wef7zJAEqOFd8a4MogoEkZBni4apQkxT6t/zFZws/TPo+/Bys/iXprhpATEXPNO+SSvGv7bB1T84Ogcgy0Gqdlwcci+aO35sQmA3B/6IpiB3lf9zf" +
            "dPx+gfyH1rqrI5S39Xgb4eOUDHd8T+4Gfz+srw36ccED838ie2femGnqAR3YgfNVJjvzy/kzbpjZeAR+if/F7LB6Ov3wjTGij1T9Spf+JKAO4Df0n9R2N/au" +
            "CnzSaF1HVA0VctJF1x/gXF8LF/qQM0VlLh+ee+H4P+PP2mCoRFQPRPK58A/edUDy8fOO3HsZ9ukCf3ZDcacffSpKIfl034NHVmyKcX4dSsV+fS7/0mL6z0dZ" +
            "7+gXr/APoTP+tXAITAIxr6Jv7ODaqNx+eNsf/x/8bEsMEVQ9GHDRB5TQ5ZlNRMYKsNTnrglnwg9jd78xLo89Gf8BzmAF9og8sbPtzL3XsSbsD0N59ynx3++9" +
            "dSvrcB/YNdRQG6zOhnJiiBFjciz6fNz2JrL5Dfgkqucryh/L9P/wj685pnQQJJ+K+jiTwuqgufTC1cIX7qYcrL8J/XFeiLG/SVG/8//iq1JMHiCUpSygsJ9p" +
            "Ri0bpEWd8FUYzpZs8N4PKj0E//HKASuSmf+Abo5woQVvlQ/WdfuRT0UNxAnIH5AN2DbiDUPm+e0zxYtZBy8x8v/+8nADxyAPpp4tdXgAyqf4IdWAFE/KDsA/" +
            "Tbo3AF9Ggpg40ZcQbmmim1IJVAqWg+a27beAC80fwzUPnZjfqMFAPcT6CvOUD0M+DKyANyX+hn7G+DgZ/6h7gDesR+Du9sSYLbGeAnWgvSLSFoiB3Lua/sX6" +
            "u/+XUfwDFf+Xlf1M8NWAfp5woQ8fWNezb3R7rSTit+uAXQ72Hrfgb+jJDYHym7LrfN3FeSAa4MqrPzsQ+o7Xuh9cUxnwMMFUCHWvzn0Z+nnzkAS0AVN8Dcjg" +
            "H0L/r7ZJdb3XEP4ru4hNhP9PO+z16vZqfbUB/Q7SQWPvzo34MJK37mC6A8ciDwD6M/0wzHR2DFL7ln08v0N9AB8fDMu9ifbSj3mEFZM6XTTq7MBGhEElwRSP" +
            "Yrd3qs9/+8owAab6K/RvrbPgB9TYKhfzJPaDN+8RthCPfKPZVPIvb3sN2A3EMFieFXAE2C1Rn8O8GxVgnl4d8Ankp/B6r+8+jP0y8O8BVxg/6Jb5KvrIDoGw" +
            "eQ2N9uAOi5AsBunhj+TVFI3kUUZ2AeLO3QUWw0Wtiv5cUEQFORd6W/NU3/APqT9GsO0KR2BvzwIzHVV09/JNzgzv4mVWwmA6qFVLcgYzbbkLjg7atA+trkeg" +
            "IQmwmAB9cPawH9z4n6A7//d9dAwUKH/3YJoV3a/VEibR9oI6mCeggVRB/ooX7AiwbTAG1BI/Q6VIh9Jxx/5E0JQEw1PM83O3wA/ZRALAGdl6jjWgTk/ayCce" +
            "trtvQ/yehg38O4EX2o/7alqwcuETQkDeg7NRkw8VWwXlD/4plraK6Ln1W5v07/Zwf++XbozgE6MBdPrACSAEBtU/wkF4FL+dBGeBbHCN20EEaYzyEKRuTVVo" +
            "GefjCPx8q/fT0M57ocV3sy8Nfno+8d4Jt+SqDm/tD/q6p8LgIgfrAIhKAf9AHdSTPBum5Yy5yYcGsxVCuhQN8/8Fovgy5KoM0MeJL++dL+IP0+B7gy4KO1UM" +
            "kuuSL9V7jHjBi8MprSDe6MPtxrKOIDPWOUj8wbtjys2+JngP5/6KsEaujjVP/nCRBE/ySkfwSKnt83HNDu9AQaQTL4TymEdBFgNuy2Yg5kwJzxua9Ov94E4Y" +
            "7cbHseEf35U9CnBIpOdo886f/VEuhhBtxw3/h0CWUfZsMlKwDDNqCXkjYCP23cSei1IUIT4lgvgHo3eEsGjGOA/g9Af3JjrCsDvmJ/XzsfeKz+G3oEfrIuZ2" +
            "ZQ5YdcaSRJ1cyY0C82pYkWShP+TQa8Ef71D+yNefp/Fvp0gKsPtMP/EfGrZ0Id4EZ1cQ674klP4HkBwqXAaACXCbAkqo9dwwuhaxKH0u9j/074X5X+b0Az/2" +
            "keL4G6/vMr+rzCfwbpb54IH14Xbk/QBAAqHwUfXPGr7CKg+/OYdw7F2HgNQGx54jbSaZM6HKR/FP15BziO79h/nqcEAnzY0zPPK7biaenf9uP6j3YEAVZMSj" +
            "H+cXPyytu3mNSf9YdopMXwz5XnrQVQDDd4yp+LvkigU/dfK0APNfxHgIZGH24g3CP8QwVJHixRFs6gnZvPVJB4QoRHf33es0jo90P7vvSfp//juKcDVNwyMk" +
            "/0f0f8jmgJJA5wi+uhb1ZH/ShW992bV+0GMICs5NDykkqUxmM6g6NEbZ5+rxT9JbwhN9X/Ig1voP8f+rICnOKnKIHY4sb/5TfQf0TU5RLnTOKMvjbZYmT6UA" +
            "3olVdHg/mYuzlMv5D43nYozf81/M/TP4f+vAP0Nm/HtQK0BGL4z7w2MrkufOYlfPdQEwDdto0pgaKvm1VZkZ3sivMY7fOqN/iM/C358Tz9E9zPS6DjiPim/3" +
            "evAKh+oq3tC6K/Cz6RV+AX3Z+63QOcAW4g6TLSXxuS+5q+yq51fT03auo5Ff5zO+v9h744wC2qE4ArB5Dyf0bckAGT/uyr6njymLICXNwvpaqaBPvHT3LbYh" +
            "UoLdzr4ns/Nq+Ln3n6Px99kUCN/p/zSv1TjT41T1L5oPCfmvWC+zA+kALfWmKaelWlTv9Z+d9Vu4/AdgjeX3bm6f9M9OkAp/6pP62CqH/yBoVQwawglH5yf9" +
            "pQRMYH4AaahqZ+2RcB3vKXmx2Og8I99wGaf+vlo9GnBMrv9PfPeUL/ZMMNf0DRs9cBbelRMdGOgVGKgfYH06eZoUknb17FK/U0Our1zoWcfQY8T//Ho88VIH" +
            "41/UwAkuKnMwFugCWvNUrrW4oKSor+BGT68JVJsNEnInu0Bdr/OI9cB2tD/yw70tCRPxF9OsDtRP9vtA8cKPbzG70X95L1Pum75Cwm6QO82Weii5rbspXb4d" +
            "Czu0/GfPjPH4s+V4D8E/X3yoDZ3HZeChudC/rUE9mGKhUWgowosow++aBvyjVefwigIurzKflH/6IDxEn/5QD5zTraPKl/bq6fhwf1T4+NlP8BR0Xk/s9yaG" +
            "fwXVn3a/f/F9RnOgkdAPrnF3r6v42G/v5MjfTyKMDjruPM+dizyy7/0S6+MPxvXvcB7wa8563/Veu/7ACREf93+sC3/ils7db2a5q3ZFgc3l1Ltt19/nt7KY" +
            "IdPXNdO2PpYVHaPC0oVYiFHzGfDtMhBvqr9Edkxhz1+o/4m/2dP+b4XQf0D9hcSvcKJvRS4Qziy6/LgH7eWc/PLNiY4SebUv4GQr9lugyCfcnSefFyH7zfsI" +
            "z4RYB97OvBK3+CA8SfcwX4g92sSnsZ+iC4in5ZbmgU4j3Qh+fQlx76QOl6QjdoIzz9xgf21+8yXFqIDfR7ur9exLr+v70z0WkghoHoy3L9//9ubLTOjmpwxH" +
            "0TazR6mVTVZZtSCjj89ZG4ju+A9fZ/+clXdkHqeBcgqGKSkHKBuP6/JZci3A4WANlHDua0ADKrDJpLSLp1lA9GXEE79Vl3ASXPCa4Q8XNzW6s+7Pnbf/wC6Z" +
            "q79L2v4R1CPrTLdbTOFkfbaR3rh7c9oMqghwwGyz2E4EpQZcbmITtkwU1JG65kDlVIsytgzgFAvpo78kfhBN70m5D+fKj8+Wr802pjABxQOxJdrr6Xq+NNvd" +
            "73s8V7JAPIsnOKrg4OCHdjG57BMCVxVLtLTckFZi6QrAzAc4JnGMoMoFCsYw3n8AzXdtfxmbA+wxqGUtcAXevfzl6nDIAW/zkJ29j9EdoTi1/MxbX4+2z3u2" +
            "Ta/Vr/9hBa9lAB8XOifEGgsgBPx+yI5TgK3/f770770v91p/J/MRIb/6lWrVoDsGrVGoBVq9YArFp1D/GcStzSiQ23AAAAAElFTkSuQmCC";
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var PhysicsMaterialData = (function () {
            function PhysicsMaterialData() {
                this.friction = 0;
                this.restitution = 0;
            }
            return PhysicsMaterialData;
        }());
        world.PhysicsMaterialData = PhysicsMaterialData;
        var PhysicsMaterialManager = (function () {
            function PhysicsMaterialManager() {
                this.instanceData_ = [null];
                this.freed_ = new Set();
            }
            PhysicsMaterialManager.prototype.create = function (desc) {
                var nextRef = 0;
                if (this.freed_.size > 0) {
                    nextRef = this.freed_.values().next().value;
                    this.freed_.delete(nextRef);
                }
                else {
                    nextRef = this.instanceData_.length;
                }
                this.instanceData_[nextRef] = sd.cloneStruct(desc);
                return nextRef;
            };
            PhysicsMaterialManager.prototype.destroy = function (ref) {
                if (!this.valid(ref)) {
                    return;
                }
                var index = ref;
                if (index == this.instanceData_.length - 1) {
                    this.instanceData_.length = index;
                }
                else {
                    this.instanceData_[index] = null;
                    this.freed_.add(ref);
                }
            };
            Object.defineProperty(PhysicsMaterialManager.prototype, "count", {
                get: function () {
                    return this.instanceData_.length - 1 - this.freed_.size;
                },
                enumerable: true,
                configurable: true
            });
            PhysicsMaterialManager.prototype.valid = function (ref) {
                var index = ref;
                return (index < this.instanceData_.length) && (this.instanceData_[index] != null);
            };
            PhysicsMaterialManager.prototype.item = function (ref) {
                sd.assert(this.valid(ref));
                return this.instanceData_[ref];
            };
            return PhysicsMaterialManager;
        }());
        world.PhysicsMaterialManager = PhysicsMaterialManager;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var RigidBodyManager = (function () {
            function RigidBodyManager(transformMgr_) {
                this.transformMgr_ = transformMgr_;
                var fields = [
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.Float, count: 2 },
                    { type: sd.Float, count: 3 },
                    { type: sd.Float, count: 3 },
                    { type: sd.Float, count: 18 },
                    { type: sd.Float, count: 3 },
                    { type: sd.Float, count: 3 },
                ];
                this.instanceData_ = new sd.container.MultiArrayBuffer(128, fields);
                this.rebase();
                this.entityMap_ = new Map();
            }
            RigidBodyManager.prototype.rebase = function () {
                this.entityBase_ = this.instanceData_.indexedFieldView(0);
                this.transformBase_ = this.instanceData_.indexedFieldView(1);
                this.massBase_ = this.instanceData_.indexedFieldView(2);
                this.velocityBase_ = this.instanceData_.indexedFieldView(3);
                this.forceBase_ = this.instanceData_.indexedFieldView(4);
                this.inertiaBase_ = this.instanceData_.indexedFieldView(5);
                this.angVelocityBase_ = this.instanceData_.indexedFieldView(6);
                this.torqueBase_ = this.instanceData_.indexedFieldView(7);
            };
            RigidBodyManager.prototype.create = function (ent, desc) {
                if (this.instanceData_.extend() == 1) {
                    this.rebase();
                }
                var instance = this.instanceData_.count;
                this.entityBase_[instance] = ent;
                this.transformBase_[instance] = this.transformMgr_.forEntity(ent);
                this.entityMap_.set(ent, instance);
                this.setMass(instance, desc.mass, desc.hullSize || sd.vec3.one());
                var zero3 = sd.vec3.zero();
                sd.container.setIndexedVec3(this.velocityBase_, instance, zero3);
                sd.container.setIndexedVec3(this.forceBase_, instance, zero3);
                sd.container.setIndexedVec3(this.angVelocityBase_, instance, zero3);
                sd.container.setIndexedVec3(this.torqueBase_, instance, zero3);
                return instance;
            };
            RigidBodyManager.prototype.destroy = function (_inst) {
            };
            RigidBodyManager.prototype.destroyRange = function (range) {
                var iter = range.makeIterator();
                while (iter.next()) {
                    this.destroy(iter.current);
                }
            };
            Object.defineProperty(RigidBodyManager.prototype, "count", {
                get: function () { return this.instanceData_.count; },
                enumerable: true,
                configurable: true
            });
            RigidBodyManager.prototype.valid = function (inst) {
                return inst <= this.count;
            };
            RigidBodyManager.prototype.all = function () {
                return new world.InstanceLinearRange(1, this.count);
            };
            RigidBodyManager.prototype.simulate = function (range, dt) {
                var zero3 = sd.vec3.zero();
                var iter = range.makeIterator();
                while (iter.next()) {
                    var index = iter.current;
                    var transform = this.transformBase_[index];
                    var dxdt = sd.vec3.scale([], sd.container.copyIndexedVec3(this.velocityBase_, index), dt);
                    var dpdt = sd.vec3.scale([], sd.container.copyIndexedVec3(this.forceBase_, index), dt);
                    var inverseMass = this.inverseMass(index);
                    var dOdt = sd.vec3.scale([], sd.container.copyIndexedVec3(this.angVelocityBase_, index), dt);
                    var dTdt = sd.vec3.scale([], sd.container.copyIndexedVec3(this.torqueBase_, index), dt);
                    var inverseInertia = this.inverseInertia(index);
                    if (dxdt[0] || dxdt[1] || dxdt[2]) {
                        this.transformMgr_.translate(transform, dxdt);
                    }
                    if (dOdt[0] || dOdt[1] || dOdt[2]) {
                        this.transformMgr_.rotateByAngles(transform, dOdt);
                    }
                    var indexVec3 = sd.container.offsetOfIndexedVec3(index);
                    this.velocityBase_[indexVec3 + 0] += dpdt[0] * inverseMass;
                    this.velocityBase_[indexVec3 + 1] += dpdt[1] * inverseMass;
                    this.velocityBase_[indexVec3 + 2] += dpdt[2] * inverseMass;
                    var torqueInvInvertia = sd.vec3.transformMat3([], dTdt, inverseInertia);
                    this.angVelocityBase_[indexVec3 + 0] += torqueInvInvertia[0];
                    this.angVelocityBase_[indexVec3 + 1] += torqueInvInvertia[1];
                    this.angVelocityBase_[indexVec3 + 2] += torqueInvInvertia[2];
                    sd.container.setIndexedVec3(this.forceBase_, index, zero3);
                    sd.container.setIndexedVec3(this.torqueBase_, index, zero3);
                }
            };
            RigidBodyManager.prototype.entity = function (inst) {
                return this.entityBase_[inst];
            };
            RigidBodyManager.prototype.transform = function (inst) {
                return this.transformBase_[inst];
            };
            RigidBodyManager.prototype.forEntity = function (ent) {
                return this.entityMap_.get(ent) || 0;
            };
            RigidBodyManager.prototype.setMass = function (inst, newMass, hullSize) {
                var massOver12 = newMass / 12.0;
                var ww = hullSize[0] * hullSize[0];
                var hh = hullSize[1] * hullSize[1];
                var dd = hullSize[2] * hullSize[2];
                var inertia = sd.mat3.create();
                inertia[0] = massOver12 * (hh + dd);
                inertia[4] = massOver12 * (ww + dd);
                inertia[8] = massOver12 * (ww + hh);
                var invInertia = sd.mat3.invert([], inertia);
                sd.container.setIndexedVec2(this.massBase_, inst, [newMass, 1 / newMass]);
                var doubleIndex = 2 * inst;
                sd.container.setIndexedMat3(this.inertiaBase_, doubleIndex, inertia);
                sd.container.setIndexedMat3(this.inertiaBase_, doubleIndex + 1, invInertia);
            };
            RigidBodyManager.prototype.mass = function (inst) {
                return sd.container.copyIndexedVec2(this.massBase_, inst)[0];
            };
            RigidBodyManager.prototype.inverseMass = function (inst) {
                return sd.container.copyIndexedVec2(this.massBase_, inst)[1];
            };
            RigidBodyManager.prototype.inertia = function (inst) {
                return sd.container.copyIndexedMat3(this.inertiaBase_, inst * 2);
            };
            RigidBodyManager.prototype.inverseInertia = function (inst) {
                return sd.container.copyIndexedMat3(this.inertiaBase_, 1 + inst * 2);
            };
            RigidBodyManager.prototype.velocity = function (inst) {
                return sd.container.copyIndexedVec3(this.velocityBase_, inst);
            };
            RigidBodyManager.prototype.setVelocity = function (inst, newVelocity) {
                sd.container.setIndexedVec3(this.velocityBase_, inst, newVelocity);
            };
            RigidBodyManager.prototype.angVelocity = function (inst) {
                return sd.container.copyIndexedVec3(this.angVelocityBase_, inst);
            };
            RigidBodyManager.prototype.setAngVelocity = function (inst, newAngVelocity) {
                sd.container.setIndexedVec3(this.angVelocityBase_, inst, newAngVelocity);
            };
            RigidBodyManager.prototype.stop = function (inst) {
                var zero3 = sd.vec3.zero();
                sd.container.setIndexedVec3(this.velocityBase_, inst, zero3);
                sd.container.setIndexedVec3(this.angVelocityBase_, inst, zero3);
            };
            RigidBodyManager.prototype.addForce = function (inst, force, forceCenterOffset) {
                var indexVec3 = sd.container.offsetOfIndexedVec3(inst);
                this.forceBase_[indexVec3 + 0] += force[0];
                this.forceBase_[indexVec3 + 1] += force[1];
                this.forceBase_[indexVec3 + 2] += force[2];
                if (forceCenterOffset) {
                    this.addTorque(inst, sd.vec3.cross([], forceCenterOffset, force));
                }
            };
            RigidBodyManager.prototype.addTorque = function (inst, torque) {
                var indexVec3 = sd.container.offsetOfIndexedVec3(inst);
                this.torqueBase_[indexVec3 + 0] += torque[0];
                this.torqueBase_[indexVec3 + 1] += torque[1];
                this.torqueBase_[indexVec3 + 2] += torque[2];
            };
            return RigidBodyManager;
        }());
        world.RigidBodyManager = RigidBodyManager;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var Scene = (function () {
            function Scene(rc) {
                this.physMatMgr = new world.PhysicsMaterialManager();
                this.entityMgr = new world.EntityManager();
                this.transformMgr = new world.TransformManager();
                this.meshMgr = new world.MeshManager(rc);
                this.skeletonMgr = new world.SkeletonManager(rc, this.transformMgr);
                this.lightMgr = new world.LightManager(rc, this.transformMgr);
                this.stdModelMgr = new world.StdModelManager(rc, this.transformMgr, this.meshMgr, this.skeletonMgr, this.lightMgr);
                this.pbrModelMgr = new world.PBRModelManager(rc, this.transformMgr, this.meshMgr, this.lightMgr);
                this.colliderMgr = new world.ColliderManager(this.physMatMgr);
                this.rigidBodyMgr = new world.RigidBodyManager(this.transformMgr);
            }
            Scene.prototype.makeEntity = function (desc) {
                var ent = this.entityMgr.create();
                var meshInstance = desc && desc.mesh ? this.meshMgr.create(desc.mesh) : undefined;
                if (meshInstance) {
                    this.meshMgr.linkToEntity(meshInstance, ent);
                }
                return {
                    entity: ent,
                    transform: this.transformMgr.create(ent, desc && desc.transform, desc && desc.parent),
                    mesh: meshInstance,
                    stdModel: desc && desc.stdModel ? this.stdModelMgr.create(ent, desc.stdModel) : undefined,
                    pbrModel: desc && desc.pbrModel ? this.pbrModelMgr.create(ent, desc.pbrModel) : undefined,
                    rigidBody: desc && desc.rigidBody ? this.rigidBodyMgr.create(ent, desc.rigidBody) : undefined,
                    collider: desc && desc.collider ? this.colliderMgr.create(ent, desc.collider) : undefined,
                    light: desc && desc.light ? this.lightMgr.create(ent, desc.light) : undefined
                };
            };
            return Scene;
        }());
        world.Scene = Scene;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var SkeletonManager = (function () {
            function SkeletonManager(rc, transformMgr_) {
                this.rc = rc;
                this.transformMgr_ = transformMgr_;
                this.nextSkelID_ = 1;
                this.nextAnimID_ = 1;
                this.skels_ = new Map();
                this.baseRotations_ = new Map();
                this.anims_ = new Map();
                this.jointData_ = new Float32Array(256 * 256 * 4);
                this.jointDataTex_ = new sd.render.Texture(rc, sd.render.makeTexDesc2DFloatLUT(this.jointData_, 256, 256));
            }
            SkeletonManager.prototype.createSkeleton = function (jointTransforms) {
                var txm = this.transformMgr_;
                this.skels_.set(this.nextSkelID_, jointTransforms.slice(0));
                var baseRots = [];
                var parent = txm.parent(jointTransforms[0]);
                var originWorldTransform = txm.worldMatrix(parent);
                var invOriginWorldTransform = sd.mat4.invert([], originWorldTransform);
                for (var _i = 0, jointTransforms_1 = jointTransforms; _i < jointTransforms_1.length; _i++) {
                    var tx = jointTransforms_1[_i];
                    var jmm = txm.copyWorldMatrix(tx);
                    sd.mat4.multiply(jmm, invOriginWorldTransform, jmm);
                    var modelSpaceRotQuat = sd.quat.fromMat3([], sd.mat3.fromMat4([], jmm));
                    baseRots.push(modelSpaceRotQuat);
                }
                this.baseRotations_.set(this.nextSkelID_, baseRots);
                this.updateJointData(this.nextSkelID_, jointTransforms);
                return this.nextSkelID_++;
            };
            SkeletonManager.prototype.createAnimation = function (skelAnim) {
                this.anims_.set(this.nextAnimID_, skelAnim);
                return this.nextAnimID_++;
            };
            SkeletonManager.prototype.updateJointData = function (_inst, skel) {
                var count = skel.length;
                var txm = this.transformMgr_;
                var texData = new Float32Array(256 * 16 * 4);
                var parent = txm.parent(skel[0]);
                var originWorldTransform = txm.worldMatrix(parent);
                var invOriginWorldTransform = sd.mat4.invert([], originWorldTransform);
                for (var ji = 0; ji < count; ++ji) {
                    var j = skel[ji];
                    var texelBaseIndex = ji * 8;
                    var xform = txm.copyWorldMatrix(j);
                    sd.mat4.multiply(xform, invOriginWorldTransform, xform);
                    sd.container.setIndexedVec4(texData, texelBaseIndex, txm.localRotation(j));
                    sd.container.setIndexedMat4(texData, (ji * 2) + 1, xform);
                }
                this.jointDataTex_.bind();
                this.rc.gl.texSubImage2D(this.jointDataTex_.target, 0, 0, 0, 256, 16, this.rc.gl.RGBA, this.rc.gl.FLOAT, texData);
                this.jointDataTex_.unbind();
            };
            SkeletonManager.prototype.applyAnimFrameToSkeleton = function (inst, animIndex, frameIndex) {
                this.applyInterpFramesToSkeleton(inst, animIndex, frameIndex, frameIndex + 1, 0);
            };
            SkeletonManager.prototype.applyInterpFramesToSkeleton = function (inst, animIndex, frameIndexA, frameIndexB, ratio) {
                var anim = this.anims_.get(animIndex);
                var skel = this.skels_.get(inst);
                var txm = this.transformMgr_;
                if (!(anim && skel)) {
                    return;
                }
                frameIndexA %= anim.frameCount;
                frameIndexB %= anim.frameCount;
                ratio = sd.math.clamp01(ratio);
                var posA, posB, posI = [];
                var rotA, rotB, rotI = [];
                for (var _i = 0, _a = anim.jointAnims; _i < _a.length; _i++) {
                    var j = _a[_i];
                    posA = posB = null;
                    rotA = rotB = null;
                    for (var _b = 0, _c = j.tracks; _b < _c.length; _b++) {
                        var t = _c[_b];
                        if (t.field == 1) {
                            posA = sd.container.copyIndexedVec3(t.key, frameIndexA);
                            posB = sd.container.copyIndexedVec3(t.key, frameIndexB);
                            sd.vec3.lerp(posI, posA, posB, ratio);
                        }
                        else if (t.field == 2) {
                            rotA = sd.container.copyIndexedVec4(t.key, frameIndexA);
                            rotB = sd.container.copyIndexedVec4(t.key, frameIndexB);
                            sd.quat.slerp(rotI, rotA, rotB, ratio);
                        }
                    }
                    if (posA && rotA) {
                        txm.setPositionAndRotation(skel[j.jointIndex], posI, rotI);
                    }
                    else if (posA) {
                        txm.setPosition(skel[j.jointIndex], posI);
                    }
                    else if (rotA) {
                        txm.setRotation(skel[j.jointIndex], rotI);
                    }
                }
                this.updateJointData(inst, skel);
            };
            Object.defineProperty(SkeletonManager.prototype, "jointDataTexture", {
                get: function () { return this.jointDataTex_; },
                enumerable: true,
                configurable: true
            });
            return SkeletonManager;
        }());
        world.SkeletonManager = SkeletonManager;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var Skybox = (function () {
            function Skybox(rc, transformMgr_, meshMgr, texture_) {
                this.rc = rc;
                this.transformMgr_ = transformMgr_;
                this.texture_ = texture_;
                this.modelViewProjectionMatrix_ = sd.mat4.create();
                this.vertexSource = [
                    "attribute vec3 vertexPos_model;",
                    "uniform mat4 modelViewProjectionMatrix;",
                    "varying vec3 vertexUV_intp;",
                    "void main() {",
                    "	vec4 vertexPos_cam = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);",
                    "	gl_Position = vertexPos_cam.xyww;",
                    "	vertexUV_intp = vertexPos_model;",
                    "}"
                ].join("\n");
                var pld = sd.render.makePipelineDescriptor();
                pld.vertexShader = sd.render.makeShader(rc, rc.gl.VERTEX_SHADER, this.vertexSource);
                pld.fragmentShader = sd.render.makeShader(rc, rc.gl.FRAGMENT_SHADER, this.fragmentSource(rc));
                pld.attributeNames.set(1, "vertexPos_model");
                this.pipeline_ = new sd.render.Pipeline(rc, pld);
                this.mvpMatrixUniform_ = rc.gl.getUniformLocation(this.pipeline_.program, "modelViewProjectionMatrix");
                this.textureCubeUniform_ = rc.gl.getUniformLocation(this.pipeline_.program, "skyboxMap");
                sd.assert(this.mvpMatrixUniform_ && this.textureCubeUniform_, "invalid skybox program");
                this.pipeline_.bind();
                this.rc.gl.uniform1i(this.textureCubeUniform_, 0);
                this.pipeline_.unbind();
                var sphereGen = new sd.meshdata.gen.Sphere({ radius: 400, rows: 10, segs: 15 });
                this.meshAsset_ = { name: "skyboxMesh", meshData: sd.meshdata.gen.generate(sphereGen, [sd.meshdata.attrPosition3()]) };
                this.mesh_ = meshMgr.create(this.meshAsset_);
            }
            Skybox.prototype.fragmentSource = function (rc) {
                return "\n\t\t\t\tprecision mediump float;\n\t\t\t\tvarying vec3 vertexUV_intp;\n\t\t\t\tuniform samplerCube skyboxMap;\n\t\t\t\tvoid main() {\n\t\t\t" + (rc.extSRGB ? "\n\t\t\t\t\tgl_FragColor = pow(textureCube(skyboxMap, vertexUV_intp), vec4(1.0 / 2.2));\n\t\t\t" : "\n\t\t\t\t\tgl_FragColor = textureCube(skyboxMap, vertexUV_intp);\n\t\t\t") + "\n\t\t\t\t}\n\t\t\t";
            };
            Skybox.prototype.setEntity = function (entity) {
                this.entity_ = entity;
                this.txInstance_ = this.transformMgr_.create(entity);
            };
            Object.defineProperty(Skybox.prototype, "entity", {
                get: function () {
                    return this.entity_;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Skybox.prototype, "transform", {
                get: function () {
                    return this.txInstance_;
                },
                enumerable: true,
                configurable: true
            });
            Skybox.prototype.setCenter = function (xyz) {
                this.transformMgr_.setPosition(this.txInstance_, xyz);
            };
            Skybox.prototype.setTexture = function (newTexture) {
                sd.assert(newTexture && newTexture.textureClass == 2);
                this.texture_ = newTexture;
            };
            Skybox.prototype.draw = function (rp, proj) {
                rp.setPipeline(this.pipeline_);
                rp.setTexture(this.texture_, 0);
                rp.setMesh(this.mesh_);
                rp.setDepthTest(4);
                rp.setFaceCulling(0);
                sd.mat4.multiply(this.modelViewProjectionMatrix_, proj.viewMatrix, this.transformMgr_.worldMatrix(this.txInstance_));
                sd.mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, this.modelViewProjectionMatrix_);
                this.rc.gl.uniformMatrix4fv(this.mvpMatrixUniform_, false, this.modelViewProjectionMatrix_);
                var primGroup0 = this.meshAsset_.meshData.primitiveGroups[0];
                rp.drawIndexedPrimitives(primGroup0.type, this.meshAsset_.meshData.indexBuffer.indexElementType, 0, primGroup0.elementCount);
                return 1;
            };
            return Skybox;
        }());
        world.Skybox = Skybox;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var StdMaterialManager = (function () {
            function StdMaterialManager() {
                this.diffuseMaps_ = [];
                this.specularMaps_ = [];
                this.normalMaps_ = [];
                this.tempVec4 = new Float32Array(4);
                var initialCapacity = 256;
                var fields = [
                    { type: sd.Float, count: 4 },
                    { type: sd.Float, count: 4 },
                    { type: sd.Float, count: 4 },
                    { type: sd.Float, count: 4 },
                    { type: sd.Float, count: 1 },
                    { type: sd.SInt32, count: 1 },
                ];
                this.instanceData_ = new sd.container.MultiArrayBuffer(initialCapacity, fields);
                this.rebase();
                this.assetMaterialMap_ = new WeakMap();
            }
            StdMaterialManager.prototype.rebase = function () {
                this.mainColourBase_ = this.instanceData_.indexedFieldView(0);
                this.specularBase_ = this.instanceData_.indexedFieldView(1);
                this.emissiveBase_ = this.instanceData_.indexedFieldView(2);
                this.texScaleOffsetBase_ = this.instanceData_.indexedFieldView(3);
                this.opacityBase_ = this.instanceData_.indexedFieldView(4);
                this.flagsBase_ = this.instanceData_.indexedFieldView(5);
            };
            StdMaterialManager.prototype.create = function (desc) {
                if (this.assetMaterialMap_.has(desc)) {
                    return this.assetMaterialMap_.get(desc);
                }
                if (this.instanceData_.extend() == 1) {
                    this.rebase();
                }
                var matIndex = this.instanceData_.count;
                sd.vec4.set(this.tempVec4, desc.baseColour[0], desc.baseColour[1], desc.baseColour[2], 0);
                sd.container.setIndexedVec4(this.mainColourBase_, matIndex, this.tempVec4);
                sd.vec4.set(this.tempVec4, desc.specularIntensity, desc.specularExponent, 0, 0);
                sd.container.setIndexedVec4(this.specularBase_, matIndex, this.tempVec4);
                sd.vec4.set(this.tempVec4, desc.emissiveColour[0], desc.emissiveColour[1], desc.emissiveColour[2], desc.emissiveIntensity);
                sd.container.setIndexedVec4(this.emissiveBase_, matIndex, this.tempVec4);
                sd.vec4.set(this.tempVec4, desc.textureScale[0], desc.textureScale[1], desc.textureOffset[0], desc.textureOffset[1]);
                sd.container.setIndexedVec4(this.texScaleOffsetBase_, matIndex, this.tempVec4);
                if ((desc.flags & 512) && (desc.flags & 256)) {
                    sd.assert(false, "Diffuse Alpha can't be both opacity and transparency");
                }
                this.flagsBase_[matIndex] = desc.flags;
                this.diffuseMaps_[matIndex] = desc.albedoTexture ? desc.albedoTexture.texture : null;
                this.specularMaps_[matIndex] = desc.specularTexture ? desc.specularTexture.texture : null;
                this.normalMaps_[matIndex] = desc.normalTexture ? desc.normalTexture.texture : null;
                this.opacityBase_[matIndex] = desc.opacity;
                this.assetMaterialMap_.set(desc, matIndex);
                return matIndex;
            };
            StdMaterialManager.prototype.destroy = function (inst) {
                var matIndex = inst;
                var zero4 = sd.vec4.zero();
                sd.container.setIndexedVec4(this.mainColourBase_, matIndex, zero4);
                sd.container.setIndexedVec4(this.specularBase_, matIndex, zero4);
                sd.container.setIndexedVec4(this.emissiveBase_, matIndex, zero4);
                sd.container.setIndexedVec4(this.texScaleOffsetBase_, matIndex, zero4);
                this.flagsBase_[matIndex] = 0;
                this.opacityBase_[matIndex] = 0;
                this.diffuseMaps_[matIndex] = null;
                this.specularMaps_[matIndex] = null;
                this.normalMaps_[matIndex] = null;
            };
            StdMaterialManager.prototype.destroyRange = function (range) {
                var iter = range.makeIterator();
                while (iter.next()) {
                    this.destroy(iter.current);
                }
            };
            Object.defineProperty(StdMaterialManager.prototype, "count", {
                get: function () { return this.instanceData_.count; },
                enumerable: true,
                configurable: true
            });
            StdMaterialManager.prototype.valid = function (inst) {
                return inst <= this.count;
            };
            StdMaterialManager.prototype.all = function () {
                return new world.InstanceLinearRange(1, this.count);
            };
            StdMaterialManager.prototype.mainColour = function (inst) {
                var offset = inst * 4;
                return [
                    this.mainColourBase_[offset],
                    this.mainColourBase_[offset + 1],
                    this.mainColourBase_[offset + 2]
                ];
            };
            StdMaterialManager.prototype.setMainColour = function (inst, newColour) {
                var offset = inst * 4;
                this.mainColourBase_[offset] = newColour[0];
                this.mainColourBase_[offset + 1] = newColour[1];
                this.mainColourBase_[offset + 2] = newColour[2];
            };
            StdMaterialManager.prototype.emissiveColour = function (inst) {
                var offset = inst * 4;
                return [
                    this.emissiveBase_[offset],
                    this.emissiveBase_[offset + 1],
                    this.emissiveBase_[offset + 2]
                ];
            };
            StdMaterialManager.prototype.setEmissiveColour = function (inst, newColour) {
                var offset = inst * 4;
                this.emissiveBase_[offset] = newColour[0];
                this.emissiveBase_[offset + 1] = newColour[1];
                this.emissiveBase_[offset + 2] = newColour[2];
            };
            StdMaterialManager.prototype.emissiveIntensity = function (inst) {
                return this.emissiveBase_[(inst * 4) + 3];
            };
            StdMaterialManager.prototype.setEmissiveIntensity = function (inst, newIntensity) {
                this.emissiveBase_[(inst * 4) + 3] = newIntensity;
            };
            StdMaterialManager.prototype.specularIntensity = function (inst) {
                return this.specularBase_[(inst * 4) + 0];
            };
            StdMaterialManager.prototype.setSpecularIntensity = function (inst, newIntensity) {
                this.specularBase_[(inst * 4) + 0] = newIntensity;
            };
            StdMaterialManager.prototype.specularExponent = function (inst) {
                return this.specularBase_[(inst * 4) + 1];
            };
            StdMaterialManager.prototype.setSpecularExponent = function (inst, newExponent) {
                this.specularBase_[(inst * 4) + 1] = newExponent;
            };
            StdMaterialManager.prototype.textureScale = function (inst) {
                var offset = inst * 4;
                return [this.texScaleOffsetBase_[offset], this.texScaleOffsetBase_[offset + 1]];
            };
            StdMaterialManager.prototype.setTextureScale = function (inst, newScale) {
                var offset = inst * 4;
                this.texScaleOffsetBase_[offset] = newScale[0];
                this.texScaleOffsetBase_[offset + 1] = newScale[1];
            };
            StdMaterialManager.prototype.textureOffset = function (inst) {
                var offset = inst * 4;
                return [this.texScaleOffsetBase_[offset + 2], this.texScaleOffsetBase_[offset + 3]];
            };
            StdMaterialManager.prototype.setTextureOffset = function (inst, newOffset) {
                var offset = inst * 4;
                this.texScaleOffsetBase_[offset + 2] = newOffset[0];
                this.texScaleOffsetBase_[offset + 3] = newOffset[1];
            };
            StdMaterialManager.prototype.diffuseMap = function (inst) {
                return this.diffuseMaps_[inst];
            };
            StdMaterialManager.prototype.setDiffuseMap = function (inst, newTex) {
                this.diffuseMaps_[inst] = newTex;
            };
            StdMaterialManager.prototype.specularMap = function (inst) {
                return this.specularMaps_[inst];
            };
            StdMaterialManager.prototype.setSpecularMap = function (inst, newTex) {
                this.specularMaps_[inst] = newTex;
            };
            StdMaterialManager.prototype.normalMap = function (inst) {
                return this.normalMaps_[inst];
            };
            StdMaterialManager.prototype.setNormalMap = function (inst, newTex) {
                this.normalMaps_[inst] = newTex;
            };
            StdMaterialManager.prototype.opacity = function (inst) {
                return this.opacityBase_[inst];
            };
            StdMaterialManager.prototype.setOpacity = function (inst, newOpacity) {
                this.opacityBase_[inst] = newOpacity;
            };
            StdMaterialManager.prototype.flags = function (inst) {
                return this.flagsBase_[inst];
            };
            StdMaterialManager.prototype.getData = function (inst) {
                var matIndex = inst;
                var colourOpacity = new Float32Array(sd.container.copyIndexedVec4(this.mainColourBase_, matIndex));
                colourOpacity[3] = this.opacityBase_[matIndex];
                return {
                    colourData: colourOpacity,
                    specularData: sd.container.refIndexedVec4(this.specularBase_, matIndex),
                    emissiveData: sd.container.refIndexedVec4(this.emissiveBase_, matIndex),
                    texScaleOffsetData: sd.container.refIndexedVec4(this.texScaleOffsetBase_, matIndex),
                    diffuseMap: this.diffuseMaps_[matIndex],
                    specularMap: this.specularMaps_[matIndex],
                    normalMap: this.normalMaps_[matIndex],
                    flags: this.flagsBase_[matIndex]
                };
            };
            return StdMaterialManager;
        }());
        world.StdMaterialManager = StdMaterialManager;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var StdPipeline = (function () {
            function StdPipeline(rc) {
                this.rc = rc;
                this.cachedPipelines_ = new Map();
                this.shadowPipeline_ = null;
                this.featureMask_ = 0x7fffffff;
                this.shadowVertexSource = "\n\t\t\tattribute vec3 vertexPos_model;\n\n\t\t\tvarying vec4 vertexPos_world;\n\n\t\t\tuniform mat4 modelMatrix;\n\t\t\tuniform mat4 lightViewProjectionMatrix;\n\n\t\t\tvoid main() {\n\t\t\t\tvertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);\n\t\t\t\tgl_Position = lightViewProjectionMatrix * vertexPos_world;\n\t\t\t}\n\t\t".trim();
                this.shadowFragmentSource = "\n\t\t\t#extension GL_OES_standard_derivatives : enable\n\t\t\tprecision highp float;\n\n\t\t\tvarying vec4 vertexPos_world;\n\n\t\t\tuniform mat4 lightViewMatrix;\n\n\t\t\tvoid main() {\n\t\t\t\tvec3 lightPos = (lightViewMatrix * vertexPos_world).xyz;\n\t\t\t\tfloat depth = clamp(length(lightPos) / 12.0, 0.0, 1.0);\n\t\t\t\tfloat dx = dFdx(depth);\n\t\t\t\tfloat dy = dFdy(depth);\n\t\t\t\tgl_FragColor = vec4(depth, depth * depth + 0.25 * (dx * dy + dy * dy), 0.0, 1.0);\n\t\t\t}\n\t\t".trim();
            }
            StdPipeline.prototype.disableFeatures = function (disableMask) {
                this.featureMask_ &= ~disableMask;
            };
            StdPipeline.prototype.enableFeatures = function (disableMask) {
                this.featureMask_ |= disableMask;
            };
            StdPipeline.prototype.enableAllFeatures = function () {
                this.featureMask_ = 0x7fffffff;
            };
            StdPipeline.prototype.pipelineForFeatures = function (feat) {
                feat &= this.featureMask_;
                var cached = this.cachedPipelines_.get(feat);
                if (cached) {
                    return cached;
                }
                var gl = this.rc.gl;
                var vertexSource = this.vertexShaderSource(feat);
                var fragmentSource = this.fragmentShaderSource(feat);
                var pld = sd.render.makePipelineDescriptor();
                pld.vertexShader = sd.render.makeShader(this.rc, gl.VERTEX_SHADER, vertexSource);
                pld.fragmentShader = sd.render.makeShader(this.rc, gl.FRAGMENT_SHADER, fragmentSource);
                pld.attributeNames.set(2, "vertexNormal");
                if (feat & 131072) {
                    pld.attributeNames.set(14, "vertexJointIndexes");
                    pld.attributeNames.set(10, "vertexWeightedPos0_joint");
                    pld.attributeNames.set(11, "vertexWeightedPos1_joint");
                    pld.attributeNames.set(12, "vertexWeightedPos2_joint");
                    pld.attributeNames.set(13, "vertexWeightedPos3_joint");
                }
                else {
                    pld.attributeNames.set(1, "vertexPos_model");
                }
                if (feat & 2) {
                    pld.attributeNames.set(4, "vertexColour");
                }
                if (feat & 1) {
                    pld.attributeNames.set(6, "vertexUV");
                }
                if (feat & 32768) {
                    pld.depthMask = false;
                    pld.blending = sd.render.makeColourBlendingDescriptor();
                    pld.blending.rgbBlendOp = 0;
                    pld.blending.alphaBlendOp = 0;
                    if (feat & 128) {
                        pld.blending.sourceRGBFactor = 6;
                        pld.blending.sourceAlphaFactor = 6;
                        pld.blending.destRGBFactor = 7;
                        pld.blending.destAlphaFactor = 7;
                    }
                    else {
                        pld.blending.sourceRGBFactor = 13;
                        pld.blending.sourceAlphaFactor = 13;
                        pld.blending.destRGBFactor = 14;
                        pld.blending.destAlphaFactor = 14;
                        pld.blending.constantColour[3] = 0.35;
                    }
                }
                var pipeline = new sd.render.Pipeline(this.rc, pld);
                var program = pipeline.program;
                gl.useProgram(program);
                program.modelMatrixUniform = gl.getUniformLocation(program, "modelMatrix");
                program.mvMatrixUniform = gl.getUniformLocation(program, "modelViewMatrix");
                program.mvpMatrixUniform = gl.getUniformLocation(program, "modelViewProjectionMatrix");
                program.normalMatrixUniform = gl.getUniformLocation(program, "normalMatrix");
                program.mainColourUniform = gl.getUniformLocation(program, "mainColour");
                program.specularUniform = gl.getUniformLocation(program, "specular");
                program.emissiveDataUniform = gl.getUniformLocation(program, "emissiveData");
                program.texScaleOffsetUniform = gl.getUniformLocation(program, "texScaleOffset");
                program.colourMapUniform = gl.getUniformLocation(program, "diffuseSampler");
                if (program.colourMapUniform) {
                    gl.uniform1i(program.colourMapUniform, 0);
                }
                program.normalMapUniform = gl.getUniformLocation(program, "normalSampler");
                if (program.normalMapUniform) {
                    gl.uniform1i(program.normalMapUniform, 1);
                }
                program.specularMapUniform = gl.getUniformLocation(program, "specularSampler");
                if (program.specularMapUniform) {
                    gl.uniform1i(program.specularMapUniform, 2);
                }
                program.shadowMapUniform = gl.getUniformLocation(program, "shadowSampler");
                if (program.shadowMapUniform) {
                    gl.uniform1i(program.shadowMapUniform, 3);
                }
                program.jointDataUniform = gl.getUniformLocation(program, "jointData");
                program.jointIndexOffsetUniform = gl.getUniformLocation(program, "jointIndexOffset");
                if (program.jointDataUniform) {
                    gl.uniform1i(program.jointDataUniform, 4);
                    gl.uniform1i(program.jointIndexOffsetUniform, 0);
                }
                program.lightLUTUniform = gl.getUniformLocation(program, "lightLUTSampler");
                if (program.lightLUTUniform) {
                    gl.uniform1i(program.lightLUTUniform, 5);
                }
                program.lightLUTParamUniform = gl.getUniformLocation(program, "lightLUTParam");
                program.shadowCastingLightIndexUniform = gl.getUniformLocation(program, "shadowCastingLightIndex");
                if (program.shadowCastingLightIndexUniform) {
                    gl.uniform1i(program.shadowCastingLightIndexUniform, -1);
                }
                program.shadowMapUniform = gl.getUniformLocation(program, "shadowSampler");
                if (program.shadowMapUniform) {
                    gl.uniform1i(program.shadowMapUniform, 3);
                }
                program.lightProjMatrixUniform = gl.getUniformLocation(program, "lightProjMatrix");
                program.lightViewMatrixUniform = gl.getUniformLocation(program, "lightViewMatrix");
                program.fogColourUniform = gl.getUniformLocation(program, "fogColour");
                program.fogParamsUniform = gl.getUniformLocation(program, "fogParams");
                gl.useProgram(null);
                this.cachedPipelines_.set(feat, pipeline);
                return pipeline;
            };
            StdPipeline.prototype.shadowPipeline = function () {
                if (this.shadowPipeline_ == null) {
                    var pld = sd.render.makePipelineDescriptor();
                    pld.vertexShader = sd.render.makeShader(this.rc, this.rc.gl.VERTEX_SHADER, this.shadowVertexSource);
                    pld.fragmentShader = sd.render.makeShader(this.rc, this.rc.gl.FRAGMENT_SHADER, this.shadowFragmentSource);
                    pld.attributeNames.set(1, "vertexPos_model");
                    this.shadowPipeline_ = new sd.render.Pipeline(this.rc, pld);
                    var program = this.shadowPipeline_.program;
                    program.modelMatrixUniform = this.rc.gl.getUniformLocation(program, "modelMatrix");
                    program.lightViewProjectionMatrixUniform = this.rc.gl.getUniformLocation(program, "lightViewProjectionMatrix");
                    program.lightViewMatrixUniform = this.rc.gl.getUniformLocation(program, "lightViewMatrix");
                }
                return this.shadowPipeline_;
            };
            StdPipeline.prototype.vertexShaderSource = function (feat) {
                var source = [];
                var line = function (s) { return source.push(s); };
                var if_all = function (s, f) { if ((feat & f) == f) {
                    source.push(s);
                } };
                if (feat & 131072) {
                    line("attribute vec4 vertexWeightedPos0_joint;");
                    line("attribute vec4 vertexWeightedPos1_joint;");
                    line("attribute vec4 vertexWeightedPos2_joint;");
                    line("attribute vec4 vertexWeightedPos3_joint;");
                    line("attribute vec4 vertexJointIndexes;");
                }
                else {
                    line("attribute vec3 vertexPos_model;");
                }
                line("attribute vec3 vertexNormal;");
                if_all("attribute vec2 vertexUV;", 1);
                if_all("attribute vec3 vertexColour;", 2);
                line("varying vec3 vertexNormal_cam;");
                line("varying vec4 vertexPos_world;");
                line("varying vec3 vertexPos_cam;");
                if_all("varying vec2 vertexUV_intp;", 1);
                if_all("varying vec3 vertexColour_intp;", 2);
                line("uniform mat4 modelMatrix;");
                line("uniform mat4 modelViewMatrix;");
                line("uniform mat4 modelViewProjectionMatrix;");
                line("uniform mat3 normalMatrix;");
                if_all("uniform vec4 texScaleOffset;", 1);
                if_all("uniform sampler2D jointData;", 131072);
                if_all("uniform int jointIndexOffset;", 131072);
                if (feat & 131072) {
                    line("vec3 transformQuat(vec3 a, vec4 q) {");
                    line("	float ix = q.w * a.x + q.y * a.z - q.z * a.y;");
                    line("	float iy = q.w * a.y + q.z * a.x - q.x * a.z;");
                    line("	float iz = q.w * a.z + q.x * a.y - q.y * a.x;");
                    line("	float iw = -q.x * a.x - q.y * a.y - q.z * a.z;");
                    line("	vec3 result;");
                    line("	result.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;");
                    line("	result.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;");
                    line("	result.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;");
                    line("	return result;");
                    line("}");
                    line("struct Joint {");
                    line("	vec4 rotation_joint;");
                    line("	mat4 transform_model;");
                    line("};");
                    line("Joint getIndexedJoint(float jointIndex) {");
                    line("	float row = (floor(jointIndex / 32.0) + 0.5) / 256.0;");
                    line("	float col = (mod(jointIndex, 32.0) * 8.0) + 0.5;");
                    line("	Joint j;");
                    line("	j.rotation_joint = texture2D(jointData, vec2(col / 256.0, row));");
                    line("	j.transform_model[0] = texture2D(jointData, vec2((col + 4.0) / 256.0, row));");
                    line("	j.transform_model[1] = texture2D(jointData, vec2((col + 5.0) / 256.0, row));");
                    line("	j.transform_model[2] = texture2D(jointData, vec2((col + 6.0) / 256.0, row));");
                    line("	j.transform_model[3] = texture2D(jointData, vec2((col + 7.0) / 256.0, row));");
                    line("	return j;");
                    line("}");
                }
                line("void main() {");
                if (feat & 131072) {
                    line("	vec3 vertexPos_model = vec3(0.0);");
                    line("	vec3 vertexNormal_final = vec3(0.0);");
                    line("	vec4 weightedPos_joint[4];");
                    line("	weightedPos_joint[0] = vertexWeightedPos0_joint;");
                    line("	weightedPos_joint[1] = vertexWeightedPos1_joint;");
                    line("	weightedPos_joint[2] = vertexWeightedPos2_joint;");
                    line("	weightedPos_joint[3] = vertexWeightedPos3_joint;");
                    line("	for (int vji = 0; vji < 4; ++vji) {");
                    line("		float jointIndex = vertexJointIndexes[vji];");
                    line("		if (jointIndex >= 0.0) {");
                    line("			Joint j = getIndexedJoint(jointIndex);");
                    line("			vec4 weightedPos = weightedPos_joint[vji];");
                    line("			vec3 tempPos = (j.transform_model * vec4(weightedPos.xyz, 1.0)).xyz;");
                    line("			vertexPos_model += tempPos * weightedPos.w;");
                    line("			vec3 vertexNormal_joint = transformQuat(vertexNormal, j.rotation_joint);");
                    line("			vertexNormal_final += vertexNormal_joint * weightedPos.w;");
                    line("		}");
                    line("	}");
                    line("	vertexNormal_final = normalize(vertexNormal_final);");
                }
                else {
                    line("	vec3 vertexNormal_final = vertexNormal;");
                }
                line("	gl_Position = modelViewProjectionMatrix * vec4(vertexPos_model, 1.0);");
                line("	vertexPos_world = modelMatrix * vec4(vertexPos_model, 1.0);");
                line("	vertexNormal_cam = normalMatrix * vertexNormal_final;");
                line("	vertexPos_cam = (modelViewMatrix * vec4(vertexPos_model, 1.0)).xyz;");
                if_all("	vertexUV_intp = (vertexUV * texScaleOffset.xy) + texScaleOffset.zw;", 1);
                if_all("	vertexColour_intp = vertexColour;", 2);
                line("}");
                return source.join("\n") + "\n";
            };
            StdPipeline.prototype.fragmentShaderSource = function (feat) {
                var source = [];
                var line = function (s) { return source.push(s); };
                var if_all = function (s, f) { if ((feat & f) == f) {
                    source.push(s);
                } };
                if_all("#extension GL_OES_standard_derivatives : require", 512);
                line("precision highp float;");
                line("varying vec4 vertexPos_world;");
                line("varying vec3 vertexNormal_cam;");
                line("varying vec3 vertexPos_cam;");
                if_all("varying vec2 vertexUV_intp;", 1);
                if_all("varying vec3 vertexColour_intp;", 2);
                line("uniform vec4 mainColour;");
                if_all("uniform vec4 specular;", 8);
                if_all("uniform vec4 emissiveData;", 4);
                if_all("uniform sampler2D diffuseSampler;", 32);
                if_all("uniform sampler2D normalSampler;", 512);
                if_all("uniform sampler2D specularSampler;", 16);
                if_all("uniform mat4 lightViewMatrix;", 4096);
                if_all("uniform mat4 lightProjMatrix;", 4096);
                if_all("uniform sampler2D shadowSampler;", 4096);
                if_all("uniform int shadowCastingLightIndex;", 4096);
                line("const int SPEC_INTENSITY = 0;");
                line("const int SPEC_EXPONENT = 1;");
                line("uniform sampler2D lightLUTSampler;");
                line("uniform vec2 lightLUTParam;");
                if (feat & 16384) {
                    line("const int FOGPARAM_START = 0;");
                    line("const int FOGPARAM_DEPTH = 1;");
                    line("const int FOGPARAM_DENSITY = 2;");
                    line("uniform vec4 fogColour;");
                    line("uniform vec4 fogParams;");
                }
                line("struct LightEntry {");
                line("	vec4 colourAndType;");
                line("	vec4 positionCamAndIntensity;");
                line("	vec4 positionWorldAndRange;");
                line("	vec4 directionAndCutoff;");
                line("	vec4 shadowStrengthBias;");
                line("};");
                line("LightEntry getLightEntry(float lightIx) {");
                line("\tfloat row = (floor(lightIx / 128.0) + 0.5) / 512.0;");
                line("\tfloat col = (mod(lightIx, 128.0) * 5.0) + 0.5;");
                line("	LightEntry le;");
                line("	le.colourAndType = texture2D(lightLUTSampler, vec2(col / 640.0, row));");
                line("	le.positionCamAndIntensity = texture2D(lightLUTSampler, vec2((col + 1.0) / 640.0, row));");
                line("	le.positionWorldAndRange = texture2D(lightLUTSampler, vec2((col + 2.0) / 640.0, row));");
                line("	le.directionAndCutoff = texture2D(lightLUTSampler, vec2((col + 3.0) / 640.0, row));");
                line("	le.shadowStrengthBias = texture2D(lightLUTSampler, vec2((col + 4.0) / 640.0, row));");
                line("	return le;");
                line("}");
                line("float getLightIndex(float listIndex) {");
                line("\tfloat liRow = (floor(listIndex / 2560.0) + 256.0 + 0.5) / 512.0;");
                line("\tfloat rowElementIndex = mod(listIndex, 2560.0);");
                line("\tfloat liCol = (floor(rowElementIndex / 4.0) + 0.5) / 640.0;");
                line("\tfloat element = floor(mod(rowElementIndex, 4.0));");
                line("	vec4 packedIndices = texture2D(lightLUTSampler, vec2(liCol, liRow));");
                line("	if (element < 1.0) return packedIndices[0];");
                line("	if (element < 2.0) return packedIndices[1];");
                line("	if (element < 3.0) return packedIndices[2];");
                line("	return packedIndices[3];");
                line("}");
                line("vec2 getLightGridCell(vec2 fragCoord) {");
                line("	vec2 lightGridPos = vec2(floor(fragCoord.x / 32.0), floor(fragCoord.y / 32.0));");
                line("	float lightGridIndex = (lightGridPos.y * lightLUTParam.x) + lightGridPos.x;");
                line("\tfloat lgRow = (floor(lightGridIndex / 1280.0) + 256.0 + 240.0 + 0.5) / 512.0;");
                line("\tfloat rowPairIndex = mod(lightGridIndex, 1280.0);");
                line("\tfloat lgCol = (floor(rowPairIndex / 2.0) + 0.5) / 640.0;");
                line("\tfloat pair = floor(mod(rowPairIndex, 2.0));");
                line("	vec4 cellPair = texture2D(lightLUTSampler, vec2(lgCol, lgRow));");
                line("	if (pair < 1.0) return cellPair.xy;");
                line("	return cellPair.zw;");
                line("}");
                line("vec3 calcLightShared(vec3 lightColour, float intensity, float diffuseStrength, vec3 lightDirection, vec3 normal_cam) {");
                line("	float NdL = max(0.0, dot(normal_cam, -lightDirection));");
                line("	vec3 diffuseContrib = lightColour * diffuseStrength * NdL * intensity;");
                if (feat & 8) {
                    line("	vec3 specularContrib = vec3(0.0);");
                    line("	vec3 viewVec = normalize(-vertexPos_cam);");
                    line("	vec3 reflectVec = reflect(lightDirection, normal_cam);");
                    line("	float specularStrength = dot(viewVec, reflectVec);");
                    line("	if (specularStrength > 0.0) {");
                    if (feat & 16) {
                        line("		vec3 specularColour = texture2D(specularSampler, vertexUV_intp).xyz;");
                    }
                    else {
                        line("		vec3 specularColour = lightColour;");
                    }
                    line("		specularStrength = pow(specularStrength, specular[SPEC_EXPONENT]) * diffuseStrength;");
                    line("		specularContrib = specularColour * specularStrength * specular[SPEC_INTENSITY];");
                    line("	}");
                    line("	return diffuseContrib + specularContrib;");
                }
                else {
                    line("	return diffuseContrib;");
                }
                line("}");
                line("vec3 calcPointLight(vec3 lightColour, float intensity, float range, vec3 lightPos_cam, vec3 lightPos_world, vec3 normal_cam) {");
                line("	float distance = length(vertexPos_world.xyz - lightPos_world);");
                line("	vec3 lightDirection_cam = normalize(vertexPos_cam - lightPos_cam);");
                line("	float attenuation = clamp(1.0 - distance / range, 0.0, 1.0);");
                line("	attenuation *= attenuation;");
                line("	return calcLightShared(lightColour, intensity, attenuation, lightDirection_cam, normal_cam);");
                line("}");
                line("vec3 calcSpotLight(vec3 lightColour, float intensity, float range, float cutoff, vec3 lightPos_cam, vec3 lightPos_world, vec3 lightDirection, vec3 normal_cam) {");
                line("	vec3 lightToPoint = normalize(vertexPos_cam - lightPos_cam);");
                line("	float spotCosAngle = dot(lightToPoint, lightDirection);");
                line("	if (spotCosAngle > cutoff) {");
                line("		vec3 light = calcPointLight(lightColour, intensity, range, lightPos_cam, lightPos_world, normal_cam);");
                line("		return light * smoothstep(cutoff, cutoff + 0.006, spotCosAngle);");
                line("	}");
                line("	return vec3(0.0);");
                line("}");
                line("vec3 getLightContribution(LightEntry light, vec3 normal_cam) {");
                line("	vec3 colour = light.colourAndType.xyz;");
                line("	float type = light.colourAndType.w;");
                line("	vec3 lightPos_cam = light.positionCamAndIntensity.xyz;");
                line("	float intensity = light.positionCamAndIntensity.w;");
                line("\tif (type == " + 1 + ".0) {");
                line("		return calcLightShared(colour, intensity, 1.0, light.directionAndCutoff.xyz, normal_cam);");
                line("	}");
                line("	vec3 lightPos_world = light.positionWorldAndRange.xyz;");
                line("	float range = light.positionWorldAndRange.w;");
                line("\tif (type == " + 2 + ".0) {");
                line("		return calcPointLight(colour, intensity, range, lightPos_cam, lightPos_world, normal_cam);");
                line("	}");
                line("	float cutoff = light.directionAndCutoff.w;");
                line("\tif (type == " + 3 + ".0) {");
                line("		return calcSpotLight(colour, intensity, range, cutoff, lightPos_cam, lightPos_world, light.directionAndCutoff.xyz, normal_cam);");
                line("	}");
                line("	return vec3(0.0);");
                line("}");
                if (feat & 512) {
                    line("mat3 cotangentFrame(vec3 N, vec3 p, vec2 uv) {");
                    line("	// get edge vectors of the pixel triangle");
                    line("	vec3 dp1 = dFdx(p);");
                    line("	vec3 dp2 = dFdy(p);");
                    line("	vec2 duv1 = dFdx(uv);");
                    line("	vec2 duv2 = dFdy(uv);");
                    line("	// solve the linear system");
                    line("	vec3 dp2perp = cross(dp2, N);");
                    line("	vec3 dp1perp = cross(N, dp1);");
                    line("	vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;");
                    line("	vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;");
                    line("	// construct a scale-invariant frame ");
                    line("	float invmax = inversesqrt(max(dot(T, T), dot(B, B)));");
                    line("	return mat3(T * invmax, B * invmax, N);");
                    line("}");
                    line("vec3 perturbNormal(vec3 N, vec3 V, vec2 uv) {");
                    line("	// assume N, the interpolated vertex normal and ");
                    line("	// V, the view vector (vertex to eye)");
                    line("	vec3 map = texture2D(normalSampler, uv).xyz * 2.0 - 1.0;");
                    line("	map.y = -map.y;");
                    line("	mat3 TBN = cotangentFrame(N, V, uv);");
                    line("	return normalize(TBN * map);");
                    line("}");
                }
                if (feat & 4096) {
                    line("\n\t\t\t\t\tfloat linstep(float low, float high, float v) {\n\t\t\t\t\t\treturn clamp((v-low) / (high-low), 0.0, 1.0);\n\t\t\t\t\t}\n\n\t\t\t\t\tfloat VSM(vec2 uv, float compare, float strength, float bias) {\n\t\t\t\t\t\tvec2 moments = texture2D(shadowSampler, uv).xy;\n\t\t\t\t\t\tfloat p = smoothstep(compare - bias, compare, moments.x);\n\t\t\t\t\t\tfloat variance = max(moments.y - moments.x*moments.x, -0.001);\n\t\t\t\t\t\tfloat d = compare - moments.x;\n\t\t\t\t\t\tfloat p_max = linstep(0.2, 1.0, variance / (variance + d*d));\n\t\t\t\t\t\treturn clamp(max(p, p_max), 0.0, 1.0);\n\t\t\t\t\t}\n\t\t\t\t");
                }
                line("void main() {");
                line("	float fragOpacity = 1.0;");
                if (feat & 32) {
                    if (feat & (64 | 128)) {
                        line("	vec4 texColourA = texture2D(diffuseSampler, vertexUV_intp);");
                        line("	vec3 texColour = texColourA.rgb;");
                        if (feat & 64) {
                            line("	if (texColourA.a < 0.1) {");
                            line("		discard;");
                            line("	}");
                        }
                        else {
                            line("	fragOpacity = texColourA.a;");
                        }
                    }
                    else {
                        line("	vec3 texColour = texture2D(diffuseSampler, vertexUV_intp).xyz;");
                    }
                    if (feat & 2) {
                        line("	vec3 matColour = vertexColour_intp * texColour * mainColour.rgb;");
                    }
                    else {
                        line("	vec3 matColour = texColour * mainColour.rgb;");
                    }
                }
                else if (feat & 2) {
                    line("	vec3 matColour = vertexColour_intp * mainColour.rgb;");
                }
                else {
                    line("	vec3 matColour = mainColour.rgb;");
                }
                line("	vec3 normal_cam = normalize(vertexNormal_cam);");
                if_all("	normal_cam = perturbNormal(normal_cam, vertexPos_cam, vertexUV_intp);", 512);
                line("	vec3 totalLight = vec3(0.0);");
                if (feat & 4) {
                    line("	totalLight += (emissiveData.rgb * emissiveData.w);");
                }
                line("	vec2 fragCoord = vec2(gl_FragCoord.x, lightLUTParam.y - gl_FragCoord.y);");
                line("	vec2 lightOffsetCount = getLightGridCell(fragCoord);");
                line("	int lightListOffset = int(lightOffsetCount.x);");
                line("	int lightListCount = int(lightOffsetCount.y);");
                line("	for (int llix = 0; llix < 128; ++llix) {");
                line("		if (llix == lightListCount) break;");
                line("		float lightIx = getLightIndex(float(lightListOffset + llix));");
                line("		LightEntry lightData = getLightEntry(lightIx);");
                line("		if (lightData.colourAndType.w <= 0.0) break;");
                line("		float shadowFactor = 1.0;");
                if (feat & 4096) {
                    line("		if (int(lightIx) == shadowCastingLightIndex) {");
                    line("			float shadowStrength = lightData.shadowStrengthBias.x;");
                    line("			float shadowBias = lightData.shadowStrengthBias.y;");
                    line("			vec3 lightPos = (lightViewMatrix * vertexPos_world).xyz;");
                    line("			vec4 lightDevice = lightProjMatrix * vec4(lightPos, 1.0);");
                    line("			vec2 lightDeviceNormal = lightDevice.xy / lightDevice.w;");
                    line("			vec2 lightUV = lightDeviceNormal * 0.5 + 0.5;");
                    line("			float lightTest = clamp(length(lightPos) / 12.0, 0.0, 1.0);");
                    line("			shadowFactor = VSM(lightUV, lightTest, shadowStrength, shadowBias);");
                    line("		}");
                }
                line("		totalLight += getLightContribution(lightData, normal_cam) * shadowFactor;");
                line("	}");
                if (feat & 16384) {
                    line("	float fogDensity = clamp((length(vertexPos_cam) - fogParams[FOGPARAM_START]) / fogParams[FOGPARAM_DEPTH], 0.0, fogParams[FOGPARAM_DENSITY]);");
                    line("	totalLight = mix(totalLight * matColour, fogColour.rgb, fogDensity);");
                }
                else {
                    line("	totalLight = totalLight * matColour;");
                }
                line("	gl_FragColor = vec4(pow(totalLight, vec3(1.0 / 2.2)), fragOpacity);");
                line("}");
                return source.join("\n") + "\n";
            };
            return StdPipeline;
        }());
        var StdModelManager = (function () {
            function StdModelManager(rc, transformMgr_, meshMgr_, skeletonMgr_, lightMgr_) {
                this.rc = rc;
                this.transformMgr_ = transformMgr_;
                this.meshMgr_ = meshMgr_;
                this.skeletonMgr_ = skeletonMgr_;
                this.lightMgr_ = lightMgr_;
                this.shadowCastingLightIndex_ = 0;
                this.modelViewMatrix_ = sd.mat4.create();
                this.modelViewProjectionMatrix_ = sd.mat4.create();
                this.normalMatrix_ = sd.mat3.create();
                this.stdPipeline_ = new StdPipeline(rc);
                this.materialMgr_ = new world.StdMaterialManager();
                var instFields = [
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.UInt8, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                ];
                this.instanceData_ = new sd.container.MultiArrayBuffer(1024, instFields);
                var groupFields = [
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                ];
                this.primGroupData_ = new sd.container.MultiArrayBuffer(2048, groupFields);
                this.rebase();
                this.groupRebase();
                this.materials_ = [];
            }
            StdModelManager.prototype.rebase = function () {
                this.entityBase_ = this.instanceData_.indexedFieldView(0);
                this.transformBase_ = this.instanceData_.indexedFieldView(1);
                this.enabledBase_ = this.instanceData_.indexedFieldView(2);
                this.shadowFlagBase_ = this.instanceData_.indexedFieldView(3);
                this.materialOffsetCountBase_ = this.instanceData_.indexedFieldView(4);
                this.primGroupOffsetBase_ = this.instanceData_.indexedFieldView(5);
            };
            StdModelManager.prototype.groupRebase = function () {
                this.primGroupMaterialBase_ = this.primGroupData_.indexedFieldView(0);
                this.primGroupFeatureBase_ = this.primGroupData_.indexedFieldView(1);
            };
            StdModelManager.prototype.featuresForMeshAndMaterial = function (mesh, material) {
                var features = 0;
                var meshFeatures = this.meshMgr_.features(mesh);
                if (meshFeatures & 16) {
                    features |= 2;
                }
                if (meshFeatures & 8) {
                    features |= 1;
                }
                var matFlags = this.materialMgr_.flags(material);
                if (matFlags & 1) {
                    features |= 8;
                }
                if (matFlags & 2) {
                    features |= 4;
                }
                if (matFlags & 256) {
                    features |= 64;
                }
                if (matFlags & 4) {
                    features |= 32768;
                    if (matFlags & 512) {
                        features |= 128;
                    }
                }
                if (this.materialMgr_.diffuseMap(material)) {
                    features |= 32;
                }
                if (this.materialMgr_.normalMap(material)) {
                    features |= 512;
                }
                if (this.materialMgr_.specularMap(material)) {
                    features |= 16 | 8;
                }
                if (this.materialMgr_.flags(material) & 4096) {
                    features |= 131072;
                }
                if ((features & (1 | 32)) != (1 | 32)) {
                    features &= ~(1 | 32);
                }
                if (!(features & 32)) {
                    features &= ~64;
                    features &= ~128;
                }
                return features;
            };
            StdModelManager.prototype.updatePrimGroups = function (modelIx) {
                var _this = this;
                var mesh = this.meshMgr_.forEntity(this.entityBase_[modelIx]);
                if (!mesh) {
                    return;
                }
                var groups = this.meshMgr_.primitiveGroups(mesh);
                var materialsOffsetCount = sd.container.copyIndexedVec2(this.materialOffsetCountBase_, modelIx);
                var materialsOffset = materialsOffsetCount[0];
                var materialCount = materialsOffsetCount[1];
                var maxLocalMatIndex = groups.reduce(function (cur, group) { return Math.max(cur, group.materialIx); }, 0);
                sd.assert(materialCount >= maxLocalMatIndex - 1, "not enough StdMaterialIndexes for this mesh");
                var primGroupCount = this.primGroupData_.count;
                this.primGroupOffsetBase_[modelIx] = this.primGroupData_.count;
                if (this.primGroupData_.resize(primGroupCount + groups.length) == 1) {
                    this.groupRebase();
                }
                groups.forEach(function (group) {
                    _this.primGroupFeatureBase_[primGroupCount] = _this.featuresForMeshAndMaterial(mesh, _this.materials_[materialsOffset + group.materialIx]);
                    _this.primGroupMaterialBase_[primGroupCount] = _this.materials_[materialsOffset + group.materialIx];
                    primGroupCount += 1;
                });
            };
            StdModelManager.prototype.create = function (entity, desc) {
                if (this.instanceData_.extend() == 1) {
                    this.rebase();
                }
                var ix = this.instanceData_.count;
                this.entityBase_[ix] = entity;
                this.transformBase_[ix] = this.transformMgr_.forEntity(entity);
                this.enabledBase_[ix] = +true;
                this.shadowFlagBase_[ix] = 0;
                sd.container.setIndexedVec2(this.materialOffsetCountBase_, ix, [this.materials_.length, desc.materials.length]);
                for (var _i = 0, _a = desc.materials; _i < _a.length; _i++) {
                    var mat = _a[_i];
                    this.materials_.push(this.materialMgr_.create(mat));
                }
                this.updatePrimGroups(ix);
                return ix;
            };
            StdModelManager.prototype.destroy = function (_inst) {
            };
            StdModelManager.prototype.destroyRange = function (range) {
                var iter = range.makeIterator();
                while (iter.next()) {
                    this.destroy(iter.current);
                }
            };
            Object.defineProperty(StdModelManager.prototype, "count", {
                get: function () {
                    return this.instanceData_.count;
                },
                enumerable: true,
                configurable: true
            });
            StdModelManager.prototype.valid = function (inst) {
                return inst <= this.count;
            };
            StdModelManager.prototype.all = function () {
                return new world.InstanceLinearRange(1, this.count);
            };
            StdModelManager.prototype.entity = function (inst) {
                return this.entityBase_[inst];
            };
            StdModelManager.prototype.transform = function (inst) {
                return this.transformBase_[inst];
            };
            StdModelManager.prototype.enabled = function (inst) {
                return this.enabledBase_[inst] != 0;
            };
            StdModelManager.prototype.setEnabled = function (inst, newEnabled) {
                this.enabledBase_[inst] = +newEnabled;
            };
            StdModelManager.prototype.shadowCaster = function () {
                return this.shadowCastingLightIndex_;
            };
            StdModelManager.prototype.setShadowCaster = function (inst) {
                this.shadowCastingLightIndex_ = inst;
            };
            StdModelManager.prototype.disableRenderFeature = function (f) {
                if (f == 1) {
                    this.stdPipeline_.disableFeatures(512);
                }
            };
            StdModelManager.prototype.enableRenderFeature = function (f) {
                if (f == 1) {
                    this.stdPipeline_.enableFeatures(512);
                }
            };
            StdModelManager.prototype.drawSingleForward = function (rp, proj, shadow, fogSpec, modelIx) {
                var gl = this.rc.gl;
                var drawCalls = 0;
                var mesh = this.meshMgr_.forEntity(this.entityBase_[modelIx]);
                if (!mesh) {
                    return 0;
                }
                var modelMatrix = this.transformMgr_.worldMatrix(this.transformBase_[modelIx]);
                sd.mat4.multiply(this.modelViewMatrix_, proj.viewMatrix, modelMatrix);
                sd.mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, this.modelViewMatrix_);
                var meshPrimitiveGroups = this.meshMgr_.primitiveGroups(mesh);
                var primGroupBase = this.primGroupOffsetBase_[modelIx];
                var primGroupCount = meshPrimitiveGroups.length;
                for (var pgIx = 0; pgIx < primGroupCount; ++pgIx) {
                    var primGroup = meshPrimitiveGroups[pgIx];
                    var matInst = this.primGroupMaterialBase_[primGroupBase + pgIx];
                    var materialData = this.materialMgr_.getData(matInst);
                    var features = this.primGroupFeatureBase_[primGroupBase + pgIx];
                    if (shadow) {
                        features |= 4096;
                    }
                    if (fogSpec) {
                        features |= 16384;
                    }
                    var pipeline = this.stdPipeline_.pipelineForFeatures(features);
                    if ((features & (32768 | 128)) === 32768) {
                    }
                    rp.setPipeline(pipeline);
                    rp.setMesh(mesh);
                    var program = (pipeline.program);
                    gl.uniformMatrix4fv(program.modelMatrixUniform, false, modelMatrix);
                    gl.uniformMatrix4fv(program.mvpMatrixUniform, false, this.modelViewProjectionMatrix_);
                    sd.mat3.normalFromMat4(this.normalMatrix_, this.modelViewMatrix_);
                    gl.uniformMatrix3fv(program.normalMatrixUniform, false, this.normalMatrix_);
                    if (program.mvMatrixUniform) {
                        gl.uniformMatrix4fv(program.mvMatrixUniform, false, this.modelViewMatrix_);
                    }
                    gl.uniform4fv(program.mainColourUniform, materialData.colourData);
                    if (features & 8) {
                        gl.uniform4fv(program.specularUniform, materialData.specularData);
                    }
                    if (features & 4) {
                        gl.uniform4fv(program.emissiveDataUniform, materialData.emissiveData);
                    }
                    if (features & (32 | 512 | 16)) {
                        gl.uniform4fv(program.texScaleOffsetUniform, materialData.texScaleOffsetData);
                    }
                    if (features & 32) {
                        rp.setTexture(materialData.diffuseMap, 0);
                    }
                    if (features & 16) {
                        rp.setTexture(materialData.specularMap, 2);
                    }
                    if (features & 512) {
                        rp.setTexture(materialData.normalMap, 1);
                    }
                    if (features & 131072) {
                        rp.setTexture(this.skeletonMgr_.jointDataTexture, 4);
                    }
                    rp.setTexture(this.lightMgr_.lutTexture, 5);
                    gl.uniform2fv(program.lightLUTParamUniform, this.lightMgr_.lutParam);
                    if (fogSpec) {
                        gl.uniform4fv(program.fogColourUniform, new Float32Array([fogSpec.colour[0], fogSpec.colour[1], fogSpec.colour[2], 0]));
                        gl.uniform4fv(program.fogParamsUniform, new Float32Array([fogSpec.offset, fogSpec.depth, fogSpec.density, 0]));
                    }
                    if (shadow) {
                        gl.uniform1i(program.shadowCastingLightIndexUniform, this.shadowCastingLightIndex_);
                        rp.setTexture(shadow.filteredTexture || shadow.shadowFBO.colourAttachmentTexture(0), 3);
                        gl.uniformMatrix4fv(program.lightViewMatrixUniform, false, shadow.lightProjection.viewMatrix);
                        gl.uniformMatrix4fv(program.lightProjMatrixUniform, false, shadow.lightProjection.projectionMatrix);
                    }
                    var indexElementType = this.meshMgr_.indexBufferElementType(mesh);
                    if (indexElementType !== 0) {
                        rp.drawIndexedPrimitives(primGroup.type, indexElementType, primGroup.fromElement, primGroup.elementCount);
                    }
                    else {
                        rp.drawPrimitives(primGroup.type, primGroup.fromElement, primGroup.elementCount);
                    }
                    drawCalls += 1;
                }
                return drawCalls;
            };
            StdModelManager.prototype.drawSingleShadow = function (rp, proj, shadowPipeline, modelIx) {
                var gl = this.rc.gl;
                var program = shadowPipeline.program;
                var mesh = this.meshMgr_.forEntity(this.entityBase_[modelIx]);
                rp.setMesh(mesh);
                var modelMatrix = this.transformMgr_.worldMatrix(this.transformBase_[modelIx]);
                sd.mat4.multiply(this.modelViewMatrix_, proj.viewMatrix, modelMatrix);
                sd.mat4.multiply(this.modelViewProjectionMatrix_, proj.projectionMatrix, proj.viewMatrix);
                gl.uniformMatrix4fv(program.modelMatrixUniform, false, modelMatrix);
                gl.uniformMatrix4fv(program.lightViewMatrixUniform, false, proj.viewMatrix);
                gl.uniformMatrix4fv(program.lightViewProjectionMatrixUniform, false, this.modelViewProjectionMatrix_);
                var uniformPrimType = this.meshMgr_.uniformPrimitiveType(mesh);
                if (uniformPrimType !== 0) {
                    var totalElementCount = this.meshMgr_.totalElementCount(mesh);
                    var indexElementType = this.meshMgr_.indexBufferElementType(mesh);
                    if (indexElementType !== 0) {
                        rp.drawIndexedPrimitives(uniformPrimType, indexElementType, 0, totalElementCount);
                    }
                    else {
                        rp.drawPrimitives(uniformPrimType, 0, totalElementCount);
                    }
                }
                return 1;
            };
            StdModelManager.prototype.splitModelRange = function (range, triggerFeature, cullDisabled) {
                if (cullDisabled === void 0) { cullDisabled = false; }
                var withFeature = new world.InstanceSet();
                var withoutFeature = new world.InstanceSet();
                var iter = range.makeIterator();
                while (iter.next()) {
                    var modelIx = iter.current;
                    var enabled = this.enabledBase_[modelIx];
                    if (!enabled && cullDisabled) {
                        continue;
                    }
                    var primGroupBase = this.primGroupOffsetBase_[modelIx];
                    var firstPGFeatures = this.primGroupFeatureBase_[primGroupBase];
                    if ((firstPGFeatures & triggerFeature) == triggerFeature) {
                        withFeature.add(iter.current);
                    }
                    else {
                        withoutFeature.add(iter.current);
                    }
                }
                return {
                    with: withFeature,
                    without: withoutFeature
                };
            };
            StdModelManager.prototype.splitModelRangeByTranslucency = function (range) {
                var split = this.splitModelRange(range, 32768, true);
                return {
                    opaque: split.without,
                    translucent: split.with
                };
            };
            StdModelManager.prototype.draw = function (range, rp, proj, shadow, fogSpec, mode) {
                var drawCalls = 0;
                if (mode == 0) {
                    var iter = range.makeIterator();
                    while (iter.next()) {
                        if (this.enabledBase_[iter.current]) {
                            drawCalls += this.drawSingleForward(rp, proj, shadow, fogSpec, iter.current);
                        }
                    }
                }
                else if (mode == 1) {
                    var shadowPipeline = this.stdPipeline_.shadowPipeline();
                    rp.setPipeline(shadowPipeline);
                    var iter = range.makeIterator();
                    while (iter.next()) {
                        if (this.enabledBase_[iter.current]) {
                            drawCalls += this.drawSingleShadow(rp, proj, shadowPipeline, iter.current);
                        }
                    }
                }
                return drawCalls;
            };
            return StdModelManager;
        }());
        world.StdModelManager = StdModelManager;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
var sd;
(function (sd) {
    var world;
    (function (world) {
        var TransformManager = (function () {
            function TransformManager() {
                this.defaultPos_ = sd.vec3.zero();
                this.defaultRot_ = sd.quat.create();
                this.defaultScale_ = sd.vec3.one();
                var instanceFields = [
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.SInt32, count: 1 },
                    { type: sd.Float, count: 3 },
                    { type: sd.Float, count: 4 },
                    { type: sd.Float, count: 3 },
                    { type: sd.Float, count: 16 },
                    { type: sd.Float, count: 16 }
                ];
                this.instanceData_ = new sd.container.MultiArrayBuffer(2048, instanceFields);
                this.rebase();
            }
            TransformManager.prototype.rebase = function () {
                this.entityBase_ = this.instanceData_.indexedFieldView(0);
                this.parentBase_ = this.instanceData_.indexedFieldView(1);
                this.firstChildBase_ = this.instanceData_.indexedFieldView(2);
                this.prevSiblingBase_ = this.instanceData_.indexedFieldView(3);
                this.nextSiblingBase_ = this.instanceData_.indexedFieldView(4);
                this.positionBase_ = this.instanceData_.indexedFieldView(5);
                this.rotationBase_ = this.instanceData_.indexedFieldView(6);
                this.scaleBase_ = this.instanceData_.indexedFieldView(7);
                this.localMatrixBase_ = this.instanceData_.indexedFieldView(8);
                this.worldMatrixBase_ = this.instanceData_.indexedFieldView(9);
            };
            TransformManager.prototype.create = function (linkedEntity, descOrParent, parent) {
                var entIndex = world.entityIndex(linkedEntity);
                if (this.instanceData_.count < entIndex) {
                    if (this.instanceData_.resize(entIndex) == 1) {
                        this.rebase();
                    }
                }
                var thisInstance = entIndex;
                var parentInstance = 0;
                var descriptor = null;
                this.entityBase_[thisInstance] = linkedEntity;
                if (descOrParent) {
                    if (typeof descOrParent == "number") {
                        parentInstance = descOrParent;
                    }
                    else {
                        descriptor = descOrParent;
                        parentInstance = parent;
                    }
                }
                else if (typeof parent === "number") {
                    parentInstance = parent;
                }
                if (parentInstance) {
                    this.parentBase_[thisInstance] = parentInstance;
                    var myPrevSibling = this.firstChildBase_[parentInstance];
                    if (myPrevSibling) {
                        sd.assert(this.prevSiblingBase_[myPrevSibling] == 0, "firstChild cannot have prev siblings");
                        while (this.nextSiblingBase_[myPrevSibling] != 0) {
                            myPrevSibling = this.nextSiblingBase_[myPrevSibling];
                        }
                        this.nextSiblingBase_[myPrevSibling] = thisInstance;
                        this.prevSiblingBase_[thisInstance] = myPrevSibling;
                    }
                    else {
                        this.firstChildBase_[parentInstance] = thisInstance;
                        this.prevSiblingBase_[thisInstance] = 0;
                        this.nextSiblingBase_[thisInstance] = 0;
                    }
                }
                else {
                    this.parentBase_[thisInstance] = 0;
                    this.prevSiblingBase_[thisInstance] = 0;
                    this.nextSiblingBase_[thisInstance] = 0;
                }
                if (descriptor) {
                    var rotation = descriptor.rotation || this.defaultRot_;
                    var scale = descriptor.scale || this.defaultScale_;
                    this.positionBase_.set(descriptor.position, thisInstance * sd.vec3.ELEMENT_COUNT);
                    this.rotationBase_.set(rotation, thisInstance * sd.quat.ELEMENT_COUNT);
                    this.scaleBase_.set(scale, thisInstance * sd.vec3.ELEMENT_COUNT);
                    this.setLocalMatrix(thisInstance, rotation, descriptor.position, scale);
                }
                else {
                    this.positionBase_.set(this.defaultPos_, thisInstance * sd.quat.ELEMENT_COUNT);
                    this.rotationBase_.set(this.defaultRot_, thisInstance * sd.quat.ELEMENT_COUNT);
                    this.scaleBase_.set(this.defaultScale_, thisInstance * sd.vec3.ELEMENT_COUNT);
                    this.setLocalMatrix(thisInstance, this.defaultRot_, this.defaultPos_, this.defaultScale_);
                }
                return thisInstance;
            };
            TransformManager.prototype.destroy = function (_inst) {
            };
            TransformManager.prototype.destroyRange = function (range) {
                var iter = range.makeIterator();
                while (iter.next()) {
                    this.destroy(iter.current);
                }
            };
            Object.defineProperty(TransformManager.prototype, "count", {
                get: function () { return this.instanceData_.count; },
                enumerable: true,
                configurable: true
            });
            TransformManager.prototype.valid = function (inst) {
                return inst <= this.count;
            };
            TransformManager.prototype.all = function () {
                return new world.InstanceLinearRange(1, this.count);
            };
            TransformManager.prototype.forEntity = function (ent) {
                var index = world.entityIndex(ent);
                if (index > 0 && index <= this.instanceData_.count) {
                    return ent;
                }
                sd.assert(false, "No transform for entity " + index);
                return 0;
            };
            TransformManager.prototype.entity = function (inst) { return this.entityBase_[inst]; };
            TransformManager.prototype.parent = function (inst) { return this.parentBase_[inst]; };
            TransformManager.prototype.firstChild = function (inst) { return this.firstChildBase_[inst]; };
            TransformManager.prototype.prevSibling = function (inst) { return this.prevSiblingBase_[inst]; };
            TransformManager.prototype.nextSibling = function (inst) { return this.nextSiblingBase_[inst]; };
            TransformManager.prototype.localPosition = function (inst) { return sd.container.copyIndexedVec3(this.positionBase_, inst); };
            TransformManager.prototype.localRotation = function (inst) { return sd.container.copyIndexedVec4(this.rotationBase_, inst); };
            TransformManager.prototype.localScale = function (inst) { return sd.container.copyIndexedVec3(this.scaleBase_, inst); };
            TransformManager.prototype.worldPosition = function (inst) {
                var matOffset = inst * 16;
                return [this.worldMatrixBase_[matOffset + 12], this.worldMatrixBase_[matOffset + 13], this.worldMatrixBase_[matOffset + 14]];
            };
            TransformManager.prototype.localMatrix = function (inst) { return sd.container.refIndexedMat4(this.localMatrixBase_, inst); };
            TransformManager.prototype.worldMatrix = function (inst) { return sd.container.refIndexedMat4(this.worldMatrixBase_, inst); };
            TransformManager.prototype.copyLocalMatrix = function (inst) { return sd.container.copyIndexedMat4(this.localMatrixBase_, inst); };
            TransformManager.prototype.copyWorldMatrix = function (inst) { return sd.container.copyIndexedMat4(this.worldMatrixBase_, inst); };
            TransformManager.prototype.applyParentTransform = function (parentMatrix, inst) {
                var localMat = this.localMatrix(inst);
                var worldMat = this.worldMatrix(inst);
                sd.mat4.multiply(worldMat, parentMatrix, localMat);
                var child = this.firstChildBase_[inst];
                while (child != 0) {
                    this.applyParentTransform(worldMat, child);
                    child = this.nextSiblingBase_[child];
                }
            };
            TransformManager.prototype.setLocalMatrix = function (inst, localMatOrRot, newPosition, newScale) {
                var localMat = sd.container.refIndexedMat4(this.localMatrixBase_, inst);
                if (arguments.length == 4) {
                    sd.mat4.fromRotationTranslationScale(localMat, localMatOrRot, newPosition, newScale);
                }
                else {
                    localMat.set(localMatOrRot);
                }
                var parent = this.parentBase_[inst];
                var firstChild = this.firstChildBase_[inst];
                if (parent || firstChild) {
                    var parentWorldMat = (parent == 0) ? sd.mat4.create() : this.worldMatrix(parent);
                    this.applyParentTransform(parentWorldMat, inst);
                }
                else {
                    sd.mat4.copy(this.worldMatrix(inst), localMat);
                }
            };
            TransformManager.prototype.removeFromParent = function (inst) {
                var index = inst;
                var parentIndex = this.parentBase_[index];
                if (!parentIndex) {
                    return;
                }
                var firstChild = this.firstChildBase_[parentIndex];
                var prevSibling = this.prevSiblingBase_[index];
                var nextSibling = this.nextSiblingBase_[index];
                if (firstChild == index) {
                    this.firstChildBase_[parentIndex] = nextSibling;
                }
                if (prevSibling) {
                    this.nextSiblingBase_[prevSibling] = nextSibling;
                    this.prevSiblingBase_[index] = 0;
                }
                if (nextSibling) {
                    this.prevSiblingBase_[nextSibling] = prevSibling;
                    this.nextSiblingBase_[index] = 0;
                }
                this.parentBase_[index] = 0;
            };
            TransformManager.prototype.setParent = function (inst, newParent) {
                var thisIndex = inst;
                var parentIndex = newParent;
                this.removeFromParent(inst);
                if (parentIndex) {
                    this.parentBase_[thisIndex] = parentIndex;
                    var myPrevSibling = this.firstChildBase_[parentIndex];
                    if (myPrevSibling) {
                        while (this.nextSiblingBase_[myPrevSibling] != 0) {
                            myPrevSibling = this.nextSiblingBase_[myPrevSibling];
                        }
                        this.nextSiblingBase_[myPrevSibling] = thisIndex;
                        this.prevSiblingBase_[thisIndex] = myPrevSibling;
                    }
                    else {
                        this.firstChildBase_[parentIndex] = thisIndex;
                        this.prevSiblingBase_[thisIndex] = 0;
                        this.nextSiblingBase_[thisIndex] = 0;
                    }
                }
            };
            TransformManager.prototype.setPosition = function (inst, newPosition) {
                this.positionBase_.set(newPosition, inst * sd.vec3.ELEMENT_COUNT);
                this.setLocalMatrix(inst, this.localRotation(inst), newPosition, this.localScale(inst));
            };
            TransformManager.prototype.setRotation = function (inst, newRotation) {
                this.rotationBase_.set(newRotation, inst * sd.quat.ELEMENT_COUNT);
                this.setLocalMatrix(inst, newRotation, this.localPosition(inst), this.localScale(inst));
            };
            TransformManager.prototype.setPositionAndRotation = function (inst, newPosition, newRotation) {
                this.positionBase_.set(newPosition, inst * sd.vec3.ELEMENT_COUNT);
                this.rotationBase_.set(newRotation, inst * sd.quat.ELEMENT_COUNT);
                this.setLocalMatrix(inst, newRotation, newPosition, this.localScale(inst));
            };
            TransformManager.prototype.setScale = function (inst, newScale) {
                this.scaleBase_.set(newScale, inst * sd.vec3.ELEMENT_COUNT);
                this.setLocalMatrix(inst, this.localRotation(inst), this.localPosition(inst), newScale);
            };
            TransformManager.prototype.setPositionAndRotationAndScale = function (inst, newPosition, newRotation, newScale) {
                this.positionBase_.set(newPosition, inst * sd.vec3.ELEMENT_COUNT);
                this.rotationBase_.set(newRotation, inst * sd.quat.ELEMENT_COUNT);
                this.scaleBase_.set(newScale, inst * sd.vec3.ELEMENT_COUNT);
                this.setLocalMatrix(inst, newRotation, newPosition, newScale);
            };
            TransformManager.prototype.translate = function (inst, localDelta3) {
                var pos = this.localPosition(inst);
                this.setPosition(inst, [pos[0] + localDelta3[0], pos[1] + localDelta3[1], pos[2] + localDelta3[2]]);
            };
            TransformManager.prototype.rotate = function (inst, localRot) {
                this.setRotation(inst, sd.quat.multiply([], this.localRotation(inst), localRot));
            };
            TransformManager.prototype.rotateRelWorld = function (inst, worldRot) {
                this.setRotation(inst, sd.quat.multiply([], worldRot, this.localRotation(inst)));
            };
            TransformManager.prototype.rotateByAngles = function (inst, localAng) {
                var rot = this.localRotation(inst);
                var q = sd.quat.fromEuler(localAng[2], localAng[1], localAng[0]);
                this.setRotation(inst, sd.quat.multiply([], rot, q));
            };
            return TransformManager;
        }());
        world.TransformManager = TransformManager;
    })(world = sd.world || (sd.world = {}));
})(sd || (sd = {}));
