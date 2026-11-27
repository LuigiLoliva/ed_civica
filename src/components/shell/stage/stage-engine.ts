import { buildFormation, buildLinks } from "@/components/shell/stage/formations";
import type { StageFormation } from "@/lib/shell/route-meta";

export type StageScene = {
  formation: StageFormation;
  /** Colori 0–1 (primario, secondario). */
  colorA: readonly [number, number, number];
  colorB: readonly [number, number, number];
  /** Centro in NDC. */
  offset: readonly [number, number];
  scale: number;
  /** Opacità complessiva 0–1. */
  intensity: number;
};

/** Layer extra disegnati sullo stesso contesto, dopo l'atmosfera. */
export type StageLayer = {
  render: (frame: StageFrame) => void;
  dispose?: (gl: WebGL2RenderingContext) => void;
};

export type StageFrame = {
  gl: WebGL2RenderingContext;
  time: number;
  delta: number;
  width: number;
  height: number;
  pixelRatio: number;
};

type EngineOptions = {
  count: number;
  hubs: number;
  /** Disegna solo su richiesta, senza morph né drift. */
  staticMode: boolean;
};

const VERT = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec3 aFrom;
layout(location = 1) in vec3 aTo;
layout(location = 2) in vec4 aSeed;

uniform float uTime;
uniform float uMorph;
uniform float uAspect;
uniform float uPx;
uniform float uScale;
uniform float uAlpha;
uniform float uMode;
uniform float uLineAlpha;
uniform float uPointerForce;
uniform vec2 uOffset;
uniform vec2 uPointer;
uniform vec2 uRot;
uniform vec3 uColA;
uniform vec3 uColB;

out float vAlpha;
out vec3 vColor;

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  float stagger = 0.5;
  float t = clamp(uMorph * (1.0 + stagger) - aSeed.z * stagger, 0.0, 1.0);
  float e = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  float arc = sin(e * 3.14159265);

  vec3 p = mix(aFrom, aTo, e);
  p.xz = rot(arc * (0.5 + aSeed.x) * 1.3) * p.xz;
  p += normalize(p + vec3(0.0001, 0.0002, 0.0003)) * arc * (0.2 + 0.6 * aSeed.x);

  float ph = aSeed.x * 6.2831853;
  p += 0.034 * vec3(
    sin(uTime * 0.52 + ph),
    cos(uTime * 0.41 + ph * 1.7),
    sin(uTime * 0.33 + ph * 2.3)
  );

  p *= uScale;
  p.xz = rot(uRot.x) * p.xz;
  p.yz = rot(uRot.y) * p.yz;

  float z = 3.5 - p.z;
  float fit = min(uAspect, 1.0);
  vec2 ndc = vec2(p.x / uAspect, p.y) * fit * 1.75 / z + uOffset;

  vec2 d = (ndc - uPointer) * vec2(uAspect, 1.0);
  float push = exp(-dot(d, d) * 7.0) * uPointerForce;
  ndc += normalize(d + vec2(0.00001)) / vec2(uAspect, 1.0) * push * 0.085;

  gl_Position = vec4(ndc, 0.0, 1.0);

  float depth = smoothstep(4.9, 2.3, z);
  float size = aSeed.y;
  gl_PointSize = max(1.0, size * uPx * (9.5 / z) * fit * (1.0 + arc * 0.7 + push * 1.4));

  float alpha = mix(0.22, 1.0, depth) * uAlpha;
  alpha *= clamp(1.25 / size, 0.1, 1.0);
  alpha *= 1.0 + push * 1.6;
  if (uMode > 0.5) {
    alpha = mix(0.1, 0.42, depth) * uAlpha * uLineAlpha;
  }
  vAlpha = alpha;
  vColor = mix(uColA, uColB, aSeed.w);
}
`;

const FRAG = /* glsl */ `#version 300 es
precision mediump float;
in float vAlpha;
in vec3 vColor;
uniform float uMode;
out vec4 outColor;

void main() {
  float a = vAlpha;
  if (uMode < 0.5) {
    float d = length(gl_PointCoord - 0.5);
    a *= smoothstep(0.5, 0.1, d);
  }
  outColor = vec4(vColor * a, a);
}
`;

const MORPH_SECONDS = 1.55;
const LINE_SWAP_AT = 0.32;

function smooth(current: number, target: number, rate: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}

/**
 * Atmosfera persistente: un solo draw call di punti + uno di linee.
 * Le formazioni si trasformano l'una nell'altra nel vertex shader,
 * quindi cambiare route non ricrea né il contesto né i buffer.
 */
export class StageEngine {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private fromBuffer: WebGLBuffer;
  private toBuffer: WebGLBuffer;
  private seedBuffer: WebGLBuffer;
  private indexBuffer: WebGLBuffer;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};

  private count: number;
  private hubs: number;
  private staticMode: boolean;

  private from: Float32Array;
  private to: Float32Array;
  private seeds: Float32Array;
  private linkCount = 0;
  private pendingLinks: Uint16Array | null = null;
  private formationCache = new Map<StageFormation, Float32Array>();
  private linkCache = new Map<StageFormation, Uint16Array>();

  private scene: StageScene | null = null;
  private morph = 1;
  private time = 0;
  private last = 0;
  private raf = 0;
  private running = false;
  private disposed = false;

  private width = 1;
  private height = 1;
  private pixelRatio = 1;

  private pointer = { x: 0, y: 0, tx: 0, ty: 0, force: 0, targetForce: 0 };
  private scroll = { value: 0, target: 0 };
  private dim = { value: 1, target: 1 };
  private live = {
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    alpha: 0,
    colA: [0, 0.62, 0.86],
    colB: [0.1, 0.28, 0.42],
  };

  private layers = new Set<StageLayer>();

  constructor(
    private canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    options: EngineOptions,
  ) {
    this.gl = gl;
    this.count = options.count;
    this.hubs = options.hubs;
    this.staticMode = options.staticMode;

    this.program = this.createProgram();
    for (const name of [
      "uTime",
      "uMorph",
      "uAspect",
      "uPx",
      "uScale",
      "uAlpha",
      "uMode",
      "uLineAlpha",
      "uPointerForce",
      "uOffset",
      "uPointer",
      "uRot",
      "uColA",
      "uColB",
    ]) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name);
    }

    const n = this.count;
    this.from = buildFormation("scatter", n);
    this.to = this.from.slice();
    this.seeds = new Float32Array(n * 4);
    let s = 0x9e3779b9;
    const rand = () => {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return ((s >>> 0) % 100000) / 100000;
    };
    for (let i = 0; i < n; i++) {
      const bokeh = rand() < 0.045;
      this.seeds[i * 4] = rand();
      this.seeds[i * 4 + 1] = bokeh ? 3.2 + rand() * 3.4 : 0.55 + rand() * 0.95;
      this.seeds[i * 4 + 2] = rand();
      this.seeds[i * 4 + 3] = rand();
    }

    const vao = gl.createVertexArray();
    const fromBuffer = gl.createBuffer();
    const toBuffer = gl.createBuffer();
    const seedBuffer = gl.createBuffer();
    const indexBuffer = gl.createBuffer();
    if (!vao || !fromBuffer || !toBuffer || !seedBuffer || !indexBuffer) {
      throw new Error("stage: buffer allocation failed");
    }
    this.vao = vao;
    this.fromBuffer = fromBuffer;
    this.toBuffer = toBuffer;
    this.seedBuffer = seedBuffer;
    this.indexBuffer = indexBuffer;

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, fromBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.from, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, toBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.to, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.seeds, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(0), gl.DYNAMIC_DRAW);
    gl.bindVertexArray(null);
  }

  private createProgram(): WebGLProgram {
    const gl = this.gl;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("stage: shader allocation failed");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`stage: shader compile failed: ${log}`);
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram();
    if (!program) throw new Error("stage: program allocation failed");
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`stage: program link failed: ${log}`);
    }
    return program;
  }

  private formation(kind: StageFormation): Float32Array {
    let cached = this.formationCache.get(kind);
    if (!cached) {
      cached = buildFormation(kind, this.count);
      this.formationCache.set(kind, cached);
    }
    return cached;
  }

  private links(kind: StageFormation): Uint16Array {
    let cached = this.linkCache.get(kind);
    if (!cached) {
      cached = buildLinks(this.formation(kind), this.count, this.hubs);
      this.linkCache.set(kind, cached);
    }
    return cached;
  }

  /** Posizioni correnti (stessa curva del vertex shader, senza drift). */
  private snapshot(): Float32Array {
    if (this.morph >= 1) return this.to.slice();
    const out = new Float32Array(this.count * 3);
    const stagger = 0.5;
    for (let i = 0; i < this.count; i++) {
      const delay = this.seeds[i * 4 + 2];
      const t = Math.min(
        1,
        Math.max(0, this.morph * (1 + stagger) - delay * stagger),
      );
      const e = t * t * t * (t * (t * 6 - 15) + 10);
      for (let k = 0; k < 3; k++) {
        const a = this.from[i * 3 + k];
        const b = this.to[i * 3 + k];
        out[i * 3 + k] = a + (b - a) * e;
      }
    }
    return out;
  }

  private uploadLinks(links: Uint16Array) {
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, links, gl.DYNAMIC_DRAW);
    gl.bindVertexArray(null);
    this.linkCount = links.length;
  }

  setScene(scene: StageScene) {
    const previous = this.scene;
    this.scene = scene;
    if (previous && previous.formation === scene.formation) {
      this.requestFrame();
      return;
    }

    const gl = this.gl;
    const target = this.formation(scene.formation);

    if (this.staticMode) {
      this.from = target.slice();
      this.to = target;
      this.morph = 1;
      this.pendingLinks = null;
      this.uploadLinks(this.links(scene.formation));
    } else {
      this.from = this.snapshot();
      this.to = target;
      this.morph = 0;
      this.pendingLinks = this.links(scene.formation);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.fromBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.from);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.toBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.to);
    this.requestFrame();
  }

  setPointer(x: number, y: number, active: boolean) {
    this.pointer.tx = x;
    this.pointer.ty = y;
    this.pointer.targetForce = active ? 1 : 0;
  }

  /** Scroll in altezze di viewport. */
  setScroll(viewports: number) {
    this.scroll.target = viewports;
    this.requestFrame();
  }

  /** 1 = pieno, <1 quando un altro stage WebGL è in vista. */
  setDim(value: number) {
    this.dim.target = value;
    this.requestFrame();
  }

  addLayer(layer: StageLayer) {
    this.layers.add(layer);
    return () => {
      this.layers.delete(layer);
      layer.dispose?.(this.gl);
    };
  }

  resize(width: number, height: number, pixelRatio: number) {
    this.width = Math.max(1, Math.round(width * pixelRatio));
    this.height = Math.max(1, Math.round(height * pixelRatio));
    this.pixelRatio = pixelRatio;
    if (this.canvas.width !== this.width || this.canvas.height !== this.height) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
    }
    this.requestFrame();
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.last = 0;
    if (!this.staticMode) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      this.requestFrame();
    }
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private requestFrame() {
    if (!this.staticMode || this.disposed || this.raf) return;
    this.raf = requestAnimationFrame((now) => {
      this.raf = 0;
      this.settle();
      this.draw(now, 0);
    });
  }

  /** In modalità statica i valori saltano direttamente al target. */
  private settle() {
    const scene = this.scene;
    if (!scene) return;
    this.live.offsetX = scene.offset[0];
    this.live.offsetY = scene.offset[1];
    this.live.scale = scene.scale;
    this.live.alpha = scene.intensity * this.dim.target;
    this.live.colA = [...scene.colorA];
    this.live.colB = [...scene.colorB];
    this.scroll.value = this.scroll.target;
    this.dim.value = this.dim.target;
  }

  private tick = (now: number) => {
    if (!this.running) return;
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0.016;
    this.last = now;
    this.time += dt;

    const scene = this.scene;
    if (scene) {
      if (this.morph < 1) {
        this.morph = Math.min(1, this.morph + dt / MORPH_SECONDS);
        if (this.pendingLinks && this.morph >= LINE_SWAP_AT) {
          this.uploadLinks(this.pendingLinks);
          this.pendingLinks = null;
        }
      }
      const live = this.live;
      this.dim.value = smooth(this.dim.value, this.dim.target, 3, dt);
      live.offsetX = smooth(live.offsetX, scene.offset[0], 2.6, dt);
      live.offsetY = smooth(live.offsetY, scene.offset[1], 2.6, dt);
      live.scale = smooth(live.scale, scene.scale, 2.6, dt);
      live.alpha = smooth(live.alpha, scene.intensity * this.dim.value, 2.2, dt);
      for (let k = 0; k < 3; k++) {
        live.colA[k] = smooth(live.colA[k], scene.colorA[k], 2.4, dt);
        live.colB[k] = smooth(live.colB[k], scene.colorB[k], 2.4, dt);
      }
    }

    const pointer = this.pointer;
    pointer.x = smooth(pointer.x, pointer.tx, 6, dt);
    pointer.y = smooth(pointer.y, pointer.ty, 6, dt);
    pointer.force = smooth(pointer.force, pointer.targetForce, 4, dt);
    this.scroll.value = smooth(this.scroll.value, this.scroll.target, 5, dt);

    this.draw(now, dt);
    this.raf = requestAnimationFrame(this.tick);
  };

  private draw(now: number, dt: number) {
    if (this.disposed) return;
    const gl = this.gl;
    if (gl.isContextLost()) return;
    const u = this.uniforms;
    const live = this.live;
    const aspect = this.width / this.height;

    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    const scroll = this.scroll.value;
    const rotY =
      this.time * 0.045 + this.pointer.x * 0.22 * this.pointer.force + scroll * 0.42;
    const rotX =
      0.16 + this.pointer.y * -0.14 * this.pointer.force + Math.sin(scroll * 0.9) * 0.1;
    const narrow = aspect < 0.9;

    gl.uniform1f(u.uTime, this.time);
    gl.uniform1f(u.uMorph, this.morph);
    gl.uniform1f(u.uAspect, aspect);
    gl.uniform1f(u.uPx, this.pixelRatio);
    gl.uniform1f(u.uScale, live.scale * (narrow ? 0.92 : 1));
    gl.uniform1f(u.uAlpha, live.alpha);
    gl.uniform1f(u.uPointerForce, this.pointer.force);
    gl.uniform2f(
      u.uOffset,
      narrow ? 0 : live.offsetX,
      live.offsetY + Math.sin(scroll * 0.6) * 0.05,
    );
    gl.uniform2f(u.uPointer, this.pointer.x, this.pointer.y);
    gl.uniform2f(u.uRot, rotY, rotX);
    gl.uniform3f(u.uColA, live.colA[0], live.colA[1], live.colA[2]);
    gl.uniform3f(u.uColB, live.colB[0], live.colB[1], live.colB[2]);

    if (this.linkCount > 0) {
      const lineAlpha = this.pendingLinks
        ? 1 - this.morph / LINE_SWAP_AT
        : Math.min(1, Math.max(0, (this.morph - 0.62) / 0.38));
      gl.uniform1f(u.uMode, 1);
      gl.uniform1f(u.uLineAlpha, Math.max(0, lineAlpha));
      gl.drawElements(gl.LINES, this.linkCount, gl.UNSIGNED_SHORT, 0);
    }

    gl.uniform1f(u.uMode, 0);
    const drawCount =
      this.dim.value < 0.75 ? Math.floor(this.count / 2) : this.count;
    gl.drawArrays(gl.POINTS, 0, drawCount);
    gl.bindVertexArray(null);

    if (this.layers.size > 0) {
      const frame: StageFrame = {
        gl,
        time: now / 1000,
        delta: dt,
        width: this.width,
        height: this.height,
        pixelRatio: this.pixelRatio,
      };
      for (const layer of this.layers) layer.render(frame);
    }
  }

  dispose() {
    if (this.disposed) return;
    this.stop();
    this.disposed = true;
    const gl = this.gl;
    for (const layer of this.layers) layer.dispose?.(gl);
    this.layers.clear();
    gl.deleteBuffer(this.fromBuffer);
    gl.deleteBuffer(this.toBuffer);
    gl.deleteBuffer(this.seedBuffer);
    gl.deleteBuffer(this.indexBuffer);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
    this.formationCache.clear();
    this.linkCache.clear();
  }
}
