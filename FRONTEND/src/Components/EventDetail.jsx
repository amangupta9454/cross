import { useParams, Link } from "react-router-dom";
import event1Img from "/song.jpg";
import event2Img from "/dance.jpg";
import event3Img from "/cultural.jpg";
import event4Img from "/project.jpeg";
import event5Img from "/project 1.jpeg";
import event6Img from "/robo.jpg";

const EventDetail = () => {
  const { id } = useParams();

  // Define all 12 events with matching IDs
  const events = [
    {
      id: 1,
      title: "Song",
      img: event1Img,
      description: "A competition to identify the most versatile solo singer. Bring your own instruments/karaoke (CD/pen drive).",
      regStart: "April 1, 2025",
      regEnd: "April 10, 2025",
      rules: [
        "Time limit: 3 minutes.",
        "No lyric reference during performance.",
        "Bring own instruments/karaoke (CD/pen drive).",
        "Songs with slang/derogatory language prohibited.",
        "Winner advances to institute level.",
        "Judges’ decisions are final; violations lead to disqualification.",
        "Participants: 1.",
      ],
      judgingCriteria: ["Rhythm with lyrics.", "Vocal expression (tone, quality, clarity)."],
    },
    {
      id: 2,
      title: "Dance",
      img: event2Img,
      description: "Showcase your dance moves in this electrifying competition.",
      regStart: "April 2, 2025",
      regEnd: "April 12, 2025",
      rules: [
        "Time limit: 5 minutes.",
        "Group or solo performance allowed.",
        "Bring your own music (CD/pen drive).",
        "No offensive themes allowed.",
        "Judges’ decisions are final.",
        "Participants: 1-5 per team.",
      ],
      judgingCriteria: ["Choreography and creativity.", "Stage presence and energy."],
    },
    {
      id: 3,
      title: "Robo Race",
      img: event3Img,
      description: "A thrilling race between autonomous robots on a challenging track.",
      regStart: "April 3, 2025",
      regEnd: "April 13, 2025",
      rules: [
        "Robot must be autonomous.",
        "Track length: 50 meters.",
        "No external power sources allowed.",
        "Judges’ decisions are final.",
        "Participants: Teams of 2-4.",
      ],
      judgingCriteria: ["Speed and stability.", "Design innovation."],
    },
    {
      id: 4,
      title: "Code Puzzle",
      img: event4Img,
      description: "Solve complex coding puzzles under time pressure.",
      regStart: "April 4, 2025",
      regEnd: "April 14, 2025",
      rules: [
        "Time limit: 2 hours.",
        "No collaboration allowed.",
        "Use of online resources permitted.",
        "Judges’ decisions are final.",
        "Participants: Individuals only.",
      ],
      judgingCriteria: ["Accuracy and speed.", "Code efficiency."],
    },
    {
      id: 5,
      title: "Cultural Events",
      img: event5Img,
      description: "Celebrate diversity through various cultural performances.",
      regStart: "April 5, 2025",
      regEnd: "April 15, 2025",
      rules: [
        "Time limit: 10 minutes per performance.",
        "No offensive content allowed.",
        "Bring your own props.",
        "Judges’ decisions are final.",
        "Participants: Teams of 5-10.",
      ],
      judgingCriteria: ["Creativity and authenticity.", "Audience engagement."],
    },
    {
      id: 6,
      title: "Project Exhibition",
      img: event6Img,
      description: "Showcase your innovative projects to industry experts.",
      regStart: "April 6, 2025",
      regEnd: "April 16, 2025",
      rules: [
        "Project must be functional.",
        "Presentation time: 10 minutes.",
        "Submit a project abstract beforehand.",
        "Judges’ decisions are final.",
        "Participants: Teams of 2-5.",
      ],
      judgingCriteria: ["Innovation and feasibility.", "Presentation skills."],
    },
    {
      id: 7,
      title: "Rangoli",
      img: event1Img,
      description: "Create stunning rangoli designs with vibrant colors.",
      regStart: "April 7, 2025",
      regEnd: "April 17, 2025",
      rules: [
        "Time limit: 1 hour.",
        "Use of stencils not allowed.",
        "Materials provided: Colors and tools.",
        "Judges’ decisions are final.",
        "Participants: Teams of 2-4.",
      ],
      judgingCriteria: ["Design complexity.", "Color usage and creativity."],
    },
    {
      id: 8,
      title: "Nukad Natak",
      img: event2Img,
      description: "Perform impactful street plays on social issues.",
      regStart: "April 8, 2025",
      regEnd: "April 18, 2025",
      rules: [
        "Time limit: 15 minutes.",
        "No offensive content allowed.",
        "Bring your own props.",
        "Judges’ decisions are final.",
        "Participants: Teams of 5-10.",
      ],
      judgingCriteria: ["Message clarity.", "Acting and coordination."],
    },
    {
      id: 9,
      title: "Ad-Mad Show",
      img: event1Img,
      description: "Create and perform creative advertisements for given products.",
      regStart: "April 9, 2025",
      regEnd: "April 19, 2025",
      rules: [
        "Time limit: 5 minutes.",
        "No offensive content allowed.",
        "Props allowed.",
        "Judges’ decisions are final.",
        "Participants: Teams of 3-5.",
      ],
      judgingCriteria: ["Creativity and humor.", "Marketing impact."],
    },
    {
      id: 10,
      title: "InnovateX",
      img: event2Img,
      description: "Present innovative ideas to solve real-world problems.",
      regStart: "April 10, 2025",
      regEnd: "April 20, 2025",
      rules: [
        "Presentation time: 10 minutes.",
        "Submit a proposal beforehand.",
        "No external help allowed.",
        "Judges’ decisions are final.",
        "Participants: Teams of 2-4.",
      ],
      judgingCriteria: ["Innovation and practicality.", "Presentation clarity."],
    },
    {
      id: 11,
      title: "DataDash",
      img: event1Img,
      description: "A data analytics challenge to uncover insights from datasets.",
      regStart: "April 11, 2025",
      regEnd: "April 21, 2025",
      rules: [
        "Time limit: 3 hours.",
        "Datasets provided.",
        "No external tools allowed.",
        "Judges’ decisions are final.",
        "Participants: Teams of 2-3.",
      ],
      judgingCriteria: ["Insight accuracy.", "Visualization quality."],
    },
    {
      id: 12,
      title: "Startup Pitch",
      img: event2Img,
      description: "Pitch your startup idea to a panel of investors.",
      regStart: "April 12, 2025",
      regEnd: "April 22, 2025",
      rules: [
        "Pitch time: 10 minutes.",
        "Submit a business plan beforehand.",
        "No external help during pitch.",
        "Judges’ decisions are final.",
        "Participants: Teams of 2-5.",
      ],
      judgingCriteria: ["Business model feasibility.", "Pitch delivery."],
    },
  ];

  const event = events.find((e) => e.id === parseInt(id));

  // If event is not found, render the "Event not found" message
  if (!event) {
    return <div className="text-white text-center py-20">Event not found!</div>;
  }

  // Render the event details only if event is found
  return (
    <div className="min-h-screen bg-gray-900 text-white py-20 px-6 relative overflow-hidden">
      {/* Running Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 opacity-10 animate-gradient-x"></div>

      <div className="max-w-6xl mx-auto relative z-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-5">
          {/* Left Side: Image and Rules */}
          <div className="space-y-8">
            <div className="relative group">
              <img
                src={event.img}
                alt={event.title}
                className="w-full h-80 object-cover rounded-xl shadow-lg transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Event Rules & Guidelines */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-blue-400 uppercase tracking-wide animate-fade-in">
                Event Rules & Guidelines
              </h2>
              <ul className="space-y-3 text-gray-300 animate-slide-in">
                {event.rules && event.rules.length > 0 ? (
                  event.rules.map((rule, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      {rule}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-300">No rules available.</li>
                )}
              </ul>

              {/* Judging Criteria */}
              <h2 className="text-2xl font-bold text-blue-400 uppercase tracking-wide animate-fade-in">
                Judging Criteria
              </h2>
              <ul className="space-y-3 text-gray-300 animate-slide-in">
                {event.judgingCriteria && event.judgingCriteria.length > 0 ? (
                  event.judgingCriteria.map((criteria, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-400 mr-2">•</span>
                      {criteria}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-300">No judging criteria available.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Right Side: Title, Description, and Register Button */}
          <div className="flex flex-col items-center justify-center text-center space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold uppercase bg-gradient-to-r from-blue-400 to-pink-400 text-transparent bg-clip-text animate-bounce">
              {event.title}
            </h1>
            <p className="text-gray-300 text-lg animate-fade-in">
              {event.description}
            </p>
            <p className="text-gray-300 text-sm">
              <span className="font-bold text-blue-400">Reg Start:</span> {event.regStart}
            </p>
            <p className="text-gray-300 text-sm">
              <span className="font-bold text-blue-400">Reg End:</span> {event.regEnd}
            </p>
            <Link to="/registration">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-pink-500 rounded-full text-white font-semibold shadow-lg hover:scale-105 transition-transform duration-300 animate-pulse">
                Register Now
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;