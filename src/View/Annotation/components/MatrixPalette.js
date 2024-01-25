import "../../sharedCss.css";
import "./MatrixPalette.css";
import OpenCloseIcon from "../../../Icons/openclose.svg";
import { iconLevel1 } from "../../sharedConstants";
import { useEffect, useState } from "react";
import { MatrixVisualization } from "./MatrixVisualization";

export const MatrixPalette = ({
    matrixData,
    setMatrixData,
    matrixDistances,
    setMatrixDistances,
    matrixLabs,
    setMatrixLabs,
    setPlotIndex,
    hoveredScatter,
    plotIndex,
    targetColor,
    mixedStepState,
    changeMixedStepState,
    genMatrix,
    changeGenMatrix,
    changeMixedPigmentList,
    paletteInfo,
    changePaletteInfo,
}) => {
    // console.log("test-print-paletteInfo", paletteInfo)

    const [focusStep, setFocusStep] = useState(0);
    const [clickPosition, setClickPosition] = useState([[-1, -1]]);

    useEffect(() => {
        setFocusStep(0)
        setClickPosition([[-1, -1]])
    }, [targetColor])

    // 跳转距离直接hardcode吧，这样最准确
    const stepSize = 284.49 + 16;

    // 关键逻辑还是不对的。。
    const handleActionConduction = (actionType, hoverPosition, index) => {  // index means which color matrix palette
        const newClickPosition = JSON.parse(JSON.stringify(clickPosition));
        newClickPosition[index] = hoverPosition;

        let col = hoverPosition[0]
        let row = hoverPosition[1]

        // redo mixing
        if(index < matrixData.length - 1) {
            setMatrixData(current => current.slice(0, index + 1));
            changeGenMatrix(current => current.slice(0, index + 1));
            changeMixedStepState(current => current.slice(0, index + 1));
            changePaletteInfo(current => current.slice(0, index + 1));
        }

        // update mixedPigmentList
        const mixedPigments = JSON.parse(JSON.stringify(paletteInfo[index]['col'][col]))
        const rowPigments = paletteInfo[index]['row'][row];
        rowPigments.forEach((p) => mixedPigments.push(p));
        changeMixedPigmentList(mixedPigments);

        // TODO:这里分几种情况去给出逻辑: 1) 新的matrix添加至末尾；2）修改中间的matrix（未实现）
        // add matrix data to the list: actionType = 0, 1, 2并不好，可以改成语义"confirm", "quantity", "mixture"
        if(actionType === 0) {
            if(genMatrix.length === 0) {
                changeMixedStepState([[
                    matrixData[index]['col'][col],
                    matrixData[index]['row'][row],
                    matrixData[index]['mixed'][col][row],
                    matrixDistances[index]['focus'][col + 1][row + 1]
                ]])

            } else {
                if(genMatrix[genMatrix.length - 1] === 'q') {
                    mixedStepState[mixedStepState.length - 1] = [
                        matrixData[index]['col'][col],
                        matrixData[index]['row'][row],
                        matrixData[index]['mixed'][col][row],
                        matrixDistances[index]['focus'][col + 1][row + 1]
                    ];
                } else if (genMatrix[genMatrix.length - 1] === 'm') {
                    mixedStepState.push([
                        matrixData[index]['col'][col],
                        matrixData[index]['row'][row],
                        matrixData[index]['mixed'][col][row],
                        matrixDistances[index]['focus'][col + 1][row + 1]
                    ]);
                } else if (genMatrix[genMatrix.length - 1] === 's') {
                    mixedStepState[mixedStepState.length - 1] = [
                        matrixData[index]['col'][col],
                        matrixData[index]['row'][row],
                        matrixData[index]['mixed'][col][row],
                        matrixDistances[index]['focus'][col + 1][row + 1]
                    ];
                }
                changeMixedStepState(JSON.parse(JSON.stringify(mixedStepState)));
            }
            genMatrix.push('s');
            changeGenMatrix(JSON.parse(JSON.stringify(genMatrix)));
        
        } else if (actionType === 1) {
            let body = {
                option: 'q', 
                target_color: targetColor, 
                selected_coord: hoverPosition, 
                matrix_num: index
            }
            fetch("http://localhost:8000/gen_matrix", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })
            .then(response => response.json())
            .then(data => {
                console.log("data from server.py:", data)
                setMatrixData(current => [...current, data.colors])
                setMatrixDistances(current => [...current, data.colors_with_dist])
                setMatrixLabs(current => [...current, data.lab_colors.lab_space])
                changePaletteInfo(current => [...current, data.palette])

                if(index === 0) {
                    changeMixedStepState([[
                        matrixData[index]['col'][col],
                        matrixData[index]['row'][row],
                        matrixData[index]['mixed'][col][row],
                        matrixDistances[index]['focus'][col + 1][row + 1]
                    ]])

                } else {
                    if(genMatrix[genMatrix.length - 1] === 'q') {
                        mixedStepState[mixedStepState.length - 1] = [
                            matrixData[index]['col'][col],
                            matrixData[index]['row'][row],
                            matrixData[index]['mixed'][col][row],
                            matrixDistances[index]['focus'][col + 1][row + 1]
                        ];
                    } else if (genMatrix[genMatrix.length - 1] === 'm') {
                        mixedStepState.push([
                            matrixData[index]['col'][col],
                            matrixData[index]['row'][row],
                            matrixData[index]['mixed'][col][row],
                            matrixDistances[index]['focus'][col + 1][row + 1]
                        ]);
                    } else if (genMatrix[genMatrix.length - 1] === 's') {
                        mixedStepState[mixedStepState.length - 1] = [
                            matrixData[index]['col'][col],
                            matrixData[index]['row'][row],
                            matrixData[index]['mixed'][col][row],
                            matrixDistances[index]['focus'][col + 1][row + 1]
                        ];
                    }
    
                    changeMixedStepState(JSON.parse(JSON.stringify(mixedStepState)));
                }

                genMatrix.push('q');
                changeGenMatrix(JSON.parse(JSON.stringify(genMatrix)));
            })
            .catch(error => console.error("Error fetching data:", error));

        } else if (actionType === 2) {
            let body = { 
                option: 'm', 
                target_color: targetColor, 
                selected_coord: hoverPosition, 
                matrix_num: index 
            }
            fetch("http://localhost:8000/gen_matrix", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })
            .then(response => response.json())
            .then(data => {
                console.log("data from server.py:", data)
                setMatrixData(current => [...current, data.colors])
                setMatrixDistances(current => [...current, data.colors_with_dist])
                setMatrixLabs(current => [...current, data.lab_colors.lab_space])
                changePaletteInfo(current => [...current, data.palette])
                
                if(index === 0) {
                    console.log("test-mixture-enter-index0")
                    changeMixedStepState([[
                        matrixData[index]['col'][col],
                        matrixData[index]['row'][row],
                        matrixData[index]['mixed'][col][row],
                        matrixDistances[index]['focus'][col + 1][row + 1]
                    ]])
                } else {
                    if(genMatrix[genMatrix.length - 1] === 'q') {
                        mixedStepState[mixedStepState.length - 1] = [
                            matrixData[index]['col'][col],
                            matrixData[index]['row'][row],
                            matrixData[index]['mixed'][col][row],
                            matrixDistances[index]['focus'][col + 1][row + 1]
                        ];
                    } else if (genMatrix[genMatrix.length - 1] === 'm') {
                        mixedStepState.push([
                            matrixData[index]['col'][col],
                            matrixData[index]['row'][row],
                            matrixData[index]['mixed'][col][row],
                            matrixDistances[index]['focus'][col + 1][row + 1]
                        ]);
                    } else if (genMatrix[genMatrix.length - 1] === 's') {
                        mixedStepState[mixedStepState.length - 1] = [
                            matrixData[index]['col'][col],
                            matrixData[index]['row'][row],
                            matrixData[index]['mixed'][col][row],
                            matrixDistances[index]['focus'][col + 1][row + 1]
                        ];
                    }
                    changeMixedStepState(JSON.parse(JSON.stringify(mixedStepState)));
                }

                genMatrix.push('m');
                changeGenMatrix(JSON.parse(JSON.stringify(genMatrix)));
            })
            .catch(error => console.error("Error fetching data:", error));
        }

        if(actionType === 1 || actionType === 2) {
            newClickPosition.push([-1, -1]);
            // setFocusStep(matrixData.length - 2); // 可能因为异步这里有点问题
            setFocusStep(matrixData.length - 1);
        }
        setClickPosition(newClickPosition);
    }

    // move the scroll
    useEffect(() => {
        if(matrixData.length > 2) {
            const srollElement = document.getElementById("paletteList");
            // console.log("test-focusStep", focusStep)
            srollElement.scrollLeft = focusStep * stepSize
        }

    }, [matrixData, stepSize, focusStep])


    const matrixItems = matrixData.map((data, index) => {
        const floatDirection = (index - focusStep) % 2 === 0 ? true : false;
        return <div
            key={`matrix-item-${index}`} 
            className="Matrix-item-container"
            style={{
                marginRight: `${index === matrixData.length - 1 ? 0 : 16}px`,
            }}
        >
            <MatrixVisualization 
                index={index} 
                data={data}
                matrixDist={matrixDistances}
                matrixLab={matrixLabs}
                floatDirection={floatDirection} 
                changeActionType={handleActionConduction}
                clickPosition={clickPosition[index]}
                setPlotIndex={setPlotIndex}
                hoveredScatter={index === plotIndex ? hoveredScatter : [-1, -1]}
            />
        </div>
    })

    return <div className="SDefault-container" style={{display: "flex"}}>
        <div className="Swtich-button-container">
            <div className="Icon-button"
                style={{
                    background: `url(${OpenCloseIcon}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconLevel1}px`,
                    height: `${iconLevel1}px`,
                    transform: "rotate(-90deg)",
                    cursor: 'pointer',
                }}
                onClick={() => setFocusStep(Math.max(0, focusStep - 1))}
            />
        </div>
        <div className="Palette-container">
            <div className="Palette-list" id="paletteList">
                {matrixItems}
            </div>
        </div>
        <div className="Swtich-button-container">
            <div className="Icon-button"
                style={{
                    background: `url(${OpenCloseIcon}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconLevel1}px`,
                    height: `${iconLevel1}px`,
                    transform: "rotate(90deg)",
                    cursor: 'pointer',
                }}
                onClick={() => setFocusStep(Math.min(matrixData.length - 2, focusStep + 1))}
            />
        </div>
    </div>
}