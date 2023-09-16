import ReactDOM from "react-dom";
import React, { useContext, useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import AppContext from "../hooks/createContext";

const WIDTH = 110;
const HEIGHT = 110;

function Scatter(props) {
    const {
        chosenColors: [chosenColors, ],
        filteredImages: [filteredImages,],
    } = useContext(AppContext);
    const { handleFilter, dots } = props;

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
        const rectWidth = maxX - minX;
        const rectHeight = maxY - minY;
        handleFilter(Object.entries({ ...dots }).filter(item =>
            minX <= (xScale(item[1][0]) + margin.left) && (xScale(item[1][0]) + margin.left) <= maxX
            && minY <= (yScale(item[1][1]) + margin.top) && (yScale(item[1][1]) + margin.top) <= maxY
        ).map(item => Number(item[0])));
        d3.select(svgRef.current).selectAll('#rectangle').remove();
    };

    const handleMouseLeave = () => {
        setIsDrawing(false);
    };

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr('width', chartWidth)
            .attr('height', chartHeight);

        xScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[0]), d3.max(data, d => d[0])])
            .range([0, width]);
        yScale = d3.scaleLinear()
            .domain([d3.min(data, d => d[1]), d3.max(data, d => d[1])])
            .range([height, 0]);

        svg.selectAll('*').remove();

        svg.selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d[0]) + margin.left)
            .attr('cy', d => yScale(d[1]) + margin.top)
            .attr('r', 5)
            .attr('fill', (d, i) => filteredImages[i].marked == -1 ? 'rgba(176, 152, 114, 0.2)' : 'rgba(176, 152, 114, 1)')
            .attr('stroke', (d, i) => filteredImages[i].marked == 1 ? '#534835' : 'none')  
            .attr('stroke-width', (d, i) => filteredImages[i].marked == 1 ? 2 : 0);

        // 绘制矩形  
        svg.append('rect')
            .attr('id', 'rectangle')
            .attr('fill', 'none')
            .attr('stroke', '#534835')
            .attr('stroke-width', 2)
            .attr('pointer-events', 'none');

    }, [data, chosenColors, isDrawing]);

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