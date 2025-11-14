import React, { useEffect, useRef } from 'react';
import { GraphData } from '../types';
import { CloseIcon } from './Icons';

// This is needed to find the global `vis` object from the CDN script.
declare const vis: any;

interface GraphModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: GraphData | null;
}

export const GraphModal: React.FC<GraphModalProps> = ({ isOpen, onClose, data }) => {
    const graphContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && data && graphContainerRef.current) {
            // Check if vis is loaded
            if (typeof vis === 'undefined') {
                console.error("vis-network library is not loaded.");
                return;
            }

            const container = graphContainerRef.current;
            const options = {
                nodes: {
                    shape: 'dot',
                    size: 20,
                    font: {
                        size: 14,
                        color: '#ffffff'
                    },
                    borderWidth: 2,
                    color: {
                      background: '#4f46e5', // indigo-600
                      border: '#6366f1', // indigo-500
                      highlight: {
                        background: '#818cf8', // indigo-400
                        border: '#6366f1'
                      }
                    }
                },
                edges: {
                    width: 2,
                    color: '#9ca3af', // gray-400
                    arrows: {
                      to: { enabled: true, scaleFactor: 0.7 }
                    },
                    font: {
                      align: 'middle',
                      size: 10,
                      color: '#d1d5db' // gray-300
                    }
                },
                physics: {
                    enabled: true,
                    solver: 'forceAtlas2Based',
                    forceAtlas2Based: {
                      gravitationalConstant: -50,
                      centralGravity: 0.01,
                      springLength: 100,
                      springConstant: 0.08,
                      avoidOverlap: 0.5
                    }
                },
                interaction: {
                    hover: true,
                    tooltipDelay: 200,
                    dragNodes: true,
                    dragView: true,
                    zoomView: true
                },
                layout: {
                    improvedLayout: false
                }
            };
            
            const network = new vis.Network(container, data, options);
            
            // Cleanup function
            return () => {
                if (network) {
                    network.destroy();
                }
            };
        }
    }, [isOpen, data]);

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="relative w-full h-full bg-gray-900 rounded-lg shadow-2xl border border-gray-700"
                onClick={(e) => e.stopPropagation()} // Prevent closing modal on inner click
            >
                <div className="absolute top-3 left-3 text-lg font-bold text-white z-10 bg-gray-900/50 px-3 py-1 rounded">Граф знаний</div>
                <button 
                    onClick={onClose}
                    className="absolute top-2 right-2 p-2 text-gray-400 bg-gray-800 rounded-full hover:bg-gray-700 hover:text-white transition-colors z-10"
                    aria-label="Close graph view"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>
                <div ref={graphContainerRef} className="w-full h-full rounded-lg" />
            </div>
        </div>
    );
};