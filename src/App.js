import './App.css';
import { ReferenceView } from './View/Reference';
import { SegmentationView } from './View/Segmentation';

function App() {
    return (
        <div className="App">
            <div className="App-header">
                <span className="App-header-title">CAnnotator</span>
            </div>
            <div className="App-content">
                <div className="App-content-top">
                    <div className="Segmentation-container">
                        <SegmentationView />
                    </div>
                    <div className="Reference-container">
                        <ReferenceView />
                    </div>
                </div>
                <div className="App-content-bottom">
                </div>
            </div>
        </div>
    );
}

export default App;
