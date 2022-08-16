const express = require('express') // Setting up express framework to allow for easier server construction
const app = express() // Setting a variable equal to the express framework so that we can easiy tell it what to do and improve readability. 
const MongoClient = require('mongodb').MongoClient // Setting up the database and telling express what to use and telling MongoDB some stuff
const PORT = 2121 // Local port for viewing content
require('dotenv').config() // Setting up the enviorment variables from a .env file


let db, // Defining variables 
    dbConnectionStr = process.env.DB_STRING, // Telling the server where to find the connection string for the database, inside a variable from a .env file
    dbName = 'todo' // Defining the name of the database to use throughout the document

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }) // Initiate connection to database
    .then(client => { // Treated as a promise, once returned, it runs the following code
        console.log(`Connected to ${dbName} Database`) // Logging the fact that we are connected, to make sure that the connection was successful
        db = client.db(dbName) // Telling the database what its name that are asking of it to be
    }) // Finialize code for connection to DB
    
app.set('view engine', 'ejs') // Telling express to use ejs as a templating engine
app.use(express.static('public')) // This helps to serve static files such as images, CSS, JS using a middleware that is built in to express
app.use(express.urlencoded({ extended: true })) // Another built in middleware that is built into express that acts as body-parser
app.use(express.json()) // Another built in middleware that is built into express that parses incoming JSON requests and puts the parsed data in the req.body


app.get('/',async (request, response)=>{ // Telling express what to do when express gets a ping from '/', usually the homepage. 
    const todoItems = await db.collection('todos').find().toArray() // This sets a variable equal to the data returned in an array
    const itemsLeft = await db.collection('todos').countDocuments({completed: false}) // This sets another variable equal to the number of items that are present in that collection
    response.render('index.ejs', { items: todoItems, left: itemsLeft }) // This line tells express when it hears that ping of this page then it will respond with a render with the passed in file and the passed in data that will accompany the response.
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => { // Telling express to post something based on the passed in location. 
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false}) // This tells express and the database to create a new item inside of the collection with the passed in data in the object
    .then(result => { // This line tells express once the promise has been fulfilled to run this code below
        console.log('Todo Added') // Logging the fact that it was added for my sake and for clarity's sake
        response.redirect('/') // Once it has added the item to the db it has to refresh andd this helps us do that by telling express to render the '/' route from above
    })
    .catch(error => console.error(error)) // If the addTodo has an error, this will tell us the error in the log
})

app.put('/markComplete', (request, response) => { // Telling express to update something based on the passed in location
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ // This tells our db to update a certain thing within the item and that thing is the passed in object.
        $set: { // This operator allows us to replace the value of a field with the specefied value
            completed: true // This is the specefied value that is being changed
          } 
    },{
        sort: {_id: -1}, // This tell our db to sort the items based on the passed in function
        upsert: false // This tells our db to sort the ones of false 
    })
    .then(result => { // Once the promise has been fulfilled it runs this then statement
        console.log('Marked Complete') // This logs the fact that it was marked for our sake
        response.json('Marked Complete') // This tells express what to response to
    })
    .catch(error => console.error(error)) // If their is an error this will catch it and display it on the log

})

app.put('/markUnComplete', (request, response) => { // This tells express to update something based on a specefied location
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ // This tells express to search within a collection within our db and updateOne. This thing we are updating is the passed in object 
        $set: { // This operator allows us to replace the value of a field with the passed in value
            completed: false // The set operator looks to change the 'completed' field with the value of 'false'
          }
    },{
        sort: {_id: -1}, // This then sorts the data by the passed in object 
        upsert: false // This tells our db to sort the ones of false
    })
    .then(result => { //Once the promise has been fulfilled it runs this then statement
        console.log('Marked Complete') // This logs the fact that it was unmarked accordingly
        response.json('Marked Complete') // This tells express what to response to
    })
    .catch(error => console.error(error)) // If their is an error this will catch it and display it on the log

})

app.delete('/deleteItem', (request, response) => { // This tells express to delete something based on listening to a specefied location
    db.collection('todos').deleteOne({thing: request.body.itemFromJS}) // This tells us and our db where to look to delete something and what to delete
    .then(result => { // After the promise has been fulfilled it runs this then statement
        console.log('Todo Deleted') // This logs the fact that it was deleted for our sake and clarity
        response.json('Todo Deleted') // This tells express what to respond with
    })
    .catch(error => console.error(error)) // If their is an error this will catch it and display it on the log

})

app.listen(process.env.PORT || PORT, ()=>{ // This tells express where to set up its server, either in the .env file where a variable holds the connection string or through a definded port that is local
    console.log(`Server running on port ${PORT}`) // This tells us our server is up and running
}) // fin 

