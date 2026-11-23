// Generated from the official "CFP30-CropsDataInputs.xlsx" (Cool Farm Platform 3.0 - Annual Crops
// Data Input Table, "Reference Data" tab). Values are copied verbatim, including the source's own spelling.
// Source: https://coolfarmsupport.zohodesk.eu/portal/en/kb/articles/cool-farm-tool-3-0-annual-crops-data-input-table
// Regenerate rather than hand-edit: python scripts/cfp-reference-data.py <CFP30-CropsDataInputs.xlsx> src/config/cfp/referenceData.ts

export const CLIMATE = ["Tropical Montane", "Tropical Wet", "Tropical Moist", "Tropical Dry", "Warm Temperate Moist", "Warm Temperate Dry", "Cool Temperate Moist", "Cool Temperate Dry", "Boreal Moist", "Boreal Dry"] as const
export const SOIL_CHARACTERISTIC = ["Low activity clay", "High activity clay", "Sandy soils", "Spodic soils", "Volcanic soils", "Wetland soils"] as const
export const ANNUAL_CROP_TYPE = ["Alfalfa", "Barley", "Clover", "Cotton", "DryBean", "Grass-clover mix", "Maize", "Millet", "Oats", "Peanut", "Perennial grass", "Rye", "Sorghum", "Soyabean", "Springwheat", "Tomato", "Vegetable-above ground", "Winter wheat", "Other grain", "Other legume", "Other N-fixing forage", "Other Non-N-fixing forage", "Other root crops", "Other tuber crop", "Other annual crop", "Strawberry", "Rapeseed", "Canola", "Hops", "Sugarcane", "Vegetable-root", "Upland Rice"] as const
export const SOIL_TYPE = ["fine", "medium", "coarse"] as const
export const YIELD_UNIT = ["tonnes", "tons long", "tons short"] as const
export const RESIDUE_MANAGEMENT = ["Exporting", "Burning", "Composting - forced aeration", "Composting - non-forced aeration", "Left in heaps or pits", "Left on field"] as const
export const WEIGHT_PER_AREA = ["kg per hectare", "tonnes per hectare", "lb per acre", "tons short per acre", "tons long per acre", "kg per acre"] as const
export const WATER_REGIME_CULTIVATION = ["Continuously Flooded", "Intermittently flooded", "Intermittently flooded - multiple aeration", "Rainfed", "Drought prone", "Deep water"] as const
export const PRE_SEASON_WATER_REGIME = ["Not flooded pre-season (for <180 days)", "Not flooded pre-season (for >180 days)", "Not flooded pre-season (for >365 days)", "Flooded pre-season (for >30 days)"] as const
export const TIME_UNDER_CULTIVATION_UNIT = ["years", "months", "weeks", "days", "use default (IPCC)"] as const
export const ORGANIC_AMENDMENT_TYPE = ["Straw incorporation more than 30 days before cultivation", "Rice straw incorporation less than 30 days before cultivation", "Farmyard manure", "Green manure", "Compost"] as const
export const WASTE_WATER_VOLUME_UNIT = ["litres", "cubic metres", "acre inches"] as const
export const WASTE_WATER_TREATMENT = ["None - unspecified aquatic environment", "None - stagnant sewer", "None - fast flowing sewer", "Centralized aerobic treatment plant", "Sludge anaerobic digestion - DEPRECATED", "Anaerobic reactor", "Anaerobic lagoon - depth < 2m", "Anaerobic lagoon - depth > 2m", "None - other than reservoirs, lakes and estuaries", "None - reservoirs, lakes and estuaries", "Constructed Wetlands - Surface Flow", "Constructed Wetlands - Horizontal Subsurface Flow", "Constructed Wetlands - Vertical Subsurface Flow"] as const
export const PESTICIDE_CATEGORY = ["Soil treatment", "Pre-emergence", "Post-emergence", "Other"] as const
export const PESTICIDE_TYPE = ["Pesticide", "Fungicide", "Herbicide", "Insecticide"] as const
export const FERTILISER_SYNTHETIC = ["Compose your own NPK", "Ammonium nitrate - 33.5% N (granulated)", "Ammonium nitrate - 33.5% N (prilled)", "Ammonium sulphate - 21% N", "Ammonium sulphate nitrate - 26%N", "Anhydrous ammonia - 82% N", "Calcium ammonium nitrate - 27% N", "Calcium nitrate - 15.5% N", "Compound NPK - 15% N / 15% K2O / 15% P2O5 (mixed-acid process)", "Compound NPK - 15% N / 15% K2O / 15% P2O5 (nitrophosphate process)", "Diammonium phosphate - 18% N / 46% P2O5", "Monoammonium phosphate - 11% N / 52% P2O5", "Muriate of potash / Potassium chloride - 60% K2O", "Phosphate/Rock Phosphate - 32% P2O5", "Polyhalite - 48% SO3 / 14% K2O / 6% MgO / 17% CaO", "Potassium nitrate - crystallized (caliche method)", "Potassium nitrate - prilled (caliche method)", "Potassium sulphate - 50% K2O / 45% SO3", "Super phosphate - 21% P2O5", "Triple super phosphate - 48% P2O5", "Urea - 46% N", "Urea ammonium nitrate solution - 32% N", "Limestone - 55% CaCO3 / 29%CaO"] as const
export const FERTILISER_ORGANIC = ["Compost - 1% N", "Compost (zero emissions) - 1% N", "Peat", "Horse digestate - 0.7% N", "Pig digestate - 0.36% N", "Pig digestate - 0.7% N", "Poultry layer digestate - 1.9% N", "Sheep digestate - 0.7% N", "Broiler/Turkey litter - 3% N", "Cattle manure - 0.6% N", "Cattle slurry - 0.26% N", "Horse manure - 0.5% N", "Pig manure - 0.7% N", "Pig slurry - 0.36% N", "Poultry layer manure - 1.9% N", "Separated pig slurry (liquid part) 0.36% N", "Separated pig slurry (solid part) - 0.5% N", "Sheep manure - 0.7% N", "Cattle digestate - 0.26% N", "Cattle digestate - 0.6% N", "Straw (Production emissions included)", "Straw (Zero emissions)"] as const
export const FERTILISER_REGION = ["Africa 2014", "China 2014", "Chile 2021 (potassium nitrate caliche method only)", "Europe 2014", "Middle East 2014", "N America 2014", "S America 2014", "Russia (CIS countries) 2014", "SE Asia 2014", "S Asia 2014", "Oceania 2014", "World 2014", "World 2019", "Default"] as const
export const APPLICATION_RATE_UNIT = ["kg per hectare", "litres per hectare", "tonnes per hectare", "lb per acre", "tons short per acre", "tons long per acre", "kg per acre", "liters per acre"] as const
export const FERTILISER_WEIGHT_OR_UNIT = ["product", "unit of K (K)", "unit of K2O (K2O)", "unit of P2O5 (P2O5)", "unit of nitrogen (N)", "unit of phosphorus (P)", "unit of CaO (CAO)", "unit of SO3 (SO3)", "unit of MgO (MGO)", "unit of carbon (C)", "unit of CaCO3 (CACO3)"] as const
export const REFRIGERANT_EQUIPMENT = ["Domestic refrigeration", "Commercial refrigeration (standalone)", "Commercial refrigeration (medium and large)", "Transport refrigeration", "Industrial refrigeration", "Chillers", "Stationary air conditioning", "Mobile air conditioning- maritime", "Mobile air conditioning- railway", "Mobile air conditioning- busses", "Mobile air conditioning- other"] as const
export const REFRIGERANT_TYPE = ["Unknown", "R-400(50/50)", "R-400(60/40)", "R-401A", "R-401B", "R-401C", "R-402A", "R-402B", "R-403A", "R-403B", "R-404A", "R-405A", "R-406A", "R-407A", "R-407B", "R-407C", "R-407D", "R-407E", "R-408A", "R-409A", "R-409B", "R-410A", "R-410B", "R-411A", "R-411B", "R-411C", "R-412A", "R-413A", "R-414A", "R-414B", "R-415A", "R-415B", "R-416A", "R-417A", "R-418A", "R-419A", "R-420A", "R-421A", "R-422A", "R-422B", "R-422C", "R-500", "R-501", "R-502", "R-503", "R-504", "R-505", "R-506", "R-507", "R-508A", "R-508B", "R-509A", "HFC-23", "HFC-32", "HFC-41", "HFC-125", "HFC-134", "HFC-134a", "HFC-143", "HFC-143a", "HFC-152", "HFC-152a", "HFC-161", "HFC-227ca", "HFC-227ea", "HFC-236cb", "HFC-236ea", "HFC-236fa", "HFC-245ca", "HFC-245cb", "HFC-245ea", "HFC-245eb", "HFC-245fa", "HFC-263fb", "HFC-272ca", "HFC-329p", "HFC-365mfc", "HFC-43-10mee", "HCFC-142b", "CFC-114", "CFC-115", "CFC-12", "CFC-13", "HC-1270", "HC-290", "HC-600", "HC-600a", "HCFC-124", "HCFC-22", "HCFC-31", "HE-E170", "PFC-116", "PFC-218", "PFC-318"] as const
export const REFRIGERANT_RECOVERY = ["Landfill", "Partial refrigerant recovery", "Full refrigerant recovery", "Unknown"] as const
export const ALLOCATION_METHOD_REFRIGERANT = ["Economic", "Mass", "Physical", "Other"] as const
export const WEIGHT_UNIT = ["tonnes", "kg", "tons short", "tons long", "lb"] as const
export const ENERGY_SOURCE_VOLUME = ["Biodiesel HVO", "Biodiesel ME", "Bioethanol", "diesel (100% mineral diesel)", "diesel (average biofuel blend)", "petrol (100% mineral petrol)", "petrol (average biofuel blend)", "gas (by volume)", "Oil (by volume)", "Propane"] as const
export const ENERGY_SOURCE_WEIGHT = ["coal (by weight)", "fuel wood", "gas (by weight)", "wood pellets"] as const
export const ENERGY_SOURCE_ENERGY = ["Grid electricity", "Electricity(hydroelectric)", "Electricity(photo-voltaic)", "Electricity(wind)", "CHP import(biogas)", "CHP import-electricity(natural gas)", "CHP import-heat(natural gas)", "CHP export-(biogas)", "CHP export-electricity(natural gas)", "CHP export-heat(natural gas)", "CHP onsite(biogas)", "CHP onsite(natural gas)", "Gas (by energy)", "Coal (by energy)", "Oil (by energy)"] as const
export const ENERGY_UNIT_VOLUME = ["litres", "cubic metres", "gallon (imperial)", "gallons (US)"] as const
export const ENERGY_UNIT_WEIGHT = ["tonnes", "kg", "tons short", "tons long", "lb"] as const
export const ENERGY_UNIT_ENERGY = ["kWh", "MJ", "btu", "thm"] as const
export const BOUNDARY = ["Incoming to farm for on-farm use", "Within farm operations", "Dispatched from farm", "Unknown"] as const
export const IRRIGATION_METHOD = ["Center pivot", "Rain gun, sprinkler", "Flooding", "Drip irrigation"] as const
export const WATER_SOURCE = ["Natural lake/pond", "Reservoir", "River/stream/ditch", "On farm Storage pond/reservoir/tank", "Borehole/well", "Main supply"] as const
export const PUMPING_DEPTH_UNIT = ["Metres", "Centimetres", "Inches", "Feet", "Millimitres"] as const
export const HORIZONTAL_DISTANCE_UNIT = ["Metres", "Kilometres", "Centimetres", "Miles", "Inches", "Feet", "Millimitres"] as const
export const POWER_SOURCE = ["Electric", "diesel (average biofuel blend)", "Diesel (100% mineral diesel)", "Gravity"] as const
export const IRRIGATION_WATER_UNIT = ["inches", "millimetres", "litres", "cubic metres", "acre inches"] as const
export const TRANSPORT_TYPE = ["car diesel", "car petrol", "motorbike", "road HGV (average heavy goods vehicle)", "road LGV diesel (light goods vehicle <3.5t)", "road LGV petrol (light goods vehicle <3.5t)", "road LGV CNG/LPG (<3.5t)", "rail", "air very short haul (<800km)", "air short haul (800 - 3700km)", "air long haul (>3700km)", "ship small tanker (~1000t)", "ship large container vessel (2,000+ TEU)", "ship very large tanker (>60000t)", "ship small bulk carrier (~2000t)", "ship large bulk carrier (~15 000t)", "ship very large bulk carrier (~70 000t)", "ship small container vessel (0-1999 TEU)", "ship large container vessel (~20 000t)"] as const
export const MACHINE_TYPE = ["All-around weeder", "Baler", "Baler (250 kg round bale)", "Baler (250 kg square bale)", "Beet harvester", "Biocide spraying", "Chisel plough", "Chopping wine wood", "Combination rotary harrow/ sower", "Combination spike drum/sower", "Combine", "Combine harrow (harrow + seed drill)", "Corn combine", "Crop protection - syringe (orchards)", "Crop protection - syringe (viniculture)", "Disc harrow", "Fertiliser boom spraying", "Fertiliser spraying (orchards)", "Fertiliser spreading", "Flaming", "Foliage cut", "Forage harvester", "Forage harvester - corn hoeing with chipper", "Forage harvester - grassland", "Grain drill", "Grain drill-notill", "Grape harvester", "Grass seeding", "Grooming", "Grubbing", "Herbicide spraying", "Hilling of mounds", "Hoe drill", "Hoeing and grooming", "Liming", "Manure spreader", "Milling", "Moldboard plough", "Mower/grader", "Mower/grader - rotary mower - cultivation", "Mower-conditioner", "Mowing - disc mower", "Mulching - flail mulcher (orchards)", "Mulching - flail mulcher (viniculture)", "Mulching - seeding - corn", "Peas harvester", "Pneumatic drill", "Potato harvester", "Potato lifter loader", "Potato planting", "Potato planting - potato planter - semiautomatic", "Potato windrower", "Pressing of dry crop (straw/hay) high-density pick-up baler (13 kg/bale)", "Pump tank truck - drag hose", "Rod weeder", "Roller harrow", "Roller packer", "Rotary cultivation of tramlines", "Rotary hoe/bed tiller", "Row crop cultivator", "Row crop planter", "Scrubbing", "Self-propelling potato harvester", "Self-propelling potato lifter loader", "Subsoiler", "Subsoiling (viniculture)", "Sweep plough", "Tine harrow/seed handling transport", "Tomato harvester", "Tooth harrow", "Vacuum tanker", "Wagon for ventilated hay", "Wagon for wilted material", "Windrower/swather", "Winter cut - flail mulcher", "Wrapping of bales"] as const
export const MACHINE_FUEL = ["diesel (average biofuel blend)", "diesel (100% mineral diesel)", "Biodiesel ME", "Biodiesel HVO"] as const
export const STORAGE_TIME_UNIT = ["years", "months", "weeks", "days"] as const
export const FOREST_TYPE = ["subtropical dry forest", "subtropical mountain system", "tropical dry forest", "tropical moist deciduous forest", "tropical mountain systems", "tropical rainforest", "tropical shrubland", "boreal coniferous forest", "boreal mountain system", "boreal tundra woodland", "subtropical humid forest", "subtropical steppe", "temperate continental forest", "temperate mountain systems", "temperate oceanic forest"] as const
export const INTERCROP_TYPE = ["Avocado", "Cashew", "Jackfruit", "Rubber", "Durian"] as const
export const SHADE_TREE_TYPE = ["Tropical shade trees in wet area - canopy trees", "Tropical shade trees in wet area - understory", "Tropical shade trees in dry area", "Temperate conifers", "Temperate broadleaf trees", "Temperate shrubs"] as const
export const HEDGE_TYPE = ["Ash", "Maple", "Poplar", "Oak", "Species mix"] as const
export const HEDGE_LENGTH_UNIT = ["m", "km", "mi", "ft"] as const
export const TREE_TYPE = ["Coffee(arabica)", "Shade(Cordia alliodora, Juglans olanchana, inga tonduzzi, I. punctata)", "Tropical Moist hardwood", "Tropical wet hardwood", "Temperate/tropical pines", "Temperate US eastern hardwood", "Palm(Chrysophylla sp)", "Palm(Attalea cohune)", "Palm(Sabal sp)", "Palm(Attalea phalarata)", "Palm(Euterpe precatoria)", "Palm(Phenakospermun guialanensis)"] as const
export const TREE_MEASUREMENT_UNIT = ["cm", "m", "in", "ft"] as const
export const LAND_USE = ["Native", "Set aside", "Cultivated", "Paddy", "Perennial"] as const
export const CARBON_INPUT = ["Low", "Medium", "High without manure", "High  with manure"] as const
export const COVER_CROP_SPECIES = ["Black oats", "Common vetch", "Fodder radish", "Phacella", "White mustard", "Tagetes", "Mix with legumes", "Mix without legumes", "Other legume", "Other non-legume"] as const
export const COVER_CROP_BIOMASS_REMOVED = ["left in heaps or pits", "Composting forced aeration", "Composting non-forced aeration", "Exporting", "n/a"] as const
export const PERENNIAL_CROP_TYPE = ["Apple", "Citrus", "Cocoa - high density", "Cocoa - low density", "Coffee - shaded", "Coffee - monocrop", "Almonds", "Tea", "Oil Palm"] as const

// Hidden "Sheet1" of the same workbook: nutrient ingredients of each fertiliser (used only to narrow
// the "Fertiliser weight, or units?" choices). Names that differ from the visible list are absent.
export const FERTILISER_INGREDIENTS: Record<string, string[]> = {
 "Compose your own NPK": [
  "p2o5",
  "k2o",
  "n"
 ],
 "Compose your own NPK (all nutrients)": [
  "c",
  "mgo",
  "p2o5",
  "caco3",
  "so3",
  "n",
  "p",
  "na2o",
  "cao",
  "k2o",
  "ca",
  "k"
 ],
 "Ammonium bicarbonate - 18% N": [
  "n"
 ],
 "Ammonium chloride - 25% N": [
  "n"
 ],
 "Ammonium nitrate - 33.5% N": [
  "n"
 ],
 "Ammonium nitrate - 33.5% N (granulated)": [
  "n"
 ],
 "Ammonium nitrate - 33.5% N (prilled)": [
  "n"
 ],
 "Ammonium sulphate - 21% N": [
  "so3",
  "n"
 ],
 "Ammonium sulphate nitrate - 26%N": [
  "so3",
  "n"
 ],
 "Anhydrous ammonia - 82% N": [
  "n"
 ],
 "Calcium ammonium nitrate - 27% N": [
  "ca",
  "n"
 ],
 "Calcium nitrate - 15.5% N": [
  "n"
 ],
 "Compound NPK - 15% N / 15% K2O / 15% P2O5": [
  "p",
  "k",
  "p2o5",
  "k2o",
  "n"
 ],
 "Compound NPK - 15% N / 15% K2O / 15% P2O5 (mixed-acid process)": [
  "p",
  "k",
  "p2o5",
  "k2o",
  "n"
 ],
 "Compound NPK - 15% N / 15% K2O / 15% P2O5 (nitrophosphate process)": [
  "p",
  "k",
  "p2o5",
  "k2o",
  "n"
 ],
 "Diammonium phosphate - 18% N / 46% P2O5": [
  "p",
  "p2o5",
  "n"
 ],
 "Dilute nitric acid - 12% N": [
  "n"
 ],
 "Monoammonium phosphate - 11% N / 52% P2O5": [
  "p",
  "p2o5",
  "n"
 ],
 "Muriate of potash / Potassium chloride - 60% K2O": [
  "k",
  "k2o"
 ],
 "Phosphate/Rock Phosphate - 32% P2O5": [
  "p",
  "p2o5"
 ],
 "Polyhalite - 48% SO3 / 14% K2O / 6% MgO / 17% CaO": [
  "so3",
  "k2o",
  "mgo",
  "cao"
 ],
 "Potassium sulphate - 50% K2O / 45% SO3": [
  "k",
  "so3",
  "k2o"
 ],
 "Super phosphate - 21% P2O5": [
  "p",
  "p2o5"
 ],
 "Triple super phosphate - 48% P2O5": [
  "p",
  "p2o5"
 ],
 "Urea - 46% N": [
  "n"
 ],
 "Urea - 46.4% N": [
  "n"
 ],
 "Urea ammonium nitrate solution - 32% N": [
  "n"
 ],
 "Cattle digestate - 0.26% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Cattle digestate - 0.6% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Compost (fully aerated production) - 1% N": [
  "c",
  "n"
 ],
 "Compost (non-fully aerated production) - 1% N": [
  "c",
  "n"
 ],
 "Compost (zero emissions) - 1% N": [
  "c",
  "n"
 ],
 "Horse digestate - 0.7% N": [
  "c",
  "k",
  "n",
  "p",
  "k2o",
  "p2o5"
 ],
 "Pig digestate - 0.36% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Pig digestate - 0.7% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Poultry layer digestate - 1.9% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Sheep digestate - 0.7% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Broiler/Turkey litter - 3% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Cattle manure - 0.6% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Cattle slurry - 0.26% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Horse manure - 0.7% N": [
  "c",
  "k",
  "n",
  "p",
  "k2o",
  "p2o5"
 ],
 "Pig manure - 0.7% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Pig slurry - 0.36% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Poultry layer manure - 1.9% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Separated pig slurry (liquid part) 0.36% N": [
  "c",
  "k",
  "n",
  "p",
  "k2o",
  "p2o5"
 ],
 "Separated pig slurry (solid part) - 0.5% N": [
  "c",
  "k",
  "n",
  "p",
  "k2o",
  "p2o5"
 ],
 "Sheep manure - 0.7% N": [
  "c",
  "k",
  "n",
  "p",
  "so3",
  "k2o",
  "p2o5"
 ],
 "Limestone - 55% CaCO3 / 29%CaO": [
  "caco3",
  "cao"
 ]
}
