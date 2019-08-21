const Event = require('../../models/event')
const Booking = require('../../models/booking')
const { transformBooking,transformEvent } = require('./populate')


module.exports = {
    bookings: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('unauthenticated!');
        }
        try {
            const _bookings = await Booking.find({user: req.userId});
            return _bookings.map(_booking => {
                return transformBooking(_booking); 
            });
        } catch (e) {

        }
    },
    bookEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('unauthenticated!');
        }
        const fetchedEvent = await Event.findById(args.eventId)
        const booking = new Booking({
            user: req.userId,
            event: fetchedEvent
        })
        const result = await booking.save();
        return transformBooking(result)
    },
    cancelBooking: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('unauthenticated!');
        }
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const result = transformEvent(booking.event)
            await Booking.deleteOne({ _id: args.bookingId });
            return result;
        } catch (err) {
            console.log(err)
            throw err
        }
    }
}