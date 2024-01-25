import { useContext, useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import AppContext from "../hooks/createContext";

const WIDTH = 113.44;
const HEIGHT = 110.56;

function Scatter(props) {
    const {
        chosenColors: [chosenColors, ],
    } = useContext(AppContext);
    const { 
        handleFilter, 
        dots,
        currentImages,
     } = props;

    // TODO check 这里的逻辑

    // console.log("test-print-dots and currentImages", dots, currentImages)

    const chartWidth = WIDTH;
    const chartHeight = HEIGHT;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;

    const svgRef = useRef(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [endX, setEndX] = useState(0);
    const [endY, setEndY] = useState(0);
    const data = dots;
    let xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[0]), d3.max(data, d => d[0])])
        .range([0, width]);
    let yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[1]), d3.max(data, d => d[1])])
        .range([height, 0]);

    const handleMouseDown = (event) => {
        const { offsetX, offsetY } = event.nativeEvent;
        setStartX(offsetX);
        setStartY(offsetY);
        setIsDrawing(true);
    };

    const handleMouseMove = (event) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = event.nativeEvent;
        setEndX(offsetX);
        setEndY(offsetY);
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        // 计算矩形区域范围  
        const minX = Math.min(startX, endX);
        const minY = Math.min(startY, endY);
        const maxX = Math.max(startX, endX);
        const maxY = Math.max(startY, endY);

        handleFilter(Object.entries({ ...dots }).filter(item =>
            minX <= (xScale(item[1][0]) + margin.left) && (xScale(item[1][0]) + margin.left) <= maxX
            && minY <= (yScale(item[1][1]) + margin.top) && (yScale(item[1][1]) + margin.top) <= maxY
        ).map(item => {
            // console.log("test-print-item", item); // ['38', item]
            return Number(item[0])
        }));

        // 移除rect
        d3.select(svgRef.current).selectAll('#rectangle').remove();
    };

    const handleMouseLeave = () => {
        setIsDrawing(false);
    };

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr('width', chartWidth)
            .attr('height', chartHeight);

        svg.selectAll('*').remove();

        svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d[0]) + margin.left)
            .attr('cy', d => yScale(d[1]) + margin.top)
            .attr('r', 6)
            .attr('fill', '#b09872')
            .attr('opacity', (_, i) => currentImages[i].marked === 1 ? 0.8 : (currentImages[i].marked === -1 ? 0 : 0.3))
            .attr('stroke', (_, i) => currentImages[i].marked === 1 ? '#534835' : 'none')  
            .attr('stroke-width', (_, i) => currentImages[i].marked === 1 ? 2 : 0);

        // 绘制矩形  
        svg.append('rect')
            .attr('id', 'rectangle')
            .attr('fill', 'none')
            .attr('stroke', '#534835')
            .attr('stroke-width', 2)
            .attr('pointer-events', 'none');

    }, [data, chosenColors, isDrawing, currentImages]);

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        // 更新矩形位置和尺寸  
        svg.select('#rectangle')
            .attr('x', Math.min(startX, endX))
            .attr('y', Math.min(startY, endY))
            .attr('width', Math.abs(endX - startX))
            .attr('height', Math.abs(endY - startY));

    }, [startX, startY, endX, endY]);

    return (
        <svg
            ref={svgRef}
            width={chartWidth}
            height={chartHeight}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        ></svg>
    );
}

export default Scatter;