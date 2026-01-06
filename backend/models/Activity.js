import mongoose from 'mongoose';

const stepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    required: true
  },
  imageUrl: String,
  codeExample: String,

  expectedResult: String,
  hints: [String],
  pairs: [{
    itemA: {
      type: { type: String, enum: ['text', 'image'], default: 'text' },
      content: String
    },
    itemB: {
      type: { type: String, enum: ['text', 'image'], default: 'text' },
      content: String
    }
  }]
});

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  steps: [stepSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  deadline: Date,
  status: {
    type: String,
    enum: ['draft', 'published', 'completed'],
    default: 'draft'
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

activitySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Activity', activitySchema);