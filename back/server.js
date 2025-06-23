const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser');
require('dotenv').config()
require('./config/DB')
const student = require('./routes/student')
const course = require('./routes/course')
const grade = require('./routes/grade')
const user = require('./routes/user')
const email = require('./routes/email')
const Notify = require('./models/Notifications');
const Department = require('./models/Department');
const { authMiddleware } = require('./middleware/auth');

const FRONTEND_ORIGIN = 'http://localhost:8080';

const app = express();

app.use(express.json());
app.use(cors({
  origin: FRONTEND_ORIGIN, 
  credentials: true
}));
app.use(cookieParser());

app.use('/', user);
app.use('/api/students', student);
app.use('/courses', course)
app.use('/grades', grade)
app.use('/email', email)
app.get('/notify', (req, res) => {
    Notify.find().then(data => {
        
        res.json( data );
    })
    .catch(err => {
        res.status(500).json({ message: 'somthing went wrong' + err });
    })
})
app.post('/dept', (req, res) => {
    new Department(req.body).save()
    .then(data=>{
        res.json(data);
    })
    .catch(err=>{
        res.status(505).json({error : err});
    })
})
app.get('/dept',authMiddleware ,(req, res) => {
    Department.find({category : req.user.departmentCategory})
    .then(data=>{
        res.json(data);
    })
    .catch(err=>{
        res.status(505).json({error : err});
    })
})


app.listen(process.env.PORT | 3000, () => {
    console.log(`server is running on port ${process.env.PORT | 3000}`);
})