import React, { Component } from 'react';
import './Auth.css';
import AuthContext from '../context/auth-context';
const API_URI = ((process.env.NODE_ENV === 'production') ? 
"https://graphql-event-booking-app.herokuapp.com/graphql":
'http://localhost:8888/graphql');
class AuthPage extends Component {
    state = {
        isLogin: true
    }

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.emailEl = React.createRef();
        this.passwordEl = React.createRef();
    }

    switchModeHandler = () => {
        this.setState(prevState => {
            return { isLogin: !prevState.isLogin };
        })
    }
    submitHandler = (event) => {
        event.preventDefault();
        const email = this.emailEl.current.value;
        const password = this.passwordEl.current.value;

        if (email.trim().length === 0 || password.trim().length === 0) {
            return;
        }
        let requestBody = {
            query: `
                query Login($email: String!,$password: String!) {
                    login(email: $email, password: $password) {
                        userId
                        token
                        tokenExpiration
                    }
                }
            `,
            variables:{
                 email:email,
                 password:password 
            }

        };

        if (!this.state.isLogin) {
            requestBody = {
                query: `
                mutation CreateUser($email: String!, $password: String!) {
                    createUser(userInput: {email: $email, password: $password} ) {
                        _id
                        email
                    } 
                }
                `,
                variables:{
                     email:email,
                     password:password 
                }
            }
        }
        
        fetch(API_URI, {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
                throw new Error('failed')
            }
            return res.json();
        }).then(resData => {
            if (resData.data.login.token) {
                this.context.login(resData.data.login.token,
                     resData.data.login.userId, resData.data.login.tokenExpriration)
            }
        }).catch((err) => {
            console.log(err)
        });
    }
    render() {
        return (<form className="auth-form" onSubmit={this.submitHandler}>
            <div className="form-control">
                <label htmlFor="email">E-mail</label>
                <input type="email" id="email" ref={this.emailEl} />
            </div>
            <div className="form-control">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" ref={this.passwordEl} />
            </div>
            <div className="form-actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={this.switchModeHandler}>Switch to {this.state.isLogin ? 'signup' : 'login'}</button>
            </div>
        </form>)
    }
}
export default AuthPage;