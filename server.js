const express = require('express');
const connectDB = require('./config/db');

//routes
const userRoute    = require('./routes/api/users'),
      authRoute    = require('./routes/api/auth'),
      profileRoute = require('./routes/api/profile'),
      postsRoute   = require('./routes/api/posts');



const app = express();

//connect the database
connectDB();

// INIT Middleware
app.use(express.json( {extended: false }))

app.get('/', (req, res) => {
    res.send('API running')
});

// Define routes
app.use('/api/users', userRoute)
app.use('/api/auth', authRoute)
app.use('/api/profile', profileRoute)
app.use('/api/posts', postsRoute)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server started on port ${PORT}`))