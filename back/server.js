const express = require('express')
const cors = require('cors')
require('dotenv').config()
require('./config/DB')
const student = require('./routes/student')
const course = require('./routes/course')
const grade = require('./routes/grade')
const Notify = require('./models/Notifications');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/students', student);
app.use('/courses', course)
app.use('/grades', grade)
app.get('/notify', (req, res) => {
    Notify.find().then(data => {
        
        res.json( data );
    })
    .catch(err => {
        res.status(500).json({ message: 'somthing went wrong' + err });
    })
})


app.listen(process.env.PORT | 3000, () => {
    console.log(`server is running on port ${process.env.PORT | 3000}`);
})