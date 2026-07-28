// =============================================================
// Shared mood-value → color utility (0-100 scale).
// Interpolates through 4 stops: purple -> pink -> red -> deep red.
// Used by journal.html's mood dial and index.html's calendar day
// drawer (colored dot for days with a journal entry), so both stay
// visually in sync without duplicating the gradient math.
// =============================================================
(function (global) {
  'use strict';
  const STOPS = [
    [0x9d, 0x5c, 0xff], // 0   purple
    [0xe8, 0x43, 0x93], // ~33 pink
    [0xe5, 0x48, 0x4d], // ~67 red
    [0x7a, 0x12, 0x24]  // 100 deep red
  ];
  function lerp(a, b, t) { return Math.round(a + (b - a) * t); }
  function moodColorRgb(value) {
    const v = Math.max(0, Math.min(100, Number(value)));
    const segLen = 100 / 3;
    const segIdx = Math.min(2, Math.floor((isNaN(v) ? 50 : v) / segLen));
    const t = ((isNaN(v) ? 50 : v) - segIdx * segLen) / segLen;
    const [r1, g1, b1] = STOPS[segIdx];
    const [r2, g2, b2] = STOPS[segIdx + 1];
    return [lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t)];
  }
  function moodColor(value) {
    const [r, g, b] = moodColorRgb(value);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  global.moodColor = moodColor;
  global.moodColorRgb = moodColorRgb;
})(window);
