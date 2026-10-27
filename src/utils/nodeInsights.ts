import type { ElectrodeName } from "./signalSource";

export interface NodeFunctionalInsight {
  metricName: string;
  metricShort: string;
  measureType: string;
  description: string;
  clinicalOrBCI: string;
  typicalBand: string;
}

export const NODE_INSIGHTS: Record<ElectrodeName, NodeFunctionalInsight> = {
  // Pre-frontal / Frontopolar (Fp1, Fp2, FpZ)
  Fp1: {
    metricName: "Attention & Executive Focus",
    metricShort: "Cognitive Load",
    measureType: "Frontal Beta/Theta Ratio & Eye Artifacts",
    description: "Monitors executive attention, working memory allocation, and inhibitory control.",
    clinicalOrBCI: "Focus / Sustained attention monitoring, blink & oculomotor tracking",
    typicalBand: "Theta (4-8 Hz) & Beta (13-30 Hz)",
  },
  Fp2: {
    metricName: "Emotional Valence & Regulation",
    metricShort: "Emotional Balance",
    measureType: "Frontal Alpha Asymmetry (FAA)",
    description: "Measures emotional regulation and frontal approach vs. withdrawal motivation.",
    clinicalOrBCI: "Mood tracking, affective neurofeedback, emotion classification",
    typicalBand: "Alpha (8-13 Hz)",
  },
  FpZ: {
    metricName: "Prefrontal Engagement Index",
    metricShort: "Global Focus",
    measureType: "Frontopolar Coherence",
    description: "Central prefrontal convergence index for goal-directed task engagement and mental alertness.",
    clinicalOrBCI: "Real-time task engagement, ADHD neurofeedback protocols",
    typicalBand: "Beta (13-30 Hz) / (Alpha + Theta)",
  },

  // Frontal (F3, F4, Fz, F7, F8)
  F3: {
    metricName: "Left Frontal Approach & Reasoning",
    metricShort: "Approach Drive",
    measureType: "Left Frontal Alpha Suppression",
    description: "Associated with positive valence, motor planning, and verbal working memory tasks.",
    clinicalOrBCI: "Depression biomarkers, neurofeedback for cognitive optimization",
    typicalBand: "Theta & Alpha",
  },
  F4: {
    metricName: "Right Frontal Avoidance & Vigilance",
    metricShort: "Vigilance",
    measureType: "Right Frontal Beta Activation",
    description: "Reflects non-verbal reasoning, visual-spatial attention, and avoidance motivation under stress.",
    clinicalOrBCI: "Anxiety monitoring, stress response profiling",
    typicalBand: "Alpha & Beta",
  },
  Fz: {
    metricName: "Midline Frontal Theta",
    metricShort: "Mental Effort",
    measureType: "Frontal Midline Theta (Fmθ)",
    description: "Direct biomarker of working memory load, intense mental calculation, and focused concentration.",
    clinicalOrBCI: "Cognitive workload assessment, error-related negativity (ERN)",
    typicalBand: "Theta (4-8 Hz)",
  },
  F7: {
    metricName: "Broca's Language Production",
    metricShort: "Verbal Processing",
    measureType: "Anterior Temporal Gamma/Beta Power",
    description: "Overlies the inferior frontal gyrus (Broca's area), registering articulation planning and phonological retrieval.",
    clinicalOrBCI: "Speech BCI decoders, verbal fluency profiling",
    typicalBand: "Beta & Low Gamma",
  },
  F8: {
    metricName: "Emotional Prosody & Visual Memory",
    metricShort: "Socio-Emotional",
    measureType: "Right Anterior Temporal Activation",
    description: "Processes vocal tone (prosody), facial expression recognition, and non-verbal episodic memory.",
    clinicalOrBCI: "Affective computing, social cue decoding",
    typicalBand: "Theta & Alpha",
  },

  // Central (C3, C4, Cz)
  C3: {
    metricName: "Right-Hand Motor Planning (SMR)",
    metricShort: "Motor Intent (R)",
    measureType: "Mu Rhythm Desynchronization (ERD)",
    description: "Detects sensorimotor rhythm suppression during right-hand motor execution or motor imagery.",
    clinicalOrBCI: "Motor imagery BCI for prosthesis control and stroke rehabilitation",
    typicalBand: "Mu / Sensorimotor Rhythm (8-13 Hz)",
  },
  C4: {
    metricName: "Left-Hand Motor Planning (SMR)",
    metricShort: "Motor Intent (L)",
    measureType: "Mu Rhythm Desynchronization (ERD)",
    description: "Detects sensorimotor rhythm suppression during left-hand motor execution or motor imagery.",
    clinicalOrBCI: "Motor imagery BCI for prosthetic robotic arms and neuro-rehabilitation",
    typicalBand: "Mu / Sensorimotor Rhythm (8-13 Hz)",
  },
  Cz: {
    metricName: "Sensory-Motor Integration & Vertex Sharp",
    metricShort: "Vertex Sensorimotor",
    measureType: "Central Midline ERD & Somatosensory Evoked Potentials",
    description: "Represents leg/foot motor representations, vertex sharp waves during sleep, and bilateral sensory integration.",
    clinicalOrBCI: "Lower-limb gait neuroprosthetics, sleep staging",
    typicalBand: "Mu & Beta Rhythms",
  },

  // Temporal (T3, T4, T5, T6)
  T3: {
    metricName: "Wernicke's Auditory Comprehension",
    metricShort: "Speech Decoding",
    measureType: "Auditory Evoked Potentials (N100/P200)",
    description: "Covers the primary auditory cortex and Wernicke's area, decoding acoustic pitch, speech, and semantic meaning.",
    clinicalOrBCI: "Auditory BCI, language comprehension assessment",
    typicalBand: "Auditory Gamma (>30 Hz) & Theta",
  },
  T4: {
    metricName: "Acoustic Melody & Environmental Sound",
    metricShort: "Melodic Perception",
    measureType: "Right Temporal Spectral Dynamics",
    description: "Specialized in musical pitch discrimination, non-speech environmental acoustic recognition, and spatial timbre.",
    clinicalOrBCI: "Music cognition tracking, acoustic neurofeedback",
    typicalBand: "Alpha & Beta Rhythms",
  },
  T5: {
    metricName: "Visual-Verbal Integration & Reading",
    metricShort: "Semantic Reading",
    measureType: "Occipito-Temporal Coherence",
    description: "Posterior temporal site bridging visual word forms with semantic language concepts (visual cortex to Wernicke's).",
    clinicalOrBCI: "Dyslexia diagnostics, reading fatigue tracking",
    typicalBand: "Alpha & Theta Rhythms",
  },
  T6: {
    metricName: "Facial Recognition & Spatial Memory",
    metricShort: "Face & Scene N200",
    measureType: "Fusiform Gyrus ERP (N170 proxy)",
    description: "Located near the fusiform face area (FFA), responding distinctively to human facial structures and holistic visual scenes.",
    clinicalOrBCI: "Visual agnosia diagnostics, biometric neuromarketing",
    typicalBand: "Event-Related Potentials (N170) & Beta",
  },

  // Parietal (P3, P4, Pz)
  P3: {
    metricName: "Mathematical Logic & Spatial Coordinates",
    metricShort: "Spatial Calculation",
    measureType: "Left Parietal Desynchronization",
    description: "Active during mental arithmetic, symbolic reasoning, and egocentric coordinate calculations.",
    clinicalOrBCI: "Cognitive performance profiling, dyscalculia assessment",
    typicalBand: "Beta & Gamma Rhythms",
  },
  P4: {
    metricName: "Spatial Pattern Recognition & Mental Rotation",
    metricShort: "Spatial 3D Mental Map",
    measureType: "Right Parietal Alpha Desynchronization",
    description: "Drives mental 3D rotation, holistic scene navigation, and visual spatial selective attention.",
    clinicalOrBCI: "Spatial orientation monitoring, VR cognitive training",
    typicalBand: "Alpha & Beta Rhythms",
  },
  Pz: {
    metricName: "P300 Oddball & Cognitive Attention Hub",
    metricShort: "P300 Attention Hub",
    measureType: "P300 / P3b Event-Related Potential",
    description: "Canonical site for the P300 wave, measuring surprise, target stimulus recognition, and decision certainty.",
    clinicalOrBCI: "P300 speller BCIs, consciousness evaluation, lie detection / CIT",
    typicalBand: "P300 ERP (delta-theta transient, 300 ms)",
  },

  // Occipital (O1, O2, Oz)
  O1: {
    metricName: "Primary Visual Cortex (Right Field)",
    metricShort: "Visual Cortex (R-Field)",
    measureType: "SSVEP & Visual Evoked Potentials (VEP)",
    description: "Processes right visual hemifield sensory input, edge contrast, motion vectors, and color frequency.",
    clinicalOrBCI: "Steady-State Visual Evoked Potential (SSVEP) high-speed BCIs",
    typicalBand: "Alpha Rhythm (8-12 Hz) & SSVEP Harmonics",
  },
  O2: {
    metricName: "Primary Visual Cortex (Left Field)",
    metricShort: "Visual Cortex (L-Field)",
    measureType: "SSVEP & Visual Evoked Potentials (VEP)",
    description: "Processes left visual hemifield sensory input, optical flow, and visual sensory responsiveness.",
    clinicalOrBCI: "SSVEP-based spelling and drone control interfaces",
    typicalBand: "Alpha Rhythm (8-12 Hz) & SSVEP Harmonics",
  },
  Oz: {
    metricName: "Occipital Midline Alpha Rhythm",
    metricShort: "Alpha Blockade Hub",
    measureType: "Berger Effect (Eyes-Open vs Eyes-Closed Alpha)",
    description: "Hub of the classical Berger alpha wave (8-12 Hz). Immediately desynchronizes upon eye opening or visual alertness.",
    clinicalOrBCI: "Drowsiness/fatigue detection, visual imagery neurofeedback",
    typicalBand: "Alpha (8-12 Hz)",
  },
};
