import { useEffect, useState } from "react";

export function useCityAudio(enabled, paused) {
  const supported =
    typeof window !== "undefined" &&
    Boolean(window.AudioContext || window.webkitAudioContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || paused) return;
    if (!supported) {
      setError("Este navegador no admite audio ambiental.");
      return;
    }

    let context;
    let disposed = false;
    const sources = [];
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      sources.forEach((source) => {
        source.stop();
        source.disconnect();
      });
      if (context && context.state !== "closed")
        context.close().catch(() => {});
    };

    try {
      setError(null);
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new AudioContext();
      const master = context.createGain();
      master.gain.setValueAtTime(0, context.currentTime);
      master.gain.linearRampToValueAtTime(0.12, context.currentTime + 1.2);
      master.connect(context.destination);

      [110, 164.81, 220].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        oscillator.detune.value = [-4, 3, 0][index];
        gain.gain.value = 0.12;
        oscillator.connect(gain);
        gain.connect(master);
        oscillator.start();
        sources.push(oscillator);
      });

      const rain = context.createBufferSource();
      const buffer = context.createBuffer(
        1,
        context.sampleRate * 3,
        context.sampleRate,
      );
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++)
        samples[i] = Math.random() * 2 - 1;
      const filter = context.createBiquadFilter();
      const rainGain = context.createGain();
      filter.type = "lowpass";
      filter.frequency.value = 950;
      rainGain.gain.value = 0.15;
      rain.buffer = buffer;
      rain.loop = true;
      rain.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(master);
      rain.start();
      sources.push(rain);
      context.resume().catch(() => {
        if (!disposed) {
          setError(
            "No se pudo activar el audio. Vuelve a intentarlo desde los ajustes.",
          );
          dispose();
        }
      });
    } catch {
      setError("No se pudo iniciar el audio ambiental.");
      dispose();
    }

    return dispose;
  }, [enabled, paused, supported]);

  return { supported, error };
}
