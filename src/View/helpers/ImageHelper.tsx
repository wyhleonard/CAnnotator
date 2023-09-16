const handleImageScale = (data: HTMLImageElement) => {
    const IMAGE_SIZE = 625;
    const UPLOAD_IMAGE_SIZE = 625;
    let w = data.width;
    let h = data.height;
    let scale;
    let uploadScale;
    // if (h < w) {
    //   scale = IMAGE_SIZE / h;
    //   // if (h * scale > 1333) {
    //   //   scale = 1333 / h;
    //   // }
    //   uploadScale = UPLOAD_IMAGE_SIZE / w;
    // } else {
    //   scale = IMAGE_SIZE / w;
    //   // if (w * scale > 1333) {
    //   //   scale = 1333 / w;
    //   // }
    //   uploadScale = UPLOAD_IMAGE_SIZE / h;
    // }
    scale = IMAGE_SIZE / h;
    scale = 1;
    return { height: h, width: w, scale, uploadScale: scale };
  };
  
  export { handleImageScale };
  