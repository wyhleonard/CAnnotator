import "../../sharedCss.css";
import "./MatrixPalette.css";
import OpenCloseIcon from "../../../Icons/openclose.svg";
import { iconLevel1 } from "../../sharedConstants";
import { useEffect, useState } from "react";
import { MatrixVisualization } from "./MatrixVisualization";

/*
    TODO: 对于变量的命名要统一
*/

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
    clickPosition,
    setClickPosition
}) => {
    const [focusStep, setFocusStep] = useState(0);

    useEffect(() => {
        setFocusStep(0)
        setClickPosition([[-1, -1]])
    }, [targetColor, setClickPosition])

    // 跳转距离直接hardcode吧，这样最准确
    const stepSize = 284.49 + 16;
    
    // console.log("test-print-updated-memories: ", matrixData, genMatrix, mixedStepState, paletteInfo, clickPosition)

    const handleActionConduction = (actionType, hoverPosition, index) => {  // index means which color matrix palette
        // redo mixing
        if(index < matrixData.length - 1) {
            setMatrixData(current => current.slice(0, index + 1));
            // changeGenMatrix(current => current.slice(0, index + 1));
            changeMixedStepState(current => current.slice(0, index + 1));
            changePaletteInfo(current => current.slice(0, index + 1));
        }
        
        const newClickPosition = JSON.parse(JSON.stringify(clickPosition.slice(0, index)));
        newClickPosition.push(hoverPosition);

        let col = hoverPosition[0]
        let row = hoverPosition[1]

        console.log("test-print-handleActionConduction: ", actionType, hoverPosition, index)
        // console.log("test-print-newClickPosition: ", newClickPosition)

        // update mixedPigmentList
        const mixedPigments = JSON.parse(JSON.stringify(paletteInfo[index]['col'][col]))
        const rowPigments = paletteInfo[index]['row'][row];
        
        // 为了让mixed的结果一致，这里不让col-p和row-p合并 
        // rowPigments.forEach((p) => {
        //     let isContained = false;
        //     for(let i = 0; i < mixedPigments.length; i++) {
        //         if(p[0] === mixedPigments[i][0]) {
        //             mixedPigments[i][1] += p[1]
        //             isContained = true;
        //             break
        //         }
        //     }
        //     if(!isContained) mixedPigments.push(p)
        // });

        // 改成这样
        rowPigments.forEach((p) => mixedPigments.push(p))

        // console.log("test-print-mixedPigments: ", mixedPigments)
        changeMixedPigmentList(mixedPigments);

        // TODO:这里分几种情况去给出逻辑: 1) 新的matrix添加至末尾；2）修改中间的matrix
        // add matrix data to the list: actionType = 0, 1, 2并不好，可以改成语义"confirm", "quantity", "mixture"
        const stepState = [
            matrixData[index]['col'][col],
            matrixData[index]['row'][row],
            matrixData[index]['mixed'][col][row],
            matrixDistances[index]['focus'][col + 1][row + 1]
        ];
        const newGenMatrix = JSON.parse(JSON.stringify(genMatrix.slice(0, index)));
        const newMixedStepState = JSON.parse(JSON.stringify(mixedStepState.slice(0, index)));
        if(actionType === 0) {
            if(newGenMatrix.length === 0) {
                changeMixedStepState([stepState])
            } else {
                if(newGenMatrix[newGenMatrix.length - 1] === 'q') {
                    newMixedStepState[newMixedStepState.length - 1] = stepState;
                } else if (newGenMatrix[newGenMatrix.length - 1] === 'm') {
                    newMixedStepState.push(stepState);
                } else if (newGenMatrix[newGenMatrix.length - 1] === 's') {
                    newMixedStepState[newMixedStepState.length - 1] = stepState;
                }
                changeMixedStepState(newMixedStepState);
            }
            newGenMatrix.push('s');
            changeGenMatrix(newGenMatrix);
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
                    changeMixedStepState([stepState])
                } else {
                    if(newGenMatrix[newGenMatrix.length - 1] === 'q') {
                        newMixedStepState[newMixedStepState.length - 1] = stepState;
                    } else if (newGenMatrix[newGenMatrix.length - 1] === 'm') {
                        newMixedStepState.push(stepState);
                    } else if (newGenMatrix[newGenMatrix.length - 1] === 's') {
                        newMixedStepState[newMixedStepState.length - 1] = stepState;
                    }
                    changeMixedStepState(newMixedStepState);
                }

                newGenMatrix.push('q');
                changeGenMatrix(newGenMatrix);
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
                    changeMixedStepState([stepState])
                } else {
                    if(newGenMatrix[newGenMatrix.length - 1] === 'q') {
                        newMixedStepState[newMixedStepState.length - 1] = stepState;
                    } else if (newGenMatrix[newGenMatrix.length - 1] === 'm') {
                        newMixedStepState.push(stepState);
                    } else if (newGenMatrix[newGenMatrix.length - 1] === 's') {
                        newMixedStepState[newMixedStepState.length - 1] = stepState;
                    }
                    changeMixedStepState(newMixedStepState);
                }

                newGenMatrix.push('m');
                changeGenMatrix(newGenMatrix);
            })
            .catch(error => console.error("Error fetching data:", error));
        }

        if(actionType === 1 || actionType === 2) {
            newClickPosition.push([-1, -1]);
            setFocusStep(matrixData.length - 1);
        }
        setClickPosition(newClickPosition);
    }

    // move the scroll
    useEffect(() => {
        if(matrixData.length > 2) {
            const srollElement = document.getElementById("paletteList");
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
                paletteInfo={paletteInfo[index]}
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