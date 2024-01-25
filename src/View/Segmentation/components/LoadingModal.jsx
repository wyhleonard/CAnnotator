import { useContext } from "react";
import { Spin } from 'antd';
import AppContext from "../../hooks/createContext";

const LoadingModal = () => {
  const {
    showLoadingModal: [showLoadingModal, ]
  } = useContext(AppContext);

  return (
    <>
      {showLoadingModal && (
        <div className="modal modal-open">
          <div className="flex flex-col items-center justify-center h-72 modal-box" style={{
            position: "absolute",
            zIndex: "101"
          }}>
            <h1 className="py-4 text-sm md:text-lg">
              Processing...
            </h1>
            <Spin size="large" />
          </div>
        </div>
      )}
    </>
  );
};

export default LoadingModal;
