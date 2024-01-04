import "./SegmentViewer.css"
import "../../sharedCss.css"
import "../index.css"
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import AppContext from "../../hooks/createContext";
import { adaptWH } from "../../utils";
import { Image, Layer, Stage } from "react-konva";
import ReSegmentSVG from "../../../Icons/resegment.svg";

export const SegmentViewer = ({
    imageIndex = -1,
    imageInOnePage = 50,
}) => {
    const {
        filteredImages: [filteredImages],
        chosenStickers: [chosenStickers],
    } = useContext(AppContext);

    const chosenList = Array.from(chosenStickers);
    const [focusedImage, setFocusedImage] = useState(null);

    /****************** copy from PaintingBoard.js 👇 *********************/
    const canvasRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState([0, 0]);
    const [canvasOffset, setCanvasOffset] = useState([0, 0]);

    useEffect(() => {
        setCanvasSize([
            canvasRef.current?.clientWidth || 0,
            canvasRef.current?.clientHeight || 0
        ])

        setCanvasOffset([
            canvasRef.current?.getBoundingClientRect().x || 0,
            canvasRef.current?.getBoundingClientRect().y || 0
        ])
    }, [canvasRef])

    const [originSize, setOriginSize] = useState([0, 0]);
    const [currentWH, setCurrentWH] = useState([0, 0]);
    const [currentLT, setCurrentLT] = useState([0, 0]);
    const [currentScale, setCurrentScale] = useState(1);
    const maxScale = 10;
    const minScale = 1;

    // painting显示初始化
    useEffect(() => {
        if (canvasSize[0] > 0 && imageIndex !== -1) {
            let imagePath = ""; // img url
            for(let i = 0; i < filteredImages.length; i++) {
                for(let j = 0; j < filteredImages[i].length; j++) {
                    if(filteredImages[i][j]["index"] === imageIndex) {
                        imagePath = filteredImages[i][j]["contentUrl"];
                        break
                    }
                }
                if(imagePath !== "") break
            }
            
            // console.log("test-print-imagePath", imageIndex, imagePath);  // [406, 262]

            const url = new File([imagePath], imagePath);
            const img = new window.Image();
            img.src = url.name;

            img.onload = () => {
                const originSize = [img.width, img.height];
                const tagSize = adaptWH(originSize, canvasSize);
                const left = (canvasSize[0] - tagSize[0]) / 2;
                const top = (canvasSize[1] - tagSize[1]) / 2;
                img.width = tagSize[0];
                img.height = tagSize[1];

                setOriginSize(originSize);
                setCurrentWH(tagSize);
                setCurrentLT([left, top]);
                setFocusedImage(img);
                setCurrentScale(1);
            }
        }
    }, [canvasSize, imageIndex, filteredImages])

    // 拖拽
    const [isMaskDrag, setIsMaskDrag] = useState(false);
    const [maskMoveP, setMaskMoveP] = useState([0, 0]);

    const handleDragStart = (e) => {
        setIsMaskDrag(true);
        setMaskMoveP([
            e.clientX,
            e.clientY,
        ]);
    }
    const handleDragMove = (e) => {
        if (isMaskDrag) {
            if (e.clientX !== maskMoveP[0] || e.clientY !== maskMoveP[1]) {
                setCurrentLT([
                    currentLT[0] + e.clientX - maskMoveP[0],
                    currentLT[1] + e.clientY - maskMoveP[1],
                ]);
                setMaskMoveP([
                    e.clientX,
                    e.clientY
                ])
            }
        }
    }
    const handleDragEnd = (e) => {
        if (isMaskDrag) {
            setIsMaskDrag(false);
            setMaskMoveP([0, 0]);
        }
    }
    const handleWheelChange = (e) => {
        const v = e.deltaY;
        let newScale = 1;
        const currentScaleRecord = currentScale;
        if (v < 0) {
            newScale = Math.min(maxScale, currentScale * 1.25);
            setCurrentScale(newScale);

        } else if (v > 0) {
            newScale = Math.max(minScale, currentScale / 1.25);
            setCurrentScale(newScale);
        }

        // new feat: 缩放时focus不变
        const deltaX = e.clientX - canvasOffset[0] - currentLT[0];
        const deltaY = e.clientY - canvasOffset[1] - currentLT[1];

        setCurrentLT([
            currentLT[0] - ((newScale - currentScaleRecord) / currentScaleRecord) * deltaX,
            currentLT[1] - ((newScale - currentScaleRecord) / currentScaleRecord) * deltaY,
        ])
    }

    /****************** copy from PaintingBoard.js 👆 *********************/
    
    const [hoveredSticker, setHoveredSticker] = useState(-1); 
    const handleMouseEnter = (stickerIndex) => {
        if(hoveredSticker !== stickerIndex) setHoveredSticker(stickerIndex)
    }

    // console.log("test-print-hoveredSticker", hoveredSticker)

    const hoveredStickerImage = useMemo(() => {
        if(hoveredSticker === -1 || imageIndex === -1) return null

        const highlightInfo = filteredImages[Math.floor(imageIndex / imageInOnePage)][imageIndex % imageInOnePage]["highlightSegs"];
        const stickerHighlight = highlightInfo[hoveredSticker + 1];
        const stickerHighlightImage = stickerHighlight["highlight"];
        const stickerHighlightCoord = stickerHighlight["coordinates"]; // [sx, ex, sy, ey]
        const displayScale = (currentWH[0] * currentScale) / originSize[0];

        // 前后端图片大小本身不同
        // console.log("test-print-stickerHighlightCoord", hoveredSticker, stickerHighlightCoord)
        // console.log("test-print-originSize", originSize, currentWH[0], currentScale, displayScale)

        return <img 
            src={`data:image/png;base64,${stickerHighlightImage}`} 
            alt=""
            style={{
                width: `${(stickerHighlightCoord[1] - stickerHighlightCoord[0]) * displayScale}px`,
                height: `${(stickerHighlightCoord[3] - stickerHighlightCoord[2]) * displayScale}px`,
                position: "absolute",
                zIndex: "100",
                left: `${stickerHighlightCoord[0] * displayScale}px`,
                top: `${stickerHighlightCoord[2] * displayScale}px`,
            }}
        />
    }, [hoveredSticker, imageIndex, filteredImages, imageInOnePage, currentScale, originSize, currentWH])

    return <div className="SDefault-container">
        <div className="Detail-view-image-container" ref={canvasRef}>
            <div
                style={{
                    width: `${currentWH[0] * currentScale}px`,
                    height: `${currentWH[1] * currentScale}px`,
                    position: "absolute",
                    zIndex: "50",
                    left: `${currentLT[0]}px`,
                    top: `${currentLT[1]}px`,
                }}
                onMouseDown={(e) => handleDragStart(e)}
                onMouseMove={(e) => handleDragMove(e)}
                onMouseUp={(e) => handleDragEnd(e)}
                onWheel={(e) => handleWheelChange(e)}
            >         
                <Stage
                    width={currentWH[0] * currentScale}
                    height={currentWH[1] * currentScale}
                >
                    <Layer name="natural-image">
                        <Image
                            x={0}
                            y={0}
                            image={focusedImage}
                            width={currentWH[0] * currentScale}
                            height={currentWH[1] * currentScale}
                            opacity={1}
                            preventDefault={false}
                        />
                    </Layer>
                </Stage>

                {hoveredStickerImage !== null && hoveredStickerImage}
            </div>
        </div>

        <div className="Detail-view-segment-container segmentList">
        {
            imageIndex !== -1 && chosenList.map((el, i) => {
                const trackedSegs = filteredImages[Math.floor(imageIndex / imageInOnePage)][imageIndex % imageInOnePage]["trackedSegs"];

                return <div
                    key={`detail-segment-${i}`}
                    className="R-segmentation-image"
                    style={{
                        width: `calc(33.3333% - ${2.677}px)`,
                        marginRight: i === chosenList.length - 1 ? "0px" : "4px",
                    }}
                    onMouseEnter={() => handleMouseEnter(el)}
                    onMouseLeave={() => setHoveredSticker(-1)}
                >
                    <div className="Reference-image">
                    {
                        JSON.stringify(trackedSegs) !== "{}" && trackedSegs[el + 1] !== "" ?
                        <img 
                            src={`data:image/png;base64,${trackedSegs[el + 1]}`}
                            alt=""
                        /> : <></>
                    }
                    </div>

                    <div className="R-segmentation-mask">
                        <button>
                            <div
                                style={{
                                    background: `url(${ReSegmentSVG}) no-repeat`,
                                    backgroundSize: 'contain',
                                    width: `${48}px`,
                                    height: `${48}px`,
                                    cursor: 'pointer',
                                }}
                            />
                        </button>
                    </div>
                </div>
            })
        }
        </div>
    </div>
}
