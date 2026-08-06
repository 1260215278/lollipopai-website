(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();
  var green = style.getPropertyValue('--green').trim();
  var yellow = style.getPropertyValue('--yellow').trim();
  var red = style.getPropertyValue('--red').trim();

  // ===================== Chart 1: SEO Radar =====================
  var chartRadar = echarts.init(document.getElementById('chart-radar'), null, { renderer: 'svg' });
  chartRadar.setOption({
    backgroundColor: 'transparent',
    legend: {
      data: ['当前评分', '修复后预期'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 12 },
      itemGap: 30,
    },
    radar: {
      indicator: [
        { name: '技术SEO\n(预渲染/抓取)', max: 100 },
        { name: '内容可见性\n(H1/正文/内链)', max: 100 },
        { name: '结构化数据\n(Schema)', max: 100 },
        { name: '国际化SEO\n(hreflang)', max: 100 },
        { name: '性能\n(Core Web Vitals)', max: 100 },
        { name: '站外SEO\n(外链/收录)', max: 100 },
      ],
      center: ['50%', '48%'],
      radius: '62%',
      splitNumber: 4,
      axisName: {
        color: ink,
        fontSize: 12,
        lineHeight: 16,
      },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { areaStyle: { color: ['rgba(255,255,255,0.01)', 'rgba(255,255,255,0.02)'] } },
      axisLine: { lineStyle: { color: rule } },
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [55, 20, 75, 60, 50, 15],
          name: '当前评分',
          areaStyle: { color: accent + '30' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent },
          symbolSize: 6,
        },
        {
          value: [90, 85, 90, 85, 80, 65],
          name: '修复后预期',
          areaStyle: { color: green + '20' },
          lineStyle: { color: green, width: 2, type: 'dashed' },
          itemStyle: { color: green },
          symbolSize: 6,
        },
      ],
    }],
    animation: false,
  });
  window.addEventListener('resize', function () { chartRadar.resize(); });

  // ===================== Chart 2: Priority Distribution =====================
  var chartPriority = echarts.init(document.getElementById('chart-priority'), null, { renderer: 'svg' });
  chartPriority.setOption({
    backgroundColor: 'transparent',
    grid: { left: '8%', right: '10%', top: '8%', bottom: '10%' },
    xAxis: {
      type: 'value',
      max: 10,
      axisLabel: { color: muted, fontSize: 11 },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } },
    },
    yAxis: {
      type: 'category',
      data: ['P3 低优先级', 'P2 中优先级', 'P1 高优先级', 'P0 紧急'],
      axisLabel: { color: ink, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
    },
    series: [
      {
        name: '问题数量',
        type: 'bar',
        data: [
          { value: 7, itemStyle: { color: green } },
          { value: 7, itemStyle: { color: accent2 } },
          { value: 6, itemStyle: { color: yellow } },
          { value: 4, itemStyle: { color: red } },
        ],
        barWidth: '50%',
        label: {
          show: true,
          position: 'right',
          color: ink,
          fontSize: 13,
          fontWeight: 700,
          formatter: '{c} 项',
        },
      },
      {
        name: '预计工时(人天)',
        type: 'bar',
        data: [
          { value: 5, itemStyle: { color: green + '40' } },
          { value: 10, itemStyle: { color: accent2 + '40' } },
          { value: 8, itemStyle: { color: yellow + '40' } },
          { value: 6, itemStyle: { color: red + '40' } },
        ],
        barWidth: '50%',
        label: {
          show: true,
          position: 'right',
          color: muted,
          fontSize: 11,
          formatter: '{c} 人天',
        },
      },
    ],
    legend: {
      data: ['问题数量', '预计工时(人天)'],
      bottom: 0,
      textStyle: { color: muted, fontSize: 11 },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      appendToBody: true,
    },
    animation: false,
  });
  window.addEventListener('resize', function () { chartPriority.resize(); });

  // ===================== Chart 3: Roadmap Gantt =====================
  var chartGantt = echarts.init(document.getElementById('chart-gantt'), null, { renderer: 'svg' });
  var categories = ['第四阶段:长期建设', '第三阶段:中期优化', '第二阶段:高优先级', '第一阶段:紧急修复'];
  var phaseColors = [accent2, accent2, yellow, red];

  chartGantt.setOption({
    backgroundColor: 'transparent',
    grid: { left: '15%', right: '8%', top: '8%', bottom: '12%' },
    xAxis: {
      type: 'value',
      name: '周',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: { color: muted, fontSize: 11 },
      min: 0,
      max: 24,
      interval: 2,
      axisLabel: { color: muted, fontSize: 11, formatter: 'W{value}' },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } },
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: ink, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false },
    },
    series: [{
      type: 'custom',
      renderItem: function (params, api) {
        var categoryIndex = api.value(0);
        var start = api.coord([api.value(1), categoryIndex]);
        var end = api.coord([api.value(2), categoryIndex]);
        var height = api.size([0, 1])[1] * 0.55;
        return {
          type: 'rect',
          shape: {
            x: start[0],
            y: start[1] - height / 2,
            width: end[0] - start[0],
            height: height,
            r: 4,
          },
          style: {
            fill: phaseColors[categoryIndex],
            opacity: 0.8,
          },
        };
      },
      encode: { x: [1, 2], y: 0 },
      data: [
        [3, 8, 24],
        [2, 3, 8],
        [1, 1, 3],
        [0, 0, 1],
      ],
      label: {
        show: true,
        position: 'inside',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        formatter: function (params) {
          var labels = ['长期建设 (M3-6)', '中期优化 (W4-8)', '高优先级修复 (W2-3)', '紧急修复 (W1)'];
          return labels[params.value(0)];
        },
      },
    }],
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      formatter: function (params) {
        var labels = ['第四阶段：长期建设', '第三阶段：中期优化', '第二阶段：高优先级修复', '第一阶段：紧急修复'];
        var ranges = ['Week 8 - Week 24', 'Week 3 - Week 8', 'Week 1 - Week 3', 'Week 0 - Week 1'];
        return labels[params.value(0)] + '<br/>' + ranges[params.value(0)];
      },
    },
    animation: false,
  });
  window.addEventListener('resize', function () { chartGantt.resize(); });
})();
