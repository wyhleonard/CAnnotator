import { useState } from "react";
import "../sharedCss.css"
import "./index.css"
import OpenCloseIcon from "../../Icons/openclose.svg";
import { iconLevel1 } from "../sharedConstants";
import { MetaInformation } from "./components/MetaInformation";
import { ContentDescription } from "./components/ContentDescription";
import { PaintingBoard } from "./components/PaintingBoard";
import { SegmentationList } from "./components/SegmentationList";
import { AnnotationList } from "./components/AnnotationList";

export const SegmentationView = () => {
    // component states
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);

    return <div className="SView-container">
        <div className="View-content">
            <div className= {isDrawerOpen ? "Drawer" : "Drawer-hidden"}>
                <div className="Drawer-content">
                    <div className="Meta-container">
                        <div className="STitle-container">
                            <span className="STitle-text">Meta Information</span>
                        </div>
                        <div className="SContent-container">
                            <MetaInformation />
                        </div>
                    </div>
                    <div className="Description-container">
                        <div className="STitle-container">
                            <span className="STitle-text">Content Descriptions</span>
                        </div>
                        <div className="SContent-container">
                            <ContentDescription />
                        </div>
                    </div>
                </div>
                <div className="Drawer-openIcon">
                    <div className="Icon-button"
                        style={{
                            background: `url(${OpenCloseIcon}) no-repeat`,
                            backgroundSize: 'contain',
                            width: `${iconLevel1}px`,
                            height: `${iconLevel1}px`,
                            transform: `rotate(${isDrawerOpen ? -90 : 90}deg)`,
                            cursor: 'pointer',
                        }}
                        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    />
                </div>
            </div>
            <div className="Painting-board-contaienr">
                <PaintingBoard />
            </div>
            <div className="SandA-container">
                <div className="Segmentations-container">
                    <div className="STitle-container">
                        <span className="STitle-text">Segmentations</span>
                    </div>
                    <div className="SContent-container">
                        <SegmentationList />
                    </div>
                </div>
                <div className="Annotations-container">
                    <div className="STitle-container">
                        <span className="STitle-text">Annotations</span>
                    </div>
                    <div className="SContent-container">
                        <AnnotationList />
                    </div>
                </div>
            </div>
        </div>
    </div>
}
