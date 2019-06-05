const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');



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
        input EventInput {
            title: String!
            description: String!
            price: Float!
            
        }
        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput):Event
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
        
     `),
        rootValue: {
            events: () => {
                return events
            },
            createEvent: (args) => {
                const event = {
                    _id: Math.random().toString(),
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date().toISOString()
                }

                events.push(event);
                return event;
                
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