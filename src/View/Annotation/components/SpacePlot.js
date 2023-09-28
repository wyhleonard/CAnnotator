import { useEffect, useMemo, useRef, useState } from "react";
import "../../sharedCss.css";
import "./SpacePlot.css";
import * as d3 from "d3";


const coordinateIndex = [[1, 2], [0, 1], [0, 2]];
const abRange = [-127, 128];
const LRange = [0, 100];
const circleSize = 8;
const svgGap = 8;

// Good Job!
export const SpacePlot = ({
    spaceIndex,
    matrixLabData,
    targetColor,
    hoveredScatter,
    changeHoveredScatter
}) => {

    // copy from PaintingBoard.js
    const svgRef = useRef(null);
    const [svgSize, setSvgSize] = useState([0, 0]);
    const [svgOffset, setSvgOffset] = useState([0, 0]);
    const plotData = matrixLabData;

    useEffect(() => {
        setSvgSize([
            svgRef.current?.clientWidth || 0,
            svgRef.current?.clientHeight || 0
        ])

        setSvgOffset([
            svgRef.current?.getBoundingClientRect().x || 0,
            svgRef.current?.getBoundingClientRect().y || 0
        ])
    }, [svgRef])

    const [currentLT, setCurrentLT] = useState([0, 0]);
    const [currentScale, setCurrentScale] = useState(1);
    const maxScale = 50;
    const minScale = 1;

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
        const deltaX = e.clientX - svgOffset[0] - currentLT[0];
        const deltaY = e.clientY - svgOffset[1] - currentLT[1];

        setCurrentLT([
            currentLT[0] - ((newScale - currentScaleRecord) / currentScaleRecord) * deltaX,
            currentLT[1] - ((newScale - currentScaleRecord) / currentScaleRecord) * deltaY,
        ])
    }

    useEffect(() => {
        if (svgSize[0] > 0) {
            const leftTopSvg = [Math.abs(currentLT[0]), Math.abs(currentLT[1])];

            const leftTopLab = [];
            const rightBottomLab = [];
            if (spaceIndex === 0) {
                leftTopLab.push(abRange[0] + ((leftTopSvg[0] + (circleSize + svgGap)) / (svgSize[0] * currentScale)) * (abRange[1] - abRange[0]));
                leftTopLab.push(abRange[0] + ((leftTopSvg[1] + (circleSize + svgGap)) / (svgSize[1] * currentScale)) * (abRange[1] - abRange[0]));

                rightBottomLab.push(leftTopLab[0] + ((svgSize[0] - 2 * (circleSize + svgGap)) / (svgSize[0] * currentScale)) * (abRange[1] - abRange[0]));
                rightBottomLab.push(leftTopLab[1] + ((svgSize[1] - 2 * (circleSize + svgGap)) / (svgSize[1] * currentScale)) * (abRange[1] - abRange[0]));
            } else if (spaceIndex === 1) {
                // LeftTopLab calculation
                leftTopLab.push(LRange[0] + ((leftTopSvg[0] + (circleSize + svgGap)) / (svgSize[0] * currentScale)) * (LRange[1] - LRange[0]));
                leftTopLab.push(abRange[0] + ((leftTopSvg[1] + (circleSize + svgGap)) / (svgSize[1] * currentScale)) * (abRange[1] - abRange[0]));

                // RightBottomLab calculation
                rightBottomLab.push(leftTopLab[0] + ((svgSize[0] - 2 * (circleSize + svgGap)) / (svgSize[0] * currentScale)) * (LRange[1] - LRange[0]));
                rightBottomLab.push(leftTopLab[1] + ((svgSize[1] - 2 * (circleSize + svgGap)) / (svgSize[1] * currentScale)) * (abRange[1] - abRange[0]));
            } else if (spaceIndex === 2) {
                // LeftTopLab calculation
                leftTopLab.push(LRange[0] + ((leftTopSvg[0] + (circleSize + svgGap)) / (svgSize[0] * currentScale)) * (LRange[1] - LRange[0]));
                leftTopLab.push(abRange[0] + ((leftTopSvg[1] + (circleSize + svgGap)) / (svgSize[1] * currentScale)) * (abRange[1] - abRange[0]));

                // RightBottomLab calculation
                rightBottomLab.push(leftTopLab[0] + ((svgSize[0] - 2 * (circleSize + svgGap)) / (svgSize[0] * currentScale)) * (LRange[1] - LRange[0]));
                rightBottomLab.push(leftTopLab[1] + ((svgSize[1] - 2 * (circleSize + svgGap)) / (svgSize[1] * currentScale)) * (abRange[1] - abRange[0]));

            }

            const circleData = [];
            const cIndex = coordinateIndex[spaceIndex];
            for (let i = 0; i < plotData.length; i++) {
                for (let j = 0; j < plotData[i].length; j++) {
                    const dataSample = plotData[i][j];
                    const cx = dataSample.position[cIndex[0]];
                    const cy = dataSample.position[cIndex[1]];
                    if (cx > leftTopLab[0] && cx < rightBottomLab[0] && cy > leftTopLab[1] && cy < rightBottomLab[1]) {
                        circleData.push([
                            [dataSample.position[cIndex[0]], dataSample.position[cIndex[1]]],
                            dataSample.color,
                            [i, j]
                        ])
                    }
                }
            }

            // target color
            const cx = targetColor.position[cIndex[0]];
            const cy = targetColor.position[cIndex[1]];
            if (cx > leftTopLab[0] && cx < rightBottomLab[0] && cy > leftTopLab[1] && cy < rightBottomLab[1]) {
                circleData.push([
                    [targetColor.position[cIndex[0]], targetColor.position[cIndex[1]]],
                    targetColor.color,
                    [-1, -1]
                ])
            }

            const svg = d3.select("#space-svg");
            svg
                .selectAll("circle")
                .remove();

            svg
                .selectAll("circle")
                .data(circleData)
                .enter()
                .append("circle")
                .attr("cx", d => (svgSize[0] - 2 * (circleSize + svgGap)) * (d[0][0] - leftTopLab[0]) / (rightBottomLab[0] - leftTopLab[0]) + (circleSize + svgGap))
                .attr("cy", d => (svgSize[1] - 2 * (circleSize + svgGap)) * (d[0][1] - leftTopLab[1]) / (rightBottomLab[1] - leftTopLab[1]) + (circleSize + svgGap))
                .attr("r", circleSize)
                .attr("fill", d => d[1])
                .attr("opacity", d => {
                    if(hoveredScatter[0] === -1) {
                        return 1
                    } else {
                        if((d[2][0] === hoveredScatter[0] && d[2][1] === hoveredScatter[1]) || d[2][0] === -1) {
                            return 1
                        } else {
                            return 0.3
                        }
                    }
                })
                .attr("stroke", d => d[2][0] === -1 ? "#5a4e3b" : "none")
                .attr("stroke-width", d => d[2][0] === -1 ? 3 : 0)
                .style("cursor", "pointer")
                .on("mouseover", (_, d) => {if(d[2][0] !== -1 && (d[2][0] !== hoveredScatter[0] || d[2][1] !== hoveredScatter[1])) changeHoveredScatter(d[2])})
                .on("mouseout", (_, d) => {if(d[2][0] !== -1) changeHoveredScatter([-1, -1])})  // 更新不及时
        }
    })

    useEffect(() => {
        // 清空并初始化
        setSvgSize([
            svgRef.current?.clientWidth || 0,
            svgRef.current?.clientHeight || 0
        ])

        setSvgOffset([
            svgRef.current?.getBoundingClientRect().x || 0,
            svgRef.current?.getBoundingClientRect().y || 0
        ])

        setCurrentLT([0, 0])
        setCurrentScale(1)
    }, [spaceIndex, svgRef])

    // 交互还是会有些bug，但不妨碍录视频
    return <div
        className="SDefault-container"
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}
    >
        <div
            className="Plot-container"
            ref={svgRef}
        >
            <div
                style={{
                    width: `${svgSize[0] * currentScale}px`,
                    height: `${svgSize[1] * currentScale}px`,
                    position: "absolute",
                    zIndex: "10",
                    left: `${currentLT[0]}px`,
                    top: `${currentLT[1]}px`,
                }}
                onMouseDown={(e) => handleDragStart(e)}
                onMouseMove={(e) => handleDragMove(e)}
                onMouseUp={(e) => handleDragEnd(e)}
                onWheel={(e) => handleWheelChange(e)}
            >
                <div className="SDefault-container" style={{position: "relative"}}>
                    <svg 
                        id="space-svg"
                        style={{
                            width: `${svgSize[0]}px`,
                            height: `${svgSize[1]}px`,
                            position: "absolute",
                            zIndex: "20",
                            left: `${Math.abs(currentLT[0])}px`,
                            top: `${Math.abs(currentLT[1])}px`,
                        }}
                    />
                </div>
            </div>
        </div>
    </div>
}
