import POSHComplaint from '../models/POSHComplaint.js';
import InvestigationNote from '../models/InvestigationNote.js';
import Notification from '../models/Notification.js';

// Get all cases (IC members only)
export const getICCases = async (req, res) => {
  try {
    const complaints = await POSHComplaint.find().sort({ createdAt: -1 });

    // Populate complainant details for all cases (normal and anonymous) in IC portal
    const sanitizedComplaints = await Promise.all(complaints.map(async (complaint) => {
      await complaint.populate({
        path: 'complainant',
        populate: { path: 'department', select: 'name code' }
      });
      return complaint.toObject();
    }));

    res.status(200).json({ success: true, data: sanitizedComplaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get case details
export const getICCaseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await POSHComplaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    await complaint.populate({
      path: 'complainant',
      populate: { path: 'department', select: 'name code' }
    });
    const obj = complaint.toObject();

    // Get private investigation notes
    let notes = await InvestigationNote.findOne({ complaint: id });
    if (!notes) {
      // Create empty notes if they don't exist yet
      notes = await InvestigationNote.create({
        complaint: id,
        updatedBy: req.user._id
      });
    }

    res.status(200).json({
      success: true,
      data: {
        case: obj,
        investigationNotes: notes
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start Investigation
export const startInvestigation = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await POSHComplaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    complaint.status = 'Investigation';
    complaint.timeline.push({
      status: 'Investigation',
      remarks: 'Internal Committee started active investigation.',
      updatedBy: 'Internal Committee'
    });

    await complaint.save();

    res.status(200).json({ success: true, message: 'Investigation started', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign Investigator
export const assignInvestigator = async (req, res) => {
  try {
    const { id } = req.params;
    const { investigatorName } = req.body;

    const complaint = await POSHComplaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    complaint.assignedInvestigator = investigatorName;
    complaint.status = 'Assigned';
    complaint.timeline.push({
      status: 'Assigned',
      remarks: `Investigator assigned: ${investigatorName}`,
      updatedBy: 'Internal Committee'
    });

    await complaint.save();

    res.status(200).json({ success: true, message: 'Investigator assigned successfully', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Investigation Notes
export const updateInvestigationNotes = async (req, res) => {
  try {
    const { id } = req.params; // ID of the case/complaint
    const { observations, evidenceSummary, progress, recommendation, remarks } = req.body;

    let notes = await InvestigationNote.findOne({ complaint: id });
    if (!notes) {
      notes = new InvestigationNote({
        complaint: id,
        updatedBy: req.user._id
      });
    }

    if (observations !== undefined) notes.observations = observations;
    if (evidenceSummary !== undefined) notes.evidenceSummary = evidenceSummary;
    if (progress !== undefined) notes.progress = progress;
    if (recommendation !== undefined) notes.recommendation = recommendation;
    if (remarks !== undefined) notes.remarks = remarks;
    notes.updatedBy = req.user._id;

    await notes.save();

    res.status(200).json({ success: true, message: 'Investigation notes updated successfully', data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Witness Statement (Demo)
export const addWitnessStatement = async (req, res) => {
  try {
    const { id } = req.params; // Case ID
    const { witnessName, statement } = req.body;

    const notes = await InvestigationNote.findOne({ complaint: id });
    if (!notes) {
      return res.status(404).json({ success: false, message: 'Investigation record not found for this case' });
    }

    notes.witnessStatements.push({
      witnessName,
      statement,
      date: new Date()
    });

    await notes.save();

    res.status(200).json({ success: true, message: 'Witness statement added successfully', data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Close Case
export const closeCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome, closingRemarks, recommendation } = req.body;

    const complaint = await POSHComplaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    complaint.status = 'Closed';
    complaint.outcome = outcome;
    complaint.closingRemarks = closingRemarks;
    complaint.recommendation = recommendation;
    complaint.closureDate = new Date();
    complaint.timeline.push({
      status: 'Closed',
      remarks: `Case closed. Outcome: ${outcome}`,
      updatedBy: 'Internal Committee'
    });

    await complaint.save();

    res.status(200).json({ success: true, message: 'Case closed successfully', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject Case
export const rejectCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { closingRemarks } = req.body;

    const complaint = await POSHComplaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    complaint.status = 'Rejected';
    complaint.closingRemarks = closingRemarks;
    complaint.timeline.push({
      status: 'Rejected',
      remarks: `Case rejected. Reason: ${closingRemarks}`,
      updatedBy: 'Internal Committee'
    });

    await complaint.save();

    res.status(200).json({ success: true, message: 'Case rejected successfully', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
