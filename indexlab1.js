const express = require('express');
const app = express();
app.use(express.json());

const rooms = [
    { id: 1, name: 'A101', capacity: 30 },
    { id: 2, name: 'Computer Lab', capacity: 16 },
    { id: 3, name: 'Main Hall', capacity: 120 },
    { id: 4, name: 'Meeting Room', capacity: 8 },
];

const reservations = [];
let nextReservationId = 1;

app.get('/api/rooms', (req, res) => {
    res.json(rooms);
});

app.get('/api/rooms/:id', (req, res) => {
    const id = Number(req.params.id);
    const room = rooms.find(r => r.id === id);

    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }

    res.json(room);
});

// POST /api/reservations - create a reservation
app.post('/api/reservations', (req, res) => {
    const { roomId, reservedBy, participants, date } = req.body || {};

    // basic validation -> 400
    if (roomId === undefined) {
        return res.status(400).json({ message: 'roomId is required' });
    }
    if (!reservedBy) {
        return res.status(400).json({ message: 'reservedBy is required' });
    }
    if (typeof participants !== 'number' || participants <= 0) {
        return res.status(400).json({ message: 'participants must be a number greater than 0' });
    }
    if (!date) {
        return res.status(400).json({ message: 'date is required' });
    }

    // does the room exist? -> 404
    const room = rooms.find(r => r.id === Number(roomId));
    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }
    if (participants > room.capacity) {
        return res.status(409).json({ message: 'Room capacity exceeded' });
    }

    const reservation = {
        id: nextReservationId++,
        roomId: Number(roomId),
        reservedBy,
        participants,
        date,
        status: 'CONFIRMED',
    };

    reservations.push(reservation);
    res.status(201).json(reservation);
});

app.get('/api/reservations', (req, res) => {
    const { roomId } = req.query;

    if (roomId === undefined) {
        return res.json(reservations);
    }

    const filtered = reservations.filter(r => r.roomId === Number(roomId));
    res.json(filtered);
});

app.patch('/api/reservations/:id/cancel', (req, res) => {
    const id = Number(req.params.id);
    const reservation = reservations.find(r => r.id === id);

    if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
    }

    reservation.status = 'CANCELLED';
    res.json(reservation);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));