import splashImg from './assets/splash.png';

function Splash() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-white">
      <img
        src={splashImg}
        alt="Splash"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default Splash;
