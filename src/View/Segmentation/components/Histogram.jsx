import { useContext } from "react";
import * as d3 from "d3";
import AppContext from "../../hooks/createContext";

const HEIGHT = 50;

function Histogram(props) {
    const {
        chosenColors: [chosenColors,],
    } = useContext(AppContext);
    let { colors } = props;

    colors = Object.keys(colors ?? {}).map(k => {
        return {
            "color": k,
            "value": colors[k]
        }
    });

    colors.sort((a, b) => b.value - a.value);

    const barWidth = 8.06; // 柱状条的宽度  
    const barSpacing = 2.96; // 柱状条之间的间距
    const WIDTH = (barWidth + barSpacing) * colors.length;

    const chartWidth = WIDTH;
    const chartHeight = HEIGHT;

    // 假设数据是一个对象数组，每个对象包含一个value属性表示柱状条的高度  
    const data = colors;

    // 计算纵向直方图的最大高度  
    const maxBarHeight = d3.max(data, d => d.value);

    // 定义一个比例尺，将数据映射到可视化的高度范围
    const yScale = d3
        .scaleLinear()
        .domain([0, maxBarHeight + 0.5])
        .range([10, chartHeight]); // 将范围反转，使x轴朝下

    return (
        <svg width={chartWidth} height={chartHeight}>
            {data.map((d, i) => {
                const barHeight = yScale(d.value);
                const x = i * (barWidth + barSpacing);
                const y = chartHeight - barHeight;
                const c = d3.color(d.color);
                c.opacity = 0.2;

                return (
                    <rect
                        key={`histogram-bar-${i}`}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx={2}
                        ry={2}
                        fill={
                            !chosenColors.size ?
                                d.color :
                                (chosenColors.has(d.color) ? d.color : c)
                        }
                    />
                );
            })}
        </svg>
    );
}

export default Histogram;