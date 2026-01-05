
import React from 'react';
import { Vault, FileText, Lightbulb, Search, Filter, Trash2, ExternalLink, Bookmark, Clock, Tag } from 'lucide-react';

const MOCK_ASSETS = [
  { id: '1', title: '西門町發展建議書', category: 'strategy', date: '2025/10/22', excerpt: '關於商圈行人徒步區擴大的初步構想與預算分析...' },
  { id: '2', title: '保安宮開講講稿 (最終版)', category: 'speech', date: '2025/10/24', excerpt: '各位鄉親父老大家好，我是智傑，今天站在這裡...' },
  { id: '3', title: '社宅政策反擊口徑', category: 'strategy', date: '2025/10/25', excerpt: '針對對手質疑預算不足，我方應強調公私協力模式...' },
  { id: '4', title: '靈感：智慧交通紅利', category: 'inspiration', date: '2025/10/25', excerpt: '可以參考新加坡的自動感應收費系統，並結合在地 U-Bike...' },
];

const AssetVault: React.FC = () => {
  return (
    <div className="space-y-8 animate-in slide-in-from-top duration-700 pb-20 text-[#1A1A1A]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
         <h3 className="text-xl font-black italic tracking-tight uppercase flex items-center space-x-3 w-full">
           <div className="w-1.5 h-6 bg-[#FF6B35] rounded-full"></div>
           <span>戰略金庫資產</span>
         </h3>
         <div className="flex bg-white rounded-full p-2 shadow-xl border border-gray-100 w-full md:w-auto">
            <div className="flex items-center px-4 text-gray-400"><Search size={16} /></div>
            <input 
              type="text" 
              placeholder="搜尋金庫..." 
              className="bg-transparent px-2 py-2 outline-none font-bold text-sm flex-1 md:w-64"
            />
            <button className="p-3 bg-gray-50 rounded-full hover:text-[#FF6B35] transition-all"><Filter size={18} /></button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_ASSETS.map((asset) => (
          <div key={asset.id} className="glass p-10 rounded-[56px] group hover:shadow-2xl transition-all cursor-pointer relative bg-white border-none shadow-xl flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className={`p-5 rounded-2xl shadow-lg ${
                asset.category === 'speech' ? 'bg-orange-100 text-orange-600' : 
                asset.category === 'strategy' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
              }`}>
                {asset.category === 'speech' ? <FileText size={24} /> : <Lightbulb size={24} />}
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block">{asset.date}</span>
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md mt-1 inline-block ${
                  asset.category === 'speech' ? 'bg-orange-50 text-orange-500' : 
                  asset.category === 'strategy' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                }`}>{asset.category}</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-black mb-4 group-hover:text-[#FF6B35] transition-colors tracking-tight leading-tight">{asset.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-3 font-bold leading-relaxed italic flex-1">{asset.excerpt}</p>
            
            <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-3">
                 <button className="p-2 hover:text-[#FF6B35] transition-all"><Bookmark size={18} /></button>
                 <button className="p-2 hover:text-[#FF6B35] transition-all"><Tag size={18} /></button>
              </div>
              <div className="flex items-center space-x-2">
                 <button className="text-gray-300 hover:text-red-500 transition-colors p-2"><Trash2 size={18} /></button>
                 <button className="p-4 bg-[#1A1A1A] text-white rounded-2xl hover:bg-[#FF6B35] transition-all"><ExternalLink size={20} /></button>
              </div>
            </div>
          </div>
        ))}

        <button className="glass border-dashed border-4 border-gray-100 flex flex-col items-center justify-center p-12 rounded-[56px] hover:border-[#FF6B35] group transition-all min-h-[350px] bg-white/50">
          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 group-hover:bg-[#FF6B35]/10 group-hover:scale-110 transition-all">
            <Vault className="text-gray-200 group-hover:text-[#FF6B35]" size={40} />
          </div>
          <span className="font-black text-gray-300 group-hover:text-[#FF6B35] uppercase tracking-[0.4em] text-xs">新增戰略素材</span>
        </button>
      </div>
    </div>
  );
};

export default AssetVault;
