const getFile = (imageURL: URL) => {
  let imageBlob = null;
  fetch(imageURL)
    .then(response => response.blob())
    .then(blob => {
      imageBlob = new File([blob], "image.jpeg", { type: blob.type })
    })
    .catch(error => {
      console.error(error);
  });
  return imageBlob
}

// const getFile = async (data: URL) => {
//   const response = await fetch(data);
//   const blob = await response.blob();
//   return new File([blob], "image.jpeg", { type: blob.type });
// };

export default getFile;
