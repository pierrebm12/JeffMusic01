USE jeffmusic;

-- ============================================================
-- SITE SECTIONS (content for Hero, Biography, Calendar)
-- ============================================================
INSERT INTO site_sections (section_key, media_url, media_type, title_es, title_en, subtitle_es, subtitle_en, text1_es, text1_en, text2_es, text2_en, text3_es, text3_en, data_json) VALUES
('hero',
 'https://res.cloudinary.com/dt4mproy3/video/upload/f_mp4,vc_h265/v1771905565/AQP6mPoLMpqNHACeisYtRD_k9XzGuv34xurut1mE28RKTKr1Q45MbdI0KTTbFqRCOXurCWuGidERrMlZ7mbg5ThqrsC31JaMBRlcSA6tKA_xfw0om',
 'video',
 'Espectáculo Profesional',
 'Professional Entertainment',
 'Música en vivo que transforma tu evento',
 'Live music that transforms your event',
 NULL, NULL, NULL, NULL, NULL, NULL,
 NULL),
('biography',
 'https://res.cloudinary.com/dt4mproy3/image/upload/v1771908086/e5863a23-8d4b-469f-8d96-a39adbb299e9_e9zzzb.jpg',
 'image',
 'Biografía',
 'Biography',
 NULL, NULL,
 'Jeff Buitrago es un cantante y compositor colombiano que ha construido su identidad artística a través de la pasión, la disciplina y una profunda conexión con la música romántica, ranchera y popular.',
 'Jeff Buitrago is a Colombian singer and songwriter who has built his artistic identity through passion, discipline, and a deep connection with romantic, ranchera, and popular music.',
 'Desde temprana edad descubrió en la música una forma de expresar emociones reales y contar historias que conectan directamente con el corazón del público. Su trayectoria incluye presentaciones en eventos privados, corporativos y festivales, donde ha demostrado versatilidad, profesionalismo y entrega total en cada actuación.',
 'From an early age, he discovered in music a way to express real emotions and tell stories that connect directly with the heart of the audience. His career includes performances at private events, corporate events and festivals, where he has shown versatility, professionalism and total dedication in every performance.',
 'Hoy, Jeff se posiciona como una de las voces emergentes de la música popular colombiana, con un estilo propio que mezcla tradición y modernidad.',
 'Today, Jeff positions himself as one of the emerging voices of Colombian popular music, with his own style that blends tradition and modernity.',
 NULL),
('calendar',
 NULL,
 'image',
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL),
('videos_gallery',
 NULL,
 NULL,
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
 '{"autoAdvanceMs": 8000}');

-- ============================================================
-- SHOWS (calendar events)
-- ============================================================
INSERT INTO shows (place, day, time, available) VALUES
('Bogotá - Teatro Colón', '25 de Mayo', '8:00 PM', 1),
('Medellín - Plaza Mayor', '1 de Junio', '7:30 PM', 1),
('Cali - Feria de las Flores', '15 de Junio', '9:00 PM', 0);

-- ============================================================
-- PHOTOS
-- ============================================================
INSERT INTO photos (url, title, title_en, sort_order) VALUES
('https://res.cloudinary.com/dt4mproy3/image/upload/v1771907883/32f33fb4-3a7e-4668-a9ab-830259d3d60b_h65xru.jpg', 'Evento Privado', 'Private Event', 1),
('https://res.cloudinary.com/dt4mproy3/image/upload/v1771908086/b63b7ea7-211b-4f17-9872-2562e1f0941a_j1ohwv.jpg', 'Evento Corporativo', 'Corporate Event', 2),
('https://res.cloudinary.com/dt4mproy3/image/upload/v1771908085/73f2e20c-ebe8-4384-923e-002e15f80938_bnyxix.jpg', 'Yo Me Llamo Colombia', 'Yo Me Llamo Colombia', 3);

-- ============================================================
-- VIDEOS
-- ============================================================
INSERT INTO videos (url, title, title_en, sort_order) VALUES
('https://res.cloudinary.com/dt4mproy3/video/upload/f_mp4,vc_h264/v1771998543/AQMzb2-vpU2R5SpT7MoXMP5_mypM5Oq1lk9IeLyXFs2bxT2oTYY6mJ2a6fvUoz709YJuOKglnJzygCxcUrZbASJikNKKi7a_5kb9oYPZNQ_sq5uml', 'Yo Me Llamo', 'Yo Me Llamo', 1),
('https://res.cloudinary.com/dt4mproy3/video/upload/f_mp4,vc_h264/v1771909268/AQOoXJQAIjhYujWbn5BWzSD-NR6K6avfVBp-QMnTEfa5T6dV-f7pqttS_ZVbxq2ZcjX6FInSSdvmQT936l6KUEpAOEH9L1w4HK4DsHhjIQ_qf8128', 'Evento Privado', 'Private Event', 2),
('https://res.cloudinary.com/dt4mproy3/video/upload/f_mp4,vc_h264/v1771997698/AQPi0IwEPOUizVJKFQCNns3rAR5JK7EdZHt-ncETErz6bOQ4jjZvK6i7W8gb7Euo4KYhCYTW6YSo3H0Tk0g906P2vFgsZ8Pn4A1KOcE_cdo7fv', 'Festival Nacional', 'National Festival', 3);
