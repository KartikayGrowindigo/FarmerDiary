export type ID = string

export type Farmer = {
  id: ID
  name: string
  fatherName: string
  village: string
  contact: string
  kisanAdvisor: string
  gender?: string
  gipl_id?: string
}

export type Plot = {
  id: ID
  farmerId: ID
  acres: number
  village: string
}

export type CropCycle = {
  id: ID
  plotId: ID
  crop: string
  season: string
  year: string
  sowingDate?: string
  harvestDate?: string
}

export type Activity = {
  id: ID
  cropCycleId: ID
  module: string
  date: string
  notes?: string
  payload: Record<string, any>
}
