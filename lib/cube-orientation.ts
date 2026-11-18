// Quaternion state is authoritative. Euler XYZ is only the boundary format for
// the pinned Rust API and its matching projected-face geometry (Rx * Ry * Rz).
export type Quaternion = [number, number, number, number] // x, y, z, w
export const normalize = (q: Quaternion): Quaternion => {
  const length = Math.hypot(...q)
  return q.map(v => v / length) as Quaternion
}
export const multiply = (a: Quaternion, b: Quaternion): Quaternion => {
  const [x, y, z, w] = a,
    [X, Y, Z, W] = b
  return normalize([
    w * X + x * W + y * Z - z * Y,
    w * Y - x * Z + y * W + z * X,
    w * Z + x * Y - y * X + z * W,
    w * W - x * X - y * Y - z * Z
  ])
}
export function fromEuler([a, b, c]: number[]): Quaternion {
  const x = Math.sin(a / 2),
    y = Math.sin(b / 2),
    z = Math.sin(c / 2),
    w = Math.cos(a / 2),
    v = Math.cos(b / 2),
    u = Math.cos(c / 2)
  return normalize([
    x * v * u + w * y * z,
    w * y * u - x * v * z,
    w * v * z + x * y * u,
    w * v * u - x * y * z
  ])
}
export function toEuler([x, y, z, w]: Quaternion): number[] {
  const m13 = 2 * (x * z + w * y),
    m23 = 2 * (y * z - w * x),
    m33 = 1 - 2 * (x * x + y * y),
    m12 = 2 * (x * y - w * z),
    m11 = 1 - 2 * (y * y + z * z)
  // At the coordinate singularity choose an equivalent XYZ representation.
  // No gesture ever integrates these angles, so no rotational axis is lost.
  return Math.abs(m13) < 0.999999999
    ? [
        Math.atan2(-m23, m33),
        Math.asin(Math.max(-1, Math.min(1, m13))),
        Math.atan2(-m12, m11)
      ]
    : [
        Math.atan2(2 * (y * z + w * x), 1 - 2 * (x * x + z * z)),
        (Math.sign(m13) * Math.PI) / 2,
        0
      ]
}
export function slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
  let dot = a.reduce((sum, v, i) => sum + v * b[i], 0)
  if (dot < 0) {
    b = b.map(v => -v) as Quaternion
    dot = -dot
  }
  if (dot > 0.9995)
    return normalize(a.map((v, i) => v + (b[i] - v) * t) as Quaternion)
  const theta = Math.acos(Math.min(1, dot)),
    den = Math.sin(theta)
  return normalize(
    a.map(
      (v, i) =>
        (v * Math.sin((1 - t) * theta) + b[i] * Math.sin(t * theta)) / den
    ) as Quaternion
  )
}
export function fromVector(v: number[]): Quaternion {
  const angle = Math.hypot(...v)
  if (angle < 1e-10) return [0, 0, 0, 1]
  const scale = Math.sin(angle / 2) / angle
  return [v[0] * scale, v[1] * scale, v[2] * scale, Math.cos(angle / 2)]
}
export function rotationVector(q: Quaternion): number[] {
  if (q[3] < 0) q = q.map(v => -v) as Quaternion
  const sine = Math.hypot(q[0], q[1], q[2])
  const scale = sine < 1e-10 ? 2 : (2 * Math.atan2(sine, q[3])) / sine
  return q.slice(0, 3).map(v => v * scale)
}
export function trackball(
  x: number,
  y: number,
  cx: number,
  cy: number,
  radius: number
): number[] {
  const u = (x - cx) / radius,
    v = (cy - y) / radius,
    d = Math.hypot(u, v)
  const z = d < Math.SQRT1_2 ? Math.sqrt(1 - d * d) : 0.5 / d
  const length = Math.hypot(u, v, z)
  return [u / length, v / length, z / length]
}
export function between(a: number[], b: number[]): Quaternion {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0)
  if (dot < -0.999999) {
    const axis = Math.abs(a[0]) < 0.8 ? [0, -a[2], a[1]] : [-a[1], a[0], 0]
    return normalize([...axis, 0] as Quaternion)
  }
  return normalize([
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
    1 + dot
  ])
}
// Analytic exponential decay gives the same travel at 30, 60 or 120 Hz.
export function coast(q: Quaternion, velocity: number[], dt: number) {
  const decay = Math.exp(-5 * dt),
    travel = (1 - decay) / 5
  return {
    rotation: multiply(fromVector(velocity.map(v => v * travel)), q),
    velocity: velocity.map(v => v * decay)
  }
}
