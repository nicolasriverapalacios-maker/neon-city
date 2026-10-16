export const DISTRICTS = [
  {
    id: "overview",
    number: "00",
    name: "Panorámica",
    subtitle: "La ciudad que nunca se desconecta",
    position: [76, 58, 88],
    target: [0, 12, 0],
    color: "#baf8eb",
  },
  {
    id: "core",
    number: "01",
    name: "Núcleo Aeterna",
    subtitle: "El corazón de la red",
    position: [42, 34, 49],
    target: [0, 22, 0],
    marker: [0, 46, 0],
    color: "#8cf9e9",
    frequency: "88.4",
    title: "Una voz entre el ruido",
    story:
      "Aeterna administra cada recuerdo de la ciudad. Pero esta noche, una transmisión sin firma atraviesa sus cortafuegos.",
    fragment: "«Si puedes oírme, todavía hay algo humano en esta red.»",
  },
  {
    id: "market",
    number: "02",
    name: "Mercado Kōyō",
    subtitle: "Donde se negocian los recuerdos",
    position: [47, 20, 44],
    target: [23, 4, 16],
    marker: [25, 12, 17],
    color: "#ff9f67",
    frequency: "104.2",
    title: "Memorias de contrabando",
    story:
      "Bajo los toldos del mercado, los comerciantes intercambian sueños de una época anterior al apagón. Alguien dejó un mensaje en un viejo receptor.",
    fragment:
      "«No somos los datos que guardan de nosotros. Somos lo que elegimos recordar.»",
  },
  {
    id: "harbor",
    number: "03",
    name: "Puerto Umbral",
    subtitle: "La última salida de la ciudad",
    position: [-53, 24, 48],
    target: [-24, 5, 15],
    marker: [-25, 15, 17],
    color: "#f09bdf",
    frequency: "96.7",
    title: "Después del último tren",
    story:
      "Los cargueros autónomos cruzan el canal sin pasajeros. En el andén abandonado, la tercera señal sigue esperando a quien se atreva a escuchar.",
    fragment: "«Nos vemos al otro lado del amanecer. Trae tus recuerdos.»",
  },
];

export function restoreSignals(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter((id) =>
              DISTRICTS.some((d) => d.id === id && d.marker),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}

export function tuneSignal(signals, id) {
  return DISTRICTS.some((d) => d.id === id && d.marker) && !signals.includes(id)
    ? [...signals, id]
    : signals;
}
