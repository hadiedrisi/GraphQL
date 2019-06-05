const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const Event = require('./models/event');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
var db = mongoose.connection;
db.on('error', function () {
    console.log('error in connecting Databse');
});
db.once('connected', function () {
    console.log('Connected to GraphQL Database...');
})
mongoose.connect('mongodb://localhost:27017/GraphQL', { useNewUrlParser: true });



const app = express();
app.use(bodyParser.json());
// instead of DB
const events = [];

//app.use(bodyParser.urlencoded({ extended: false }));

app.listen(3000);


app.use(
    '/graphql',
    graphqlHttp({
        schema: buildSchema(`

        type Event {
            _id:ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }
        type User{
            _id:ID!
            email:String!
            password:String!
        }
        

        input EventInput {
            title: String!
            description: String!
            price: Float!     
        }
        input UserInput {
            email:String!
            password:String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput):Event
            createUser(userInput: UserInput):User
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
        
     `),
        rootValue: {
            events: () => {
                //return events
                return Event.find().then(events=>{
                    console.log(events);
                    return events.map(event=>{
                        return{...event._doc};
                    })
                   
                }).catch(err=>{
                    throw err;
                });

            },
            createEvent: (args) => {
                // const event = {
                //     _id: Math.random().toString(),
                //     title: args.eventInput.title,
                //     description: args.eventInput.description,
                //     price: +args.eventInput.price,
                //     date: new Date().toISOString()
                // }
                const id= mongoose.Types.ObjectId();
                const newEvent = new Event({
                    _id: id,
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date().toISOString()
                })
                let createEvent;
                return newEvent.save()
                .then((results) => {
                    createEvent ={...results._doc};
                    return User.findById('5cf82ecf976b4a0d4c556644')            
                })
                .then(user=>{
                    if(!user)
                    {
                        throw new Error('User not exist')
                    }
                   user.CreateEvents.push(id);
                   return user.save();

                })
                .then(result=>{
                    console.log(result);
                    return createEvent;
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });


                //events.push(event);

            },
            createUser: args =>{
                return User.findOne({email:args.userInput.email})
                .then(user=>{
                    if(user)
                    {
                        throw new Error('Exist User Already');
                    }
                    return bcrypt.hash(args.userInput.password,12)
                }) 
                
                .then(hashpassword=>{
                    const newUser = new User({
                        email: args.userInput.email,
                        password:hashpassword
                    });

                    return newUser.save()
                    .then(result=>{
                        return{...result._doc,password:'***'}
                    })
                    .catch(err=>{
                        throw err
                    })
                })
                .catch(err=>{
                    throw err;
                })
               
            }

        },
        graphiql: true,
    })

);


// app.use(
//     '/graphql',
//     graphqlHttp({
//         schema: buildSchema(`
//         schema {
//             query: RootQuery
//             mutation: RootMutation
//         }
//         type RootQuery {
//             events: [String!]!
//         }
//         type RootMutation {
//             createEvent(name: String): String
//         }

//      `),
//         rootValue: {
//             events: () => {
//                 return ['FUTUGATE', 'hadiEdrisi', 'AllnightCoding'];
//             },
//             createEvent: (args) => {
//                 const eventName = args.name;
//                 return eventName;
//             }
//         },
//         graphiql: true,
//     })

// );

// app.get('/', (req, res, next) => {
//     res.send('Start tolearining GraphQL');
// })