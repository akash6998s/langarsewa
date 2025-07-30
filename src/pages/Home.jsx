import AttendanceSheet from "../components/AttendanceSheet";
import { theme } from "../theme"; // Import the theme

function Home() {
  return (
    <div
      className="min-h-screen py-8"
      style={{ background: theme.colors.background }} // Apply theme background color
    >
      {/* Designed heading with Tailwind CSS and Hindi text */}
      <h2
        className="text-4xl md:text-5xl font-extrabold text-center tracking-tight leading-tight px-4 font-[EB_Garamond,serif]"
        style={{ color: theme.colors.neutralDark }} // Apply theme neutralDark color for text
      >
        सुदर्शन सेना भोजन वितरण
      </h2>
      <AttendanceSheet />
    </div>
  );
}
export default Home;
