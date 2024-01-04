import Konva from "konva";
import { useContext, useEffect } from "react";
import { Circle, Image, Layer, Path, Stage } from "react-konva";
import { modelInputProps } from "../../helpers/Interface";
import AppContext from "../../hooks/createContext";
import SvgMask from "./SvgMask";

// The line below is part of the fix for the iOS canvas area limit of 16777216
Konva.pixelRatio = 1;

const Canvas = ({
  konvaRef,
  scale,
  handleMouseUp,
  handleMouseDown,
  hasClicked,
  currentWH,
  currentScale,
}: any) => {
  const {
    click: [click, setClick], // 新点击的points
    clicks: [clicks, setClicks],  // 之前存储的points
    image: [image],
    svg: [svg],
    isLoading: [isLoading],
  } = useContext(AppContext)!;

  const imageClone = new window.Image();
  imageClone.src = image?.src || "";
  imageClone.width = image?.width || 0;
  imageClone.height = image?.height || 0;

  const positiveClickColor = "turquoise";
  const negativeClickColor = "pink";
  const handleClickColor = (num: number) => {
    switch (num) {
      case 0:
        return negativeClickColor;
      case 1:
        return positiveClickColor;
      default:
        return null;
    }
  };
  const clickColor = click ? handleClickColor(click.clickType) : null;

  const superDefer = (cb: Function) => {
    setTimeout(
      () =>
        window.requestAnimationFrame(() => {
          setTimeout(() => {
            cb();
          }, 0);
        }),
      0
    );
  };

  useEffect(() => {
    let newClicks: modelInputProps[] | null = null;
    if (clicks && click) {
      newClicks = [...clicks, click]; // add new click
    } else if (click) {
      newClicks = [click];
    }
    if (newClicks) {
      superDefer(() => superDefer(() => {
        setClick(null);
        setClicks(newClicks);
      }));
    }
  }, [click, setClick, clicks, setClicks]); // correct usage of useEffect

  // console.log("test-print-svg", svg)

  return (
    <>
      <div className="absolute w-full h-full bg-black pointer-events-none background"></div>
      <img /* 古画底图 */
        // @ts-ignore
        src={image.src}
        className={`absolute w-full h-full pointer-events-none ${
          isLoading || hasClicked ? "opacity-50" : ""
        }`}
        style={{ margin: 0 }}
        alt=""
      ></img>
      {svg && scale && hasClicked && (
        <SvgMask
          xScale={currentWH[0]}
          yScale={currentWH[1]}
          svgStr={svg.join(" ")}
        />
      )}
      <Stage
        className="konva"
        width={currentWH[0] * currentScale}
        height={currentWH[1] * currentScale}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        ref={konvaRef}
      >
        <Layer name="svgMask">
          <Image
            x={0}
            y={0}
            image={imageClone}
            width={currentWH[0]}
            height={currentWH[1]}
            opacity={0}
            preventDefault={false} // 允许浏览器的交互行为
          />
          {svg && scale && hasClicked && (
            <Path
              data={svg.join(" ")}
              fill="black"
              lineCap="round"
              lineJoin="round"
              opacity={0}
              preventDefault={false}
            />
          )}
        </Layer>
        <Layer name="animateAllSvg"></Layer>
        <Layer name="annotations">
          {clicks &&
            hasClicked &&
            clicks.map((click, idx) => {
              const clickColor = handleClickColor(click.clickType);
              return (
                clickColor && (
                  <Circle
                    key={`click-${idx}`}
                    id={`${idx}`}
                    x={click.x * currentScale}
                    y={click.y * currentScale}
                    fill={clickColor}
                    radius={8}
                    shadowBlur={5}
                    shadowColor={clickColor === positiveClickColor ? "black" : "white"}
                    preventDefault={false}
                  />
                )
              );
            })}
          {click && clickColor && (
            <>
              <Circle
                key={"new-click"}
                x={click.x * currentScale}
                y={click.y * currentScale}
                fill={clickColor}
                shadowColor={clickColor === positiveClickColor ? "black" : "white"}
                shadowBlur={5}
                preventDefault={false}
                radius={8}
              />
            </>
          )}
        </Layer>
      </Stage>
    </>
  );
};

export default Canvas;
