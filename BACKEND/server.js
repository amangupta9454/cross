const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const ExcelJS = require('exceljs');

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100,
  message: { error: 'Too many requests from this IP, please try again later.' }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Registration Schema
const registrationSchema = new mongoose.Schema({
  registrationId: { type: String, required: true, unique: true },
  event: { type: String, required: true },
  teamName: { type: String, required: true, unique: true, index: true },
  teamLeaderName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  mobile: { type: String, required: true, unique: true, index: true },
  gender: { type: String, required: true },
  college: { type: String, required: true },
  course: { type: String, required: true },
  year: { type: String, required: true },
  rollno: { type: String, required: true },
  aadhar: { type: String, required: true, unique: true, index: true },
  teamSize: { type: Number, required: true, min: 1, max: 4 },
  aadharImageHash: { type: String, required: true },
  collegeIdHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isConfirmed: { type: Boolean, default: false }
});

const Registration = mongoose.model('Registration', registrationSchema);

// Multer Setup (Memory Storage)
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory instead of disk
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf/;
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png) and PDFs are allowed'));
    }
  },
  limits: { fileSize: 300000 } // 300KB
}).fields([
  { name: 'aadharImage', maxCount: 1 },
  { name: 'collegeId', maxCount: 1 }
]);

// File Hash Calculation (Using SHA-256)
const calculateFileHash = (buffer) => {
  const hash = crypto.createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
};

// Email Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendConfirmationEmail = async (email, registrationId, teamName, teamLeaderName, mobile, event, teamSize, college, course, year, aadhar) => {
  const confirmationLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/confirm/${registrationId}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Thank You for Registering at HIET Tech Fest!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h2 style="color: #4F46E5; text-align: center;">Thank You for Registering!</h2>
        <p style="color: #333;">Dear ${teamLeaderName},<br><br>Thank you for registering with us for our Tech Fest at HIET Ghaziabad!</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #F3F4F6;">
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Field</th>
            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Details</th>
          </tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd;">Registration No</td><td style="padding: 10px; border: 1px solid #ddd;">${registrationId}</td></tr>
          <tr style="background-color: #F9FAFB;"><td style="padding: 10px; border: 1px solid #ddd;">Team Name</td><td style="padding: 10px; border: 1px solid #ddd;">${teamName}</td></tr>
          <!-- Other fields -->
        </table>
        <p style="color: #333; margin-top: 20px;">
          Please confirm your registration by clicking the link below:<br>
          <a href="${confirmationLink}" style="color: #4F46E5;">Confirm Email</a>
        </p>
        <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">Best Regards,<br>HIET Event Management Team</p>
      </div>
    `
  });
};

// Registration Route
app.post('/api/register', (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size must be 300KB or less' });
      }
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    next();
  });
}, [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('mobile').matches(/^[6-9][0-9]{9}$/).withMessage('Valid 10-digit mobile number starting with 6-9 is required'),
  body('teamName').trim().notEmpty().withMessage('Team name is required'),
  body('teamLeaderName').trim().notEmpty().withMessage('Team leader name is required'),
  body('aadhar').isLength({ min: 12, max: 12 }).withMessage('Aadhar must be 12 digits'),
  body('teamSize').isInt({ min: 1, max: 4 }).withMessage('Team size must be between 1 and 4'),
  body('registrationId').notEmpty().withMessage('Registration ID is required'),
  body('event').notEmpty().withMessage('Event is required'),
  body('gender').notEmpty().withMessage('Gender is required'),
  body('college').notEmpty().withMessage('College is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('year').notEmpty().withMessage('Year is required'),
  body('rollno').notEmpty().withMessage('Roll number is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      registrationId,
      event,
      teamName,
      teamLeaderName,
      email,
      mobile,
      gender,
      college,
      course,
      year,
      rollno,
      aadhar,
      teamSize
    } = req.body;

    const aadharImageBuffer = req.files?.['aadharImage']?.[0]?.buffer;
    const collegeIdBuffer = req.files?.['collegeId']?.[0]?.buffer;

    if (!aadharImageBuffer || !collegeIdBuffer) {
      throw new Error('Both Aadhar card and College ID images are required');
    }

    const aadharImageHash = calculateFileHash(aadharImageBuffer);
    const collegeIdHash = calculateFileHash(collegeIdBuffer);

    const existingAadhar = await Registration.findOne({ aadharImageHash });
    const existingCollegeId = await Registration.findOne({ collegeIdHash });
    if (existingAadhar || existingCollegeId) {
      throw new Error('This Aadhar card or College ID image has already been uploaded');
    }

    const existingTeamInEvent = await Registration.findOne({ event, teamName });
    if (existingTeamInEvent) {
      throw new Error(`Team '${teamName}' is already registered for '${event}'`);
    }

    const registration = new Registration({
      registrationId,
      event,
      teamName,
      teamLeaderName,
      email,
      mobile,
      gender,
      college,
      course,
      year,
      rollno,
      aadhar,
      teamSize: Number(teamSize),
      aadharImageHash,
      collegeIdHash
    });

    await registration.save();
    await sendConfirmationEmail(email, registrationId, teamName, teamLeaderName, mobile, event, teamSize, college, course, year, aadhar);

    res.status(200).json({
      message: 'Registration successful. Please check your email to confirm.',
      registrationId,
      data: {
        registrationId,
        event,
        teamName,
        teamLeaderName,
        email,
        mobile,
        gender,
        college,
        course,
        year,
        rollno,
        aadhar,
        teamSize,
        createdAt: registration.createdAt
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || error.keyValue)[0];
      return res.status(400).json({ error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` });
    }
    res.status(400).json({ error: error.message || 'An unexpected error occurred during registration' });
  }
});

// Email Confirmation Route
app.get('/api/confirm/:registrationId', async (req, res) => {
  try {
    const { registrationId } = req.params;
    const registration = await Registration.findOne({ registrationId });

    if (!registration) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    if (registration.isConfirmed) {
      return res.status(400).json({ error: 'Email already confirmed' });
    }

    registration.isConfirmed = true;
    await registration.save();
    res.status(200).json({ message: 'Email confirmed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message || 'An unexpected error occurred during confirmation' });
  }
});

// Excel Export Route
app.get('/api/export-excel', async (req, res) => {
  try {
    const registrations = await Registration.find().lean();
    if (registrations.length === 0) {
      return res.status(404).json({ error: 'No registrations found to export' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Registrations');
    worksheet.columns = [
      { header: 'Registration ID', key: 'registrationId', width: 15 },
      { header: 'Event', key: 'event', width: 20 },
      { header: 'Team Name', key: 'teamName', width: 20 },
      { header: 'Team Leader', key: 'teamLeaderName', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'College', key: 'college', width: 20 },
      { header: 'Course', key: 'course', width: 15 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Roll No', key: 'rollno', width: 15 },
      { header: 'Aadhar', key: 'aadhar', width: 15 },
      { header: 'Team Size', key: 'teamSize', width: 10 },
    ];

    registrations.forEach((reg) => {
      worksheet.addRow({
        registrationId: reg.registrationId,
        event: reg.event,
        teamName: reg.teamName,
        teamLeaderName: reg.teamLeaderName,
        email: reg.email,
        mobile: reg.mobile,
        gender: reg.gender,
        college: reg.college,
        course: reg.course,
        year: reg.year,
        rollno: reg.rollno,
        aadhar: reg.aadhar,
        teamSize: reg.teamSize
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});