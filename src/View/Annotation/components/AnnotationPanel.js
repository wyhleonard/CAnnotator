import { useState } from "react";
import "../../sharedCss.css";
import "./AnnotationPanel.css";
import ExtractorIcon from "../../../Icons/extractor.svg";
import ConfirmIcon from "../../../Icons/confirm.svg";
import AddPigmentIcon from "../../../Icons/positive.svg";
import "./MixingMethod.css";
import PigmentItem from "./PigmentItem";

const originPigment = [['#de3e35', 0.01], ['#962c35', 0.01], ['#b04d36', 0.01], ['#f1e159', 0.01], ['#ffa53c', 0.01], ['#ef9043', 0.01], ['#5d7d37', 0.01], ['#227dc1', 0.01], ['#2154ac', 0.01], ['#1a3b9f', 0.01], ['#201f29', 0.01], ['#2f3438', 0.01], ['#ebe6da', 0.01]];

const demoSegmentation = "/demoData/segmentations/6.png";
const demoSliderLength = 126.33;
const demoSilderBlockWidth = 12;
const iconSize = 16;
const rectSize = 22;
const symbolGap = 4;
const basisQuantity = 0.01;

const demoAnnotations = [
    {
        pigments: [[6, 0.01], [7, 0.01], [3, 0.03]],
        mixedPigments: [['#87c6d1', 0.02], ['#dbd6a0', 0.05]]
    },
    {
        pigments: [[1, 0.02], [3, 0.03], [8, 0.03], [11, 0.01], [9, 0.02]],
        mixedPigments: [['#87c6d1', 0.05], ['#dbd6a0', 0.08], ['#87c6d1', 0.05], ['#dbd6a0', 0.08]]
    },
    {
        pigments: [[2, 0.02], [4, 0.03], [10, 0.03], [10, 0.03]],
        mixedPigments: [['#87c6d1', 0.05], ['#dbd6a0', 0.08], ['#dbd6a0', 0.08]]
    },
    {
        pigments: [[2, 0.02], [4, 0.03], [10, 0.03], [10, 0.03]],
        mixedPigments: [['#87c6d1', 0.05], ['#dbd6a0', 0.08], ['#dbd6a0', 0.08]]
    },
]

export const AnnotationPanel = () => {

    // 这里的颜色可能要改成16进制存储
    const [extractedColor, setExtractedColor] = useState([255, 255, 255]);
    const [matchedColor, setMatchedColor] = useState([128, 56, 28]);
    const [currentDistance, setCurrentDistance] = useState(16.89);
    const [mixedPigments, setMixedPigments] = useState([[6, 0.02], [7, 0.06], [3, 0.03]]);

    // 拖拽逻辑
    // const [isMaskDrag, setIsMaskDrag] = useState(false);
    // const [maskMoveP, setMaskMoveP] = useState([0, 0]);
    // 
    // const handleDragStart = (e) => {
    //     setIsMaskDrag(true);
    //     setMaskMoveP([
    //         e.clientX,
    //         e.clientY,
    //     ]);
    // }
    // const handleDragMove = (e) => {
    //     if(isMaskDrag) {
    //         if(e.clientX !== maskMoveP[0] || e.clientY !== maskMoveP[1]) {
    //             setMaskMoveP([
    //                 e.clientX,
    //                 e.clientY
    //             ])
    //         }
    //     }
    // }
    // const handleDragEnd = (e) => {
    //     if(isMaskDrag) {
    //         setIsMaskDrag(false);
    //         setMaskMoveP([0, 0]);
    //     }
    // }

    // items in the pigment list => 要抽象成组件，不然不好写滑动交互
    // Assuming this is in your parent component where you were previously mapping over mixedPigments
    const apigmentItems = mixedPigments.map((pigment, index) => (
        <PigmentItem
        key={index}
        pigment={pigment}
        index={index}
        originPigment={originPigment}
        demoSliderLength={demoSliderLength}
        demoSilderBlockWidth={demoSilderBlockWidth}
        iconSize={iconSize}
        />
    ));

    // TODO: Add pigment button 添加pigment
    const annotationItems = demoAnnotations.map((data, index) => {
        const pigments = data.pigments;
        const mixedPigments = data.mixedPigments;

        // copy from MixingMethod.js
        const itemList = [];
        for(let i = 0; i < pigments.length; i++) {
            if(i === 0) {
                itemList.push(<div
                    key={`pigment-item-${i}`} 
                    className="Pigment-item-container"
                    style={{
                        marginTop: "4px",
                        width: `${rectSize}px`,
                        height: `${rectSize}px`,
                        background: `${originPigment[pigments[i][0]][0]}`
                    }}
                >
                    <span className="Pigment-quantity-text">{Math.round(pigments[i][1] / basisQuantity)}</span>
                </div>)
            } else {
                // +
                itemList.push(<div
                    key={`symbol(+)-${i}`} 
                    className="Pigment-symbol-container"
                    style={{
                        width: `${rectSize + symbolGap}px`,
                        height: `${rectSize}px`,
                    }}
                >
                    <span className="STitle-text-contrast" 
                        style={{
                            marginLeft: "0px", 
                            fontSize: "24px",
                            fontWeight: "600"
                        }}>
                            {"+"}
                    </span>
                </div>)
                
                // pigment
                itemList.push(<div
                    key={`pigment-item-${i}`} 
                    className="Pigment-item-container"
                    style={{
                        marginTop: "4px",
                        width: `${rectSize}px`,
                        height: `${rectSize}px`,
                        background: `${originPigment[pigments[i][0]][0]}`
                    }}
                >
                    <span className="Pigment-quantity-text">{Math.round(pigments[i][1] / basisQuantity)}</span>
                </div>)

                // =
                itemList.push(<div
                    key={`symbol(=)-${i}`} 
                    className="Pigment-symbol-container"
                    style={{
                        width: `${rectSize + symbolGap}px`,
                        height: `${rectSize}px`,
                    }}
                >
                    <span className="STitle-text-contrast" 
                        style={{
                            marginLeft: "0px", 
                            fontSize: "24px",
                            fontWeight: "600"
                        }}>
                            {"="}
                    </span>
                </div>)

                // mixed pigment
                itemList.push(<div
                    key={`pigment-mixed-${i}`} 
                    className="Pigment-item-container"
                    style={{
                        marginTop: "4px",
                        width: `${rectSize}px`,
                        height: `${rectSize}px`,
                        borderRadius: `${rectSize / 2}px`,
                        background: `${mixedPigments[i - 1][0]}`,
                    }}
                >
                    <span className="Pigment-quantity-text">{Math.round(mixedPigments[i - 1][1] / basisQuantity)}</span>
                </div>)
            }
        }

        return <div
            key={`annotation-item-${index}`} 
            className="A-text-container" 
            style={{
                marginBottom: "3px",
            }}
        >
            <div className="A-index-container">
                <span className="STitle-text-contrast" style={{fontSize: "16px"}}>{`(${index + 1})`}</span>
            </div>
            <div className="A-method-container">
                {/* {itemList} */}
                {itemList[itemList.length - 1]}
                <span 
                    className="STitle-text-contrast" 
                    style={{
                        margin: "0px 6px",
                        fontSize: "24px",
                        fontWeight: "600"
                    }}
                >
                    :
                </span>
                {itemList}
            </div>
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
                        {apigmentItems}
                        <div className="A-pigment-add">
                            <div 
                                className="Icon-button"
                                style={{
                                    background: `url(${AddPigmentIcon}) no-repeat`,
                                    backgroundSize: 'contain',
                                    width: `${iconSize}px`,
                                    height: `${iconSize}px`,
                                    cursor: 'pointer',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="Annotation-panel-secondrow">
            <div className="A-list-container">
                <div className="A-text-container" style={{marginTop: "0px"}}>
                    <span className="STitle-text-contrast" style={{fontSize: "16px"}}>
                        Current Color Annotations:
                    </span>
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
                <div className="A-anntated-colors">
                    {annotationItems}
                </div>
            </div>
        </div>
    </div>
}
