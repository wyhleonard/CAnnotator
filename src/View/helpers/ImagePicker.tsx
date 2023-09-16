import { useDropzone } from "react-dropzone";
export interface ImagePickerProps {
  handleSelectedImage: (
    data: File | URL,
    options?: { shouldDownload?: boolean; shouldNotFetchAllModel?: boolean }
  ) => void;
}

const ImagePicker = ({
  handleSelectedImage,
}: ImagePickerProps) => {

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
    },
    onDrop: (acceptedFile) => {
      try {
        if (acceptedFile.length === 0) {
          console.error("File not accepted! Try again.");
          return;
        }
        if (acceptedFile.length > 1) {
          console.error("Too many files! Try again with 1 file.");
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          handleSelectedImage(acceptedFile[0]);
        };
        reader.readAsDataURL(acceptedFile[0]);
        // 获取文件对象  
        const file = acceptedFile[0];

        // 创建 FormData 对象  
        const formData = new FormData();

        // 将文件添加到 FormData 对象中的 'file' 键  
        formData.append('file', file);

        // 发送请求到后端  
        fetch('http://localhost:8000/coseg/init/pic', {
          method: 'POST',
          body: formData
        })
          .then(response => {
            // 处理响应  
            console.log('文件上传成功！');
          })
          .catch(error => {
            // 处理错误  
            console.error('文件上传失败：', error);
          });
      } catch (error) {
        console.log(error);
      }
    },
    maxSize: 50_000_000,
  });

  return (
    <div
      style={{
        marginLeft: '20px',
        width: '50px',
        height: '20px',
        backgroundColor: 'white'
      }}
    >
      <span {...getRootProps()}>
        <input {...getInputProps()} />
        <button>
          Upload
        </button>
      </span>      
    </div>
  );
};

export default ImagePicker;
