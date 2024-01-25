import "../sharedCss.css"
import "./index.css"
import SearchIcon from "../../Icons/search.svg";
import LeftIcon from "../../Icons/triangle.svg";
import ConfirmIcon from "../../Icons/confirm.svg";
import TrackIcon from "../../Icons/track.svg";
import { PAINTINGPATH, iconLevel1, imageInOnePage } from "../sharedConstants";
import { useContext, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { initPositions } from "../helpers/hardcode";
import AppContext from "../hooks/createContext";
import Scatter from "./Scatter";
import ExpandSVG from "../../Icons/expand.svg";
import ReSegmentSVG from "../../Icons/resegment.svg";
import { fetchStaticImageData } from "../helpers/staticImageData";
import { ImageViewer } from "./components/ImageViewer";
import { SegmentViewer } from "./components/SegmentViewer";
import jDBSCAN from "../helpers/jDBScan";

const iconRatio = 0.7;
const iconStyle = (iconPath) => {
  return {
    background: `url(${iconPath}) no-repeat`,
    backgroundSize: 'contain',
    width: `${iconLevel1 * iconRatio}px`,
    height: `${iconLevel1 * iconRatio}px`,
    cursor: 'pointer',
  }
}

// 支持的自然图片数据集
const imageDatasetName = ["pheasant", "goshawk", "pigment", "preprocess", "eggle"].sort();

export const ReferenceView = ({
  colors, 
  handleImageResegment,
  setReferenceImage,
  handleResetPaintingImage,
  handleSelectedImage,
}) => {
  const {
    chosenColors: [chosenColors, setChosenColors],
    displayedColors: [displayedColors, setDisplayedColors],
    chosenStickers: [chosenStickers,],
    filteredImages: [filteredImages, setFilteredImages],
    stickers: [stickers,],  // 古画已分割的components: [canvas, canvas, canvas]: stickers[el].toDataURL()关注这个变量
    showLoadingModal: [, setShowLoadingModal],
    imageContext: [imageContext,],  // stickers各图片已分割好的components，都是canvas
    isTracking: [, setIsTracking],
    segMaskArray: [segMaskArray],
    segMaskIndex: [segMaskIndex],
    currentIndex: [currentIndex],
    image: [image],
    editingMode: [, setEditingMode],
    imagePageIndex: [imagePageIndex, setImagePageIndex],
  } = useContext(AppContext);

  // console.log("test-print-colors", colors);

  // console.log("test-print-segUrl", segUrl) // http://localhost:3000/demoData/paintings/0.png
  // console.log("test-print-imageContext", imageContext)
  /*
      http://localhost:3000/demoData/paintings/0.png: ... 这张图片为什么混在这里
      http://localhost:3000/demoData/references/1.jpg: ...
      ...
  */

  // console.log("test-print-filteredImages", filteredImages) // {thumbnailUrl: '/demoData/references/3.jpg', contentUrl: '/demoData/references/3.jpg', marked: 0}
  // console.log("test-print-blobMap", blobMap) // [/demoData/paintings/0.png: "http://localhost:3000/demoData/paintings/0.png", ...]
  // console.log("test-print-colors", colors) // [[rgb(5, 24, 116): 0.014354066985645933, ...], [...]]
  // console.log("test-print-colors-1", Object.keys(colors[0]))
  // console.log("test-print-colors-2", Object.keys(colors[0]).toSorted((a, b) => colors[0][b] - colors[0][a]))
  // console.log("test-print-colors-3", Object.keys(colors[0]).toSorted((a, b) => {
  //     console.log("test-print-color", a, b) // rgb(16, 14, 19) rgb(33, 42, 42)
  //     return 1
  // }))

  // console.log("test-print-chosenColors", chosenColors) // {'rgb(12, 15, 32)'}
  // console.log("test-print-isTracking", isTracking);

  const blockRef = useRef(null);  // 每个block的大小，用于控制滑块的距离
  const [blockSize, setBlockSize] = useState([0, 0]);
  const inputRef = useRef(null);
  const [dots, setDots] = useState(initPositions); // 目前这里是hardcode
  const [isFilter, setIsFilter] = useState(false);

  // 是否将自然图片展开查看
  const [expandedImage, setExpandedImage] = useState(-1);

  // 控制当前显示的图片数量
  // const imageInOnePage = 50;
  // const [imagePageIndex, setImagePageIndex] = useState(-1);

  // 只处理当前页面的图片
  const [currentPageImages, setCurrentPageImages] = useState([]);

  // console.log("test-print-currentPageImages", currentPageImages)
  // console.log("test-print-imagePageIndex", imagePageIndex)

  // 被框选的图片放在前面
  const sortedImages = currentPageImages.toSorted((a, b) => b.marked - a.marked);

  // 当前显示在队列中的图片数量？
  // let displayedNum = 0;
  // sortedImages.forEach((item) => {
  //   if(item.marked === -1 || (isFilter && item.marked === 0)) {

  //   } else {
  //     displayedNum++;
  //   }
  // })
  // console.log("test-print-displayedNum", displayedNum)

  // chosenStickers: {0, 1, 3}
  // chosenList: 当前显示在reference list中的Segments的index: [0, 1, 3]
  const chosenList = Array.from(chosenStickers);
  // console.log("test-print-chosenList", chosenList)

  useEffect(() => {
    setBlockSize([
      blockRef.current?.clientWidth || 0, // clientWidth是不包含border的
      blockRef.current?.clientHeight || 0
    ]);
  }, [blockRef])

  // console.log("test-print-blockSize", blockRef, blockSize)

  // 散点图过滤
  const handleFilter = (images) => {
    // console.log("test-print-images", images); // [1, 4, 7, 19, 22, 23, 28, 32, 34, 36, 39, 42, 45, 49]
    // marked全部初始化为0
    currentPageImages.forEach(item => item.marked === 1 && (item.marked = 0));
    // 被选中的marked标记为1
    images.forEach(i => currentPageImages[i].marked === 0 && (currentPageImages[i].marked = 1));
    setCurrentPageImages([...currentPageImages]);
    if (images.length) {
      setIsFilter(true);
    } else {
      setIsFilter(false);
    }
  };

  // 滚轮隐藏后，无法直接触发滑动行为，需要新写一个滚轮函数 👇 => Done
  const handleSegmentScroll = (e) => {
    const srollElements = document.getElementsByClassName("segmentList");

    for (const srollElement of srollElements) {
      if (e.deltaY > 0) {
        srollElement.scrollLeft += blockSize[0] + 8;
      } else if (e.deltaY < 0) {
        srollElement.scrollLeft -= blockSize[0] + 8;
      }
    }
  }

  // 自然图片的垂直滚动
  const verticalScroller = useRef(null);
  const [scrollNum, setScrollNum] = useState(0);
  const handleSegmentVerticalScroll = (e) => {
    // 浏览细节图时锁定
    if(expandedImage === -1) {
      const scrollElement = verticalScroller.current;
      // const scrollStep = blockSize[1] * 0.25 - 4.5 + 6;
      // const scrollStep = 129.916 + 6;
      const scrollStep = 60;
      // console.log("test-print-scroll", scrollStep, 129.916 + 6); (136, 135.916)

      // bug(fixed): 加的scrollStep但涨的不是scrollStep => css: overflow跟这个函数有一个就可以了
      if (e.deltaY > 0) {
        scrollElement.scrollTop += scrollStep;
        setScrollNum(scrollNum + 1);
      } else if (e.deltaY < 0) {
        scrollElement.scrollTop -= scrollStep;
      }
    }
  }

  // console.log("test-print-chosenColors", chosenColors)
  /*
      marked === -1: 不包含任意当前关注颜色的图片
      marked === 0: 图片默认的显示状态
      marked === 1: 被散点图框选的图片
  */
  const handleColorClickForFilter = (stickerIndex, clickedColor) => {
    // console.log("test-print-handleColorClickForFilter", stickerIndex, clickedColor);
    
    const clickedColorIndex = chosenColors[stickerIndex].indexOf(clickedColor);
    if(clickedColorIndex !== -1) {
      chosenColors[stickerIndex].splice(clickedColorIndex, 1)
    } else {
      chosenColors[stickerIndex].push(clickedColor)
    }

    // compute the displayedColors according to the chosenColors
    const displayedImages = [];
    for(let k = 0; k < currentPageImages.length; k++) {
      let ifImageContainAllColors = true; 
      let isUndefined = true;
      for(let i = 0; i < chosenColors.length; i++) {
        for(let j = 0; j < chosenColors[i].length; j++) {
          if(isUndefined === true) isUndefined = false

          const color = chosenColors[i][j];
          const imageContainColors = currentPageImages[k]["hasColors"];
          if(imageContainColors !== undefined) {
            if(imageContainColors[i + 1].indexOf(color) === -1) {
              ifImageContainAllColors = false;
              break
            }
          } else {
            ifImageContainAllColors = false;
            break
          }
        }
        if(ifImageContainAllColors === false) break
      }
      
      if(isUndefined) {
        currentPageImages[k].marked = 0;
      } else {
        if(ifImageContainAllColors) {
          currentPageImages[k].marked = 0;
          displayedImages.push(currentPageImages[k]);
        } else {
          currentPageImages[k].marked = -1;
        }
      }
    }

    // console.log("test-print-displayedImages", displayedImages)

    const newDisplayedColors = [];
    stickers.forEach((_) => newDisplayedColors.push([]));
    for(let k = 0; k < displayedImages.length; k++) {
      const containedColors = displayedImages[k]["hasColors"];
      const colorKeys = Object.keys(containedColors);
      for(let m = 0; m < colorKeys.length; m++) {
        const tempStickerIndex = parseInt(colorKeys[m]) - 1;
        for(let n = 0; n < containedColors[colorKeys[m]].length; n++) {
          const tempColor = containedColors[colorKeys[m]][n];
          if(newDisplayedColors[tempStickerIndex].indexOf(tempColor) === -1) {
            newDisplayedColors[tempStickerIndex].push(tempColor)
          }
        }
      }
    }

    setChosenColors(JSON.parse(JSON.stringify(chosenColors)));
    setDisplayedColors(newDisplayedColors);
  }

  // 第一行的segments
  const segItem = chosenList.map((el, i) => {
    // console.log("test-print-el", el, i) // el != i
    return <div
      key={`r-segmentation-item-${el}`}
      className="R-segmentation-item"
      style={{
        marginRight: i === chosenList.length - 1 ? "0px" : "6px",
      }}
    >
      <img className="Segmentation-image-container" src={stickers[el].toDataURL()} alt="" />
      <div className="Segmentation-color-list" onWheel={(e) => { e.stopPropagation() }}>
        {
          colors[el] !== undefined && 
          Object.keys(colors[el]).toSorted((a, b) => colors[el][b] - colors[el][a]).map((item, idx) => {
            const c = d3.color(item);
            c.opacity = 0.15;
            return (<div
              className="Segmentation-color-item"
              key={`r-segmentation-item-color-${idx}`}
              style={{
                backgroundColor: displayedColors[el].length === 0 ? item :
                (displayedColors[el].indexOf(item) !== -1 ? item : c),
                border: chosenColors[el].indexOf(item) !== -1 ? "3px solid #5a4e3b" : "none",
                display: displayedColors[el].length === 0 ? "inline-block" :
                (displayedColors[el].indexOf(item) !== -1 ? "inline-block" : "none")
              }}
              onClick={() => handleColorClickForFilter(el, item)}
            />)
          })
        }
      </div>
    </div>
  })

  /********** 搜索下拉提示 => 更新有点频繁，应该再包装一下 */
  const [filteredDataName, setFilteredDataName] = useState([]);
  const handleSearchInput = (e) => {
    // console.log("test-print-input", e.target.value)
    const word = e.target.value;
    if(word === "") {
      setFilteredDataName([]);
      return
    }
    const filteredDataName = [];
    imageDatasetName.forEach((name) => {
      if(name.indexOf(word) !== -1) filteredDataName.push(name);
    })
    setFilteredDataName(filteredDataName);
  }

  const [focusedDataName, setFocusedDataName] = useState(-1);
  const handleSearchOnKeyUp = (e) => {
    // console.log("test-print-onkeyup", e.keyCode);
    switch(e.keyCode) {
      case 40: // ↓
        if(focusedDataName === -1) setFocusedDataName(0);
        else {
          const newFocused = focusedDataName + 1 > filteredDataName.length - 1 ? filteredDataName.length - 1 : focusedDataName + 1;
          setFocusedDataName(newFocused);
        }
        break
      case 38: // ↑
        const newFocused = focusedDataName - 1 < 0 ? 0 : focusedDataName - 1;
        setFocusedDataName(newFocused);
        break
      case 13: // enter
        if(focusedDataName !== -1) {
          document.getElementById("natural-image-search").value = filteredDataName[focusedDataName];
          setFilteredDataName([]);
          setFocusedDataName(-1);
        }
        break
      case 27: // esc
        setFilteredDataName([]);
        setFocusedDataName(-1);
        break
      default:
        setFocusedDataName(-1);
        return 
    }
  }

  const searchItem = filteredDataName.map((name, idx) => {
    return <div 
      className="Search-item" 
      key={`search-item-${idx}`}
      style={{
        background: idx === focusedDataName ? "#5a4e3b" : ""
      }}
    >
      <span 
        className="Search-item-text"
        style={{
          color: idx === focusedDataName ? "#fff6dc" : "#5a4e3b",
        }}
      >
        {name}
      </span>
    </div>
  })

  // 更新scroller位置
  useEffect(() => {
    const tooltipScroll = document.getElementById("tooltip");
    // tooltip默认显示三个单词
    if(focusedDataName > 2) tooltipScroll.scrollTop = (focusedDataName - 1) * 28;
    else if(focusedDataName < filteredDataName.length - 3) tooltipScroll.scrollTop = (focusedDataName - 1) * 28;
  }, [focusedDataName, filteredDataName])

  /************* * *************/

  // 当前显示图片的物体类别
  const [objectName, setObjectName] = useState("");

  // 先不载入mask.json和tensor.json
  const onSearch = () => {
    const value = inputRef.current.value;
    if(imageDatasetName.indexOf(value) !== -1) {
      const staticImageData = fetchStaticImageData(value);
      const imageDataInPages = [];
      staticImageData.forEach((img, idx) => {
        img["index"] = idx // 全局的索引
        img["marked"] = 0; // 控制显示
        img["trackedSegs"] = {}; // 用于存储tracked segs
        img["highlightSegs"] = {}; // 用于存储高亮需要的数据
        if(idx % imageInOnePage === 0) {
          imageDataInPages.push([img]);
        } else {
          const pageIndex = Math.floor(idx / imageInOnePage);
          imageDataInPages[pageIndex].push(img);
        }
      });

      setObjectName(value);
      setFilteredImages(imageDataInPages);
      setImagePageIndex(0);
      setCurrentPageImages(imageDataInPages[0]);
    }
  }

  // 将当前stickers整理好发给后端
  const handleStartTracking = () => {
    // console.log("test-print-segMaskIndex", segMaskIndex, imagePageIndex) // segMaskIndex = 0

    if(segMaskIndex > 0 && imagePageIndex !== -1) {
      // console.log("test-print-stickers", stickers) // [canvas]
      // console.log("test-print-stickersURL", stickers[0].toDataURL()) // 应该是在原图上直接裁剪的

      const maskArray = [];
      const positionInOrigin = [];
      const annotatedImageArray = []; // 当前被额外标注的自然图片

      const originSegMaskArray = [];
      const imageNumberInContext = (Object.keys(imageContext)).length - 1;

      if(imageNumberInContext === 0) {
        originSegMaskArray.push(segMaskArray);
        annotatedImageArray.push("-1");

      } else if(imageNumberInContext > 0 && currentIndex === -1) { 
        Object.keys(imageContext).forEach(key => {
          const data = imageContext[key];
          const splitOne = key.split("/");
          const splitTwo = splitOne[splitOne.length - 1].split(".");

          if(splitTwo[0] !== "0") { // "0"为painting的标识 => 后面要改掉
            annotatedImageArray.push(splitTwo[0]); // string
            originSegMaskArray.push(data["maskArray"]);
          }
        })
      }

      for(let i = 0; i < originSegMaskArray.length; i++) {
        const tempMaskArray = originSegMaskArray[i];

        // crop masks' 最大外接矩形
        const h = tempMaskArray.length;
        const w = tempMaskArray[0].length;
        const pix = { x: [], y: [] };
        for(let y = 0; y < h; y++) {
          for(let x = 0; x < w; x++) {
            if(tempMaskArray[y][x] > 0) {
              pix.x.push(x);
              pix.y.push(y);
            }
          }
        }

        pix.x.sort((a, b) => a - b);
        pix.y.sort((a, b) => a - b);
        const n = pix.x.length - 1;
        
        const cropW = 1 + pix.x[n] - pix.x[0];
        const cropH = 1 + pix.y[n] - pix.y[0];

        let minW = w;
        let minH = h;
        // 要稍微大一点，不然语义信息有限
        if(imageNumberInContext === 0) {
          minW = Math.min(500, w);
          minH = Math.min(500, h);
        }

        let startX, startY, endX, endY = 0;
        if(cropH < minH) {
          const filledH = Math.floor((minH - cropH) / 2);
          startY = pix.y[0] - filledH < 0 ? 0 : pix.y[0] - filledH;
          endY = startY + minH - 1 >= h ? h - 1 : startY + minH - 1;
        } else {
          startY = pix.y[0];
          endY = pix.y[n];
        }

        if(cropW < minW) {
          const filledW = Math.floor((minW - cropW) / 2);
          startX = pix.x[0] - filledW < 0 ? 0 : pix.x[0] - filledW;
          endX = startX + minW - 1 >= w ? w - 1 : startX + minW - 1;
        } else {
          startX = pix.x[0];
          endX = pix.x[n];
        }

        const cropMaskArray = Array.from(new Array(1 + endY - startY), () => new Array(1 + endX - startX).fill(0));
        for(let y = startY; y < endY; y++) {
          for(let x = startX; x < endX; x++) {
            cropMaskArray[y - startY][x - startX] = tempMaskArray[y][x];
          }
        }

        maskArray.push(cropMaskArray);
        positionInOrigin.push([startX, startY, endX, endY])
      }

      const objectName = document.getElementById("natural-image-search").value;
      
      // 开始导入动画
      setShowLoadingModal(true);

      console.log("test-print-backendData", maskArray, positionInOrigin, annotatedImageArray, segMaskIndex)

      /*
        maskArray: 记录了mask的位置 => 这两个参数应该都是数组才对 => 对应多张reference
        positionInOrigin: [sx, sy, ex, ey]
      */
      fetch("http://localhost:8000/part-tracking", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maskArray: maskArray, 
          positionInOrigin: positionInOrigin,
          objectName: objectName,
          imageIndex: [
            imagePageIndex * imageInOnePage + 1,
            imagePageIndex === filteredImages.length - 1 
            ? imagePageIndex * imageInOnePage + filteredImages[filteredImages.length - 1].length
            : (imagePageIndex + 1) * imageInOnePage
          ],
          annotatedImageArray: annotatedImageArray,
          lastMaskID: segMaskIndex,
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log("test-print-firstConnection-to-my-backend", data) // good

        const trackedSegs = data["tracked_segs"];
        const highlightSegs = data["tracked_coordinates"];
        for(let i = 0; i < trackedSegs.length; i++) {
          filteredImages[imagePageIndex][i]["trackedSegs"] = trackedSegs[i];
          filteredImages[imagePageIndex][i]["highlightSegs"] = highlightSegs[i];

          // 其实最好是把这段逻辑放在tracking逻辑的外面 => 架构不行，会重复渲染
          const keys = Object.keys(trackedSegs[i]);
          filteredImages[imagePageIndex][i]["countedColors"] = {};
          filteredImages[imagePageIndex][i]["hasColors"] = {};
          for(let k = 0; k < keys.length; k++) {
            const trackedSeg = trackedSegs[i][keys[k]];
            filteredImages[imagePageIndex][i]["hasColors"][keys[k]] = [];

            if(trackedSeg !== undefined && trackedSeg !== "") {
              // 为每个seg统计颜色
              const img = new window.Image();
              img.src = `data:image/png;base64,${trackedSeg}`;

              img.onload = () => { // 包装出一个函数
                const canvas = document.createElement('canvas');
                const pixelSize = 3; // 每个超像素的大小
                const scaledWidth = Math.ceil(img.width / pixelSize);
                const scaledHeight = Math.ceil(img.height / pixelSize);

                canvas.width = scaledWidth;
                canvas.height = scaledHeight;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if(!!ctx) {
                  ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
                  const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);

                  // statistic
                  const pixels = imageData.data;
                  const colorFrequency = {};
                  const labs = [];
                  let total = 0;
                  for (let i = 0; i < pixels.length; i += 4) {
                      const r = pixels[i];
                      const g = pixels[i + 1];
                      const b = pixels[i + 2];
                      const a = pixels[i + 3];
                      if (a === 0) { // 直接用alpha判断吧
                          continue;
                      }
                      ++total;
                      const color = d3.rgb(r, g, b);
                      labs.push(d3.lab(color));
                  }

                  // eps越大簇的规模越大 => 第一次聚类
                  const dbscanner = jDBSCAN().eps(30).minPts(5).data(labs);  // 30 - 10
                  dbscanner();
                  const cluster_centers = dbscanner.getClusters();

                  cluster_centers.forEach(({ l, a, b, parts }) => {
                      const key = d3.rgb(d3.lab(l, a, b)).toString();
                      colorFrequency[key] = Array.from(new Set(parts)).length / total;
                  });

                  filteredImages[imagePageIndex][i]["countedColors"][keys[k]] = colorFrequency;
                  // console.log("test-print-colorFrequency", i, k, colorFrequency);
                }
              }
            } else {
              filteredImages[imagePageIndex][i]["countedColors"][keys[k]] = {};
            }
          }
        }

        setExpandedImage(-1);
        setFilteredImages([...filteredImages]);
        setShowLoadingModal(false);

        // 将paintingboard中的内容切回古画 => 一样无法继续分割
        if(image) {
          if((image.src).indexOf(PAINTINGPATH) === -1) {
            const keys = Object.keys(imageContext);
            for(let k = 0; k < keys.length; k++) {
                if(keys[k].indexOf(PAINTINGPATH) !== -1) {
                    handleResetPaintingImage(keys[k]);
                    setEditingMode("painting");
                    break
                }
            }
          }
        }

        setDots(initPositions); // TODO: 目前还是基于SIFT特征点匹配的结果，需要换一个更站的住脚的说法 => 后面让布伟试试
        setIsTracking(true);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setShowLoadingModal(false);
      });
    }
  }

  // console.log("test-print-expandedImage", expandedImage)
  // console.log("test-print-currentIndex", currentIndex)

  const segmentedImages = [];
  const keys = Object.keys(imageContext);
  keys.forEach((path) => {
    if(path.indexOf(PAINTINGPATH) === -1) segmentedImages.push(path);
  })

  const getImageAnnotatedIndex = (image, images) => {
    for(let i = 0; i < images.length; i++) {
        if(images[i].indexOf(image) !== -1) {
            return i; 
        }
    }
    return -1;
  }

  // console.log("test-print-segmentedImages", segmentedImages)

  return <div className="SView-container">
    <div className="Reference-view-content">
      <div className="STitle-container">
        <span className="STitle-text">Reference Images</span>
      </div>
      <div className="STitle-container" style={{ marginTop: "8px" }}>
        <div className="Reference-toolbar-container">
          <input 
            ref={inputRef} 
            className="Reference-toolbar-search"
            id="natural-image-search"
            onInput={(e) => handleSearchInput(e)}
            onKeyUp={(e) => handleSearchOnKeyUp(e)}
          />
          {
            filteredDataName.length > 0 && 
            <div className="Search-tooltip" id="tooltip">
              {searchItem}
            </div>
          }
          <div className="Reference-search-button">
            <div
              className="Icon-button"
              style={iconStyle(SearchIcon)}
              onClick={onSearch}
            />
          </div>
          <div className="Reference-number-switch-left">
            <div
              className="Icon-button"
              style={iconStyle(LeftIcon)}
              onClick={() => {
                if(imagePageIndex > 0) {
                  setImagePageIndex(imagePageIndex - 1);
                  setCurrentPageImages([...(filteredImages[imagePageIndex - 1])]);
                  setIsTracking(false);
                  setExpandedImage(-1);
                }
              }}
            />
          </div>
          <div className="Reference-number-display">
            <span 
              className="STitle-text-contrast" 
              style={{ marginLeft: "0px", fontSize: "16px", cursor: "default" }}
            >
              { imagePageIndex !== -1 &&
              `${imagePageIndex * imageInOnePage + 1} - ${
                imagePageIndex === filteredImages.length - 1 
                ? imagePageIndex * imageInOnePage + filteredImages[filteredImages.length - 1].length
                : (imagePageIndex + 1) * imageInOnePage}`}
            </span>
          </div>
          <div className="Reference-number-switch-right">
            <div
              className="Icon-button"
              style={{ ...iconStyle(LeftIcon), transform: "rotateY(180deg)" }}
              onClick={() => {
                if(imagePageIndex < filteredImages.length - 1) {
                  setImagePageIndex(imagePageIndex + 1);
                  setCurrentPageImages([...(filteredImages[imagePageIndex + 1])]);
                  setIsTracking(false);
                  setExpandedImage(-1);
                }
              }}
            />
          </div>
          <div 
            className={`Reference-image-confirm ${stickers.length > 0 && objectName !== "" && currentIndex === -1 ? 'active' : ''}`} 
            style={{marginRight: "0px"}}
          >
            <div
              className="Icon-button"
              style={{
                background: `url(${TrackIcon}) no-repeat`,
                backgroundSize: 'contain',
                width: `${iconLevel1 * 0.8}px`,
                height: `${iconLevel1 * 0.8}px`,
                cursor: 'pointer',
              }}
              onClick={handleStartTracking}
              alt="Tracking segments in the natural images"
            />
          </div>
          <div className={`Reference-image-confirm ${(expandedImage !== -1 && currentIndex === -1) ? 'active' : ''}`}
            style={{
              marginRight: "0px"
            }}
          >
            <div
              className="Icon-button"
              style={iconStyle(ReSegmentSVG)}
              onClick={() => {
                if(objectName !== "") {
                  handleImageResegment(expandedImage, objectName);
                }
              }}
            />
          </div>
          <div className={`Reference-image-confirm ${expandedImage === -1 ? '' : 'active'}`}>
            <div
              className="Icon-button"
              style={iconStyle(ConfirmIcon)}
              onClick={() => {
                // confirm logic
                if(expandedImage !== -1) {
                  const imageSrc = filteredImages[imagePageIndex][expandedImage % imageInOnePage]["contentUrl"];
                  console.log("test-print-imageSrc", imageSrc)
                  setReferenceImage(imageSrc);
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="Reference-image-list" ref={blockRef}>
        {
          chosenList.length === 0 ? 
            <ImageViewer 
              images={currentPageImages}
              pageIndex={imagePageIndex}
              expandedImage={expandedImage}
              setExpandedImage={setExpandedImage}
              segmentedImages={segmentedImages}
              getImageAnnotatedIndex={getImageAnnotatedIndex}
            /> :
          <div className="SDefault-container">
            <div className="Reference-image-firstrow">
            {
              sortedImages.length ? <>
              <div className="Reference-projection-container">
                <div className="Reference-projection">
                  <Scatter 
                    handleFilter={handleFilter} 
                    dots={dots.slice(
                      imagePageIndex * imageInOnePage, 
                      imagePageIndex === filteredImages.length - 1 
                      ? imagePageIndex * imageInOnePage + filteredImages[filteredImages.length - 1].length
                      : (imagePageIndex + 1) * imageInOnePage)}
                    currentImages={filteredImages[imagePageIndex]}
                  />
                </div>
              </div>
              <div
                className="Reference-segmentation-list segmentList"
                onWheel={handleSegmentScroll}
              >
                {segItem}
              </div>
              </> : <></>
            }
            </div>

            <div className="Reference-image-rows-container">
              <div 
                className="Reference-image-rows"
                ref={verticalScroller}
                onWheel={handleSegmentVerticalScroll}
              >
                { // 
                  sortedImages.length ? sortedImages.map((item, r) => {
                    const annotatedIndex = getImageAnnotatedIndex(item.thumbnailUrl, segmentedImages);
                    return <div
                      className={`Reference-image-appendrow ${sortedImages[r].marked === -1 || (isFilter && sortedImages[r].marked === 0) ? 'miss' : ''}`}
                      key={`Reference-image-${r}`}
                      style={{
                        marginTop: `${r === 0 ? "0px" : "6px"}`,
                      }}
                    >
                      {
                        <>
                          <div className={`Reference-image-container ${item["index"] === expandedImage ? 'active' : ''}`}>
                            <div className="Reference-image">
                              <img
                                src={item.thumbnailUrl}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: "4px"
                                }}
                                alt=""
                              />

                              { // same as ImageViewer.js
                                annotatedIndex !== -1 && <div className="Annotated-index">
                                    <span 
                                        className="STitle-text-contrast" 
                                        style={{ 
                                            marginLeft: "0px", 
                                            fontSize: "16px", 
                                            cursor: "default"
                                        }}>
                                            R{annotatedIndex + 1}
                                        </span>
                                </div>
                              }
                            </div>

                            <div className="R-segmentation-mask">
                              <button onClick={() => {
                                if(expandedImage === item["index"]) {
                                  setExpandedImage(-1);
                                  // 要管理哪些状态？
                                } else {
                                  setExpandedImage(item["index"]);
                                }
                              }}>
                                <div
                                  style={{
                                    backgroundImage: `url(${ExpandSVG})`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: 'contain',
                                    width: `${48}px`,
                                    height: `${48}px`,
                                    cursor: 'pointer',
                                  }}
                                />
                              </button>
                            </div>
                          </div>
                          <div className="Reference-segmentation-list segmentList" style={{overflowX: "hidden"}}>
                            {
                              chosenList.map((el, i) => {
                                const indexInAllImage = item["index"];
                                const trackedSegs = filteredImages[imagePageIndex][indexInAllImage % imageInOnePage]["trackedSegs"];

                                return <div
                                  key={`r-segmentation-projection-${i}`}
                                  className="R-segmentation-image"
                                  style={{
                                    marginRight: i === chosenList.length - 1 ? "0px" : "6px",
                                  }}
                                >
                                  <div className="Reference-image" style={{cursor: "default"}}>
                                    {
                                      JSON.stringify(trackedSegs) !== "{}" && trackedSegs[el + 1] !== "" ?
                                      <img 
                                        src={`data:image/png;base64,${trackedSegs[el + 1]}`}
                                        alt=""
                                      /> : <></>
                                    }
                                  </div>
                              </div>
                              })
                            }
                          </div>
                        </>
                      }
                    </div>
                  }) : <></>
                }
              </div>

              {
                expandedImage !== -1 && 
                <div 
                  className="Detail-view-container" 
                  style={{
                    left: `${blockSize[0] * 0.25 + 1.5}px`,
                  }}
                >
                  <SegmentViewer 
                    imageIndex={expandedImage} 
                    handleSelectedImage={handleSelectedImage}
                    objectName={objectName}
                  />
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  </div>
}


// @app.post("/part-tracking")
// async def part_tracking(request: Request):
//     print("part-tracking ···")
//     data = await request.json()
    
//     pred_mask_array = data["maskArray"]
//     position_in_origin_array = data["positionInOrigin"]
//     object_name = data["objectName"]
//     # image_index = data["imageIndex"]
//     image_index = [1, 5] # test setting
//     annotated_image_array = data["annotatedImageArray"] # 用annotated_image_array[0] == "-1"区分

//     for o in range(len(pred_mask_array)):
//         pred_mask = np.array(pred_mask_array[o], dtype=np.uint8)
//         position_in_origin = position_in_origin_array[o]
        
//         # basic params
//         p_h, p_w = pred_mask.shape
//         [sx, sy, ex, ey] = position_in_origin
//         resize_shape = (p_w, p_h)
        
//         # load painting image and crop it
//         if annotated_image_array[0] == "-1":
//             painting_path = "./paintings/0.png"
//         else:
//             painting_path = "./natural-images/" + object_name + "-nobg/" + annotated_image_array[o] + ".jpg"

//         print("reffence images path: ", painting_path)
            
//         painting_image = cv2.imread(painting_path)
//         cropped_painting = (cv2.cvtColor(painting_image, cv2.COLOR_BGR2RGB))[sy:ey+1, sx:ex+1]
        
//         # load natural images without background
//         image_index = list(range(image_index[0], image_index[1]+1))
//         natural_images = [cv2.cvtColor(
//             cv2.imread("./natural-images/"+object_name+"-nobg/"+str(i)+".jpg"), 
//             cv2.COLOR_BGR2RGB
//         ) for i in image_index]

//         # start tracking
//         pred_list = []
//         torch.cuda.empty_cache()
//         gc.collect()
//         segtracker = SegTracker(segtracker_args, sam_args, aot_args)
//         segtracker.restart_tracker()
        
//         # 这里的逻辑还要改一下: TODO: 2) add more than one references
//         # hasDone: 1) deactivate short-term memory;
//         with torch.cuda.amp.autocast():
//             # add reference
//             segtracker.add_reference(cropped_painting, pred_mask) # added into lstt memories
//             # track in natural images
//             for image in natural_images:
//                 # resize to the shape of pred_mask
//                 image = cv2.resize(image, resize_shape)
//                 pred_mask_natural = segtracker.track(image, update_memory=False) # update_memory: 是否更新长短期记忆模块
//                 torch.cuda.empty_cache()
//                 gc.collect()
//                 pred_list.append(pred_mask_natural)
    
//         # output segs
//         image_segs = []
//         total_masks = np.unique(pred_mask)
//         init_segs = {}
    
//         seg_coordinates = []
//         init_coordinates = {}
//         highlight_color = [255, 246, 220]
    
//         for id in total_masks:
//             if id == 0:
//                 continue
//             init_segs[str(id)] = ""
//             init_coordinates[str(id)] = {
//                 "coordinates": [],
//                 "highlight": ""
//             }
        
//         for i in range(len(pred_list)):
//             mask_ids = np.unique(pred_list[i])
//             h, w, _ = natural_images[i].shape
//             image_segs.append(copy.deepcopy(init_segs))
//             seg_coordinates.append(copy.deepcopy(init_coordinates))
    
//             for k in mask_ids:
//                 if k == 0:
//                     continue
                
//                 # filter single mask
//                 clean_mask = copy.deepcopy(pred_list[i])
//                 for m in range(p_h):
//                     for n in range(p_w):
//                         if clean_mask[m][n] != k:
//                             clean_mask[m][n] = 0
    
//                 # clean the interpolated values created by the resize ops
//                 clean_mask = cv2.resize(clean_mask, (w, h))
//                 for m in range(h):
//                     for n in range(w):
//                         if clean_mask[m][n] == k:
//                             clean_mask[m][n] = 1
//                         else:
//                             clean_mask[m][n] = 0
    
//                 alpha_layer = copy.deepcopy(clean_mask) * 255
                
//                 # seg original image
//                 seg = natural_images[i] * clean_mask[:, :, np.newaxis]
//                 r_layer, g_layer, b_layer = cv2.split(seg)
//                 seg = cv2.merge((b_layer, g_layer, r_layer, alpha_layer))
    
//                 # compute the minimum enclosing rectangle 
//                 [sx, ex, sy, ey] = minimum_rectangle(clean_mask)
    
//                 if sx == -1: # 为什么之前没有这个bug
//                     image_segs[i][str(k)] = ""
//                     seg_coordinates[i][str(k)]["coordinates"] = []
//                     seg_coordinates[i][str(k)]["highlight"] = ""
//                 else:
//                     seg_highlight = cv2.merge((
//                         copy.deepcopy(clean_mask) * highlight_color[2], # B
//                         copy.deepcopy(clean_mask) * highlight_color[1], # G 
//                         copy.deepcopy(clean_mask) * highlight_color[0], # R
//                         copy.deepcopy(clean_mask) * 180, # opacity
//                     ))
                    
//                     seg = seg[sy:ey+1, sx:ex+1]
//                     seg_highlight = seg_highlight[sy:ey+1, sx:ex+1]
                    
//                     # transform to base64
//                     _, encoded_image = cv2.imencode(".png", seg)
//                     base64_image = base64.b64encode(encoded_image).decode('utf-8')
//                     image_segs[i][str(k)] = base64_image
        
//                     _, encoded_highlight = cv2.imencode(".png", seg_highlight)
//                     base64_highlight = base64.b64encode(encoded_highlight).decode('utf-8')
//                     seg_coordinates[i][str(k)]["coordinates"] = [sx, ex, sy, ey]
//                     seg_coordinates[i][str(k)]["highlight"] = base64_highlight
            
//             test_res = draw_mask(natural_images[i], cv2.resize(pred_list[i], (w, h)))
//             test_res = cv2.cvtColor(test_res, cv2.COLOR_RGB2BGR)
//             cv2.imwrite("./paintings/track-res-nobg-res"+str(i+1)+".png", test_res)

//         # test
//         init_res = draw_mask(cropped_painting, pred_mask, id_countour=False)
//         out_res = cv2.cvtColor(init_res, cv2.COLOR_RGB2BGR)
//         cv2.imwrite("./paintings/seg-mask.png", init_res)     

//     # # test-output
//     # for i in range(len(pred_list)):
//     #     test_res = draw_mask(cv2.resize(natural_images[i], resize_shape), pred_list[i])
//     #     test_res = cv2.cvtColor(test_res, cv2.COLOR_RGB2BGR)
//     #     cv2.imwrite("./paintings/track-res-nobg"+str(i+1)+".png", test_res)
    
//     return {
//         "tracked_segs": image_segs,
//         "tracked_coordinates": seg_coordinates,
//     }