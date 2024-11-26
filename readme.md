# 90s Style Audio Visualizer

A retro-style web application that visualizes audio input from your system (specifically designed for VoiceMeeter B1) using modern web technologies. The visualizer features two main components:
- Spectrum Analyzer: Shows the frequency distribution of the audio input
- Oscilloscope: Displays the waveform of the audio input in real-time

## Features
- Real-time audio visualization
- Retro 90s aesthetic with green-on-black terminal style
- Support for system audio input (VoiceMeeter B1)
- Responsive canvas-based visualizations

## Setup Instructions

1. Make sure you have VoiceMeeter installed and B1 output configured
2. Clone this repository
3. Open index.html in a modern web browser (Chrome recommended)
4. When prompted, select your VoiceMeeter B1 output as the audio input source
5. Allow microphone access when prompted (this is used to capture the system audio)

## Technical Details
- Built with React 18
- Uses Web Audio API for audio processing
- Canvas API for rendering visualizations
- No build process required - runs directly in the browser

## Browser Support
- Chrome (recommended)
- Firefox
- Edge
- Safari (limited support)

## Notes
- For best results, ensure your system audio is properly routed through VoiceMeeter
- The visualization may require adjusting your system's audio levels for optimal display
