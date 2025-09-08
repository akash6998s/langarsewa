import splashImg from './assets/splash.png';

function Splash() {
  return (
    <div className="fixed inset-0 w-screen h-screen">
      <img
        src={splashImg}
        alt="Splash"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default Splash;
