import urllib.request
import cv2
import uvicorn
import numpy as np
from fastapi import FastAPI, Request, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
from colour import MSDS_CMFS, SDS_ILLUMINANTS, SpectralDistribution, SpectralShape
from colour import XYZ_to_sd, XYZ_to_sRGB, sRGB_to_XYZ, XYZ_to_Lab
from colour.colorimetry import sd_to_XYZ_integration
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

# 暂时没用
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


if torch.cuda.is_available():
    device = torch.device('cuda')
else:
    device = torch.device('cpu')

print(device)

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

cmfs = (MSDS_CMFS["CIE 1931 2 Degree Standard Observer"].copy().align(SpectralShape(380, 780, 10)))
illuminant = SDS_ILLUMINANTS["D65"].copy().align(cmfs.shape)


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
mat_reflectances = []
options = []

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

def color_mixing(c1, c2, m1, m2):
    input = np.concatenate((c1, np.array([m1]), c2, np.array([m2])))
    input = torch.tensor(input, dtype=torch.float32).to(device).unsqueeze(0)
    output_reflectance = model(input).squeeze().detach().cpu().numpy()
    return output_reflectance

def cal_distance(c1, c2):
    rgb1 = HEX_to_RGB(c1)
    xyz1 = sRGB_to_XYZ(rgb1)
    lab1 = XYZ_to_Lab(xyz1)
    rgb2 = HEX_to_RGB(c2)
    xyz2 = sRGB_to_XYZ(rgb2)
    lab2 = XYZ_to_Lab(xyz2)
    dist = float(np.linalg.norm(lab1 - lab2))
    return dist

def cal_color_gradients_optimize(palette, mixedOnes, option):
        quantity_sum = 0
        for k in range(len(mixedOnes)):
            quantity_sum += mixedOnes[k][1]

        if option == 'q':
            if quantity_sum <= 7: # step size = 6
                new_concentrations = target_concentrations
            else:
                new_concentrations = [quantity_sum + i for i in range(-6, 7, 1)]
        else:
            if quantity_sum <= 7:
                new_concentrations = target_concentrations
            elif quantity_sum <= 13:
                new_concentrations = [quantity_sum + i for i in range(-6, 7, 1)]
            else:
                new_concentrations = [quantity_sum + i for i in range(-12, 14, 2)]

        new_pigments = []
        new_pigments_info = []
        for c in new_concentrations:
            m = c / quantity_sum

            new_pigments.append([])
            new_pigments_info.append([])
            for k in range(len(mixedOnes)):
                pigments = mixedOnes[k]

                # linear transform
                t_q = pigments[1] * m
                t_r = palette[pigments[0]]

                if abs(m - 1) < 1e-3: # m的计算存在数值误差
                    new_pigments[-1].append(t_r)
                    new_pigments_info[-1].append(pigments) 
                else:
                    new_pigments[-1].append(color_mixing(t_r, t_r, t_q * 0.5, t_q * 0.5))
                    new_pigments_info[-1].append((pigments[0], t_q))

        return new_pigments, new_pigments_info

def link_mixed(pigments):
    t_r = []
    for k in range(len(pigments)):
        if k == 0:
            t_r = pigments[k]
        else:
            t_r = color_mixing(t_r, pigments[k], 1, 1)
    return t_r

def get_min_Dis(matrix):
    min_v = 100000
    for i in range(1, mat_size + 1):
        for j in range(1, mat_size + 1):
            if matrix[i][j] < min_v:
                min_v = matrix[i][j]
    return min_v

def cal_next_distance(col_pigments_info, row_pigments_info, target_color):
    colors_with_dist_n = [[[0, 0] for _ in range(mat_size + 1)] for _ in range(mat_size + 1)]

    # 最后录视频的时候再打开
    # for i in range(1, mat_size + 1):
    #     for j in range(1, mat_size + 1):
    #         # quantity
    #         col_pigments, _ = cal_color_gradients_optimize(base_colors, col_pigments_info[i - 1], 'q')
    #         row_pigments, _ = cal_color_gradients_optimize(base_colors, row_pigments_info[j - 1], 'q')
    #         _, _, colors_with_dist_q = construct_matrix_optimize(col_pigments, row_pigments, target_color)
    #
    #         # mixture
    #         mixed_pigments = [p for p in col_pigments_info[i - 1]]
    #         t_row_pigments = row_pigments_info[j - 1]
    #         for p in t_row_pigments:
    #             mixed_pigments.append(p)
    #         col_pigments, _ = cal_color_gradients_optimize(base_colors, mixed_pigments, 'm')
    #         row_pigments = [[c] for c in base_colors]
    #         _, _, colors_with_dist_m = construct_matrix_optimize(col_pigments, row_pigments, target_color)
    #
    #         colors_with_dist_n[i][j] = [
    #             get_min_Dis(colors_with_dist_q),
    #             get_min_Dis(colors_with_dist_m),
    #         ]

    return colors_with_dist_n

def construct_matrix_optimize(col_pigments, row_pigments, target_color):
    colors = [['' for _ in range(mat_size + 1)] for _ in range(mat_size + 1)]
    reflectances = [[[] for _ in range(mat_size + 1)] for _ in range(mat_size + 1)]
    colors_with_dist_c = [[0 for _ in range(mat_size + 1)] for _ in range(mat_size + 1)]

    for i in range(mat_size + 1):
        for j in range(mat_size + 1):
            if i == 0 and j == 0:
                continue
            elif i == 0 and j != 0:
                # add row
                t_row_pigments = row_pigments[j - 1]
                reflectances[i][j] = link_mixed(t_row_pigments)
            elif i != 0 and j == 0:
                # add col
                t_col_pigments = col_pigments[i - 1]
                reflectances[i][j] = link_mixed(t_col_pigments)
            else:
                # add col + row
                mixed_pigments = [p for p in col_pigments[i - 1]]
                t_row_pigments = row_pigments[j - 1]
                for k in range(len(t_row_pigments)):
                    mixed_pigments.append(t_row_pigments[k])
                reflectances[i][j] = link_mixed(mixed_pigments)

            colors[i][j] = sd_to_hex(reflectances[i][j])
            dist = cal_distance(target_color, colors[i][j])
            colors_with_dist_c[i][j] = dist

    return colors, reflectances, colors_with_dist_c


@app.post("/gen_matrix")
async def gen_matrix(request: Request):
    data = await request.json()
    option = data['option']
    target_color = data['target_color']
    selected_coord = data['selected_coord']
    matrix_num = data['matrix_num']

    global mat_reflectances
    global options

    if matrix_num >= 0:
        mat_reflectances = mat_reflectances[:matrix_num+1]
        options = options[:matrix_num+1]

    col, row = selected_coord
    print("click on the grid in the matrix: ",  matrix_num, [col, row])

    if option == 'i': # initial
        mat_reflectances = []
        row_pigments = [[c] for c in base_colors]
        col_pigments = [[c] for c in base_colors]
        row_pigments_info = [[(i, 1)] for i in range(len(base_colors))]
        col_pigments_info = [[(i, 1)] for i in range(len(base_colors))]

    elif option == 'q': # quantity
        col_pigments, col_pigments_info = cal_color_gradients_optimize(base_colors, mat_reflectances[-1]['col'][col], option)
        row_pigments, row_pigments_info = cal_color_gradients_optimize(base_colors, mat_reflectances[-1]['row'][row], option)

    else: # mixture
        mixed_pigments = [p for p in mat_reflectances[-1]['col'][col]]
        t_row_pigments = mat_reflectances[-1]['row'][row]
        for p in t_row_pigments:
            mixed_pigments.append(p)

        col_pigments, col_pigments_info = cal_color_gradients_optimize(base_colors, mixed_pigments, 'm')

        row_pigments = [[c] for c in base_colors]
        row_pigments_info = [[(i, 1)] for i in range(len(base_colors))]

    colors, _, colors_with_dist = construct_matrix_optimize(col_pigments, row_pigments, target_color)
    colors_with_dist_n  = cal_next_distance(col_pigments_info, row_pigments_info, target_color)

    # store option
    options.append(option)

    # store lab
    lab_space = []
    for i in range(1, mat_size + 1):
        lab_space.append([])
        for j in range(1, mat_size + 1):
            if i != 0 and j != 0:
                hex = colors[i][j]
                rgb = HEX_to_RGB(hex)
                xyz = sRGB_to_XYZ(rgb)
                lab = XYZ_to_Lab(xyz)
                lab_space[-1].append({'position': lab.tolist(), 'color': hex, 'type': 'space'})

    # translate target_color
    rgb = HEX_to_RGB(target_color)
    xyz = sRGB_to_XYZ(rgb)
    target_lab = XYZ_to_Lab(xyz)
    lab_colors = {
        'lab_space': lab_space,
        'target_color': {
            'position': target_lab.tolist(),
            'color': target_color,
            'type': 'target',
        }
    }

    # store palette
    mat_reflectances.append({'row': row_pigments_info, 'col': col_pigments_info})

    # translate colors to return template
    color_matrix = {'row': [], 'col': [], 'mixed': []}
    for i in range(1, mat_size + 1):
        row_quantity = 0
        for k in range(len(row_pigments_info[i - 1])):
            row_quantity += row_pigments_info[i - 1][k][1]

        col_quantity = 0
        for k in range(len(col_pigments_info[i - 1])):
            col_quantity += col_pigments_info[i - 1][k][1]

        color_matrix['row'].append([colors[0][i], row_quantity])
        color_matrix['col'].append([colors[i][0], col_quantity])

    for i in range(1, mat_size + 1):
        color_matrix['mixed'].append([])
        for j in range(1, mat_size + 1):
            color_matrix['mixed'][-1].append([colors[i][j], color_matrix['row'][j - 1][1] + color_matrix['col'][i - 1][1]])

    # 这里可能还要返回每个grid的颜料组成
    return {
        'id': len(mat_reflectances),
        'colors': color_matrix,
        'colors_with_dist': {
            "focus": colors_with_dist,
            "next": colors_with_dist_n
        },
        'lab_colors': lab_colors,
        'palette': {'row': row_pigments_info, 'col': col_pigments_info}
    }

def adjust_pigments(pigment_list, index, quantity):
    t_r = []
    for k in range(len(pigment_list)):
        pigment_index = pigment_list[k][0]
        pigment_reflectance = base_colors[pigment_index]

        if k == index:
            pigment_quantity = quantity
        else:
            pigment_quantity = pigment_list[k][1]

        t_r.append(color_mixing(pigment_reflectance, pigment_reflectance, pigment_quantity * 0.5, pigment_quantity * 0.5))

    return sd_to_hex(link_mixed(t_r))

# 根据指定的原始颜色生成预览渐变条
@app.post("/gen_slider_bg")
async def gen_slider_bg(request: Request): 
    data = await request.json()
    pigment_list = data['pigmentList']
    index = data['index']

    print("GOT: pigmentList:", pigment_list, " index:", index)
    new_bg = []
    for q in range(0, 14):
        new_bg.append(adjust_pigments(pigment_list, index, q))

    return {
        'new_bg': new_bg
    }

@app.post("/gen_slider_result")
async def gen_slider_result(request: Request):
    data = await request.json()
    pigment_list = data['pigmentList']
    index = data['index']
    new_quantity = data['newQuantity']
    target_color = data['targetColor']
    print("GOT: pigmentList:", pigment_list, " index:", index, ' newQuantity:', new_quantity, ' targetColor:', target_color)

    t_r = []
    new_pigment_list = []
    for k in range(len(pigment_list)):
        pigment_index = pigment_list[k][0]
        pigment_reflectance = base_colors[pigment_index]

        if k == index:
            pigment_quantity = float(new_quantity)
            new_pigment_list.append([pigment_list[k][0], float(new_quantity)])
        else:
            pigment_quantity = float(pigment_list[k][1])
            new_pigment_list.append(pigment_list[k])

        # print("test-tr", k, pigment_reflectance, pigment_quantity)
        t_r.append(color_mixing(pigment_reflectance, pigment_reflectance, pigment_quantity * 0.5, pigment_quantity * 0.5))

    mixed = link_mixed(t_r)

    return {
        "color": sd_to_hex(mixed),
        "dist": cal_distance(target_color, sd_to_hex(mixed)),
        "newList": new_pigment_list
    }

if __name__ == '__main__':

    uvicorn.run(app="server:app", reload=True, host="127.0.0.1", port=8000)
