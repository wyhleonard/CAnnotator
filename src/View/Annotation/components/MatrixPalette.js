import "../../sharedCss.css";
import "./MatrixPalette.css";
import OpenCloseIcon from "../../../Icons/openclose.svg";
import { iconLevel1 } from "../../sharedConstants";
import { useEffect, useState } from "react";
import { MatrixVisualization } from "./MatrixVisualization";

const quantityResults = [
    {
        'row': [['#fcea28', 0.01], ['#faea2d', 0.02], ['#f8e935', 0.03], ['#f7e83c', 0.04], ['#f4e647', 0.05], ['#f0e252', 0.06], ['#e9dc5d', 0.07], ['#dfd263', 0.08], ['#d7c765', 0.09], ['#d2c065', 0.1], ['#ceba66', 0.12], ['#cbb866', 0.14], ['#c9b666', 0.16]], 
        'col': [['#98c2ca', 0.01], ['#97c2cb', 0.02], ['#97c2cb', 0.03], ['#96c2cc', 0.04], ['#94c2cd', 0.05], ['#90c2ce', 0.06], ['#8abecf', 0.07], ['#82bace', 0.08], ['#7ab6cd', 0.09], ['#72b2cc', 0.1], ['#60aac9', 0.12], ['#4fa2c5', 0.14], ['#429bc1', 0.16]], 
        'mixed': [
            [['#cdc56d', 0.02], ['#cec56c', 0.03], ['#cfc56c', 0.04], ['#cec56f', 0.05], ['#cdc77b', 0.06], ['#c9c791', 0.07], ['#c3c7ab', 0.08], ['#c0c7b3', 0.09], ['#bcc7b9', 0.1], ['#b9c8bd', 0.11], ['#b1c9c4', 0.13], ['#a7c9ca', 0.15], ['#9cc9d1', 0.17]], 
            [['#cbc46d', 0.03], ['#cdc46c', 0.04], ['#cdc46d', 0.05], ['#ccc46e', 0.06], ['#cbc67b', 0.07], ['#c7c792', 0.08], ['#c1c7ab', 0.09000000000000001], ['#bfc7b3', 0.1], ['#bcc7b9', 0.11], ['#b8c8bd', 0.12000000000000001], ['#b1c9c4', 0.13999999999999999], ['#a7c9ca', 0.16], ['#9dc9d0', 0.18]], 
            [['#cbc46c', 0.04], ['#ccc46b', 0.05], ['#ccc46b', 0.06], ['#ccc46d', 0.07], ['#cbc67a', 0.08], ['#c8c791', 0.09], ['#c2c7aa', 0.1], ['#bfc7b2', 0.11], ['#bcc7b8', 0.12], ['#b8c8bc', 0.13], ['#b1c8c3', 0.15], ['#a8c9c8', 0.17], ['#9ec9cf', 0.19]], 
            [['#ccc56b', 0.05], ['#cdc56b', 0.06], ['#cdc56b', 0.07], ['#ccc56c', 0.08], ['#cbc779', 0.09], ['#c8c890', 0.1], ['#c2c7a9', 0.11000000000000001], ['#bfc7b2', 0.12], ['#bbc7b7', 0.13], ['#b8c8bc', 0.14], ['#b0c8c2', 0.16], ['#a8c9c8', 0.18000000000000002], ['#9ec9cd', 0.2]], 
            [['#ccc66b', 0.060000000000000005], ['#cdc66a', 0.07], ['#cdc66b', 0.08], ['#ccc66c', 0.09], ['#cbc879', 0.1], ['#c7c890', 0.11], ['#c1c7a9', 0.12000000000000001], ['#bdc7b2', 0.13], ['#bac7b8', 0.14], ['#b6c8bc', 0.15000000000000002], ['#aec8c2', 0.16999999999999998], ['#a6c8c7', 0.19], ['#9dc8cc', 0.21000000000000002]], 
            [['#cac56a', 0.06999999999999999], ['#cbc56b', 0.08], ['#cbc66c', 0.09], ['#cac56d', 0.1], ['#c9c779', 0.11], ['#c5c790', 0.12], ['#bec7a9', 0.13], ['#bbc7b2', 0.14], ['#b7c7b7', 0.15], ['#b3c7bb', 0.16], ['#abc8c2', 0.18], ['#a3c8c6', 0.2], ['#9ac7ca', 0.22]], 
            [['#c7c36a', 0.08], ['#c8c46b', 0.09000000000000001], ['#c8c56d', 0.1], ['#c7c46f', 0.11000000000000001], ['#c6c77c', 0.12000000000000001], ['#c1c793', 0.13], ['#bac7ae', 0.14], ['#b6c7b7', 0.15000000000000002], ['#b2c7bc', 0.16], ['#aec8bf', 0.17], ['#a6c8c5', 0.19], ['#9ec8c8', 0.21000000000000002], ['#96c7cb', 0.23]], 
            [['#c3bf66', 0.09], ['#c3c068', 0.1], ['#c3c16a', 0.11], ['#c2c16c', 0.12], ['#c1c478', 0.13], ['#bdc691', 0.14], ['#b5c7af', 0.15000000000000002], ['#b1c6b8', 0.16], ['#acc7bc', 0.16999999999999998], ['#a8c7bf', 0.18], ['#9fc7c4', 0.2], ['#97c6c6', 0.22000000000000003], ['#8fc5c6', 0.24]], 
            [['#bebc64', 0.09999999999999999], ['#bfbc65', 0.11], ['#bfbd66', 0.12], ['#bebe68', 0.13], ['#bdc171', 0.14], ['#b9c58b', 0.15], ['#b2c6ac', 0.16], ['#adc5b7', 0.16999999999999998], ['#a7c5ba', 0.18], ['#a3c6bc', 0.19], ['#99c5bf', 0.21], ['#91c3bf', 0.23], ['#88c0bd', 0.25]], 
            [['#b7b964', 0.11], ['#b8ba65', 0.12000000000000001], ['#b9ba66', 0.13], ['#b8bb67', 0.14], ['#b7be6e', 0.15000000000000002], ['#b2c287', 0.16], ['#acc4aa', 0.17], ['#a6c4b4', 0.18], ['#a0c3b5', 0.19], ['#9bc2b5', 0.2], ['#92c1b5', 0.22], ['#88bcb2', 0.24000000000000002], ['#7db5ae', 0.26]], 
            [['#a2b464', 0.13], ['#a5b465', 0.13999999999999999], ['#a6b566', 0.15], ['#a5b567', 0.16], ['#a3b86d', 0.16999999999999998], ['#9ebb80', 0.18], ['#9ac0a6', 0.19], ['#93bfaf', 0.2], ['#8cbcad', 0.21], ['#87b9a9', 0.22], ['#79b1a6', 0.24], ['#64a29f', 0.26], ['#459097', 0.28]], 
            [['#8caf62', 0.15000000000000002], ['#90af63', 0.16], ['#92af64', 0.17], ['#90af65', 0.18000000000000002], ['#8fb16a', 0.19], ['#8bb478', 0.2], ['#88b99c', 0.21000000000000002], ['#81b9aa', 0.22000000000000003], ['#77b4aa', 0.23], ['#6caba5', 0.24000000000000002], ['#4d979e', 0.26], ['#248292', 0.28], ['#007388', 0.30000000000000004]], 
            [['#7aa95c', 0.17], ['#81a85d', 0.18], ['#84a85e', 0.19], ['#82a85f', 0.2], ['#7faa63', 0.21000000000000002], ['#79ac6d', 0.22], ['#75af89', 0.23], ['#6aae9f', 0.24], ['#57a1a1', 0.25], ['#43929b', 0.26], ['#1f7b90', 0.28], ['#006b84', 0.30000000000000004], ['#006177', 0.32]]
        ]
    },
]

const mixtureResults = [
    {
        'row': [['#de3e35', 0.01], ['#962c35', 0.01], ['#b04d36', 0.01], ['#f1e159', 0.01], ['#ffa53c', 0.01], ['#ef9043', 0.01], ['#5d7d37', 0.01], ['#227dc1', 0.01], ['#2154ac', 0.01], ['#1a3b9f', 0.01], ['#201f29', 0.01], ['#2f3438', 0.01], ['#ebe6da', 0.01]],
        'col': [['#c4cbcc', 0.01], ['#c3cbcc', 0.02], ['#c3cbcc', 0.03], ['#c2cacc', 0.04], ['#c2cacc', 0.05], ['#c1cacc', 0.06], ['#c1cacc', 0.07], ['#c0cacc', 0.08], ['#c0cacc', 0.09], ['#c0cacc', 0.1], ['#bfcacc', 0.12], ['#bfcacc', 0.14], ['#bfc9cb', 0.16]], 
        'mixed': [
            [['#c97c70', 0.02], ['#a9658f', 0.02], ['#c27c73', 0.02], ['#d9cfa5', 0.02], ['#c0bb8a', 0.02], ['#c1b599', 0.02], ['#bdcdbf', 0.02], ['#94bfce', 0.02], ['#5da0c8', 0.02], ['#3487c3', 0.02], ['#45487e', 0.02], ['#839d9f', 0.02], ['#d9d9d3', 0.02]], 
            [['#c67b70', 0.03], ['#a56292', 0.03], ['#c07c75', 0.03], ['#d7cfa7', 0.03], ['#b9ba88', 0.03], ['#bab196', 0.03], ['#bccdc1', 0.03], ['#99c3ce', 0.03], ['#71aac9', 0.03], ['#438fc4', 0.03], ['#4b4e86', 0.03], ['#91a9a8', 0.03], ['#d2d5d2', 0.03]], 
            [['#c57970', 0.04], ['#a36194', 0.04], ['#bf7b75', 0.04], ['#d6d0a7', 0.04], ['#b4b885', 0.04], ['#b4ae92', 0.04], ['#bccdc1', 0.04], ['#9ac3ce', 0.04], ['#78aeca', 0.04], ['#4992c5', 0.04], ['#4d5085', 0.04], ['#94ada9', 0.04], ['#d0d4d1', 0.04]], 
            [['#c2776f', 0.05], ['#9f6094', 0.05], ['#bd7a74', 0.05], ['#d5d0a9', 0.05], ['#aeb482', 0.05], ['#a9a78c', 0.05], ['#bbcdc2', 0.05], ['#9bc4ce', 0.05], ['#7aafca', 0.05], ['#4c94c5', 0.05], ['#4f5182', 0.05], ['#94aea8', 0.05], ['#cdd3d1', 0.05]], 
            [['#c0756b', 0.060000000000000005], ['#9c5d91', 0.060000000000000005], ['#bb7870', 0.060000000000000005], ['#d4d0a9', 0.060000000000000005], ['#abb178', 0.060000000000000005], ['#a4a083', 0.060000000000000005], ['#bbcdc1', 0.060000000000000005], ['#9dc4ce', 0.060000000000000005], ['#80b2cb', 0.060000000000000005], ['#5498c6', 0.060000000000000005], ['#51517d', 0.060000000000000005], ['#96b0a8', 0.060000000000000005], ['#cad2d1', 0.060000000000000005]], 
            [['#bb7065', 0.06999999999999999], ['#95598c', 0.06999999999999999], ['#b7736b', 0.06999999999999999], ['#d3d1a8', 0.06999999999999999], ['#a8ac6d', 0.06999999999999999], ['#9e9c79', 0.06999999999999999], ['#bccdbf', 0.06999999999999999], ['#a0c7ce', 0.06999999999999999], ['#8dbacc', 0.06999999999999999], ['#6ba4c8', 0.06999999999999999], ['#59567d', 0.06999999999999999], ['#9bb6aa', 0.06999999999999999], ['#c5d0d0', 0.06999999999999999]], 
            [['#b56a61', 0.08], ['#8a538a', 0.08], ['#b06d66', 0.08], ['#d6d3a5', 0.08], ['#9fa566', 0.08], ['#929372', 0.08], ['#bdccbc', 0.08], ['#a2c8cf', 0.08], ['#92becd', 0.08], ['#77aac8', 0.08], ['#565476', 0.08], ['#9bb4a5', 0.08], ['#c4cfcf', 0.08]], 
            [['#ab615c', 0.09], ['#7b4d8a', 0.09], ['#a36261', 0.09], ['#dbd6a0', 0.09], ['#919e5e', 0.09], ['#838d6c', 0.09], ['#bdccb9', 0.09], ['#a4cad0', 0.09], ['#99c3ce', 0.09], ['#87b4ca', 0.09], ['#585573', 0.09], ['#9cb4a2', 0.09], ['#c5cfcd', 0.09]], 
            [['#a25b59', 0.09999999999999999], ['#71488b', 0.09999999999999999], ['#995b5f', 0.09999999999999999], ['#e0d899', 0.09999999999999999], ['#839658', 0.09999999999999999], ['#748367', 0.09999999999999999], ['#beccb6', 0.09999999999999999], ['#a6cad0', 0.09999999999999999], ['#9bc4ce', 0.09999999999999999], ['#8ab6ca', 0.09999999999999999], ['#525168', 0.09999999999999999], ['#99b098', 0.09999999999999999], ['#c6d0cb', 0.09999999999999999]], 
            [['#9a5656', 0.11], ['#69458d', 0.11], ['#91555d', 0.11], ['#e2d994', 0.11], ['#768e52', 0.11], ['#677962', 0.11], ['#bfcbaf', 0.11], ['#a6cbd0', 0.11], ['#9cc5ce', 0.11], ['#8bb6ca', 0.11], ['#4c4d5b', 0.11], ['#95a788', 0.11], ['#c6d1ca', 0.11]], 
            [['#8a4f53', 0.13], ['#5f4290', 0.13], ['#834d5a', 0.13], ['#dfd792', 0.13], ['#61814b', 0.13], ['#566c5c', 0.13], ['#bcc89f', 0.13], ['#a9cacf', 0.13], ['#9ec5cc', 0.13], ['#90bac9', 0.13], ['#43464e', 0.13], ['#869667', 0.13], ['#becfc9', 0.13]], 
            [['#814d52', 0.15000000000000002], ['#594093', 0.15000000000000002], ['#7b4a58', 0.15000000000000002], ['#d9d391', 0.15000000000000002], ['#51734a', 0.15000000000000002], ['#4a5f5b', 0.15000000000000002], ['#b1c28e', 0.15000000000000002], ['#a5c9cc', 0.15000000000000002], ['#99c3ca', 0.15000000000000002], ['#8bb8c8', 0.15000000000000002], ['#3c404a', 0.15000000000000002], ['#697f4d', 0.15000000000000002], ['#b5cbc9', 0.15000000000000002]], 
            [['#7d4b50', 0.17], ['#543c90', 0.17], ['#754655', 0.17], ['#cecb8c', 0.17], ['#405a4a', 0.17], ['#3f4c5b', 0.17], ['#a2b579', 0.17], ['#9ec5ca', 0.17], ['#8ebbc8', 0.17], ['#7badc7', 0.17], ['#393e46', 0.17], ['#4c6341', 0.17], ['#aac4c4', 0.17]]
        ]
    }
]

export const MatrixPalette = ({
    matrixData,
    setMatrixData,
    pigmentChanged,
    setPigmentChanged,
    setOriginalPigments,
    pigments,
    setPigments,
    mixedPigments,
    setMixedPigments
}) => {

    // const [matrixData, setMatrixData] = useState([
    //     {
    //         'row': [['#de3e35', 0.01], ['#962c35', 0.01], ['#b04d36', 0.01], ['#f1e159', 0.01], ['#ffa53c', 0.01], ['#ef9043', 0.01], ['#5d7d37', 0.01], ['#227dc1', 0.01], ['#2154ac', 0.01], ['#1a3b9f', 0.01], ['#201f29', 0.01], ['#2f3438', 0.01], ['#ebe6da', 0.01]], 
    //         'col': [['#de3e35', 0.01], ['#962c35', 0.01], ['#b04d36', 0.01], ['#f1e159', 0.01], ['#ffa53c', 0.01], ['#ef9043', 0.01], ['#5d7d37', 0.01], ['#227dc1', 0.01], ['#2154ac', 0.01], ['#1a3b9f', 0.01], ['#201f29', 0.01], ['#2f3438', 0.01], ['#ebe6da', 0.01]], 
    //         'mixed': [
    //             [['#d7563e', 0.02], ['#892a47', 0.02], ['#c44839', 0.02], ['#fab029', 0.02], ['#cc5341', 0.02], ['#d35142', 0.02], ['#57423d', 0.02], ['#423472', 0.02], ['#40357e', 0.02], ['#3f3582', 0.02], ['#383939', 0.02], ['#3c3938', 0.02], ['#de6d6d', 0.02]], 
    //             [['#843440', 0.02], ['#00279a', 0.02], ['#51304f', 0.02], ['#bb4247', 0.02], ['#843d45', 0.02], ['#732f4a', 0.02], ['#493d3a', 0.02], ['#1b2b8f', 0.02], ['#1e2896', 0.02], ['#071e9f', 0.02], ['#293149', 0.02], ['#31353d', 0.02], ['#a76a92', 0.02]], 
    //             [['#be473a', 0.02], ['#493e59', 0.02], ['#7e453c', 0.02], ['#d78710', 0.02], ['#c54942', 0.02], ['#bb4143', 0.02], ['#5c463b', 0.02], ['#3c306a', 0.02], ['#3d2e78', 0.02], ['#3c2980', 0.02], ['#2f3135', 0.02], ['#363537', 0.02], ['#c1766c', 0.02]], 
    //             [['#f09a3f', 0.02], ['#b03e37', 0.02], ['#ba6437', 0.02], ['#fbe829', 0.02], ['#e4d261', 0.02], ['#e2ce62', 0.02], ['#a5a95d', 0.02], ['#96c6cb', 0.02], ['#8dc7d0', 0.02], ['#88c3cb', 0.02], ['#706a2e', 0.02], ['#8f8e37', 0.02], ['#e1cb6f', 0.02]],
    //             [['#d44d3b', 0.02], ['#8c3e47', 0.02], ['#ca4b41', 0.02], ['#f4dd38', 0.02], ['#d76e3a', 0.02], ['#d54e41', 0.02], ['#606d36', 0.02], ['#354589', 0.02], ['#314590', 0.02], ['#374492', 0.02], ['#2c3338', 0.02], ['#333839', 0.02], ['#daa06a', 0.02]], 
    //             [['#dd4d3d', 0.02], ['#6c304c', 0.02], ['#c14241', 0.02], ['#f3dd36', 0.02], ['#d64c41', 0.02], ['#d23b44', 0.02], ['#4a503d', 0.02], ['#363b8d', 0.02], ['#2c3d95', 0.02], ['#313d99', 0.02], ['#2f343a', 0.02], ['#35393b', 0.02], ['#c89b8c', 0.02]], 
    //             [['#494839', 0.02], ['#3c3e3e', 0.02], ['#47463b', 0.02], ['#cab25d', 0.02], ['#677534', 0.02], ['#5a6437', 0.02], ['#4b7c36', 0.02], ['#87c6d1', 0.02], ['#7dbecc', 0.02], ['#68b3ca', 0.02], ['#303837', 0.02], ['#304536', 0.02], ['#8fb183', 0.02]], 
    //             [['#443c78', 0.02], ['#2f24b1', 0.02], ['#433484', 0.02], ['#96c8d2', 0.02], ['#3d5a9c', 0.02], ['#374ea4', 0.02], ['#87cbdc', 0.02], ['#92c0cb', 0.02], ['#80b3c7', 0.02], ['#6da7c5', 0.02], ['#4662a2', 0.02], ['#6ea1b8', 0.02], ['#0093ca', 0.02]],
    //             [['#3f4285', 0.02], ['#2f2ab7', 0.02], ['#3b3897', 0.02], ['#8dc6ce', 0.02], ['#3b519a', 0.02], ['#2f4aa7', 0.02], ['#81c4cd', 0.02], ['#6ba5c4', 0.02], ['#4794c0', 0.02], ['#398bc0', 0.02], ['#475ea4', 0.02], ['#487bac', 0.02], ['#2e6ec2', 0.02]], 
    //             [['#3e437e', 0.02], ['#2f2cb1', 0.02], ['#393b94', 0.02], ['#89c3c6', 0.02], ['#3e4e94', 0.02], ['#3149a3', 0.02], ['#76b8c4', 0.02], ['#5198c0', 0.02], ['#398bbe', 0.02], ['#3685bf', 0.02], ['#465da5', 0.02], ['#4474a9', 0.02], ['#376cc1', 0.02]], 
    //             [['#343639', 0.02], ['#213053', 0.02], ['#313339', 0.02], ['#915f21', 0.02], ['#2c3138', 0.02], ['#2f323a', 0.02], ['#353938', 0.02], ['#515d9f', 0.02], ['#4f5ea7', 0.02], ['#4c56af', 0.02], ['#2e3133', 0.02], ['#2b2b2d', 0.02], ['#2c3a5c', 0.02]], 
    //             [['#3a3938', 0.02], ['#29334c', 0.02], ['#363537', 0.02], ['#ae903b', 0.02], ['#313539', 0.02], ['#33373c', 0.02], ['#2e3f32', 0.02], ['#527aa8', 0.02], ['#486da6', 0.02], ['#4567aa', 0.02], ['#26272b', 0.02], ['#313333', 0.02], ['#3f434d', 0.02]],
    //             [['#db6f6d', 0.02], ['#b67587', 0.02], ['#c37468', 0.02], ['#e5cf7b', 0.02], ['#d7a06c', 0.02], ['#cda797', 0.02], ['#93ae7c', 0.02], ['#0080c4', 0.02], ['#3572c1', 0.02], ['#4070c2', 0.02], ['#2d3855', 0.02], ['#3e4149', 0.02], ['#ebe9db', 0.02]]
    //         ]
    //     },
    // ]);
    
    const [focusStep, setFocusStep] = useState(0);
    const [clickPosition, setClickPosition] = useState([[-1, -1]]);
    const [genMatrix, setGenMatrix] = useState(['i'])

    // 跳转距离直接hardcord吧，这样最准确
    const stepSize = 287.15 + 8;

    const handleActionConduction = (actionType, hoverPosition, index) => {  // index means which color matrix palette
        const newClickPosition = JSON.parse(JSON.stringify(clickPosition));
        newClickPosition[index] = hoverPosition;

        let row = hoverPosition[0]
        let col = hoverPosition[1]
        // redo mixing
        if(index < matrixData.length - 1) {
            setMatrixData(current => current.slice(0, index + 1))
            let tmp = genMatrix.slice(0, index + 1)
            const filteredArray = tmp.filter((element) => element === 'm');
            const mixedCnt = filteredArray.length;
            if(mixedCnt < mixedPigments.length - 1) {
                setPigments(current => current.slice(0, mixedCnt + 2))
                setMixedPigments(current => current.slice(0, mixedCnt + 1))
                setPigmentChanged(current => !current)
            }
        }
        // console.log("matrixData[",index,"]:", matrixData[index]) 
        if(index === 0) {
            setOriginalPigments([[row, 0.01], [col, 0.01]])
            setPigments([matrixData[index]['col'][row], matrixData[index]['row'][col]])
            setMixedPigments([matrixData[index]['mixed'][row][col]])
            setPigmentChanged(current => !current)
            console.log("pigments changed:", pigments)
            console.log("mixedPigments changed:", mixedPigments)
        }
        else {
            const filteredArray = genMatrix.filter((element) => element === 'm');
            const mixedCnt = filteredArray.length;
            // adjust mixing
            if(mixedCnt >= mixedPigments.length) {
                setOriginalPigments(current => [...current, [col, 0.01]]) // add new original pigment
                console.log("originalPigments changed")
                setPigments(current => [...current, matrixData[index]['row'][col]])
                setMixedPigments(current => [...(current.slice(0, current.length - 1)), matrixData[index]['col'][row], matrixData[index]['mixed'][row][col]])
                setPigmentChanged(current => !current)
            }
            // adjust quantity just after initial case
            else if(mixedPigments.length === 1) {
                setPigments([matrixData[index]['col'][row], matrixData[index]['row'][col]])
                setMixedPigments([matrixData[index]['mixed'][row][col]])
                setPigmentChanged(current => !current)
            }
            // adjust quantity in other cases
            else {
                setPigments(current => [...(current.slice(0, current.length - 1)), matrixData[index]['col'][row]])
                setMixedPigments(current => [...(current.slice(0, current.length - 2)), matrixData[index]['row'][col], matrixData[index]['mixed'][row][col]])
                setPigmentChanged(current => !current)
            }
            console.log("pigments changed:", pigments)
            console.log("mixedPigments changed:", mixedPigments)
        }
        
        
        // TODO:这里分几种情况去给出逻辑: 1) 新的matrix添加至末尾；2）修改中间的matrix（未实现）
        
        // add matrix data to the list: actionType = 0, 1, 2并不好，可以改成语义"confirm", "quantity", "mixture"
        if(actionType === 0) {
            // ??
        } else if(actionType === 1) {
            // matrixData.push(quantityResults[0]);
            genMatrix.push('q')
            setGenMatrix(genMatrix)
            let body = { option: 'q', target_color: '#22ADC1', selected_coord: hoverPosition, matrix_num: index }
            fetch("http://localhost:8000/gen_matrix", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })
            .then(response => response.json())
            .then(data => {
                setMatrixData(current => [...current, data.colors])
            })
            .catch(error => console.error("Error fetching data:", error));
        } else if (actionType === 2) {
            // matrixData.push(mixtureResults[0]);
            genMatrix.push('m')
            setGenMatrix(genMatrix)
            let body = { option: 'm', target_color: '#22ADC1', selected_coord: hoverPosition, matrix_num: index }
            fetch("http://localhost:8000/gen_matrix", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            })
            .then(response => response.json())
            .then(data => {
                setMatrixData(current => [...current, data.colors])
            })
            .catch(error => console.error("Error fetching data:", error));
        }

        if(actionType === 1 || actionType === 2) {
            newClickPosition.push([-1, -1]);
            // setMatrixData(JSON.parse(JSON.stringify(matrixData)));
            setFocusStep(matrixData.length - 2);
        }
        setClickPosition(newClickPosition);
    }

    // move the scroll
    useEffect(() => {
        if(matrixData.length > 2) {
            const srollElement = document.getElementById("paletteList");
            srollElement.scrollLeft = focusStep * stepSize
        }

    }, [matrixData, stepSize, focusStep])

    const matrixItems = matrixData.map((data, index) => {
        const floatDirection = (index - focusStep) % 2 === 0 ? true : false;
        return <div
            key={`matrix-item-${index}`} 
            className="Matrix-item-container"
            style={{
                marginRight: `${index === matrixData.length - 1 ? 0 : 16}px`,
            }}
        >
            <MatrixVisualization 
                index={index} 
                data={data} 
                floatDirection={floatDirection} 
                changeActionType={handleActionConduction}
                clickPosition={clickPosition[index]}
            />
        </div>
    })

    return <div className="SDefault-container" style={{display: "flex"}}>
        <div className="Swtich-button-container">
            <div className="Icon-button"
                style={{
                    background: `url(${OpenCloseIcon}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconLevel1}px`,
                    height: `${iconLevel1}px`,
                    transform: "rotate(-90deg)",
                    cursor: 'pointer',
                }}
                onClick={() => setFocusStep(Math.max(0, focusStep - 1))}
            />
        </div>
        <div className="Palette-container">
            <div className="Palette-list" id="paletteList">
                {matrixItems}
            </div>
        </div>
        <div className="Swtich-button-container">
            <div className="Icon-button"
                style={{
                    background: `url(${OpenCloseIcon}) no-repeat`,
                    backgroundSize: 'contain',
                    width: `${iconLevel1}px`,
                    height: `${iconLevel1}px`,
                    transform: "rotate(90deg)",
                    cursor: 'pointer',
                }}
                onClick={() => setFocusStep(Math.min(matrixData.length - 2, focusStep + 1))}
            />
        </div>
    </div>
}