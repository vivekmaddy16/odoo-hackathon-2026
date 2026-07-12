import React, { useEffect, useRef } from 'react';

const LiveRouteMap = ({ trips = [] }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId;
    let progress = 0;

    // Filter active/dispatched trips
    const activeTrips = trips.filter(t => t.status === 'Dispatched');

    // If no active trips, simulate demo ones for visual animation
    const simulatedTrips = activeTrips.length > 0 ? activeTrips : [
      { id: 'DEMO-1', vehicleId: 'GJ01AB4521', driverName: 'Alex', destination: 'Ahmedabad Hub', status: 'Dispatched' },
      { id: 'DEMO-2', vehicleId: 'GJ01AB9981', driverName: 'Priya', destination: 'Sanand Warehouse', status: 'Dispatched' }
    ];

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Define Node coordinates dynamically based on canvas dimensions
      const nodes = {
        gandhinagar: { name: 'Gandhinagar Depot', x: width * 0.5, y: height * 0.5 },
        ahmedabad: { name: 'Ahmedabad Hub', x: width * 0.8, y: height * 0.75 },
        sanand: { name: 'Sanand Warehouse', x: width * 0.2, y: height * 0.75 },
        kalol: { name: 'Kalol Depot', x: width * 0.35, y: height * 0.2 }
      };

      const routes = {
        'Ahmedabad Hub': { start: nodes.gandhinagar, end: nodes.ahmedabad },
        'Sanand Warehouse': { start: nodes.gandhinagar, end: nodes.sanand },
        'Kalol Depot': { start: nodes.gandhinagar, end: nodes.kalol },
        'Ahmedabad': { start: nodes.gandhinagar, end: nodes.ahmedabad },
        'Sanand': { start: nodes.gandhinagar, end: nodes.sanand },
        'Kalol': { start: nodes.gandhinagar, end: nodes.kalol },
        default: { start: nodes.gandhinagar, end: nodes.ahmedabad }
      };

      // Draw blueprint grid
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw connection lines
      Object.values(nodes).forEach(node => {
        if (node.name !== 'Gandhinagar Depot') {
          ctx.beginPath();
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1.5;
          ctx.moveTo(nodes.gandhinagar.x, nodes.gandhinagar.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Update progress
      progress += 0.0018; 
      if (progress > 1) progress = 0;

      // Draw active trucks
      simulatedTrips.forEach((trip, idx) => {
        const dest = trip.destination || 'Ahmedabad Hub';
        const route = routes[dest] || routes.default;
        
        // Stagger different trucks slightly
        const tripProgress = (progress + (idx * 0.45)) % 1;
        const currentX = route.start.x + (route.end.x - route.start.x) * tripProgress;
        const currentY = route.start.y + (route.end.y - route.start.y) * tripProgress;

        // Route path trace (glowing path trailing the truck)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.25)';
        ctx.lineWidth = 2.5;
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        // Draw glowing aura
        ctx.beginPath();
        ctx.arc(currentX, currentY, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
        ctx.fill();

        // Draw Truck circle
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'var(--accent-color)';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'var(--bg-color)';
        ctx.stroke();

        // Label details
        ctx.fillStyle = 'var(--text-primary)';
        ctx.font = 'bold 9px var(--font-mono)';
        ctx.textAlign = 'left';
        ctx.fillText(`${trip.vehicleId}`, currentX + 10, currentY + 3);
      });

      // Draw Warehouse Nodes
      Object.values(nodes).forEach(node => {
        const isDepot = node.name === 'Gandhinagar Depot';
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, isDepot ? 12 : 9, 0, Math.PI * 2);
        ctx.strokeStyle = isDepot ? 'var(--accent-color)' : 'var(--text-secondary)';
        ctx.lineWidth = 2;
        ctx.fillStyle = '#1e1e22';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.x, node.y, isDepot ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isDepot ? 'var(--accent-color)' : 'var(--text-muted)';
        ctx.fill();

        ctx.fillStyle = 'var(--text-primary)';
        ctx.font = 'bold 11px var(--font-hand)';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + (isDepot ? -18 : 20));
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [trips]);

  return (
    <div className="card card-handdrawn" style={{ position: 'relative', overflow: 'hidden', padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 className="card-title" style={{ margin: 0, fontFamily: 'var(--font-hand)' }}>Real-Time Dispatch Simulation Tracker</h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)', animation: 'pulse 1.5s infinite' }}></span>
          Live Depot Grid System
        </span>
      </div>
      <div style={{ position: 'relative', width: '100%', height: '240px', border: '1.5px solid var(--border-color)', borderRadius: '8px', backgroundColor: '#16161a', overflow: 'hidden' }}>
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default LiveRouteMap;
