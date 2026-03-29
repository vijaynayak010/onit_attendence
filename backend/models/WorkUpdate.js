import mongoose from 'mongoose';

const workUpdateSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    taskTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries per employee
workUpdateSchema.index({ employeeId: 1, date: -1 });

const WorkUpdate = mongoose.model('WorkUpdate', workUpdateSchema);

export default WorkUpdate;
