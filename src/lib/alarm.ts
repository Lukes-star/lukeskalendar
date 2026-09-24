let audioCtx: AudioContext | null = null;

export function playAlarmSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const playBeep = (startTime: number, freq: number) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    };

    const now = audioCtx.currentTime;
    playBeep(now, 880);
    playBeep(now + 0.5, 880);
    playBeep(now + 1.0, 880);
  } catch {
    // Audio not available
  }
}

let intervalId: number | null = null;

export function startAlarmLoop() {
  stopAlarmSound();
  playAlarmSound();
  intervalId = window.setInterval(() => playAlarmSound(), 1500);
}

export function stopAlarmSound() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
