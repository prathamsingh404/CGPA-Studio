// AcademicPlan Mongoose Model
import mongoose from 'mongoose';

// Subdocument schema for individual courses inside an academic plan
const courseItemSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      trim: true,
      default: ''
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true
    },
    credits: {
      type: Number,
      required: [true, 'Course credits are required'],
      min: [0, 'Credits cannot be negative'],
      max: [20, 'Credits cannot exceed 20 per course'],
      default: 3
    },
    type: {
      type: String,
      trim: true,
      default: 'Core'
    },
    internalMarks: {
      type: Number,
      min: [0, 'Internal marks cannot be negative'],
      max: [100, 'Internal marks cannot exceed 100'],
      default: 0
    },
    maxInternal: {
      type: Number,
      min: [1, 'Max internal must be at least 1'],
      max: [100, 'Max internal cannot exceed 100'],
      default: 50
    },
    maxEndSem: {
      type: Number,
      min: [0, 'Max end-sem cannot be negative'],
      max: [100, 'Max end-sem cannot exceed 100'],
      default: 50
    },
    endSemMarks: {
      type: Number,
      min: [0, 'End-sem marks cannot be negative'],
      max: [100, 'End-sem marks cannot exceed 100'],
      default: 0
    }
  },
  { _id: false }
);

// Main schema for student academic plans
const academicPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Academic plan must belong to a student user'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a name for this academic plan'],
      trim: true,
      maxlength: [100, 'Plan name cannot exceed 100 characters'],
      default: 'My Academic Plan'
    },
    currentCGPA: {
      type: Number,
      min: [0, 'Current CGPA cannot be negative'],
      max: [10, 'Current CGPA cannot exceed 10.0'],
      default: 7.0
    },
    completedCredits: {
      type: Number,
      min: [0, 'Completed credits cannot be negative'],
      max: [250, 'Completed credits cannot exceed 250'],
      default: 0
    },
    targetCGPA: {
      type: Number,
      min: [0, 'Target CGPA cannot be negative'],
      max: [10, 'Target CGPA cannot exceed 10.0'],
      default: 8.5
    },
    semester: {
      type: Number,
      min: [1, 'Semester must be between 1 and 8'],
      max: [10, 'Semester cannot exceed 10'],
      default: 3
    },
    programId: {
      type: String,
      trim: true,
      default: 'cse'
    },
    relativePreset: {
      type: String,
      trim: true,
      default: 'moderate'
    },
    mean: {
      type: Number,
      min: [0, 'Class mean cannot be negative'],
      max: [100, 'Class mean cannot exceed 100'],
      default: 62
    },
    sd: {
      type: Number,
      min: [1, 'Standard deviation must be at least 1'],
      max: [50, 'Standard deviation cannot exceed 50'],
      default: 14
    },
    courses: {
      type: [courseItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const AcademicPlan = mongoose.model('AcademicPlan', academicPlanSchema);
export default AcademicPlan;

