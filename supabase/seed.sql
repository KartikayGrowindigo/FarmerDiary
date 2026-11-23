-- Demo data from src/data/seed.json (one farmer, four plots, two seasons).
-- Run after the migration. Then give someone access, e.g.:
--   insert into public.farmer_access (staff_id, farmer_id)
--   select id, 'farmer-1' from public.staff where email = 'someone@growindigo.co.in';

insert into public.farmers (id, name, father_name, village, contact, kisan_advisor, gender, gipl_id) values ('farmer-1', 'Manmohan Singh Toor', 'Jagwinder Singh', 'Sherpur Kalan', '8847496060', 'Jaswinder Singh', 'male', 'GIPL-001');
insert into public.plots (id, farmer_id, acres, village) values ('de0cbc45', 'farmer-1', 3.6, 'Sherpur Kalan');
insert into public.plots (id, farmer_id, acres, village) values ('2c558acb', 'farmer-1', 2.6, 'Sherpur Kalan');
insert into public.plots (id, farmer_id, acres, village) values ('b5790576', 'farmer-1', 5.9, 'Sherpur Kalan');
insert into public.plots (id, farmer_id, acres, village) values ('5466149c', 'farmer-1', 6.3, 'Sherpur Kalan');
insert into public.crop_cycles (id, plot_id, crop, season, year, sowing_date, harvest_date) values ('cc-de0cbc45-2024', 'de0cbc45', 'Wheat', 'Rabi', '2024-25', '2024-11-10', '2025-04-01');
insert into public.crop_cycles (id, plot_id, crop, season, year, sowing_date, harvest_date) values ('cc-2c558acb-2024', '2c558acb', 'Wheat', 'Rabi', '2024-25', null, null);
insert into public.crop_cycles (id, plot_id, crop, season, year, sowing_date, harvest_date) values ('cc-b5790576-2024', 'b5790576', 'Wheat', 'Rabi', '2024-25', null, null);
insert into public.crop_cycles (id, plot_id, crop, season, year, sowing_date, harvest_date) values ('cc-5466149c-2024', '5466149c', 'Wheat', 'Rabi', '2024-25', null, null);
insert into public.crop_cycles (id, plot_id, crop, season, year, sowing_date, harvest_date) values ('cc-de0cbc45-2025', 'de0cbc45', 'Wheat', 'Rabi', '2025-26', '2025-11-10', null);
insert into public.crop_cycles (id, plot_id, crop, season, year, sowing_date, harvest_date) values ('cc-2c558acb-2025', '2c558acb', 'Wheat', 'Rabi', '2025-26', null, null);
insert into public.crop_cycles (id, plot_id, crop, season, year, sowing_date, harvest_date) values ('cc-b5790576-2025', 'b5790576', 'Wheat', 'Rabi', '2025-26', null, null);
insert into public.crop_cycles (id, plot_id, crop, season, year, sowing_date, harvest_date) values ('cc-5466149c-2025', '5466149c', 'Wheat', 'Rabi', '2025-26', null, null);
insert into public.activities (id, crop_cycle_id, module, date, notes, payload) values ('a1', 'cc-de0cbc45-2024', 'Residue Management', '2025-04-02', 'Burned after harvest', '{"method": "Burning", "quantityQtlPerAcre": 10, "fuelLitres": 0, "costINR": 0}'::jsonb);
insert into public.activities (id, crop_cycle_id, module, date, notes, payload) values ('a2', 'cc-de0cbc45-2024', 'Fertilizer & Nutrient Management', '2025-01-10', 'DAP application', '{"product": "DAP", "quantityKgPerAcre": 50, "applicationMethod": "Broadcasting", "costINR": 300}'::jsonb);
