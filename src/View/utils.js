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

export function adaptTooltipPosition (hoverPosition, rectSize, pigmentNum, hoverPanelSize, floatDirection) {
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

export function valuePositionWithMinMaxValues (value, list) {
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
