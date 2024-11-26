const AudioVisualizer = () => {
    const [audioContext, setAudioContext] = React.useState(null);
    const [analyser, setAnalyser] = React.useState(null);
    const spectrumCanvasRef = React.useRef(null);
    const oscilloscopeCanvasRef = React.useRef(null);
    
    React.useEffect(() => {
        const initAudio = async () => {
            try {
                const context = new (window.AudioContext || window.webkitAudioContext)();
                const analyserNode = context.createAnalyser();
                analyserNode.fftSize = 2048;
                
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const source = context.createMediaStreamSource(stream);
                source.connect(analyserNode);
                
                setAudioContext(context);
                setAnalyser(analyserNode);
                
                drawVisualizer();
            } catch (error) {
                console.error('Error initializing audio:', error);
            }
        };
        
        initAudio();
    }, []);
    
    const drawVisualizer = () => {
        if (!analyser) return;
        
        // Spectrum Analyzer
        const spectrumCanvas = spectrumCanvasRef.current;
        const spectrumCtx = spectrumCanvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Oscilloscope
        const oscilloscopeCanvas = oscilloscopeCanvasRef.current;
        const oscilloscopeCtx = oscilloscopeCanvas.getContext('2d');
        const timeDataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
            requestAnimationFrame(draw);
            
            // Draw Spectrum Analyzer
            analyser.getByteFrequencyData(dataArray);
            spectrumCtx.fillStyle = '#001100';
            spectrumCtx.fillRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);
            
            const barWidth = (spectrumCanvas.width / bufferLength) * 2.5;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] / 2;
                spectrumCtx.fillStyle = `rgb(0, ${100 + barHeight}, 0)`;
                spectrumCtx.fillRect(x, spectrumCanvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
            
            // Draw Oscilloscope
            analyser.getByteTimeDomainData(timeDataArray);
            oscilloscopeCtx.fillStyle = '#001100';
            oscilloscopeCtx.fillRect(0, 0, oscilloscopeCanvas.width, oscilloscopeCanvas.height);
            oscilloscopeCtx.lineWidth = 2;
            oscilloscopeCtx.strokeStyle = '#0f0';
            oscilloscopeCtx.beginPath();
            
            const sliceWidth = oscilloscopeCanvas.width / bufferLength;
            x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const v = timeDataArray[i] / 128.0;
                const y = v * oscilloscopeCanvas.height / 2;
                
                if (i === 0) {
                    oscilloscopeCtx.moveTo(x, y);
                } else {
                    oscilloscopeCtx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            
            oscilloscopeCtx.lineTo(oscilloscopeCanvas.width, oscilloscopeCanvas.height / 2);
            oscilloscopeCtx.stroke();
        };
        
        draw();
    };
    
    return (
        <div id="visualizer-container">
            <h1 style={{textAlign: 'center', textShadow: '0 0 10px #0f0'}}>90s Audio Visualizer</h1>
            <div className="retro-box">
                <h2>Spectrum Analyzer</h2>
                <canvas 
                    ref={spectrumCanvasRef} 
                    width={800} 
                    height={200}
                />
            </div>
            <div className="retro-box">
                <h2>Oscilloscope</h2>
                <canvas 
                    ref={oscilloscopeCanvasRef} 
                    width={800} 
                    height={200}
                />
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AudioVisualizer />);
