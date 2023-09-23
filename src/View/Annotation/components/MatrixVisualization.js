import { useEffect, useRef, useState } from "react";
import "../../sharedCss.css";
import "./MatrixVisualization.css";
import * as d3 from "d3";
import { adaptTooltipPosition } from "../../utils";

const pigmentNum = 13;
const singleOptionHeight = 30;
const optionMargin = 6;
const hoverPanelSize = [190, singleOptionHeight * 3 + optionMargin * 3];
const demoDistance = 13.67;

// 右下角散点图
export const MatrixVisualization = ({
    index,
    data,
    matrixDist,
    matrixLab,
    floatDirection,
    changeActionType,
    clickPosition,
}) => {
    const svgRef = useRef(null);
    const [svgSize, setSvgSize] = useState([0, 0]);
    const [rectSize, setRectSize] = useState([0, 0]);

    useEffect(() => {
        setSvgSize([
            svgRef.current?.clientWidth || 0,
            svgRef.current?.clientHeight || 0
        ])
    }, [svgRef])

    const marginInMatrix = 4; // margin between first row and other rows
    useEffect(() => {
        if(svgSize[0] > 0) {
            setRectSize([
                (svgSize[0] - marginInMatrix) / (pigmentNum + 1),
                (svgSize[1] - marginInMatrix) / (pigmentNum + 1),
            ])
        }
    }, [svgSize])

    const [hoverPosition, setHoverPosition] = useState([-1, -1]);
    const [isClicked, setIsClicked] = useState(false);

    useEffect(() => {
        if(rectSize[0] > 0) {
            // svg for pigment list 1
            const svg = d3.select(`#pigment-list1-${index}`);
            const svgData = data.row;
            svg
            .selectAll("rect")
            .data(svgData)
            .enter()
            .append("rect")
            .attr("x", (_, i) => i * rectSize[0])
            .attr("y", 0)
            .attr("width", rectSize[0])
            .attr("height", rectSize[1])
            .attr("fill", d => d[0])
            .attr("stroke", "#fff6dc")
            .attr("stroke-width", 3)

            // svg for pigment list 2
            const svg2 = d3.select(`#pigment-list2-${index}`);
            const svgData2 = data.col;
            svg2
            .selectAll("rect")
            .data(svgData2)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (_, i) => i * rectSize[1])
            .attr("width", rectSize[0])
            .attr("height", rectSize[1])
            .attr("fill", d => d[0])
            .attr("stroke", "#fff6dc")
            .attr("stroke-width", 3)

            // svg for mixed pigments
            const svg3 = d3.select(`#pigment-mixed-${index}`);
            const originData = data.mixed;
            const svgData3 = [];
            for(let i = 0; i < originData.length; i++) {
                for(let j = 0; j < originData[i].length; j++) {
                    svgData3.push([i, j]);
                }
            }

            svg3
            .selectAll("rect")
            .data(svgData3)
            .enter()
            .append("rect")
            .attr("x", d => d[1] * rectSize[0])
            .attr("y", d => d[0] * rectSize[1])
            .attr("width", rectSize[0])
            .attr("height", rectSize[1])
            .attr("fill", d => originData[d[0]][d[1]][0])
            .attr("stroke", "#fff6dc")
            .attr("stroke-width", 3)
            .attr("id", d => `block-${d[0]}-${d[1]}`)
            .style("cursor", "pointer")
        }
    }, [rectSize, index, data])

    // 暴力但可以work，感动。。。
    useEffect(() => {
        const svg3 = d3.select(`#pigment-mixed-${index}`);

        if(isClicked === false) {
            svg3
            .selectAll("rect")
            .on("mouseover", (event, d) => {
                d3.select(event.target)
                .attr("stroke", "#5a4e3b")
                .attr("stroke-width", 3)

                setHoverPosition(d);
            })
            .on("mouseout", (event) => {
                d3.select(event.target)
                .attr("stroke", "#fff6dc")
                .attr("stroke-width", 3)
                setHoverPosition([-1, -1]);
            })
            .on("click", (_, d) => {
                setIsClicked(true);
            })
        } else {
            svg3
            .selectAll("rect")
            .on("mouseover", null)
            .on("mouseout", null)
        }
    })

    const {hoverPanelLeft, hoverPanelTop} = adaptTooltipPosition(hoverPosition, rectSize, pigmentNum, hoverPanelSize, floatDirection);

    const handleBlockClick = () => {
        // return to initial state
        const svg3 = d3.select(`#pigment-mixed-${index}`);
        svg3
        .select(`#block-${hoverPosition[0]}-${hoverPosition[1]}`)
        .attr("stroke", "#fff6dc")

        setHoverPosition([-1, -1]);
        setIsClicked(false);
    }

    return <div className="SDefault-container" style={{overflow: "visible"}} ref={svgRef}>
        <div className="Matrix-firstrow-container" style={{height: `${rectSize[1]}px`}}>
            <div className="Matrix-index-container" style={{width: `${rectSize[0]}px`}}>
                <span className="STitle-text-contrast" 
                    style={{
                        marginLeft: "0px",
                        marginTop: "-2px",
                    }}
                    onClick={() => {
                        //TODO: 将矩阵信息传输到散点图 SpacePlot
                        console.log("click index", index, "data", data, "dist", matrixDist[index], "lab", matrixLab[index]);
                    }}
                >
                    {index + 1}
                </span>
            </div>
            <div 
                className="Matrix-pigment-list1" 
                style={{
                    marginLeft: `${marginInMatrix}px`,
                    width: `calc(100% - ${rectSize[0] + marginInMatrix}px)`,
                }}
            >
                <svg id={`pigment-list1-${index}`} className="SDefault-container"/>
            </div>
        </div>
        <div 
            className="Matrix-secondrow-container" 
            style={{
                height: `calc(100% - ${rectSize[1] + marginInMatrix}px)`, 
                marginTop: `${marginInMatrix}px`
            }}
        >
            <div className="Matrix-pigment-list2" style={{width: `${rectSize[0]}px`}}>
                <svg id={`pigment-list2-${index}`} className="SDefault-container"/>
            </div>
            <div 
                className="Matrix-mixed-pigments" 
                style={{
                    marginLeft: `${marginInMatrix}px`,
                    width: `calc(100% - ${rectSize[0] + marginInMatrix}px)`,
                }}
            >
                <svg id={`pigment-mixed-${index}`} className="SDefault-container"/>
                {
                    clickPosition[0] !== -1 &&
                    <div 
                        className="Highlight-pigment-block" 
                        style={{
                            left: `${clickPosition[1] * rectSize[0]}px`,
                            top: `${clickPosition[0] * rectSize[1]}px`,
                            width: `${rectSize[0]}px`,
                            height: `${rectSize[1]}px`,
                        }}
                    />
                }
                {
                    hoverPosition[0] !== -1 &&
                    <div
                        className="Hover-panel-container"
                        style={{
                            width: `${hoverPanelSize[0]}px`,
                            height: `${hoverPanelSize[1]}px`,
                            left: `${hoverPanelLeft}px`,
                            top: `${hoverPanelTop}px`,
                        }}
                    >
                        <div 
                            className="Hover-single-option"
                            style={{
                                marginTop: `${optionMargin}px`,
                                height: `${singleOptionHeight}px`,
                            }}
                            onClick={() => {
                                // console.log("hoverPosition", hoverPosition, "index", index);
                                changeActionType(0, hoverPosition, index);
                                handleBlockClick();
                            }}
                        >
                            <span className="STitle-text-contrast" style={{marginLeft: "0px"}}>
                                {`Select This Pigment (${matrixDist[index][(hoverPosition[0]+1)*14+(hoverPosition[1]+1)].toFixed(0)})`}
                                {/* {`Select This Pigment (${(hoverPosition[0]+1)*14+(hoverPosition[1]+1)})`} */}
                            </span>
                        </div>
                        <div 
                            className="Hover-single-option"
                            style={{
                                marginTop: `${optionMargin}px`,
                                height: `${singleOptionHeight}px`,
                            }}
                            onClick={() => {
                                changeActionType(1, hoverPosition, index);
                                handleBlockClick();
                            }}
                        >
                            <span className="STitle-text-contrast" style={{marginLeft: "0px"}}>
                                {`See More Quantities (${demoDistance - 5})`}
                            </span>
                        </div>
                        <div 
                            className="Hover-single-option"
                            style={{
                                marginTop: `${optionMargin}px`,
                                height: `${singleOptionHeight}px`,
                            }}
                            onClick={() => {
                                changeActionType(2, hoverPosition, index);
                                handleBlockClick();
                            }}
                        >
                            <span className="STitle-text-contrast" style={{marginLeft: "0px"}}>
                                {`See More Mixtures (${demoDistance + 5})`}
                            </span>
                        </div>
                    </div>
                }
            </div>
        </div>
    </div>
}
