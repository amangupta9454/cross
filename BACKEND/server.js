const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
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
  max: 100, // 100 requests per IP
  message: { error: 'Too many requests from this IP, please try again later.' }
}));

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  aadharImage: { type: String, required: true },
  aadharImageHash: { type: String, required: true },
  collegeId: { type: String, required: true },
  collegeIdHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isConfirmed: { type: Boolean, default: false }
});

registrationSchema.index({ teamName: 1 }, { unique: true });
registrationSchema.index({ email: 1 }, { unique: true });
registrationSchema.index({ mobile: 1 }, { unique: true });
registrationSchema.index({ aadhar: 1 }, { unique: true });
registrationSchema.index({ event: 1, teamName: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
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

// File Hash Calculation
const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
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
  try {
    const confirmationLink = `http://localhost:5000/api/confirm/${registrationId}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank You for Registering at HIET Tech Fest!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #4F46E5; text-align: center;">Thank You for Registering!</h2>
          <p style="color: #333;">
            Dear ${teamLeaderName},<br><br>
            Thank you for registering with us for our Tech Fest at HIET Ghaziabad! We are excited to have your team participate. Below are your registration details:
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #F3F4F6;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Field</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Details</th>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Registration No</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${registrationId}</td>
            </tr>
            <tr style="background-color: #F9FAFB;">
              <td style="padding: 10px; border: 1px solid #ddd;">Team Name</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${teamName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Team Leader Name</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${teamLeaderName}</td>
            </tr>
            <tr style="background-color: #F9FAFB;">
              <td style="padding: 10px; border: 1px solid #ddd;">Email ID</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Mobile No</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${mobile}</td>
            </tr>
            <tr style="background-color: #F9FAFB;">
              <td style="padding: 10px; border: 1px solid #ddd;">Event Type</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${event}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Team Size</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${teamSize}</td>
            </tr>
            <tr style="background-color: #F9FAFB;">
              <td style="padding: 10px; border: 1px solid #ddd;">College</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${college}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Course</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${course}</td>
            </tr>
            <tr style="background-color: #F9FAFB;">
              <td style="padding: 10px; border: 1px solid #ddd;">Year</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${year}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Aadhar No</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${aadhar}</td>
            </tr>
          </table>

          <p style="color: #333; margin-top: 20px;">
            Please confirm your registration by clicking the link below:
            <br>
            <a href="${confirmationLink}" style="color: #4F46E5; text-decoration: none; font-weight: bold;">Confirm Email</a>
          </p>

          <h3 style="color: #4F46E5; margin-top: 20px;">Event Rules</h3>
          <ul style="color: #333; padding-left: 20px;">
            <li>All participants must carry a valid ID and their registration receipt on the event day.</li>
            <li>Teams must arrive 30 minutes prior to the event start time for check-in.</li>
            <li>No changes to team composition or size are allowed after registration.</li>
            <li>Participants must adhere to the event schedule and guidelines provided on-site.</li>
            <li>Any form of malpractice or violation of rules will result in disqualification.</li>
          </ul>

          <p style="color: #333; margin-top: 20px;">
            We look forward to seeing you at the Tech Fest! For any queries, feel free to contact us at 
            <a href="mailto:support@hietghaziabad.com" style="color: #4F46E5;">support@hietghaziabad.com</a>.
          </p>
          
          <p style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
            Best Regards,<br>
            HIET Event Management Team
          </p>
        </div>
      `
    });
    console.log(`Confirmation email sent to ${email}`);
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    throw new Error('Failed to send confirmation email');
  }
};

// Excel Generation Function
const generateExcel = async () => {
  try {
    console.log('Fetching registrations...');
    const registrations = await Registration.find().lean(); // Fetch all registrations
    if (registrations.length === 0) {
      console.log('No registrations found to export.');
      return;
    }

    console.log(`Found ${registrations.length} registrations`);

    const filePath = path.join(__dirname, 'exports', 'registrations.xlsx');
    const workbook = new ExcelJS.Workbook();
    let worksheet;

    // Check if the file already exists
    if (fs.existsSync(filePath)) {
      // Load existing workbook
      await workbook.xlsx.readFile(filePath);
      worksheet = workbook.getWorksheet('Registrations');
      // Clear existing rows (except header)
      worksheet.spliceRows(2, worksheet.rowCount - 1);
    } else {
      // Create new workbook and worksheet
      worksheet = workbook.addWorksheet('Registrations');
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
        { header: 'Aadhar Image', key: 'aadharImage', width: 20 },
        { header: 'College ID Image', key: 'collegeId', width: 20 },
      ];
      worksheet.getRow(1).height = 20; // Header row height
    }

    // Set row height for images
    const imageHeight = 100;

    // Add all registrations to the worksheet
    registrations.forEach((reg, index) => {
      const rowNum = index + 2; // Start from row 2 (after header)
      worksheet.getRow(rowNum).height = imageHeight;

      // Add row data
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
        teamSize: reg.teamSize,
        aadharImage: '', // Placeholder for image
        collegeId: ''    // Placeholder for image
      });

      // Embed Aadhar Image
      if (fs.existsSync(reg.aadharImage)) {
        console.log(`Embedding Aadhar image: ${reg.aadharImage}`);
        const aadharImageId = workbook.addImage({
          filename: reg.aadharImage,
          extension: path.extname(reg.aadharImage).slice(1)
        });
        worksheet.addImage(aadharImageId, {
          tl: { col: 13, row: rowNum - 1 }, // Column N (14th column, 0-based index 13)
          ext: { width: 100, height: imageHeight },
          editAs: 'oneCell'
        });
      } else {
        console.log(`Aadhar image not found: ${reg.aadharImage}`);
      }

      // Embed College ID Image
      if (fs.existsSync(reg.collegeId)) {
        console.log(`Embedding College ID image: ${reg.collegeId}`);
        const collegeIdImageId = workbook.addImage({
          filename: reg.collegeId,
          extension: path.extname(reg.collegeId).slice(1)
        });
        worksheet.addImage(collegeIdImageId, {
          tl: { col: 14, row: rowNum - 1 }, // Column O (15th column, 0-based index 14)
          ext: { width: 100, height: imageHeight },
          editAs: 'oneCell'
        });
      } else {
        console.log(`College ID image not found: ${reg.collegeId}`);
      }
    });

    // Save the updated workbook
    await workbook.xlsx.writeFile(filePath);
    console.log(`Excel file updated: ${filePath}`);
  } catch (error) {
    console.error('Error generating/updating Excel:', error);
  }
};

// Registration Route
app.post('/api/register', (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size must be 300KB or less' });
      }
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    console.log('Post-upload req.body:', req.body);
    console.log('Post-upload req.files:', req.files);
    next();
  });
}, [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('mobile').isMobilePhone('en-IN').withMessage('Invalid mobile number'),
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
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    console.log('Processed req.body:', req.body);
    console.log('Processed req.files:', req.files);

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

    const aadharImage = req.files?.['aadharImage']?.[0]?.path;
    const collegeId = req.files?.['collegeId']?.[0]?.path;

    if (!aadharImage || !collegeId) {
      return res.status(400).json({ error: 'Both Aadhar card and College ID images are required' });
    }

    const aadharImageHash = await calculateFileHash(aadharImage);
    const collegeIdHash = await calculateFileHash(collegeId);

    const existingAadhar = await Registration.findOne({ aadharImageHash });
    const existingCollegeId = await Registration.findOne({ collegeIdHash });
    if (existingAadhar) {
      return res.status(400).json({ error: 'This Aadhar card image has already been uploaded' });
    }
    if (existingCollegeId) {
      return res.status(400).json({ error: 'This College ID image has already been uploaded' });
    }

    const existingTeamInEvent = await Registration.findOne({ event, teamName });
    if (existingTeamInEvent) {
      return res.status(400).json({ error: `Team '${teamName}' is already registered for '${event}'` });
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
      aadharImage,
      aadharImageHash,
      collegeId,
      collegeIdHash
    });

    await registration.save();
    await sendConfirmationEmail(email, registrationId, teamName, teamLeaderName, mobile, event, teamSize, college, course, year, aadhar);
    
    // Generate/update Excel file after registration
    console.log('Generating/updating Excel file after registration...');
    await generateExcel();

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
        aadharImage: path.basename(aadharImage),
        collegeId: path.basename(collegeId),
        createdAt: registration.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || error.keyValue)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }
    res.status(500).json({ error: error.message || 'An unexpected error occurred during registration' });
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
    console.error('Confirmation error:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred during confirmation' });
  }
});

// Create exports directory if it doesn't exist
const exportsDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir);
  console.log('Created exports directory');
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});