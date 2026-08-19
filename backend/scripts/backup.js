import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/railway";
const BACKUP_DIR = path.join(process.cwd(), 'backup', Date.now().toString());

async function backupDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for backup.');
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const collections = await mongoose.connection.db.collections();
    
    for (const collection of collections) {
      const data = await collection.find({}).toArray();
      const filePath = path.join(BACKUP_DIR, `${collection.collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Backed up ${data.length} documents from ${collection.collectionName}`);
    }

    console.log(`Backup completed successfully at ${BACKUP_DIR}`);
    process.exit(0);
  } catch (err) {
    console.error('Backup failed:', err);
    process.exit(1);
  }
}

backupDB();
