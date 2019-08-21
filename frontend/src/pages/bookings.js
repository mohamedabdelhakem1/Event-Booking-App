import React, { Component } from 'react';
import AuthContext from '../context/auth-context';
import Spinner from '../components/spinner/spinner'
import BookingList from '../components/bookings/bookingsList'
class BookingsPage extends Component {
    static contextType = AuthContext
    state = {
        isLoading: false,
        bookings: []
    }
    componentDidMount() {
        this.fetchBookings()
    }
    fetchBookings = () => {
        this.setState({ isLoading: true })
        const requestBody = {
            query: `
            query { 
              bookings {
                _id
                createdAt
                event {
                    _id
                    title
                    date
                }
              }
            }
          `
        }

        fetch('http://localhost:8888/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.context.token}`
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                console.log(res)
            }
            return res.json();
        }).then(resData => {
            console.log(resData);
            const bookings = resData.data.bookings;
            this.setState({ bookings: bookings, isLoading: false });
        }).catch((err) => {
            console.log(err)
            this.setState({ isLoading: false })
        });

    }
    deleteBookingHandler = (bookingId) => {
        this.setState({ isLoading: true })
        const requestBody = {
            query: `
            mutation CancelBooking($id: ID!){ 
              cancelBooking(bookingId: $id) {
                _id
                title
              }
            }
          `,
          variables:{
              id:bookingId
          }
        };

        fetch('http://localhost:8888/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.context.token}`
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                console.log(res)
            }
            return res.json();
        }).then(resData => {
            console.log(resData)
            this.setState((prevState) => {
                const updatedBooking = prevState.bookings.filter((booking) => {
                    return booking._id !== bookingId;
                })
                return { bookings: updatedBooking, isLoading: false };
            })

        }).catch((err) => {
            console.log(err)
            this.setState({ isLoading: false })
        });

    }
    render() {
        return (
            <React.Fragment>
                {this.state.isLoading ? <Spinner /> : <BookingList
                    bookings={this.state.bookings}
                    onDelete={this.deleteBookingHandler}
                />}
            </React.Fragment>)
    }
}
export default BookingsPage; 