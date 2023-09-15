import { useState } from "react";
import "../../sharedCss.css";
import "./AnnotationPanel.css";
import ExtractorIcon from "../../../Icons/extractor.svg";
import ConfirmIcon from "../../../Icons/confirm.svg";

const originPigment = [['#de3e35', 0.01], ['#962c35', 0.01], ['#b04d36', 0.01], ['#f1e159', 0.01], ['#ffa53c', 0.01], ['#ef9043', 0.01], ['#5d7d37', 0.01], ['#227dc1', 0.01], ['#2154ac', 0.01], ['#1a3b9f', 0.01], ['#201f29', 0.01], ['#2f3438', 0.01], ['#ebe6da', 0.01]];

const demoSegmentation = "/demoData/segmentations/6.png";
const iconSize = 16;

export const AnnotationPanel = () => {

    const [extractedColor, setExtractedColor] = useState([255, 255, 255]);
    const [matchedColor, setMatchedColor] = useState([128, 56, 28]);
    const [currentDistance, setCurrentDistance] = useState(16.89);

    const [mixedPigments, setMixedPigments] = useState([[6, 0.01], [7, 0.01], [3, 0.03]]);

    const apigmentItems = mixedPigments.map((pigment, index) => {
        return <div
            key={`apigment-item-${index}`}
            className="A-pigment-item-container"
        >
            {index}
        </div>
    })

    return <div className="SDefault-container" style={{overflowY: "scroll"}}>
        <div className="Annotation-panel-firstrow">
            <div className="A-segment-container">
                <img className="A-segmentation-image" src={demoSegmentation} alt="" />
            </div>
            <div className="A-color-annotation">
                <div className="A-text-container" style={{marginTop: "4px"}}>
                    <span className="STitle-text-contrast" style={{fontSize: "16px"}}>
                        Add A Color:
                    </span>
                    <div
                        className="A-color-block"
                        style={{
                            background: `rgb(${extractedColor[0]}, ${extractedColor[1]}, ${extractedColor[2]})`
                        }}
                    />
                    <div className="A-button-container">
                        <div 
                            className="Icon-button"
                            style={{
                                background: `url(${ExtractorIcon}) no-repeat`,
                                backgroundSize: 'contain',
                                width: `${iconSize}px`,
                                height: `${iconSize}px`,
                                cursor: 'pointer',
                            }}
                        />
                    </div>
                </div>
                <div className="A-text-container" style={{marginTop: "2px"}}>
                    <span className="STitle-text-contrast" style={{fontSize: "16px"}}>
                        Matched Color:
                    </span>
                    <span className="STitle-text-contrast" style={{fontSize: "16px", marginLeft: "8px"}}>
                        {`(${matchedColor[0]}, ${matchedColor[1]}, ${matchedColor[2]})`}
                    </span>
                    <div
                        className="A-color-block"
                        style={{
                            background: `rgb(${matchedColor[0]}, ${matchedColor[1]}, ${matchedColor[2]})`
                        }}
                    />
                    <div className="A-button-container">
                        <div 
                            className="Icon-button"
                            style={{
                                background: `url(${ConfirmIcon}) no-repeat`,
                                backgroundSize: 'contain',
                                width: `${iconSize}px`,
                                height: `${iconSize}px`,
                                cursor: 'pointer',
                            }}
                        />
                    </div>
                </div>
                <div className="A-text-container" style={{marginTop: "2px"}}>
                    <span className="STitle-text-contrast" style={{fontSize: "16px"}}>
                        Current Distance:
                    </span>
                    <span className="STitle-text-contrast" style={{fontSize: "16px", marginLeft: "8px"}}>
                        {`${currentDistance}`}
                    </span>
                </div>
                <div className="A-last-container">
                    <div className="A-last-text-container">
                        <div className="A-text-container" style={{marginTop: "2px"}}>
                            <span className="STitle-text-contrast" style={{fontSize: "16px"}}>
                                Mixed Pigments:
                            </span>
                        </div>
                    </div>
                    <div className="A-pigment-list"> 
                        <div style={{
                            width: "100%",
                            height: "100%",
                        }}>
                            {apigmentItems}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="Annotation-panel-secondrow">
            <div className="A-list-container">

            </div>
        </div>
    </div>
}