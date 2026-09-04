export const POSTPROCESSING_DEFAULTS = {
  // Bloom
  bloomEnabled: true,
  bloomStrength: 3,
  bloomRadius: 0.4,
  // AO (GTAO)
  aoEnabled: true,
  aoRadius: 0.3,
  aoThickness: 1,
  aoDistanceExponent: 2,
  aoIntensity: 2,
};

export type PostprocessingConfig = typeof POSTPROCESSING_DEFAULTS;
