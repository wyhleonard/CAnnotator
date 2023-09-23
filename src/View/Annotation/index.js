import "../sharedCss.css";
import { MatrixPalette } from "./components/MatrixPalette";
import { MixingMethod } from "./components/MixingMethod";
import { SpacePlot } from "./components/SpacePlot";
import LeftIcon from "../../Icons/triangle.svg";
import "./index.css";
import { useState, useEffect, useRef } from "react";
import { AnnotationPanel } from "./components/AnnotationPanel";

const demoSrc = "/demoData/annotations/2.png";
const demoSpace = 1;
const iconSize = 15;
const gridSize = 14;

const dropdownContent = ["a * b", "L * a", "L * b"];


export const AnnotationView = (props) => {

    const [isDropdown, setIsDropdown] = useState(false);
    const [selectedSpace, setSelectSpace] = useState(0);

    const [matrices, setMatrices] = useState([])
    const [originalPigments, setOriginalPigments] = useState([])
    const [pigments, setPigments] = useState([])
    const [mixedPigments, setMixedPigments] = useState([])
    const [pigmentChanged, setPigmentChanged] = useState(true)
    const [pigmentConfirmed, setPigmentConfirmed] = useState(false)
    // const concentrations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16]
    const [targetColor, setTargetColor] = useState('#22ADC1')
    // const [matrices, setMatrices] = useState([])
    // const [distMatrices, setDistMatrices] = useState([])
    // const [coord, setCoord] = useState({row: 0, col: 0})
    // const [genMatrix, setGenMatrix] = useState([])
    // const [idx, setIdx] = useState(-1)
    // const [recordSeq, setRecordSeq] = useState([])
    // const [lastConcentration, setLastConcentration] = useState(0)
    // const [mixedColor, setMixedColor] = useState(null)
    // const [color1, setColor1] = useState(null);
    // const [color2, setColor2] = useState(null);
    // const [mixedColorQuantity, setMixedColorQuantity] = useState(1);
    // const [color1Quantity, setColor1Quantity] = useState(1);
    // const [color2Quantity, setColor2Quantity] = useState(1);
    // const [dist, setDist] = useState(null)
    // const [result, setResult]= useState([])
    // const [labColors, setLabColors] = useState(null);
    // const [subtleMixedColor, setSubtleMixedColor] = useState(null)
    // const [subtleMixedColorQuantity, setSubtleMixedColorQuantity] = useState(1)
    // const [scatterIndex, setScatterIndex] = useState(-1)
    // const [scatterSeq, setScatterSeq] = useState([])
    // const [resultSeq, setResultSeq] = useState([])

    // update matrix
    // useEffect(() => {
    //     // console.log('selection: ', coord, genMatrix)
    //     if(targetColor) {
    //         let last = genMatrix.length - 1
    //         // if(genMatrix[last].option === 'q') {
    //         //     setRecordSeq(current => [...current, {color: {rgb: matrices[last].colors[coord.row*gridSize+coord.col], quantity: 1}, operator: '>'}])
    //         //     setLastConcentration(1)
    //         //     // recordSeq[recordSeq.length-1] = {color: {rgb: matrices[last].colors[coord.row*gridSize+coord.col], quantity: 1}, operator: '>'}
    //         // }
    //         // else if(genMatrix[last].option === 'm') {
    //         //     setRecordSeq(current => [...current, {color: [{rgb: '#FFFFFF', quantity: 1}, {rgb: matrices[last].colors[coord.row*gridSize+coord.col], quantity: lastConcentration+1}], operator: '+'}])
    //         //     setLastConcentration(current => current + 1)
    //         //     // recordSeq[recordSeq.length-1] = {color: [{rgb: matrices[last].colors[coord.col], quantity: concentrations[coord.col-1]}, {rgb: matrices[last].colors[coord.row*gridSize+coord.col], quantity: 1}], operator: '+'}
    //         // }
    //         let body = { option: genMatrix[last], target_color: targetColor, selected_coord: coord, matrix_num: matrixNum }
    //         fetch("http://localhost:8000/gen_matrix", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(body),
    //         })
    //         .then(response => response.json())
    //         .then(data => {
    //             setMatrices(current => [...current, data.colors])
    //             // setIdx(current => current + 1)
    //             // setDistMatrices(current => [...current, data.colors_with_dist])
    //             // setScatterSeq(current => [...current, data.lab_colors])
    //             // setScatterIndex(current => current + 1)
    //             })
    //             .catch(error => console.error("Error fetching data:", error));
    //     }
    // }, [genMatrix])

    // initialize matrix
    useEffect(() => {
        if (targetColor) {
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
                    // setIdx(0)
                    // setDistMatrices([data.colors_with_dist])
                    // setScatterSeq(current => [...current, data.lab_colors])
                    // setScatterIndex(current => current + 1)
                })
                .catch(error => console.error("Error fetching data:", error));
        }
    }, [targetColor])

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
            // props.setTargetColor(hexColor);
            console.log(hexColor)
            setEnableSelect(false);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = props.imageSrc;
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
        img.onerror = () => {
            console.log('error in loading!')
        };
    });

    // update distance and mixing method
    // useEffect(() => {
    //     if(targetColor) {
    //         let last = matrices.length - 1
    //         if(last === 0) {
    //             setRecordSeq([{color: [{rgb: matrices[0].colors[coord.col], quantity: 1}, {rgb: matrices[0].colors[coord.row*gridSize], quantity: 1}, {rgb: matrices[0].colors[coord.row*gridSize+coord.col], quantity: 2}], operator: 'i'}])
    //             setLastConcentration(2)
    //         }
    //         else if(last > 0) {
    //             if(genMatrix[last-1].option === 'q') {
    //             // setRecordSeq(current => [...current, {color: {rgb: matrices[last].colors[coord.row*gridSize+coord.col], quantity: 1}, operator: '>'}])
    //                 setRecordSeq(current => [...(current.slice(0, current.length-1)), {color: {rgb: matrices[last].colors[coord.row*gridSize+coord.col], quantity: 1}, operator: '>'}])
    //             }
    //             else if(genMatrix[last-1].option === 'm') {
    //             // setRecordSeq(current => [...current, {color: [{rgb: matrices[last].colors[coord.col], quantity: concentrations[coord.col-1]}, {rgb: matrices[last].colors[coord.row*gridSize+coord.col], quantity: 1}], operator: '+'}])
    //                 setRecordSeq(current => [...(current.slice(0, current.length-1)), {color: [{rgb: matrices[last].colors[coord.col], quantity: 1}, {rgb: matrices[last].colors[coord.row*gridSize+coord.col], quantity: lastConcentration}], operator: '+'}])
    //             }
    //         }
    //         setDist(distMatrices[last][coord.col*gridSize+coord.row])
    //     }
    // }, [coord])

    // const decIdx = () => {
    //     if(idx > 1)
    //     setIdx(current => current - 1)
    // }

    // const incIdx = () => {
    //     if(idx < matrices.length - 1)
    //     setIdx(current => current + 1)
    // }

    // const saveColorInMatrix = () => {
    //     let last = matrices.length - 1
    //     setMixedColor(matrices[last].colors[coord.row*gridSize+coord.col])
    //     setColor1(matrices[last].colors[coord.col])
    //     setColor2(matrices[last].colors[coord.row*gridSize])
    //     if(genMatrix.length === 0) {
    //         setColor1Quantity(1)
    //         setColor2Quantity(1)
    //         setMixedColorQuantity(2)
    //     }
    //     else if(genMatrix[genMatrix.length-1].option === 'q') {
    //         setColor1Quantity(concentrations[coord.col-1])
    //         setColor2Quantity(concentrations[coord.row-1])
    //         setMixedColorQuantity(concentrations[coord.col-1] + concentrations[coord.row-1])
    //     }
    //     else if(genMatrix[genMatrix.length-1].option === 'm') {
    //         setColor1Quantity(1)
    //         setColor2Quantity(concentrations[coord.row-1])
    //         setMixedColorQuantity(concentrations[coord.row-1] + 1)
    //     }
    // }

    // const saveColorInPalette = () => {
    //     setResult(current => [...current, subtleMixedColor])
    //     setResultSeq(current => [...current, recordSeq])
    //     setTargetColor(null)
    //     setMatrices([])
    //     setDistMatrices([])
    //     setGenMatrix([])
    //     setIdx(-1)
    //     setRecordSeq([])
    //     setLastConcentration(0)
    //     setMixedColor(null)
    //     setColor1(null)
    //     setColor2(null)
    //     setMixedColorQuantity(1)
    //     setColor1Quantity(1)
    //     setColor2Quantity(1)
    //     setDist(null)
    //     setScatterSeq([])
    //     setScatterIndex(-1)
    //     // setTargetLab(null)
    // }

    const spaceItems = dropdownContent.map((space, index) => {
        return <div
            key={`space-item-${index}`}
            className="Space-item"
            onClick={() => {
                setSelectSpace(index);
                setIsDropdown(false);
            }}
        >
            <span style={{ marginLeft: "4px" }}>{space}</span>
        </div>
    })

    return <div className="SView-container" style={{ display: "flex", alignItems: "center" }}>
        <div className="A-Reference-container">
            {/* <img className="A-Reference-image" src={props.imageSrc} alt="" /> */}
            <canvas 
                ref={canvasRef} 
                onClick={handleCanvasClick} 
                width={360}
                height={360}
                // className="A-Reference-image"
            />
        </div>
        <div className="Annotation-panel-container">
            <AnnotationPanel
                pigments={pigments}
                targetColor={targetColor}
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
                />
            </div>
            <div className="MatrixSpace-display-container">
                <MatrixPalette
                    matrixData={matrices}
                    setMatrixData={setMatrices}
                    pigmentChanged={pigmentChanged}
                    setOriginalPigments={setOriginalPigments}
                    setPigmentChanged={setPigmentChanged}
                    pigments={pigments}
                    setPigments={setPigments}
                    mixedPigments={mixedPigments}
                    setMixedPigments={setMixedPigments} />
            </div>
        </div>
        <div className="Annotation-space-container">
            <div className="MatrixSpace-title-container">
                <span className="STitle-text-contrast" style={{ fontSize: "16px" }}>{`Displayed Space: 【${demoSpace}】`}</span>
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
                />
            </div>
        </div>
    </div>
}
