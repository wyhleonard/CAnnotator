import "../sharedCss.css";
import { MatrixPalette } from "./components/MatrixPalette";
import { MixingMethod } from "./components/MixingMethod";
import { SpacePlot } from "./components/SpacePlot";
import LeftIcon from "../../Icons/triangle.svg";
import "./index.css";
import { useState, useEffect, useRef, useMemo } from "react";
import { AnnotationPanel } from "./components/AnnotationPanel";
import { adaptWH } from "../utils";

const demoSrc = "/demoData/annotations/2.png";
const demoSpace = 1;
const iconSize = 15;
const gridSize = 14;

const dropdownContent = ["a * b", "L * a", "L * b"];


export const AnnotationView = ({
    imageSrc
}) => {

    const [isDropdown, setIsDropdown] = useState(false);
    const [selectedSpace, setSelectSpace] = useState(0);

    const [matrices, setMatrices] = useState([])
    const [matrixDistances, setMatrixDistances] = useState([])
    const [matrixLabs, setMatrixLabs] = useState([])
    const [paletteInfo, setPaletteInfo] = useState([])

    const [originalPigments, setOriginalPigments] = useState([])
    const [pigments, setPigments] = useState([])
    const [mixedPigments, setMixedPigments] = useState([])
    const [pigmentChanged, setPigmentChanged] = useState(true)
    const [pigmentConfirmed, setPigmentConfirmed] = useState(false)

    // new state - wyh
    const [mixedPigmentList, setMixedPigmentList] = useState([]); // 后端可以传
    const [mixedStepState, setMixedStepState] = useState([]);
    const [genMatrix, setGenMatrix] = useState([]);

    const [plotIndex, setPlotIndex] = useState(0);
    const [targetColor, setTargetColor] = useState("#fff");
    const [targetColorCoordinate, setTargetColorCoordinate] = useState([]);

    // hover in scatterplot
    const [hoveredScatter, setHoveredScatter] = useState([-1, -1])

    // initialize matrix
    useEffect(() => {
        if (targetColor !== "#fff") {
            let body = { option: 'i', target_color: targetColor, selected_coord: [0, 0], matrix_num: -1 }
            fetch("http://localhost:8000/gen_matrix", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })
                .then(response => response.json())
                .then(data => {
                    setMatrices([data.colors])
                    setMatrixDistances([data.colors_with_dist])
                    setMatrixLabs([data.lab_colors.lab_space])
                    setTargetColorCoordinate(data.lab_colors.target_color.position)
                    setPaletteInfo([data.palette])
                })
                .catch(error => console.error("Error fetching data:", error));
        }
    }, [targetColor])

    // 取色
    const canvasRef = useRef(null);
    const [enableSelect, setEnableSelect] = useState(false);
    const handleCanvasClick = (e) => {
        if (enableSelect) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            const x = e.nativeEvent.offsetX;
            const y = e.nativeEvent.offsetY;

            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const hexR = pixel[0].toString(16).padStart(2, '0');
            const hexG = pixel[1].toString(16).padStart(2, '0');
            const hexB = pixel[2].toString(16).padStart(2, '0');
            const hexColor = `#${hexR}${hexG}${hexB}`;
            setTargetColor(hexColor);
            console.log(hexColor)
            setEnableSelect(false);
        }
    };

    // 添加跟painting board一样的交互逻辑 83 - 190
    const canvasContainerRef = useRef(null);
    const [canvasSize, setCanvasSize] = useState([0, 0]);
    const [canvasOffset, setCanvasOffset] = useState([0, 0]);
    useEffect(() => {
        setCanvasSize([
            canvasContainerRef.current?.clientWidth || 0,
            canvasContainerRef.current?.clientHeight || 0
        ])
        setCanvasOffset([
            canvasContainerRef.current?.getBoundingClientRect().x || 0,
            canvasContainerRef.current?.getBoundingClientRect().y || 0
        ])
    }, [canvasContainerRef])

    const [currentWH, setCurrentWH] = useState([0, 0]);
    const [currentLT, setCurrentLT] = useState([0, 0]);
    const [currentScale, setCurrentScale] = useState(1);
    const maxScale = 10;
    const minScale = 0.1;

    const [currentRefer, setCurrentRefer] = useState(null);

    // painting显示初始化
    useEffect(() => {
        if (canvasSize[0] > 0 && imageSrc !== "") {
            const img = new Image();
            img.src = imageSrc;
            img.onload = () => {
                const tagSize = adaptWH([img.width, img.height], canvasSize);
                const orgSize = [img.width, img.height];
                let newScale = Math.max(minScale, tagSize[1] / orgSize[1]);
                newScale = Math.min(maxScale, newScale);
                const left = (canvasSize[0] - tagSize[0]) / 2;
                const top = (canvasSize[1] - tagSize[1]) / 2;
                setCurrentScale(newScale);
                setCurrentWH(orgSize);
                setCurrentLT([left, top]);
                setCurrentRefer(img);
            };
            img.onerror = () => {
                console.log('error in loading!')
            };
        }
    }, [canvasSize, imageSrc])

    // 交互后canvas需要重绘
    useEffect(() => {
        if(currentWH[0] > 0) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(currentRefer, 0, 0, currentWH[0] * currentScale, currentWH[1] * currentScale);
        }
    }, [currentWH, currentScale, currentRefer])

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

    const scatterData = useMemo(() => {
        if(matrixLabs.length > 0)
            return matrixLabs[plotIndex]
        else
            return []
    }, [matrixLabs, plotIndex])

    // console.log("test-scatterData", plotIndex, matrixLabs, scatterData)

    const spaceItems = dropdownContent.map((space, index) => {
        return <div
            key={`space-item-${index}`}
            className="Space-item"
            onClick={() => {
                console.log("plot mode changed to ",index);
                setSelectSpace(index);
                setIsDropdown(false);
            }}
        >
            <span style={{ marginLeft: "4px" }}>{space}</span>
        </div>
    })

    return <div className="SView-container" style={{ display: "flex", alignItems: "center" }}>
        <div className="A-Reference-container">
            <div className="A-Reference-image-container" ref={canvasContainerRef}>
                <canvas 
                    ref={canvasRef} 
                    width={currentWH[0] * currentScale}
                    height={currentWH[1] * currentScale}
                    style={{
                        position: "absolute",
                        zIndex: "50",
                        left: `${currentLT[0]}px`,
                        top: `${currentLT[1]}px`,
                    }}
                    onClick={handleCanvasClick}
                    onMouseDown={(e) => handleDragStart(e)}
                    onMouseMove={(e) => handleDragMove(e)}
                    onMouseUp={(e) => handleDragEnd(e)}
                    onWheel={(e) => handleWheelChange(e)}
                />
            </div>
        </div>
        <div className="Annotation-panel-container">
            <AnnotationPanel
                pigments={pigments}
                targetColor={targetColor} setTargetColor={setTargetColor}
                selectedOriginalPigments={originalPigments}
                selectedSticker="/demoData/segmentations/6.png"
                pigmentConfirmed={pigmentConfirmed}
                mixedPigments={mixedPigments}
                setEnableSelect={setEnableSelect}
            />
        </div>
        <div className="Annotation-mixing-container">
            <div className="MatrixSpace-title-container">
                <MixingMethod
                    pigments={pigments}
                    mixedPigments={mixedPigments}
                    pigmentChanged={pigmentChanged}
                    setPigmentConfirmed={setPigmentConfirmed}
                    mixedStepState={mixedStepState}
                    genMatrix={genMatrix}
                />
            </div>
            <div className="MatrixSpace-display-container">
                <MatrixPalette
                    matrixData={matrices} setMatrixData={setMatrices}
                    matrixDistances={matrixDistances} setMatrixDistances={setMatrixDistances}
                    matrixLabs={matrixLabs} setMatrixLabs={setMatrixLabs}
                    pigmentChanged={pigmentChanged} setPigmentChanged={setPigmentChanged}
                    setOriginalPigments={setOriginalPigments}
                    pigments={pigments} setPigments={setPigments}
                    mixedPigments={mixedPigments} setMixedPigments={setMixedPigments} 
                    setPlotIndex={setPlotIndex} hoveredScatter={hoveredScatter}
                    plotIndex={plotIndex} targetColor={targetColor}
                    mixedStepState={mixedStepState}
                    changeMixedStepState={setMixedStepState}
                    genMatrix={genMatrix}
                    changeGenMatrix={setGenMatrix}
                    changeMixedPigmentList={setMixedPigmentList}
                    paletteInfo={paletteInfo}
                    changePaletteInfo={setPaletteInfo}
                />
            </div>
        </div>
        <div className="Annotation-space-container">
            <div className="MatrixSpace-title-container">
                <span className="STitle-text-contrast" style={{ fontSize: "16px" }}>{`Displayed Space:【${targetColor === "#fff" ? 0 : plotIndex + 1}】`}</span>
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
                <SpacePlot
                    spaceIndex={selectedSpace}
                    matrixLabData={scatterData}
                    targetColor={{
                        "position": targetColorCoordinate,
                        "color": targetColor
                    }}
                    hoveredScatter={hoveredScatter}
                    changeHoveredScatter={setHoveredScatter}
                />
            </div>
        </div>
    </div>
}
