import { useState, useContext } from "react";
import AppContext from "../../hooks/createContext";
import "../../sharedCss.css";
import "./AnnotationPanel.css";
import ExtractorIcon from "../../../Icons/extractor.svg";
import ConfirmIcon from "../../../Icons/confirm.svg";
import PaletteIcon from "../../../Icons/palette.svg";
import AddPigmentIcon from "../../../Icons/positive.svg";
import PigmentSlider from "./PigmentSlider";
import "./MixingMethod.css";
import DeletePigmentIcon from "../../../Icons/negative.svg";

const demoSilderBlockWidth = 12;
const iconSize = 16;
const rectSize = 24;

export const AnnotationPanel = ({
    targetColor,
    setEnableSelect,
    changeTargetColor,
    basePigments,
    matchedColor,
    setMatchedColor,
    currentDistance,
    setCurrentDistance,
    displayPigmentList, 
    setDisplayPigmentList,
    recommendMixingMethod,
    clearState
}) => {
    const {
        stickers: [stickers],
        activeSticker: [activeSticker, setActiveSticker],
        annotatedLabels: [annotatedLabels, setAnnotatedLabels]
    } = useContext(AppContext);

    const [currentAnnotations, setCurrentAnnotations] = useState([]);
    const [isAddNewColor, setIsAddNewColor] = useState(false); // 是否打开添加颜色的面板

    // console.log("test-print-displayPigmentList", displayPigmentList)
    // console.log("test-print-currentAnnotations", currentAnnotations)

    // items in the pigment list
    const apigmentItems = displayPigmentList.map((_, index) => {
        return <PigmentSlider
            key={`pigment-slider-item-${index}`}
            pigmentList={displayPigmentList}
            currentIndex={index}
            targetColor={targetColor}
            changeMatchedColor={setMatchedColor}
            changeMatchedDist={setCurrentDistance}
            sliderBlockWidth={demoSilderBlockWidth}
            iconSize={iconSize}
            changeMixedPigmentList={setDisplayPigmentList}
            basePigments={basePigments}
        />
    })

    const basePigmentItems = basePigments.map((pigment, idx) => {
        let isContain = false;
        for(let i = 0; i < displayPigmentList.length; i++) {
            if(displayPigmentList[i][0] === idx) {
                isContain = true;
                break
            }
        }
        if(isContain) return null // 不显示以被添加的颜料

        return <div 
            className="A-base-pigment-item"
            key={`base-pigment-${idx}`}
            style={{
                background: pigment[0],
                marginRight: idx === basePigments.length - 1 ? "0px" : "4px"
            }}
            onClick={() => {
                displayPigmentList.push([idx, 1]);
                setDisplayPigmentList(JSON.parse(JSON.stringify(displayPigmentList)));
                setIsAddNewColor(false);

                let body = {
                    pigmentList: displayPigmentList,
                    targetColor: targetColor
                }
                fetch("http://localhost:8000/gen_mixed_result", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                })
                .then(response => response.json())
                .then(data => {
                    console.log("backend - gen_mixed_result: ", data)
                    setMatchedColor(data['mixed_color']);
                    setCurrentDistance(data['mixed_dist']);
                })
                .catch(error => console.error("Error fetching data:", error));
            }}
        />
    })

    const annotationItems = currentAnnotations.map((data, index) => {
        const itemList = [];
        const pigments = data['pigments'];
        const mixedPigment = data['mixed'];

        // color labels
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
                    background: `${basePigments[pigments[i][0]][0]}`
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
            <div 
                className="Icon-button" 
                style={{
                    background: `url(${DeletePigmentIcon}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconSize}px`,
                    height: `${iconSize}px`,
                    cursor: 'pointer',
                }}
                onClick={() => {
                    if(currentAnnotations.length > 0) {
                        currentAnnotations.splice(index, 1);
                        setCurrentAnnotations(JSON.parse(JSON.stringify(currentAnnotations)));
                    }
                }}
            />
        </div>)

        return <div
            key={`annotation-item-${index}`}
            className="A-text-container"
            style={{
                marginBottom: "4px",
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
                {
                    activeSticker !== -1 && 
                    <img 
                        className="A-segmentation-image" 
                        src={stickers[activeSticker].toDataURL()} 
                        alt=""
                    />
                }
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
                            onClick={() => setEnableSelect(true)} 
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
                                if(displayPigmentList.length > 0) {
                                    currentAnnotations.push({
                                        "pigments": JSON.parse(JSON.stringify(displayPigmentList)),
                                        "mixed": matchedColor
                                    });
                                    setCurrentAnnotations(JSON.parse(JSON.stringify(currentAnnotations)));
                                    changeTargetColor("#ffffff");
                                    clearState();
                                }
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
                        <div className="A-button-container" style={{marginLeft: "10px", marginTop: "8px"}}>
                            <div
                                className="Icon-button"
                                style={{
                                    background: `url(${PaletteIcon}) no-repeat`,
                                    backgroundSize: 'contain',
                                    width: `${20}px`,
                                    height: `${20}px`,
                                    cursor: 'pointer',
                                }}
                                onClick={recommendMixingMethod}
                            />
                        </div>
                    </div>
                    <div className="A-pigment-list">
                        {apigmentItems}
                        <div className="A-pigment-add" onClick={() => setIsAddNewColor(!isAddNewColor)}>
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
                    {
                        (isAddNewColor && basePigments.length > 0) && 
                        <div className="A-new-pigment-add" style={{bottom: `${displayPigmentList.length === 0 ? 6 : -26}px`}}>
                            <div className="A-new-pigment-add-container">
                                {basePigmentItems}
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
        <div className="Annotation-panel-secondrow">
            <div className="A-list-container">
                <div className="A-text-container" style={{ marginTop: "0px" }}>
                    <span className="STitle-text-contrast" style={{ fontSize: "16px" }}>
                        Current Color Annotations:
                    </span>
                    <div 
                        className="A-button-container" 
                        onClick={() => {
                            annotatedLabels.push({
                                "stickerIndex": activeSticker,
                                "annotations": [...currentAnnotations]
                            })
                            setAnnotatedLabels([...annotatedLabels]);
                            setCurrentAnnotations([]);
                            setActiveSticker(-1);
                        }}
                    >
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
