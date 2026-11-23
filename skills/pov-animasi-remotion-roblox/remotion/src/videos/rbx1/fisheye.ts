// Lensa fisheye (barrel): tengah layar membesar, tepi tertekan; sudut layar tetap di sudut (tanpa pinggir hitam).
import * as THREE from "three";
import { Effect } from "postprocessing";

const FRAG = /* glsl */ `
uniform float k;
uniform float aspect;
void mainUv(inout vec2 uv) {
  vec2 p = uv * 2.0 - 1.0;
  p.x *= aspect;
  float rc2 = aspect * aspect + 1.0;
  float s = (1.0 - k) + k * dot(p, p) / rc2;
  p *= s;
  p.x /= aspect;
  uv = p * 0.5 + 0.5;
}
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = inputColor;
}`;

export class FisheyeEffect extends Effect {
  constructor(k = 0.34, aspect = 1080 / 1920) {
    super("Fisheye", FRAG, { uniforms: new Map<string, THREE.Uniform>([["k", new THREE.Uniform(k)], ["aspect", new THREE.Uniform(aspect)]]) });
  }
}
