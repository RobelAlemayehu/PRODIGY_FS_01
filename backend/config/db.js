const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const MONGOURL =  process.env.MONGO_URL

const connectDB  = async () => {
    try{

        const conn = await mongoose.connect(MONGOURL)
        console.log('Database Connected Successfully.')

    }catch(err){
        console.log(`Connection Failed, ${err.message}`)
        process.exit(1)
    }
}

module.exports = connectDB