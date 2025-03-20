import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import hietlogo from "/hietlogo.png";
import { FaYoutube, FaWhatsapp, FaLinkedin, FaInstagram, FaEnvelope, FaArrowUp } from 'react-icons/fa';

const Registration = () => {
  const [formData, setFormData] = useState({
    registrationId: uuidv4(),
    event: '',
    teamName: '',
    teamLeaderName: '',
    email: '',
    mobile: '',
    gender: '',
    college: '',
    course: '',
    year: '',
    rollno: '',
    aadhar: '',
    teamSize: '',
    aadharImage: null,
    collegeId: null
  });

  const [errors, setErrors] = useState({});
  const [receiptData, setReceiptData] = useState(null);
  const aadharInputRef = useRef(null);
  const collegeIdInputRef = useRef(null);

  const MAX_FILE_SIZE = 300000; // 300KB in bytes

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (file && file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          [name]: 'File size must be 300KB or less'
        }));
        return;
      }
      setFormData({ ...formData, [name]: file });
      setErrors((prev) => ({ ...prev, [name]: '' }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDrop = (e, name) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({
          ...prev,
          [name]: 'File size must be 300KB or less'
        }));
        return;
      }
      setFormData({ ...formData, [name]: file });
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.event) tempErrors.event = 'Event is required';
    if (!formData.teamName.trim()) tempErrors.teamName = 'Team name is required';
    if (!formData.teamLeaderName.trim()) tempErrors.teamLeaderName = 'Team leader name is required';
    if (!formData.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) tempErrors.email = 'Valid email is required';
    if (!formData.mobile.match(/^[6-9][0-9]{9}$/)) tempErrors.mobile = 'Valid 10-digit mobile number is required';
    if (!formData.gender) tempErrors.gender = 'Gender is required';
    if (!formData.college) tempErrors.college = 'College is required';
    if (!formData.course) tempErrors.course = 'Course is required';
    if (!formData.year) tempErrors.year = 'Year is required';
    if (!formData.rollno.trim()) tempErrors.rollno = 'Roll number is required';
    if (!formData.aadhar.match(/^[0-9]{12}$/)) tempErrors.aadhar = 'Valid 12-digit Aadhar number is required';
    if (!formData.teamSize || formData.teamSize < 1 || formData.teamSize > 4) {
      tempErrors.teamSize = 'Team size must be between 1 and 4';
    }
    if (!formData.aadharImage) tempErrors.aadharImage = 'Aadhar card upload is required';
    if (!formData.collegeId) tempErrors.collegeId = 'College ID upload is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log('Frontend validation failed:', errors);
      return;
    }

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, value);
    });

    console.log('Submitting form data:');
    for (let [key, value] of submissionData.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    try {
      const response = await fetch('techfest-iiv0xiqxt-amangupta9454s-projects.vercel.app/api/register', {
        method: 'POST',
        body: submissionData,
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        setReceiptData(data.data);
        // Do not reset form here; reset happens after print
      } else {
        const errorMessage = data.errors
          ? data.errors.map((err) => err.msg).join(', ')
          : data.error || 'Unknown server error';
        console.error('Server error:', errorMessage);
        alert('Registration failed: ' + errorMessage);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('An error occurred: ' + (error.message || 'Network or server unavailable'));
    }
  };

  const handlePrint = (e) => {
    e.preventDefault();
    window.print();
    // Reset form and close receipt after a short delay to allow print dialog to complete
    setTimeout(() => {
      setReceiptData(null);
      setFormData({
        registrationId: uuidv4(),
        event: '',
        teamName: '',
        teamLeaderName: '',
        email: '',
        mobile: '',
        gender: '',
        college: '',
        course: '',
        year: '',
        rollno: '',
        aadhar: '',
        teamSize: '',
        aadharImage: null,
        collegeId: null
      });
      setErrors({});
      if (aadharInputRef.current) aadharInputRef.current.value = '';
      if (collegeIdInputRef.current) collegeIdInputRef.current.value = '';
    }, 200); // 500ms delay to ensure print dialog closes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .receipt-container, .receipt-container * {
              visibility: visible;
            }
            .receipt-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              background: white;
              color: black;
              padding: 20px;
              box-sizing: border-box;
            }
            .no-print {
              display: none;
            }
            .receipt-table th, .receipt-table td {
              border: 1px solid #000;
            }
          }
        `}
      </style>

      <div className="absolute inset-0 no-print">
        <div className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full -top-32 -left-32 sm:-top-48 sm:-left-48 animate-pulse"></div>
        <div className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-pink-500/20 rounded-full -bottom-32 -right-32 sm:-bottom-48 sm:-right-48 animate-pulse delay-1000"></div>
      </div>

      {!receiptData ? (
        <div className="w-full max-w-md sm:max-w-3xl lg:max-w-4xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl pt-24 sm:p-10 lg:p-20 border border-white/30 relative z-0 transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform duration-500 no-print">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-6 sm:mb-8 lg:mb-10 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent animate-text">
            Event Registration
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">Event</label>
                <select
                  name="event"
                  value={formData.event}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 appearance-none text-sm sm:text-base"
                >
                  <option value="">Select Event</option>
                  <option value="robo-race">ROBO RACE</option>
                  <option value="project-exhibition">PROJECT EXHIBITION</option>
                  <option value="cultural-event">CULTURAL EVENT</option>
                  <option value="rangoli">RANGOLI COMPETITION</option>
                  <option value="dance">DANCE COMPETITION</option>
                  <option value="code-puzzle">CODE PUZZLE</option>
                  <option value="nukkad-natak">NUKKAD NATAK</option>
                  <option value="singing">SINGING COMPETITION</option>
                  <option value="ad-mad">AD-MAD SHOW</option>
                </select>
                <div className="absolute right-3 sm:right-4 top-10 sm:top-12 pointer-events-none text-gray-500">▼</div>
                {errors.event && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.event}</p>}
              </div>

              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">Team Name</label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter team name"
                />
                {errors.teamName && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.teamName}</p>}
              </div>

              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">Team Leader</label>
                <input
                  type="text"
                  name="teamLeaderName"
                  value={formData.teamLeaderName}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter leader name"
                />
                {errors.teamLeaderName && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.teamLeaderName}</p>}
              </div>

              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter email"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.email}</p>}
              </div>

              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter mobile number"
                />
                {errors.mobile && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.mobile}</p>}
              </div>

              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 appearance-none text-sm sm:text-base"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute right-3 sm:right-4 top-10 sm:top-12 pointer-events-none text-gray-500">▼</div>
                {errors.gender && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.gender}</p>}
              </div>

              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">College</label>
                <select
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 appearance-none text-sm sm:text-base"
                >
                  <option value="">Select College</option>
                  <option value="ABESIT">ABESIT</option>
                  <option value="ABES Business School">ABES Business School</option>
                  <option value="ABES-EC">ABES-EC</option>
                  <option value="Adhunik College of Engineering">Adhunik College of Engineering</option>
                  <option value="Ajay Kumar Garg Engineering College">Ajay Kumar Garg Engineering College</option>
                  <option value="Babu Banarasi Das Institute of Technology - BBDIT">Babu Banarasi Das Institute of Technology - BBDIT</option>
                  <option value="Bhagwati Institute of Technology & Science">Bhagwati Institute of Technology & Science</option>
                  <option value="Galgotias College of Engineering and Technology">Galgotias College of Engineering and Technology</option>
                  <option value="Galgotias University">Galgotias University</option>
                  <option value="GL Bajaj College">GL Bajaj College</option>
                  <option value="H.R. Group of Institutions">H.R. Group of Institutions</option>
                  <option value="HI-Tech Institute of Engineering and Technology">HI-Tech Institute of Engineering and Technology</option>
                  <option value="HLM">HLM</option>
                  <option value="HR Institute of Pharmacy">HR Institute of Pharmacy</option>
                  <option value="I.T.S Dental College">I.T.S Dental College</option>
                  <option value="IMS Engineering College">IMS Engineering College</option>
                  <option value="Inderprastha Engineering College">Inderprastha Engineering College</option>
                  <option value="INMANTEC Institutions">INMANTEC Institutions</option>
                  <option value="JSS Noida">JSS Noida</option>
                  <option value="KIET Group Of Institutions">KIET Group Of Institutions</option>
                  <option value="dps-ghaziabad">Delhi Public School (DPS), Ghaziabad</option>
                  <option value="st-marys-school">St. Marys Convent School</option>
                  <option value="sanjay-gandhi-school">Sanjay Gandhi Memorial Public School</option>
                  <option value="kendriya-vidyalaya-ghaziabad">Kendriya Vidyalaya, Ghaziabad</option>
                  <option value="modern-school-ghaziabad">Modern School, Ghaziabad</option>
                  <option value="neptune-college-of-engineering">Neptune College of Engineering</option>
                  <option value="rawal-international-school">Rawal International School</option>
                  <option value="ghaziabad-public-school">Ghaziabad Public School</option>
                </select>
                <div className="absolute right-3 sm:right-4 top-10 sm:top-12 pointer-events-none text-gray-500">▼</div>
                {errors.college && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.college}</p>}
              </div>

              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">Course</label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 appearance-none text-sm sm:text-base"
                >
                  <option value="">Select Course</option>
                  <option value="btech">B.tech</option>
                  <option value="bba">B.B.A</option>
                  <option value="bca">B.C.A</option>
                  <option value="bsc">B.Sc</option>
                  <option value="polytechnic">POLYTECHNIC</option>
                  <option value="mba">M.B.A</option>
                  <option value="mca">M.C.A</option>
                  <option value="bed">B.E.D</option>
                  <option value="bpharma">B.PHARMA</option>
                  <option value="mtech">M.TECH</option>
                  <option value="mpharma">M.PHARMA</option>
                  <option value="inter">Inter College Student</option>
                  <option value="high">HIGH School Student</option>
                </select>
                <div className="absolute right-3 sm:right-4 top-10 sm:top-12 pointer-events-none text-gray-500">▼</div>
                {errors.course && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.course}</p>}
              </div>

              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 appearance-none text-sm sm:text-base"
                >
                  <option value="">Select Year</option>
                  <option value="one">1st</option>
                  <option value="two">2nd</option>
                  <option value="three">3rd</option>
                  <option value="four">4th</option>
                  <option value="other">other</option>
                </select>
                <div className="absolute right-3 sm:right-4 top-10 sm:top-12 pointer-events-none text-gray-500">▼</div>
                {errors.year && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.year}</p>}
              </div>

              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">Roll Number</label>
                <input
                  type="text"
                  name="rollno"
                  value={formData.rollno}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter roll number"
                />
                {errors.rollno && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.rollno}</p>}
              </div>

              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">Aadhar Number</label>
                <input
                  type="text"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleChange}
                  className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter 12-digit Aadhar"
                />
                {errors.aadhar && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.aadhar}</p>}
              </div>

              <div className="relative group">
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">Team Size (1-4)</label>
                <input
                  type="number"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  min="1"
                  max="4"
                  className="w-full p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300 placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter team size (1-4)"
                />
                {errors.teamSize && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.teamSize}</p>}
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div
                className="relative group border-2 border-dashed border-purple-200 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white hover:border-purple-500 transition-all duration-300"
                onDrop={(e) => handleDrop(e, 'aadharImage')}
                onDragOver={handleDragOver}
              >
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">Aadhar Card (Max 300KB)</label>
                <input
                  type="file"
                  name="aadharImage"
                  onChange={handleChange}
                  ref={aadharInputRef}
                  className="w-full text-sm sm:text-base text-gray-700 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-3 sm:file:px-6 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-purple-500 file:to-indigo-500 file:text-white file:font-medium hover:file:from-purple-600 hover:file:to-indigo-600 cursor-pointer"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                />
                <p className="text-xs text-gray-500 mt-2">Drag and drop or click to upload (JPEG, PNG, PDF, max 300KB)</p>
                {errors.aadharImage && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.aadharImage}</p>}
              </div>

              <div
                className="relative group border-2 border-dashed border-purple-200 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white hover:border-purple-500 transition-all duration-300"
                onDrop={(e) => handleDrop(e, 'collegeId')}
                onDragOver={handleDragOver}
              >
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 transition-all duration-300 group-hover:text-purple-600">College ID (Max 300KB)</label>
                <input
                  type="file"
                  name="collegeId"
                  onChange={handleChange}
                  ref={collegeIdInputRef}
                  className="w-full text-sm sm:text-base text-gray-700 file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-3 sm:file:px-6 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-purple-500 file:to-indigo-500 file:text-white file:font-medium hover:file:from-purple-600 hover:file:to-indigo-600 cursor-pointer"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                />
                <p className="text-xs text-gray-500 mt-2">Drag and drop or click to upload (JPEG, PNG, PDF, max 300KB)</p>
                {errors.collegeId && <p className="text-red-400 text-xs mt-1 sm:mt-2 animate-pulse">{errors.collegeId}</p>}
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden group w-full sm:w-auto cursor-pointer"
              >
                <span className="relative z-0 text-sm sm:text-base">Register Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </form>

          <p className="text-center text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 bg-gray-50 py-2 px-4 rounded-full inline-block shadow-md break-all sm:break-normal">
            Registration ID: <span className="font-mono text-purple-600">{formData.registrationId}</span>
          </p>
        </div>
      ) : (
        <div className="w-full max-w-md sm:max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-200 relative z-10 receipt-container">
          <div className="text-center mb-6">
            <img src={hietlogo} alt="HIET Logo" className="w-28 sm:w-36 mx-auto" />
            <h2 className="text-2xl sm:text-3xl font-bold mt-4 text-indigo-600">Registration Receipt</h2>
            <p className="text-sm text-gray-500 mt-2">HI-Tech Institute of Engineering and Technology</p>
          </div>
          <div className="border-t-2 border-b-2 border-indigo-300 py-4 mb-6">
            <table className="w-full text-sm sm:text-base receipt-table">
              <thead>
                <tr className="bg-indigo-100 text-indigo-800">
                  <th className="py-2 px-4 text-left font-semibold">Field</th>
                  <th className="py-2 px-4 text-left font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 font-medium text-gray-700">Registration ID</td>
                  <td className="py-2 px-4">{receiptData.registrationId}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 font-medium text-gray-700">Event</td>
                  <td className="py-2 px-4">{receiptData.event}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium text-gray-700">Team Name</td>
                  <td className="py-2 px-4">{receiptData.teamName}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 font-medium text-gray-700">Team Leader</td>
                  <td className="py-2 px-4">{receiptData.teamLeaderName}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium text-gray-700">Email</td>
                  <td className="py-2 px-4">{receiptData.email}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 font-medium text-gray-700">Mobile</td>
                  <td className="py-2 px-4">{receiptData.mobile}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium text-gray-700">Gender</td>
                  <td className="py-2 px-4">{receiptData.gender}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 font-medium text-gray-700">College</td>
                  <td className="py-2 px-4">{receiptData.college}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium text-gray-700">Course</td>
                  <td className="py-2 px-4">{receiptData.course}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 font-medium text-gray-700">Year</td>
                  <td className="py-2 px-4">{receiptData.year}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium text-gray-700">Roll Number</td>
                  <td className="py-2 px-4">{receiptData.rollno}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 font-medium text-gray-700">Aadhar Number</td>
                  <td className="py-2 px-4">{receiptData.aadhar}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium text-gray-700">Team Size</td>
                  <td className="py-2 px-4">{receiptData.teamSize}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 font-medium text-gray-700">Aadhar Image</td>
                  <td className="py-2 px-4">{receiptData.aadharImage}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-medium text-gray-700">College ID</td>
                  <td className="py-2 px-4">{receiptData.collegeId}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-2 px-4 font-medium text-gray-700">Submitted At</td>
                  <td className="py-2 px-4">{new Date(receiptData.createdAt).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 italic">Thank you for registering! Please check your email for confirmation.</p>
            <p className="text-xs text-gray-500 mt-2">HIET Event Management Team</p>
          </div>
          <div className="text-center no-print">
            <button
              onClick={handlePrint}
              className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-full shadow-md hover:bg-indigo-700 transition-all duration-300"
            >
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registration;