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
