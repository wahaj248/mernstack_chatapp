const mongoose = require('mongoose')

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
            .then(() => {
                console.log('Connected to Database');
            })
            .catch((error) => {
                console.log('Error connecting to DB:', error);
            });

    } catch (error) {
        console.log("Something is wrong ", error)
    }
}

module.exports = connectDB;