import { useEffect, useRef, useState, useContext } from "react";
import "../../sharedCss.css"
import "./PaintingBoard.css"
import { adaptWH } from "../../utils";
import LoadingModal from "./LoadingModal";
import Canvas from "./Canvas";
import AppContext from "../../hooks/createContext";

const imgSrc = "/demoData/paintings/1.png";

export const PaintingBoard = ({
    konvaRef,
    scale,
    handleMouseUp,
    handleMouseDown,
    hasClicked,
    handleResetState,
    currentScale,
    setCurrentScale,
}) => {
    const {
        showLoadingModal: [showLoadingModal,],
        image: [image,],
    } = useContext(AppContext);
    // canvas大小
    const canvasRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState([0, 0]);
    const [canvasOffset, setCanvasOffset] = useState([0, 0]);
    useEffect(() => {
        setCanvasSize([
            canvasRef.current?.clientWidth || 0,
            canvasRef.current?.clientHeight || 0
        ]);

        setCanvasOffset([
            canvasRef.current?.getBoundingClientRect().x || 0,
            canvasRef.current?.getBoundingClientRect().y || 0
        ])
    }, [canvasRef])

    const [currentWH, setCurrentWH] = useState([0, 0]);
    const [currentLT, setCurrentLT] = useState([0, 0]);
    const maxScale = 10;
    const minScale = 0.1;

    // painting显示初始化
    useEffect(() => {
        if (canvasSize[0] > 0 && image) {
            const tagSize = adaptWH([image.width, image.height], canvasSize);
            const orgSize = [image.width, image.height];
            let newScale = Math.max(minScale, tagSize[1] / orgSize[1]);
            newScale = Math.min(maxScale, newScale);
            const left = (canvasSize[0] - tagSize[0]) / 2;
            const top = (canvasSize[1] - tagSize[1]) / 2;
            console.log(newScale);
            setCurrentScale(newScale);
            setCurrentWH(orgSize);
            setCurrentLT([left, top]);
        }
    }, [canvasSize, image])

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

    // 缩放
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

    return <div
        className="SDefault-container"
        ref={canvasRef}
        style={{ position: "relative", overflow: "hidden" }}
    >
        <div
            style={{
                width: `${currentWH[0] * currentScale}px`,
                height: `${currentWH[1] * currentScale}px`,
                position: "absolute",
                zIndex: "50",
                left: `${currentLT[0]}px`,
                top: `${currentLT[1]}px`,
                // background: `url(${imgSrc}) no-repeat`,
                // backgroundSize: '100% 100%',
            }}
            onMouseDown={(e) => handleDragStart(e)}
            onMouseMove={(e) => handleDragMove(e)}
            onMouseUp={(e) => handleDragEnd(e)}
            onWheel={(e) => handleWheelChange(e)}
        >
            {image ? (
                <>
                    <LoadingModal />
                    <Canvas
                        konvaRef={konvaRef}
                        scale={scale}
                        handleMouseUp={handleMouseUp}
                        handleMouseDown={handleMouseDown}
                        hasClicked={hasClicked}
                        currentWH={currentWH}
                        currentScale={currentScale}
                    />
                </>
            ) : <></>
            }
        </div>
    </div>
}