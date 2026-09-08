export const TAU = Math.PI * 2;
export const COAT_COLOURS = Object.freeze({eddy: '#A35627', elsie: '#C56523', phoebe: '#A76742'});
export const wrapAngle = angle => ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI;
export const positiveAngle = angle => ((angle % TAU) + TAU) % TAU;
export function viewPair(angle, angles) {
  const degrees = positiveAngle(angle) * 180 / Math.PI;
  let first = angles.length - 1;
  for (let i = 0; i < angles.length - 1; i++) if (degrees >= angles[i] && degrees < angles[i + 1]) { first = i; break; }
  const second = (first + 1) % angles.length;
  const start = angles[first], end = second === 0 ? angles[0] + 360 : angles[second];
  const value = degrees < start ? degrees + 360 : degrees;
  return {first, second, blend: Math.max(0, Math.min(1, (value - start) / (end - start)))};
}
export function seatedForPhase(phase) {
  return ['preparation', 'group', 'individual-wait', 'individual'].includes(phase);
}
export function mouthOpening(seconds, speaking, reducedMotion = false) {
  if (!speaking || reducedMotion) return 0;
  const phrase = seconds % 2.9;
  if (phrase > 2.35) return 0;
  const syllable = Math.sin(seconds * 16.7) * .5 + .5;
  return Math.max(0, Math.min(1, (.16 + syllable * .84) * Math.min(1, phrase * 8, (2.35 - phrase) * 9)));
}
export function listenerNod(seconds, slot, listening, reducedMotion = false) {
  if (!listening || reducedMotion) return 0;
  const period = 5.8 + slot * .47;
  const phase = (seconds + slot * 1.83) % period;
  if (phase > 1.15) return 0;
  const ease = value => value * value * value * (value * (value * 6 - 15) + 10);
  const dip = phase < .38 ? ease(phase / .38) : phase < .48 ? 1 : 1 - ease((phase - .48) / .67);
  // Radians: a small, unhurried acknowledgement with a softer return.
  return dip * (.036 + (slot % 3) * .003);
}
export function updateAttention(actor, speaker, dt, reducedMotion = false) {
  let desired = 0;
  if (speaker && speaker.id !== actor.id) {
    const dx = speaker.x - actor.x, dz = speaker.z - actor.z;
    if (Math.hypot(dx, dz) > .001) desired = Math.max(-1.35, Math.min(1.35, wrapAngle(Math.atan2(dx, dz) - actor.facingYaw)));
  }
  actor.lookYaw = reducedMotion ? desired : actor.lookYaw + wrapAngle(desired - actor.lookYaw) * (1 - Math.exp(-Math.max(0, dt) * 3.8));
  return actor.lookYaw;
}
