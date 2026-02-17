const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly point to the backend .env file (now in same directory)
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('Loading environment from:', envPath);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Defined' : 'Not Defined');

const run = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.error('Error: MONGO_URI is missing. Check your .env file.');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully');

        const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            role: String,
            companyId: mongoose.Schema.Types.ObjectId,
            empId: String
        });
        const User = mongoose.model('User', userSchema, 'users');

        const employees = await User.find({ role: 'EMPLOYEE', empId: { $exists: false } });
        console.log(`Found ${employees.length} employees missing empId.`);

        for (const emp of employees) {
            const count = await User.countDocuments({
                companyId: emp.companyId,
                role: 'EMPLOYEE',
                empId: { $exists: true }
            });

            const nextNum = count + 1;
            const newId = `EMP-${String(nextNum).padStart(3, '0')}`;

            await User.updateOne({ _id: emp._id }, { $set: { empId: newId } });
            console.log(`Updated ${emp.name} (${emp.email}) -> ${newId}`);
        }

        console.log('Migration Completed.');
        process.exit(0);
    } catch (err) {
        console.error('Migration Failed:', err);
        process.exit(1);
    }
};

run();
