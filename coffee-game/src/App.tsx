import CoffeeShop3D from "./components/CoffeeShop3D";
import "./App.css";

function App() {
  return (
    <div className="container" style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Primary 3D View */}
      <CoffeeShop3D />
    </div>
  );
}

export default App;
