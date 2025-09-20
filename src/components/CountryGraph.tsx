import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

type Country = {
  id: string;
  name: string;
  quadrant: string;
  provision: number;
  freedom: number;
  summary: string;
};

type Props = {
  countries: Country[];
  onSelect: (country: Country) => void;
};

const quadrantColor = (q: string) => {
  if (/gilded/i.test(q)) return '#f59e0b'; // amber
  if (/wild|battle/i.test(q)) return '#60a5fa'; // blue
  if (/double whammy/i.test(q)) return '#ef4444'; // red
  if (/calibration/i.test(q)) return '#34d399'; // green
  return '#a78bfa'; // violet fallback
};

const CountryGraph: React.FC<Props> = ({ countries, onSelect }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    const rect = container.getBoundingClientRect();
    const width = Math.max(600, Math.min(1100, rect.width - 40));
    const height = Math.max(300, rect.height - 40);

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain([0, 10]).range([0, innerWidth]).nice();
    const y = d3.scaleLinear().domain([0, 10]).range([innerHeight, 0]).nice();

    const svg = d3.select(svgEl)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Clip path to keep content within plot area
    const defs = svg.append('defs');
    const clipId = 'plot-clip';
    defs.append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth)
      .attr('height', innerHeight);

    // Gridlines
    const grid = g.append('g').attr('class', 'grid');
    grid.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(10).tickSize(-innerHeight).tickFormat(() => ''));
    grid.append('g')
      .call(d3.axisLeft(y).ticks(10).tickSize(-innerWidth).tickFormat(() => ''));

    grid.selectAll('line').attr('stroke', '#2a2a2a');

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(10))
      .call((g) => g.selectAll('text').attr('fill', '#bbb'))
      .call((g) => g.selectAll('path,line').attr('stroke', '#444'));

    g.append('g')
      .call(d3.axisLeft(y).ticks(10))
      .call((g) => g.selectAll('text').attr('fill', '#bbb'))
      .call((g) => g.selectAll('path,line').attr('stroke', '#444'));

    // Axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 32)
      .attr('text-anchor', 'middle')
      .attr('fill', '#bbb')
      .text('Provision (0–10)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -38)
      .attr('text-anchor', 'middle')
      .attr('fill', '#bbb')
      .text('Freedom (0–10)');

    // Plot content (zoomed), clipped to inner chart area
    const plot = g.append('g').attr('clip-path', `url(#${clipId})`);
    const content = plot.append('g').attr('class', 'content');

    // Points
    const points = content.append('g').attr('class', 'points');
    points.selectAll('circle')
      .data(countries, (d: any) => d.id)
      .join('circle')
      .attr('cx', (d: Country) => x(d.provision))
      .attr('cy', (d: Country) => y(d.freedom))
      .attr('r', 6)
      .attr('fill', (d: Country) => quadrantColor(d.quadrant))
      .attr('stroke', 'none')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.95)
      .style('cursor', 'pointer')
      .append('title')
      .text((d: Country) => `${d.name}\nProvision ${d.provision}, Freedom ${d.freedom}`);

    // Click handling needs to be added after title (since title creates a child)
    points.selectAll('circle')
      .on('click', (_, d: any) => onSelect(d as Country));

    // Labels (optional, subtle)
    content.selectAll('text.label')
      .data(countries, (d: any) => d.id)
      .join('text')
      .attr('class', 'label')
      .attr('x', (d: Country) => x(d.provision) + 10)
      .attr('y', (d: Country) => y(d.freedom) + 4)
      .attr('fill', '#aaa')
      .attr('font-size', 12)
      .text((d: Country) => d.name);

    // No zoom/pan: keep axes and content static

  }, [countries, onSelect]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} role="img" aria-label="Country scatter plot" />
    </div>
  );
};

export default CountryGraph;
