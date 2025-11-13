import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    select: false // Don't include by default in queries
  },
}, { timestamps: true });

// Add indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ createdAt: -1 });

export default mongoose.model('User', UserSchema);





