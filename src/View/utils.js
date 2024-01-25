import * as d3 from "d3";
import jDBSCAN from "./helpers/jDBScan";
import { pixelSize } from "./sharedConstants";

export function adaptWH(img, container) {
    const w1 = img[0];
    const h1 = img[1];
    const w2 = container[0];
    const h2 = container[1];
    const ratioW = w1 / w2;
    const ratioH = h1 / h2;

    if(w1 <= w2 && h1 <= h2) {
        if(ratioW < ratioH) {
            return [h2 * (w1 / h1), h2]
        } else {
            return [w2, w2 * (h1 / w1)]
        }
    } else if(w1 > w2 && h1 > h2) {
        if(ratioW < ratioH) {
            return [h2 * (w1 / h1), h2]
        } else {
            return [w2, w2 * (h1 / w1)]
        }
    } else if(w1 <= w2 && h1 > h2) {
        return [h2 * (w1 / h1), h2]
    } else if(w1 > w2 && h1 <= h2) {
        return [w2, w2 * (h1 / w1)]
    }
}

export function adaptTooltipPosition(hoverPosition, rectSize, pigmentNum, hoverPanelSize, floatDirection) {
    let hoverPanelLeft = 0;
    let hoverPanelTop = 0;

    const marginConstant = 4;
    const upBoundary = 0;
    const bottomBoundary = pigmentNum * rectSize[1];
    const startPosition = hoverPosition[0] * rectSize[1];
    const heightGap = (hoverPanelSize[1] - rectSize[1]) / 2;
    if(startPosition + rectSize[1] + heightGap > bottomBoundary) {
        hoverPanelTop = bottomBoundary - hoverPanelSize[1] - marginConstant;
    } else if (startPosition - heightGap < upBoundary) {
        hoverPanelTop = marginConstant;
    } else {
        hoverPanelTop = startPosition - heightGap;
    }

    const marginLRConstant = 8;
    if(floatDirection) {
        hoverPanelLeft = (hoverPosition[1] + 1) * rectSize[0] + marginLRConstant;
    } else {
        hoverPanelLeft = hoverPosition[1] * rectSize[0] - marginLRConstant - hoverPanelSize[0];
    }

    return {
        hoverPanelLeft: hoverPanelLeft,
        hoverPanelTop: hoverPanelTop,
    }
}

export function valuePositionWithMinMaxValues(value, list) {
    if(list.length > 0) {
        // let min = list[0][1];
        let min = 0;
        let max = list[0][1];
        list.forEach(d => {
            if(d[1] < min) min = d[1];
            if(d[1] > max) max = d[1];
        })

        return (value - min) / (max - min);
    } else {
        return 0;
    }
}

export function findTargetInFilteredImages(index, filteredImages) {
    let imagePath = "";
    for(let i = 0; i < filteredImages.length; i++) {
        for(let j = 0; j < filteredImages[i].length; j++) {
            if(filteredImages[i][j]["index"] === index) {
                imagePath = filteredImages[i][j]["contentUrl"];
                break
            }
        }
        if(imagePath !== "") break
    }

    return imagePath
}

export function findMaxValueInArray(array) {
    let maxValue = 0;
    for(let i = 0; i < array.length; i++) {
        for(let j = 0; j < array.length; j++) {
            if(array[i][j] > maxValue) maxValue = array[i][j];
        }
    }
    
    return maxValue
}

// 似乎可以直接用index
export function checkImageIsLoaded(context, index) {
    const keys = Object.keys(context);
    const loadedInfo = [false, ""];
    for(let k = 0; k < keys.length; k++) {
        const splitOne = keys[k].split("/");
        const splitTwo = splitOne[splitOne.length - 1].split(".")
        if(parseInt(splitTwo[0]) === index + 1) {
            loadedInfo[0] = true;
            loadedInfo[1] = keys[k];
            break
        }
    }
    return loadedInfo
}

export function countColorinSticker(w, h, image) {
    const canvas = document.createElement('canvas');
    const scaledWidth = Math.ceil(w / pixelSize);
    const scaledHeight = Math.ceil(h / pixelSize);
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const colorFrequency = {};

    if(!!ctx) {
        ctx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
        const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);

        // statistic
        const pixels = imageData.data;
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
        const dbscanner = jDBSCAN().eps(30).minPts(5).data(labs);
        dbscanner();
        const cluster_centers = dbscanner.getClusters();

        cluster_centers.forEach(({ l, a, b, parts }) => {
            const key = d3.rgb(d3.lab(l, a, b)).toString();
            colorFrequency[key] = Array.from(new Set(parts)).length / total;
        });
    }

    return colorFrequency
}