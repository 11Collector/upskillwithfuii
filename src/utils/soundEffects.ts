export const playSuccessChime = () => {
  if (typeof window === "undefined") return;

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const arpeggio = [523.25, 659.25, 783.99];
    const noteDelay = 0.05;

    arpeggio.forEach((freq, index) => {
      const start = now + index * noteDelay;
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      subOsc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);
      subOsc.frequency.setValueAtTime(freq / 2, start);
      gainNode.gain.setValueAtTime(0, start);
      gainNode.gain.linearRampToValueAtTime(0.07, start + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);

      osc.connect(gainNode);
      subOsc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
      subOsc.start(start);
      subOsc.stop(start + 0.4);
    });

    const chordStart = now + arpeggio.length * noteDelay;
    const chordDecay = 0.8;

    [1046.50, 1318.51, 1567.98, 2093.00].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = index % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, chordStart);
      osc.frequency.exponentialRampToValueAtTime(freq + 12, chordStart + 0.06);
      osc.frequency.linearRampToValueAtTime(freq, chordStart + 0.15);

      gainNode.gain.setValueAtTime(0, chordStart);
      gainNode.gain.linearRampToValueAtTime(0.06, chordStart + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, chordStart + chordDecay);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(chordStart);
      osc.stop(chordStart + chordDecay + 0.05);
    });
  } catch {
    // Non-critical sound feedback.
  }
};
