import { Tensor } from "onnxruntime-web";
import React, { useState } from "react";
import { modelInputProps } from "../helpers/Interface";
import AppContext from "./createContext";

const AppContextProvider = (props: {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}) => {
  const [click, setClick] = useState<modelInputProps | null>(null);
  const [clicks, setClicks] = useState<Array<modelInputProps> | null>(null);
  const [clicksHistory, setClicksHistory] =
    useState<Array<modelInputProps> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [prevImage, setPrevImage] = useState<HTMLImageElement | null>(null);
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [isErased, setIsErased] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [svg, setSVG] = useState<string[] | null>(null);
  const [svgs, setSVGs] = useState<string[][] | null>(null);
  const [allsvg, setAllsvg] = useState<
    { svg: string[]; point_coord: number[] }[] | null
  >(null);
  const [isModelLoaded, setIsModelLoaded] = useState<{
    boxModel: boolean;
    allModel: boolean;
  }>({ boxModel: false, allModel: false });

  const [stickers, setStickers] = useState<HTMLCanvasElement[]>([]); // 只存储古画的segs

  const [chosenStickers, setChosenStickers] = useState<Set<number>>(new Set());
  const [activeSticker, setActiveSticker] = useState<number>(0);
  const [segmentTypes, setSegmentTypes] = useState<"Box" | "Click" | "All">(
    "Click"
  );
  const [canvasWidth, setCanvasWidth] = useState<number>(0);
  const [canvasHeight, setCanvasHeight] = useState<number>(0);
  const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);
  const [userNegClickBool, setUserNegClickBool] = useState<boolean>(false);
  const [hasNegClicked, setHasNegClicked] = useState<boolean>(false);
  const [stickerTabBool, setStickerTabBool] = useState<boolean>(true);
  const [enableDemo, setEnableDemo] = useState(false);
  const [isMultiMaskMode, setIsMultiMaskMode] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean | null>(null);
  const [editingMode, setEditingMode] = useState<string>("painting"); // "natural-image" or "painting"
  const [isPreProcess, setIsPreProcess] = useState<boolean | null>(false);
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false);
  const [eraserText, setEraserText] = useState<{
    isErase: boolean;
    isEmbedding: boolean;
  }>({ isErase: false, isEmbedding: false });
  const [didShowAMGAnimation, setDidShowAMGAnimation] =
    useState<boolean>(false);
  const [predMask, setPredMask] = useState<Tensor | null>(null);
  const [predMasks, setPredMasks] = useState<Tensor[] | null>(null);
  const [predMasksHistory, setPredMasksHistory] = useState<Tensor[] | null>(
    null
  );
  const [isAllAnimationDone, setIsAllAnimationDone] = useState<boolean>(false);
  const [isToolBarUpload, setIsToolBarUpload] = useState<boolean>(false);
  const [blobMap, setBlobMap] = useState({});
  const [segUrl, setSegUrl] = useState<string>("");
  const [filteredImages, setFilteredImages] = useState([]);
  const [chosenColors, setChosenColors] = useState(new Set());
  const [imageContext, setImageContext] = useState({});

  // 是否进行part-tracking
  const [isTracking, setIsTracking] = useState<boolean>(false);
  // 将所有seg存在一个二维数组里
  const [segMaskArray, setSegMaskArray] = useState([]);
  // maskIndex
  const [segMaskIndex, setSegMaskIndex] = useState(0);

  // 自然图片的segs
  const [stickerForTrack, setStickerForTrack] = useState<HTMLCanvasElement[][]>([]); // 应该并到imageContext里的
  const [annotatedImage, setAnnotatedImage] = useState<string[]>([]); // 应该并到imageContext里的
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <AppContext.Provider
      value={{
        click: [click, setClick],
        clicks: [clicks, setClicks],
        clicksHistory: [clicksHistory, setClicksHistory],
        image: [image, setImage],
        prevImage: [prevImage, setPrevImage],
        error: [error, setError],
        svg: [svg, setSVG],
        svgs: [svgs, setSVGs],
        allsvg: [allsvg, setAllsvg],
        stickers: [stickers, setStickers],
        chosenStickers: [chosenStickers, setChosenStickers],
        activeSticker: [activeSticker, setActiveSticker],
        isModelLoaded: [isModelLoaded, setIsModelLoaded],
        segmentTypes: [segmentTypes, setSegmentTypes],
        isLoading: [isLoading, setIsLoading],
        isErasing: [isErasing, setIsErasing],
        isErased: [isErased, setIsErased],
        canvasWidth: [canvasWidth, setCanvasWidth],
        canvasHeight: [canvasHeight, setCanvasHeight],
        maskImg: [maskImg, setMaskImg],
        maskCanvas: [maskCanvas, setMaskCanvas],
        userNegClickBool: [userNegClickBool, setUserNegClickBool],
        hasNegClicked: [hasNegClicked, setHasNegClicked],
        stickerTabBool: [stickerTabBool, setStickerTabBool],
        enableDemo: [enableDemo, setEnableDemo],
        isMultiMaskMode: [isMultiMaskMode, setIsMultiMaskMode],
        isHovering: [isHovering, setIsHovering],
        editingMode: [editingMode, setEditingMode],
        isPreProcess: [isPreProcess, setIsPreProcess],
        showLoadingModal: [showLoadingModal, setShowLoadingModal],
        eraserText: [eraserText, setEraserText],
        didShowAMGAnimation: [didShowAMGAnimation, setDidShowAMGAnimation],
        predMask: [predMask, setPredMask],
        predMasks: [predMasks, setPredMasks],
        predMasksHistory: [predMasksHistory, setPredMasksHistory],
        isAllAnimationDone: [isAllAnimationDone, setIsAllAnimationDone],
        isToolBarUpload: [isToolBarUpload, setIsToolBarUpload],
        blobMap: [blobMap, setBlobMap],
        segUrl: [segUrl, setSegUrl],
        filteredImages: [filteredImages, setFilteredImages],
        chosenColors: [chosenColors, setChosenColors],
        imageContext: [imageContext, setImageContext],
        isTracking: [isTracking, setIsTracking],
        stickerForTrack: [stickerForTrack, setStickerForTrack],
        segMaskArray: [segMaskArray, setSegMaskArray],
        segMaskIndex: [segMaskIndex, setSegMaskIndex],
        annotatedImage: [annotatedImage, setAnnotatedImage],
        currentIndex: [currentIndex, setCurrentIndex],
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
