import splashImg from './assets/splash.png'; // Adjust path if image is elsewhere

function Splash() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <img src={splashImg} alt="Splash" className="w-64 h-auto" />
    </div>
  );
}

export default Splash;
