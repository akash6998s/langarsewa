import AttendanceSheet from "../components/AttendanceSheet";
import LoadData from "../components/LoadData";
import Summary from "../components/Summary";

function Home() {
  return (
    <div>
      <LoadData/>
      <AttendanceSheet />
    </div>
  );
}
export default Home;
