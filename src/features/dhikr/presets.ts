export interface DhikrPreset {
  key: string;
  label: string;
  arabic: string;
  defaultTarget: number;
}

export const DHIKR_PRESETS: DhikrPreset[] = [
  {
    key: "subhanallah",
    label: "Sübhânallah",
    arabic: "سُبْحَانَ الله",
    defaultTarget: 33,
  },
  {
    key: "alhamdulillah",
    label: "Elhamdülillâh",
    arabic: "الْحَمْدُ لِلَّه",
    defaultTarget: 33,
  },
  {
    key: "allahuakbar",
    label: "Allâhu Ekber",
    arabic: "اللَّهُ أَكْبَر",
    defaultTarget: 33,
  },
  {
    key: "lailaheillallah",
    label: "Lâ ilâhe illallâh",
    arabic: "لَا إِلَٰهَ إِلَّا الله",
    defaultTarget: 100,
  },
  {
    key: "istighfar",
    label: "Estağfirullâh",
    arabic: "أَسْتَغْفِرُ الله",
    defaultTarget: 100,
  },
  {
    key: "salawat",
    label: "Salavât",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّد",
    defaultTarget: 100,
  },
];

export function getPreset(key: string): DhikrPreset {
  return DHIKR_PRESETS.find((p) => p.key === key) ?? DHIKR_PRESETS[0];
}
