const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const socket = require('./config/Socket');
require('dotenv').config()
require('./config/DB')
const student = require('./routes/student')
const course = require('./routes/course')
const grade = require('./routes/grade')
const user = require('./routes/user')
const email = require('./routes/email')
const Department = require('./models/Department');
const notify = require('./routes/notify');
const { authMiddleware } = require('./middleware/auth');

const FRONTEND_ORIGIN = 'https://unimanage-site-1.onrender.com';

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
app.use('/', notify)

app.post('/dept', (req, res) => {
    new Department(req.body).save()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.status(505).json({ error: err });
        })
})
app.get('/dept', authMiddleware, (req, res) => {
    Department.find({ category: req.user.departmentCategory })
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.status(505).json({ error: err });
        })
})

const server = http.createServer(app);
// const io = socket.init(server);
const io = socketIo(server, {
    cors: {
        origin: FRONTEND_ORIGIN, // change to your React frontend URL
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    console.log('User Connected');

    socket.on("joinDepartment", (departmentId) => {
        socket.join(departmentId); // ✅ Join a room with department ID
        
    });

    socket.onAny((event, ...args) => {
        console.log(`📡 Event: ${event}`, args);
    });

    socket.on('disconnect', () => {
        console.log('User has Leave the chat');
    });
});
app.set('io', io)

server.listen(process.env.PORT | 3000, () => {
    console.log(`server is running on port ${process.env.PORT | 3000}`);

})