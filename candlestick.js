/**
 * 获取canvas绘图上下文
 * @type {[type]}
 */
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

//基本绘图配置
let options = {
    chartZone: [50, 50, 1000, 700],
    yAxisLabel: ['2100', '2150', '2200', '2250', '2300', '2350'],
    yMax: 2350,
    yMin: 2100,
    xAxisLabel: data0.categoryData,
    xAxisPos: [], //用于暂存x坐标轴标签的位置
    data: data0.values,
}

drawCandlestickChart(options);

/**
 * 绘制K线图
 */
function drawCandlestickChart(options) {
    drawAxis(options); //绘制坐标轴
    drawYLabels(options); //绘制y轴坐标
    drawXLabels(options); //绘制x轴坐标
    drawData(options); //绘制K线图
}

/**
 * 绘制坐标轴
 */
function drawAxis(options) {
    let chartZone = options.chartZone;
    context.strokeWidth = 4;
    context.strokeStyle = '#353535';
    context.moveTo(chartZone[0], chartZone[1]);
    context.lineTo(chartZone[0], chartZone[3]); //y轴总高650
    context.lineTo(chartZone[2], chartZone[3]); //x轴总长
    context.stroke();
}

/**
 * 绘制y轴坐标
 */
function drawYLabels(options) {
    let labels = options.yAxisLabel;//y轴刻度
    let yLength = (options.chartZone[3] - options.chartZone[1]) * 0.98;//637
    let gap = yLength / (labels.length - 1);//637/(6-1)=127.4

    labels.forEach(function (label, index) {
        //绘制坐标文字
        let offset = context.measureText(label).width +20;
        context.strokeStyle = '#eaeaea';
        context.font = '16px';
        context.fillText(label, options.chartZone[0] - offset, options.chartZone[3] - index * gap);
        //绘制小间隔
        context.beginPath();
        context.strokeStyle = '#353535';
        // x轴方向是绘线 所以x改变即可
        context.moveTo(options.chartZone[0] - 10, options.chartZone[3] - index * gap);
        context.lineTo(options.chartZone[0], options.chartZone[3] - index * gap);
        context.stroke();
        //绘制辅助线
        context.beginPath();
        context.strokeStyle = '#eaeaea';
        context.strokeWidth = 2;
        // x轴上等于1000即可
        context.moveTo(options.chartZone[0], options.chartZone[3] - index * gap);
        context.lineTo(options.chartZone[2], options.chartZone[3] - index * gap);
        context.stroke();
    });
}

/**
 * 绘制x轴坐标
 */
function drawXLabels(options) {
    let labels = options.xAxisLabel;
    let xLength = options.chartZone[2] - options.chartZone[0];
    let gap = xLength / labels.length;

    labels.forEach(function (label, index) {
        let aaa = index % 4
        if (index % 4 === 0) {
            context.strokeStyle = '#eaeaea';
            context.font = '18px';
            context.textAlign = 'center';
            context.fillText(label, options.chartZone[0] + (index + 1) * gap, options.chartZone[3] + 20);
        }
        //绘制小间隔
        context.beginPath();
        context.strokeStyle = '#353535';
        context.moveTo(options.chartZone[0] + (index + 1) * gap, options.chartZone[3]);
        context.lineTo(options.chartZone[0] + (index + 1) * gap, options.chartZone[3] + 5);
        context.stroke();
        //由于
        options.xAxisPos[index] = (index + 1) * gap;
    });
    options.xAxisPos[0] = 0;
}

/**
 * 绘制数据
 */
function drawData(options) {
    let data = options.data;
    console.log('data: ', data);
    let xLength = options.chartZone[2] - options.chartZone[0];
    let c; //记录当前绘制点的颜色
    let gap = xLength / options.xAxisLabel.length;
    console.log('gap: ', gap);
    let activeX = 0; //记录绘制过程中当前点的坐标
    let activeY = 0; //记录绘制过程中当前点的y坐标
    context.strokeWidth = 2;
    context.beginPath();
    context.moveTo(options.chartZone[0], options.chartZone[3]); //先将起点移动至0,0坐标
    for (let i = 0; i < data.length; i++) {
        //获取绘图颜色
        c = getColor(data[i]);
        context.strokeWidth = 1;
        context.strokeStyle = context.fillStyle = c;
        //计算绘制中心点x坐标
        activeX = options.chartZone[0] + (i + 1) * gap;
        //绘制最高最低线;
        context.beginPath();
        context.moveTo(activeX, transCoord(data[i][2]));
        context.lineTo(activeX, transCoord(data[i][3]));
        context.closePath();
        context.stroke();
        //绘制开盘收盘矩形
        if (data[i][0] >= data[i][1]) {
            context.fillRect(activeX - 5, transCoord(data[i][0]), 10, transCoord(data[i][1]) - transCoord(data[i][0]));
        } else {
            context.fillRect(activeX - 5, transCoord(data[i][1]), 10, transCoord(data[i][0]) - transCoord(data[i][1]));
        }
    }
}

//根据K线图的数据计算绘图颜色
function getColor(data) {
    return data[0] >= data[1] ? '#1abc9c' : '#DA5961';
}

//从可视坐标系坐标转换为canvas坐标系坐标
function transCoord(coord) {
    console.log('coord: ', coord);
    //[2232.69, 2225.29, 2217.25, 2241.34],
    // 700 -  (700 - 50) * （2217.25 - 2100）/ （2300 - 2100） = 700-381=319 等比例缩小值该范围
    // 700 - （y轴长度*当前值与最小值的差/最大值减去最小值）
    return options.chartZone[3] - (options.chartZone[3] - options.chartZone[1]) * (coord - options.yMin) / (options.yMax - options.yMin);
}
// 拖拽与缩放（视差）
// 曲线绘制
// 