import POSHComplaint from '../models/POSHComplaint.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Submit POSH Complaint
export const submitComplaint = async (req, res) => {
  try {
    const {
      complaintType,
      incidentDate,
      incidentTime,
      incidentLocation,
      accusedPerson,
      description,
      isAnonymous
    } = req.body;

    const complainantId = req.user.employeeProfile?._id;
    if (!complainantId) {
      return res.status(400).json({ success: false, message: 'Employee profile required to submit complaint' });
    }

    // Generate unique complaint ID: POSH-YYYY-RANDOM
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `POSH-${year}-${random}`;

    // Handle evidence file if uploaded
    let evidenceUrl = '';
    if (req.file) {
      evidenceUrl = req.file.path;
    }

    const complaint = await POSHComplaint.create({
      complaintId,
      complaintType,
      incidentDate: new Date(incidentDate),
      incidentTime,
      incidentLocation,
      accusedPerson,
      description,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      complainant: complainantId, // Stored securely in database for employee dashboard tracking
      evidence: evidenceUrl,
      timeline: [{
        status: 'New',
        remarks: 'Complaint submitted by employee',
        updatedBy: 'System'
      }]
    });

    // Notify IC Members
    const icUsers = await User.find({ role: 'Internal Committee' });
    for (const icUser of icUsers) {
      await Notification.create({
        recipient: icUser._id,
        title: 'New POSH Case Submitted',
        message: `A new ${isAnonymous === 'true' || isAnonymous === true ? 'Anonymous' : 'Normal'} POSH complaint has been received. ID: ${complaintId}`
      });
    }

    // Notify Admin (ONLY if NOT anonymous)
    if (isAnonymous !== 'true' && isAnonymous !== true) {
      const admins = await User.find({ role: 'Admin' });
      for (const admin of admins) {
        await Notification.create({
          recipient: admin._id,
          title: 'New POSH Complaint Filed',
          message: `A new POSH complaint (ID: ${complaintId}) has been filed by an employee.`
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'POSH complaint submitted successfully',
      data: {
        complaintId: complaint.complaintId,
        status: complaint.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get complaints filed by the logged-in employee (Employee Portal tracking)
export const getEmployeeComplaints = async (req, res) => {
  try {
    const employeeId = req.user.employeeProfile?._id;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'No employee profile associated with this user' });
    }

    // Find all complaints filed by this employee
    // Return only public status and details, omitting any Internal Committee investigation details
    const complaints = await POSHComplaint.find({ complainant: employeeId })
      .select('complaintId complaintType status incidentDate incidentTime incidentLocation accusedPerson evidence description createdAt updatedAt timeline')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
