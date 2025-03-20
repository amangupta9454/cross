import { Link } from "react-router-dom";
import event1Img from "/song.jpg";
import event2Img from "/dance.jpg";
import event3Img from "/cultural.jpg";
import event4Img from "/project.jpeg";
import event5Img from "/project 1.jpeg";
import event6Img from "/robo.jpg";

const Event = () => {
  const events = [
    { id: 1, title: "Song", img: event1Img, regStart: "April 1, 2025", regEnd: "April 10, 2025" },
    { id: 2, title: "Dance", img: event2Img, regStart: "April 2, 2025", regEnd: "April 12, 2025" },
    { id: 3, title: "Robo Race", img: event3Img, regStart: "April 3, 2025", regEnd: "April 13, 2025" },
    { id: 4, title: "Code Puzzle", img: event4Img, regStart: "April 4, 2025", regEnd: "April 14, 2025" },
    { id: 5, title: "Cultural Events", img: event5Img, regStart: "April 5, 2025", regEnd: "April 15, 2025" },
    { id: 6, title: "Project Exhibition", img: event6Img, regStart: "April 6, 2025", regEnd: "April 16, 2025" },
    { id: 7, title: "Rangoli", img: event1Img, regStart: "April 7, 2025", regEnd: "April 17, 2025" },
    { id: 8, title: "Nukad Natak", img: event2Img, regStart: "April 8, 2025", regEnd: "April 18, 2025" },
    { id: 9, title: "Ad-Mad Show", img: event1Img, regStart: "April 9, 2025", regEnd: "April 19, 2025" },
    { id: 10, title: "InnovateX", img: event2Img, regStart: "April 10, 2025", regEnd: "April 20, 2025" },
    { id: 11, title: "DataDash", img: event1Img, regStart: "April 11, 2025", regEnd: "April 21, 2025" },
    { id: 12, title: "Startup Pitch", img: event2Img, regStart: "April 12, 2025", regEnd: "April 22, 2025" },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Events Section */}
      <section className="py-20 bg-gray-900 relative overflow-hidden">
        {/* Running Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 opacity-20 animate-gradient-x"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-0">
          <h2 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-blue-400 to-pink-400 text-transparent bg-clip-text mb-16 animate-bounce pt-12  ">
            Our Events
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Link
                to={`/event/${event.id}`}
                key={event.id}
                className="group relative bg-gray-800 rounded-xl overflow-hidden shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
              >
                {/* Event Image */}
                <img
                  src={event.img}
                  alt={event.title}
                  className="w-full h-48 object-cover transition-opacity duration-300 group-hover:opacity-80"
                  onError={() => console.log(`Image failed to load: ${event.img}`)} // Debug image loading issues
                />

                {/* Card Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-semibold text-blue-400 group-hover:text-pink-400 transition-colors duration-300">
                    {event.title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    <span className="font-bold text-blue-400">Reg Start:</span> {event.regStart}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <span className="font-bold text-blue-400">Reg End:</span> {event.regEnd}
                  </p>

                  {/* Know More Strip */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <p className="text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-4 right-6">
                    Know More
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Event;