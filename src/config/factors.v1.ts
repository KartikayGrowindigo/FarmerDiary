/*
  Placeholder emission factors (v1)
  NOTE: These are provisional placeholder values for prototype use only.
  They must be reviewed and signed off by the agronomy team before any
  decision, reporting, or monetization. Do not present these as final
  or verifiable carbon figures.
*/

export const FACTORS_V1 = {
  residue: {
    Burning: 150, // kg CO2e per acre (placeholder)
    Incorporation: 20,
    'Baling & Selling': 10
  },
  fertilizer: {
    ureaKg: 1.5, // kg CO2e per kg (placeholder)
    dapKg: 1.2
  },
  irrigation: {
    fuelPerHour: 2.5 // kg CO2e per pump-hour
  },
  diesel: {
    perLitre: 2.68 // kg CO2e per litre (placeholder)
  },
  tillage: {
    conventional: 50,
    zeroTill: 10
  }
}
