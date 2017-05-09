/// <reference path="../typings/inflate.d.ts" />
/// <reference path="../typings/veclib.d.ts" />
/// <reference path="../typings/webgl-ext.d.ts" />
declare namespace sd.asset {
    class AssetLibrary {
        private roots_;
        addRoot(name: string, baseURL: URL): void;
        addLocalRoot(name: string, relativePath: string): void;
        deleteRoot(name: string): void;
        resolvePath(path: string): URL;
        load(_path: string): void;
    }
}
interface Console {
    takeHeapSnapshot(): void;
}
declare namespace sd {
    function assert(cond: any, msg?: string): void;
    function cloneStruct<T>(object: T): T;
    function cloneStructDeep<T>(object: T): T;
}
declare namespace sd.asset {
    function registerFileExtension(extension: string, mimeType: string): void;
    function mimeTypeForFileExtension(extension: string): string | undefined;
    function mimeTypeForURL(url: URL | string): string | undefined;
    type URLAssetLoader = (url: URL, mimeType: string) => Promise<AssetGroup>;
    type BufferAssetLoader = (buffer: ArrayBuffer, mimeType: string) => Promise<AssetGroup>;
    function registerURLLoaderForMIMEType(mimeType: string, loader: URLAssetLoader): void;
    function registerBufferLoaderForMIMEType(mimeType: string, loader: BufferAssetLoader): void;
    function registerLoadersForMIMEType(mimeType: string, urlLoader: URLAssetLoader, bufferLoader: BufferAssetLoader): void;
    function urlLoaderForMIMEType(mimeType: string): URLAssetLoader | undefined;
    function bufferLoaderForMIMEType(mimeType: string): BufferAssetLoader | undefined;
}
declare namespace sd.asset {
    interface Asset {
        name: string;
        userRef?: any;
    }
    const enum ColourSpace {
        sRGB = 0,
        Linear = 1,
    }
    interface Texture2D extends Asset {
        url?: URL;
        useMipMaps?: render.UseMipMaps;
        descriptor?: render.TextureDescriptor;
        texture?: render.Texture;
        colourSpace: ColourSpace;
    }
    interface TextureCube extends Asset {
        filePathPosX?: string;
        filePathNegX?: string;
        filePathPosY?: string;
        filePathNegY?: string;
        filePathPosZ?: string;
        filePathNegZ?: string;
        useMipMaps: render.UseMipMaps;
        descriptor?: render.TextureDescriptor;
        texture?: render.Texture;
    }
    const enum MaterialFlags {
        usesSpecular = 1,
        usesEmissive = 2,
        isTranslucent = 4,
        diffuseAlphaIsTransparency = 256,
        diffuseAlphaIsOpacity = 512,
        normalAlphaIsHeight = 2048,
        isSkinned = 4096,
    }
    interface Material extends Asset {
        flags: MaterialFlags;
        baseColour: Float3;
        specularColour: Float3;
        specularIntensity: number;
        specularExponent: number;
        emissiveColour: Float3;
        emissiveIntensity: number;
        opacity: number;
        metallic: number;
        roughness: number;
        anisotropy: number;
        textureScale: Float2;
        textureOffset: Float2;
        albedoTexture?: Texture2D;
        specularTexture?: Texture2D;
        normalTexture?: Texture2D;
        heightTexture?: Texture2D;
        transparencyTexture?: Texture2D;
        emissiveTexture?: Texture2D;
        roughnessTexture?: Texture2D;
        metallicTexture?: Texture2D;
        ambientOcclusionTexture?: Texture2D;
    }
    function makeMaterial(name?: string): Material;
    interface Mesh extends Asset {
        readonly meshData: meshdata.MeshData;
        readonly indexMap?: meshdata.VertexIndexMapping;
    }
    interface Transform {
        position: Float3;
        rotation?: Float4;
        scale?: Float3;
    }
    function makeTransform(): Transform;
    interface WeightedVertexGroup extends Asset {
        indexes: Int32Array | null;
        weights: Float64Array | null;
        bindPoseLocalTranslation: Float3 | null;
        bindPoseLocalRotation: Float4 | null;
        bindPoseLocalMatrix: Float4x4 | null;
    }
    interface Skin extends Asset {
        groups: WeightedVertexGroup[];
    }
    interface Joint {
        root: boolean;
    }
    const enum AnimationProperty {
        None = 0,
        TranslationX = 1,
        TranslationY = 2,
        TranslationZ = 3,
        RotationX = 4,
        RotationY = 5,
        RotationZ = 6,
        ScaleX = 7,
        ScaleY = 8,
        ScaleZ = 9,
    }
    interface AnimationKeyData {
        times: ArrayOfNumber;
        values: ArrayOfNumber;
    }
    interface AnimationTrack {
        animationName: string;
        property: AnimationProperty;
        key: AnimationKeyData;
    }
    const enum TransformAnimationField {
        None = 0,
        Translation = 1,
        Rotation = 2,
        Scale = 3,
    }
    interface TransformAnimationTrack {
        field: TransformAnimationField;
        key: Float32Array;
    }
    interface TransformAnimation {
        tracks: TransformAnimationTrack[];
    }
    interface JointAnimation extends TransformAnimation {
        jointIndex: number;
        jointName?: string;
    }
    interface SkeletonAnimation extends Asset {
        frameTime: number;
        frameCount: number;
        jointAnims: JointAnimation[];
    }
    const enum LightType {
        None = 0,
        Directional = 1,
        Point = 2,
        Spot = 3,
    }
    const enum ShadowType {
        None = 0,
        Hard = 1,
        Soft = 2,
    }
    const enum ShadowQuality {
        Auto = 0,
    }
    interface Light extends Asset {
        type: LightType;
        colour: Float3;
        intensity: number;
        range?: number;
        cutoff?: number;
        shadowType?: ShadowType;
        shadowQuality?: ShadowQuality;
        shadowStrength?: number;
        shadowBias?: number;
    }
    interface FogDescriptor {
        colour: Float3;
        offset: number;
        depth: number;
        density: number;
    }
    interface Model extends Asset {
        transform: Transform;
        children: Model[];
        parent?: Model;
        mesh?: Mesh;
        materials?: Material[];
        light?: Light;
        joint?: Joint;
        vertexGroup?: WeightedVertexGroup;
        animations?: AnimationTrack[];
    }
    function makeModel(name: string, ref?: any): Model;
    class AssetGroup {
        meshes: Mesh[];
        textures: (Texture2D | null)[];
        materials: Material[];
        models: Model[];
        anims: SkeletonAnimation[];
        addMesh(mesh: Mesh): number;
        addTexture(tex: Texture2D | null): number;
        addMaterial(mat: Material): number;
        addModel(model: Model): number;
        addSkeletonAnimation(anim: SkeletonAnimation): number;
    }
}
declare namespace sd.asset {
    function fileExtensionOfURL(url: URL | string): string;
    const enum FileLoadType {
        ArrayBuffer = 1,
        Blob = 2,
        Document = 3,
        JSON = 4,
        Text = 5,
    }
    interface FileLoadOptions {
        tryBreakCache?: boolean;
        mimeType?: string;
        responseType?: FileLoadType;
    }
    function loadFile(url: URL | string, opts?: FileLoadOptions): Promise<any>;
    class BlobReader {
        private constructor();
        private static readerPromise<T>();
        static readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer>;
        static readAsDataURL(blob: Blob): Promise<string>;
        static readAsText(blob: Blob, encoding?: string): Promise<string>;
    }
    function resolveTextures(rc: render.RenderContext, textures: (asset.Texture2D | null)[]): Promise<(Texture2D | null)[]>;
    function loadSoundFile(ac: audio.AudioContext, filePath: string): Promise<AudioBuffer>;
    function convertBytesToString(bytes: Uint8Array): string;
}
declare namespace sd.asset.fbx.parse {
    class FBXBinaryParser {
        private delegate_;
        private bytes_;
        private dataView_;
        private offset_;
        private length_;
        private version_;
        private stack_;
        private inProp70Block_;
        private twoExp21;
        private twoExp32;
        constructor(data: ArrayBuffer, delegate_: FBXParserDelegate);
        readonly delegate: FBXParserDelegate;
        private error(msg, offset?);
        private inflateCompressedArray(dataBlock, outElementType);
        private checkFileHeader();
        private readFieldHeader();
        private readArrayProperty(element);
        private convertInt64ToDouble(dv, offset);
        private readValues(header);
        parse(): void;
    }
}
declare namespace sd.asset.fbx.parse {
    class FBXTextParser {
        private delegate_;
        private tokenizer_;
        private expect_;
        private expectNextKey_;
        private eof_;
        private depth_;
        private inProp70Block_;
        private skippingUntilDepth_;
        private array_;
        private arrayLength_;
        private arrayIndex_;
        private values_;
        constructor(text: string, delegate_: FBXParserDelegate);
        readonly delegate: FBXParserDelegate;
        private unexpected(t);
        private reportBlock();
        private reportProperty();
        private arrayForKey(key, elementCount);
        parse(): void;
    }
}
declare namespace sd.asset {
    namespace fbx {
        namespace parse {
            type FBXValue = number | string | ArrayBuffer | TypedArray;
            const enum FBXBlockAction {
                Enter = 0,
                Skip = 1,
            }
            const enum FBXPropertyType {
                Unknown = 0,
                Int = 1,
                Double = 2,
                Bool = 3,
                Time = 4,
                String = 5,
                Vector3D = 6,
                Vector4D = 7,
                Object = 8,
                Empty = 9,
            }
            interface FBXProp70Prop {
                name: string;
                typeName: string;
                type: FBXPropertyType;
                values: FBXValue[];
            }
            function interpretProp70P(pValues: FBXValue[]): FBXProp70Prop;
            interface FBXParserDelegate {
                block(name: string, values: FBXValue[]): FBXBlockAction;
                endBlock(): void;
                property(name: string, values: FBXValue[]): void;
                typedProperty(name: string, type: FBXPropertyType, typeName: string, values: FBXValue[]): void;
                error(msg: string, offset: number, token?: string): void;
                completed(): void;
            }
            interface FBXParser {
                delegate: FBXParserDelegate;
                parse(): void;
            }
        }
        interface FBXResolveOptions {
            allowMissingTextures: boolean;
            forceMipMapsOn: boolean;
            removeUnusedBones: boolean;
        }
        class FBX7DocumentParser implements parse.FBXParserDelegate {
            private doc;
            private state;
            private depth;
            private curObject;
            private curNodeParent;
            private knownObjects;
            private assets_;
            private parseT0;
            constructor(filePath: string);
            block(name: string, values: parse.FBXValue[]): parse.FBXBlockAction;
            endBlock(): void;
            property(name: string, values: parse.FBXValue[]): void;
            typedProperty(name: string, type: parse.FBXPropertyType, typeName: string, values: parse.FBXValue[]): void;
            completed(): void;
            error(msg: string, offset: number, token?: string): void;
            readonly assets: Promise<AssetGroup>;
        }
    }
    function loadFBXTextFile(url: URL): Promise<AssetGroup>;
    function loadFBXBinaryFile(url: URL): Promise<AssetGroup>;
    function loadFBXFile(url: URL): Promise<AssetGroup>;
}
declare namespace sd.asset {
    function loadImageURL(url: URL, mimeType?: string): Promise<ImageData | HTMLImageElement>;
    function loadImageFromBuffer(buffer: ArrayBuffer, mimeType: string): Promise<ImageData | HTMLImageElement>;
    function imageData(image: HTMLImageElement): ImageData;
    function loadImageDataURL(url: URL): Promise<ImageData>;
    function debugDumpPixelData(pixels: Uint8ClampedArray, width: number, height: number): void;
    function loadBuiltInImageFromURL(url: URL): Promise<HTMLImageElement>;
    function loadBuiltInImageFromBuffer(buffer: ArrayBuffer, mimeType: string): Promise<HTMLImageElement>;
    function loadTGAImageFromBuffer(buffer: ArrayBuffer): ImageData;
    function tgaLoader(source: URL | ArrayBuffer, mimeType: string): Promise<AssetGroup>;
}
declare namespace sd.asset.md5.parse {
    interface MD5ParserDelegate {
        error(msg: string, offset: number, token?: string): void;
        completed(): void;
    }
    function computeQuatW(q: Float4): void;
    interface MD5MeshDelegate extends MD5ParserDelegate {
        jointCount(count: number): void;
        beginJoints(): void;
        joint(name: string, index: number, parentIndex: number, modelPos: Float3, modelRot: Float4): void;
        endJoints(): void;
        meshCount(count: number): void;
        beginMesh(): void;
        materialName(name: string): void;
        vertexCount(count: number): void;
        vertex(index: number, uv: Float2, weightOffset: number, weightCount: number): void;
        triangleCount(count: number): void;
        triangle(index: number, indexes: Float3): void;
        weightCount(count: number): void;
        weight(index: number, jointIndex: number, bias: number, jointPos: Float3): void;
        endMesh(): void;
    }
    class MD5MeshParser {
        private delegate_;
        private meshCount_;
        private jointCount_;
        private parser_;
        constructor(source: string, delegate_: MD5MeshDelegate);
        private parseMeshVertices(count);
        private parseMeshTriangles(count);
        private parseMeshWeights(count);
        private parseMesh();
        private parseJoints();
        parse(): void;
    }
    const enum MD5AnimMask {
        PosX = 1,
        PosY = 2,
        PosZ = 4,
        QuatX = 8,
        QuatY = 16,
        QuatZ = 32,
    }
    interface MD5AnimDelegate extends MD5ParserDelegate {
        frameCount(count: number): void;
        jointCount(count: number): void;
        frameRate(fps: number): void;
        frameComponentCount(count: number): void;
        beginHierarchy(): void;
        joint(name: string, index: number, parentIndex: number, animMask: MD5AnimMask, componentOffset: number): void;
        endHierarchy(): void;
        beginBoundingBoxes(): void;
        bounds(frameIndex: number, min: Float3, max: Float3): void;
        endBoundingBoxes(): void;
        beginBaseFrame(): void;
        baseJoint(index: number, jointPos: Float3, jointRot: Float4): void;
        endBaseFrame(): void;
        frame(index: number, components: Float32Array): void;
    }
    class MD5AnimParser {
        private delegate_;
        private jointCount_;
        private baseJointCount_;
        private frameCount_;
        private boundsCount_;
        private frameComponentCount_;
        private parser_;
        constructor(source: string, delegate_: MD5AnimDelegate);
        private parseHierarchy();
        private parseVec3();
        private parseBounds();
        private parseBaseFrame();
        private parseFrame(frameIndex);
        parse(): void;
    }
}
declare namespace sd.asset {
    namespace md5 {
        class MD5MeshBuilder implements parse.MD5MeshDelegate {
            private filePath;
            private joints;
            private flatJointModels;
            private vertexes;
            private triangles;
            private weights;
            private assets_;
            private curMaterial;
            private meshCount_;
            private textures_;
            constructor(filePath: string);
            jointCount(_count: number): void;
            beginJoints(): void;
            joint(name: string, index: number, parentIndex: number, modelPos: Float3, modelRot: Float4): void;
            endJoints(): void;
            meshCount(_count: number): void;
            beginMesh(): void;
            materialName(name: string): void;
            vertexCount(count: number): void;
            vertex(index: number, uv: Float2, weightOffset: number, weightCount: number): void;
            triangleCount(count: number): void;
            triangle(index: number, indexes: Float3): void;
            weightCount(count: number): void;
            weight(index: number, jointIndex: number, bias: number, jointPos: Float3): void;
            endMesh(): void;
            error(msg: string, offset: number, token?: string): void;
            completed(): void;
            private transformNormalsIntoJointSpace(md);
            private loadTextures();
            assets(): Promise<AssetGroup>;
        }
        class MD5AnimBuilder implements parse.MD5AnimDelegate {
            private filePath;
            private frameCount_;
            private frameRate_;
            private compCount_;
            private baseFrame_;
            private joints_;
            constructor(filePath: string);
            frameCount(count: number): void;
            jointCount(_count: number): void;
            frameRate(fps: number): void;
            frameComponentCount(count: number): void;
            private animForJoint(j);
            beginHierarchy(): void;
            joint(name: string, index: number, parentIndex: number, animMask: parse.MD5AnimMask, _componentOffset: number): void;
            endHierarchy(): void;
            beginBoundingBoxes(): void;
            bounds(_frameIndex: number, _min: Float3, _max: Float3): void;
            endBoundingBoxes(): void;
            beginBaseFrame(): void;
            baseJoint(index: number, jointPos: Float3, jointRot: Float4): void;
            endBaseFrame(): void;
            frame(index: number, components: Float32Array): void;
            error(msg: string, offset: number, token?: string): void;
            completed(): void;
            assets(): AssetGroup;
        }
    }
    function loadMD5Mesh(url: URL): Promise<AssetGroup>;
    function loadMD5Anim(url: URL): Promise<AssetGroup>;
}
declare namespace sd.asset {
    function loadMTLFile(url: URL, intoAssetGroup?: AssetGroup): Promise<AssetGroup>;
    function loadOBJFile(url: URL, materialsAsColours?: boolean, intoAssetGroup?: AssetGroup): Promise<AssetGroup>;
}
declare namespace sd.asset {
    class TMXLayer {
        width: number;
        height: number;
        tileData: Uint32Array;
        constructor(layerNode: Node);
        tileAt(col: number, row: number): number;
        setTileAt(col: number, row: number, tile: number): void;
        eachTile(callback: (row: number, col: number, tile: number) => void): void;
    }
    class TMXObjectGroup {
        constructor(_groupNode: Node);
    }
    type TMXLayerSet = {
        [name: string]: TMXLayer;
    };
    type TMXObjectGroupSet = {
        [name: string]: TMXObjectGroup;
    };
    class TMXData {
        layers: TMXLayerSet;
        objectGroups: TMXObjectGroupSet;
        private width_;
        private height_;
        readonly width: number;
        readonly height: number;
        load(filePath: string): Promise<TMXData>;
    }
}
declare const webkitAudioContext: {
    prototype: AudioContext;
    new (): AudioContext;
};
interface Window {
    webkitAudioContext?: typeof AudioContext;
    AudioContext?: typeof AudioContext;
}
declare type NativeAudioContext = AudioContext;
declare namespace sd.audio {
    interface AudioContext {
        ctx: NativeAudioContext;
    }
    function makeAudioBufferFromData(ac: AudioContext, data: ArrayBuffer): Promise<AudioBuffer>;
    function makeAudioContext(): audio.AudioContext | null;
}
declare namespace sd.container {
    function copyElementRange<T>(src: ArrayLike<T>, srcOffset: number, srcCount: number, dest: MutableArrayLike<T>, destOffset: number): void;
    function fill<T>(dest: MutableArrayLike<T>, value: T, count: number, offset?: number): void;
    function appendArrayInPlace<T>(dest: Array<T>, source: Array<T>): void;
    function refIndexedVec2(data: TypedArray, index: number): TypedArray;
    function copyIndexedVec2(data: TypedArray, index: number): number[];
    function setIndexedVec2(data: TypedArray, index: number, v2: Float2): void;
    function copyVec2FromOffset(data: TypedArray, offset: number): Float2;
    function setVec2AtOffset(data: TypedArray, offset: number, v2: Float2): void;
    function offsetOfIndexedVec2(index: number): number;
    function refIndexedVec3(data: TypedArray, index: number): TypedArray;
    function copyIndexedVec3(data: TypedArray, index: number): number[];
    function setIndexedVec3(data: TypedArray, index: number, v3: Float3): void;
    function copyVec3FromOffset(data: TypedArray, offset: number): Float3;
    function setVec3AtOffset(data: TypedArray, offset: number, v3: Float3): void;
    function offsetOfIndexedVec3(index: number): number;
    function refIndexedVec4(data: TypedArray, index: number): TypedArray;
    function copyIndexedVec4(data: TypedArray, index: number): number[];
    function setIndexedVec4(data: TypedArray, index: number, v4: Float4): void;
    function copyVec4FromOffset(data: TypedArray, offset: number): Float4;
    function setVec4AtOffset(data: TypedArray, offset: number, v4: Float4): void;
    function offsetOfIndexedVec4(index: number): number;
    function refIndexedMat3(data: TypedArray, index: number): TypedArray;
    function copyIndexedMat3(data: TypedArray, index: number): number[];
    function setIndexedMat3(data: TypedArray, index: number, m3: Float3x3): void;
    function offsetOfIndexedMat3(index: number): number;
    function refIndexedMat4(data: TypedArray, index: number): TypedArray;
    function copyIndexedMat4(data: TypedArray, index: number): number[];
    function setIndexedMat4(data: TypedArray, index: number, m4: Float4x4): void;
    function offsetOfIndexedMat4(index: number): number;
}
declare namespace sd.container {
    class Deque<T> {
        private blocks_;
        private headBlock_;
        private headIndex_;
        private tailBlock_;
        private tailIndex_;
        private count_;
        private blockCapacity;
        private newBlock();
        private readonly headBlock;
        private readonly tailBlock;
        constructor();
        append(t: T): void;
        prepend(t: T): void;
        popFront(): void;
        popBack(): void;
        clear(): void;
        readonly count: number;
        readonly empty: boolean;
        readonly front: T;
        readonly back: T;
    }
}
declare namespace sd {
    const vec2: typeof veclib.vec2;
    const vec3: typeof veclib.vec3;
    const vec4: typeof veclib.vec4;
    const quat: typeof veclib.quat;
    const mat2: typeof veclib.mat2;
    const mat2d: typeof veclib.mat2d;
    const mat3: typeof veclib.mat3;
    const mat4: typeof veclib.mat4;
}
declare namespace sd.math {
    const clamp: typeof veclib.clamp;
    const clamp01: typeof veclib.clamp01;
    const mix: typeof veclib.mix;
    function intRandom(maximum: number): number;
    function intRandomRange(minimum: number, maximum: number): number;
    function hertz(hz: number): number;
    function deg2rad(deg: number): number;
    function rad2deg(rad: number): number;
    function isPowerOf2(n: number): boolean;
    function roundUpPowerOf2(n: number): number;
    function alignUp(val: number, alignmentPow2: number): number;
    function alignDown(val: number, alignmentPow2: number): number;
}
declare namespace sd.container {
    interface MABField {
        type: NumericType;
        count: number;
    }
    const enum InvalidatePointers {
        No = 0,
        Yes = 1,
    }
    class FixedMultiArray {
        private capacity_;
        private data_;
        private basePointers_;
        constructor(capacity_: number, fields: MABField[]);
        readonly capacity: number;
        readonly data: ArrayBuffer;
        clear(): void;
        indexedFieldView(index: number): TypedArray;
    }
    class MultiArrayBuffer {
        private fields_;
        private capacity_;
        private count_;
        private elementSumSize_;
        private data_;
        constructor(initialCapacity: number, fields: MABField[]);
        readonly capacity: number;
        readonly count: number;
        readonly backIndex: number;
        private fieldArrayView(f, buffer, itemCount);
        reserve(newCapacity: number): InvalidatePointers;
        clear(): void;
        resize(newCount: number): InvalidatePointers;
        extend(): InvalidatePointers;
        indexedFieldView(index: number): TypedArray;
    }
}
declare namespace sd.container {
    function lowerBound<T>(array: ArrayLike<T>, value: T): number;
    function upperBound<T>(array: ArrayLike<T>, value: T): number;
    class SortedArray<T> {
        private compareFn_;
        private data_;
        constructor(source?: T[], compareFn_?: (a: T, b: T) => number);
        private sort();
        insert(value: T): void;
        insertMultiple(values: T[]): void;
        readonly array: ReadonlyArray<T>;
        readonly length: number;
    }
}
interface ArrayBufferConstructor {
    transfer(oldBuffer: ArrayBuffer, newByteLength?: number): ArrayBuffer;
}
declare namespace sd {
    interface TypedArrayBase {
        readonly BYTES_PER_ELEMENT: number;
        readonly buffer: ArrayBuffer;
        readonly byteLength: number;
        readonly byteOffset: number;
        readonly length: number;
        subarray(begin: number, end?: number): this;
        slice(start?: number, end?: number): this;
        every(callbackfn: (value: number, index: number, array: this) => boolean, thisArg?: any): boolean;
        filter(callbackfn: (value: number, index: number, array: this) => any, thisArg?: any): this;
        find(predicate: (value: number, index: number, obj: number[]) => boolean, thisArg?: any): number | undefined;
        findIndex(predicate: (value: number) => boolean, thisArg?: any): number;
        forEach(callbackfn: (value: number, index: number, array: this) => void, thisArg?: any): void;
        indexOf(searchElement: number, fromIndex?: number): number;
        join(separator?: string): string;
        lastIndexOf(searchElement: number, fromIndex?: number): number;
        map(callbackfn: (value: number, index: number, array: this) => number, thisArg?: any): this;
        reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: this) => number, initialValue?: number): number;
        reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: this) => U, initialValue: U): U;
        reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: this) => number, initialValue?: number): number;
        reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: this) => U, initialValue: U): U;
        some(callbackfn: (value: number, index: number, array: this) => boolean, thisArg?: any): boolean;
        toLocaleString(): string;
        toString(): string;
        [Symbol.iterator](): IterableIterator<number>;
        entries(): IterableIterator<[number, number]>;
        keys(): IterableIterator<number>;
        values(): IterableIterator<number>;
        [Symbol.toStringTag]: any;
        includes(searchElement: number, fromIndex?: number): boolean;
    }
    interface TypedArray extends TypedArrayBase {
        [index: number]: number;
        set(arrayOrElements: ArrayLike<number>, offset?: number): void;
        copyWithin(target: number, start: number, end?: number): this;
        fill(value: number, start?: number, end?: number): this;
        reverse(): this;
        sort(compareFn?: (a: number, b: number) => number): this;
    }
    interface ReadonlyTypedArray extends TypedArrayBase {
        readonly [index: number]: number;
    }
    interface TypedArrayConstructor {
        new (lengthOrSource: number | Iterable<number> | ArrayLike<number>): TypedArray;
        new (buffer: ArrayBuffer, byteOffset?: number, length?: number): TypedArray;
    }
    interface ConstEnumArrayView<T extends number> extends TypedArray {
        [index: number]: T;
    }
    interface MutableArrayLike<T> {
        readonly length: number;
        [n: number]: T;
    }
    type ArrayOfConstNumber = ArrayLike<number>;
    type ArrayOfNumber = MutableArrayLike<number>;
    type Float2 = ArrayOfNumber;
    type Float3 = ArrayOfNumber;
    type Float4 = ArrayOfNumber;
    type Float2x2 = ArrayOfNumber;
    type Float3x3 = ArrayOfNumber;
    type Float4x4 = ArrayOfNumber;
    type ConstFloat2 = ArrayOfConstNumber;
    type ConstFloat3 = ArrayOfConstNumber;
    type ConstFloat4 = ArrayOfConstNumber;
    type ConstFloat2x2 = ArrayOfConstNumber;
    type ConstFloat3x3 = ArrayOfConstNumber;
    type ConstFloat4x4 = ArrayOfConstNumber;
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
declare namespace sd {
    interface NumericType {
        readonly min: number;
        readonly max: number;
        readonly signed: boolean;
        readonly byteSize: number;
        readonly arrayType: TypedArrayConstructor;
    }
    const UInt8: NumericType;
    const UInt8Clamped: NumericType;
    const SInt8: NumericType;
    const UInt16: NumericType;
    const SInt16: NumericType;
    const UInt32: NumericType;
    const SInt32: NumericType;
    const Float: NumericType;
    const Double: NumericType;
}
declare namespace mrdoob {
    const enum StatsMode {
        FPS = 0,
        MS = 1,
    }
    class Stats {
        private startTime;
        private prevTime;
        private ms;
        private msMin;
        private msMax;
        private fps;
        private fpsMin;
        private fpsMax;
        private frames;
        private mode_;
        private container;
        private msDiv;
        private msText;
        private msGraph;
        private fpsDiv;
        private fpsText;
        private fpsGraph;
        constructor();
        readonly mode: StatsMode;
        setMode(value: StatsMode): void;
        updateGraph(elem: HTMLDivElement, value: number): void;
        readonly domElement: HTMLDivElement;
        begin(): void;
        end(): number;
        update(): void;
    }
}
declare namespace sd.io {
    class FlyCam {
        private pos_;
        private angleX_;
        private angleY_;
        private rot_;
        private dir_;
        private up_;
        private speed_;
        private sideSpeed_;
        constructor(initialPos: sd.Float3);
        update(timeStep: number, acceleration: number, sideAccel: number): void;
        rotate(localRelXY: sd.Float2): void;
        readonly pos: number[];
        readonly dir: number[];
        readonly rotation: MutableArrayLike<number>;
        readonly focusPos: number[];
        readonly viewMatrix: number[];
    }
    class FlyCamController {
        cam: FlyCam;
        private vpWidth_;
        private vpHeight_;
        private tracking_;
        private lastPos_;
        private deviceTilt_;
        private deviceTouch_;
        constructor(sensingElem: HTMLElement, initialPos: sd.Float3);
        step(timeStep: number): void;
    }
}
declare namespace sd.dom {
    type ElemSelector = string | Node | Node[];
    function $n(sel: string, base?: HTMLElement): HTMLElement[];
    function $(sel: ElemSelector, base?: HTMLElement): Node[];
    function $1(sel: ElemSelector, base?: HTMLElement): HTMLElement;
    function show(sel: ElemSelector, disp?: string): void;
    function hide(sel: ElemSelector): void;
    function setDisabled(sel: ElemSelector, dis: boolean): void;
    function enable(sel: ElemSelector): void;
    function disable(sel: ElemSelector): void;
    function closest(sourceSel: ElemSelector, sel: string): HTMLElement | undefined;
    function nextElementSibling(elem: HTMLElement): HTMLElement | undefined;
    function on(target: ElemSelector | Window, evt: string, handler: (ev: Event) => any): void;
    function off(target: ElemSelector | Window, evt: string, handler: (ev: Event) => any): void;
}
declare namespace sd.io {
    enum Key {
        UP = 38,
        DOWN = 40,
        LEFT = 37,
        RIGHT = 39,
        SPACE = 32,
        RETURN = 13,
        ESC = 27,
        PAGEUP = 33,
        PAGEDOWN = 34,
        HOME = 36,
        END = 35,
        DELETE = 46,
        A,
        B,
        C,
        D,
        E,
        F,
        G,
        H,
        I,
        J,
        K,
        L,
        M,
        N,
        O,
        P,
        Q,
        R,
        S,
        T,
        U,
        V,
        W,
        X,
        Y,
        Z,
    }
    interface ButtonState {
        down: boolean;
        halfTransitionCount: number;
    }
    interface Keyboard {
        keyState(kc: Key): ButtonState;
        down(kc: Key): boolean;
        pressed(kc: Key): boolean;
        halfTransitions(kc: Key): number;
        resetHalfTransitions(): void;
    }
    const keyboard: Keyboard;
}
declare namespace sd.math {
    namespace aabb {
        function setCenterAndSize(min: ConstFloat3, max: ConstFloat3, center: ConstFloat3, size: ConstFloat3): void;
        function calculateCenterAndSize(center: ConstFloat3, size: ConstFloat3, min: ConstFloat3, max: ConstFloat3): void;
        function encapsulatePoint(min: Float3, max: Float3, pt: ConstFloat3): void;
        function encapsulateAABB(min: Float3, max: Float3, otherMin: ConstFloat3, otherMax: ConstFloat3): void;
        function containsPoint(min: ConstFloat3, max: ConstFloat3, pt: ConstFloat3): boolean;
        function containsAABB(min: ConstFloat3, max: ConstFloat3, otherMin: ConstFloat3, otherMax: ConstFloat3): boolean;
        function intersectsAABB(min: ConstFloat3, max: ConstFloat3, otherMin: ConstFloat3, otherMax: ConstFloat3): boolean;
        function closestPoint(min: ConstFloat3, max: ConstFloat3, pt: ConstFloat3): number[];
        function size(min: ConstFloat3, max: ConstFloat3): number[];
        function extents(min: ConstFloat3, max: ConstFloat3): number[];
        function center(min: ConstFloat3, max: ConstFloat3): number[];
        function transformMat3(destMin: Float3, destMax: Float3, sourceMin: ConstFloat3, sourceMax: ConstFloat3, mat: ConstFloat3x3): void;
        function transformMat4(destMin: Float3, destMax: ConstFloat3, sourceMin: ConstFloat3, sourceMax: ConstFloat3, mat: ConstFloat4x4): void;
    }
    class AABB {
        min: Float32Array;
        max: Float32Array;
        constructor();
        constructor(min: Float3, max: Float3);
        static fromCenterAndSize(center: ConstFloat3, size: ConstFloat3): AABB;
        setCenterAndSize(center: ConstFloat3, size: ConstFloat3): void;
        setMinAndMax(min: ConstFloat3, max: ConstFloat3): void;
        encapsulatePoint(pt: ConstFloat3): void;
        encapsulateAABB(bounds: AABB): void;
        readonly size: number[];
        readonly extents: number[];
        readonly center: number[];
        containsPoint(pt: ConstFloat3): boolean;
        containsAABB(bounds: AABB): boolean;
        intersectsAABB(bounds: AABB): boolean;
        closestPoint(pt: ConstFloat3): number[];
    }
}
declare namespace sd.math {
    function viewportMatrix(x: number, y: number, w: number, h: number, n: number, f: number): Float4x4;
    function screenSpaceBoundsForWorldCube(outBounds: Rect, position: Float3, halfDim: number, cameraDir: Float3, viewMatrix: Float4x4, projectionViewMatrix: Float4x4, viewportMatrix: Float4x4): void;
    interface Sphere {
        center: Float3;
        radius: number;
    }
    interface Plane {
        normal: Float3;
        d: number;
    }
    function makePlaneFromPoints(a: Float3, b: Float3, c: Float3): Plane;
    function makePlaneFromPointAndNormal(p: Float3, normal: Float3): Plane;
    function pointDistanceToPlane(point: Float3, plane: Plane): number;
    interface BoundedPlane extends Plane {
        center: Float3;
        size: Float2;
    }
    function makeBoundedPlane(center: Float3, normal: Float3, size: Float2): BoundedPlane;
    function boundingSizeOfBoundedPlane(bp: BoundedPlane): Float3;
    function transformBoundedPlaneMat4(bp: BoundedPlane, mat: Float4x4): BoundedPlane;
    interface SpherePlaneIntersection {
        intersected: boolean;
        t?: number;
        point?: Float3;
    }
    function planesOfTransformedBox(center: Float3, size: Float3, _transMat4: Float4x4): Plane[];
    function intersectMovingSpherePlane(sphere: Sphere, direction: Float3, plane: Plane): SpherePlaneIntersection;
}
declare namespace sd.world {
    interface ProjectionSetup {
        projectionMatrix: Float4x4;
        viewMatrix: Float4x4;
    }
}
declare namespace sd.math {
    interface Rect {
        left: number;
        top: number;
        right: number;
        bottom: number;
    }
    class RectStorage {
        private data_;
        leftBase: TypedArray;
        topBase: TypedArray;
        rightBase: TypedArray;
        bottomBase: TypedArray;
        constructor(elementType: NumericType, capacity: number);
        readonly capacity: number;
    }
    class RectStorageProxy implements Rect {
        private storage_;
        index: number;
        constructor(storage_: RectStorage, index: number);
        left: number;
        top: number;
        right: number;
        bottom: number;
    }
    function setRectLTRB(r: Rect, left: number, top: number, right: number, bottom: number): void;
    function setRectLTWH(r: Rect, left: number, top: number, width: number, height: number): void;
    class RectEx implements Rect {
        left: number;
        top: number;
        right: number;
        bottom: number;
        topLeft: Float32Array;
        topRight: Float32Array;
        bottomLeft: Float32Array;
        bottomRight: Float32Array;
        constructor(left: number, top: number, right: number, bottom: number);
        intersectsLineSegment(ptA: Float3, ptB: Float3): boolean;
    }
}
declare namespace sd.meshdata {
    const enum VertexAttributeMapping {
        Undefined = 0,
        Vertex = 1,
        PolygonVertex = 2,
        Polygon = 3,
        SingleValue = 4,
    }
    interface VertexAttributeStream {
        name?: string;
        attr?: VertexAttribute;
        mapping: VertexAttributeMapping;
        includeInMesh: boolean;
        controlsGrouping?: boolean;
        values?: TypedArray;
        indexes?: TypedArray;
        elementCount?: number;
    }
    interface VertexIndexMapping {
        add(from: number, to: number): void;
        mappedValues(forIndex: number): number[];
        readonly indexCount: number;
    }
    class MeshBuilder {
        private vertexData_;
        private sourcePolygonIndex_;
        private streamCount_;
        private vertexCount_;
        private triangleCount_;
        private vertexMapping_;
        private indexMap_;
        private groupIndex_;
        private groupIndexStreams_;
        private groupIndexesRef_;
        private streams_;
        constructor(positions: Float32Array, positionIndexes: Uint32Array | null, streams: VertexAttributeStream[]);
        private streamIndexesForPVI(polygonVertexIndex, vertexIndex, polygonIndex);
        setGroup(newGroupIndex: number): void;
        private getVertexIndex(streamIndexes);
        private addTriangle(polygonVertexIndexes, vertexIndexes);
        addPolygon(polygonVertexIndexes: ArrayOfNumber, vertexIndexes: ArrayOfNumber): void;
        readonly curPolygonIndex: number;
        readonly indexMap: VertexIndexMapping;
        complete(): MeshData;
    }
}
declare namespace sd.meshdata.gen {
    type Vec2AddFn = (u: number, v: number) => void;
    type Vec3AddFn = (x: number, y: number, z: number) => void;
    type IndexesAddFn = (a: number, b: number, c: number) => void;
    interface MeshGenerator {
        readonly vertexCount: number;
        readonly faceCount: number;
        readonly explicitNormals: boolean;
        generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
    }
    interface TransformedMeshGen {
        generator: MeshGenerator;
        rotation?: Float4;
        translation?: Float3;
        scale?: Float3;
    }
    type MeshGenSource = MeshGenerator | TransformedMeshGen;
    function generate(gens: MeshGenSource | MeshGenSource[], attrList?: VertexAttribute[]): MeshData;
    class Quad implements MeshGenerator {
        private width_;
        private height_;
        constructor(width_?: number, height_?: number);
        readonly vertexCount: number;
        readonly faceCount: number;
        readonly explicitNormals: boolean;
        generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
    }
    type PlaneYGenerator = (x: number, z: number) => number;
    interface PlaneDescriptor {
        width: number;
        depth: number;
        yGen?: PlaneYGenerator;
        rows: number;
        segs: number;
    }
    class Plane implements MeshGenerator {
        private width_;
        private depth_;
        private rows_;
        private segs_;
        private yGen_;
        constructor(desc: PlaneDescriptor);
        readonly vertexCount: number;
        readonly faceCount: number;
        readonly explicitNormals: boolean;
        generate(position: Vec3AddFn, face: IndexesAddFn, _normal: Vec3AddFn, uv: Vec2AddFn): void;
    }
    interface BoxDescriptor {
        width: number;
        height: number;
        depth: number;
        inward: boolean;
        uvRange?: Float2;
        uvOffset?: Float2;
    }
    function cubeDescriptor(diam: number, inward?: boolean): BoxDescriptor;
    class Box implements MeshGenerator {
        private xDiam_;
        private yDiam_;
        private zDiam_;
        private uvRange_;
        private uvOffset_;
        private inward_;
        constructor(desc: BoxDescriptor);
        readonly vertexCount: number;
        readonly faceCount: number;
        readonly explicitNormals: boolean;
        generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
    }
    interface ConeDescriptor {
        radiusA: number;
        radiusB: number;
        height: number;
        rows: number;
        segs: number;
    }
    class Cone implements MeshGenerator {
        private radiusA_;
        private radiusB_;
        private height_;
        private rows_;
        private segs_;
        constructor(desc: ConeDescriptor);
        readonly vertexCount: number;
        readonly faceCount: number;
        readonly explicitNormals: boolean;
        generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
    }
    interface SphereDescriptor {
        radius: number;
        rows: number;
        segs: number;
        sliceFrom?: number;
        sliceTo?: number;
    }
    class Sphere implements MeshGenerator {
        private radius_;
        private rows_;
        private segs_;
        private sliceFrom_;
        private sliceTo_;
        constructor(desc: SphereDescriptor);
        readonly vertexCount: number;
        readonly faceCount: number;
        readonly explicitNormals: boolean;
        generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
    }
    interface TorusDescriptor {
        minorRadius: number;
        majorRadius: number;
        rows: number;
        segs: number;
        sliceFrom?: number;
        sliceTo?: number;
    }
    class Torus implements MeshGenerator {
        private minorRadius_;
        private majorRadius_;
        private rows_;
        private segs_;
        private sliceFrom_;
        private sliceTo_;
        constructor(desc: TorusDescriptor);
        readonly vertexCount: number;
        readonly faceCount: number;
        readonly explicitNormals: boolean;
        generate(position: Vec3AddFn, face: IndexesAddFn, normal: Vec3AddFn, uv: Vec2AddFn): void;
    }
}
declare namespace sd.meshdata {
    function scale(mesh: MeshData, scale: Float3): void;
    function translate(mesh: MeshData, globalDelta: Float3): void;
    function rotate(mesh: MeshData, rotation: Float4): void;
    function transform(mesh: MeshData, actions: {
        rotate?: Float4;
        translate?: Float3;
        scale?: Float3;
    }): void;
}
declare namespace sd.meshdata {
    const enum VertexField {
        Undefined = 0,
        UInt8x2 = 1,
        UInt8x3 = 2,
        UInt8x4 = 3,
        SInt8x2 = 4,
        SInt8x3 = 5,
        SInt8x4 = 6,
        UInt16x2 = 7,
        UInt16x3 = 8,
        UInt16x4 = 9,
        SInt16x2 = 10,
        SInt16x3 = 11,
        SInt16x4 = 12,
        UInt32 = 13,
        UInt32x2 = 14,
        UInt32x3 = 15,
        UInt32x4 = 16,
        SInt32 = 17,
        SInt32x2 = 18,
        SInt32x3 = 19,
        SInt32x4 = 20,
        Float = 21,
        Floatx2 = 22,
        Floatx3 = 23,
        Floatx4 = 24,
        Norm_UInt8x2 = 129,
        Norm_UInt8x3 = 130,
        Norm_UInt8x4 = 131,
        Norm_SInt8x2 = 132,
        Norm_SInt8x3 = 133,
        Norm_SInt8x4 = 134,
        Norm_UInt16x2 = 135,
        Norm_UInt16x3 = 136,
        Norm_UInt16x4 = 137,
        Norm_SInt16x2 = 138,
        Norm_SInt16x3 = 139,
        Norm_SInt16x4 = 140,
    }
    function vertexFieldElementCount(vf: VertexField): 0 | 1 | 4 | 2 | 3;
    function vertexFieldNumericType(vf: VertexField): NumericType | null;
    function vertexFieldElementSizeBytes(vf: VertexField): number;
    function vertexFieldSizeBytes(vf: VertexField): number;
    function vertexFieldIsNormalized(vf: VertexField): boolean;
    const enum VertexAttributeRole {
        None = 0,
        Position = 1,
        Normal = 2,
        Tangent = 3,
        Colour = 4,
        Material = 5,
        UV = 6,
        UV0 = 6,
        UV1 = 7,
        UV2 = 8,
        UV3 = 9,
        WeightedPos0 = 10,
        WeightedPos1 = 11,
        WeightedPos2 = 12,
        WeightedPos3 = 13,
        JointIndexes = 14,
    }
    interface VertexAttribute {
        readonly field: VertexField;
        readonly role: VertexAttributeRole;
    }
    function attrPosition2(): VertexAttribute;
    function attrPosition3(): VertexAttribute;
    function attrNormal3(): VertexAttribute;
    function attrColour3(): VertexAttribute;
    function attrUV2(): VertexAttribute;
    function attrTangent3(): VertexAttribute;
    function attrJointIndexes(): VertexAttribute;
    function attrWeightedPos(index: number): {
        field: VertexField;
        role: number;
    };
    namespace AttrList {
        function Pos3Norm3(): VertexAttribute[];
        function Pos3Norm3Colour3(): VertexAttribute[];
        function Pos3Norm3UV2(): VertexAttribute[];
        function Pos3Norm3Colour3UV2(): VertexAttribute[];
        function Pos3Norm3UV2Tan3(): VertexAttribute[];
    }
    interface PositionedAttribute extends VertexAttribute {
        readonly offset: number;
    }
    function makePositionedAttr(vf: VertexField, ar: VertexAttributeRole, offset: number): PositionedAttribute;
    function makePositionedAttr(attr: VertexAttribute, offset: number): PositionedAttribute;
    class VertexLayout {
        private attributeCount_;
        private vertexSizeBytes_;
        private attrs_;
        constructor(attrList: VertexAttribute[]);
        readonly attributeCount: number;
        readonly vertexSizeBytes: number;
        bytesRequiredForVertexCount(vertexCount: number): number;
        attrByRole(role: VertexAttributeRole): PositionedAttribute | null;
        attrByIndex(index: number): PositionedAttribute | null;
        hasAttributeWithRole(role: VertexAttributeRole): boolean;
    }
    interface ClientBuffer {
        readonly bufferSizeBytes: number;
        readonly bufferLocalOffsetBytes: number;
        readonly buffer: ArrayBuffer | null;
        bufferView(): ArrayBufferView | null;
    }
    class VertexBuffer implements ClientBuffer {
        private layout_;
        private itemCount_;
        private storageOffsetBytes_;
        private storage_;
        constructor(attrs: VertexAttribute[] | VertexLayout);
        readonly layout: VertexLayout;
        readonly strideBytes: number;
        readonly attributeCount: number;
        readonly itemCount: number;
        readonly bufferSizeBytes: number;
        readonly bufferLocalOffsetBytes: number;
        readonly buffer: ArrayBuffer | null;
        bufferView(): ArrayBufferView | null;
        allocate(itemCount: number): void;
        suballocate(itemCount: number, insideBuffer: ArrayBuffer, atByteOffset: number): void;
        hasAttributeWithRole(role: VertexAttributeRole): boolean;
        attrByRole(role: VertexAttributeRole): PositionedAttribute | null;
        attrByIndex(index: number): PositionedAttribute | null;
    }
    class VertexBufferAttributeView {
        private vertexBuffer_;
        private attr_;
        private firstItem_;
        private stride_;
        private attrOffset_;
        private attrElementCount_;
        private fieldNumType_;
        private typedViewCtor_;
        private buffer_;
        private dataView_;
        private viewItemCount_;
        constructor(vertexBuffer_: VertexBuffer, attr_: PositionedAttribute, firstItem_?: number, itemCount?: number);
        forEach(callback: (item: TypedArray) => void): void;
        copyValuesFrom(source: ArrayOfConstNumber, valueCount: number, offset?: number): void;
        refItem(index: number): TypedArray;
        copyItem(index: number): number[];
        readonly count: number;
        readonly elementCount: number;
        readonly baseVertex: number;
        readonly vertexBuffer: VertexBuffer;
        subView(fromItem: number, subItemCount: number): VertexBufferAttributeView;
    }
    const enum IndexElementType {
        None = 0,
        UInt8 = 1,
        UInt16 = 2,
        UInt32 = 3,
    }
    const enum PrimitiveType {
        None = 0,
        Point = 1,
        Line = 2,
        LineStrip = 3,
        Triangle = 4,
        TriangleStrip = 5,
    }
    type TypedIndexArray = Uint32Array | Uint16Array | Uint8Array;
    function indexElementTypeSizeBytes(iet: IndexElementType): number;
    function minimumIndexElementTypeForVertexCount(vertexCount: number): IndexElementType;
    function bytesRequiredForIndexCount(elementType: IndexElementType, indexCount: number): number;
    function elementOffsetForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number): number;
    function elementCountForPrimitiveCount(primitiveType: PrimitiveType, primitiveCount: number): number;
    function primitiveCountForElementCount(primitiveType: PrimitiveType, elementCount: number): number;
    class IndexBuffer implements ClientBuffer {
        private indexElementType_;
        private indexCount_;
        private indexElementSizeBytes_;
        private storage_;
        private storageOffsetBytes_;
        allocate(elementType: IndexElementType, elementCount: number): void;
        suballocate(elementType: IndexElementType, indexCount: number, insideBuffer: ArrayBuffer, atByteOffset: number): void;
        readonly indexElementType: IndexElementType;
        readonly indexCount: number;
        readonly indexElementSizeBytes: number;
        readonly bufferSizeBytes: number;
        readonly bufferLocalOffsetBytes: number;
        readonly buffer: ArrayBuffer | null;
        bufferView(): ArrayBufferView | null;
        typedBasePtr(baseIndexNr: number, elementCount: number): TypedIndexArray;
        copyIndexes(baseIndexNr: number, outputCount: number, outputPtr: Uint32Array): void;
        index(indexNr: number): number;
        setIndexes(baseIndexNr: number, sourceCount: number, sourcePtr: ArrayOfNumber): void;
        setIndex(indexNr: number, newValue: number): void;
    }
    class TriangleProxy {
        private data_;
        constructor(data: TypedIndexArray, triangleIndex: number);
        index(index: number): number;
        a(): number;
        b(): number;
        c(): number;
        setIndex(index: number, newValue: number): void;
        setA(newValue: number): void;
        setB(newValue: number): void;
        setC(newValue: number): void;
    }
    class IndexBufferTriangleView {
        private indexBuffer_;
        private fromTriangle_;
        private toTriangle_;
        constructor(indexBuffer_: IndexBuffer, fromTriangle_?: number, toTriangle_?: number);
        forEach(callback: (proxy: TriangleProxy) => void): void;
        refItem(triangleIndex: number): TypedIndexArray;
        subView(fromTriangle: number, triangleCount: number): IndexBufferTriangleView;
        readonly count: number;
    }
    function calcVertexNormals(vertexBuffer: VertexBuffer, indexBuffer: IndexBuffer): void;
    function calcVertexNormalsViews(posView: VertexBufferAttributeView, normView: VertexBufferAttributeView, triView: IndexBufferTriangleView): void;
    function calcVertexTangents(vertexBuffer: VertexBuffer, indexBuffer: IndexBuffer, uvSet?: VertexAttributeRole): void;
    function calcVertexTangentsViews(posView: VertexBufferAttributeView, normView: VertexBufferAttributeView, uvView: VertexBufferAttributeView, tanView: VertexBufferAttributeView, triView: IndexBufferTriangleView): void;
    interface PrimitiveGroup {
        type: meshdata.PrimitiveType;
        fromElement: number;
        elementCount: number;
        materialIx: number;
    }
    class MeshData {
        vertexBuffers: VertexBuffer[];
        indexBuffer: IndexBuffer | null;
        primitiveGroups: PrimitiveGroup[];
        allocateSingleStorage(vertexBufferItemCounts: number[], elementType: IndexElementType, indexCount: number): void;
        findFirstAttributeWithRole(role: VertexAttributeRole): {
            vertexBuffer: VertexBuffer;
            attr: PositionedAttribute;
        } | null;
        genVertexNormals(): void;
    }
}
declare namespace sd.render {
    interface AttachmentDescriptor {
        texture: Texture | null;
        level: number;
        layer: number | CubeMapFace;
    }
    interface FrameBufferDescriptor {
        colourAttachments: AttachmentDescriptor[];
        depthAttachment: AttachmentDescriptor;
        stencilAttachment: AttachmentDescriptor;
    }
    interface FrameBufferAllocationDescriptor {
        width: number;
        height: number;
        colourPixelFormats: PixelFormat[];
        depthPixelFormat: PixelFormat;
        stencilPixelFormat: PixelFormat;
    }
    function makeAttachmentDescriptor(texture?: Texture, level?: number, layer?: number): AttachmentDescriptor;
    function makeFrameBufferDescriptor(): FrameBufferDescriptor;
    function makeFrameBufferAllocationDescriptor(numColourAttachments: number): FrameBufferAllocationDescriptor;
}
declare namespace sd.render {
    const enum FBOPixelComponent {
        Integer = 0,
        HalfFloat = 1,
        Float = 2,
    }
    function pixelFormatForFBOPixelComponent(fbopc: FBOPixelComponent): PixelFormat.None | PixelFormat.RGB8 | PixelFormat.RGBA16F | PixelFormat.RGBA32F;
    interface DefaultFBODesc {
        colourCount: number;
        pixelComponent?: FBOPixelComponent;
        useDepth?: boolean;
        useStencil?: boolean;
        depthReadback?: boolean;
    }
    function makeDefaultFrameBuffer(rc: RenderContext, width: number, height: number, desc: DefaultFBODesc): FrameBuffer;
    function makeSquareFrameBuffer(rc: RenderContext, dimension: number, desc: DefaultFBODesc): FrameBuffer;
    function makeScreenFrameBuffer(rc: RenderContext, desc: DefaultFBODesc): FrameBuffer;
    function canUseShadowMaps(rc: RenderContext): OESStandardDerivatives;
    function makeShadowMapFrameBuffer(rc: RenderContext, dimension: number): FrameBuffer;
}
declare namespace sd.render {
    function allocateTexturesForFrameBuffer(rc: RenderContext, desc: FrameBufferAllocationDescriptor): FrameBufferDescriptor;
    class FrameBuffer {
        private rc;
        private attachmentDesc_;
        private fbo_;
        private width_;
        private height_;
        private attachTexture(glAttachment, attachment);
        constructor(rc: RenderContext, desc: FrameBufferDescriptor);
        bind(): void;
        unbind(): void;
        readonly width: number;
        readonly height: number;
        readonly resource: WebGLFramebuffer;
        hasColourAttachment(atIndex: number): boolean;
        hasDepthAttachment(): boolean;
        hasStencilAttachment(): boolean;
        colourAttachmentTexture(atIndex: number): Texture | null;
        depthAttachmentTexture(): Texture | null;
        stencilAttachmentTexture(): Texture | null;
    }
}
declare namespace sd.render {
    class FXAAPass {
        private pipeline_;
        private quad_;
        private texUniform_;
        private viewportUniform_;
        constructor(rc: RenderContext, meshMgr: world.MeshManager);
        apply(rc: RenderContext, meshMgr: world.MeshManager, source: Texture): void;
    }
    class FilterPass {
        private pipeline_;
        private fbo_;
        private quad_;
        private texUniform_;
        private viewportUniform_;
        constructor(rc: RenderContext, meshMgr: world.MeshManager, width: number, height: number, pixelComponent: FBOPixelComponent, filter: string);
        apply(rc: RenderContext, meshMgr: world.MeshManager, source: Texture): void;
        readonly output: Texture;
    }
    function resamplePass(rc: RenderContext, meshMgr: world.MeshManager, dim: number): FilterPass;
    function boxFilterPass(rc: RenderContext, meshMgr: world.MeshManager, dim: number): FilterPass;
}
declare namespace sd.render {
    function prefilteredEnvMap(rc: RenderContext, meshMgr: world.MeshManager, sourceEnvMap: Texture, numSamples: number): Texture;
}
declare namespace sd.render {
    const enum BlendOperation {
        Add = 0,
        Subtract = 1,
        ReverseSubtract = 2,
        Min = 3,
        Max = 4,
    }
    const enum BlendFactor {
        Zero = 0,
        One = 1,
        SourceColour = 2,
        OneMinusSourceColour = 3,
        DestColour = 4,
        OneMinusDestColour = 5,
        SourceAlpha = 6,
        OneMinusSourceAlpha = 7,
        SourceAlphaSaturated = 8,
        DestAlpha = 9,
        OneMinusDestAlpha = 10,
        ConstantColour = 11,
        OneMinusConstantColour = 12,
        ConstantAlpha = 13,
        OneMinusConstantAlpha = 14,
    }
    interface ColourBlendingDescriptor {
        rgbBlendOp: BlendOperation;
        alphaBlendOp: BlendOperation;
        sourceRGBFactor: BlendFactor;
        sourceAlphaFactor: BlendFactor;
        destRGBFactor: BlendFactor;
        destAlphaFactor: BlendFactor;
        constantColour: Float4;
    }
    interface ColourWriteMask {
        red: boolean;
        green: boolean;
        blue: boolean;
        alpha: boolean;
    }
    type AttributeNameMap = Map<meshdata.VertexAttributeRole, string>;
    interface PipelineDescriptor {
        colourMask?: ColourWriteMask;
        depthMask: boolean;
        blending?: ColourBlendingDescriptor;
        vertexShader?: WebGLShader;
        fragmentShader?: WebGLShader;
        attributeNames: AttributeNameMap;
    }
    function makeColourBlendingDescriptor(): ColourBlendingDescriptor;
    function makeColourWriteMask(): ColourWriteMask;
    function makePipelineDescriptor(): PipelineDescriptor;
}
declare namespace sd.render {
    class Pipeline {
        private rc;
        private writeMask_?;
        private depthMask_;
        private blending_?;
        private program_;
        private attrRoleIndexMap_;
        constructor(rc: RenderContext, desc: PipelineDescriptor);
        bind(): void;
        unbind(): void;
        readonly program: WebGLProgram;
        readonly attributeCount: number;
        attributePairs(): IterableIterator<[meshdata.VertexAttributeRole, number]>;
        attributeIndexForRole(role: meshdata.VertexAttributeRole): number | undefined;
    }
}
declare namespace sd.render {
    const enum PixelFormat {
        None = 0,
        Alpha = 1,
        RGB8 = 2,
        RGBA8 = 3,
        SRGB8 = 4,
        SRGB8_Alpha8 = 5,
        RGBA16F = 6,
        RGBA32F = 7,
        RGB_5_6_5 = 8,
        RGBA_4_4_4_4 = 9,
        RGBA_5_5_5_1 = 10,
        Depth16I = 11,
        Depth24I = 12,
        Stencil8 = 13,
        Depth24_Stencil8 = 14,
        RGB_DXT1 = 256,
        RGBA_DXT1 = 257,
        RGBA_DXT3 = 258,
        RGBA_DXT5 = 259,
    }
    function pixelFormatIsCompressed(format: PixelFormat): boolean;
    function pixelFormatIsDepthFormat(format: PixelFormat): boolean;
    function pixelFormatIsStencilFormat(format: PixelFormat): boolean;
    function pixelFormatIsDepthStencilFormat(format: PixelFormat): boolean;
    function pixelFormatBytesPerElement(format: PixelFormat): 0 | 1 | 4 | 2 | 8 | 3 | 16;
    function glImageFormatForPixelFormat(rc: RenderContext, format: PixelFormat): number;
    function glPixelDataTypeForPixelFormat(rc: RenderContext, format: PixelFormat): number;
    interface PixelCoordinate {
        x: number;
        y: number;
    }
    interface PixelDimensions {
        width: number;
        height: number;
    }
    function makePixelCoordinate(x: number, y: number): PixelCoordinate;
    function makePixelDimensions(width: number, height: number): PixelDimensions;
}
declare namespace sd.render {
    interface RenderContext {
        gl: WebGLRenderingContext;
        ext32bitIndexes: OESElementIndexUint;
        extDrawBuffers: WebGLDrawBuffers;
        extDepthTexture: WebGLDepthTexture;
        extTextureFloat: OESTextureFloat;
        extTextureFloatLinear: OESTextureFloatLinear;
        extTextureHalfFloat: OESTextureHalfFloat;
        extTextureHalfFloatLinear: OESTextureHalfFloatLinear;
        extS3TC: WebGLCompressedTextureS3TC;
        extMinMax: EXTBlendMinMax;
        extTexAnisotropy: EXTTextureFilterAnisotropic;
        extVAO: OESVertexArrayObject;
        extInstancedArrays: ANGLEInstancedArrays;
        extDerivatives: OESStandardDerivatives;
        extFragmentLOD: EXTShaderTextureLOD;
        extFragDepth: EXTFragDepth;
        extSRGB: EXTsRGB;
    }
    function maxColourAttachments(rc: RenderContext): number;
    function maxDrawBuffers(rc: RenderContext): number;
    function makeShader(rc: RenderContext, type: number, sourceText: string): WebGLShader;
    function makeProgram(rc: RenderContext, vertexShader?: WebGLShader, fragmentShader?: WebGLShader): WebGLProgram;
    function makeRenderContext(canvas: HTMLCanvasElement): RenderContext | null;
}
declare namespace sd.render {
    const enum FrontFaceWinding {
        Clockwise = 0,
        CounterClockwise = 1,
    }
    const enum FaceCulling {
        Disabled = 0,
        Front = 1,
        Back = 2,
    }
    const enum DepthTest {
        Disabled = 0,
        AllowAll = 1,
        DenyAll = 2,
        Less = 3,
        LessOrEqual = 4,
        Equal = 5,
        NotEqual = 6,
        GreaterOrEqual = 7,
        Greater = 8,
    }
    const enum ClearMask {
        None = 0,
        Colour = 1,
        Depth = 2,
        Stencil = 4,
        ColourDepth = 3,
        DepthStencil = 6,
        All = 7,
    }
    interface ScissorRect {
        originX: number;
        originY: number;
        width: number;
        height: number;
    }
    interface Viewport {
        originX: number;
        originY: number;
        width: number;
        height: number;
        nearZ: number;
        farZ: number;
    }
    interface RenderPassDescriptor {
        clearMask: ClearMask;
        clearColour: Float4;
        clearDepth: number;
        clearStencil: number;
    }
    function makeScissorRect(): ScissorRect;
    function makeViewport(): Viewport;
    function makeRenderPassDescriptor(): RenderPassDescriptor;
}
declare namespace sd.render {
    function runRenderPass(rc: RenderContext, meshMgr: world.MeshManager, rpDesc: RenderPassDescriptor, frameBuffer: FrameBuffer | null, passFunc: (rp: RenderPass) => void): void;
    class RenderPass {
        private rc;
        private meshMgr_;
        private desc_;
        private frameBuffer_;
        private pipeline_;
        private mesh_;
        private viewport_;
        constructor(rc: RenderContext, meshMgr_: world.MeshManager, desc_: RenderPassDescriptor, frameBuffer_?: FrameBuffer | null);
        setup(): void;
        teardown(): void;
        readonly frameBuffer: FrameBuffer | null;
        setPipeline(pipeline: Pipeline | null): void;
        setMesh(mesh: world.MeshInstance): void;
        setDepthTest(depthTest: DepthTest): void;
        setFaceCulling(faceCulling: FaceCulling): void;
        setFrontFaceWinding(winding: FrontFaceWinding): void;
        setViewPort(viewport: Viewport): void;
        viewport(): Viewport | null;
        setScissorRect(rect: ScissorRect): void;
        setConstantBlendColour(colour4: Float4): void;
        setTexture(texture: Texture, bindPoint: number): void;
        drawPrimitives(primitiveType: meshdata.PrimitiveType, startElement: number, elementCount: number, instanceCount?: number): void;
        drawIndexedPrimitives(primitiveType: meshdata.PrimitiveType, indexElementType: meshdata.IndexElementType, startElement: number, elementCount: number, instanceCount?: number): void;
    }
}
declare namespace sd.render {
    const enum TextureClass {
        None = 0,
        Tex2D = 1,
        TexCube = 2,
    }
    const enum UseMipMaps {
        No = 0,
        Yes = 1,
    }
    const enum CubeMapFace {
        PosX = 0,
        NegX = 1,
        PosY = 2,
        NegY = 3,
        PosZ = 4,
        NegZ = 5,
    }
    interface MipMapRange {
        baseLevel: number;
        numLevels: number;
    }
    const enum TextureRepeatMode {
        Repeat = 0,
        MirroredRepeat = 1,
        ClampToEdge = 2,
    }
    const enum TextureSizingFilter {
        Nearest = 0,
        Linear = 1,
    }
    const enum TextureMipFilter {
        None = 0,
        Nearest = 1,
        Linear = 2,
    }
    interface SamplerDescriptor {
        repeatS: TextureRepeatMode;
        repeatT: TextureRepeatMode;
        minFilter: TextureSizingFilter;
        magFilter: TextureSizingFilter;
        mipFilter: TextureMipFilter;
        maxAnisotropy: number;
    }
    type TextureImageSource = ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
    type TextureImageData = ArrayBufferView | TextureImageSource;
    interface TextureDescriptor {
        textureClass: TextureClass;
        pixelFormat: PixelFormat;
        sampling: SamplerDescriptor;
        dim: PixelDimensions;
        mipmaps: number;
        pixelData?: TextureImageData[];
    }
    function useMipMaps(use: boolean): UseMipMaps;
    function makeMipMapRange(baseLevel: number, numLevels: number): MipMapRange;
    function makeSamplerDescriptor(): SamplerDescriptor;
    function maxMipLevelsForDimension(dim: number): number;
    function makeTextureDescriptor(): TextureDescriptor;
    function makeTexDesc2D(pixelFormat: PixelFormat, width: number, height: number, mipmapped?: UseMipMaps): TextureDescriptor;
    function makeTexDesc2DFromImageSource(source: TextureImageSource, colourSpace: asset.ColourSpace, mipmapped?: UseMipMaps): TextureDescriptor;
    function makeTexDesc2DFloatLUT(sourceData: Float32Array, width: number, height: number): TextureDescriptor;
    function makeTexDescCube(pixelFormat: PixelFormat, dimension: number, mipmapped?: UseMipMaps): TextureDescriptor;
    function makeTexDescCubeFromImageSources(sources: TextureImageSource[], colourSpace: asset.ColourSpace, mipmapped?: UseMipMaps): TextureDescriptor;
}
declare namespace sd.render {
    function loadSimpleTexture(rc: RenderContext, filePath: string, mipmaps?: boolean, colourSpace?: asset.ColourSpace): Promise<render.Texture>;
    function loadCubeTexture(rc: RenderContext, filePaths: string[]): Promise<render.Texture>;
    function makeCubeMapPaths(basePath: string, extension: string): string[];
}
declare namespace sd.render {
    class Texture {
        private rc;
        private textureClass_;
        private dim_;
        private mipmaps_;
        private pixelFormat_;
        private sampler_;
        private resource_;
        private glTarget_;
        private createTex2D(pixelData?);
        private createTexCube(pixelData?);
        constructor(rc: RenderContext, desc: TextureDescriptor);
        bind(): void;
        unbind(): void;
        readonly dim: {
            width: number;
            height: number;
        };
        readonly width: number;
        readonly height: number;
        readonly mipmaps: number;
        readonly isMipMapped: boolean;
        readonly pixelFormat: PixelFormat;
        readonly textureClass: TextureClass;
        readonly resource: WebGLTexture;
        readonly target: number;
    }
}
declare namespace sd {
    class PerfTimer {
        private name_;
        private t0_;
        private lastT_;
        private stepSums_;
        constructor(name_: string);
        step(stepName: string): void;
        end(): void;
    }
}
declare namespace sd {
    const enum RunLoopState {
        Idle = 0,
        Running = 1,
    }
    interface SceneController {
        renderFrame(timeStep: number): void;
        simulationStep(timeStep: number): void;
        resume?(): void;
        suspend?(): void;
        focus?(): void;
        blur?(): void;
    }
    class RunLoop {
        private tickDuration_;
        private maxFrameDuration_;
        private globalTime_;
        private lastFrameTime_;
        private runState_;
        private rafID_;
        private nextFrameFn_;
        private sceneCtrl_;
        constructor();
        private nextFrame(now);
        start(): void;
        stop(): void;
        readonly globalTime: number;
        sceneController: SceneController | null;
    }
    const defaultRunLoop: RunLoop;
}
declare namespace sd.world {
    type ColliderInstance = Instance<ColliderManager>;
    type ColliderRange = InstanceRange<ColliderManager>;
    type ColliderSet = InstanceSet<ColliderManager>;
    type ColliderIterator = InstanceIterator<ColliderManager>;
    type ColliderArrayView = InstanceArrayView<ColliderManager>;
    const enum ColliderType {
        None = 0,
        Sphere = 1,
    }
    interface ColliderDescriptor {
        type: ColliderType;
        physicsMaterial: PhysicsMaterialRef;
        sphere?: math.Sphere;
    }
    class ColliderManager implements ComponentManager<ColliderManager> {
        private physMatMgr_;
        private instanceData_;
        private typeBase_;
        private entityBase_;
        private physMatBase_;
        private entityMap_;
        private sphereData_;
        constructor(physMatMgr_: PhysicsMaterialManager);
        private rebase();
        create(ent: Entity, desc: ColliderDescriptor): ColliderInstance;
        forEntity(ent: Entity): ColliderInstance;
        destroy(_inst: ColliderInstance): void;
        destroyRange(range: ColliderRange): void;
        readonly count: number;
        valid(inst: ColliderInstance): boolean;
        all(): ColliderRange;
        type(inst: ColliderInstance): ColliderType;
        entity(inst: ColliderInstance): Entity;
        physicsMaterial(inst: ColliderInstance): PhysicsMaterialData;
        sphereData(inst: ColliderInstance): math.Sphere;
    }
}
declare namespace sd.world {
    type Entity = Instance<EntityManager>;
    type EntityArrayView = InstanceArrayView<EntityManager>;
    function entityGeneration(ent: Entity): number;
    function entityIndex(ent: Entity): number;
    class EntityManager {
        private generation_;
        private genCount_;
        private freedIndices_;
        private minFreedBuildup;
        constructor();
        private appendGeneration();
        create(): Entity;
        alive(ent: Entity): boolean;
        destroy(ent: Entity): void;
    }
}
declare namespace sd.world {
    interface Instance<Component> extends Number {
        readonly __C?: Component;
    }
    interface InstanceArrayView<Component> {
        readonly length: number;
        [index: number]: Instance<Component>;
    }
    interface InstanceIterator<Component> {
        readonly current: Instance<Component>;
        next(): boolean;
    }
    interface InstanceRange<Component> {
        readonly empty: boolean;
        has(inst: Instance<Component>): boolean;
        makeIterator(): InstanceIterator<Component>;
        forEach(fn: (inst: Instance<Component>) => void, thisObj?: any): void;
    }
    interface ComponentManager<Component> {
        readonly count: number;
        valid(inst: Instance<Component>): boolean;
        destroy(inst: Instance<Component>): void;
        destroyRange(range: InstanceRange<Component>): void;
        all(): InstanceRange<Component>;
    }
    class InstanceLinearRange<Component> implements InstanceRange<Component> {
        private first_;
        private last_;
        constructor(first_: Instance<Component>, last_: Instance<Component>);
        readonly empty: boolean;
        readonly front: Instance<Component>;
        readonly back: Instance<Component>;
        has(inst: Instance<Component>): boolean;
        makeIterator(): InstanceIterator<Component>;
        forEach(fn: (inst: Instance<Component>) => void, thisObj?: any): void;
    }
    class InstanceArrayRange<Component> implements InstanceRange<Component> {
        private readonly data_;
        constructor(array: Instance<Component>[]);
        readonly empty: boolean;
        readonly front: Instance<Component>;
        readonly back: Instance<Component>;
        has(inst: Instance<Component>): boolean;
        makeIterator(): InstanceIterator<Component>;
        forEach(fn: (inst: Instance<Component>) => void, thisObj?: any): void;
    }
    class InstanceSet<Component> implements InstanceRange<Component> {
        private data_;
        readonly count: number;
        readonly empty: boolean;
        add(inst: Instance<Component>): void;
        addRange(inst: Instance<Component>, count: number): void;
        addArray(arr: ArrayLike<Instance<Component>>): void;
        remove(inst: Instance<Component>): void;
        removeRange(inst: Instance<Component>, count: number): void;
        removeArray(arr: ArrayLike<Instance<Component>>): void;
        clear(): void;
        has(inst: Instance<Component>): boolean;
        makeIterator(): InstanceIterator<Component>;
        forEach(fn: (inst: Instance<Component>) => void, thisObj?: any): void;
    }
}
declare namespace sd.world {
    type LightInstance = Instance<LightManager>;
    type LightRange = InstanceRange<LightManager>;
    type LightSet = InstanceSet<LightManager>;
    type LightIterator = InstanceIterator<LightManager>;
    type LightArrayView = InstanceArrayView<LightManager>;
    interface ShadowView {
        light: LightInstance;
        lightProjection: ProjectionSetup;
        shadowFBO: render.FrameBuffer;
        filteredTexture?: render.Texture;
    }
    class LightManager implements ComponentManager<LightManager> {
        private rc;
        private transformMgr_;
        private instanceData_;
        private entityBase_;
        private transformBase_;
        private enabledBase_;
        private shadowTypeBase_;
        private shadowQualityBase_;
        private lightData_;
        private globalLightData_;
        private tileLightIndexes_;
        private lightGrid_;
        private lutTexture_;
        private count_;
        private gridRowSpans_;
        private nullVec3_;
        private shadowFBO_;
        constructor(rc: render.RenderContext, transformMgr_: TransformManager);
        create(entity: Entity, desc: asset.Light): LightInstance;
        destroy(_inst: LightInstance): void;
        destroyRange(range: LightRange): void;
        readonly count: number;
        valid(inst: LightInstance): boolean;
        all(): LightRange;
        allEnabled(): LightRange;
        private projectPointLight(outBounds, center, range, projectionViewportMatrix);
        private updateLightGrid(range, projection, viewport);
        prepareLightsForRender(range: LightRange, proj: ProjectionSetup, viewport: render.Viewport): void;
        readonly lutTexture: render.Texture;
        private readonly lutTilesWide;
        private readonly lutTilesHigh;
        readonly lutParam: Float32Array;
        entity(inst: LightInstance): Entity;
        transform(inst: LightInstance): TransformInstance;
        enabled(inst: LightInstance): boolean;
        setEnabled(inst: LightInstance, newEnabled: boolean): void;
        localPosition(inst: LightInstance): number[];
        setLocalPosition(inst: LightInstance, newPosition: Float3): void;
        worldPosition(inst: LightInstance): number[];
        direction(inst: LightInstance): number[];
        setDirection(inst: LightInstance, newDirection: Float3): void;
        positionCameraSpace(inst: LightInstance): Float32Array;
        projectionSetupForLight(inst: LightInstance, viewportWidth: number, viewportHeight: number, nearZ: number): ProjectionSetup | null;
        private shadowFrameBufferOfQuality(rc, _quality);
        shadowViewForLight(rc: render.RenderContext, inst: LightInstance, nearZ: number): ShadowView | null;
        type(inst: LightInstance): asset.LightType;
        colour(inst: LightInstance): number[];
        setColour(inst: LightInstance, newColour: Float3): void;
        intensity(inst: LightInstance): number;
        setIntensity(inst: LightInstance, newIntensity: number): void;
        range(inst: LightInstance): number;
        setRange(inst: LightInstance, newRange: number): void;
        cutoff(inst: LightInstance): number;
        setCutoff(inst: LightInstance, newCutoff: number): void;
        shadowType(inst: LightInstance): asset.ShadowType;
        setShadowType(inst: LightInstance, newType: asset.ShadowType): void;
        shadowQuality(inst: LightInstance): asset.ShadowQuality;
        setShadowQuality(inst: LightInstance, newQuality: asset.ShadowQuality): void;
        shadowStrength(inst: LightInstance): number;
        setShadowStrength(inst: LightInstance, newStrength: number): void;
        shadowBias(inst: LightInstance): number;
        setShadowBias(inst: LightInstance, newBias: number): void;
    }
}
declare namespace sd.world {
    const enum MeshFeatures {
        VertexPositions = 1,
        VertexNormals = 2,
        VertexTangents = 4,
        VertexUVs = 8,
        VertexColours = 16,
        VertexWeights = 32,
        Indexes = 64,
    }
    interface MeshAttributeData {
        buffer: WebGLBuffer;
        vertexField: meshdata.VertexField;
        offset: number;
        stride: number;
    }
    type MeshInstance = Instance<MeshManager>;
    type MeshRange = InstanceRange<MeshManager>;
    type MeshSet = InstanceSet<MeshManager>;
    type MeshIterator = InstanceIterator<MeshManager>;
    type MeshArrayView = InstanceArrayView<MeshManager>;
    class MeshManager implements ComponentManager<MeshManager> {
        private rctx_;
        private instanceData_;
        private featuresBase_;
        private indexElementTypeBase_;
        private uniformPrimTypeBase_;
        private totalElementCountBase_;
        private buffersOffsetCountBase_;
        private attrsOffsetCountBase_;
        private primGroupsOffsetCountBase_;
        private bufGLBuffers_;
        private attributeData_;
        private attrRoleBase_;
        private attrBufferIndexBase_;
        private attrVertexFieldBase_;
        private attrFieldOffsetBase_;
        private attrStrideBase_;
        private primGroupData_;
        private pgPrimTypeBase_;
        private pgFromElementBase_;
        private pgElementCountBase_;
        private pgMaterialBase_;
        private pipelineVAOMaps_;
        private entityMap_;
        private assetMeshMap_;
        constructor(rctx_: render.RenderContext);
        rebaseInstances(): void;
        rebaseAttributes(): void;
        rebasePrimGroups(): void;
        create(mesh: asset.Mesh): MeshInstance;
        linkToEntity(inst: MeshInstance, ent: Entity): void;
        removeFromEntity(_inst: MeshInstance, ent: Entity): void;
        forEntity(ent: Entity): MeshInstance;
        destroy(_inst: MeshInstance): void;
        destroyRange(range: MeshRange): void;
        readonly count: number;
        valid(inst: MeshInstance): boolean;
        all(): MeshRange;
        private bindSingleAttribute(attr, toVAIndex);
        bind(inst: MeshInstance, toPipeline: render.Pipeline): void;
        unbind(_inst: MeshInstance, fromPipeline: render.Pipeline): void;
        attributes(inst: MeshInstance): Map<meshdata.VertexAttributeRole, MeshAttributeData>;
        primitiveGroups(inst: MeshInstance): meshdata.PrimitiveGroup[];
        features(inst: MeshInstance): MeshFeatures;
        indexBufferElementType(inst: MeshInstance): meshdata.IndexElementType;
        uniformPrimitiveType(inst: MeshInstance): meshdata.PrimitiveType;
        totalElementCount(inst: MeshInstance): number;
    }
}
declare namespace sd.world {
    const enum PBRMaterialFlags {
        SpecularSetup = 1,
        Emissive = 2,
        RoughnessMap = 4,
        MetallicMap = 8,
        AmbientOcclusionMap = 16,
        AlphaMap = 32,
        NormalMap = 64,
        HeightMap = 128,
    }
    interface PBRMaterialData {
        colourData: Float32Array;
        materialParam: Float32Array;
        emissiveData: Float32Array;
        texScaleOffsetData: Float32Array;
        albedoMap: render.Texture | null;
        materialMap: render.Texture | null;
        normalHeightMap: render.Texture | null;
        alphaMap: render.Texture | null;
        flags: PBRMaterialFlags;
    }
    type PBRMaterialInstance = Instance<PBRMaterialManager>;
    type PBRMaterialRange = InstanceRange<PBRMaterialManager>;
    type PBRMaterialSet = InstanceSet<PBRMaterialManager>;
    type PBRMaterialIterator = InstanceIterator<PBRMaterialManager>;
    type PBRMaterialArrayView = InstanceArrayView<PBRMaterialManager>;
    class PBRMaterialManager implements ComponentManager<PBRMaterialManager> {
        private instanceData_;
        private albedoMaps_;
        private materialMaps_;
        private normalHeightMaps_;
        private alphaMaps_;
        private baseColourBase_;
        private materialBase_;
        private emissiveBase_;
        private texScaleOffsetBase_;
        private opacityBase_;
        private flagsBase_;
        private tempVec4;
        constructor();
        private rebase();
        create(desc: asset.Material): PBRMaterialInstance;
        destroy(inst: PBRMaterialInstance): void;
        destroyRange(range: PBRMaterialRange): void;
        readonly count: number;
        valid(inst: PBRMaterialInstance): boolean;
        all(): PBRMaterialRange;
        baseColour(inst: PBRMaterialInstance): Float3;
        setBaseColour(inst: PBRMaterialInstance, newColour: Float3): void;
        emissiveColour(inst: PBRMaterialInstance): Float3;
        setEmissiveColour(inst: PBRMaterialInstance, newColour: Float3): void;
        emissiveIntensity(inst: PBRMaterialInstance): number;
        setEmissiveIntensity(inst: PBRMaterialInstance, newIntensity: number): void;
        metallic(inst: PBRMaterialInstance): number;
        setMetallic(inst: PBRMaterialInstance, newMetallic: number): void;
        roughness(inst: PBRMaterialInstance): number;
        setRoughness(inst: PBRMaterialInstance, newRoughness: number): void;
        smoothness(inst: PBRMaterialInstance): number;
        setSmoothness(inst: PBRMaterialInstance, newSmoothness: number): void;
        opacity(inst: PBRMaterialInstance): number;
        setOpacity(inst: PBRMaterialInstance, newOpacity: number): void;
        textureScale(inst: PBRMaterialInstance): Float2;
        setTextureScale(inst: PBRMaterialInstance, newScale: Float2): void;
        textureOffset(inst: PBRMaterialInstance): Float2;
        setTextureOffset(inst: PBRMaterialInstance, newOffset: Float2): void;
        albedoMap(inst: PBRMaterialInstance): render.Texture | null;
        setAlbedoMap(inst: PBRMaterialInstance, newTex: render.Texture | null): void;
        materialMap(inst: PBRMaterialInstance): render.Texture | null;
        normalHeightMap(inst: PBRMaterialInstance): render.Texture | null;
        alphaMap(inst: PBRMaterialInstance): render.Texture | null;
        flags(inst: PBRMaterialInstance): PBRMaterialFlags;
        getData(inst: PBRMaterialInstance): PBRMaterialData;
    }
}
declare namespace sd.world {
    const enum PBRLightingQuality {
        Phong = 0,
        Blinn = 1,
        CookTorrance = 2,
    }
    type PBRModelInstance = Instance<PBRModelManager>;
    type PBRModelRange = InstanceRange<PBRModelManager>;
    type PBRModelSet = InstanceSet<PBRModelManager>;
    type PBRModelIterator = InstanceIterator<PBRModelManager>;
    type PBRModelArrayView = InstanceArrayView<PBRModelManager>;
    interface PBRModelDescriptor {
        materials: asset.Material[];
        castsShadows?: boolean;
        acceptsShadows?: boolean;
    }
    class PBRModelManager implements ComponentManager<PBRModelManager> {
        private rc;
        private transformMgr_;
        private meshMgr_;
        private lightMgr_;
        private pbrPipeline_;
        private instanceData_;
        private entityBase_;
        private transformBase_;
        private enabledBase_;
        private shadowCastFlagsBase_;
        private materialOffsetCountBase_;
        private primGroupOffsetBase_;
        private materialMgr_;
        private materials_;
        private primGroupData_;
        private primGroupMaterialBase_;
        private primGroupFeatureBase_;
        private brdfLookupTex_;
        private shadowCastingLightIndex_;
        private modelViewMatrix_;
        private modelViewProjectionMatrix_;
        private normalMatrix_;
        constructor(rc: render.RenderContext, transformMgr_: TransformManager, meshMgr_: MeshManager, lightMgr_: LightManager);
        private loadBRDFLUTTexture();
        private rebase();
        private groupRebase();
        private featuresForMeshAndMaterial(mesh, material);
        private updatePrimGroups(modelIx);
        setRenderFeatureEnabled(feature: RenderFeature, enable: boolean): void;
        create(entity: Entity, desc: PBRModelDescriptor): PBRModelInstance;
        destroy(_inst: PBRModelInstance): void;
        destroyRange(range: PBRModelRange): void;
        readonly count: number;
        valid(inst: PBRModelInstance): boolean;
        all(): PBRModelRange;
        entity(inst: PBRModelInstance): Entity;
        transform(inst: PBRModelInstance): TransformInstance;
        enabled(inst: PBRModelInstance): boolean;
        setEnabled(inst: PBRModelInstance, newEnabled: boolean): void;
        materialRange(inst: PBRModelInstance): InstanceLinearRange<PBRMaterialManager>;
        readonly materialManager: PBRMaterialManager;
        shadowCaster(): LightInstance;
        setShadowCaster(inst: LightInstance): void;
        disableRenderFeature(f: RenderFeature): void;
        enableRenderFeature(f: RenderFeature): void;
        private drawSingleShadow(rp, proj, shadowPipeline, modelIx);
        private drawSingleForward(rp, proj, shadow, lightingQuality, modelIx);
        drawShadows(range: PBRModelRange, rp: render.RenderPass, proj: ProjectionSetup): void;
        draw(range: PBRModelRange, rp: render.RenderPass, proj: ProjectionSetup, shadow: ShadowView | null, lightingQuality: PBRLightingQuality, environmentMap: render.Texture): number;
    }
}
declare namespace sd.world {
    type PhysicsMaterialRef = Instance<PhysicsMaterialManager>;
    type PhysicsMaterialArrayView = InstanceArrayView<PhysicsMaterialManager>;
    class PhysicsMaterialData {
        friction: number;
        restitution: number;
    }
    class PhysicsMaterialManager {
        private instanceData_;
        private freed_;
        create(desc: PhysicsMaterialData): PhysicsMaterialRef;
        destroy(ref: PhysicsMaterialRef): void;
        readonly count: number;
        valid(ref: PhysicsMaterialRef): boolean;
        item(ref: PhysicsMaterialRef): PhysicsMaterialData;
    }
}
declare namespace sd.world {
    type RigidBodyInstance = Instance<RigidBodyManager>;
    type RigidBodyRange = InstanceRange<RigidBodyManager>;
    type RigidBodySet = InstanceSet<RigidBodyManager>;
    type RigidBodyIterator = InstanceIterator<RigidBodyManager>;
    type RigidBodyArrayView = InstanceArrayView<RigidBodyManager>;
    interface RigidBodyDescriptor {
        mass: number;
        hullSize?: Float3;
    }
    class RigidBodyManager implements ComponentManager<RigidBodyManager> {
        private transformMgr_;
        private instanceData_;
        private entityMap_;
        private entityBase_;
        private transformBase_;
        private massBase_;
        private velocityBase_;
        private forceBase_;
        private inertiaBase_;
        private angVelocityBase_;
        private torqueBase_;
        constructor(transformMgr_: TransformManager);
        private rebase();
        create(ent: Entity, desc: RigidBodyDescriptor): RigidBodyInstance;
        destroy(_inst: RigidBodyInstance): void;
        destroyRange(range: RigidBodyRange): void;
        readonly count: number;
        valid(inst: RigidBodyInstance): boolean;
        all(): RigidBodyRange;
        simulate(range: RigidBodyRange, dt: number): void;
        entity(inst: RigidBodyInstance): Entity;
        transform(inst: RigidBodyInstance): TransformInstance;
        forEntity(ent: Entity): RigidBodyInstance;
        setMass(inst: RigidBodyInstance, newMass: number, hullSize: Float3): void;
        mass(inst: RigidBodyInstance): number;
        inverseMass(inst: RigidBodyInstance): number;
        inertia(inst: RigidBodyInstance): Float3x3;
        inverseInertia(inst: RigidBodyInstance): Float3x3;
        velocity(inst: RigidBodyInstance): Float3;
        setVelocity(inst: RigidBodyInstance, newVelocity: Float3): void;
        angVelocity(inst: RigidBodyInstance): Float3;
        setAngVelocity(inst: RigidBodyInstance, newAngVelocity: Float3): void;
        stop(inst: RigidBodyInstance): void;
        addForce(inst: RigidBodyInstance, force: Float3, forceCenterOffset?: Float3): void;
        addTorque(inst: RigidBodyInstance, torque: Float3): void;
    }
}
declare namespace sd.world {
    interface EntityDescriptor {
        transform?: asset.Transform;
        parent?: TransformInstance;
        mesh?: asset.Mesh;
        stdModel?: StdModelDescriptor;
        pbrModel?: PBRModelDescriptor;
        rigidBody?: RigidBodyDescriptor;
        collider?: ColliderDescriptor;
        light?: asset.Light;
    }
    interface EntityInfo {
        entity: Entity;
        transform: TransformInstance;
        mesh?: MeshInstance;
        stdModel?: StdModelInstance;
        pbrModel?: PBRModelInstance;
        rigidBody?: RigidBodyInstance;
        collider?: ColliderInstance;
        light?: LightInstance;
    }
    class Scene {
        physMatMgr: PhysicsMaterialManager;
        entityMgr: EntityManager;
        transformMgr: TransformManager;
        lightMgr: LightManager;
        meshMgr: MeshManager;
        skeletonMgr: SkeletonManager;
        stdModelMgr: StdModelManager;
        pbrModelMgr: PBRModelManager;
        rigidBodyMgr: RigidBodyManager;
        colliderMgr: ColliderManager;
        constructor(rc: render.RenderContext);
        makeEntity(desc?: EntityDescriptor): EntityInfo;
    }
}
declare namespace sd.world {
    type SkeletonInstance = Instance<SkeletonManager>;
    type SkeletonRange = InstanceRange<SkeletonManager>;
    type SkeletonSet = InstanceSet<SkeletonManager>;
    type SkeletonIterator = InstanceIterator<SkeletonManager>;
    type SkeletonArrayView = InstanceArrayView<SkeletonManager>;
    class SkeletonManager {
        private rc;
        private transformMgr_;
        private nextSkelID_;
        private nextAnimID_;
        private skels_;
        private baseRotations_;
        private anims_;
        private jointData_;
        private jointDataTex_;
        constructor(rc: render.RenderContext, transformMgr_: TransformManager);
        createSkeleton(jointTransforms: TransformInstance[]): SkeletonInstance;
        createAnimation(skelAnim: asset.SkeletonAnimation): number;
        private updateJointData(_inst, skel);
        applyAnimFrameToSkeleton(inst: SkeletonInstance, animIndex: number, frameIndex: number): void;
        applyInterpFramesToSkeleton(inst: SkeletonInstance, animIndex: number, frameIndexA: number, frameIndexB: number, ratio: number): void;
        readonly jointDataTexture: render.Texture;
    }
}
declare namespace sd.world {
    class Skybox {
        private rc;
        private transformMgr_;
        private texture_;
        private mesh_;
        private meshAsset_;
        private pipeline_;
        private mvpMatrixUniform_;
        private textureCubeUniform_;
        private modelViewProjectionMatrix_;
        private entity_;
        private txInstance_;
        private vertexSource;
        private fragmentSource(rc);
        constructor(rc: render.RenderContext, transformMgr_: TransformManager, meshMgr: MeshManager, texture_: render.Texture);
        setEntity(entity: Entity): void;
        readonly entity: Instance<EntityManager>;
        readonly transform: Instance<TransformManager>;
        setCenter(xyz: Float3): void;
        setTexture(newTexture: render.Texture): void;
        draw(rp: render.RenderPass, proj: ProjectionSetup): number;
    }
}
declare namespace sd.world {
    interface StdMaterialData {
        colourData: Float32Array;
        specularData: Float32Array;
        emissiveData: Float32Array;
        texScaleOffsetData: Float32Array;
        diffuseMap: render.Texture | null;
        specularMap: render.Texture | null;
        normalMap: render.Texture | null;
        flags: asset.MaterialFlags;
    }
    type StdMaterialInstance = Instance<StdMaterialManager>;
    type StdMaterialRange = InstanceRange<StdMaterialManager>;
    type StdMaterialSet = InstanceSet<StdMaterialManager>;
    type StdMaterialIterator = InstanceIterator<StdMaterialManager>;
    type StdMaterialArrayView = InstanceArrayView<StdMaterialManager>;
    class StdMaterialManager implements ComponentManager<StdMaterialManager> {
        private instanceData_;
        private diffuseMaps_;
        private specularMaps_;
        private normalMaps_;
        private mainColourBase_;
        private specularBase_;
        private emissiveBase_;
        private texScaleOffsetBase_;
        private opacityBase_;
        private flagsBase_;
        private tempVec4;
        private assetMaterialMap_;
        constructor();
        private rebase();
        create(desc: asset.Material): StdMaterialInstance;
        destroy(inst: StdMaterialInstance): void;
        destroyRange(range: StdMaterialRange): void;
        readonly count: number;
        valid(inst: StdMaterialInstance): boolean;
        all(): StdMaterialRange;
        mainColour(inst: StdMaterialInstance): Float3;
        setMainColour(inst: StdMaterialInstance, newColour: Float3): void;
        emissiveColour(inst: StdMaterialInstance): Float3;
        setEmissiveColour(inst: StdMaterialInstance, newColour: Float3): void;
        emissiveIntensity(inst: StdMaterialInstance): number;
        setEmissiveIntensity(inst: StdMaterialInstance, newIntensity: number): void;
        specularIntensity(inst: StdMaterialInstance): number;
        setSpecularIntensity(inst: StdMaterialInstance, newIntensity: number): void;
        specularExponent(inst: StdMaterialInstance): number;
        setSpecularExponent(inst: StdMaterialInstance, newExponent: number): void;
        textureScale(inst: StdMaterialInstance): Float2;
        setTextureScale(inst: StdMaterialInstance, newScale: Float2): void;
        textureOffset(inst: StdMaterialInstance): Float2;
        setTextureOffset(inst: StdMaterialInstance, newOffset: Float2): void;
        diffuseMap(inst: StdMaterialInstance): render.Texture | null;
        setDiffuseMap(inst: StdMaterialInstance, newTex: render.Texture): void;
        specularMap(inst: StdMaterialInstance): render.Texture | null;
        setSpecularMap(inst: StdMaterialInstance, newTex: render.Texture): void;
        normalMap(inst: StdMaterialInstance): render.Texture | null;
        setNormalMap(inst: StdMaterialInstance, newTex: render.Texture): void;
        opacity(inst: StdMaterialInstance): number;
        setOpacity(inst: StdMaterialInstance, newOpacity: number): void;
        flags(inst: StdMaterialInstance): asset.MaterialFlags;
        getData(inst: StdMaterialInstance): StdMaterialData;
    }
}
declare namespace sd.world {
    type StdModelInstance = Instance<StdModelManager>;
    type StdModelRange = InstanceRange<StdModelManager>;
    type StdModelSet = InstanceSet<StdModelManager>;
    type StdModelIterator = InstanceIterator<StdModelManager>;
    type StdModelArrayView = InstanceArrayView<StdModelManager>;
    interface StdModelDescriptor {
        materials: asset.Material[];
        castsShadows?: boolean;
        acceptsShadows?: boolean;
    }
    const enum RenderMode {
        Forward = 0,
        Shadow = 1,
    }
    const enum RenderFeature {
        AlbedoMaps = 0,
        NormalMaps = 1,
        HeightMaps = 2,
        Emissive = 3,
    }
    class StdModelManager implements ComponentManager<StdModelManager> {
        private rc;
        private transformMgr_;
        private meshMgr_;
        private skeletonMgr_;
        private lightMgr_;
        private stdPipeline_;
        private materialMgr_;
        private instanceData_;
        private entityBase_;
        private transformBase_;
        private enabledBase_;
        private shadowFlagBase_;
        private materialOffsetCountBase_;
        private primGroupOffsetBase_;
        private materials_;
        private primGroupData_;
        private primGroupMaterialBase_;
        private primGroupFeatureBase_;
        private shadowCastingLightIndex_;
        private modelViewMatrix_;
        private modelViewProjectionMatrix_;
        private normalMatrix_;
        constructor(rc: render.RenderContext, transformMgr_: TransformManager, meshMgr_: MeshManager, skeletonMgr_: SkeletonManager, lightMgr_: LightManager);
        private rebase();
        private groupRebase();
        private featuresForMeshAndMaterial(mesh, material);
        private updatePrimGroups(modelIx);
        create(entity: Entity, desc: StdModelDescriptor): StdModelInstance;
        destroy(_inst: StdModelInstance): void;
        destroyRange(range: StdModelRange): void;
        readonly count: number;
        valid(inst: StdModelInstance): boolean;
        all(): StdModelRange;
        entity(inst: StdModelInstance): Entity;
        transform(inst: StdModelInstance): TransformInstance;
        enabled(inst: StdModelInstance): boolean;
        setEnabled(inst: StdModelInstance, newEnabled: boolean): void;
        shadowCaster(): LightInstance;
        setShadowCaster(inst: LightInstance): void;
        disableRenderFeature(f: RenderFeature): void;
        enableRenderFeature(f: RenderFeature): void;
        private drawSingleForward(rp, proj, shadow, fogSpec, modelIx);
        private drawSingleShadow(rp, proj, shadowPipeline, modelIx);
        private splitModelRange(range, triggerFeature, cullDisabled?);
        splitModelRangeByTranslucency(range: StdModelRange): {
            opaque: InstanceSet<StdModelManager>;
            translucent: InstanceSet<StdModelManager>;
        };
        draw(range: StdModelRange, rp: render.RenderPass, proj: ProjectionSetup, shadow: ShadowView | null, fogSpec: asset.FogDescriptor | null, mode: RenderMode): number;
    }
}
declare namespace sd.world {
    type TransformInstance = Instance<TransformManager>;
    type TransformRange = InstanceRange<TransformManager>;
    type TransformSet = InstanceSet<TransformManager>;
    type TransformIterator = InstanceIterator<TransformManager>;
    type TransformArrayView = InstanceArrayView<TransformManager>;
    class TransformManager implements ComponentManager<TransformManager> {
        private instanceData_;
        private entityBase_;
        private parentBase_;
        private firstChildBase_;
        private prevSiblingBase_;
        private nextSiblingBase_;
        private positionBase_;
        private rotationBase_;
        private scaleBase_;
        private localMatrixBase_;
        private worldMatrixBase_;
        private readonly defaultPos_;
        private readonly defaultRot_;
        private readonly defaultScale_;
        constructor();
        rebase(): void;
        create(linkedEntity: Entity, parent?: TransformInstance): TransformInstance;
        create(linkedEntity: Entity, desc?: asset.Transform, parent?: TransformInstance): TransformInstance;
        destroy(_inst: TransformInstance): void;
        destroyRange(range: TransformRange): void;
        readonly count: number;
        valid(inst: TransformInstance): boolean;
        all(): TransformRange;
        forEntity(ent: Entity): TransformInstance;
        entity(inst: TransformInstance): Entity;
        parent(inst: TransformInstance): TransformInstance;
        firstChild(inst: TransformInstance): TransformInstance;
        prevSibling(inst: TransformInstance): TransformInstance;
        nextSibling(inst: TransformInstance): TransformInstance;
        localPosition(inst: TransformInstance): number[];
        localRotation(inst: TransformInstance): number[];
        localScale(inst: TransformInstance): number[];
        worldPosition(inst: TransformInstance): number[];
        localMatrix(inst: TransformInstance): TypedArray;
        worldMatrix(inst: TransformInstance): TypedArray;
        copyLocalMatrix(inst: TransformInstance): number[];
        copyWorldMatrix(inst: TransformInstance): number[];
        private applyParentTransform(parentMatrix, inst);
        setLocalMatrix(inst: TransformInstance, newLocalMatrix: Float4x4): void;
        setLocalMatrix(inst: TransformInstance, newRotation: Float4, newPosition: Float3, newScale: Float3): void;
        private removeFromParent(inst);
        setParent(inst: TransformInstance, newParent: TransformInstance): void;
        setPosition(inst: TransformInstance, newPosition: Float3): void;
        setRotation(inst: TransformInstance, newRotation: Float4): void;
        setPositionAndRotation(inst: TransformInstance, newPosition: Float3, newRotation: Float4): void;
        setScale(inst: TransformInstance, newScale: Float3): void;
        setPositionAndRotationAndScale(inst: TransformInstance, newPosition: Float3, newRotation: Float4, newScale: Float3): void;
        translate(inst: TransformInstance, localDelta3: Float3): void;
        rotate(inst: TransformInstance, localRot: Float4): void;
        rotateRelWorld(inst: TransformInstance, worldRot: Float4): void;
        rotateByAngles(inst: TransformInstance, localAng: Float3): void;
    }
}
