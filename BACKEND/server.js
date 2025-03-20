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

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173', // Local frontend
  process.env.FRONTEND_URL // Add your hosted frontend URL in Render env vars (e.g., https://your-frontend.onrender.com)
].filter(Boolean); // Remove undefined/null values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman) or if origin is in allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  bufferTimeoutMS: 5000 // 20 seconds timeout
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if MongoDB fails to connect
  });

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

const Registration = mongoose.model('Registration', registrationSchema);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Created uploads directory');
}

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
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
      cb(null, true);
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
    const confirmationLink = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/confirm/${registrationId}`;
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
          <!-- Email content remains the same, just updating the confirmation link -->
          <p style="color: #333; margin-top: 20px;">
            Please confirm your registration by clicking the link below:
            <br>
            <a href="${confirmationLink}" style="color: #4F46E5; text-decoration: none; font-weight: bold;">Confirm Email</a>
          </p>
          <!-- Rest of the email HTML omitted for brevity -->
        </div>
      `
    });
    console.log(`Confirmation email sent to ${email}`);
  } catch (emailError) {
    console.error('Email sending failed:', emailError);
    throw new Error('Failed to send confirmation email');
  }
};

// Excel Generation Function (unchanged for brevity, but note file persistence issue below)
const generateExcel = async () => {
  try {
    console.log('Fetching registrations...');
    const registrations = await Registration.find().lean();
    if (registrations.length === 0) {
      console.log('No registrations found to export.');
      return;
    }
    const filePath = path.join(__dirname, 'exports', 'registrations.xlsx');
    const workbook = new ExcelJS.Workbook();
    let worksheet;

    if (fs.existsSync(filePath)) {
      await workbook.xlsx.readFile(filePath);
      worksheet = workbook.getWorksheet('Registrations');
      worksheet.spliceRows(2, worksheet.rowCount - 1);
    } else {
      worksheet = workbook.addWorksheet('Registrations');
      worksheet.columns = [
        { header: 'Registration ID', key: 'registrationId', width: 15 },
        // Rest of columns unchanged
      ];
    }

    registrations.forEach((reg, index) => {
      const rowNum = index + 2;
      worksheet.getRow(rowNum).height = 100;
      worksheet.addRow({
        registrationId: reg.registrationId,
        event: reg.event,
        // Rest of fields unchanged
      });
      // Image embedding logic unchanged
    });

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
  // Validation rules unchanged
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
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

// Email Confirmation Route (unchanged)
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

// Create exports directory
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