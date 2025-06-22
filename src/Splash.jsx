import splashImg from './assets/splash.png';

function Splash() {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-white">
      <img
        src={splashImg}
        alt="Splash"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export default Splash;
