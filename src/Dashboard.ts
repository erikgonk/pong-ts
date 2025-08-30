// Dashboard.ts
// SPA version of the dashboard from changes.html

export interface DashboardData {
  username: string;
  stats: {
    won: number;
    lost: number;
    scores: number;
    friends: number;
  };
  points: {
    scored: number;
    received: number;
  };
}

export function showDashboard(data: DashboardData) {
  // Hide the Pong game UI (assumes main game container has id 'game-container')
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) gameContainer.style.display = 'none';

  // Create dashboard container if not exists
  let dashboardContainer = document.getElementById('dashboard-container');
  if (!dashboardContainer) {
    dashboardContainer = document.createElement('div');
    dashboardContainer.id = 'dashboard-container';
    document.body.appendChild(dashboardContainer);
  }
  dashboardContainer.innerHTML = `
    <div class="w-screen h-screen fixed top-0 left-0 z-50 bg-custom-black flex items-start justify-start p-0 m-0" style="min-height:100vh;min-width:100vw;">
      <div class="bg-custom-yellow h-screen shadow-lg p-2 space-y-2 flex flex-col"
        style="border-radius:0;width:256px;min-width:256px;max-width:256px;overflow:hidden;">
      <header class="text-center py-1">
        <h1 class="text-base font-bold text-custom-black">Dashboard</h1>
      </header>
      <div class="flex justify-between items-center px-1">
        <h2 id="username" class="text-base font-bold text-custom-black truncate"></h2>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-custom-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
      </div>
      <div class="grid grid-cols-2 gap-1">
        <div class="bg-custom-black rounded-xl p-1 text-center">
          <div class="bg-gray-700 rounded-full w-6 h-6 mx-auto flex items-center justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-custom-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <p id="total-won" class="text-base font-bold text-custom-white"></p>
          <p class="text-xs text-gray-400">Won</p>
        </div>
        <div class="bg-custom-black rounded-xl p-1 text-center">
          <div class="bg-gray-700 rounded-full w-6 h-6 mx-auto flex items-center justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-custom-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          </div>
          <p id="total-lost" class="text-base font-bold text-custom-white"></p>
          <p class="text-xs text-gray-400">Lost</p>
        </div>
        <div class="bg-custom-black rounded-xl p-1 text-center">
          <div class="bg-gray-700 rounded-full w-6 h-6 mx-auto flex items-center justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-custom-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <p id="total-scores" class="text-base font-bold text-custom-white"></p>
          <p class="text-xs text-gray-400">Scores</p>
        </div>
        <div class="bg-custom-black rounded-xl p-1 text-center">
          <div class="bg-gray-700 rounded-full w-6 h-6 mx-auto flex items-center justify-center mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-custom-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <p id="total-friends" class="text-base font-bold text-custom-white"></p>
          <p class="text-xs text-gray-400">Friends</p>
        </div>
      </div>
      <div class="bg-custom-black rounded-2xl p-4">
        <h3 class="text-xl font-bold text-custom-white mb-4">Total Points</h3>
        <div id="bar-chart"></div>
        <div class="flex justify-center items-center space-x-6 mt-4">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-custom-yellow"></div>
            <span class="text-sm text-gray-400">Scored</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-custom-white"></div>
            <span class="text-sm text-gray-400">Received</span>
          </div>
        </div>
      </div>
      <div class="bg-custom-black rounded-2xl p-4">
        <h3 class="text-xl font-bold text-custom-white mb-4">Wons & Lost</h3>
        <div id="donut-chart" class="relative"></div>
        <div class="flex justify-center items-center space-x-6 mt-4">
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-custom-yellow"></div>
            <span id="won-percentage" class="text-sm text-gray-400"></span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-custom-white"></div>
            <span id="lost-percentage" class="text-sm text-gray-400"></span>
          </div>
        </div>
      </div>
      </div>
    </div>
  `;

  // Add Tailwind and custom styles if not present
  if (!document.getElementById('dashboard-tailwind')) {
    const twScript = document.createElement('script');
    twScript.id = 'dashboard-tailwind';
    twScript.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(twScript);
  }
  if (!document.getElementById('dashboard-custom-style')) {
    const style = document.createElement('style');
    style.id = 'dashboard-custom-style';
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
      body { font-family: 'Inter', sans-serif; background-color: #191A1A; }
      .bg-custom-yellow { background-color: #EDD24E; }
      .bg-custom-black { background-color: #191A1A; }
      .text-custom-yellow { color: #EDD24E; }
      .text-custom-white { color: #D9D9D9; }
      .fill-custom-yellow { fill: #EDD24E; }
      .fill-custom-white { fill: #D9D9D9; }
    `;
    document.head.appendChild(style);
  }
  // Add D3 if not present
  if (!(window as any).d3) {
    const d3Script = document.createElement('script');
    d3Script.src = 'https://d3js.org/d3.v7.min.js';
    d3Script.onload = () => renderDashboard(data);
    document.head.appendChild(d3Script);
  } else {
    renderDashboard(data);
  }
}

function renderDashboard(data: DashboardData) {
  // Update text elements
  (document.getElementById('username') as HTMLElement).textContent = data.username;
  (document.getElementById('total-won') as HTMLElement).textContent = String(data.stats.won);
  (document.getElementById('total-lost') as HTMLElement).textContent = String(data.stats.lost);
  (document.getElementById('total-scores') as HTMLElement).textContent = String(data.stats.scores);
  (document.getElementById('total-friends') as HTMLElement).textContent = String(data.stats.friends);

  // Chart data
  const barChartData = [
    { label: 'Received', value: data.points.received },
    { label: 'Scored', value: data.points.scored },
  ];
  createBarChart(barChartData);

  const totalGames = data.stats.won + data.stats.lost;
  const wonPercentage = totalGames > 0 ? Math.round((data.stats.won / totalGames) * 100) : 0;
  const lostPercentage = 100 - wonPercentage;

  const donutChartData = [
    { label: 'Won', value: wonPercentage },
    { label: 'Lost', value: lostPercentage },
  ];
  createDonutChart(donutChartData);

  (document.getElementById('won-percentage') as HTMLElement).textContent = `Won ${wonPercentage}%`;
  (document.getElementById('lost-percentage') as HTMLElement).textContent = `Lost ${lostPercentage}%`;
}

function createBarChart(barChartData: { label: string; value: number }[]) {
  // @ts-ignore
  const d3 = (window as any).d3;
  d3.select('#bar-chart').html('');
  const margin = { top: 20, right: 20, bottom: 20, left: 40 };
  const width = 300 - margin.left - margin.right;
  const height = 150 - margin.top - margin.bottom;
  const svg = d3.select('#bar-chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(barChartData, (d: any) => d.value) * 1.1])
    .range([height, 0]);
  const xScale = d3.scaleBand()
    .domain(barChartData.map((d: any) => d.label))
    .range([0, width])
    .padding(0.5);
  const yAxisGrid = d3.axisLeft(yScale)
    .tickSize(-width)
    .tickFormat(() => '')
    .ticks(3);
  svg.append('g')
    .attr('class', 'y-axis-grid')
    .call(yAxisGrid)
    .selectAll('line')
    .attr('stroke', '#4A5568');
  svg.selectAll('.domain').remove();
  const yAxisLabels = d3.axisLeft(yScale).ticks(3);
  svg.append('g')
    .call(yAxisLabels)
    .attr('color', '#A0AEC0')
    .selectAll('.domain, .tick line').remove();
  svg.selectAll('.bar')
    .data(barChartData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d: any) => xScale(d.label))
    .attr('y', (d: any) => yScale(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height', (d: any) => height - yScale(d.value))
    .attr('fill', (d: any) => d.label === 'Scored' ? '#EDD24E' : '#D9D9D9')
    .attr('rx', 6)
    .attr('ry', 6);
}

function createDonutChart(donutChartData: { label: string; value: number }[]) {
  // @ts-ignore
  const d3 = (window as any).d3;
  d3.select('#donut-chart').html('');
  const width = 200;
  const height = 200;
  const radius = Math.min(width, height) / 2;
  const donutWidth = 30;
  const color = d3.scaleOrdinal()
    .domain(donutChartData.map((d: any) => d.label))
    .range(['#EDD24E', '#D9D9D9']);
  const svg = d3.select('#donut-chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);
  const arc = d3.arc()
    .innerRadius(radius - donutWidth)
    .outerRadius(radius)
    .cornerRadius(10);
  const pie = d3.pie()
    .value((d: any) => d.value)
    .sort(null);
  svg.selectAll('path')
    .data(pie(donutChartData))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', (d: any) => color(d.data.label));
}
