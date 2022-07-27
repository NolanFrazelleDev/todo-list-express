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


app.get('/',async (request, response)=>{
    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => {
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})