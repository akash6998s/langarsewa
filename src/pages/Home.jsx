import AttendanceSheet from "../components/AttendanceSheet";
import { theme } from "../theme"; // Import the theme

function Home() {
  return (
    <div
      className="min-h-screen pt-2"
      style={{ background: theme.colors.background }} // Use backgroundColor instead of background
    >
      {/* Refresh Button */}
      <div className="flex justify-end px-4 mb-8">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform duration-200 transform hover:scale-105"
          style={{
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
            boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
          }}
        >
          Reload
        </button>
      </div>

      {/* Main Heading */}
      <h2
        className="text-4xl md:text-5xl font-extrabold text-center tracking-tight leading-tight px-4 font-[EB_Garamond,serif]"
        style={{ color: theme.colors.neutralDark }}
      >
        सुदर्शन सेना भोजन वितरण
      </h2>


      {/* Attendance Sheet Component */}
      <AttendanceSheet />
    </div>
  );
}

export default Home;
