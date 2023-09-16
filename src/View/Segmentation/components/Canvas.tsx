import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import React, {
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { RadialProgress } from "react-daisyui";
import { Circle, Image, Layer, Path, Rect, Ring, Stage } from "react-konva";
import {
  canvasScaleInitializer,
  canvasScaleResizer,
} from "../../helpers/CanvasHelper";
import {
  AnnotationProps,
  modelInputProps,
  modelScaleProps,
} from "../../helpers/Interface";
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
  currentScale
}: any) => {
  const {
    click: [click, setClick],
    clicks: [clicks, setClicks],
    image: [image],
    svg: [svg],
    isLoading: [isLoading, setIsLoading],
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
      newClicks = [...clicks, click];
    } else if (click) {
      newClicks = [click];
    }
    if (newClicks) {
      superDefer(() => superDefer(() => setClicks(newClicks)));
    }
  }, [click]);

  return (
    <>
      <div className="absolute w-full h-full bg-black pointer-events-none background"></div>
      <img
        // @ts-ignore
        src={image.src}
        className={`absolute w-full h-full pointer-events-none ${isLoading ||
          (hasClicked)
          ? "opacity-50"
          : ""
          }`}
        style={{ margin: 0 }}
      ></img>
      {svg &&
        scale &&
        hasClicked && (
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
            preventDefault={false}
          />
          {svg &&
            scale &&
            hasClicked && (
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
        <Layer name="animateAllSvg">

        </Layer>
        <Layer name="annotations">
          {clicks &&
            hasClicked &&
            clicks.map((click, idx) => {
              const clickColor = handleClickColor(click.clickType);
              return (
                clickColor && (
                  <Circle
                    key={idx}
                    id={`${idx}`}
                    x={click.x * currentScale}
                    y={click.y * currentScale}
                    fill={clickColor}
                    radius={8}
                    shadowBlur={5}
                    shadowColor={
                      clickColor === positiveClickColor
                        ? "black"
                        : clickColor
                    }
                    preventDefault={false}
                  />
                )
              );
            })}
          {click && clickColor && (
            <>
              <Circle
                x={click.x * currentScale}
                y={click.y * currentScale}
                fill={clickColor}
                shadowColor={
                  clickColor === positiveClickColor
                    ? "black"
                    : negativeClickColor
                }
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
