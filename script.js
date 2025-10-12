// Brain visualization
const canvas = document.getElementById('brainCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const neurons = [];
const numNeurons = 80;

class Neuron {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        ctx.fill();
    }
}

for (let i = 0; i < numNeurons; i++) {
    neurons.push(new Neuron());
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    neurons.forEach(neuron => {
        neuron.update();
        neuron.draw();
    });

    for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
            const dx = neurons[i].x - neurons[j].x;
            const dy = neurons[i].y - neurons[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.beginPath();
                ctx.moveTo(neurons[i].x, neurons[i].y);
                ctx.lineTo(neurons[j].x, neurons[j].y);
                ctx.strokeStyle = `rgba(102, 126, 234, ${0.2 * (1 - distance / 150)})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(animate);
}

animate();

// ============================================
// Random neuron appearance
// ============================================
const neuronViz = document.getElementById('neuronViz');
const positions = [
    {x: 20, y: 50}, {x: 20, y: 150}, {x: 20, y: 250},
    {x: 20, y: 350}, {x: 20, y: 450},
    {x: 250, y: 100}, {x: 250, y: 200}, {x: 250, y: 300}, {x: 250, y: 400},
    {x: 480, y: 150}, {x: 480, y: 250}, {x: 480, y: 350}
];

// Shuffle positions for random appearance
const shuffledPositions = [...positions].sort(() => Math.random() - 0.5);

// Create observer to trigger animation when section is visible
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            neuronViz.innerHTML = ''; // Clear existing neurons
            shuffledPositions.forEach((pos, i) => {
                setTimeout(() => {
                    const neuron = document.createElement('div');
                    neuron.className = 'neuron';
                    neuron.style.left = pos.x + 'px';
                    neuron.style.top = pos.y + 'px';
                    neuron.style.opacity = '0';
                    neuron.style.transform = 'scale(0)';
                    neuronViz.appendChild(neuron);
                    
                    setTimeout(() => {
                        neuron.style.transition = 'all 0.5s ease';
                        neuron.style.opacity = '1';
                        neuron.style.transform = 'scale(1)';
                    }, 50);
                }, i * 200);
            });
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

observer.observe(document.getElementById('technology'));

// ============================================
// Layer canvas with animated data flow
// ============================================
const layerCanvas = document.getElementById('layerCanvas');
const lctx = layerCanvas.getContext('2d');
layerCanvas.width = 600;
layerCanvas.height = 500;

const layers = [4, 6, 6, 3];
const layerSpacing = 150;
const nodeRadius = 15;

// Store node positions
const nodePositions = [];

// Calculate and store all node positions
layers.forEach((nodeCount, layerIndex) => {
    const x = 80 + layerIndex * layerSpacing;
    const layerHeight = nodeCount * 60;
    const startY = (layerCanvas.height - layerHeight) / 2;
    
    if (!nodePositions[layerIndex]) {
        nodePositions[layerIndex] = [];
    }
    
    for (let i = 0; i < nodeCount; i++) {
        const y = startY + i * 60 + 30;
        nodePositions[layerIndex].push({ x, y });
    }
});

// Data particles traveling through connections
class DataParticle {
    constructor(startNode, endNode, layerIndex) {
        this.startX = startNode.x + nodeRadius;
        this.startY = startNode.y;
        this.endX = endNode.x - nodeRadius;
        this.endY = endNode.y;
        this.progress = Math.random();
        this.speed = 0.005 + Math.random() * 0.005;
        this.layerIndex = layerIndex;
    }
    
    update() {
        this.progress += this.speed;
        if (this.progress > 1) {
            this.progress = 0;
        }
    }
    
    draw() {
        const x = this.startX + (this.endX - this.startX) * this.progress;
        const y = this.startY + (this.endY - this.startY) * this.progress;
        
        lctx.beginPath();
        lctx.arc(x, y, 3, 0, Math.PI * 2);
        const gradient = lctx.createRadialGradient(x, y, 0, x, y, 3);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 1)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.5)');
        lctx.fillStyle = gradient;
        lctx.fill();
        lctx.shadowBlur = 10;
        lctx.shadowColor = 'rgba(102, 126, 234, 0.8)';
    }
}

// Create particles
const particles = [];
nodePositions.forEach((layer, layerIndex) => {
    if (layerIndex < nodePositions.length - 1) {
        layer.forEach(startNode => {
            nodePositions[layerIndex + 1].forEach(endNode => {
                const numParticles = Math.floor(Math.random() * 2) + 2;
                for (let p = 0; p < numParticles; p++) {
                    particles.push(new DataParticle(startNode, endNode, layerIndex));
                }
            });
        });
    }
});

function animateLayers() {
    lctx.clearRect(0, 0, layerCanvas.width, layerCanvas.height);
    
    // Draw connections
    nodePositions.forEach((layer, layerIndex) => {
        if (layerIndex < nodePositions.length - 1) {
            layer.forEach(startNode => {
                nodePositions[layerIndex + 1].forEach(endNode => {
                    lctx.beginPath();
                    lctx.moveTo(startNode.x + nodeRadius, startNode.y);
                    lctx.lineTo(endNode.x - nodeRadius, endNode.y);
                    lctx.strokeStyle = 'rgba(102, 126, 234, 0.15)';
                    lctx.lineWidth = 1;
                    lctx.stroke();
                });
            });
        }
    });
    
    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    // Draw nodes on top
    nodePositions.forEach((layer) => {
        layer.forEach(node => {
            lctx.beginPath();
            lctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
            const gradient = lctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeRadius);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            lctx.fillStyle = gradient;
            lctx.shadowBlur = 15;
            lctx.shadowColor = 'rgba(102, 126, 234, 0.5)';
            lctx.fill();
        });
    });
    
    requestAnimationFrame(animateLayers);
}

animateLayers();

// ============================================
// 3D Rotating Neuron Mesh Structure
// ============================================
const typesCanvas = document.getElementById('typesCanvas');
const tctx = typesCanvas.getContext('2d');
typesCanvas.width = 600;
typesCanvas.height = 500;

const centerX = typesCanvas.width / 2;
const centerY = typesCanvas.height / 2;

// Create 3D sphere points for neuron body
const neuronPoints = [];
const numPoints = 50;
const sphereRadius = 80;

for (let i = 0; i < numPoints; i++) {
    const theta = Math.acos(2 * Math.random() - 1);
    const phi = Math.random() * Math.PI * 2;
    
    neuronPoints.push({
        x: sphereRadius * Math.sin(theta) * Math.cos(phi),
        y: sphereRadius * Math.sin(theta) * Math.sin(phi),
        z: sphereRadius * Math.cos(theta)
    });
}

// Create dendrite branches
const dendrites = [];
const numDendrites = 8;

for (let i = 0; i < numDendrites; i++) {
    const angle = (i / numDendrites) * Math.PI * 2;
    const branch = [];
    const segments = 5;
    
    for (let j = 0; j < segments; j++) {
        const distance = sphereRadius + j * 30;
        const spread = j * 15;
        branch.push({
            x: Math.cos(angle) * distance + (Math.random() - 0.5) * spread,
            y: Math.sin(angle) * distance + (Math.random() - 0.5) * spread,
            z: (Math.random() - 0.5) * spread
        });
    }
    dendrites.push(branch);
}

let rotationX = 0;
let rotationY = 0;

// Rotation function
function rotate3D(point, angleX, angleY) {
    // Rotate around X axis
    let y = point.y * Math.cos(angleX) - point.z * Math.sin(angleX);
    let z = point.y * Math.sin(angleX) + point.z * Math.cos(angleX);
    
    // Rotate around Y axis
    let x = point.x * Math.cos(angleY) - z * Math.sin(angleY);
    z = point.x * Math.sin(angleY) + z * Math.cos(angleY);
    
    return { x, y, z };
}

// Project 3D to 2D
function project(point) {
    const scale = 200 / (200 + point.z);
    return {
        x: centerX + point.x * scale,
        y: centerY + point.y * scale,
        z: point.z
    };
}

function animateTypes() {
    tctx.clearRect(0, 0, typesCanvas.width, typesCanvas.height);
    
    rotationY += 0.008;
    rotationX += 0.005;
    
    // Rotate and project all points
    const projectedPoints = neuronPoints.map(p => {
        const rotated = rotate3D(p, rotationX, rotationY);
        return project(rotated);
    });
    
    // Draw connections between nearby points
    tctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    tctx.lineWidth = 1;
    
    for (let i = 0; i < projectedPoints.length; i++) {
        for (let j = i + 1; j < projectedPoints.length; j++) {
            const dx = neuronPoints[i].x - neuronPoints[j].x;
            const dy = neuronPoints[i].y - neuronPoints[j].y;
            const dz = neuronPoints[i].z - neuronPoints[j].z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance < sphereRadius * 1.2) {
                const opacity = 0.3 * (1 - distance / (sphereRadius * 1.2));
                tctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
                tctx.beginPath();
                tctx.moveTo(projectedPoints[i].x, projectedPoints[i].y);
                tctx.lineTo(projectedPoints[j].x, projectedPoints[j].y);
                tctx.stroke();
            }
        }
    }
    
    // Draw dendrites
    dendrites.forEach(branch => {
        const projectedBranch = branch.map(p => {
            const rotated = rotate3D(p, rotationX, rotationY);
            return project(rotated);
        });
        
        tctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
        tctx.lineWidth = 2;
        tctx.beginPath();
        tctx.moveTo(projectedBranch[0].x, projectedBranch[0].y);
        
        for (let i = 1; i < projectedBranch.length; i++) {
            tctx.lineTo(projectedBranch[i].x, projectedBranch[i].y);
        }
        tctx.stroke();
        
        const lastPoint = projectedBranch[projectedBranch.length - 1];
        tctx.beginPath();
        tctx.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2);
        tctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        tctx.fill();
    });
    
    // Draw points
    projectedPoints.forEach(point => {
        tctx.beginPath();
        tctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        tctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
        tctx.fill();
    });
    
    // Draw nucleus
    const nucleusSize = 15;
    const gradient = tctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, nucleusSize);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
    gradient.addColorStop(1, 'rgba(118, 75, 162, 0.4)');
    
    tctx.beginPath();
    tctx.arc(centerX, centerY, nucleusSize, 0, Math.PI * 2);
    tctx.fillStyle = gradient;
    tctx.shadowBlur = 20;
    tctx.shadowColor = 'rgba(102, 126, 234, 0.6)';
    tctx.fill();
    
    requestAnimationFrame(animateTypes);
}

animateTypes();

// ============================================
// Processor/Chip Visualization with subtle animation
// ============================================
const applicationsCanvas = document.getElementById('applicationsCanvas');
const actx = applicationsCanvas.getContext('2d');
applicationsCanvas.width = 600;
applicationsCanvas.height = 500;

const chipCenterX = applicationsCanvas.width / 2;
const chipCenterY = applicationsCanvas.height / 2;

// Chip structure
const chipSize = 200;
const gridLines = 8;
let pulsePhase = 0;

// Create circuit paths
const circuitPaths = [];
for (let i = 0; i < 20; i++) {
    const startX = chipCenterX - chipSize / 2 + Math.random() * chipSize;
    const startY = chipCenterY - chipSize / 2 + Math.random() * chipSize;
    const length = 30 + Math.random() * 50;
    const angle = Math.random() < 0.5 ? 0 : Math.PI / 2;
    
    circuitPaths.push({
        x: startX,
        y: startY,
        length: length,
        angle: angle,
        phase: Math.random() * Math.PI * 2
    });
}

// Data flow particles on chip
class ChipParticle {
    constructor() {
        this.reset();
    }
    
    reset() {
        const path = circuitPaths[Math.floor(Math.random() * circuitPaths.length)];
        this.x = path.x;
        this.y = path.y;
        this.targetX = path.x + Math.cos(path.angle) * path.length;
        this.targetY = path.y + Math.sin(path.angle) * path.length;
        this.progress = 0;
        this.speed = 0.01 + Math.random() * 0.01;
    }
    
    update() {
        this.progress += this.speed;
        if (this.progress > 1) {
            this.reset();
        }
    }
    
    draw() {
        const x = this.x + (this.targetX - this.x) * this.progress;
        const y = this.y + (this.targetY - this.y) * this.progress;
        
        actx.beginPath();
        actx.arc(x, y, 2, 0, Math.PI * 2);
        actx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        actx.fill();
        actx.shadowBlur = 5;
        actx.shadowColor = 'rgba(102, 126, 234, 0.6)';
    }
}

const chipParticles = [];
for (let i = 0; i < 15; i++) {
    chipParticles.push(new ChipParticle());
}

function animateApplications() {
    actx.clearRect(0, 0, applicationsCanvas.width, applicationsCanvas.height);
    
    pulsePhase += 0.02;
    const pulse = Math.sin(pulsePhase) * 0.3 + 0.7;
    
    // Draw chip outline
    actx.strokeStyle = `rgba(102, 126, 234, ${0.4 * pulse})`;
    actx.lineWidth = 2;
    actx.strokeRect(
        chipCenterX - chipSize / 2,
        chipCenterY - chipSize / 2,
        chipSize,
        chipSize
    );
    
    // Draw corner pins
    const pinSize = 15;
    const corners = [
        { x: chipCenterX - chipSize / 2, y: chipCenterY - chipSize / 2 },
        { x: chipCenterX + chipSize / 2, y: chipCenterY - chipSize / 2 },
        { x: chipCenterX - chipSize / 2, y: chipCenterY + chipSize / 2 },
        { x: chipCenterX + chipSize / 2, y: chipCenterY + chipSize / 2 }
    ];
    
    corners.forEach(corner => {
        actx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
        actx.lineWidth = 2;
        actx.strokeRect(corner.x - pinSize / 2, corner.y - pinSize / 2, pinSize, pinSize);
    });
    
    // Draw grid lines
    actx.strokeStyle = 'rgba(102, 126, 234, 0.2)';
    actx.lineWidth = 1;
    
    for (let i = 1; i < gridLines; i++) {
        const offset = (chipSize / gridLines) * i;
        // Vertical lines
        actx.beginPath();
        actx.moveTo(chipCenterX - chipSize / 2 + offset, chipCenterY - chipSize / 2);
        actx.lineTo(chipCenterX - chipSize / 2 + offset, chipCenterY + chipSize / 2);
        actx.stroke();
        
        // Horizontal lines
        actx.beginPath();
        actx.moveTo(chipCenterX - chipSize / 2, chipCenterY - chipSize / 2 + offset);
        actx.lineTo(chipCenterX + chipSize / 2, chipCenterY - chipSize / 2 + offset);
        actx.stroke();
    }
    
    // Draw circuit paths
    circuitPaths.forEach(path => {
        const pathPulse = Math.sin(pulsePhase + path.phase) * 0.3 + 0.5;
        actx.strokeStyle = `rgba(102, 126, 234, ${0.3 * pathPulse})`;
        actx.lineWidth = 2;
        actx.beginPath();
        actx.moveTo(path.x, path.y);
        actx.lineTo(
            path.x + Math.cos(path.angle) * path.length,
            path.y + Math.sin(path.angle) * path.length
        );
        actx.stroke();
        
        // Draw connection points
        actx.beginPath();
        actx.arc(path.x, path.y, 3, 0, Math.PI * 2);
        actx.fillStyle = `rgba(102, 126, 234, ${0.5 * pathPulse})`;
        actx.fill();
    });
    
    // Draw center core with pulse
    const coreSize = 40;
    actx.strokeStyle = `rgba(102, 126, 234, ${0.6 * pulse})`;
    actx.lineWidth = 2;
    actx.strokeRect(
        chipCenterX - coreSize / 2,
        chipCenterY - coreSize / 2,
        coreSize,
        coreSize
    );
    
    const gradient = actx.createRadialGradient(chipCenterX, chipCenterY, 0, chipCenterX, chipCenterY, coreSize / 2);
    gradient.addColorStop(0, `rgba(102, 126, 234, ${0.3 * pulse})`);
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
    actx.fillStyle = gradient;
    actx.fillRect(
        chipCenterX - coreSize / 2,
        chipCenterY - coreSize / 2,
        coreSize,
        coreSize
    );
    
    // Update and draw particles
    chipParticles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    requestAnimationFrame(animateApplications);
}

animateApplications();

// ============================================
// Wireframe Earth Globe
// ============================================
const futureCanvas = document.getElementById('futureCanvas');
const fctx = futureCanvas.getContext('2d');
futureCanvas.width = 600;
futureCanvas.height = 500;

const globeCenterX = futureCanvas.width / 2;
const globeCenterY = futureCanvas.height / 2;
const globeRadius = 120;

// Create latitude and longitude lines
const latitudes = [];
const longitudes = [];
const numLat = 9;
const numLong = 12;

// Generate latitude circles
for (let i = 0; i < numLat; i++) {
    const lat = (i / (numLat - 1)) * Math.PI - Math.PI / 2;
    latitudes.push(lat);
}

// Generate longitude lines
for (let i = 0; i < numLong; i++) {
    const long = (i / numLong) * Math.PI * 2;
    longitudes.push(long);
}

let globeRotation = 0;

function animateFuture() {
    fctx.clearRect(0, 0, futureCanvas.width, futureCanvas.height);
    
    globeRotation += 0.005;
    
    // Draw longitude lines (vertical)
    longitudes.forEach(long => {
        fctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
        fctx.lineWidth = 1;
        fctx.beginPath();
        
        let firstPoint = true;
        for (let lat = -Math.PI / 2; lat <= Math.PI / 2; lat += 0.1) {
            const x3d = globeRadius * Math.cos(lat) * Math.cos(long + globeRotation);
            const y3d = globeRadius * Math.sin(lat);
            const z3d = globeRadius * Math.cos(lat) * Math.sin(long + globeRotation);
            
            // Only draw front-facing lines
            if (z3d > -globeRadius * 0.3) {
                const scale = 200 / (200 + z3d);
                const x2d = globeCenterX + x3d * scale;
                const y2d = globeCenterY + y3d * scale;
                
                if (firstPoint) {
                    fctx.moveTo(x2d, y2d);
                    firstPoint = false;
                } else {
                    fctx.lineTo(x2d, y2d);
                }
            }
        }
        fctx.stroke();
    });
    
    // Draw latitude lines (horizontal)
    latitudes.forEach(lat => {
        fctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
        fctx.lineWidth = 1;
        fctx.beginPath();
        
        let firstPoint = true;
        for (let long = 0; long <= Math.PI * 2; long += 0.1) {
            const x3d = globeRadius * Math.cos(lat) * Math.cos(long + globeRotation);
            const y3d = globeRadius * Math.sin(lat);
            const z3d = globeRadius * Math.cos(lat) * Math.sin(long + globeRotation);
            
            // Only draw front-facing lines
            if (z3d > -globeRadius * 0.3) {
                const scale = 200 / (200 + z3d);
                const x2d = globeCenterX + x3d * scale;
                const y2d = globeCenterY + y3d * scale;
                
                if (firstPoint) {
                    fctx.moveTo(x2d, y2d);
                    firstPoint = false;
                } else {
                    fctx.lineTo(x2d, y2d);
                }
            }
        }
        fctx.stroke();
    });
    
    // Draw equator line brighter
    fctx.strokeStyle = 'rgba(102, 126, 234, 0.6)';
    fctx.lineWidth = 2;
    fctx.beginPath();
    let firstPoint = true;
    for (let long = 0; long <= Math.PI * 2; long += 0.05) {
        const x3d = globeRadius * Math.cos(long + globeRotation);
        const y3d = 0;
        const z3d = globeRadius * Math.sin(long + globeRotation);
        
        if (z3d > -globeRadius * 0.3) {
            const scale = 200 / (200 + z3d);
            const x2d = globeCenterX + x3d * scale;
            const y2d = globeCenterY + y3d * scale;
            
            if (firstPoint) {
                fctx.moveTo(x2d, y2d);
                firstPoint = false;
            } else {
                fctx.lineTo(x2d, y2d);
            }
        }
    }
    fctx.stroke();
    
    // Draw connection points at intersections
    latitudes.forEach(lat => {
        longitudes.forEach(long => {
            const x3d = globeRadius * Math.cos(lat) * Math.cos(long + globeRotation);
            const y3d = globeRadius * Math.sin(lat);
            const z3d = globeRadius * Math.cos(lat) * Math.sin(long + globeRotation);
            
            if (z3d > 0) {
                const scale = 200 / (200 + z3d);
                const x2d = globeCenterX + x3d * scale;
                const y2d = globeCenterY + y3d * scale;
                
                fctx.beginPath();
                fctx.arc(x2d, y2d, 2, 0, Math.PI * 2);
                fctx.fillStyle = 'rgba(102, 126, 234, 0.6)';
                fctx.fill();
            }
        });
    });
    
    requestAnimationFrame(animateFuture);
}

animateFuture();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});