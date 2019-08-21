import React from 'react'
import './eventItem.css'

const eventItem = props => (
    <li key={props.eventId} className="events__list-item">
        <div>
            <h1>
                {props.title}
            </h1>
            <h2>
                ${props.price} - {new Date(props.date).toLocaleDateString()}
            </h2>
        </div>
        <div>
            {props.userId !== props.creatorId ? <button className="btn" onClick={props.onDetail.bind(this,props.eventId)}>View Details</button>
                : <p>you are the owner of that event</p>}
        </div>
    </li>)

export default eventItem;
