const mongoose = require('mongoose');
require('dotenv').config();

class Database {
    constructor(){
        this.URL = process.env.DBURL
    }
    connect(){
        mongoose.connect(this.URL).then(()=>{
            console.log('database connected successfully!');
        })
        .catch(()=>{
            console.log('faild to connect!!')
        })
    }
}
const obj = new Database();
obj.connect();
module.exports = obj;
