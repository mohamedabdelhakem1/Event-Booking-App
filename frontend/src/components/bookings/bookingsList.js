import React from 'react'
import './bookingsList.css'
const bookingList = props => (
    <ul className="booking__list">
        {props.bookings.map(booking => {
            return( 
            <li className="booking__item" key={booking._id}>
                <div className="bookings__item-data">
                {booking.event.title} - {new Date(booking.createdAt).toLocaleDateString()}
                </div>
                <div className="booking__item-action">
                    <button className="btn" onClick={props.onDelete.bind(this,booking._id)}>Cancel</button>
                </div>
            </li>)
        })}
    </ul>);
export default bookingList;