import "../sharedCss.css";
import { MatrixPalette } from "./components/MatrixPalette";
import { MixingMethod } from "./components/MixingMethod";
import { SpacePlot } from "./components/SpacePlot";
import LeftIcon from "../../Icons/triangle.svg";
import "./index.css";
import { useState } from "react";
import { AnnotationPanel } from "./components/AnnotationPanel";

const demoSrc = "/demoData/annotations/2.png";
const demoSpace = 1;
const iconSize = 15;

const dropdownContent = ["a * b", "L * a", "L * b"];

export const AnnotationView = () => {

    const [isDropdown, setIsDropdown] = useState(false);
    const [selectedSpace, setSelectSpace] = useState(0);

    const spaceItems = dropdownContent.map((space, index) => {
        return <div
            key={`space-item-${index}`}
            className="Space-item"
            onClick={() => {
                setSelectSpace(index);
                setIsDropdown(false);
            }}
        >
            <span style={{marginLeft: "4px"}}>{space}</span>
        </div>
    })

    return <div className="SView-container" style={{display: "flex", alignItems: "center"}}>
        <div className="A-Reference-container">
            <img className="A-Reference-image" src={demoSrc} alt=""/>
        </div>
        <div className="Annotation-panel-container">
            <AnnotationPanel />
        </div>
        <div className="Annotation-mixing-container">
            <div className="MatrixSpace-title-container">
                <MixingMethod />
            </div>
            <div className="MatrixSpace-display-container">
                <MatrixPalette />
            </div>
        </div>
        <div className="Annotation-space-container">
            <div className="MatrixSpace-title-container">
                <span className="STitle-text-contrast" style={{fontSize: "16px"}}>{`Displayed Space: 【${demoSpace}】`}</span>
                <div className="Dropdown-list-container">
                    <div className="SConfirm-button-container" 
                        style={{
                            marginLeft: "45px",
                            width: "calc(100% - 45px)"
                        }}
                    >
                        <div className="Focused-list-item">
                            <span className="STitle-text-contrast"
                                style={{
                                    marginLeft: "5px",
                                    marginTop: "-2px",
                                    fontSize: "16px",
                                }}
                            >
                                {dropdownContent[selectedSpace]}
                            </span>
                        </div>
                        <div className="Dropdown-button">
                            <div 
                                className="Icon-button"
                                style={{
                                    background: `url(${LeftIcon}) no-repeat`,
                                    backgroundSize: 'contain',
                                    width: `${iconSize}px`,
                                    height: `${iconSize}px`,
                                    transform: `rotate(${isDropdown ? 90 : -90}deg)`,
                                    cursor: 'pointer',
                                }}
                                onClick={() => setIsDropdown(!isDropdown)}
                            />
                        </div>
                        {
                            isDropdown && <div className="Dropdown-panel">
                                {spaceItems}
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className="MatrixSpace-display-container">
                <SpacePlot />
            </div>
        </div>
    </div>
}
