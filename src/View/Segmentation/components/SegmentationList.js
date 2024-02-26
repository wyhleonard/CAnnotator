import "../../sharedCss.css"
import "./SegmentationList.css"
import { useContext } from "react";
import Histogram from "./Histogram";
import AppContext from "../../hooks/createContext";
import { imageInOnePage } from "../../sharedConstants";

const segSize = 63.8;

/*
TODO:
    1) 默认显示 "Extra SEG"，当有 "Color DIST"的时候才显示bar chart
    2) 自由切换 "Extra SEG" and "Color DIST"
*/

export const SegmentationList = ({
    colors,
}) => {
    const {
        stickers: [stickers, ],
        activeSticker: [activeSticker, setActiveSticker],
        chosenStickers: [chosenStickers, setChosenStickers],
        editingMode: [editingMode],
        stickerForTrack: [stickerForTrack, setStickerForTrack],
        currentIndex: [currentIndex, setCurrentIndex],
        segMaskIndex: [, setSegMaskIndex],
        image: [image],
        imageContext: [imageContext],
        segMaskArray: [segMaskArray],
        imagePageIndex: [imagePageIndex],
        filteredImages: [filteredImages, setFilteredImages],
        resegmentedSticker: [resegmentedSticker],
        annotatedLabels: [annotatedLabels]
    } = useContext(AppContext);

    const hasCountColors = colors.length > 0 && JSON.stringify(colors[0]) !== "{}";
    const isDisplayHistogram = hasCountColors && (editingMode === "painting" || editingMode === "sticker")
    // console.log("test-print-colors", colors, hasCountColors, editingMode, isDisplayHistogram)

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
        } else if (editingMode === "natural-image") {

        }
    };

    const handleStickerAnnotate = (e, index) => {
        if(e.button === 2) {
            if(activeSticker !== index) { // 选择哪个sticker被显示在下面的annotation-panel中
                setActiveSticker(index);
            } else {
                setActiveSticker(-1);
            }
        }
    }

    const annotatedStickers = [];
    annotatedLabels.forEach((anno) => annotatedStickers.push(anno.stickerIndex));

    const segItems = stickers.map((sticker, i) => {
        if(annotatedStickers.indexOf(i) !== -1) return null

        const displayedSegs = [];
        if(isDisplayHistogram) {
            // console.log("test-print-colors", i, colors[i])

            if(editingMode === "sticker" && i === currentIndex) { // 允许纹理为空
                displayedSegs.push(
                    <div className="Segment-item-image" key={`natural-seg-todo-${i}`} style={{width: "100%"}}>
                        <div className="Segment-tooltip-item" onClick={() => {
                            // update countedColors, trackedSegs, highlightSegs
                            const imageIndex = resegmentedSticker[0] % imageInOnePage;
                            filteredImages[imagePageIndex][imageIndex]["countedColors"][(resegmentedSticker[1] + 1).toString()] = {};
                            filteredImages[imagePageIndex][imageIndex]["trackedSegs"][(resegmentedSticker[1] + 1).toString()] = "";
                            filteredImages[imagePageIndex][imageIndex]["highlightSegs"][(resegmentedSticker[1] + 1).toString()] = {};
                            
                            setFilteredImages(JSON.parse(JSON.stringify(filteredImages)));
                            setCurrentIndex(-1);
                        }}>
                            <span className="STitle-text-contrast" style={{marginLeft: "0px", fontSize: "16px"}}>TODO</span>
                        </div>
                    </div>
                )
            }
        } else {
            if(i === currentIndex) {
                displayedSegs.push(
                    <div className="Segment-item-image" key={`natural-seg-todo-${i}`} style={{width: "100%"}}>
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
                            <img
                                key={`natural-seg-${i}-${m}`}
                                src={stickerForTrack[i][m].toDataURL()} 
                                alt=""
                                style={{
                                    marginLeft: "11px",
                                    width: `${segSize - 22}px`,
                                    height: `${segSize - 22}px`,
                                    objectFit: "contain"
                                }}
                            />
                        )
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
                    onMouseDown={(e) => handleStickerAnnotate(e, i)}
                    onContextMenu={(e) => e.preventDefault()}
                />
            </div>
            {
                isDisplayHistogram ?
                ((JSON.stringify(colors[i]) !== "{}" && colors[i] !== undefined) ?
                <div 
                    className="Segment-item-histogram"
                    style={{ width: `calc(100% - ${segSize}px - 8px)`}}
                >
                    {
                        (editingMode === "sticker" && i === currentIndex) ? displayedSegs :
                        <div className="Histogram-container">
                            <Histogram colors={colors[i]} height={segSize} stickerIndex={i}/>
                        </div>
                    }
                </div> : <></>) :
                <div
                    className="Segment-item-refs"
                    style={{ width: `calc(100% - ${segSize}px - 8px)`}}
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
                <span className="STitle-text-contrast" style={{marginLeft: "0px", fontSize: "16px"}}>
                    {isDisplayHistogram ? "Color DIST" : "Extra REFs"}
                </span>
            </div>
        </div>
        <div className="Segment-list-container">
            {segItems}
        </div>
    </div>
}
