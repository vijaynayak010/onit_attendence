import mongoose from 'mongoose';

const uri = "mongodb+srv://vijay:vijay6309@cluster0.e5lrxff.mongodb.net/";

const inspect = async () => {
  try {
    const conn = await mongoose.connect(uri);
    const admin = conn.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log("Databases on this cluster:");
    dbs.databases.forEach(db => console.log(` - ${db.name}`));
    
    // Check 'attendance' DB
    const attendDb = conn.connection.useDb('attendance');
    const countAttrib = await attendDb.collection('employees').countDocuments({ email: 'admin@onitindia.com' });
    console.log(`\nIn 'attendance' -> 'employees' has admin: ${countAttrib > 0}`);

    process.exit(0);
  } catch (err) {
    console.error("Error connecting/listing:", err);
    process.exit(1);
  }
};

inspect();
