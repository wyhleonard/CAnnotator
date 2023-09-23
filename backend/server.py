import json
from io import BytesIO
import urllib.request
import cv2
import uvicorn
import numpy as np
from PIL import Image
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
from fastapi import FastAPI, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import torch
import torch.nn as nn
import torch.optim as optim
import matplotlib.pyplot as plt
import copy
import json
import math
from colour import MSDS_CMFS, SDS_ILLUMINANTS, SpectralDistribution, SpectralShape
from colour import sd_to_XYZ, XYZ_to_sd, XYZ_to_sRGB, sRGB_to_XYZ, XYZ_to_Lab
from colour.colorimetry import sd_to_XYZ_integration
from colour.utilities import numpy_print_options
from colour.notation import HEX_to_RGB, RGB_to_HEX



# 创建ORB特征检测器
orb = cv2.SIFT_create()
# 创建FLANN匹配器
bf = cv2.FlannBasedMatcher()
points = []
kp1, des1 = None, None
img1 = None

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


@app.post("/coseg/init/pic") # 上传图片
async def init_pic(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    global img1
    img1 = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    global kp1, des1
    kp1, des1 = orb.detectAndCompute(img1, None)


@app.post("/coseg/init/points")  
async def init_points(points_l: list[list[float]]):
    global points
    points = points_l
    global img1
    cv2.circle(img1, (int(points[0][0]), int(points[0][1])), 5, (255, 0, 0), -1)
    cv2.imshow('Image 1', img1)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
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


def url_to_cv2(url):
    resp = urllib.request.urlopen(url)
    img = np.asarray(bytearray(resp.read()), dtype="uint8")
    cv2_img = cv2.imdecode(img, cv2.IMREAD_COLOR)
    return cv2_img


def get_dots(kp1, des1, images):
    img_len = len(images)
    global orb, bf

    data = np.empty((0, 9))
    for i in range(img_len):
        img2 = images[i]
        kp2, des2 = orb.detectAndCompute(img2, None)

        # 使用knnMatch进行特征匹配
        matches = bf.knnMatch(des1, des2, k=2)
        matches = sorted(matches, key=lambda x: x[0].distance)[0:100]  # 这个取值是变化的 -> 做个过滤，不是最匹配的
        print("len of matches:", len(matches))

        # 定下基调，比如就匹配离click最近的特征点
        points1 = []
        points2 = []
        matches_new = []
        for m, n in matches:
            if m.distance < 0.85 * n.distance:
                pt = kp1[m.queryIdx].pt
                points1.append(pt)
                points2.append(kp2[m.trainIdx].pt)
                matches_new.append(m)
                matches_new.append(n)

        print("len of points1: ", len(points1), len(points2))  # 8, 8

        points1 = np.float32(points1).reshape(-1, 1, 2)
        points2 = np.float32(points2).reshape(-1, 1, 2)

        # 查看结果
        # img1_img2_matched = cv2.drawMatches(img1, kp1, img2, kp2, matches_new, None, flags=2)
        # cv2.imshow('img1_img2_matched', img1_img2_matched)

        if len(points1) >= 4:
            # 计算变换矩阵
            M, mask = cv2.findHomography(points1, points2, cv2.RANSAC)  # 这里有RANSAC优化
            # print(M, mask)
            data = np.vstack((data, M.reshape(1, -1)))

            # cv2.waitKey(0)
        # cv2.destroyAllWindows()
    # print(data)
    # 创建t-SNE模型并进行降维
    tsne = TSNE(n_components=2, perplexity=5, early_exaggeration=24, learning_rate='auto', random_state=666)
    return tsne.fit_transform(data)


@app.post("/scatter/positions/url")
async def get_positions_by_urls(targetUrls: list[str]):
    images = []
    for url in targetUrls:
        cv2_image = url_to_cv2(url)
        images.append(cv2_image)

    global kp1, des1

    return json.dumps(get_dots(kp1, des1, images).tolist())


@app.post("/scatter/positions/blob")
async def get_positions_by_blobs(sourceFile: UploadFile, targetFiles: list[UploadFile]):
    contents = await sourceFile.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    kp1, des1 = orb.detectAndCompute(img, None)
    cv2.imshow("Image", img)

    images = []
    for i, image in enumerate(targetFiles):
        contents = await image.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        cv2.imshow("Image" + str(i), img)
        images.append(img)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    return json.dumps(get_dots(kp1, des1, images).tolist())


if torch.cuda.is_available():
    device = torch.device('cuda')
else:
    device = torch.device('cpu')

# print(device)

class Model(nn.Module):
    def __init__(self, input_size, hidden_size1, hidden_size2, hidden_size3, output_size):
        super(Model, self).__init__()

        self.layer1 = nn.Linear(input_size, hidden_size1)
        self.layer2 = nn.Linear(hidden_size1, hidden_size2)
        self.layer3 = nn.Linear(hidden_size2, hidden_size3)
        self.output_layer = nn.Linear(hidden_size3, output_size)

        self.activation = nn.Sigmoid()

    def forward(self, x):
        x = self.activation(self.layer1(x))
        x = self.activation(self.layer2(x))
        x = self.activation(self.layer3(x))
        x = self.output_layer(x)
        return x


input_size = 84
hidden_size1 = 100
hidden_size2 = 80
hidden_size3 = 60
output_size = 41
model = Model(input_size, hidden_size1, hidden_size2, hidden_size3, output_size).to(device)
with open('model/model', 'rb') as f:
    model.load_state_dict(torch.load(f, map_location=device))
# print(model)

cmfs = (MSDS_CMFS["CIE 1931 2 Degree Standard Observer"].copy().align(SpectralShape(380, 780, 10)))
illuminant = SDS_ILLUMINANTS["D65"].copy().align(cmfs.shape)


def hex_to_sd(hex):
    rgb = HEX_to_RGB(hex)
    xyz = sRGB_to_XYZ(rgb)
    sd = XYZ_to_sd(xyz, method="Jakob 2019", cmfs=cmfs, illuminant=illuminant)
    return sd


def sd_to_hex(sd_arr):
    sd_domain = np.arange(380, 790, 10)
    sd = SpectralDistribution(sd_arr, sd_domain)
    xyz = sd_to_XYZ_integration(sd, cmfs, illuminant) / 100
    rgb = XYZ_to_sRGB(xyz)
    rgb[rgb < 0] = 0
    rgb[rgb > 1] = 1
    hex = RGB_to_HEX(rgb)
    return hex


base_colors_hex = ['#de3e35', '#962c35', '#b04d36', '#f1e159', '#ffa53c', '#ef9043', '#5d7d37', '#227dc1', '#2154ac',
               '#1a3b9f', '#201f29', '#2f3438', '#ebe6da']
base_colors = [
    np.array([0.1212013, 0.101097, 0.07303002, 0.05363664, 0.04690421, 0.04570704, 0.04452195, 0.04243668, 0.04289869, 0.04456398, 0.04568473, 0.046205, 0.04528819, 0.04537141, 0.04474038, 0.04383377, 0.0452695, 0.04765972, 0.05484549, 0.07999652, 0.1399595, 0.2611156, 0.4431363, 0.6190923, 0.7271121, 0.7818922, 0.8101522, 0.8274329, 0.8391663, 0.8471349, 0.8520025, 0.8520654, 0.8550329, 0.852966, 0.8517792, 0.8502535, 0.8409094, 0.8292962, 0.8204237, 0.794946, 0.7644186]),
    np.array([0.07959975, 0.07772375, 0.05812837, 0.04815512, 0.04476049, 0.04371236, 0.04115716, 0.03869853, 0.03853175, 0.03860794, 0.03990925, 0.03846247, 0.03787113, 0.03810629, 0.03800828, 0.03751255, 0.03797397, 0.03837147, 0.03921875, 0.04134138, 0.04503936, 0.05885165, 0.1218919, 0.2381622, 0.357492, 0.4498067, 0.5122329, 0.5511907, 0.5814605, 0.6058185, 0.6305487, 0.6511434, 0.6707595, 0.6870765, 0.7019841, 0.7071651, 0.7150883, 0.7032279, 0.6967656, 0.6665022, 0.6454147]),
    np.array([0.1074516, 0.08608582, 0.06228815, 0.04564361, 0.04265738, 0.04298977, 0.04380501, 0.0441884, 0.04497302, 0.04810791, 0.0501394, 0.05040649, 0.05382481, 0.05572637, 0.05803613, 0.06218062, 0.06978066, 0.08364731, 0.1083315, 0.1464195, 0.1972917, 0.2554535, 0.3123076, 0.3640971, 0.4074316, 0.4435163, 0.4735995, 0.5051573, 0.533031, 0.5602972, 0.5828179, 0.6031569, 0.6216051, 0.6342002, 0.6474723, 0.6534061, 0.6568186, 0.6467587, 0.6268183, 0.5897141, 0.580378]),
    np.array([0.3735658, 0.3042094, 0.1561128, 0.07385328, 0.05283446, 0.05373071, 0.05608301, 0.05294379, 0.05787078, 0.07784747, 0.1581701, 0.370135, 0.625187, 0.770209, 0.8252123, 0.8434244, 0.8561073, 0.8667604, 0.8769108, 0.8861801, 0.8917265, 0.9000838, 0.9063228, 0.9072662, 0.9117631, 0.9170796, 0.9208318, 0.9264762, 0.9303623, 0.9341962, 0.9390111, 0.9407888, 0.939278, 0.9423878, 0.9465148, 0.9432355, 0.9475708, 0.9418733, 0.9297164, 0.9495911, 0.9272842]),
    np.array([0.2420985, 0.195834, 0.1115432, 0.06045515, 0.04758273, 0.04750181, 0.04917951, 0.04776277, 0.05007914, 0.05523808, 0.06387731, 0.07410981, 0.08390191, 0.09995757, 0.1418701, 0.2650925, 0.4601978, 0.6205234, 0.7142943, 0.762457, 0.7857445, 0.7975667, 0.8052145, 0.8128214, 0.8188829, 0.8223253, 0.8304632, 0.8356018, 0.8411628, 0.8457841, 0.8509174, 0.855981, 0.8557658, 0.8502682, 0.852848, 0.8565301, 0.8423102, 0.8450059, 0.8507094, 0.8310825, 0.8075507]),
    np.array([0.2053648, 0.1621913, 0.09509934, 0.05753496, 0.04926174, 0.05228336, 0.06156423, 0.06790303, 0.07250442, 0.08083367, 0.09153642, 0.1058468, 0.1247892, 0.1515791, 0.1871607, 0.2366453, 0.2999381, 0.3745779, 0.456427, 0.5328875, 0.5957443, 0.6399693, 0.6674242, 0.6843178, 0.6928518, 0.7021191, 0.7114196, 0.724153, 0.7342294, 0.7456401, 0.7602615, 0.7660342, 0.7776833, 0.7877476, 0.7966945, 0.8018726, 0.804799, 0.8081422, 0.7902732, 0.7821774, 0.7551366]),
    np.array([0.08000208, 0.07047582, 0.05403485, 0.04365077, 0.04138792, 0.04186655, 0.04307993, 0.04307751, 0.04473201, 0.0479075, 0.05006841, 0.05446593, 0.06614281, 0.09164948, 0.1357096, 0.1930647, 0.2399381, 0.2656868, 0.2733421, 0.2603228, 0.2287545, 0.1822145, 0.1293385, 0.089607, 0.06839885, 0.05867838, 0.05202294, 0.04808942, 0.04662312, 0.0471296, 0.0501631, 0.0556415, 0.06449196, 0.07190813, 0.07555456, 0.07919788, 0.08698693, 0.09382538, 0.1113619, 0.1191417, 0.1274698]),
    np.array([0.3175681, 0.3006172, 0.2811241, 0.311033, 0.3580781, 0.4073508, 0.4754631, 0.5495522, 0.5870354, 0.5970281, 0.5811932, 0.5408191, 0.4844733, 0.4089954, 0.3224799, 0.2373428, 0.1645076, 0.108903, 0.07392032, 0.05772841, 0.0514454, 0.04914104, 0.04722032, 0.04698382, 0.04751991, 0.05069667, 0.05677286, 0.06417369, 0.07037683, 0.07222205, 0.06848706, 0.06640358, 0.06974763, 0.08068617, 0.09353601, 0.1138948, 0.1399099, 0.1729535, 0.2199574, 0.2747239, 0.2888326]),
    np.array([0.2810738, 0.3081129, 0.3558116, 0.3874382, 0.4227129, 0.455108, 0.4836637, 0.5008587, 0.4860124, 0.431152, 0.3517262, 0.2713537, 0.2045123, 0.1564893, 0.1194135, 0.09519608, 0.07881679, 0.06744139, 0.05921694, 0.05439694, 0.05116037, 0.04993881, 0.04875309, 0.0492988, 0.05037356, 0.05217966, 0.05474498, 0.05943839, 0.06520638, 0.07486202, 0.08871681, 0.1059112, 0.1298386, 0.1592651, 0.1969867, 0.2315899, 0.2663172, 0.3003754, 0.3113816, 0.2969075, 0.3022904]),
    np.array([0.2089203, 0.2308936, 0.2512537, 0.2840311, 0.3280226, 0.369737, 0.4049959, 0.422034, 0.4059643, 0.3440398, 0.2552299, 0.1705181, 0.1093918, 0.07190437, 0.05237841, 0.04262203, 0.03843553, 0.03517765, 0.0335992, 0.03242246, 0.03169036, 0.03144743, 0.03185321, 0.03150696, 0.03137365, 0.03141589, 0.03147701, 0.03227722, 0.03279717, 0.03627273, 0.04130382, 0.05142696, 0.070124, 0.1037945, 0.1467954, 0.1933289, 0.2383167, 0.2690242, 0.2850737, 0.2802559, 0.2635116]),
    np.array([0.005526202, 0.004503791, 0.01401753, 0.01836947, 0.01887715, 0.01937076, 0.01944174, 0.01854181, 0.01840581, 0.01695164, 0.01449739, 0.01325994, 0.01237025, 0.01245215, 0.01176123, 0.01123702, 0.01112069, 0.01070249, 0.01053747, 0.01087017, 0.01058782, 0.01118752, 0.01119433, 0.01131903, 0.01208304, 0.0129516, 0.01353096, 0.0140249, 0.01527286, 0.01506456, 0.01536999, 0.01552071, 0.01600883, 0.01680585, 0.01584621, 0.01502183, 0.01129939, 0.00948223, 0.006544536, 0.009850628, 0.002863733]),
    np.array([0.03662665, 0.02633768, 0.03372069, 0.03546721, 0.03652583, 0.0369041, 0.03647303, 0.03680873, 0.03690055, 0.03581682, 0.03457672, 0.03578756, 0.03508563, 0.03607927, 0.03648785, 0.03659925, 0.03669648, 0.03645675, 0.03605817, 0.03544478, 0.03510229, 0.03585429, 0.03526165, 0.03492508, 0.03478204, 0.03462756, 0.03485623, 0.03458675, 0.03418868, 0.03384828, 0.03330561, 0.03247943, 0.03290286, 0.03007331, 0.03111289, 0.03060318, 0.02770466, 0.02361524, 0.02081525, 0.01920014, 0.02850045]),
    np.array([0.7421191, 0.7265427, 0.6827202, 0.6775552, 0.6903735, 0.7050218, 0.7202189, 0.7292857, 0.7370812, 0.7511595, 0.7625896, 0.7723852, 0.7872839, 0.7946085, 0.8016738, 0.809689, 0.8146511, 0.8204726, 0.8277438, 0.8330117, 0.836329, 0.8406373, 0.8458819, 0.8487816, 0.8505826, 0.853242, 0.8539958, 0.8516933, 0.8434823, 0.8204179, 0.8244466, 0.812269, 0.8008337, 0.7940854, 0.7849983, 0.7810144, 0.8099386, 0.8380907, 0.855184, 0.8869698, 0.8827376])
]

mat_size = len(base_colors)
target_concentrations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
mat_colors = []
options = []
mat_lab_colors = []
paper_sd = hex_to_sd('#FFFAF0')


def color_mixing(c1, c2, q1, q2):
    input = np.concatenate((c1, np.array([q1]), c2, np.array([q2])))
    input = torch.tensor(input, dtype=torch.float32).to(device).unsqueeze(0)
    output = model(input).squeeze().detach().cpu().numpy()
    output = sd_to_hex(output)
    return output


def cal_color_gradients(selected_color, quantity):
    gradients = []
    selected_color = hex_to_sd(selected_color)
    if quantity <= 7:
        new_concentrations = target_concentrations
    else:
        new_concentrations = [quantity + i for i in range(-6, 7, 1)]
    for c in new_concentrations:
        m = c / quantity 
        # output = color_mixing(selected_color, selected_color, m, 0)
        input = np.concatenate((selected_color.values, np.array([m]), selected_color.values, np.array([0])))
        input = torch.tensor(input, dtype=torch.float32).to(device).unsqueeze(0)
        output = model(input).squeeze().detach().cpu().numpy()
        gradients.append(output)
    return gradients, new_concentrations


def cal_distance(c1, c2):
    rgb1 = HEX_to_RGB(c1)
    xyz1 = sRGB_to_XYZ(rgb1)
    lab1 = XYZ_to_Lab(xyz1)
    rgb2 = HEX_to_RGB(c2)
    xyz2 = sRGB_to_XYZ(rgb2)
    lab2 = XYZ_to_Lab(xyz2)
    dist = float(np.linalg.norm(lab1 - lab2))
    return dist


def construct_matrix(row, col, q1, q2, target_color):
    colors = [['' for j in range(mat_size + 1)] for i in range(mat_size + 1)]
    colors_with_dist = [['' for j in range(mat_size + 1)] for i in range(mat_size + 1)]
    min_dist = 1e7
    max_dist = -1e7
    # for j in range(mat_size, -1, -1):
    #     for i in range(mat_size, -1, -1):
    #         if i == 0 and j == 0:
    #             colors[i][j] = '#000000'
    #         elif i == 0 and j != 0:
    #             colors[i][j] = row[j - 1]
    #         elif i != 0 and j == 0:
    #             colors[i][j] = col[i - 1]
    #         else:
    #             if i < j:
    #                 colors[i][j] = color_mixing(row[j - 1], col[i - 1], q1[j - 1], q2[i - 1])
    #             elif i == j:
    #                 colors[i][j] = '#FFFFFF'
    #             else:
    #                 dist = cal_distance(target_color, colors[j][i])
    #                 colors[i][j] = dist
    #                 if dist > max_dist:
    #                     max_dist = dist
    #                 if dist < min_dist:
    #                     min_dist = dist
    # colors_with_dist = copy.deepcopy(colors)
    # colors_with_dist = [item for sublist in colors_with_dist for item in sublist]
    # for i in range(mat_size + 1):
    #     for j in range(mat_size + 1):
    #         if i != 0 and j != 0 and i > j:
    #             rgb = np.array([(colors[i][j] - min_dist) / (max_dist - min_dist) for k in range(3)])
    #             colors[i][j] = RGB_to_HEX(rgb)
    # colors = [item for sublist in colors for item in sublist]
    for i in range(0, mat_size + 1):
        for j in range(0, mat_size + 1):
            if i == 0 and j == 0:
                colors[i][j] = '#FFFFFF'
            elif i == 0 and j != 0:
                colors[i][j] = sd_to_hex(row[j - 1])
            elif i != 0 and j == 0:
                colors[i][j] = sd_to_hex(col[i - 1])
            else:
                colors[i][j] = color_mixing(col[i - 1], row[j - 1], q2[i - 1], q1[j - 1])
                dist = cal_distance(target_color, colors[i][j])
                colors_with_dist[i][j] = dist

    colors = [item for sublist in colors for item in sublist]
    colors_with_dist = [item for sublist in colors_with_dist for item in sublist]
    
    return colors, colors_with_dist


@app.post("/gen_matrix")
async def gen_matrix(request: Request):
    data = await request.json()
    option = data['option']
    target_color = data['target_color']
    selected_coord = data['selected_coord']
    matrix_num = data['matrix_num']
    # print(option, target_color, selected_coord, matrix_num)
    global mat_colors
    global options
    global mat_lab_colors

    if matrix_num >= 0:
        mat_colors = mat_colors[:matrix_num+1]
        options = options[:matrix_num+1]
        mat_lab_colors = mat_lab_colors[:matrix_num+1]

    row, col = selected_coord

    if option == 'i':
        mat_colors = []
        row_colors = base_colors
        col_colors = base_colors
        q1 = [1 for i in range(len(row_colors))]
        q2 = [1 for i in range(len(row_colors))]

    elif option == 'q':
        quantity1 = round(mat_colors[-1]['col'][col][1] * 100)
        quantity2 = round(mat_colors[-1]['row'][row][1] * 100)
        row_colors, q1 = cal_color_gradients(mat_colors[-1]['col'][col][0], quantity1)
        col_colors, q2 = cal_color_gradients(mat_colors[-1]['row'][row][0], quantity2)

    elif option == 'm':
        quantity = round(mat_colors[-1]['mixed'][row][col][1] * 100)
        row_colors = base_colors
        col_colors, q2 = cal_color_gradients(mat_colors[-1]['mixed'][row][col][0], quantity)
        q1 = [1 for i in range(len(row_colors))]

    colors, colors_with_dist = construct_matrix(row_colors, col_colors, q1, q2, target_color)
    
    options.append(option)
    lab_colors = []
    for i in range(mat_size + 1):
        for j in range(mat_size + 1):
            if i != 0 and j != 0:
                hex = colors[i*(mat_size+1)+j]
                hex_num = int(hex.lstrip('#'), 16)
                rgb = HEX_to_RGB(hex)
                xyz = sRGB_to_XYZ(rgb)
                lab = XYZ_to_Lab(xyz)
                lab_colors.append({'position': lab.tolist(), 'color': hex, 'type': 'space'})
    # print(len(colors), len(colors_with_dist), len(lab_colors))
    rgb = HEX_to_RGB(target_color)
    xyz = sRGB_to_XYZ(rgb)
    target_lab = XYZ_to_Lab(xyz)
    lab_colors.append({'position': target_lab.tolist(), 'color': target_color, 'type': 'target'})

    # print(colors)
    # print(lab_colors)
    # with open(f'rgb{len(mat_colors)}.json', 'w') as file:
    #     matrix = {'row': [], 'col': [], 'mixed': []}
    #     for i in range(1, 14):
    #         matrix['row'].append([colors[i], 0.01])
    #         matrix['col'].append([colors[i*14], target_concentrations[i-1]])
    #         mixed_row = []
    #         for j in range(1, 14):
    #             mixed_row.append([colors[i*14+j], target_concentrations[i-1] + 0.01])
    #         matrix['mixed'].append(mixed_row)
    #     json.dump(matrix, file)
    
    # with open(f'lab{len(mat_colors)}.json', 'w') as file:
    #     matrix = {'lab_space': [], 'target_color': lab_colors[-1]}
    #     for i in range(13):
    #         matrix_row = []
    #         for j in range(13):
    #             matrix_row.append(lab_colors[i*13+j])
    #         matrix['lab_space'].append(matrix_row)
    #     json.dump(matrix, file)
    matrix = {'row': [], 'col': [], 'mixed': []}
    for i in range(1, 14):
        matrix['row'].append([colors[i], q1[i-1] / 100])
        matrix['col'].append([colors[i*14], q2[i-1] / 100])
        mixed_row = []
        for j in range(1, 14):
            mixed_row.append([colors[i*14+j], (q1[j-1] + q2[i-1]) / 100])
        matrix['mixed'].append(mixed_row)
    colors = matrix
    matrix = {'lab_space': [], 'target_color': lab_colors[-1]}
    for i in range(13):
        matrix_row = []
        for j in range(13):
            matrix_row.append(lab_colors[i*13+j])
        matrix['lab_space'].append(matrix_row)
    lab_colors = matrix
    mat_colors.append(colors)
    # print('matrix num:', len(mat_colors))
    mat_lab_colors.append(lab_colors)

    return {'id': len(mat_colors), 'colors': colors, 'colors_with_dist': colors_with_dist, 'lab_colors': lab_colors}

# @app.post("/subtle_adjustment")
# async def subtle_adjustment(request: Request):
#     data = await request.json()
#     mixed_color = data['mixed_color']
#     color1 = data['color1']
#     color2 = data['color2']
#     qm = float(data['qm'])
#     q1 = float(data['q1'])
#     q2 = float(data['q2'])
#     pqm = float(data['pqm'])
#     pq1 = float(data['pq1'])
#     pq2 = float(data['pq2'])
#     new_mixed_color = mixed_color
#     new_color1 = color1
#     new_color2 = color2
#     if q1 == pq1 and q2 == pq2:
#         mixed_color = hex_to_sd(mixed_color).values
#         new_mixed_color = color_mixing(mixed_color, mixed_color, qm / pqm, 0)
#     elif qm == pqm and q2 == pq2:
#         color1 = hex_to_sd(color1).values
#         color2 = hex_to_sd(color2).values
#         new_mixed_color = color_mixing(color1, color2, q1 / pq1, q2)
#         new_color1 = color_mixing(color1, color1, q1 / pq1, 0)
#     elif qm == pqm and q1 == pq1:
#         color1 = hex_to_sd(color1).values
#         color2 = hex_to_sd(color2).values
#         new_mixed_color = color_mixing(color1, color2, q1, q2 / pq2)
#         new_color2 = color_mixing(color2, color2, q2 / pq2, 0)
#     return {'mixed_color': new_mixed_color, 'color1': new_color1, 'color2': new_color2}

def subtle_adjustment(data):
    mixed_color = data['mixed_color']
    color1 = data['color1']
    color2 = data['color2']
    qm = float(data['qm'])
    q1 = float(data['q1'])
    q2 = float(data['q2'])
    pqm = float(data['pqm'])
    pq1 = float(data['pq1'])
    pq2 = float(data['pq2'])
    new_mixed_color = mixed_color
    new_color1 = color1
    new_color2 = color2
    if q1 == pq1 and q2 == pq2:
        mixed_color = hex_to_sd(mixed_color).values
        new_mixed_color = color_mixing(mixed_color, mixed_color, qm / pqm, 0)
    elif qm == pqm and q2 == pq2:
        color1 = hex_to_sd(color1).values
        color2 = hex_to_sd(color2).values
        new_mixed_color = color_mixing(color1, color2, q1 / pq1, q2)
        new_color1 = color_mixing(color1, color1, q1 / pq1, 0)
    elif qm == pqm and q1 == pq1:
        color1 = hex_to_sd(color1).values
        color2 = hex_to_sd(color2).values
        new_mixed_color = color_mixing(color1, color2, q1, q2 / pq2)
        new_color2 = color_mixing(color2, color2, q2 / pq2, 0)
    return {'mixed_color': new_mixed_color, 'color1': new_color1, 'color2': new_color2}

def adjust_pigments(pigments, mixedPigments):
    new_mix = []
    for i in range(1, len(pigments)):
        if i == 1:
            color1, q1 = pigments[i-1]
            color2, q2 = pigments[i]
            mixed_color, qm = mixedPigments[i-1]
        else:
            color1, q1 = mixedPigments[i-2]
            color2, q2 = pigments[i]
            mixed_color, qm = mixedPigments[i-1]
        new_mixed_color, new_color1, new_color2 =subtle_adjustment({"mixed_color": mixed_color, "color1":color1, "color2":color2, "qm":qm, "q1":q1, "q2":q2, "pqm":qm, "pq1":0.01, "pq2":0.01}).values()
        new_mix.append([new_mixed_color, qm])
    print("pigments", pigments, "mixed", mixedPigments, "new", new_mix)
    
    return new_mix

# 根据指定的原始颜色生成预览渐变条
@app.post("/gen_slider_bg")
async def gen_slider_bg(request: Request): 
    data = await request.json()
    pigments = data['pigments']
    mixedPigments = data['mixedPigments']
    index = data['index']
    print("GOT: Pigments:",pigments, " mixed", mixedPigments, " index",index)
    new_bg = []
    for q in range(1, 16):
        pigments[index][1] = q / 100
        mixedPigments = adjust_pigments(pigments, mixedPigments)
        new_bg.append(mixedPigments[-1])
    print("SENT: index", index, "new", new_bg)
    return {"new_bg": new_bg}

if __name__ == '__main__':
    uvicorn.run(app="server:app", reload=True, host="127.0.0.1", port=8000)
    # print(cal_color_gradients('#de3e35', 0.01))
    # pigments = [['#Ca5a35', 0.01], ['#697bd2',0.01], ['#ffb200',0.01]]
    # mixedPigments = [['#8d734a', 0.01], ['#c98c20',0.02]]
    # new_mix = adjust_slider_bg(pigments, mixedPigments, 1)
    # print(new_mix)