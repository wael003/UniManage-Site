# UniManage-Site
 
 # folder back 
npm install
node server.js

# folder front
npm install
npm run dev

#.env
you need to identify this:
PORT , //Server port
DBURL , //MONGO_DB URL
JWT_SECRET ,
NODE_ENV =  'production',
NODEMILER_PORT, //like 587 
NODEMILER_USER, // this is the email you use to send messages
<<<<<<< HEAD
NODEMILER_PASSKEY, // this is the passkey you get for the email
=======

## to register a user in postman use after run the back-end server:
POST:localhost:3000/register
body:
{
"name" : "Put Name here",
"email" : "email",
"password": "your password",
"departmentCategory" : "IT" //for example
"role" : "admin"
 }
then you can login to the system.


