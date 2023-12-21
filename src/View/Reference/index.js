import "../sharedCss.css"
import "./index.css"
import SearchIcon from "../../Icons/search.svg";
import LeftIcon from "../../Icons/triangle.svg";
import ConfirmIcon from "../../Icons/confirm.svg";
import TrackIcon from "../../Icons/track.svg";
import { iconLevel1 } from "../sharedConstants";
import { useContext, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { localPictureData } from "../helpers/pictureData";
import { initPositions } from "../helpers/hardcode";
import AppContext from "../hooks/createContext";
import Scatter from "./Scatter";
import ExpandSVG from "../../Icons/expand.svg"
import ReSegmentSVG from "../../Icons/resegment.svg";
import { fetchStaticImageData } from "../helpers/staticImageData";
import { ImageViewer } from "./components/ImageViewer";

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
  handleMaskEdit, 
  selectedImg, 
  setSelectedImg
}) => {
  const {
    chosenColors: [chosenColors, setChosenColors],
    // isPreProcess: [, setIsPreProcess],
    chosenStickers: [chosenStickers,],
    filteredImages: [filteredImages, setFilteredImages],
    stickers: [stickers,],  // 古画已分割的components: [canvas, canvas, canvas]: stickers[el].toDataURL()关注这个变量
    blobMap: [blobMap,],
    isEditing: [, setIsEditing],
    showLoadingModal: [, setShowLoadingModal],
    activeSticker: [, setActiveSticker],
    imageContext: [imageContext,],  // stickers各图片已分割好的components，都是canvas
    isTracking: [isTracking, setIsTracking],
    stickerForTrack: [stickerForTrack],
    segMaskArray: [segMaskArray],
    segMaskIndex: [segMaskIndex],
  } = useContext(AppContext);

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
  const [dots, setDots] = useState([[0, 0]]);
  const [isFilter, setIsFilter] = useState(false);

  // 是否将自然图片展开查看
  const [expandedImage, setExpandedImage] = useState(-1);

  // 控制当前显示的图片数量
  const imageInOnePage = 50;
  const [imagePageIndex, setImagePageIndex] = useState(-1);

  // 只处理当前页面的图片
  const [currentPageImages, setCurrentPageImages] = useState([]);

  // console.log("test-print-currentPageImages", currentPageImages)
  // console.log("test-print-imagePageIndex", imagePageIndex)

  // 被框选的图片放在前面
  const sortedImages = currentPageImages.toSorted((a, b) => b.marked - a.marked);

  // 当前显示在队列中的图片数量？
  let displayedNum = 0;
  sortedImages.forEach((item) => {
    if(item.marked === -1 || (isFilter && item.marked === 0)) {

    } else {
      displayedNum++;
    }
  })

  console.log("test-print-displayedNum", displayedNum)

  // chosenStickers: {0, 1, 3}
  // chosenList: 当前显示在reference list中的Segments的index: [0, 1, 3]
  const chosenList = Array.from(chosenStickers);

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
      const scrollStep = blockSize[1] * 0.25 - 4.5 + 6;

      // bug(fixed): 加的scrollStep但涨的不是scrollStep => css: overflow跟这个函数有一个就可以了
      if (e.deltaY > 0) {
        scrollElement.scrollTop += scrollStep;
        setScrollNum(scrollNum + 1);
      } else if (e.deltaY < 0) {
        scrollElement.scrollTop -= scrollStep;
      }
    }
  }

  /*
      marked === -1: 不包含任意当前关注颜色的图片
      marked === 0: 图片默认的显示状态
      marked === 1: 被散点图框选的图片
  */
  const handleBarClick = (color) => {
    if (chosenColors.has(color)) {
      chosenColors.delete(color);
    } else {
      chosenColors.add(color);
    }
    if (chosenColors.size === 0) {
      currentPageImages.forEach(item =>
        (item.marked = 0)
      );
    } else {
      currentPageImages.forEach(item =>
        (item.marked = -1)
      );

      // 图片只要包含了一个被关注的颜色，就会被显示
      chosenColors.forEach((c) => {
        chosenList.forEach(el => {
          currentPageImages.forEach(item =>
            imageContext[blobMap[item.contentUrl]]["stickers"][el]["hasColors"].has(c) && (item.marked = 0)
          )
        })
      });
    }
    setChosenColors(new Set([...chosenColors]));
  };

  // 第一行的segments
  const segItem = chosenList.map((el, i) => {
    // console.log("test-print-el", el, i) // el != i
    return <div
      key={`r-segmentation-item-${i}`}
      className="R-segmentation-item"
      style={{
        marginRight: i === chosenList.length - 1 ? "0px" : "6px",
      }}
    >
      <img className="Segmentation-image-container" src={stickers[el].toDataURL()} alt="" />
      <div className="Segmentation-color-list" onWheel={(e) => { e.stopPropagation() }}>
        {
          Object.keys(colors[el]).toSorted((a, b) => colors[el][b] - colors[el][a]).map((item) => {
            const c = d3.color(item);
            c.opacity = 0.2;
            return (<div
              className="Segmentation-color-item" style={{
                backgroundColor: !chosenColors.size ?
                  item :
                  (chosenColors.has(item) ? item : c)
              }}
              onClick={() => handleBarClick(item)}
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
        if(idx % imageInOnePage === 0) {
          imageDataInPages.push([img]);
        } else {
          const pageIndex = Math.floor(idx / imageInOnePage);
          imageDataInPages[pageIndex].push(img);
        }
      });

      setFilteredImages(imageDataInPages);
      setImagePageIndex(0);
      setCurrentPageImages(imageDataInPages[0]);
    }
  }

  // 将当前stickers整理好发给后端
  const handleStartTracking = () => {

    // 当自然图片的track为0时，直接用古画的seg进行track => 结果一般很差
    if(stickerForTrack.length === 0 && segMaskIndex > 0 && imagePageIndex !== -1) {
      // console.log("test-print-stickers", stickers) // [canvas]
      // console.log("test-print-stickersURL", stickers[0].toDataURL()) // 应该是在原图上直接裁剪的
      console.log("test-print-segMaskIndex", segMaskIndex); // 1

      // crop masks' 最大外接矩形
      const h = segMaskArray.length;
      const w = segMaskArray[0].length;
      const pix = { x: [], y: [] };
      for(let y = 0; y < h; y++) {
        for(let x = 0; x < w; x++) {
          if(segMaskArray[y][x] > 0) {
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

      // 要稍微大一点，不然语义信息有限
      const minW = 500;
      const minH = 500;
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
          cropMaskArray[y - startY][x - startX] = segMaskArray[y][x];
        }
      }

      const objectName = document.getElementById("natural-image-search").value;
      
      // 开始导入动画
      setShowLoadingModal(true);

      /*
        maskArray: 记录了mask的位置，
        positionInOrigin: [sx, sy, ex, ey]
      */
      fetch("http://localhost:8000/part-tracking", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maskArray: cropMaskArray,
          positionInOrigin: [startX, startY, endX, endY],
          objectName: objectName,
          imageIndex: [
            imagePageIndex * imageInOnePage + 1,
            imagePageIndex === filteredImages.length - 1 
            ? imagePageIndex * imageInOnePage + filteredImages[filteredImages.length - 1].length
            : (imagePageIndex + 1) * imageInOnePage
          ]
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log("test-print-firstConnection-to-my-backend", data) // good

        const trackedSegs = data["tracked_segs"];
        for(let i = 0; i < trackedSegs.length; i++) {
          filteredImages[imagePageIndex][i]["trackedSegs"] = trackedSegs[i];
        }

        setFilteredImages([...filteredImages]);
        setShowLoadingModal(false);

        setIsTracking(true); // 切换reference view中的展现形式
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setShowLoadingModal(false);
      });
    }
  }

  // console.log("test-print-expandedImage", expandedImage)

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
          <div className="Reference-image-track">
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
            />
          </div>
          <div className={`Reference-image-confirm ${selectedImg === -1 ? '' : 'active'}`}>
            <div
              className="Icon-button"
              style={iconStyle(ConfirmIcon)}
              onClick={() => {
                // confirm logic
              }}
            />
          </div>
        </div>
      </div>

      <div className="Reference-image-list" ref={blockRef}>
        {
          chosenList.length === 0 ? <ImageViewer images={currentPageImages}/> :
          <div className="SDefault-container">
            <div className="Reference-image-firstrow">
            {
              sortedImages.length ? <>
              <div className="Reference-projection-container">
                <div className="Reference-projection">
                  <Scatter handleFilter={handleFilter} dots={dots} />
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

            <div 
              className="Reference-image-rows"
              ref={verticalScroller}
              onWheel={handleSegmentVerticalScroll}
            >
              {
                sortedImages.length ? sortedImages.map((item, r) => (
                  <div
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
                          </div>

                          <div className="R-segmentation-mask">
                            <button onClick={() => {
                              setExpandedImage(expandedImage === item["index"] ? -1 : item["index"])
                            }}>
                              <div
                                style={{
                                  background: `url(${ExpandSVG}) no-repeat`,
                                  backgroundSize: 'contain',
                                  width: `${48}px`,
                                  height: `${48}px`,
                                  cursor: 'pointer',
                                }}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="Reference-segmentation-list segmentList">
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
                                <div className="Reference-image">
                                  {
                                    JSON.stringify(trackedSegs) !== "{}" && trackedSegs[el + 1] !== "" ?
                                    <img 
                                      src={`data:image/png;base64,${trackedSegs[el + 1]}`}
                                      alt=""
                                    /> : <></>
                                  }
                                </div>
                                
                                <div className="R-segmentation-mask">
                                  <button>
                                    <div
                                      style={{
                                        background: `url(${ReSegmentSVG}) no-repeat`,
                                        backgroundSize: 'contain',
                                        width: `${48}px`,
                                        height: `${48}px`,
                                        cursor: 'pointer',
                                      }}
                                    />
                                  </button>
                                </div>
                            </div>
                            })
                          }
                      </div>
                    </>
                    }
                  </div>
                )) : <></>
              }

              {
                expandedImage !== -1 && 
                <div 
                  className="Detail-view-container" 
                  style={{
                    left: `${blockSize[0] * 0.25}px`,
                    top: ``
                  }}
                >

                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  </div>
}

// <button onClick={() => {
//   setIsEditing(2); // 2?
//   setActiveSticker(el);
//   handleMaskEdit(blobMap[item.contentUrl], el)
// }}>

// 直接覆盖吧
