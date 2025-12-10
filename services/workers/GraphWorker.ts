
// This string is blobbed to create the worker
export const GRAPH_WORKER_CODE = `
  let canvas;
  let ctx;
  let nodes = [];
  
  self.onmessage = function(e) {
    if (e.data.canvas) {
      canvas = e.data.canvas;
      ctx = canvas.getContext('2d');
      requestAnimationFrame(draw);
    }
    
    if (e.data.nodes) {
      nodes = e.data.nodes;
    }
    
    if (e.data.resize) {
      if(canvas) {
        canvas.width = e.data.width;
        canvas.height = e.data.height;
      }
    }
  };

  function draw() {
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = '#0f172a'; // Slate 950
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Physics Simulation Step
    nodes.forEach(node => {
       node.x += node.vx || 0;
       node.y += node.vy || 0;
       
       // Bounce bounds
       if(node.x < 0 || node.x > canvas.width) node.vx *= -1;
       if(node.y < 0 || node.y > canvas.height) node.vy *= -1;
       
       ctx.beginPath();
       ctx.arc(node.x, node.y, node.r || 5, 0, Math.PI * 2);
       ctx.fillStyle = node.color || '#06b6d4';
       ctx.fill();
    });
    
    requestAnimationFrame(draw);
  }
`;
