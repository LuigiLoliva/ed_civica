/**
 * Motore WebGL2 del palco contenuti: una nuvola di particelle e segmenti
 * che fa morphing tra sculture 3D (una per pagina) senza ricreare il contesto.
 * Nessuna dipendenza: due programmi (punti + linee), buffer a dimensione fissa.
 */

export type StageShape = {
  /** N × (x, y, z, diametro in unità mondo) */
  points: Float32Array;
  /** N × rgba */
  colors: Uint8Array;
  /** M × 2 vertici × (x, y, z) */
  lines: Float32Array;
  /** M × 2 vertici × rgba */
  lineColors: Uint8Array;
};

export type StageView = {
  /** Ancora della scultura nel riquadro hero (0..1, origine in alto a sinistra). */
  anchorX: number;
  anchorY: number;
  scale: number;
  pitch: number;
  yaw: number;
  /** Rotazione continua (rad/s). */
  spin: number;
  /** Ampiezza oscillazione yaw (rad) per forme che si leggono di fronte. */
  sway: number;
  opacity: number;
};

export type MorphOptions = {
  duration?: number;
  swirl?: number;
};

export type StageEngine = {
  readonly pointCount: number;
  readonly lineCount: number;
  setShape: (shape: StageShape, view: StageView, options?: MorphOptions) => void;
  setView: (view: StageView) => void;
  setScroll: (progress: number) => void;
  setPointer: (x: number, y: number, inside: boolean) => void;
  setVisible: (visible: boolean) => void;
  resize: () => void;
  dispose: () => void;
};

type EngineOptions = {
  pointCount: number;
  lineCount: number;
  reducedMotion: boolean;
  maxDpr: number;
};

const FOV = (32 * Math.PI) / 180;
const CAMERA_Z = 4.2;
const TAN_HALF_FOV = Math.tan(FOV / 2);
const STAGGER = 0.35;
const PIXEL_BUDGET = 2_600_000;

const VERTEX_SOURCE = `#version 300 es
precision highp float;

layout(location = 0) in vec4 aFrom;
layout(location = 1) in vec4 aTo;
layout(location = 2) in vec4 aColorFrom;
layout(location = 3) in vec4 aColorTo;
layout(location = 4) in vec4 aSeed;

uniform mat4 uModel;
uniform mat4 uProjection;
uniform vec2 uOffset;
uniform vec2 uPointer;
uniform float uAspect;
uniform float uRepel;
uniform float uMorph;
uniform float uSwirl;
uniform float uTime;
uniform float uDissolve;
uniform float uPixelScale;
uniform float uOpacity;
uniform float uIsLine;

out vec4 vColor;

vec3 swirlDirection(vec4 seed) {
  return vec3(
    sin(seed.y * 6.2831853),
    cos(seed.z * 6.2831853) * 0.8,
    sin(seed.w * 6.2831853)
  );
}

void main() {
  float t = clamp((uMorph - aSeed.x * ${STAGGER.toFixed(2)}) / ${(1 - STAGGER).toFixed(2)}, 0.0, 1.0);
  t = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);

  vec3 dir = swirlDirection(aSeed);
  vec3 p = mix(aFrom.xyz, aTo.xyz, t);
  p += dir * sin(t * 3.14159265) * uSwirl;

  float breathe = uIsLine > 0.5 ? 0.0 : 0.009;
  p += breathe * vec3(
    sin(uTime * 0.7 + aSeed.y * 50.0),
    cos(uTime * 0.6 + aSeed.z * 50.0),
    sin(uTime * 0.8 + aSeed.w * 50.0)
  );

  p += uDissolve * (
    p * (0.35 + aSeed.x * 1.1)
    + vec3(0.0, 0.5 + aSeed.y * 0.9, 0.0)
    + dir * 0.45
  );

  vec4 view = uModel * vec4(p, 1.0);
  view.z -= ${CAMERA_Z.toFixed(1)};
  vec4 clip = uProjection * view;
  clip.xy += uOffset * clip.w;

  vec2 ndc = clip.xy / clip.w;
  vec2 delta = ndc - uPointer;
  delta.x *= uAspect;
  float push = exp(-dot(delta, delta) * 16.0) * uRepel;
  vec2 away = delta / (length(delta) + 0.0001);
  away.x /= uAspect;
  clip.xy += away * push * clip.w;

  gl_Position = clip;

  float depth = -view.z;
  float size = mix(aFrom.w, aTo.w, t);
  gl_PointSize = max(1.5, size * uPixelScale / depth);

  vec4 color = mix(aColorFrom, aColorTo, t);
  float fog = smoothstep(${(CAMERA_Z + 1.7).toFixed(1)}, ${(CAMERA_Z - 1.1).toFixed(1)}, depth);
  float alpha = color.a * uOpacity * mix(0.22, 1.0, fog);
  alpha *= 1.0 - uDissolve * (0.55 + 0.45 * aSeed.z);
  alpha *= 0.82 + 0.18 * sin(uTime * 1.6 + aSeed.x * 90.0);
  vColor = vec4(color.rgb * alpha, alpha);
}
`;

const FRAGMENT_SOURCE = `#version 300 es
precision mediump float;

uniform float uIsLine;
in vec4 vColor;
out vec4 outColor;

void main() {
  float falloff = 1.0;
  if (uIsLine < 0.5) {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    falloff = smoothstep(1.0, 0.0, d);
    falloff *= falloff;
  }
  outColor = vec4(vColor.rgb * falloff, vColor.a * falloff * 0.3);
}
`;

const UNIFORMS = [
  "uModel",
  "uProjection",
  "uOffset",
  "uPointer",
  "uAspect",
  "uRepel",
  "uMorph",
  "uSwirl",
  "uTime",
  "uDissolve",
  "uPixelScale",
  "uOpacity",
  "uIsLine",
] as const;

type UniformMap = Record<(typeof UNIFORMS)[number], WebGLUniformLocation | null>;

type Layer = {
  count: number;
  /** Componenti per posizione nel buffer (4 punti, 3 linee → sempre 4 in GPU). */
  from: Float32Array;
  to: Float32Array;
  colorFrom: Uint8Array;
  colorTo: Uint8Array;
  seed: Float32Array;
  vao: WebGLVertexArrayObject | null;
  buffers: WebGLBuffer[];
};

const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function createLayer(count: number, random: () => number, sharedPairs: boolean): Layer {
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const source = sharedPairs && i % 2 === 1 ? (i - 1) * 4 : -1;
    for (let k = 0; k < 4; k++) {
      seed[i * 4 + k] = source >= 0 ? seed[source + k] : random();
    }
  }
  return {
    count,
    from: new Float32Array(count * 4),
    to: new Float32Array(count * 4),
    colorFrom: new Uint8Array(count * 4),
    colorTo: new Uint8Array(count * 4),
    seed,
    vao: null,
    buffers: [],
  };
}

/** Congela lo stato interpolato corrente in `from` (stessa formula dello shader). */
function freezeLayer(layer: Layer, morph: number, swirl: number) {
  if (morph >= 1) {
    layer.from.set(layer.to);
    layer.colorFrom.set(layer.colorTo);
    return;
  }
  const { from, to, colorFrom, colorTo, seed } = layer;
  for (let i = 0; i < layer.count; i++) {
    const o = i * 4;
    const t = smoother(clamp01((morph - seed[o] * STAGGER) / (1 - STAGGER)));
    const arc = Math.sin(t * Math.PI) * swirl;
    from[o] += (to[o] - from[o]) * t + Math.sin(seed[o + 1] * 6.2831853) * arc;
    from[o + 1] +=
      (to[o + 1] - from[o + 1]) * t + Math.cos(seed[o + 2] * 6.2831853) * 0.8 * arc;
    from[o + 2] +=
      (to[o + 2] - from[o + 2]) * t + Math.sin(seed[o + 3] * 6.2831853) * arc;
    from[o + 3] += (to[o + 3] - from[o + 3]) * t;
    for (let k = 0; k < 4; k++) {
      colorFrom[o + k] = Math.round(
        colorFrom[o + k] + (colorTo[o + k] - colorFrom[o + k]) * t,
      );
    }
  }
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createStageEngine(
  canvas: HTMLCanvasElement,
  options: EngineOptions,
): StageEngine | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const random = mulberry32(20261127);
  const points = createLayer(options.pointCount, random, false);
  const lines = createLayer(options.lineCount * 2, random, true);

  let program: WebGLProgram | null = null;
  let uniforms: UniformMap | null = null;
  let contextLost = false;
  let disposed = false;

  let width = 0;
  let height = 0;
  let dpr = 1;

  let hasShape = false;
  let morph = 1;
  let morphDuration = 2.4;
  let swirl = 0.4;
  let time = 0;
  let last = 0;
  let raf = 0;
  let visible = true;

  let view: StageView | null = null;
  const current = {
    anchorX: 0.5,
    anchorY: 0.5,
    scale: 1,
    pitch: 0,
    yaw: 0,
    sway: 0,
    opacity: 0,
  };
  let spinAngle = 0;

  let scrollTarget = 0;
  let scroll = 0;
  const pointerTarget = { x: 0, y: 0, inside: false };
  const pointer = { x: 0, y: 0, strength: 0 };

  const model = new Float32Array(16);
  const projection = new Float32Array(16);

  function uploadLayer(layer: Layer) {
    if (!layer.buffers.length) return;
    const data = [layer.from, layer.to, layer.colorFrom, layer.colorTo];
    data.forEach((array, index) => {
      gl!.bindBuffer(gl!.ARRAY_BUFFER, layer.buffers[index]);
      gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, array);
    });
  }

  function initLayer(layer: Layer) {
    layer.vao = gl!.createVertexArray();
    gl!.bindVertexArray(layer.vao);
    const arrays: Array<[Float32Array | Uint8Array, number, boolean, number]> = [
      [layer.from, gl!.FLOAT, false, gl!.DYNAMIC_DRAW],
      [layer.to, gl!.FLOAT, false, gl!.DYNAMIC_DRAW],
      [layer.colorFrom, gl!.UNSIGNED_BYTE, true, gl!.DYNAMIC_DRAW],
      [layer.colorTo, gl!.UNSIGNED_BYTE, true, gl!.DYNAMIC_DRAW],
      [layer.seed, gl!.FLOAT, false, gl!.STATIC_DRAW],
    ];
    layer.buffers = arrays.map(([array, type, normalized, usage], location) => {
      const buffer = gl!.createBuffer()!;
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buffer);
      gl!.bufferData(gl!.ARRAY_BUFFER, array, usage);
      gl!.enableVertexAttribArray(location);
      gl!.vertexAttribPointer(location, 4, type, normalized, 0, 0);
      return buffer;
    });
    gl!.bindVertexArray(null);
  }

  function initGl() {
    const vertex = compile(gl!, gl!.VERTEX_SHADER, VERTEX_SOURCE);
    const fragment = compile(gl!, gl!.FRAGMENT_SHADER, FRAGMENT_SOURCE);
    if (!vertex || !fragment) return false;
    const next = gl!.createProgram();
    if (!next) return false;
    gl!.attachShader(next, vertex);
    gl!.attachShader(next, fragment);
    gl!.linkProgram(next);
    gl!.deleteShader(vertex);
    gl!.deleteShader(fragment);
    if (!gl!.getProgramParameter(next, gl!.LINK_STATUS)) {
      gl!.deleteProgram(next);
      return false;
    }
    program = next;
    uniforms = Object.fromEntries(
      UNIFORMS.map((name) => [name, gl!.getUniformLocation(next, name)]),
    ) as UniformMap;
    initLayer(points);
    initLayer(lines);
    gl!.disable(gl!.DEPTH_TEST);
    gl!.enable(gl!.BLEND);
    gl!.blendFunc(gl!.ONE, gl!.ONE);
    gl!.clearColor(0, 0, 0, 0);
    return true;
  }

  if (!initGl()) return null;

  function resize() {
    const nextWidth = Math.max(1, Math.round(canvas.clientWidth));
    const nextHeight = Math.max(1, Math.round(canvas.clientHeight));
    const nextDpr = Math.min(
      window.devicePixelRatio || 1,
      options.maxDpr,
      Math.max(1, Math.sqrt(PIXEL_BUDGET / (nextWidth * nextHeight))),
    );
    if (nextWidth === width && nextHeight === height && nextDpr === dpr) return;
    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    if (!running()) draw();
  }

  function updateMatrices() {
    const aspect = width / height;
    const f = 1 / TAN_HALF_FOV;
    const near = 0.1;
    const far = 20;
    projection.fill(0);
    projection[0] = f / aspect;
    projection[5] = f;
    projection[10] = (far + near) / (near - far);
    projection[11] = -1;
    projection[14] = (2 * far * near) / (near - far);

    const yaw =
      current.yaw +
      spinAngle +
      Math.sin(time * 0.35) * current.sway +
      pointer.x * 0.32 +
      scroll * 0.9;
    const pitch = current.pitch - pointer.y * 0.2;
    const scale = current.scale * (1 + scroll * 0.18);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cx = Math.cos(pitch);
    const sx = Math.sin(pitch);
    // model = RotX(pitch) · RotY(yaw) · Scale
    model[0] = cy * scale;
    model[1] = sx * sy * scale;
    model[2] = -cx * sy * scale;
    model[3] = 0;
    model[4] = 0;
    model[5] = cx * scale;
    model[6] = sx * scale;
    model[7] = 0;
    model[8] = sy * scale;
    model[9] = -sx * cy * scale;
    model[10] = cx * cy * scale;
    model[11] = 0;
    model[12] = 0;
    model[13] = 0;
    model[14] = 0;
    model[15] = 1;
  }

  function draw() {
    if (contextLost || disposed || !program || !uniforms || !width) return;
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    if (!hasShape) return;

    updateMatrices();
    const dissolve = clamp01((scroll - 0.18) / 0.82);
    gl!.useProgram(program);
    gl!.uniformMatrix4fv(uniforms.uModel, false, model);
    gl!.uniformMatrix4fv(uniforms.uProjection, false, projection);
    gl!.uniform2f(
      uniforms.uOffset,
      current.anchorX * 2 - 1,
      1 - current.anchorY * 2 - scroll * 0.9,
    );
    gl!.uniform2f(uniforms.uPointer, pointer.x, pointer.y);
    gl!.uniform1f(uniforms.uAspect, width / height);
    gl!.uniform1f(uniforms.uRepel, pointer.strength * 0.045);
    gl!.uniform1f(uniforms.uMorph, morph);
    gl!.uniform1f(uniforms.uSwirl, swirl);
    gl!.uniform1f(uniforms.uTime, time);
    gl!.uniform1f(uniforms.uDissolve, dissolve * dissolve * 0.85);
    gl!.uniform1f(
      uniforms.uPixelScale,
      (current.scale * canvas.height) / (2 * TAN_HALF_FOV),
    );
    gl!.uniform1f(uniforms.uOpacity, current.opacity);

    gl!.uniform1f(uniforms.uIsLine, 1);
    gl!.bindVertexArray(lines.vao);
    gl!.drawArrays(gl!.LINES, 0, lines.count);

    gl!.uniform1f(uniforms.uIsLine, 0);
    gl!.bindVertexArray(points.vao);
    gl!.drawArrays(gl!.POINTS, 0, points.count);
    gl!.bindVertexArray(null);
  }

  function running() {
    return raf !== 0;
  }

  function settle() {
    if (!view) return;
    current.anchorX = view.anchorX;
    current.anchorY = view.anchorY;
    current.scale = view.scale;
    current.pitch = view.pitch;
    current.yaw = view.yaw;
    current.sway = options.reducedMotion ? 0 : view.sway;
    current.opacity = view.opacity;
  }

  function frame(now: number) {
    raf = 0;
    if (disposed || contextLost) return;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    time += dt;

    if (morph < 1) morph = Math.min(1, morph + dt / morphDuration);

    if (view) {
      const k = 1 - Math.exp(-dt * 2.6);
      current.anchorX += (view.anchorX - current.anchorX) * k;
      current.anchorY += (view.anchorY - current.anchorY) * k;
      current.scale += (view.scale - current.scale) * k;
      current.pitch += (view.pitch - current.pitch) * k;
      current.yaw += (view.yaw - current.yaw) * k;
      current.sway += (view.sway - current.sway) * k;
      current.opacity += (view.opacity - current.opacity) * k;
      spinAngle += view.spin * dt;
    }

    const kScroll = 1 - Math.exp(-dt * 9);
    scroll += (scrollTarget - scroll) * kScroll;
    const kPointer = 1 - Math.exp(-dt * 5);
    pointer.x += (pointerTarget.x - pointer.x) * kPointer;
    pointer.y += (pointerTarget.y - pointer.y) * kPointer;
    pointer.strength +=
      ((pointerTarget.inside ? 1 : 0) - pointer.strength) * kPointer;

    draw();
    schedule();
  }

  function schedule() {
    if (raf || disposed || contextLost || options.reducedMotion) return;
    if (!visible || document.hidden) return;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  }

  function setShape(shape: StageShape, nextView: StageView, morphOptions?: MorphOptions) {
    const first = !hasShape;
    freezeLayer(points, morph, swirl);
    freezeLayer(lines, morph, swirl);

    points.to.set(shape.points);
    points.colorTo.set(shape.colors);
    const lineVertices = lines.count;
    for (let i = 0; i < lineVertices; i++) {
      lines.to[i * 4] = shape.lines[i * 3];
      lines.to[i * 4 + 1] = shape.lines[i * 3 + 1];
      lines.to[i * 4 + 2] = shape.lines[i * 3 + 2];
      lines.to[i * 4 + 3] = 1;
    }
    lines.colorTo.set(shape.lineColors);

    if (first) {
      // Intro: le particelle arrivano da una nube dispersa e invisibile.
      for (let i = 0; i < points.count; i++) {
        const o = i * 4;
        const r = 2.2 + points.seed[o] * 2.4;
        const theta = points.seed[o + 1] * Math.PI * 2;
        const phi = Math.acos(points.seed[o + 2] * 2 - 1);
        points.from[o] = Math.sin(phi) * Math.cos(theta) * r;
        points.from[o + 1] = Math.cos(phi) * r * 0.7;
        points.from[o + 2] = Math.sin(phi) * Math.sin(theta) * r;
        points.from[o + 3] = shape.points[o + 3] * 2.2;
        points.colorFrom[o] = shape.colors[o];
        points.colorFrom[o + 1] = shape.colors[o + 1];
        points.colorFrom[o + 2] = shape.colors[o + 2];
        points.colorFrom[o + 3] = 0;
      }
      lines.from.set(lines.to);
      lines.colorFrom.fill(0);
    }

    hasShape = true;
    view = nextView;
    morphDuration = morphOptions?.duration ?? (first ? 2.6 : 1.8);
    swirl = morphOptions?.swirl ?? 0.42;
    morph = 0;

    if (options.reducedMotion) {
      morph = 1;
      settle();
    } else if (first) {
      settle();
      current.opacity = 0;
      current.scale = nextView.scale * 0.86;
    }

    if (!contextLost) {
      uploadLayer(points);
      uploadLayer(lines);
    }
    if (options.reducedMotion) draw();
    else schedule();
  }

  function onContextLost(event: Event) {
    event.preventDefault();
    contextLost = true;
    stop();
  }

  function onContextRestored() {
    contextLost = false;
    points.buffers = [];
    lines.buffers = [];
    if (initGl()) {
      if (options.reducedMotion) draw();
      else schedule();
    }
  }

  function onVisibility() {
    if (document.hidden) stop();
    else schedule();
  }

  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  document.addEventListener("visibilitychange", onVisibility);
  resize();

  return {
    pointCount: options.pointCount,
    lineCount: options.lineCount,
    setShape,
    setView(nextView) {
      view = nextView;
      if (options.reducedMotion) {
        settle();
        draw();
      }
    },
    setScroll(progress) {
      scrollTarget = progress;
      if (options.reducedMotion) {
        scroll = 0;
      }
    },
    setPointer(x, y, inside) {
      pointerTarget.x = x;
      pointerTarget.y = y;
      pointerTarget.inside = inside;
    },
    setVisible(next) {
      if (visible === next) return;
      visible = next;
      if (visible) schedule();
      else stop();
    },
    resize,
    dispose() {
      disposed = true;
      stop();
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      document.removeEventListener("visibilitychange", onVisibility);
      if (!contextLost) {
        for (const layer of [points, lines]) {
          layer.buffers.forEach((buffer) => gl.deleteBuffer(buffer));
          if (layer.vao) gl.deleteVertexArray(layer.vao);
        }
        if (program) gl.deleteProgram(program);
      }
    },
  };
}
