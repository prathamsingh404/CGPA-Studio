// AcademicPlan Controller - Full MongoDB CRUD Operations
import mongoose from 'mongoose';
import AcademicPlan from '../models/academicPlan.model.js';

/**
 * Create a new academic plan for the logged-in student
 * POST /api/plans
 */
export async function createPlan(req, res, next) {
  try {
    const {
      name,
      currentCGPA,
      completedCredits,
      targetCGPA,
      semester,
      programId,
      relativePreset,
      mean,
      sd,
      courses
    } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a name for this academic plan (e.g., "Semester 3 Target")'
      });
    }

    // Validate courses if provided
    const validCourses = Array.isArray(courses)
      ? courses.map(c => ({
          code: c.code || '',
          name: c.name || 'Untitled Course',
          credits: Number(c.credits) || 3,
          type: c.type || 'Core',
          internalMarks: Number(c.internalMarks) || 0,
          maxInternal: Number(c.maxInternal) || 50,
          maxEndSem: Number(c.maxEndSem) || 50,
          endSemMarks: Number(c.endSemMarks) || 0
        }))
      : [];

    const plan = await AcademicPlan.create({
      user: req.user._id,
      name: name.trim(),
      currentCGPA: currentCGPA !== undefined ? Number(currentCGPA) : 7.0,
      completedCredits: completedCredits !== undefined ? Number(completedCredits) : 0,
      targetCGPA: targetCGPA !== undefined ? Number(targetCGPA) : 8.5,
      semester: semester !== undefined ? Number(semester) : 3,
      programId: programId || 'cse',
      relativePreset: relativePreset || 'moderate',
      mean: mean !== undefined ? Number(mean) : 62,
      sd: sd !== undefined ? Number(sd) : 14,
      courses: validCourses
    });

    res.status(201).json({
      success: true,
      message: 'Academic plan created successfully',
      data: plan
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all academic plans belonging to the authenticated student
 * GET /api/plans
 */
export async function getPlans(req, res, next) {
  try {
    // Only return documents belonging to this user
    const plans = await AcademicPlan.find({ user: req.user._id }).sort({
      updatedAt: -1
    });

    res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single academic plan by ID
 * GET /api/plans/:id
 */
export async function getPlanById(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid academic plan ID format: ${id}`
      });
    }

    const plan = await AcademicPlan.findOne({
      _id: id,
      user: req.user._id
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Academic plan not found or you do not have permission to access it'
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing academic plan by ID
 * PATCH /api/plans/:id
 */
export async function updatePlan(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid academic plan ID format: ${id}`
      });
    }

    // Verify ownership first
    const existingPlan = await AcademicPlan.findOne({
      _id: id,
      user: req.user._id
    });

    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        message: 'Academic plan not found or you do not have permission to modify it'
      });
    }

    // Allowed update fields
    const allowedUpdates = [
      'name',
      'currentCGPA',
      'completedCredits',
      'targetCGPA',
      'semester',
      'programId',
      'relativePreset',
      'mean',
      'sd',
      'courses'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        existingPlan[field] = req.body[field];
      }
    });

    const updatedPlan = await existingPlan.save();

    res.status(200).json({
      success: true,
      message: 'Academic plan updated successfully',
      data: updatedPlan
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete an academic plan by ID
 * DELETE /api/plans/:id
 */
export async function deletePlan(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid academic plan ID format: ${id}`
      });
    }

    const deletedPlan = await AcademicPlan.findOneAndDelete({
      _id: id,
      user: req.user._id
    });

    if (!deletedPlan) {
      return res.status(404).json({
        success: false,
        message: 'Academic plan not found or you do not have permission to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Academic plan deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

