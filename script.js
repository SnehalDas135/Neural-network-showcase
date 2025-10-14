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
            neuronViz.innerHTML = '';
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

const nodePositions = [];

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
    
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
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
// Biological Neuron Cell (like image 2)
// ============================================
const typesCanvas = document.getElementById('typesCanvas');
const tctx = typesCanvas.getContext('2d');
typesCanvas.width = 600;
typesCanvas.height = 500;

const neuronCenterX = typesCanvas.width / 2;
const neuronCenterY = typesCanvas.height / 2;

// Create organic dendrite branches
class DendriteBranch {
    constructor(startAngle, length, thickness) {
        this.segments = [];
        let x = 0;
        let y = 0;
        let angle = startAngle;
        
        for (let i = 0; i < length; i++) {
            angle += (Math.random() - 0.5) * 0.3;
            x += Math.cos(angle) * 8;
            y += Math.sin(angle) * 8;
            this.segments.push({ x, y, thickness: thickness * (1 - i / length) });
        }
    }
}

const mainDendrites = [];
const numMainDendrites = 6;

for (let i = 0; i < numMainDendrites; i++) {
    const angle = (i / numMainDendrites) * Math.PI * 2;
    mainDendrites.push({
        branch: new DendriteBranch(angle, 15, 4),
        subBranches: []
    });
    
    // Add sub-branches
    for (let j = 0; j < 3; j++) {
        const subAngle = angle + (Math.random() - 0.5) * 0.8;
        mainDendrites[i].subBranches.push(
            new DendriteBranch(subAngle, 8, 2)
        );
    }
}

// Axon (long extension)
const axon = new DendriteBranch(Math.PI * 0.3, 25, 5);

let neuronRotation = 0;

function animateTypes() {
    tctx.clearRect(0, 0, typesCanvas.width, typesCanvas.height);
    
    neuronRotation += 0.003;
    
    tctx.save();
    tctx.translate(neuronCenterX, neuronCenterY);
    tctx.rotate(neuronRotation);
    
    // Draw axon (the long branch)
    tctx.strokeStyle = 'rgba(102, 126, 234, 0.6)';
    tctx.lineWidth = 4;
    tctx.lineCap = 'round';
    tctx.beginPath();
    tctx.moveTo(0, 0);
    axon.segments.forEach((seg, i) => {
        if (i === 0) {
            tctx.moveTo(seg.x, seg.y);
        } else {
            tctx.lineTo(seg.x, seg.y);
            tctx.lineWidth = seg.thickness;
        }
    });
    tctx.stroke();
    
    // Draw axon terminals
    const lastSeg = axon.segments[axon.segments.length - 1];
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const termX = lastSeg.x + Math.cos(angle) * 15;
        const termY = lastSeg.y + Math.sin(angle) * 15;
        
        tctx.beginPath();
        tctx.moveTo(lastSeg.x, lastSeg.y);
        tctx.lineTo(termX, termY);
        tctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
        tctx.lineWidth = 2;
        tctx.stroke();
        
        tctx.beginPath();
        tctx.arc(termX, termY, 3, 0, Math.PI * 2);
        tctx.fillStyle = 'rgba(102, 126, 234, 0.8)';
        tctx.fill();
    }
    
    // Draw dendrites
    mainDendrites.forEach(dendrite => {
        // Main branch
        tctx.strokeStyle = 'rgba(102, 126, 234, 0.6)';
        tctx.lineWidth = 4;
        tctx.beginPath();
        dendrite.branch.segments.forEach((seg, i) => {
            if (i === 0) {
                tctx.moveTo(seg.x, seg.y);
            } else {
                tctx.lineTo(seg.x, seg.y);
                tctx.lineWidth = seg.thickness;
            }
        });
        tctx.stroke();
        
        // Sub-branches
        dendrite.subBranches.forEach(subBranch => {
            tctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
            tctx.lineWidth = 2;
            tctx.beginPath();
            subBranch.segments.forEach((seg, i) => {
                if (i === 0) {
                    tctx.moveTo(seg.x, seg.y);
                } else {
                    tctx.lineTo(seg.x, seg.y);
                    tctx.lineWidth = seg.thickness;
                }
            });
            tctx.stroke();
        });
    });
    
    // Draw cell body (soma) with glow
    const gradient = tctx.createRadialGradient(0, 0, 0, 0, 0, 30);
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.9)');
    gradient.addColorStop(0.5, 'rgba(102, 126, 234, 0.6)');
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0.2)');
    
    tctx.beginPath();
    tctx.arc(0, 0, 25, 0, Math.PI * 2);
    tctx.fillStyle = gradient;
    tctx.shadowBlur = 30;
    tctx.shadowColor = 'rgba(102, 126, 234, 0.8)';
    tctx.fill();
    
    // Draw nucleus
    tctx.beginPath();
    tctx.arc(0, 0, 12, 0, Math.PI * 2);
    tctx.fillStyle = 'rgba(150, 180, 255, 0.5)';
    tctx.fill();
    
    tctx.restore();
    
    requestAnimationFrame(animateTypes);
}

animateTypes();

// ============================================
// Microchip/Processor (like image 3)
// ============================================
const applicationsCanvas = document.getElementById('applicationsCanvas');
const actx = applicationsCanvas.getContext('2d');
applicationsCanvas.width = 600;
applicationsCanvas.height = 500;

const chipCenterX = applicationsCanvas.width / 2;
const chipCenterY = applicationsCanvas.height / 2;
const chipSize = 180;
const pinLength = 25;
const pinWidth = 8;
const pinsPerSide = 6;

let chipPulse = 0;

function animateApplications() {
    actx.clearRect(0, 0, applicationsCanvas.width, applicationsCanvas.height);
    
    chipPulse += 0.03;
    const pulse = Math.sin(chipPulse) * 0.3 + 0.7;
    
    // Draw pins on all 4 sides
    actx.fillStyle = `rgba(102, 126, 234, ${0.7 * pulse})`;
    actx.strokeStyle = `rgba(102, 126, 234, ${0.8 * pulse})`;
    actx.lineWidth = 1;
    
    // Top pins
    for (let i = 0; i < pinsPerSide; i++) {
        const x = chipCenterX - (chipSize / 2) + (chipSize / (pinsPerSide + 1)) * (i + 1);
        const y = chipCenterY - chipSize / 2;
        
        actx.fillRect(x - pinWidth / 2, y - pinLength, pinWidth, pinLength);
        actx.strokeRect(x - pinWidth / 2, y - pinLength, pinWidth, pinLength);
    }
    
    // Bottom pins
    for (let i = 0; i < pinsPerSide; i++) {
        const x = chipCenterX - (chipSize / 2) + (chipSize / (pinsPerSide + 1)) * (i + 1);
        const y = chipCenterY + chipSize / 2;
        
        actx.fillRect(x - pinWidth / 2, y, pinWidth, pinLength);
        actx.strokeRect(x - pinWidth / 2, y, pinWidth, pinLength);
    }
    
    // Left pins
    for (let i = 0; i < pinsPerSide; i++) {
        const x = chipCenterX - chipSize / 2;
        const y = chipCenterY - (chipSize / 2) + (chipSize / (pinsPerSide + 1)) * (i + 1);
        
        actx.fillRect(x - pinLength, y - pinWidth / 2, pinLength, pinWidth);
        actx.strokeRect(x - pinLength, y - pinWidth / 2, pinLength, pinWidth);
    }
    
    // Right pins
    for (let i = 0; i < pinsPerSide; i++) {
        const x = chipCenterX + chipSize / 2;
        const y = chipCenterY - (chipSize / 2) + (chipSize / (pinsPerSide + 1)) * (i + 1);
        
        actx.fillRect(x, y - pinWidth / 2, pinLength, pinWidth);
        actx.strokeRect(x, y - pinWidth / 2, pinLength, pinWidth);
    }
    
    // Draw main chip body with rounded corners
    const cornerRadius = 10;
    actx.strokeStyle = `rgba(102, 126, 234, ${0.8 * pulse})`;
    actx.lineWidth = 3;
    actx.beginPath();
    actx.moveTo(chipCenterX - chipSize / 2 + cornerRadius, chipCenterY - chipSize / 2);
    actx.lineTo(chipCenterX + chipSize / 2 - cornerRadius, chipCenterY - chipSize / 2);
    actx.arcTo(chipCenterX + chipSize / 2, chipCenterY - chipSize / 2, chipCenterX + chipSize / 2, chipCenterY - chipSize / 2 + cornerRadius, cornerRadius);
    actx.lineTo(chipCenterX + chipSize / 2, chipCenterY + chipSize / 2 - cornerRadius);
    actx.arcTo(chipCenterX + chipSize / 2, chipCenterY + chipSize / 2, chipCenterX + chipSize / 2 - cornerRadius, chipCenterY + chipSize / 2, cornerRadius);
    actx.lineTo(chipCenterX - chipSize / 2 + cornerRadius, chipCenterY + chipSize / 2);
    actx.arcTo(chipCenterX - chipSize / 2, chipCenterY + chipSize / 2, chipCenterX - chipSize / 2, chipCenterY + chipSize / 2 - cornerRadius, cornerRadius);
    actx.lineTo(chipCenterX - chipSize / 2, chipCenterY - chipSize / 2 + cornerRadius);
    actx.arcTo(chipCenterX - chipSize / 2, chipCenterY - chipSize / 2, chipCenterX - chipSize / 2 + cornerRadius, chipCenterY - chipSize / 2, cornerRadius);
    actx.closePath();
    actx.stroke();
    
    // Fill with gradient
    const chipGradient = actx.createRadialGradient(chipCenterX, chipCenterY, 0, chipCenterX, chipCenterY, chipSize / 2);
    chipGradient.addColorStop(0, `rgba(102, 126, 234, ${0.3 * pulse})`);
    chipGradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');
    actx.fillStyle = chipGradient;
    actx.fill();
    
    // Draw circuit pattern inside
    const circuitSize = chipSize - 40;
    const gridSize = 8;
    
    actx.strokeStyle = `rgba(102, 126, 234, ${0.3 * pulse})`;
    actx.lineWidth = 1;
    
    // Draw grid pattern
    for (let i = 1; i < gridSize; i++) {
        const offset = (circuitSize / gridSize) * i;
        
        // Vertical lines
        actx.beginPath();
        actx.moveTo(chipCenterX - circuitSize / 2 + offset, chipCenterY - circuitSize / 2);
        actx.lineTo(chipCenterX - circuitSize / 2 + offset, chipCenterY + circuitSize / 2);
        actx.stroke();
        
        // Horizontal lines
        actx.beginPath();
        actx.moveTo(chipCenterX - circuitSize / 2, chipCenterY - circuitSize / 2 + offset);
        actx.lineTo(chipCenterX + circuitSize / 2, chipCenterY - circuitSize / 2 + offset);
        actx.stroke();
    }
    
    // Draw center core
    const coreSize = 60;
    actx.strokeStyle = `rgba(102, 126, 234, ${0.7 * pulse})`;
    actx.lineWidth = 2;
    actx.strokeRect(
        chipCenterX - coreSize / 2,
        chipCenterY - coreSize / 2,
        coreSize,
        coreSize
    );
    
    // Core glow
    const coreGradient = actx.createRadialGradient(chipCenterX, chipCenterY, 0, chipCenterX, chipCenterY, coreSize / 2);
    coreGradient.addColorStop(0, `rgba(102, 126, 234, ${0.5 * pulse})`);
    coreGradient.addColorStop(1, 'rgba(102, 126, 234, 0.1)');
    actx.fillStyle = coreGradient;
    actx.fillRect(
        chipCenterX - coreSize / 2,
        chipCenterY - coreSize / 2,
        coreSize,
        coreSize
    );
    
    // Add small circuit nodes
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + chipPulse * 0.5;
        const radius = 50;
        const x = chipCenterX + Math.cos(angle) * radius;
        const y = chipCenterY + Math.sin(angle) * radius;
        
        actx.beginPath();
        actx.arc(x, y, 2, 0, Math.PI * 2);
        actx.fillStyle = `rgba(102, 126, 234, ${0.8 * pulse})`;
        actx.fill();
    }
    
    requestAnimationFrame(animateApplications);
}

animateApplications();

// ============================================
// Wireframe Globe (like image 1)
// ============================================
const futureCanvas = document.getElementById('futureCanvas');
const fctx = futureCanvas.getContext('2d');
futureCanvas.width = 600;
futureCanvas.height = 500;

const globeCenterX = futureCanvas.width / 2;
const globeCenterY = futureCanvas.height / 2;
const globeRadius = 120;

let globeRotation = 0;

function animateFuture() {
    fctx.clearRect(0, 0, futureCanvas.width, futureCanvas.height);
    
    globeRotation += 0.005;
    
    // Draw outer glow
    const outerGlow = fctx.createRadialGradient(globeCenterX, globeCenterY, globeRadius * 0.8, globeCenterX, globeCenterY, globeRadius * 1.3);
    outerGlow.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
    outerGlow.addColorStop(1, 'rgba(102, 126, 234, 0)');
    fctx.fillStyle = outerGlow;
    fctx.beginPath();
    fctx.arc(globeCenterX, globeCenterY, globeRadius * 1.3, 0, Math.PI * 2);
    fctx.fill();
    
    // Draw latitude lines
    const numLatLines = 12;
    for (let i = 0; i < numLatLines; i++) {
        const lat = (i / numLatLines) * Math.PI - Math.PI / 2;
        
        fctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
        fctx.lineWidth = i === Math.floor(numLatLines / 2) ? 2 : 1; // Equator thicker
        fctx.beginPath();
        
        let firstPoint = true;
        for (let long = 0; long <= Math.PI * 2; long += 0.05) {
            const x3d = globeRadius * Math.cos(lat) * Math.cos(long + globeRotation);
            const y3d = globeRadius * Math.sin(lat);
            const z3d = globeRadius * Math.cos(lat) * Math.sin(long + globeRotation);
            
            if (z3d > -globeRadius * 0.5) {
                const scale = 250 / (250 + z3d);
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
    }
    
    // Draw longitude lines
    const numLongLines = 16;
    for (let i = 0; i < numLongLines; i++) {
        const long = (i / numLongLines) * Math.PI * 2;
        
        fctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
        fctx.lineWidth = 1;
        fctx.beginPath();
        
        let firstPoint = true;
        for (let lat = -Math.PI / 2; lat <= Math.PI / 2; lat += 0.05) {
            const x3d = globeRadius * Math.cos(lat) * Math.cos(long + globeRotation);
            const y3d = globeRadius * Math.sin(lat);
            const z3d = globeRadius * Math.cos(lat) * Math.sin(long + globeRotation);
            
            if (z3d > -globeRadius * 0.5) {
                const scale = 250 / (250 + z3d);
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
    }
    
    // Draw outer circle edge
    fctx.strokeStyle = 'rgba(102, 126, 234, 0.6)';
    fctx.lineWidth = 2;
    fctx.beginPath();
    fctx.arc(globeCenterX, globeCenterY, globeRadius, 0, Math.PI * 2);
    fctx.stroke();
    
    // Add glow effect
    fctx.shadowBlur = 20;
    fctx.shadowColor = 'rgba(102, 126, 234, 0.5)';
    fctx.stroke();
    fctx.shadowBlur = 0;
    
    requestAnimationFrame(animateFuture);
}

animateFuture();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ============================================
// Interactive 3D Brain Visualization
// ============================================
const brainCanvas = document.getElementById('interactiveBrain');
const bctx = brainCanvas.getContext('2d');

// Set explicit dimensions
brainCanvas.width = 1200;
brainCanvas.height = 700;

const brainCenterX = brainCanvas.width / 2;
const brainCenterY = brainCanvas.height / 2;

// Brain regions data
const brainRegions = {
    cerebrum: {
        name: 'Cerebrum - Memory',
        description: 'The largest part of the brain, responsible for memory, learning, thinking, and voluntary movements.',
        color: [255, 100, 100],
        vertices: []
    },
    cerebellum: {
        name: 'Cerebellum - Balance',
        description: 'Located at the back of the brain, it coordinates balance, posture, and fine motor movements.',
        color: [100, 255, 100],
        vertices: []
    },
    brainstem: {
        name: 'Brainstem - Breathing',
        description: 'Controls automatic functions vital for survival including breathing, heart rate, and blood pressure.',
        color: [100, 100, 255],
        vertices: []
    },
    limbic: {
        name: 'Limbic System - Emotions',
        description: 'The emotional center of the brain, processing feelings, memories, and behavioral responses.',
        color: [255, 100, 255],
        vertices: []
    },
    frontal: {
        name: 'Frontal Lobe - Thinking',
        description: 'Responsible for decision making, problem solving, planning, and personality.',
        color: [255, 200, 100],
        vertices: []
    },
    occipital: {
        name: 'Occipital Lobe - Vision',
        description: 'Processes visual information from the eyes and helps us interpret what we see.',
        color: [100, 255, 255],
        vertices: []
    },
    temporal: {
        name: 'Temporal Lobe - Hearing',
        description: 'Processes auditory information and plays a role in memory and speech.',
        color: [200, 100, 255],
        vertices: []
    }
};

// Create brain mesh structure that looks like the reference image
function createBrainMesh() {
    // Main cerebrum with pronounced gyri (ridges) and sulci (grooves)
    const cerebrumSegments = 100;
    const cerebrumRings = 50;
    
    for (let i = 0; i < cerebrumRings; i++) {
        for (let j = 0; j < cerebrumSegments; j++) {
            const u = j / cerebrumSegments;
            const v = i / cerebrumRings;
            
            // Create elongated brain shape
            const theta = u * Math.PI * 2;
            const phi = v * Math.PI * 0.7;
            
            // Base brain shape - elongated oval
            let r = 130 * Math.sin(phi);
            
            // Create realistic brain wrinkles (gyri and sulci)
            const longitudinalFolds = Math.sin(theta * 5 + phi * 2) * 10; // Vertical folds
            const lateralFolds = Math.sin(theta * 7 - phi * 3) * 8; // Horizontal folds
            const microFolds = Math.sin(theta * 15) * Math.cos(phi * 12) * 4; // Fine detail
            
            r += longitudinalFolds + lateralFolds + microFolds;
            
            // Make it brain-shaped (wider at back, narrower at front)
            const frontBackScale = 0.85 + Math.sin(theta) * 0.15;
            const sideScale = 1.0 + Math.cos(theta) * 0.1;
            
            const x = r * Math.cos(theta) * frontBackScale * 0.9;
            const y = -90 + 110 * Math.cos(phi);
            const z = r * Math.sin(theta) * sideScale;
            
            brainRegions.cerebrum.vertices.push({ x, y, z });
        }
    }
    
    // Frontal lobe - front bulging part with distinct folds
    const frontalSegments = 50;
    const frontalRings = 30;
    
    for (let i = 0; i < frontalRings; i++) {
        for (let j = 0; j < frontalSegments; j++) {
            const u = j / frontalSegments;
            const v = i / frontalRings;
            
            const theta = u * Math.PI * 1.4 - Math.PI * 0.7;
            const phi = v * Math.PI * 0.6;
            
            // Frontal lobe folds
            const folds = Math.sin(theta * 6) * Math.cos(phi * 5) * 6;
            const r = (105 + folds) * Math.sin(phi);
            
            const x = -115 + r * Math.cos(theta) * 0.6;
            const y = -65 + 95 * Math.cos(phi);
            const z = r * Math.sin(theta) * 0.9;
            
            brainRegions.frontal.vertices.push({ x, y, z });
        }
    }
    
    // Occipital lobe - back rounded part
    const occipitalSegments = 50;
    const occipitalRings = 30;
    
    for (let i = 0; i < occipitalRings; i++) {
        for (let j = 0; j < occipitalSegments; j++) {
            const u = j / occipitalSegments;
            const v = i / occipitalRings;
            
            const theta = u * Math.PI * 1.4 + Math.PI * 0.3;
            const phi = v * Math.PI * 0.58;
            
            const folds = Math.sin(theta * 5) * Math.cos(phi * 6) * 5;
            const r = (100 + folds) * Math.sin(phi);
            
            const x = 100 + r * Math.cos(theta) * 0.7;
            const y = -50 + 88 * Math.cos(phi);
            const z = r * Math.sin(theta);
            
            brainRegions.occipital.vertices.push({ x, y, z });
        }
    }
    
    // Temporal lobes - side parts with horizontal folds
    const temporalSegments = 40;
    const temporalRings = 25;
    
    // Left temporal
    for (let i = 0; i < temporalRings; i++) {
        for (let j = 0; j < temporalSegments; j++) {
            const u = j / temporalSegments;
            const v = i / temporalRings;
            
            const theta = u * Math.PI * 1.2 - Math.PI * 1.1;
            const phi = v * Math.PI * 0.52;
            
            const horizontalFolds = Math.sin(phi * 8) * 4; // Horizontal grooves
            const r = (85 + horizontalFolds) * Math.sin(phi);
            
            const x = -15 + r * Math.cos(theta) * 0.5;
            const y = 20 + 72 * Math.cos(phi);
            const z = -105 + r * Math.sin(theta);
            
            brainRegions.temporal.vertices.push({ x, y, z });
        }
    }
    
    // Right temporal
    for (let i = 0; i < temporalRings; i++) {
        for (let j = 0; j < temporalSegments; j++) {
            const u = j / temporalSegments;
            const v = i / temporalRings;
            
            const theta = u * Math.PI * 1.2 - Math.PI * 1.1;
            const phi = v * Math.PI * 0.52;
            
            const horizontalFolds = Math.sin(phi * 8) * 4;
            const r = (85 + horizontalFolds) * Math.sin(phi);
            
            const x = -15 + r * Math.cos(theta) * 0.5;
            const y = 20 + 72 * Math.cos(phi);
            const z = 105 + r * Math.sin(theta);
            
            brainRegions.temporal.vertices.push({ x, y, z });
        }
    }
    
    // Cerebellum - small tightly folded structure at back bottom
    const cerebellumSegments = 60;
    const cerebellumRings = 35;
    
    for (let i = 0; i < cerebellumRings; i++) {
        for (let j = 0; j < cerebellumSegments; j++) {
            const u = j / cerebellumSegments;
            const v = i / cerebellumRings;
            
            const theta = u * Math.PI * 2;
            const phi = v * Math.PI * 0.68;
            
            // Very tight parallel folds characteristic of cerebellum
            const tightFolds = Math.sin(theta * 20) * Math.cos(phi * 15) * 2;
            const r = (58 + tightFolds) * Math.sin(phi);
            
            const x = 95 + r * Math.cos(theta) * 0.85;
            const y = 55 + 58 * Math.cos(phi);
            const z = r * Math.sin(theta) * 0.9;
            
            brainRegions.cerebellum.vertices.push({ x, y, z });
        }
    }
    
    // Brainstem - smooth cylinder
    const brainstemSegments = 24;
    const brainstemHeight = 32;
    
    for (let i = 0; i < brainstemHeight; i++) {
        for (let j = 0; j < brainstemSegments; j++) {
            const theta = (j / brainstemSegments) * Math.PI * 2;
            const r = 21 - (i * 0.28);
            
            const x = r * Math.cos(theta) + 18;
            const y = 65 + i * 3.8;
            const z = r * Math.sin(theta);
            
            brainRegions.brainstem.vertices.push({ x, y, z });
        }
    }
    
    // Limbic system - curved inner structure
    const limbicSegments = 45;
    const limbicRings = 28;
    
    for (let i = 0; i < limbicRings; i++) {
        for (let j = 0; j < limbicSegments; j++) {
            const u = j / limbicSegments;
            const v = i / limbicRings;
            
            const t = u * Math.PI * 1.8 + Math.PI * 0.1;
            const phi = v * Math.PI * 0.62;
            
            const r = 45 * Math.sin(phi);
            const curveRadius = 38;
            
            const x = curveRadius * Math.cos(t) + r * Math.cos(t) * 0.25;
            const y = -2 + curveRadius * Math.sin(t) * 0.55 + 45 * Math.cos(phi);
            const z = r * Math.sin(phi) * 0.48;
            
            brainRegions.limbic.vertices.push({ x, y, z });
        }
    }
}

createBrainMesh();

let brainRotationX = -0.2;
let brainRotationY = 0;
let targetRotationX = -0.2;
let targetRotationY = 0;
let brainZoom = 1;
let targetZoom = 1;
let activeRegion = null;
let highlightIntensity = 0;

// Rotation and projection functions
function rotateBrain3D(point, angleX, angleY) {
    let y = point.y * Math.cos(angleX) - point.z * Math.sin(angleX);
    let z = point.y * Math.sin(angleX) + point.z * Math.cos(angleX);
    
    let x = point.x * Math.cos(angleY) - z * Math.sin(angleY);
    z = point.x * Math.sin(angleY) + z * Math.cos(angleY);
    
    return { x, y, z };
}

function projectBrain(point) {
    const scale = (300 / (300 + point.z)) * brainZoom;
    return {
        x: brainCenterX + point.x * scale,
        y: brainCenterY + point.y * scale,
        z: point.z
    };
}

function animateInteractiveBrain() {
    bctx.clearRect(0, 0, brainCanvas.width, brainCanvas.height);
    
    // Smooth rotation
    brainRotationY += (targetRotationY - brainRotationY) * 0.1;
    brainRotationX += (targetRotationX - brainRotationX) * 0.1;
    brainZoom += (targetZoom - brainZoom) * 0.1;
    
    if (activeRegion) {
        brainRotationY += 0.005;
        highlightIntensity = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
    } else {
        brainRotationY += 0.003;
        highlightIntensity = 0;
    }
    
    // Draw all brain regions with wireframe style
    Object.keys(brainRegions).forEach(regionKey => {
        const region = brainRegions[regionKey];
        const isActive = activeRegion === regionKey;
        
        const projectedVertices = region.vertices.map(v => {
            const rotated = rotateBrain3D(v, brainRotationX, brainRotationY);
            return projectBrain(rotated);
        });
        
        // Calculate segments and rings based on vertex count
        let segments, rings;
        if (regionKey === 'cerebrum') {
            segments = 100;
            rings = 50;
        } else if (regionKey === 'frontal' || regionKey === 'occipital') {
            segments = 50;
            rings = 30;
        } else if (regionKey === 'temporal') {
            segments = 40;
            rings = 25;
        } else if (regionKey === 'cerebellum') {
            segments = 60;
            rings = 35;
        } else if (regionKey === 'brainstem') {
            segments = 24;
            rings = 32;
        } else if (regionKey === 'limbic') {
            segments = 45;
            rings = 28;
        }
        
        const baseColor = region.color;
        const colorStr = isActive 
            ? `rgba(255, 80, 80, ${0.6 * (highlightIntensity + 0.3)})`
            : `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0.4)`;
        
        bctx.strokeStyle = colorStr;
        bctx.lineWidth = isActive ? 1.2 : 0.8;
        
        // Draw horizontal grid lines (latitude)
        for (let i = 0; i < rings; i++) {
            bctx.beginPath();
            let firstPoint = true;
            
            for (let j = 0; j <= segments; j++) {
                const idx = i * segments + (j % segments);
                if (idx < projectedVertices.length) {
                    const v = projectedVertices[idx];
                    
                    if (v.z > -200) {
                        if (firstPoint) {
                            bctx.moveTo(v.x, v.y);
                            firstPoint = false;
                        } else {
                            bctx.lineTo(v.x, v.y);
                        }
                    }
                }
            }
            bctx.stroke();
        }
        
        // Draw vertical grid lines (longitude)
        for (let j = 0; j < segments; j++) {
            bctx.beginPath();
            let firstPoint = true;
            
            for (let i = 0; i < rings; i++) {
                const idx = i * segments + j;
                if (idx < projectedVertices.length) {
                    const v = projectedVertices[idx];
                    
                    if (v.z > -200) {
                        if (firstPoint) {
                            bctx.moveTo(v.x, v.y);
                            firstPoint = false;
                        } else {
                            bctx.lineTo(v.x, v.y);
                        }
                    }
                }
            }
            bctx.stroke();
        }
        
        // Add glow effect for active region
        if (isActive) {
            bctx.shadowBlur = 15 * highlightIntensity;
            bctx.shadowColor = 'rgba(255, 50, 50, 0.8)';
            
            // Redraw with glow
            bctx.strokeStyle = `rgba(255, 100, 100, ${0.8 * highlightIntensity})`;
            bctx.lineWidth = 1.5;
            
            // Draw a few key lines with glow
            for (let i = 0; i < rings; i += 3) {
                bctx.beginPath();
                let firstPoint = true;
                
                for (let j = 0; j <= segments; j++) {
                    const idx = i * segments + (j % segments);
                    if (idx < projectedVertices.length) {
                        const v = projectedVertices[idx];
                        
                        if (v.z > -100) {
                            if (firstPoint) {
                                bctx.moveTo(v.x, v.y);
                                firstPoint = false;
                            } else {
                                bctx.lineTo(v.x, v.y);
                            }
                        }
                    }
                }
                bctx.stroke();
            }
            
            bctx.shadowBlur = 0;
        }
    });
    
    requestAnimationFrame(animateInteractiveBrain);
}

animateInteractiveBrain();

// Button interactions
const brainButtons = document.querySelectorAll('.brain-btn');
const resetBtn = document.getElementById('resetBrain');
const regionName = document.getElementById('regionName');
const regionDescription = document.getElementById('regionDescription');

brainButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const region = btn.dataset.region;
        
        // Remove active class from all buttons
        brainButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Set active region
        activeRegion = region;
        
        // Update info
        regionName.textContent = brainRegions[region].name;
        regionDescription.textContent = brainRegions[region].description;
        
        // Zoom and rotate to region
        targetZoom = 1.5;
        
        // Adjust rotation based on region
        switch(region) {
            case 'cerebrum':
                targetRotationX = -0.3;
                targetRotationY = 0.2;
                break;
            case 'cerebellum':
                targetRotationX = 0.2;
                targetRotationY = 2.5;
                break;
            case 'brainstem':
                targetRotationX = 0.5;
                targetRotationY = 3.14;
                break;
            case 'limbic':
                targetRotationX = 0;
                targetRotationY = 0;
                break;
            case 'frontal':
                targetRotationX = -0.2;
                targetRotationY = -0.5;
                break;
            case 'occipital':
                targetRotationX = -0.2;
                targetRotationY = 2.5;
                break;
            case 'temporal':
                targetRotationX = 0.1;
                targetRotationY = -1;
                break;
        }
    });
});

resetBtn.addEventListener('click', () => {
    brainButtons.forEach(b => b.classList.remove('active'));
    activeRegion = null;
    targetZoom = 1;
    targetRotationX = -0.2;
    targetRotationY = 0;
    
    regionName.textContent = 'Select a region';
    regionDescription.textContent = 'Click on any button to explore different parts of the brain';
});

window.addEventListener('resize', () => {
    brainCanvas.width = brainCanvas.offsetWidth;
    brainCanvas.height = brainCanvas.offsetHeight;
});
