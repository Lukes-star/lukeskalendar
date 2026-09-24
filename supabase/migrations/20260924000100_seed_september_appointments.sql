-- Imported appointments from the September 2026 appointment list.
INSERT INTO appointments (client_name, client_phone, vehicle, service_id, service_name, duration, date, note, employee_name, status)
SELECT 'Srbo Taxi', '', '{"make":"","model":"Astra K","plate":""}'::jsonb, 'ugradnja-led-sijalica', 'Ugradnja Led Sijalica', 60, '2026-09-23', NULL, 'Marko Arsenovic', 'scheduled'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE client_name = 'Srbo Taxi' AND date = '2026-09-23' AND service_name = 'Ugradnja Led Sijalica');

INSERT INTO appointments (client_name, client_phone, vehicle, service_id, service_name, duration, date, note, employee_name, status)
SELECT 'Servolet', '0653179279', '{"make":"","model":"Servolet","plate":""}'::jsonb, 'ispitivanje-fara', 'Ispitivanje Fara', 60, '2026-09-22', 'Far ispitati ima vode 08h', 'Marko Arsenovic', 'scheduled'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE client_name = 'Servolet' AND date = '2026-09-22' AND service_name = 'Ispitivanje Fara');

INSERT INTO appointments (client_name, client_phone, vehicle, service_name, service_id, duration, date, note, employee_name, status)
SELECT 'Bmw E90', '0612334474', '{"make":"","model":"Bmw E90","plate":"061"}'::jsonb, 'Ugradnja Led Sijalica', 'ugradnja-led-sijalica', 60, '2026-09-18', 'Ugradnja xenona 8h 0612334474', 'Marko Arsenovic', 'scheduled'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE client_name = 'Bmw E90' AND date = '2026-09-18' AND service_name = 'Ugradnja Led Sijalica');

INSERT INTO appointments (client_name, client_phone, vehicle, service_id, service_name, duration, date, note, employee_name, status)
SELECT 'Mitric', '064', '{"make":"","model":"Golf 7","plate":""}'::jsonb, 'Resavanje Dnevno Svetlo', 'resavanje-dnevno-svetlo', 60, '2026-09-18', 'Golf 7 pukla sijalica 12h', 'Marko Arsenovic', 'scheduled'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE client_name = 'Mitric' AND date = '2026-09-18' AND service_name = 'Resavanje Dnevno Svetlo');

INSERT INTO appointments (client_name, client_phone, vehicle, service_id, service_name, duration, date, note, employee_name, status)
SELECT 'Srbo Taxi', '', '{"make":"","model":"Astra K","plate":""}'::jsonb, 'Reparacija Fara Zamena Stakla', 'reparacija-fara-zamena-stakla', 60, '2026-09-17', 'Dnevno svetlo', 'Marko Arsenovic', 'scheduled'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE client_name = 'Srbo Taxi' AND date = '2026-09-17' AND service_name = 'Reparacija Fara Zamena Stakla');

INSERT INTO appointments (client_name, client_phone, vehicle, service_id, service_name, duration, date, note, employee_name, status)
SELECT 'Bmw F21', '069695269', '{"make":"","model":"Bmw F21","plate":""}'::jsonb, 'Ugradnja Led Sijalica', 'ugradnja-led-sijalica', 60, '2026-09-16', 'Nenad ispitivanje fara sijalice', 'Marko Arsenovic', 'scheduled'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE client_name = 'Bmw F21' AND date = '2026-09-16' AND service_name = 'Ugradnja Led Sijalica');

INSERT INTO appointments (client_name, client_phone, vehicle, service_id, service_name, duration, date, note, employee_name, status)
SELECT 'Audi A6 C8', 'viber', '{"make":"","model":"Audi A6 C8","plate":""}'::jsonb, 'Resavanje Dnevno Svetlo', 'resavanje-dnevno-svetlo', 60, '2026-09-15', 'Zeljko komplet 380e', 'Marko Arsenovic', 'scheduled'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE client_name = 'Audi A6 C8' AND date = '2026-09-15' AND service_name = 'Resavanje Dnevno Svetlo');

INSERT INTO appointments (client_name, client_phone, vehicle, service_id, service_name, duration, date, note, employee_name, status)
SELECT 'Mitric', '064', '{"make":"","model":"Golf 7","plate":""}'::jsonb, 'Resavanje Dnevno Svetlo', 'resavanje-dnevno-svetlo', 60, '2026-09-14', 'Golf 7 pukla sijalica', 'Marko Arsenovic', 'scheduled'
WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE client_name = 'Mitric' AND date = '2026-09-14' AND service_name = 'Resavanje Dnevno Svetlo');