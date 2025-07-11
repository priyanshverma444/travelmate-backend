import asyncHandler from 'express-async-handler';
import Trip from '../models/Trip.js';

// @desc    Get all trips for user
export const getTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ user: req.user._id });
  res.json(trips);
});

// @desc    Create new trip
export const createTrip = asyncHandler(async (req, res) => {
  const { destination, startDate, endDate, notes } = req.body;

  if (!destination || !startDate || !endDate) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const trip = await Trip.create({
    user: req.user._id,
    destination,
    startDate,
    endDate,
    notes,
  });

  res.status(201).json(trip);
});

// @desc    Update trip
export const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  if (trip.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(updatedTrip);
});

// @desc    Delete trip
export const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findById(req.params.id);

  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }

  if (trip.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await trip.deleteOne();
  res.json({ message: 'Trip deleted' });
});