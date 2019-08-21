const Event = require('../../models/event')
const User = require('../../models/user')
const {transformEvent} = require('./populate')





module.exports = {
    events: async () => {
        try {
            const events = await Event.find();
            return events.map((e) => {
                return transformEvent(e)
            });
        } catch (e) {
            console.log(e);
        }
    },
    createEvent: async (args , req) => {
        if(!req.isAuth){ 
             throw new Error('unauthenticated!');
        }
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: req.userId
        })
        try {
            const e = await event.save();
            let u = await User.findById(e.creator)
            if (!u) {
                throw new Error('user doesnot exist')
            }
            u.createdEvents.push(e);
            u = await u.save();
            return transformEvent(e);
        } catch (e) {
            throw e;
        }
    }
}