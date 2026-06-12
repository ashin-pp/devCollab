const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/devcollab').then(async () => {
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateOne(
        { _id: new mongoose.Types.ObjectId('6a1de15edb488c0b36b3cb71') }, 
        { $set: { email: 'devcollab.test.user@gmail.com' } }
    );
    console.log('Update Result:', result);
    mongoose.disconnect();
}).catch(console.error);
