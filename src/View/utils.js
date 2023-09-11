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