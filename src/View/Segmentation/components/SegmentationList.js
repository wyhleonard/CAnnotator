import "../../sharedCss.css"
import "./SegmentationList.css"
import { useContext, useState } from "react";
import Histogram from "./Histogram";
import AppContext from "../../hooks/createContext";

const segSize = 63.8;

export const SegmentationList = ({
    colors,
}) => {
    const {
        stickers: [stickers, ],
        activeSticker: [, setActiveSticker],
        chosenStickers: [chosenStickers, setChosenStickers],
        // isEditing: [isEditing,],
        editingMode: [editingMode],
        stickerForTrack: [stickerForTrack, setStickerForTrack],
        currentIndex: [currentIndex, setCurrentIndex],
        segMaskIndex: [, setSegMaskIndex],
        image: [image],
        imageContext: [imageContext],
        segMaskArray: [segMaskArray],
    } = useContext(AppContext);

    const handleStickerClick = (i) => {
        if (editingMode === "painting") {

            const chosenStickersArray = Array.from(chosenStickers);
            const stickerIndex = chosenStickersArray.indexOf(i);
            if(stickerIndex !== -1) {
                chosenStickersArray.splice(stickerIndex, 1);
                setChosenStickers(new Set(chosenStickersArray));
            } else {
                setChosenStickers(new Set([...chosenStickersArray, i]));
            }

            setActiveSticker(i); // 有什么用
        }
    };

    // console.log("test-print-stickers", stickers)
    // console.log("test-print-colors", colors) // [{}]
    // console.log("test-print-imageContext", imageContext)
    // console.log("test-print-stickerForTrack", stickerForTrack)

    const segItems = stickers.map((sticker, i) => {
        const displayedSegs = [];
        if(editingMode === "natural-image") {
            if(i === currentIndex) {
                displayedSegs.push(
                    <div className="Segment-item-image">
                        <div className="Segment-tooltip-item" onClick={() => {
                            if(currentIndex + 1 < stickerForTrack.length) {
                                // skip this seg时候往里面存一个空对象
                                stickerForTrack[currentIndex] = [...stickerForTrack[currentIndex], undefined];
                                setStickerForTrack(stickerForTrack);
                                setCurrentIndex(currentIndex + 1);
                            } else {
                                setCurrentIndex(-1);
                                imageContext[image.src]["maskArray"] = JSON.parse(JSON.stringify(segMaskArray));
                            }
                            setSegMaskIndex(currentIndex + 1);
                        }}>
                            <span className="STitle-text-contrast" style={{marginLeft: "0px", fontSize: "16px"}}>TODO</span>
                        </div>
                    </div>
                )
            } else {
                if(stickerForTrack[i].length > 0) {
                    for(let m = 0; m < stickerForTrack[i].length; m++) {
                        if(stickerForTrack[i][m] === undefined) continue
                        displayedSegs.push(
                        <div className="Segment-item-image" key={`natural-seg-${i}-${m}`} style={{ width: `${segSize}px` }}>
                            <img 
                                className="Image-container" 
                                src={stickerForTrack[i][m].toDataURL()} 
                                alt="" 
                            />
                        </div>)
                    }
                }
            }
        }

        return <div
            key={`segment-item-${i}`}
            className="Segment-item-container"
            style={{ height: `${segSize}px` }}
        >
            <div className={`Segment-item-image ${chosenStickers.has(i) ? "active" : ""}`} style={{ width: `${segSize}px` }}>
                <img 
                    className="Image-container" 
                    src={sticker.toDataURL()} 
                    alt="" 
                    onClick={() => handleStickerClick(i)} 
                />
            </div>
            {
                editingMode === "painting" ? 
                (JSON.stringify(colors[i]) !== "{}" &&
                <div 
                    className="Segment-item-histogram"
                    key={`histogram-item-${i}`}
                    style={{ width: `calc(100% - ${segSize}px - 8px)`}}
                >
                    {/* <Histogram colors={colors[i]} /> */}
                </div>) :
                <div 
                    className="Segment-item-refs"
                    style={{ width: `calc(100% - ${segSize}px - 8px)`}}
                    key={`refSeg-item-${i}`}
                >
                    {displayedSegs}
                </div>
            }
        </div>
    })

    return <div className="SDefault-container" style={{overflowY: "hidden"}}>
        <div className="STitle-container" style={{ marginTop: "8px", background: "#b09872" }}>
            <div className="Segment-title-container" style={{width: `${segSize}px`}}>
                <span className="STitle-text-contrast" style={{marginLeft: "0px", fontSize: "16px"}}>SEG</span>
            </div>
            <div className="Segment-title-container" style={{width: `calc(100% - ${segSize + 8}px)`, marginLeft: "8px"}}>
                <span className="STitle-text-contrast" style={{marginLeft: "0px", fontSize: "16px"}}>{editingMode === "natural-image" ? "Extra SEG" :"Color DIST"}</span>
            </div>
        </div>
        <div className="Segment-list-container">
            {segItems}
        </div>
    </div>
}
