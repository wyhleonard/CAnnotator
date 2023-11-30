import { useState, useMemo, useEffect } from "react";
import "../../sharedCss.css";
import "./AnnotationPanel.css";
import ExtractorIcon from "../../../Icons/extractor.svg";
import ConfirmIcon from "../../../Icons/confirm.svg";
import AddPigmentIcon from "../../../Icons/positive.svg";
import PigmentSlider from "./PigmentSlider";
import "./MixingMethod.css";
import DeletePigmentIcon from "../../../Icons/negative.svg";

const originPigment = [['#de3e35', 0.01], ['#962c35', 0.01], ['#b04d36', 0.01], ['#f1e159', 0.01], ['#ffa53c', 0.01], ['#ef9043', 0.01], ['#5d7d37', 0.01], ['#227dc1', 0.01], ['#2154ac', 0.01], ['#1a3b9f', 0.01], ['#201f29', 0.01], ['#2f3438', 0.01], ['#ebe6da', 0.01]];

const demoSegmentation = "/demoData/segmentations/9.png";
const demoSliderLength = 121.27; // 126.33
const demoSilderBlockWidth = 12;
const iconSize = 16;
const rectSize = 22;

const demoAnnotations = [
    {
        "mixed": "#eae5d7",
        "pigments": [[12, 2.00]]
    },
    {
        "mixed": "#dabb74",
        "pigments": [[5, 3.75], [12, 2.25]]
    }
]

export const AnnotationPanel = ({
    targetColor,
    selectedSticker,
    pigmentConfirmed,
    setEnableSelect,
    matchedPalette, // matrixData
    matchedPaletteDist,
    mixedPigmentList,
    mixedStepState,
    changeMixedPigmentList,
    changeTargetColor
}) => {

    // 这里的颜色可能要改成16进制存储
    const [matchedColor, setMatchedColor] = useState("#ffffff");
    const [currentDistance, setCurrentDistance] = useState(0);
    const [currentAnnotations, setCurrentAnnotations] = useState([]);

    useEffect(() => {
        if(targetColor === "#ffffff") {
            setMatchedColor("#ffffff");
            setCurrentDistance(0);
            setCurrentAnnotations([]);
        }
    }, [targetColor])

    useEffect(() => {
        if(matchedPaletteDist) {
            const distMatrix = matchedPaletteDist['focus'];
            let minDist = 100000;
            let minDistIndex = [1, 1];
            for(let i = 1; i < distMatrix.length; i++) {
                for(let j = 1; j < distMatrix[i].length; j++) {
                    const dist = distMatrix[i][j];
                    if(dist < minDist) {
                        minDist = dist;
                        minDistIndex = [i, j];
                    }
                }
            }
            console.log("matched_color_dist", minDist, minDistIndex)
            setMatchedColor(matchedPalette['mixed'][minDistIndex[0] - 1][minDistIndex[1] - 1][0])
            setCurrentDistance(minDist.toFixed(2))
        }
    }, [matchedPalette, matchedPaletteDist])

    // items in the pigment list => 要抽象成组件，不然不好写滑动交互
    const apigmentItems = useMemo(() => {
        console.log("pigmentConfirmed:", mixedPigmentList);

        if(mixedStepState.length > 0) {
            setMatchedColor(mixedStepState[mixedStepState.length - 1][2][0]);
            setCurrentDistance(mixedStepState[mixedStepState.length - 1][3].toFixed(2));
        }

        // console.log("aaaaaaaaaaaaaaaaaaaa", targetColor)

        if(targetColor === "#ffffff") { // 缓兵之计
            return []
        } else {
            return mixedPigmentList.map((_, index) => {
                return <PigmentSlider
                    key={`pigment-slider-item-${index}`}
                    pigmentList={mixedPigmentList}
                    currentIndex={index}
                    targetColor={targetColor}
                    changeMatchedColor={setMatchedColor}
                    changeMatchedDist={setCurrentDistance}
                    sliderLength={demoSliderLength}
                    sliderBlockWidth={demoSilderBlockWidth}
                    iconSize={iconSize}
                    changeMixedPigmentList={changeMixedPigmentList}
                />
            })
        }

    }, [pigmentConfirmed, targetColor]);

    // TODO: Add pigment button 添加pigment // currentAnnotations
    for(let i = 0; i < currentAnnotations.length; i++) {
        demoAnnotations.push(currentAnnotations[i])
    }

    const annotationItems = demoAnnotations.map((data, index) => {
        // console.log("test-print-currentAnnotations", currentAnnotations, data) // currentAnnotation里有数值

        // bug 没法提交两次

        // copy from MixingMethod.js
        const itemList = [];
        const pigments = data['pigments'];
        const mixedPigment = data['mixed'];

        // color labels
        console.log("test-annotation-mixedPigment", mixedPigment)
        itemList.push(<div
            key={`annotation-mixed-${index}`} 
            className="Pigment-item-container"
            style={{
                width: `${rectSize}px`,
                height: `${rectSize}px`,
                borderRadius: `${rectSize / 2}px`,
                background: `${mixedPigment}`,
            }}
        >
        </div>)

        itemList.push(<span
            key={`annotation-(:)-${index}`} 
            className="STitle-text-contrast" 
            style={{
                margin: "0px 6px",
                fontSize: "24px",
                fontWeight: "600"
            }}
        >
            :
        </span>)

        for (let i = 0; i < pigments.length; i++) {
            itemList.push(<div
                key={`annotation-pigment-${index}-${i}`} 
                className="Pigment-item-container"
                style={{
                    width: `${rectSize}px`,
                    height: `${rectSize}px`,
                    background: `${originPigment[pigments[i][0]][0]}`
                }}
            />)

            itemList.push(<span
                key={`annotation-quantity-${index}-${i}`} 
                style={{
                    color: "#5a4e3b",
                    margin: "0px 6px 0px 6px",
                    fontSize: "16px",
                    fontWeight: "500"
                }}
            >
                {`(${pigments[i][1].toFixed(2)})`}
            </span>)

            if(i !== pigments.length - 1) {
                itemList.push(<span
                    key={`annotation-(+)-${index}-${i}`} 
                    className="STitle-text-contrast" 
                    style={{
                        margin: "0px 6px 0px 0px",
                        fontSize: "24px",
                        fontWeight: "600"
                    }}
                >
                    +
                </span>)
            }
        }

        itemList.push(
        <div className="A-pigment-delete" key={`annotation-delete-${index}`} >
            <div className="Icon-button" 
            style={{
                background: `url(${DeletePigmentIcon}) no-repeat`,
                backgroundSize: 'contain',
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                cursor: 'pointer',
            }} />
        </div>)

        return <div
            key={`annotation-item-${index}`}
            className="A-text-container"
            style={{
                marginBottom: "3px",
            }}
        >
            <div className="A-index-container">
                <span className="STitle-text-contrast" style={{ fontSize: "16px" }}>{`(${index + 1})`}</span>
            </div>
            <div className="A-method-container">
                {itemList}
            </div>
        </div>
    })

    return <div className="SDefault-container" style={{ overflowY: "scroll" }}>
        <div className="Annotation-panel-firstrow">
            <div className="A-segment-container">
                <img className="A-segmentation-image" src={selectedSticker} alt="" />
            </div>
            <div className="A-color-annotation">
                <div className="A-text-container" style={{ marginTop: "4px" }}>
                    <span className="STitle-text-contrast" style={{ fontSize: "16px" }}>
                        Add A Color:
                    </span>
                    <div
                        className="A-color-block"
                        style={{
                            background: `${targetColor}`
                        }}
                    />
                    <span className="STitle-text-contrast" style={{ fontSize: "16px", marginLeft: "8px" }}>
                        {`(${targetColor})`}
                    </span>
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
                            onClick={() => {setEnableSelect(true)}} 
                        />
                    </div>
                </div>
                <div className="A-text-container" style={{ marginTop: "2px" }}>
                    <span className="STitle-text-contrast" style={{ fontSize: "16px" }}>
                        Current Color:
                    </span>
                    <div
                        className="A-color-block"
                        style={{
                            background: `${matchedColor}`
                        }}
                    />
                    <span className="STitle-text-contrast" style={{ fontSize: "16px", marginLeft: "8px" }}>
                        {`(${matchedColor})`}
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

                            onClick={() => {
                                currentAnnotations.push({
                                    "pigments": mixedPigmentList,
                                    "mixed": matchedColor
                                });
                                setCurrentAnnotations(JSON.parse(JSON.stringify(currentAnnotations)));
                            }}
                        />
                    </div>
                </div>
                <div className="A-text-container" style={{ marginTop: "2px" }}>
                    <span className="STitle-text-contrast" style={{ fontSize: "16px" }}>
                        Current Distance:
                    </span>
                    <span className="STitle-text-contrast" style={{ fontSize: "16px", marginLeft: "8px" }}>
                        {`${parseFloat(currentDistance).toFixed(2)}`}
                    </span>
                </div>
                <div className="A-last-container">
                    <div className="A-last-text-container">
                        <div className="A-text-container" style={{ marginTop: "2px" }}>
                            <span className="STitle-text-contrast" style={{ fontSize: "16px" }}>
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
                <div className="A-text-container" style={{ marginTop: "0px" }}>
                    <span className="STitle-text-contrast" style={{ fontSize: "16px" }}>
                        Current Color Annotations:
                    </span>
                    <div className="A-button-container" onClick={() => {
                        changeTargetColor("#ffffff");
                        setCurrentAnnotations([]);

                        // 还要把它转移出去
                    }}>
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
