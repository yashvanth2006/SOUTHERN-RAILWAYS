import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

mongoose.connect('mongodb+srv://vikas111006_db_user:vikas123456@railway.teguzs1.mongodb.net/railway-department?appName=Railway')
.then(async () => {
  const hash = await bcrypt.hash('Test@1234', 10);
  const user = await mongoose.connection.collection('users').findOneAndUpdate(
    { role: 'ADEE', status: 'ACTIVE' },
    { $set: { password: hash } },
    { returnDocument: 'after' }
  );
  console.log('ADEE User:', user.pfNumber || user.email);
  process.exit(0);
});
