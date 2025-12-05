import React from 'react';
import { GenerationHistoryItem } from '../types';
import { Clock } from 'lucide-react';

interface HistoryProps {
  items: GenerationHistoryItem[];
  onSelect: (item: GenerationHistoryItem) => void;
}

export const History: React.FC<HistoryProps> = ({ items, onSelect }) => {
  if (items.length === 0) return null;

  return (
    <div className="w-full mt-12 border-t border-zinc-200 pt-8">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-zinc-400" />
        <h3 className="text-xl font-display font-bold text-zinc-800">Recent Creations</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group relative aspect-video bg-zinc-100 rounded-xl overflow-hidden cursor-pointer border-2 border-zinc-200 hover:border-jungle-500 hover:shadow-lg hover:shadow-jungle-500/20 transition-all duration-300 ease-out"
            onClick={() => onSelect(item)}
          >
            <img 
              src={item.imageUrl} 
              alt={item.text} 
              className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <p className="text-white font-bold truncate text-sm">{item.text}</p>
              <p className="text-xs text-jungle-300 truncate font-mono">{item.styleName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};