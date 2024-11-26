const AudioVisualizer = () => {
    const [audioContext, setAudioContext] = React.useState(null);
    const [analyser, setAnalyser] = React.useState(null);
    const [audioInputs, setAudioInputs] = React.useState([]);
    const [selectedInput, setSelectedInput] = React.useState('default');
    const spectrumCanvasRef = React.useRef(null);
    const oscilloscopeCanvasRef = React.useRef(null);

    const getAudioInputs = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const inputs = devices.filter(device => device.kind === 'audioinput');
            setAudioInputs(inputs);
        } catch (error) {
            console.error('Error getting audio inputs:', error);
        }
    };
    
    React.useEffect(() => {
        getAudioInputs();
        
        return () => {
            if (audioContext) {
                audioContext.close();
            }
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const [currentStream, setCurrentStream] = React.useState(null);

    React.useEffect(() => {
        const initAudio = async () => {
            try {
                if (audioContext) {
                    audioContext.close();
                }
                if (currentStream) {
                    currentStream.getTracks().forEach(track => track.stop());
                }
                
                const context = new (window.AudioContext || window.webkitAudioContext)();
                const analyserNode = context.createAnalyser();
                analyserNode.fftSize = 2048;
                
                const constraints = {
                    audio: {
                        deviceId: selectedInput !== 'default' ? {exact: selectedInput} : undefined
                    }
                };
                
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                const source = context.createMediaStreamSource(stream);
                source.connect(analyserNode);
                
                setCurrentStream(stream);
                setAudioContext(context);
                setAnalyser(analyserNode);
                
                drawVisualizer();
            } catch (error) {
                console.error('Error initializing audio:', error);
            }
        };
        
        initAudio();
    }, [selectedInput]);
    
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
                <div style={{marginBottom: '20px', textAlign: 'center'}}>
                    <label htmlFor="audioInput" style={{marginRight: '10px'}}>Audio Input: </label>
                    <select 
                        id="audioInput"
                        value={selectedInput}
                        onChange={(e) => setSelectedInput(e.target.value)}
                        style={{
                            background: '#001100',
                            color: '#0f0',
                            border: '1px solid #0f0',
                            padding: '5px',
                            fontFamily: 'Courier New, monospace'
                        }}
                    >
                        <option value="default">Default Input</option>
                        {audioInputs.map((input) => (
                            <option key={input.deviceId} value={input.deviceId}>
                                {input.label || `Input ${input.deviceId}`}
                            </option>
                        ))}
                    </select>
                </div>
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
