import { useEffect, useRef, useState } from "react";
import "../../sharedCss.css";
import "./SpacePlot.css";

export const SpacePlot = () => {
    const svgRef = useRef(null);
    const [svgSize, setSvgSize] = useState([0, 0]);

    useEffect(() => {
        setSvgSize([
            svgRef.current?.clientWidth || 0,
            svgRef.current?.clientHeight || 0
        ])
    }, [svgRef])

    return <div className="SDefault-container">
        <div className="Plot-container" ref={svgRef}>
            <svg className="SDefault-container">
                
            </svg>
        </div>
    </div>
}