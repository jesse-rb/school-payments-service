-- ####
-- #### Seed pre-defined data
-- ####

INSERT INTO schools(id, name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Universal One'),
    ('22222222-2222-2222-2222-222222222222', 'Trip Twos'),
    ('33333333-3333-3333-3333-333333333333', 'Three Classrooms School');

INSERT INTO trips (name, cost, start_datetime, end_datetime, school_id) VALUES
    (
        'Ones Day Out',
        59.99,
        NOW() + INTERVAL '1 day' + INTERVAL '8 hours',
        NOW() + INTERVAL '1 day' + INTERVAL '14 hours',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        'Twin Peaks Nature Hike',
        34.50,
        NOW() + INTERVAL '2 days' + INTERVAL '9 hours',
        NOW() + INTERVAL '2 days' + INTERVAL '15 hours 30 minutes',
        '22222222-2222-2222-2222-222222222222'
    ),
    (
        'Three Classrooms Museum Tour',
        22.00,
        NOW() + INTERVAL '3 days' + INTERVAL '10 hours',
        NOW() + INTERVAL '3 days' + INTERVAL '13 hours',
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        'Ones Science Expo',
        45.00,
        NOW() + INTERVAL '5 days' + INTERVAL '8 hours 30 minutes',
        NOW() + INTERVAL '5 days' + INTERVAL '16 hours',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        'Twos Art Gallery Visit',
        18.75,
        NOW() + INTERVAL '7 days' + INTERVAL '11 hours',
        NOW() + INTERVAL '7 days' + INTERVAL '14 hours 30 minutes',
        '22222222-2222-2222-2222-222222222222'
    );
