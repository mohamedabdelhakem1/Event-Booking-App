import React, { Component } from 'react';
import './events.css'
import Modal from '../components/modals/Modal'
import Backdrop from '../components/Backdrop/Backdrop'
import AuthContext from '../context/auth-context'
import EventList from '../components/events/eventList/eventList'
import Spinner from '../components/spinner/spinner'
const API_URI = ((process.env.NODE_ENV === 'production') ? 
"https://graphql-event-booking-app.herokuapp.com/graphql":
'http://localhost:8888/graphql');
class EventsPage extends Component {
    constructor(props) {
        super(props);
        this.titleElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.dateElRef = React.createRef();
        this.descriptionElRef = React.createRef();
    }
    isActive = true;
    state = {
        creating: false,
        events: [],
        isLoading: false,
        selectedEvent: null
    }

    componentWillUnmount() {
        this.isActive = false;
    }
    static contextType = AuthContext;
    componentDidMount() {
        this.fetchEvents();
    }
    startCreateEventHandler = () => {
        this.setState({ creating: true });
    }
    modalCancelHandler = () => {
        this.setState({ creating: false, selectedEvent: null });
    }
    bookEventHandler = () => {
        if (!this.context.token) {
            this.setState({ selectedEvent: null })
            return;
        }
        const requestBody = {
            query: `
            mutation BookEvent($id: ID!) {
              bookEvent(eventId: $id) {
                _id
               createdAt
               updatedAt
              }
            }
          `,
            variables: {
                id: this.state.selectedEvent._id
            }
        }
        const token = this.context.token
        fetch(API_URI, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                console.log(res)
            }
            return res.json();
        }).then(resData => {
            console.log(resData)
            this.setState({ selectedEvent: null })
        }).catch((err) => {
            console.log(err)
        });

    }
    modalConfirmHandler = () => {
        this.setState({ creating: false });
        const title = this.titleElRef.current.value;
        const date = this.dateElRef.current.value;
        const description = this.descriptionElRef.current.value;
        const price = +this.priceElRef.current.value;
        if (title.trim().length === 0
            || date.trim().length === 0
            || price <= 0
            || description.trim().length === 0) {
            return;
        }
        const event = { title, price, date, description }
        console.log(event)
        const requestBody = {
            query: `
            mutation CreateEvent ($title: String! ,$desc: String! , $price: Float! ,$date: String!) {
              createEvent(eventInput: {title: $title, description: $desc, price: $price, date: $date}) {
                _id
                title
                description
                date
                price
               
              }
            }
          `,
            variables: {
                title: title,
                desc: description,
                price: price,
                date: date
            }
        }
        const token = this.context.token;
        fetch(API_URI, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                console.log(res)
            }
            return res.json();
        }).then(resData => {
            this.setState(prevState => {
                const updatedEvents = [...prevState.events]
                updatedEvents.push({
                    _id: resData.data.createEvent._id,
                    title: resData.data.createEvent.title,
                    description: resData.data.createEvent.description,
                    date: resData.data.createEvent.date,
                    price: resData.data.createEvent.price,
                    creator: {
                        _id: this.context.userId
                    }
                })
                return { events: updatedEvents }
            })
        }).catch((err) => {
            console.log(err)
        });

    }
    showDetailHandler = (eventId) => {
        this.setState((prevState) => {
            const selectedEvent = prevState.events.find(e => e._id === eventId);
            return { selectedEvent: selectedEvent }
        })
    }
    fetchEvents() {
        this.setState({ isLoading: true })
        const requestBody = {
            query: `
            query {
              events {
                _id
                title
                description
                date
                price
                creator {
                    _id
                    email
                  }
              }
            }
          `
        }
        fetch(API_URI, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                console.log(res)
            }
            return res.json();
        }).then(resData => {
            const events = resData.data.events;

            if (this.isActive) {
                this.setState({ events: events, isLoading: false });
            }
        }).catch((err) => {
            console.log(err)
            if (this.isActive) {
                this.setState({ isLoading: false })
            }
        });

    }

    render() {

        return (<React.Fragment>
            {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
            {this.state.creating && <Modal title="Add Event" canCancel canConfirm confirmText="Confirm" onConfirm={this.modalConfirmHandler}
                onCancel={this.modalCancelHandler}>
                <form>
                    <div className="form-control">
                        <label htmlFor="title">Title</label>
                        <input type="text" id="title" ref={this.titleElRef} />
                    </div>
                    <div className="form-control">
                        <label htmlFor="price">Price</label>
                        <input type="number" id="price" ref={this.priceElRef} />
                    </div>
                    <div className="form-control">
                        <label htmlFor="date">Date</label>
                        <input type="datetime-local" id="date" ref={this.dateElRef} />
                    </div>
                    <div className="form-control">
                        <label htmlFor="description">Description</label>
                        <textarea rows="4" id="description" ref={this.descriptionElRef} />
                    </div>
                </form>
            </Modal>}

            {this.state.selectedEvent &&
                <Modal title={this.state.selectedEvent.title}
                    canCancel
                    canConfirm
                    confirmText={this.context.token ? "Book" : "confirm"}
                    onConfirm={this.bookEventHandler}
                    onCancel={this.modalCancelHandler}>
                    <h1>{this.state.selectedEvent.title}</h1>
                    <h2> ${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}</h2>
                    <p>{this.state.selectedEvent.description}</p>
                </Modal>}
            {this.context.token && (<div className="events-control">
                <p>share your own events</p>
                <button className="btn" onClick={this.startCreateEventHandler}>
                    Create Event</button>
            </div>)
            }
            {this.state.isLoading ? <Spinner /> : <EventList
                events={this.state.events}
                authUserId={this.context.userId}
                onViewDetail={this.showDetailHandler}
            />}

        </React.Fragment>)
    }
}
export default EventsPage;