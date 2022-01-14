import ScrollSequence from './lib/components/Scroll';
import './app.css'
const appleSequenceImages = [];
// 131
for (let i = 0; i <= 131; i++) {
  appleSequenceImages.push(
    `https://www.apple.com/105/media/us/airpods-pro/2019/1299e2f5_9206_4470_b28e_08307a42f19b/anim/sequence/large/02-head-bob-turn/${`000${i}`.slice(
      -4
    )}.jpg`
  );
}

function App() {
  return (
    <div className="App">
      <ScrollSequence images={appleSequenceImages} style={{height: '1400px'}}>
        <h1 style={{fontSize: '8em', color: 'pink', margin: '1em 1em'}}>Hello, world</h1>
      </ScrollSequence>
    </div>
  );
}

export default App;
