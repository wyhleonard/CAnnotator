from io import BytesIO

import cv2
import uvicorn
import numpy as np
from fastapi import FastAPI, Response, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

# 创建ORB特征检测器
orb = cv2.ORB_create()
# 创建FLANN匹配器
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
points = []
kp1, des1 = None, None

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.post("/coseg/init/pic")
async def init_pic(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    global kp1, des1
    kp1, des1 = orb.detectAndCompute(img, None)


@app.post("/coseg/init/points")
async def init_points(points_l: list[list[float]]):
    global points
    points = points_l
    print(points)

@app.post("/coseg/match/point")
async def match_point(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    global kp1, des1
    kp2, des2 = orb.detectAndCompute(img, None)
    # 使用knnMatch进行特征匹配
    matches = bf.match(des1, des2)
    matches = sorted(matches, key=lambda x: x.distance)
    # 提取匹配点的坐标
    points1 = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
    points2 = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)
    # 计算变换矩阵
    M, mask = cv2.findHomography(points1, points2, cv2.RANSAC, 50.0)
    global points
    res = []
    for x, y in points:
        # 对img1上的某个点进行变换
        point = np.array([[x, y]], dtype=np.float32).reshape(-1, 1, 2)
        transformed_point = cv2.perspectiveTransform(point, M)
        # 输出在img2上与之特征匹配的点的坐标
        matched_x, matched_y = transformed_point[0][0]
        print(matched_x, matched_y)
        res.append([matched_x.item(), matched_y.item()])
    return {"points": res}


if __name__ == '__main__':
    uvicorn.run(app="server:app", reload=True, host="127.0.0.1", port=8000)
