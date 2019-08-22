const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const mongoose = require('mongoose')
const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth')
const path = require('path')
const app = express()
const port = process.env.PORT || 8888


// this function are not 
//infinite loop because they are not requested
// in graphql query if requested they will be called

app.use(bodyParser.json())
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin' , '*')
    res.setHeader('Access-Control-Allow-Methods' , 'POST,GET,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers' , 'Content-Type, Authorization')
    if(req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
})


app.use(isAuth);
app.use('/graphql', graphqlHttp({ // [String!]!     !  means not null 
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
}))

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('frontend/build'));
    
    app.get('*',()=>{
        res.send(path.join(__dirname,'frontend','build','index.html'));
    });
}

mongoose
    .connect(process.env.MONGODB_URI
         || `mongodb+srv://mohamed:${process.env.MONGO_PASS}@cluster0-yq3xr.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`)
    .then(() => {
        app.listen(port, () => {
            console.log(`the server is running on port ${port}`);
        })
    }).catch((err) => {
        console.log(err)
    })
